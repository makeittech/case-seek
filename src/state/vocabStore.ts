/**
 * Per-case word records. The scheduler functions are pure; this store owns the
 * record map and forwards mutations to the save layer.
 */
import { create } from 'zustand';
import type { ConceptId } from '../engine/types';
import {
  applyEvent,
  newRecord,
  type Difficulty,
  type ExposureEvent,
  type WordRecord,
} from '../engine/vocab/scheduler';

interface VocabState {
  words: Record<ConceptId, WordRecord>;
  hydrate(words: Record<ConceptId, WordRecord>): void;
  reset(): void;
  ensure(conceptId: ConceptId, difficulty: Difficulty, now: number): void;
  exposure(
    conceptId: ConceptId,
    event: ExposureEvent,
    ctx: { now: number; roundIndex: number; roundId?: string; difficulty?: Difficulty },
  ): void;
  markServed(conceptIds: ConceptId[], now: number, difficulties: Record<string, Difficulty>): void;
  markHeard(conceptId: ConceptId, slow: boolean): void;
  markPluralSeen(conceptId: ConceptId): void;
  markPluralFound(conceptId: ConceptId): void;
  markTranslated(conceptId: ConceptId): void;
  markSearchHinted(conceptId: ConceptId): void;
  markAudioProven(conceptId: ConceptId): void;
}

export const useVocab = create<VocabState>((set, get) => ({
  words: {},
  hydrate: (words) => set({ words }),
  reset: () => set({ words: {} }),
  ensure: (conceptId, difficulty, now) => {
    if (get().words[conceptId]) return;
    set((s) => ({ words: { ...s.words, [conceptId]: newRecord(conceptId, now, difficulty) } }));
  },
  exposure: (conceptId, event, ctx) => {
    set((s) => {
      const rec = s.words[conceptId] ?? newRecord(conceptId, ctx.now, ctx.difficulty ?? 'opaque');
      return { words: { ...s.words, [conceptId]: applyEvent(rec, event, ctx) } };
    });
  },
  markServed: (conceptIds, now, difficulties) => {
    set((s) => {
      const words = { ...s.words };
      for (const id of conceptIds) {
        const rec = words[id] ?? newRecord(id, now, difficulties[id] ?? 'opaque');
        words[id] = { ...rec, timesServedAsTarget: rec.timesServedAsTarget + 1, lastSeenAt: now };
      }
      return { words };
    });
  },
  markHeard: (conceptId, slow) => {
    set((s) => {
      const rec = s.words[conceptId];
      if (!rec) return s;
      return {
        words: {
          ...s.words,
          [conceptId]: {
            ...rec,
            timesHeard: rec.timesHeard + 1,
            timesHeardSlow: rec.timesHeardSlow + (slow ? 1 : 0),
          },
        },
      };
    });
  },
  markPluralSeen: (conceptId) => patch(set, conceptId, (r) => ({ ...r, pluralSeen: true })),
  markPluralFound: (conceptId) => patch(set, conceptId, (r) => ({ ...r, pluralFound: true })),
  markTranslated: (conceptId) => patch(set, conceptId, (r) => ({ ...r, timesTranslated: r.timesTranslated + 1 })),
  markSearchHinted: (conceptId) => patch(set, conceptId, (r) => ({ ...r, timesSearchHinted: r.timesSearchHinted + 1 })),
  markAudioProven: (conceptId) => patch(set, conceptId, (r) => ({ ...r, audioProven: true })),
}));

function patch(
  set: (fn: (s: { words: Record<string, WordRecord> }) => Partial<{ words: Record<string, WordRecord> }>) => void,
  conceptId: string,
  fn: (r: WordRecord) => WordRecord,
): void {
  set((s) => {
    const rec = s.words[conceptId];
    if (!rec) return {};
    return { words: { ...s.words, [conceptId]: fn(rec) } };
  });
}

export function wordRecordMap(): Map<ConceptId, WordRecord> {
  return new Map(Object.entries(useVocab.getState().words));
}
