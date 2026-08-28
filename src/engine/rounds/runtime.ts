/**
 * Round runtime: a pure state machine over RoundState. Every state-changing
 * event is a reducer; the store forwards results to the save layer.
 */
import type { ConceptId } from '../types';
import type { ResolvedTarget, RoundPlan } from './buildRound';

export type AssistClass = 'none' | 'flip' | 'reveal';

export interface TargetProgress {
  found: number; // props found so far (plural targets need `count`)
  done: boolean;
  assist: AssistClass;
  foundAt: number;
}

export interface RoundState {
  roundId: string;
  seed: number;
  startedAt: number;
  targets: ResolvedTarget[];
  progress: Record<string, TargetProgress>; // by targetId
  foundProps: string[];
  flippedThisRound: ConceptId[];
  hintStages: Record<string, 0 | 1 | 2 | 3>; // by targetId, banked
  insight: number; // 0..3
  mistapTimes: number[];
  cooldownUntil: number;
  totalTaps: number;
  mistaps: number;
  streakCur: number;
  streakBest: number;
  usedSearchHint: boolean;
  lastFindAt: number;
  lastNudgeAt: number;
  activeSearchMs: number;
  lastInputAt: number;
  regenProgressMs: number;
}

export const INSIGHT_MAX = 3;
export const ANTI_SCRUB_WINDOW = 2000;
export const ANTI_SCRUB_COUNT = 3;
export const ANTI_SCRUB_COOLDOWN = 800;
export const NUDGE_IDLE_MS = 90_000;
export const REGEN_MS = 3 * 60_000;

export function initRoundState(plan: RoundPlan, now: number, bankedInsight = INSIGHT_MAX): RoundState {
  const progress: Record<string, TargetProgress> = {};
  const hintStages: Record<string, 0 | 1 | 2 | 3> = {};
  for (const t of plan.targets) {
    progress[t.targetId] = { found: 0, done: false, assist: 'none', foundAt: 0 };
    hintStages[t.targetId] = 0;
  }
  return {
    roundId: plan.roundId,
    seed: plan.seed,
    startedAt: now,
    targets: plan.targets,
    progress,
    foundProps: [],
    flippedThisRound: [],
    hintStages,
    insight: Math.min(INSIGHT_MAX, bankedInsight),
    mistapTimes: [],
    cooldownUntil: 0,
    totalTaps: 0,
    mistaps: 0,
    streakCur: 0,
    streakBest: 0,
    usedSearchHint: false,
    lastFindAt: now,
    lastNudgeAt: now,
    activeSearchMs: 0,
    lastInputAt: now,
    regenProgressMs: 0,
  };
}

export function targetForProp(state: RoundState, propId: string): ResolvedTarget | undefined {
  return state.targets.find((t) => !state.progress[t.targetId]!.done && t.propIds.includes(propId));
}

export function activeTargetPropIds(state: RoundState): Set<string> {
  const s = new Set<string>();
  for (const t of state.targets) {
    const pr = state.progress[t.targetId]!;
    if (pr.done) continue;
    for (const pid of t.propIds) if (!state.foundProps.includes(pid)) s.add(pid);
  }
  return s;
}

export interface FindOutcome {
  state: RoundState;
  target: ResolvedTarget;
  targetDone: boolean;
  roundDone: boolean;
  assist: AssistClass;
  isFinalOfPlural: boolean;
}

/** Apply a successful find of `propId` for the target that owns it. */
export function applyFind(state: RoundState, propId: string, now: number): FindOutcome | null {
  const target = targetForProp(state, propId);
  if (!target) return null;
  const pr = state.progress[target.targetId]!;
  const flipped = target.conceptId ? state.flippedThisRound.includes(target.conceptId) : false;
  const revealed = state.hintStages[target.targetId] === 3;
  const assist: AssistClass = revealed ? 'reveal' : flipped ? 'flip' : 'none';
  const found = pr.found + 1;
  const done = found >= target.count;
  const progress = {
    ...state.progress,
    [target.targetId]: { found, done, assist, foundAt: now },
  };
  const streakCur = state.streakCur + 1;
  const next: RoundState = {
    ...state,
    progress,
    foundProps: [...state.foundProps, propId],
    totalTaps: state.totalTaps + 1,
    streakCur,
    streakBest: Math.max(state.streakBest, streakCur),
    lastFindAt: now,
    lastNudgeAt: now,
  };
  const roundDone = next.targets.every((t) => progress[t.targetId]!.done);
  return {
    state: next,
    target,
    targetDone: done,
    roundDone,
    assist,
    isFinalOfPlural: target.isPlural && done,
  };
}

export interface MistapOutcome {
  state: RoundState;
  cooldownTriggered: boolean;
}

export function applyMistap(state: RoundState, now: number): MistapOutcome {
  const times = [...state.mistapTimes.filter((t) => now - t < ANTI_SCRUB_WINDOW), now];
  const triggered = times.length >= ANTI_SCRUB_COUNT;
  return {
    state: {
      ...state,
      mistapTimes: triggered ? [] : times,
      cooldownUntil: triggered ? now + ANTI_SCRUB_COOLDOWN : state.cooldownUntil,
      totalTaps: state.totalTaps + 1,
      mistaps: state.mistaps + 1,
      streakCur: 0,
    },
    cooldownTriggered: triggered,
  };
}

export function applyFlip(state: RoundState, conceptId: ConceptId): RoundState {
  if (state.flippedThisRound.includes(conceptId)) return state;
  return { ...state, flippedThisRound: [...state.flippedThisRound, conceptId] };
}

/** Spend a charge and escalate the target's hint stage. Returns null when not possible. */
export function applyHintStage(state: RoundState, targetId: string): RoundState | null {
  const cur = state.hintStages[targetId] ?? 0;
  if (cur >= 3 || state.insight <= 0) return null;
  const pr = state.progress[targetId];
  if (!pr || pr.done) return null;
  return {
    ...state,
    insight: state.insight - 1,
    usedSearchHint: true,
    hintStages: { ...state.hintStages, [targetId]: (cur + 1) as 1 | 2 | 3 },
  };
}

/** Track active-search time; +1 insight per 3 min of activity (LANG/GDD §9.2). */
export function tickActivity(state: RoundState, now: number, dtMs: number, inputWithin20s: boolean): RoundState {
  if (!inputWithin20s) return state;
  let regen = state.regenProgressMs + dtMs;
  let insight = state.insight;
  if (regen >= REGEN_MS) {
    regen -= REGEN_MS;
    insight = Math.min(INSIGHT_MAX, insight + 1);
  }
  return { ...state, activeSearchMs: state.activeSearchMs + dtMs, regenProgressMs: regen, insight, lastInputAt: now };
}

export interface RoundStamps {
  accuracy: boolean; // mistap rate low
  unassisted: boolean; // no search hints
  streak: boolean; // best consecutive ≥ 5
}

export function computeStamps(state: RoundState): RoundStamps {
  const finds = state.foundProps.length;
  const accuracy = state.mistaps <= Math.max(2, Math.round(finds * 0.34));
  return {
    accuracy,
    unassisted: !state.usedSearchHint,
    streak: state.streakBest >= Math.min(5, Math.max(3, Math.floor(finds / 2))),
  };
}
