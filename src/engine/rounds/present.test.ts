/** Tier presentation rules over the real Spanish pack. */
import { describe, expect, it } from 'vitest';
import { resolveSceneDef } from '../content/loader';
import { loadContent } from '../content/source';
import { buildRound } from './buildRound';
import { presentRound, introConcepts } from './present';
import type { RoundMode, Tier } from '../types';

const db = loadContent();

function chipsFor(roundId: string, tier: Tier, mode?: RoundMode) {
  const template = db.rounds.get(roundId)!;
  const scene = resolveSceneDef(db, template.sceneId);
  const plan = buildRound({
    template,
    sceneProps: scene.props,
    records: new Map(),
    saveSeed: 42,
    roundIndex: 0,
    recentTargetConcepts: new Set(),
    now: 1_700_000_000_000,
  });
  return presentRound({
    targets: plan.targets,
    tier,
    mode: mode ?? template.mode,
    lexeme: (id) => db.lexemes.es.get(id)!,
    concept: (id) => db.concepts.get(id)!,
    clue: (id) => db.clues.get(id)!,
    seed: plan.seed,
  });
}

describe('presentRound', () => {
  it('New tier gets word+gloss chips and intro cards', () => {
    const chips = chipsFor('S00', 'new');
    for (const c of chips) {
      if (!c.isEvidence) expect(c.kind).toBe('word-gloss');
    }
    const template = db.rounds.get('S00')!;
    const scene = resolveSceneDef(db, template.sceneId);
    const plan = buildRound({
      template,
      sceneProps: scene.props,
      records: new Map(),
      saveSeed: 42,
      roundIndex: 0,
      recentTargetConcepts: new Set(),
      now: 1_700_000_000_000,
    });
    const intro = introConcepts(plan.targets, 'new');
    expect(intro.length).toBeGreaterThan(0);
    expect(intro.length).toBeLessThanOrEqual(5);
    expect(introConcepts(plan.targets, 'basics')).toHaveLength(0);
  });

  it('Basics tier gets bare word chips (no gloss)', () => {
    const chips = chipsFor('S00', 'basics');
    for (const c of chips) {
      if (!c.isEvidence) expect(c.kind).toBe('word');
    }
  });

  it('Advanced tier mixes kinds with audio capped at 4', () => {
    const chips = chipsFor('S05', 'advanced');
    const audio = chips.filter((c) => c.kind === 'audio');
    expect(audio.length).toBeLessThanOrEqual(4);
  });

  it('silhouette mode presents silhouette chips regardless of tier', () => {
    const silhouetteRound = [...db.rounds.values()].find((r) => r.mode === 'silhouette');
    expect(silhouetteRound).toBeTruthy();
    const chips = chipsFor(silhouetteRound!.id, 'basics');
    for (const c of chips) {
      if (!c.isEvidence) expect(c.kind).toBe('silhouette');
    }
  });

  it('every vocab chip displays article + word and carries speech text', () => {
    const chips = chipsFor('S01', 'basics');
    for (const c of chips) {
      if (c.isEvidence || !c.conceptId) continue;
      const lx = db.lexemes.es.get(c.conceptId)!;
      if (!c.plural) expect(c.display).toBe(`${lx.article} ${lx.word}`);
      expect(c.speech.length).toBeGreaterThan(0);
      expect(c.icon.length).toBeGreaterThan(0);
    }
  });

  it('evidence chips display the clue name in caps', () => {
    const chips = chipsFor('S00', 'basics');
    const ev = chips.find((c) => c.isEvidence)!;
    expect(ev.display).toBe(ev.display.toUpperCase());
    expect(ev.kind).toBe('evidence');
  });
});
