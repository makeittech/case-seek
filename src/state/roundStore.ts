/**
 * Active round: the engine RoundState mirror + transient search UI state
 * (word card, flipped chip, curiosity slip). Orchestration lives in app/roundFlow.
 */
import { create } from 'zustand';
import type { RoundPlan } from '../engine/rounds/buildRound';
import type { RoundState } from '../engine/rounds/runtime';
import type { ChipModel } from '../engine/rounds/present';
import type { ConceptId, RoundMode } from '../engine/types';

export interface WordCardState {
  chip: ChipModel;
  display: string; // singular/plural resolved at find time
  speech: string;
  screenX: number;
  screenY: number;
  shownAt: number;
}

export type RoundStatus = 'idle' | 'intro' | 'searching' | 'complete';

interface RoundData {
  roundId: string | null;
  sceneId: string | null;
  mode: RoundMode;
  plan: RoundPlan | null;
  state: RoundState | null;
  chips: ChipModel[];
  status: RoundStatus;
  introQueue: ConceptId[];
  wordCard: WordCardState | null;
  flippedTargetId: string | null;
  flipAt: number;
  curiositySlip: { text: string; x: number; y: number; until: number } | null;
  steadyUntil: number;
  pendingClue: string | null; // evidence close-up queued
}

interface RoundUiState extends RoundData {
  setAll(p: Partial<RoundData>): void;
  setState(state: RoundState): void;
  reset(): void;
}

// Single source of truth for the idle shape — reset() can never drift from it.
const initial: RoundData = {
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
  steadyUntil: 0,
  pendingClue: null,
};

export const useRound = create<RoundUiState>((set) => ({
  ...initial,
  setAll: (p) => set(p),
  setState: (state) => set({ state }),
  reset: () => set(initial),
}));
