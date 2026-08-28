/**
 * Active round: the engine RoundState mirror + transient search UI state
 * (word card, flipped chip, hint picker). Orchestration lives in app/roundFlow.
 */
import { create } from 'zustand';
import type { RoundPlan } from '../engine/rounds/buildRound';
import type { RoundState } from '../engine/rounds/runtime';
import type { ChipModel } from '../engine/rounds/present';
import type { ConceptId } from '../engine/types';

export interface WordCardState {
  chip: ChipModel;
  display: string; // singular/plural resolved at find time
  speech: string;
  screenX: number;
  screenY: number;
  shownAt: number;
}

interface RoundUiState {
  roundId: string | null;
  sceneId: string | null;
  mode: string;
  plan: RoundPlan | null;
  state: RoundState | null;
  chips: ChipModel[];
  status: 'idle' | 'intro' | 'searching' | 'complete';
  introQueue: ConceptId[];
  wordCard: WordCardState | null;
  flippedTargetId: string | null;
  flipAt: number;
  curiositySlip: { text: string; x: number; y: number; until: number } | null;
  hintPickerOpen: boolean;
  steadyUntil: number;
  pendingClue: string | null; // evidence close-up queued
  demoHintDone: boolean;

  setAll(p: Partial<RoundUiState>): void;
  setState(state: RoundState): void;
  reset(): void;
}

export const useRound = create<RoundUiState>((set) => ({
  roundId: null,
  sceneId: null,
  mode: 'word-list',
  plan: null,
  state: null,
  chips: [],
  status: 'idle',
  introQueue: [],
  wordCard: null,
  flippedTargetId: null,
  flipAt: 0,
  curiositySlip: null,
  hintPickerOpen: false,
  steadyUntil: 0,
  pendingClue: null,
  demoHintDone: false,
  setAll: (p) => set(p),
  setState: (state) => set({ state }),
  reset: () =>
    set({
      roundId: null,
      sceneId: null,
      mode: 'word-list',
      plan: null,
      state: null,
      chips: [],
      status: 'idle',
      introQueue: [],
      wordCard: null,
      flippedTargetId: null,
      flipAt: 0,
      curiositySlip: null,
      hintPickerOpen: false,
      steadyUntil: 0,
      pendingClue: null,
    }),
}));
