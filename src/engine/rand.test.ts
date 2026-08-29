import { describe, expect, it } from 'vitest';
import { deriveSeed, mulberry32, pick, shuffle } from './rand';

describe('seeded rng', () => {
  it('mulberry32 is deterministic per seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('different seeds diverge', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('values stay in [0,1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('deriveSeed is stable and label-sensitive', () => {
    expect(deriveSeed(100, 'S01')).toBe(deriveSeed(100, 'S01'));
    expect(deriveSeed(100, 'S01')).not.toBe(deriveSeed(100, 'S02'));
    expect(deriveSeed(100, 'S01')).not.toBe(deriveSeed(101, 'S01'));
  });

  it('shuffle is deterministic and preserves membership', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const s1 = shuffle(arr, mulberry32(5));
    const s2 = shuffle(arr, mulberry32(5));
    expect(s1).toEqual(s2);
    expect([...s1].sort()).toEqual([...arr].sort());
    expect(arr).toEqual(['a', 'b', 'c', 'd', 'e']); // input untouched
  });

  it('pick returns n distinct members', () => {
    const arr = [1, 2, 3];
    const rng = mulberry32(9);
    for (let i = 0; i < 20; i++) {
      const picked = pick(arr, 2, rng);
      expect(picked).toHaveLength(2);
      expect(new Set(picked).size).toBe(2);
      for (const v of picked) expect(arr).toContain(v);
    }
  });
});
