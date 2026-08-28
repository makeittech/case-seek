/**
 * The bundled content source: Vite glob-imports every JSON under /content.
 * Kept in its own module — and only ever reached through a dynamic import in
 * app/content (or directly from tests) — so the ~1.3 MB of content JSON ships
 * as a lazy chunk instead of inside the main bundle.
 */
import { buildContentDB, type ContentDB } from './loader';

let db: ContentDB | null = null;

/** Load all content via Vite glob import (browser + vitest). */
export function loadContent(): ContentDB {
  if (db) return db;
  const raw = import.meta.glob('../../../content/**/*.json', {
    eager: true,
    import: 'default',
  }) as Record<string, unknown>;
  db = buildContentDB(raw);
  return db;
}

/** Reset cached DB (tests). */
export function __resetContentCache(): void {
  db = null;
}
