/** Domain tints + stand-in glyph selection for props whose art hasn't loaded. */
import { db } from '../../../app/content';
import type { PropPlacement } from '../../../engine/content/schemas';
import type { Domain } from '../../../engine/types';

const DOMAIN_TINT: Record<Domain, string> = {
  household: '#c5a06c',
  'kitchen-food': '#cfa952',
  'clothing-textile': '#b58a96',
  tools: '#9a9a86',
  'art-craft': '#a591c2',
  'stationery-office': '#c2b482',
  maritime: '#7aa0b5',
  'travel-transit': '#b59c68',
  nature: '#86b57e',
  'music-leisure': '#c2957a',
  'instruments-measures': '#a3b3c2',
  'furniture-fixtures': '#ad9168',
};

const AMBIENCE_GLYPHS = ['📦', '🧹', '🪑', '🧺', '🖼️', '🕰️', '📚', '🧴'];

export function glyphFor(p: PropPlacement): { glyph: string; tint: string } {
  if (p.clue) {
    const clue = db().clues.get(p.clue);
    return { glyph: clue?.icon ?? '❔', tint: '#e3c87e' };
  }
  if (p.concept === 'untagged:ambience') {
    let h = 0;
    for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) | 0;
    return { glyph: AMBIENCE_GLYPHS[Math.abs(h) % AMBIENCE_GLYPHS.length]!, tint: '#8f8574' };
  }
  const c = db().concepts.get(p.concept);
  return { glyph: c?.icon ?? '❓', tint: c ? DOMAIN_TINT[c.domain] : '#9a9a86' };
}

/** Sprite id for a placement (asset-manifest contract: prop-<concept-noun>). */
export function spriteIdFor(p: PropPlacement): string {
  return p.sprite ?? `prop-${p.concept.split(':')[1] ?? p.id}`;
}
