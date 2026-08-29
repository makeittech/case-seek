/**
 * Content access for the app layer. initContent() pulls the JSON bundle in
 * through a dynamic import (its own chunk, loaded during boot); after that
 * db() is synchronous everywhere.
 */
import type { ContentDB } from '../engine/content/loader';

let dbi: ContentDB | null = null;

/** Load + schema-validate all content. Idempotent; awaited by boot(). */
export async function initContent(): Promise<ContentDB> {
  if (!dbi) {
    const { loadContent } = await import('../engine/content/source');
    dbi = loadContent();
  }
  return dbi;
}

export function db(): ContentDB {
  if (!dbi) throw new Error('content not initialized — call initContent() first');
  return dbi;
}
