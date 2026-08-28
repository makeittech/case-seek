import { describe, expect, it } from 'vitest';
import {
  applyFind,
  applyFlip,
  applyHintStage,
  applyMistap,
  computeStamps,
  initRoundState,
  targetForProp,
  tickActivity,
  ANTI_SCRUB_COUNT,
  REGEN_MS,
  type RoundState,
} from './runtime';
import type { RoundPlan, ResolvedTarget } from './buildRound';

const T0 = 1_700_000_000_000;

function mkPlan(): RoundPlan {
  const targets: ResolvedTarget[] = [
    { targetId: 't00', kind: 'vocab', conceptId: 'object:key', propIds: ['p1'], count: 1, isReview: false, isPlural: false },
    { targetId: 't01', kind: 'vocab', conceptId: 'object:cup', propIds: ['p2', 'p3'], count: 2, isReview: false, isPlural: true },
    { targetId: 't02', kind: 'evidence', clueId: 'C01', propIds: ['pe'], count: 1, isReview: false, isPlural: false },
  ];
  return { roundId: 'S99', seed: 7, targets };
}

function fresh(): RoundState {
  return initRoundState(mkPlan(), T0);
}

describe('round runtime', () => {
  it('applyFind progresses singles and plurals', () => {
    let s = fresh();
    const o1 = applyFind(s, 'p1', T0 + 1000)!;
    expect(o1.targetDone).toBe(true);
    expect(o1.roundDone).toBe(false);
    s = o1.state;

    const o2 = applyFind(s, 'p2', T0 + 2000)!;
    expect(o2.targetDone).toBe(false);
    expect(o2.isFinalOfPlural).toBe(false);
    s = o2.state;

    const o3 = applyFind(s, 'p3', T0 + 3000)!;
    expect(o3.targetDone).toBe(true);
    expect(o3.isFinalOfPlural).toBe(true);
    s = o3.state;

    const o4 = applyFind(s, 'pe', T0 + 4000)!;
    expect(o4.roundDone).toBe(true);
    expect(o4.target.kind).toBe('evidence');
  });

  it('found props cannot be found twice', () => {
    const s = fresh();
    const o1 = applyFind(s, 'p1', T0)!;
    expect(applyFind(o1.state, 'p1', T0 + 1)).toBeNull();
  });

  it('targetForProp skips completed targets', () => {
    const s = fresh();
    expect(targetForProp(s, 'p1')?.targetId).toBe('t00');
    const done = applyFind(s, 'p1', T0)!.state;
    expect(targetForProp(done, 'p1')).toBeUndefined();
  });

  it('anti-scrub cooldown triggers after rapid mistaps', () => {
    let s = fresh();
    let triggered = false;
    for (let i = 0; i < ANTI_SCRUB_COUNT; i++) {
      const m = applyMistap(s, T0 + i * 100);
      s = m.state;
      triggered = m.cooldownTriggered;
    }
    expect(triggered).toBe(true);
    expect(s.cooldownUntil).toBeGreaterThan(T0);
  });

  it('flip records the assist for the eventual find', () => {
    let s = fresh();
    s = applyFlip(s, 'object:key');
    const o = applyFind(s, 'p1', T0 + 500)!;
    expect(o.assist).toBe('flip');
  });

  it('hint stages spend insight and cap at 3', () => {
    let s = fresh();
    expect(s.insight).toBe(3);
    for (let i = 1; i <= 3; i++) {
      const next = applyHintStage(s, 't00');
      expect(next).not.toBeNull();
      s = next!;
      expect(s.hintStages['t00']).toBe(i);
    }
    expect(applyHintStage(s, 't00')).toBeNull(); // stage capped
    expect(s.insight).toBe(0);
    expect(applyHintStage(s, 't01')).toBeNull(); // out of charges
  });

  it('stage-3 reveal marks the find as revealed', () => {
    let s = fresh();
    s = applyHintStage(s, 't00')!;
    s = applyHintStage(s, 't00')!;
    s = applyHintStage(s, 't00')!;
    const o = applyFind(s, 'p1', T0 + 100)!;
    expect(o.assist).toBe('reveal');
  });

  it('active search time regenerates insight after 3 minutes', () => {
    let s = fresh();
    s = applyHintStage(s, 't00')!; // 2 left
    for (let t = 0; t < REGEN_MS; t += 1000) {
      s = tickActivity(s, T0 + t, 1000, true);
    }
    expect(s.insight).toBe(3);
  });

  it('idle time does not regenerate', () => {
    let s = fresh();
    s = applyHintStage(s, 't00')!;
    s = tickActivity(s, T0, REGEN_MS + 1, false);
    expect(s.insight).toBe(2);
  });

  it('stamps: clean round earns all three', () => {
    let s = fresh();
    s = applyFind(s, 'p1', T0)!.state;
    s = applyFind(s, 'p2', T0)!.state;
    s = applyFind(s, 'p3', T0)!.state;
    s = applyFind(s, 'pe', T0)!.state;
    const st = computeStamps(s);
    expect(st.accuracy).toBe(true);
    expect(st.unassisted).toBe(true);
    expect(st.streak).toBe(true);
  });

  it('stamps: hints break unassisted; mistaps break accuracy', () => {
    let s = fresh();
    s = applyHintStage(s, 't00')!;
    for (let i = 0; i < 6; i++) s = applyMistap(s, T0 + i * 3000).state;
    s = applyFind(s, 'p1', T0 + 99_000)!.state;
    const st = computeStamps(s);
    expect(st.unassisted).toBe(false);
    expect(st.accuracy).toBe(false);
  });
});
