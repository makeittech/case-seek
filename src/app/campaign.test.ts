/**
 * INTEGRATION: plays the ENTIRE campaign (S00–S28, all beats, puzzles, board
 * reviews, finale, epilogue) through the real flow controller, round
 * orchestration, scheduler, and save layer — with test service fakes.
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { initTestServices, getServices } from '../services';
import { useUi } from '../state/uiStore';
import { useCase } from '../state/caseStore';
import { useVocab } from '../state/vocabStore';
import { useNotebook } from '../state/notebookStore';
import { useRound } from '../state/roundStore';
import { newCase } from './boot';
import { db, initContent } from './content';
import {
  answerDebrief,
  buildDebriefItems,
  finishDebrief,
  handleSceneTap,
  pinPendingClue,
  startRound,
} from './roundFlow';
import { completeAccusation, completeBeat, completeBoardReview, completeEpilogue, completePuzzle } from './storyFlow';
import { advanceFlow, currentNode } from './flow';
import { band } from '../engine/vocab/scheduler';

async function playSearchRound(roundId: string): Promise<void> {
  await startRound(roundId);
  useUi.getState().goto({ kind: 'search', roundId });
  const rs = useRound.getState();
  expect(rs.plan, roundId).toBeTruthy();
  expect(rs.status).toBe('searching'); // conversational tier: no intro cards

  for (const target of rs.plan!.targets) {
    for (const propId of target.propIds) {
      const fb = handleSceneTap({ kind: 'target-hit', propId }, { x: 100, y: 100 }, Date.now());
      expect(fb.kind, `${roundId} ${propId}`).toBe('found');
      if (useRound.getState().pendingClue) pinPendingClue();
    }
  }
  // let any scheduled completeRound fire
  await vi.advanceTimersByTimeAsync(1500);
  expect(useUi.getState().screen.kind, `${roundId} should complete`).toBe('results');
}

describe('full campaign (Spanish, conversational)', () => {
  beforeAll(async () => {
    await initContent();
  });
  beforeEach(() => {
    vi.useFakeTimers({ now: 1_700_000_000_000 });
    initTestServices();
    useUi.setState({ screen: { kind: 'boot' }, notebookOpen: null, settingsOpen: false, notebookPeek: false });
    useCase.getState().clear();
    useVocab.getState().reset();
    useNotebook.getState().reset();
    useRound.getState().reset();
  });

  it('plays New Case → every flow node → epilogue → title', async () => {
    await newCase('es', 'conversational');
    expect(useUi.getState().screen.kind).toBe('beat'); // cold open

    const flowLen = db().season.flow.length;
    let guard = 0;
    const seenRounds = new Set<string>();
    const seenPuzzles = new Set<string>();

    while (guard++ < flowLen * 6) {
      const screen = useUi.getState().screen;
      if (screen.kind === 'title') break;

      switch (screen.kind) {
        case 'beat': {
          const beat = db().beats.get(screen.beatId)!;
          completeBeat(screen.beatId, beat.flavorChoice ? 'warm' : undefined);
          break;
        }
        case 'map': {
          const node = currentNode();
          expect(node?.type).toBe('round');
          const roundId = (node as { id: string }).id;
          seenRounds.add(roundId);
          await playSearchRound(roundId);
          break;
        }
        case 'results': {
          const items = buildDebriefItems(screen.roundId);
          expect(items.length).toBeGreaterThan(0);
          useUi.getState().goto({ kind: 'debrief', roundId: screen.roundId });
          for (const view of items) answerDebrief(view.item, true);
          finishDebrief();
          break;
        }
        case 'puzzle': {
          seenPuzzles.add(screen.puzzleId);
          completePuzzle(screen.puzzleId, false);
          break;
        }
        case 'clue': {
          advanceFlow();
          break;
        }
        case 'board-review': {
          completeBoardReview(screen.brId);
          break;
        }
        case 'recap': {
          advanceFlow();
          break;
        }
        case 'accusation': {
          completeAccusation('warm');
          break;
        }
        case 'epilogue': {
          completeEpilogue();
          break;
        }
        default:
          throw new Error(`unexpected screen ${screen.kind}`);
      }
      await vi.advanceTimersByTimeAsync(200); // autosave debounce etc.
    }

    // ---- the campaign is complete ----
    expect(useUi.getState().screen.kind).toBe('title');
    const row = useCase.getState().row!;
    expect(row.completed).toBe(true);
    expect(seenRounds.size).toBe(29);
    expect(seenPuzzles.size).toBe(9);
    expect(row.roundCounter).toBe(29);

    // notebook: story fully recorded
    const nb = useNotebook.getState();
    expect(nb.caseLines.length).toBeGreaterThanOrEqual(39);
    expect(nb.clues.length).toBeGreaterThanOrEqual(25);
    expect(nb.boardLinks.length).toBe(3);
    expect(Object.keys(nb.people).length).toBeGreaterThanOrEqual(5);

    // vocabulary: records exist and many words progressed
    const words = Object.values(useVocab.getState().words);
    expect(words.length).toBeGreaterThanOrEqual(150);
    const now = Date.now();
    const knownOrSeen = words.filter((w) => ['seen', 'known'].includes(band(w, now)));
    expect(knownOrSeen.length).toBeGreaterThan(40);

    // save layer: the completed case was persisted
    const saved = await getServices().storage.getCase(row.caseId);
    expect(saved?.completed).toBe(true);
    expect(saved?.saveVersion).toBe(row.saveVersion);
  }, 60_000);
});
