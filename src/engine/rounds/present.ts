/**
 * Tier presentation (LANG §5.1): the same target list renders as different
 * chip models per proficiency tier and round mode. No tier logic in JSX —
 * a single WordChip component renders these models.
 */
import type { ConceptId, RoundMode, Tier } from '../types';
import type { Concept, Lexeme, Clue } from '../content/schemas';
import type { ResolvedTarget } from './buildRound';
import { deriveSeed, mulberry32 } from '../rand';

export type ChipKind = 'word' | 'word-gloss' | 'phrase' | 'audio' | 'silhouette' | 'evidence';

export interface ChipModel {
  targetId: string;
  kind: ChipKind;
  conceptId?: ConceptId;
  clueId?: string;
  /** main tray string — "der Schlüssel" / phrase / proper name */
  display: string;
  glyph?: '▲' | '●' | '■';
  gloss: string; // english gloss (word card / flip face)
  icon: string; // generic concept icon (never the scene prop)
  caution?: string;
  plural: boolean;
  count: number; // total finds needed
  isEvidence: boolean;
  /** what the TTS speaks (display, or ttsText override) */
  speech: string;
  speechPlural?: string;
}

export interface PresentInput {
  targets: ResolvedTarget[];
  tier: Tier;
  mode: RoundMode;
  lexeme: (id: ConceptId) => Lexeme;
  concept: (id: ConceptId) => Concept;
  clue: (id: string) => Clue;
  seed: number;
}

const AUDIO_CHIP_CAP = 4;

export function presentRound(input: PresentInput): ChipModel[] {
  const rng = mulberry32(deriveSeed(input.seed, 'present'));
  let audioUsed = 0;
  let phraseUsed = 0;

  return input.targets.map((t) => {
    if (t.kind === 'evidence') {
      const clue = input.clue(t.clueId!);
      return {
        targetId: t.targetId,
        kind: 'evidence' as const,
        clueId: t.clueId,
        conceptId: t.conceptId,
        display: clue.name.toUpperCase(),
        gloss: clue.name,
        icon: clue.icon,
        plural: false,
        count: 1,
        isEvidence: true,
        speech: clue.name,
      };
    }
    const lx = input.lexeme(t.conceptId!);
    const c = input.concept(t.conceptId!);
    const displaySingular = `${lx.article} ${lx.word}`;
    const display = t.isPlural && lx.plural ? `${lx.plural}` : displaySingular;
    const base = {
      targetId: t.targetId,
      conceptId: t.conceptId,
      glyph: lx.glyph,
      gloss: lx.gloss ?? c.gloss,
      icon: c.icon,
      caution: lx.caution,
      plural: t.isPlural,
      count: t.count,
      isEvidence: false,
      display,
      speech: (t.isPlural ? lx.ttsTextPlural ?? lx.plural : lx.ttsText) ?? display,
      speechPlural: lx.ttsTextPlural ?? lx.plural,
    };

    let kind: ChipKind;
    if (input.mode === 'silhouette') {
      kind = 'silhouette';
    } else if (input.mode === 'audio') {
      kind = input.tier === 'conversational' || input.tier === 'advanced' ? 'audio' : 'word';
    } else if (input.mode === 'description') {
      kind = lx.phrase ? 'phrase' : input.tier === 'new' ? 'word-gloss' : 'word';
    } else {
      // word-list
      if (input.tier === 'new') kind = 'word-gloss';
      else if (input.tier === 'basics') kind = 'word';
      else if (input.tier === 'conversational') {
        kind = lx.phrase && phraseUsed < 3 && rng() < 0.35 ? 'phrase' : 'word';
      } else {
        // advanced: mixed word / phrase / audio (audio capped)
        const roll = rng();
        if (roll < 0.25 && audioUsed < AUDIO_CHIP_CAP) kind = 'audio';
        else if (roll < 0.45 && lx.phrase) kind = 'phrase';
        else kind = 'word';
      }
    }
    if (kind === 'audio') audioUsed++;
    if (kind === 'phrase') phraseUsed++;
    const displayFinal = kind === 'phrase' && lx.phrase ? lx.phrase : base.display;
    return { ...base, kind, display: displayFinal };
  });
}

/** Pre-round intro cards for the New tier: up to 5 fresh concepts (LANG §5.1). */
export function introConcepts(targets: ResolvedTarget[], tier: Tier, max = 5): ConceptId[] {
  if (tier !== 'new') return [];
  return targets
    .filter((t) => t.kind === 'vocab' && !t.isReview && t.conceptId)
    .slice(0, max)
    .map((t) => t.conceptId!);
}
