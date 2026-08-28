import { describe, expect, it } from 'vitest';
import { migrateBundle, SaveVersionError, SAVE_VERSION, type Migration } from './migrations';

describe('save migrations', () => {
  it('same-version bundles pass through with the version stamped', () => {
    const bundle = { case: { saveVersion: SAVE_VERSION, caseId: 'x' } };
    const out = migrateBundle(bundle, SAVE_VERSION);
    expect((out.case as { saveVersion: number }).saveVersion).toBe(SAVE_VERSION);
  });

  it('refuses downgrades', () => {
    expect(() => migrateBundle({}, SAVE_VERSION + 1)).toThrowError(SaveVersionError);
    try {
      migrateBundle({}, SAVE_VERSION + 1);
    } catch (e) {
      expect((e as SaveVersionError).kind).toBe('downgrade');
    }
  });

  it('applies chained migrations in order', () => {
    const registry: Migration[] = [
      { from: 1, to: 2, migrate: (b) => ({ ...b, a: 1 }) },
      { from: 2, to: 3, migrate: (b) => ({ ...b, b: (b.a as number) + 1 }) },
    ];
    const out = migrateBundle({ case: {} }, 1, registry, 3);
    expect(out.a).toBe(1);
    expect(out.b).toBe(2);
    expect((out.case as { saveVersion: number }).saveVersion).toBe(3);
  });

  it('throws on migration gaps', () => {
    const registry: Migration[] = [{ from: 2, to: 3, migrate: (b) => b }];
    expect(() => migrateBundle({}, 1, registry, 3)).toThrowError(/no migration path/);
  });
});
