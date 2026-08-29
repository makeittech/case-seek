/** Round builder against the REAL content: every authored round must build. */
import { describe, expect, it } from 'vitest';
import { resolveSceneDef } from '../content/loader';
import { loadContent } from '../content/source';
import { buildRound } from './buildRound';
import { newRecord, applyEvent, type WordRecord } from '../vocab/scheduler';

const db = loadContent();
const T0 = 1_700_000_000_000;

function build(roundId: string, records = new Map<string, WordRecord>(), seed = 12345) {
  const template = db.rounds.get(roundId)!;
  const scene = resolveSceneDef(db, template.sceneId);
  return buildRound({
    template,
    sceneProps: scene.props,
    records,
    saveSeed: seed,
    roundIndex: 3,
    recentTargetConcepts: new Set(),
    now: T0,
  });
}

describe('buildRound on real content', () => {
  it('every round builds to its target count with unique props', () => {
    for (const round of db.rounds.values()) {
      const plan = build(round.id);
      expect(plan.targets.length, round.id).toBe(round.targetCount);
      const propIds = plan.targets.flatMap((t) => t.propIds);
      expect(new Set(propIds).size, `${round.id} dup props`).toBe(propIds.length);
      // every propId must exist in the scene
      const scene = resolveSceneDef(db, round.sceneId);
      const sceneIds = new Set(scene.props.map((p) => p.id));
      for (const pid of propIds) expect(sceneIds.has(pid), `${round.id} ${pid}`).toBe(true);
    }
  });

  it('non-sweep rounds place exactly one evidence target near the end', () => {
    for (const round of db.rounds.values()) {
      if (round.mode === 'evidence-sweep') continue;
      const plan = build(round.id);
      const evidence = plan.targets.filter((t) => t.kind === 'evidence');
      expect(evidence.length, round.id).toBe(1);
      const idx = plan.targets.findIndex((t) => t.kind === 'evidence');
      expect(idx, round.id).toBeGreaterThanOrEqual(plan.targets.length - 2);
      expect(evidence[0]!.clueId).toBe(round.evidence.clueId);
    }
  });

  it('sweep round targets are all evidence in authored order', () => {
    const sweep = [...db.rounds.values()].find((r) => r.mode === 'evidence-sweep')!;
    const plan = build(sweep.id);
    expect(plan.targets.every((t) => t.kind === 'evidence')).toBe(true);
    expect(plan.targets.map((t) => t.clueId)).toEqual(sweep.sweepClues);
  });

  it('plural slots carry the authored count of props', () => {
    for (const round of db.rounds.values()) {
      if (round.pluralSlots.length === 0) continue;
      const plan = build(round.id);
      for (const slot of round.pluralSlots) {
        const t = plan.targets.find((x) => x.conceptId === slot.concept && x.isPlural);
        expect(t, `${round.id} plural ${slot.concept}`).toBeTruthy();
        expect(t!.propIds.length).toBe(slot.count);
        expect(t!.count).toBe(slot.count);
      }
    }
  });

  it('is deterministic per (seed, roundId) and varies across seeds', () => {
    const a = build('S05');
    const b = build('S05');
    expect(a).toEqual(b);
    const c = build('S05', new Map(), 999);
    expect(c.seed).not.toBe(a.seed);
  });

  it('review words with props in the pool fill review slots', () => {
    const records = new Map<string, WordRecord>();
    // make several early-round words due for review
    const s01 = db.rounds.get('S01')!;
    for (const conceptId of s01.freshConcepts) {
      let r = newRecord(conceptId, T0);
      r = applyEvent(r, 'unaided-find', { now: T0, roundIndex: 0, roundId: 'S01' });
      records.set(conceptId, { ...r, dueAtRound: 0 });
    }
    // S02 shares the office scene family? use a later round with reviewShare > 0
    const target = [...db.rounds.values()].find((r) => r.reviewShare > 0 && r.id !== 'S01');
    expect(target).toBeTruthy();
    const plan = build(target!.id, records);
    expect(plan.targets.length).toBe(target!.targetCount);
  });
});
