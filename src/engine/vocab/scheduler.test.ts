import { describe, expect, it } from 'vitest';
import {
  applyEvent,
  band,
  decayedStrength,
  dueGap,
  newRecord,
  pips,
  selectDebriefItems,
  selectReviewConcepts,
  pickDistractors,
  type WordRecord,
} from './scheduler';

const T0 = 1_700_000_000_000;

function found(rec: WordRecord, times: number, roundIndex = 0): WordRecord {
  let r = rec;
  for (let i = 0; i < times; i++) {
    r = applyEvent(r, 'unaided-find', { now: T0 + i * 1000, roundIndex: roundIndex + i, roundId: `S0${i}` });
  }
  return r;
}

describe('word records', () => {
  it('unaided find raises strength and advances spacing', () => {
    const r0 = newRecord('object:key', T0);
    const r1 = applyEvent(r0, 'unaided-find', { now: T0, roundIndex: 0, roundId: 'S00' });
    expect(r1.strength).toBeCloseTo(1.0);
    expect(r1.spacingStage).toBe(1);
    expect(r1.timesFoundUnaided).toBe(1);
    expect(r1.firstFoundRound).toBe('S00');
    expect(r1.dueAtRound).toBe(0 + dueGap(1, 'opaque'));
  });

  it('two consecutive assisted finds regress the stage', () => {
    let r = found(newRecord('object:key', T0), 2);
    const stageBefore = r.spacingStage;
    r = applyEvent(r, 'assisted-find', { now: T0 + 5000, roundIndex: 3 });
    expect(r.spacingStage).toBe(stageBefore); // first assist tolerated
    r = applyEvent(r, 'assisted-find', { now: T0 + 6000, roundIndex: 4 });
    expect(r.spacingStage).toBe(stageBefore - 1);
    expect(r.lapses).toBe(1);
  });

  it('debrief miss regresses to stage 0 and cuts strength', () => {
    let r = found(newRecord('object:key', T0), 3);
    const sBefore = r.strength;
    r = applyEvent(r, 'debrief-miss', { now: T0 + 9000, roundIndex: 5 });
    expect(r.spacingStage).toBe(0);
    expect(r.strength).toBeLessThan(sBefore);
  });

  it('strength decays over time (lazy exponential)', () => {
    const r = found(newRecord('object:key', T0), 1);
    const later = decayedStrength(r, T0 + 40 * 24 * 3600 * 1000);
    expect(later).toBeLessThan(r.strength);
    expect(later).toBeGreaterThanOrEqual(0);
  });

  it('cognates retire early (stage ≥3 → done)', () => {
    let r = newRecord('object:lamp', T0, 'cognate');
    for (let i = 0; i < 4; i++) {
      r = applyEvent(r, 'unaided-find', { now: T0 + i, roundIndex: i, difficulty: 'cognate' });
    }
    expect(r.spacingStage).toBe(5);
    expect(r.dueAtRound).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('passive exposure is capped at once a day', () => {
    const r0 = newRecord('object:key', T0);
    const r1 = applyEvent(r0, 'passive', { now: T0, roundIndex: 0 });
    const r2 = applyEvent(r1, 'passive', { now: T0 + 60_000, roundIndex: 0 });
    expect(r2.strength).toBeCloseTo(r1.strength); // second passive within a day: no delta
  });

  it('bands progress unserved → new → known', () => {
    const r0 = newRecord('object:key', T0);
    expect(band(r0, T0)).toBe('unserved');
    let r = { ...r0, timesServedAsTarget: 1 };
    expect(band(r, T0)).toBe('new');
    r = found(r, 4);
    r = applyEvent(r, 'debrief-hit', { now: T0 + 99_000, roundIndex: 6 });
    expect(band(r, T0 + 100_000)).toBe('known');
    expect(pips(r, T0 + 100_000)).toBe(3);
  });
});

describe('review selection', () => {
  it('picks only due words that are servable in the pool, urgency first', () => {
    const records = new Map<string, WordRecord>();
    const mk = (id: string, dueAtRound: number, stage: WordRecord['spacingStage']): void => {
      records.set(id, { ...found(newRecord(id, T0), 1), dueAtRound, spacingStage: stage, timesServedAsTarget: 1 });
    };
    mk('object:key', 2, 1); // overdue by 8 at round 10
    mk('object:cup', 9, 1); // overdue by 1
    mk('object:map', 30, 1); // not due
    mk('object:hat', 1, 1); // most overdue but not in pool
    const pool = new Set(['object:key', 'object:cup', 'object:map']);
    const picked = selectReviewConcepts(records, pool, 10, 3, new Set(), T0);
    expect(picked[0]).toBe('object:key');
    expect(picked).toContain('object:cup');
    expect(picked).not.toContain('object:map');
    expect(picked).not.toContain('object:hat');
  });

  it('excludes recent targets (no-stale-repeat)', () => {
    const records = new Map<string, WordRecord>();
    records.set('object:key', { ...found(newRecord('object:key', T0), 1), dueAtRound: 0, timesServedAsTarget: 1 });
    const picked = selectReviewConcepts(records, new Set(['object:key']), 10, 2, new Set(['object:key']), T0);
    expect(picked).toHaveLength(0);
  });
});

describe('debrief selection', () => {
  const records = new Map<string, WordRecord>();
  const foundConcepts = ['object:key', 'object:cup', 'object:map', 'object:hat', 'object:lamp', 'object:coat'];
  for (const c of foundConcepts) records.set(c, found(newRecord(c, T0), 1));

  it('is deterministic per seed and bounded by count', () => {
    const input = {
      records,
      foundConcepts,
      missedLastDebrief: [],
      overflow: [],
      articlePickWeight: 0.5,
      count: 4,
      seed: 77,
      now: T0,
      tier: 'basics' as const,
    };
    const a = selectDebriefItems(input);
    const b = selectDebriefItems(input);
    expect(a).toEqual(b);
    expect(a.length).toBeLessThanOrEqual(4);
    expect(a.length).toBeGreaterThan(0);
    for (const item of a) expect(foundConcepts).toContain(item.conceptId);
  });

  it('front-loads last debrief misses', () => {
    const items = selectDebriefItems({
      records,
      foundConcepts,
      missedLastDebrief: ['object:hat'],
      overflow: [],
      articlePickWeight: 0,
      count: 3,
      seed: 5,
      now: T0,
      tier: 'basics',
    });
    expect(items[0]?.conceptId).toBe('object:hat');
  });

  it('distractors never include the answer and are deterministic', () => {
    const pool = foundConcepts;
    const d1 = pickDistractors('object:key', pool, 2, 9);
    const d2 = pickDistractors('object:key', pool, 2, 9);
    expect(d1).toEqual(d2);
    expect(d1).toHaveLength(2);
    expect(d1).not.toContain('object:key');
  });
});
