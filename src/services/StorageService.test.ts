import { describe, expect, it } from 'vitest';
import { MemoryStorageService, type CaseRow } from './StorageService';
import { SAVE_VERSION } from '../engine/save/migrations';
import { newRecord } from '../engine/vocab/scheduler';

function mkCase(caseId: string, updatedAt: number): CaseRow {
  return {
    caseId,
    lang: 'es',
    tier: 'basics',
    saveVersion: SAVE_VERSION,
    seed: 1,
    createdAt: updatedAt,
    updatedAt,
    flowIndex: 0,
    roundCounter: 0,
    chapter: 1,
    screen: null,
    completed: false,
    bankedInsight: 3,
    missedLastDebrief: [],
    recentTargets: [],
    lastPlayedLabel: '',
    wordsKnown: 0,
    pendingDebrief: null,
  };
}

describe('MemoryStorageService', () => {
  it('round-trips profile, case, words, round state, notebook', async () => {
    const s = new MemoryStorageService();
    await s.init();

    await s.putProfile({ profileId: 'p1', createdAt: 1, settings: { textSize: 115 }, seenTutorials: [] });
    expect((await s.getProfile())?.settings).toEqual({ textSize: 115 });

    const row = mkCase('c1', 100);
    await s.putCase(row);
    expect(await s.getCase('c1')).toEqual(row);

    const words = { 'object:key': newRecord('object:key', 1) };
    await s.putWords('c1', words);
    expect(await s.getWords('c1')).toEqual(words);

    await s.putRoundState('c1', { roundId: 'S00' });
    expect(await s.getRoundState('c1')).toEqual({ roundId: 'S00' });
    await s.putRoundState('c1', null);
    expect(await s.getRoundState('c1')).toBeNull();

    const nb = { caseLines: [{ chapter: 1, line: 'x' }], people: {}, clues: ['C00'], boardLinks: [], objective: '', solvedOffscreen: [] };
    await s.putNotebook('c1', nb);
    expect(await s.getNotebook('c1')).toEqual(nb);
  });

  it('lists cases most-recent first and deletes case islands whole', async () => {
    const s = new MemoryStorageService();
    await s.init();
    await s.putCase(mkCase('old', 100));
    await s.putCase(mkCase('new', 200));
    const list = await s.listCases();
    expect(list.map((c) => c.caseId)).toEqual(['new', 'old']);

    await s.putWords('old', { 'object:key': newRecord('object:key', 1) });
    await s.deleteCase('old');
    expect(await s.getCase('old')).toBeNull();
    expect(await s.getWords('old')).toEqual({});
  });

  it('exports the full case bundle', async () => {
    const s = new MemoryStorageService();
    await s.init();
    await s.putCase(mkCase('c1', 100));
    await s.putWords('c1', { 'object:key': newRecord('object:key', 1) });
    const bundle = await s.exportCase('c1');
    expect(bundle.case).toBeTruthy();
    expect(bundle.words).toBeTruthy();
  });
});
