/** Loads the REAL /content tree through the Vite glob loader. */
import { describe, expect, it } from 'vitest';
import { loadContent, resolveSceneDef } from './loader';

describe('content loading (real content tree)', () => {
  const db = loadContent();

  it('loads every collection with expected sizes', () => {
    expect(db.concepts.size).toBeGreaterThanOrEqual(200);
    expect(db.scenes.size).toBe(19);
    expect(db.variants.size).toBe(3);
    expect(db.rounds.size).toBe(29);
    expect(db.beats.size).toBeGreaterThanOrEqual(39);
    expect(db.puzzles.size).toBe(9);
    expect(db.clues.size).toBeGreaterThanOrEqual(35);
    expect(db.boardReviews.size).toBe(3);
    expect(db.season.flow.length).toBeGreaterThan(80);
    expect(db.cast.length).toBeGreaterThanOrEqual(6);
  });

  it('every concept has a lexeme in all three packs', () => {
    for (const id of db.concepts.keys()) {
      for (const lang of ['de', 'es', 'it'] as const) {
        expect(db.lexemes[lang].has(id), `${lang}/${id}`).toBe(true);
      }
    }
  });

  it('lexeme articles conform to each pack option sets', () => {
    for (const lang of ['de', 'es', 'it'] as const) {
      const sets = db.packs[lang].articleOptionSets;
      for (const lx of db.packs[lang].lexemes) {
        expect(
          sets.some((s) => s.includes(lx.article)),
          `${lang} ${lx.concept} article=${lx.article}`,
        ).toBe(true);
      }
    }
  });

  it('variants resolve against parents with all evidence intact', () => {
    for (const v of db.variants.values()) {
      const resolved = resolveSceneDef(db, v.id);
      expect(resolved.props.length).toBeGreaterThan(10);
      expect(resolved.id).toBe(v.id);
    }
  });

  it('every round references a resolvable scene and its evidence prop', () => {
    for (const round of db.rounds.values()) {
      const scene = resolveSceneDef(db, round.sceneId);
      if (round.mode === 'evidence-sweep') {
        for (const clueId of round.sweepClues ?? []) {
          expect(scene.props.some((p) => p.clue === clueId), `${round.id} sweep ${clueId}`).toBe(true);
        }
      } else {
        const ev = scene.props.find((p) => p.id === round.evidence.propId);
        expect(ev, `${round.id} evidence prop`).toBeTruthy();
        expect(ev?.clue).toBe(round.evidence.clueId);
      }
    }
  });

  it('season flow references only existing content', () => {
    for (const node of db.season.flow) {
      if (node.type === 'beat') expect(db.beats.has(node.id), node.id).toBe(true);
      if (node.type === 'round') expect(db.rounds.has(node.id), node.id).toBe(true);
      if (node.type === 'puzzle') expect(db.puzzles.has(node.id), node.id).toBe(true);
      if (node.type === 'board-review') expect(db.boardReviews.has(node.id), node.id).toBe(true);
    }
  });

  it('finale culprit is a suspect and exhibits are clues', () => {
    expect(db.finale.suspects.some((s) => s.id === db.finale.culprit)).toBe(true);
    for (const ex of db.finale.exhibits) expect(db.clues.has(ex)).toBe(true);
  });
});
