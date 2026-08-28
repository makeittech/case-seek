/**
 * Active case slot: language, tier, story position (flowIndex), round counter,
 * debrief carry-over. Case slots are islands (per-case vocabulary).
 */
import { create } from 'zustand';
import type { Lang, Tier } from '../engine/types';
import type { CaseRow } from '../services/StorageService';
import { SAVE_VERSION } from '../engine/save/migrations';
import { randomSeed } from '../engine/rand';

interface CaseState {
  row: CaseRow | null;
  hydrate(row: CaseRow): void;
  clear(): void;
  createCase(lang: Lang, tier: Tier): CaseRow;
  patch(p: Partial<CaseRow>): void;
  setTier(tier: Tier): void;
}

export const useCase = create<CaseState>((set, get) => ({
  row: null,
  hydrate: (row) => set({ row }),
  clear: () => set({ row: null }),
  createCase: (lang, tier) => {
    const now = Date.now();
    const row: CaseRow = {
      caseId: `case-${lang}-${now.toString(36)}`,
      lang,
      tier,
      saveVersion: SAVE_VERSION,
      seed: randomSeed(),
      createdAt: now,
      updatedAt: now,
      flowIndex: 0,
      roundCounter: 0,
      chapter: 1,
      screen: null,
      completed: false,
      bankedInsight: 3,
      missedLastDebrief: [],
      recentTargets: [],
      lastPlayedLabel: 'A letter under the door',
      wordsKnown: 0,
      pendingDebrief: null,
    };
    set({ row });
    return row;
  },
  patch: (p) => {
    const row = get().row;
    if (!row) return;
    set({ row: { ...row, ...p, updatedAt: Date.now() } });
  },
  setTier: (tier) => {
    const row = get().row;
    if (!row) return;
    set({ row: { ...row, tier, updatedAt: Date.now() } });
  },
}));

export function requireCase(): CaseRow {
  const row = useCase.getState().row;
  if (!row) throw new Error('no active case');
  return row;
}
