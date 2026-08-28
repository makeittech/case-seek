/**
 * Beat/puzzle/board-review/finale orchestration + dialogue garnish resolution.
 */
import { db } from './content';
import { useCase, requireCase } from '../state/caseStore';
import { useNotebook } from '../state/notebookStore';
import { useUi } from '../state/uiStore';
import { useVocab, wordRecordMap } from '../state/vocabStore';
import { markCaseDirty, markNotebookDirty, markWordsDirty } from './persist';
import { advanceFlow } from './flow';
import { getServices } from '../services';
import type { Line } from '../engine/content/schemas';
import type { ConceptId, Tier } from '../engine/types';

export interface RenderedLine {
  speaker: string;
  speakerName: string;
  text: string;
  token: { text: string; gloss: string; conceptId?: ConceptId } | null;
}

/** Resolve garnish tokens per tier (L0/L1/L2 gates) and echo slots. */
export function renderLine(line: Line, tier: Tier): RenderedLine {
  const d = db();
  const row = useCase.getState().row;
  const cast = d.castById.get(line.speaker);
  const speakerName = cast?.name ?? (line.speaker === 'narration' ? '' : line.speaker === 'letter' ? 'The letter' : line.speaker);
  let text = line.en;
  let token: RenderedLine['token'] = null;

  const allowL1 = tier === 'conversational' || tier === 'advanced';
  const allowL2 = tier === 'advanced';

  if (line.garnish && row) {
    const ok = line.garnish.level === 'L1' ? allowL1 : allowL2;
    if (ok) {
      const tok = d.packs[row.lang].tokens.find((t) => t.key === line.garnish!.key);
      if (tok) {
        token = { text: tok.text, gloss: tok.gloss };
        text = line.garnish.pos === 'lead' ? `«${tok.text}» — ${text}` : `${text} «${tok.text}»`;
      }
    }
  }

  if (line.echo && row) {
    const noun = echoNoun();
    if (noun) {
      const lx = d.lexemes[row.lang].get(noun);
      const c = d.concepts.get(noun);
      if (lx && c) {
        if (allowL1) {
          text = text.replace('{echo}', `«${lx.word}»`);
          token = { text: `${lx.article} ${lx.word}`, gloss: lx.gloss ?? c.gloss, conceptId: noun };
        } else {
          text = text.replace('{echo}', c.gloss);
        }
      }
    } else {
      text = text.replace('{echo}', 'evidence');
    }
  }
  return { speaker: line.speaker, speakerName, text, token };
}

/** The round's weakest found noun — Margo's echo rule (LANG §8.6). */
export function echoNoun(): ConceptId | null {
  const row = useCase.getState().row;
  if (!row) return null;
  const last = row.recentTargets[row.recentTargets.length - 1];
  if (!last || last.length === 0) return null;
  const records = wordRecordMap();
  const sorted = last
    .filter((c) => records.has(c))
    .sort((a, b) => (records.get(a)!.strength - records.get(b)!.strength) || (a < b ? -1 : 1));
  return sorted[0] ?? null;
}

export function logGlossTap(conceptId: ConceptId | undefined): void {
  if (!conceptId) return;
  const row = requireCase();
  useVocab.getState().exposure(conceptId, 'passive', { now: Date.now(), roundIndex: row.roundCounter });
  markWordsDirty();
}

export function completeBeat(beatId: string, flavor?: 'dry' | 'warm'): void {
  const d = db();
  const beat = d.beats.get(beatId);
  const nb = useNotebook.getState();
  if (beat) {
    nb.addCaseLine(beat.chapter, beat.caseLine);
    for (const pf of beat.peopleFacts) {
      nb.addFact(pf.characterId, pf.fact, pf.stamp);
    }
    if (beat.peopleFacts.length > 0) useUi.getState().setNotebookPeek(true);
    markNotebookDirty();
  }
  if (flavor) {
    useCase.getState().patch({ flavor });
    markCaseDirty();
  }
  advanceFlow();
}

export function completePuzzle(puzzleId: string, skipped: boolean): void {
  const d = db();
  const puzzle = d.puzzles.get(puzzleId);
  const nb = useNotebook.getState();
  if (skipped) {
    nb.markSolvedOffscreen(puzzleId);
    markNotebookDirty();
  }
  if (puzzle?.clueId) {
    nb.pinClue(puzzle.clueId);
    getServices().audio.sfx('pin');
    useUi.getState().setNotebookPeek(true);
    markNotebookDirty();
    useUi.getState().goto({ kind: 'clue', clueId: puzzle.clueId, back: 'flow' });
    return;
  }
  advanceFlow();
}

export function completeBoardReview(brId: string): void {
  const d = db();
  const br = d.boardReviews.get(brId);
  if (br) {
    useNotebook.getState().addBoardLink(br.pair[0], br.pair[1]);
    markNotebookDirty();
  }
  advanceFlow();
}

export function completeAccusation(flavor: 'dry' | 'warm'): void {
  useCase.getState().patch({ flavor });
  markCaseDirty();
  advanceFlow();
}

export function completeEpilogue(): void {
  const row = requireCase();
  useCase.getState().patch({ completed: true, flowIndex: row.flowIndex + 1 });
  markCaseDirty();
  useUi.getState().goto({ kind: 'title' });
}
