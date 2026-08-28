/** Shared domain types — the single import point for engine identifiers. */

export type ConceptId = string; // "object:key"
export type SceneId = string; // "scn-01-gallery-day"
export type RoundId = string; // "S01"
export type BeatId = string; // "b1.1"
export type PuzzleId = string; // "P1"
export type ClueId = string; // "C01"
export type SpriteId = string; // "prop-key"

export type Lang = 'de' | 'es' | 'it';
export type Tier = 'new' | 'basics' | 'conversational' | 'advanced';
export type LightState =
  | 'day'
  | 'dawn'
  | 'evening'
  | 'lamplit'
  | 'night'
  | 'night-lantern'
  | 'fog-dusk'
  | 'storm'
  | 'night-storm';

export type RoundMode = 'word-list' | 'silhouette' | 'audio' | 'description' | 'evidence-sweep';

export type GenderGlyph = '▲' | '●' | '■';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export type Domain =
  | 'household'
  | 'kitchen-food'
  | 'clothing-textile'
  | 'tools'
  | 'art-craft'
  | 'stationery-office'
  | 'maritime'
  | 'travel-transit'
  | 'nature'
  | 'music-leisure'
  | 'instruments-measures'
  | 'furniture-fixtures';

export const DOMAINS: Domain[] = [
  'household',
  'kitchen-food',
  'clothing-textile',
  'tools',
  'art-craft',
  'stationery-office',
  'maritime',
  'travel-transit',
  'nature',
  'music-leisure',
  'instruments-measures',
  'furniture-fixtures',
];

export const LANGS: Lang[] = ['de', 'es', 'it'];
export const TIERS: Tier[] = ['new', 'basics', 'conversational', 'advanced'];
