import { loadContent, type ContentDB } from '../engine/content/loader';

export function db(): ContentDB {
  return loadContent();
}
