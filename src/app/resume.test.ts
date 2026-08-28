/**
 * INTEGRATION: autosave + Continue. Mid-round progress survives a simulated
 * reload and resumes on the exact search screen with found props intact.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initTestServices } from '../services';
import { useUi } from '../state/uiStore';
import { useCase } from '../state/caseStore';
import { useVocab } from '../state/vocabStore';
import { useNotebook } from '../state/notebookStore';
import { useRound } from '../state/roundStore';
import { newCase, continueCase, listSaves, deleteCase } from './boot';
import { handleSceneTap, startRound } from './roundFlow';
import { completeBeat } from './storyFlow';
import { flush } from './persist';
import { currentNode } from './flow';

describe('save / resume', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 1_700_000_000_000 });
    initTestServices();
    useUi.setState({ screen: { kind: 'boot' }, notebookOpen: null, settingsOpen: false, notebookPeek: false });
    useCase.getState().clear();
    useVocab.getState().reset();
    useNotebook.getState().reset();
    useRound.getState().reset();
  });

  async function startFirstRoundAndFindTwo(): Promise<{ caseId: string; roundId: string; foundProps: string[] }> {
    await newCase('de', 'basics');
    completeBeat('b1.1'); // cold open → S00 map
    const node = currentNode()!;
    expect(node.type).toBe('round');
    const roundId = (node as { id: string }).id;
    await startRound(roundId);
    useUi.getState().goto({ kind: 'search', roundId });

    const rs = useRound.getState();
    const vocabTargets = rs.plan!.targets.filter((t) => t.kind === 'vocab');
    const p1 = vocabTargets[0]!.propIds[0]!;
    const p2 = vocabTargets[1]!.propIds[0]!;
    expect(handleSceneTap({ kind: 'target-hit', propId: p1 }, { x: 0, y: 0 }, Date.now()).kind).toBe('found');
    expect(handleSceneTap({ kind: 'target-hit', propId: p2 }, { x: 0, y: 0 }, Date.now()).kind).toBe('found');
    await flush();
    return { caseId: useCase.getState().row!.caseId, roundId, foundProps: [p1, p2] };
  }

  function simulateReload(): void {
    useCase.getState().clear();
    useVocab.getState().reset();
    useNotebook.getState().reset();
    useRound.getState().reset();
    useUi.setState({ screen: { kind: 'title' } });
  }

  it('resumes mid-search with found props and word records intact', async () => {
    const { caseId, roundId, foundProps } = await startFirstRoundAndFindTwo();
    const wordCountBefore = Object.keys(useVocab.getState().words).length;
    expect(wordCountBefore).toBeGreaterThan(0);

    simulateReload();

    const saves = await listSaves();
    expect(saves).toHaveLength(1);
    expect(saves[0]!.caseId).toBe(caseId);

    await continueCase(saves[0]!);
    const screen = useUi.getState().screen;
    expect(screen.kind).toBe('search');
    expect((screen as { roundId: string }).roundId).toBe(roundId);

    const rs = useRound.getState();
    expect(rs.state).toBeTruthy();
    expect(rs.state!.foundProps.sort()).toEqual([...foundProps].sort());
    expect(rs.status).toBe('searching');
    expect(Object.keys(useVocab.getState().words).length).toBe(wordCountBefore);
  });

  it('resumes on a beat screen when saved mid-story', async () => {
    await newCase('it', 'new');
    await flush();
    simulateReload();
    const saves = await listSaves();
    await continueCase(saves[0]!);
    expect(useUi.getState().screen.kind).toBe('beat');
  });

  it('deleteCase removes the slot', async () => {
    await newCase('es', 'basics');
    await flush();
    const caseId = useCase.getState().row!.caseId;
    await deleteCase(caseId);
    expect(await listSaves()).toHaveLength(0);
    expect(useCase.getState().row).toBeNull();
  });
});
