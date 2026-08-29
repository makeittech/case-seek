/** UI string lookup from content/ui-strings (English v1; keyed for later locales). */
import { db } from '../app/content';

export function ui(key: string): string {
  return db().ui[key] ?? key;
}
