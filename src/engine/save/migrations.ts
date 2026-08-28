/**
 * Save versioning: forward migrations from day one (ARCH §9.2).
 * Every saved case row carries `saveVersion`; opening a save runs pending
 * migrations in order before load. Downgrades are refused.
 */

export const SAVE_VERSION = 1;

export interface Migration {
  from: number;
  to: number;
  /** migrate one case bundle (case row + word records + notebook + round state) */
  migrate(bundle: Record<string, unknown>): Record<string, unknown>;
}

/** Ordered registry v(n) → v(n+1). Append-only; never reorder. */
export const MIGRATIONS: Migration[] = [
  // v1 is the baseline shipped schema. Future example:
  // { from: 1, to: 2, migrate: (b) => ({ ...b, case: { ...(b.case as object), newField: 0 } }) },
];

export class SaveVersionError extends Error {
  constructor(
    message: string,
    readonly kind: 'downgrade' | 'gap',
  ) {
    super(message);
  }
}

export function migrateBundle(
  bundle: Record<string, unknown>,
  fromVersion: number,
  registry: Migration[] = MIGRATIONS,
  targetVersion: number = SAVE_VERSION,
): Record<string, unknown> {
  if (fromVersion > targetVersion) {
    throw new SaveVersionError(
      `save is v${fromVersion}, app supports v${targetVersion} — refuse downgrade`,
      'downgrade',
    );
  }
  let v = fromVersion;
  let out = bundle;
  while (v < targetVersion) {
    const m = registry.find((r) => r.from === v);
    if (!m) throw new SaveVersionError(`no migration path from v${v}`, 'gap');
    out = m.migrate(out);
    v = m.to;
  }
  const caseRow = out.case as Record<string, unknown> | undefined;
  if (caseRow) caseRow.saveVersion = targetVersion;
  return out;
}
