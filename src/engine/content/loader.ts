/**
 * Content loader: builds the typed ContentDB from the /content tree.
 * Uses Vite glob imports so adding a scene/language/chapter file requires
 * zero src changes. Everything is schema-validated on load.
 */
import type { ClueId, ConceptId, Lang, RoundId, SceneId } from '../types';
import {
  BeatsFileSchema,
  BoardReviewSchema,
  CastMemberSchema,
  CluesFileSchema,
  ConceptsFileSchema,
  EpilogueSchema,
  FinaleSchema,
  LanguagePackSchema,
  PuzzleSchema,
  RoundsFileSchema,
  SceneSchema,
  SceneVariantSchema,
  SeasonSchema,
  UiStringsSchema,
  type Beat,
  type BoardReview,
  type CastMember,
  type Clue,
  type Concept,
  type Epilogue,
  type Finale,
  type LanguagePack,
  type Lexeme,
  type PropPlacement,
  type PuzzleConfig,
  type RoundTemplate,
  type SceneDef,
  type SceneVariantDef,
  type Season,
} from './schemas';
import { z } from 'zod';

export interface ResolvedScene extends SceneDef {
  isVariant: boolean;
}

export interface ContentDB {
  concepts: Map<ConceptId, Concept>;
  packs: Record<Lang, LanguagePack>;
  lexemes: Record<Lang, Map<ConceptId, Lexeme>>;
  scenes: Map<SceneId, SceneDef>;
  variants: Map<SceneId, SceneVariantDef>;
  rounds: Map<RoundId, RoundTemplate>;
  beats: Map<string, Beat>;
  puzzles: Map<string, PuzzleConfig>;
  season: Season;
  clues: Map<ClueId, Clue>;
  boardReviews: Map<string, BoardReview>;
  cast: CastMember[];
  castById: Map<string, CastMember>;
  finale: Finale;
  epilogue: Epilogue;
  ui: Record<string, string>;
}

type RawModules = Record<string, unknown>;

/** Build the DB from raw path→json modules (injected so the validator CLI can reuse this). */
export function buildContentDB(raw: RawModules): ContentDB {
  const concepts = new Map<ConceptId, Concept>();
  const packs: Partial<Record<Lang, LanguagePack>> = {};
  const scenes = new Map<SceneId, SceneDef>();
  const variants = new Map<SceneId, SceneVariantDef>();
  const rounds = new Map<RoundId, RoundTemplate>();
  const beats = new Map<string, Beat>();
  const puzzles = new Map<string, PuzzleConfig>();
  const clues = new Map<ClueId, Clue>();
  const boardReviews = new Map<string, BoardReview>();
  let cast: CastMember[] = [];
  let season: Season | null = null;
  let finale: Finale | null = null;
  let epilogue: Epilogue | null = null;
  let ui: Record<string, string> = {};

  const parse = <T>(schema: z.ZodType<T>, data: unknown, path: string): T => {
    const res = schema.safeParse(data);
    if (!res.success) {
      throw new Error(`Content validation failed for ${path}:\n${res.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`);
    }
    return res.data;
  };

  for (const [path, data] of Object.entries(raw)) {
    const p = path.replace(/\\/g, '/');
    if (p.includes('/vocabulary/concepts.json')) {
      for (const c of parse(ConceptsFileSchema, data, p)) concepts.set(c.id, c);
    } else if (/\/languages\/(de|es|it)\/pack\.json$/.test(p)) {
      const pack = parse(LanguagePackSchema, data, p);
      packs[pack.lang] = pack;
    } else if (p.includes('/scenes/') && p.endsWith('.json')) {
      const obj = data as Record<string, unknown>;
      if (typeof obj === 'object' && obj !== null && 'parent' in obj) {
        const v = parse(SceneVariantSchema, data, p);
        variants.set(v.id, v);
      } else {
        const s = parse(SceneSchema, data, p);
        scenes.set(s.id, s);
      }
    } else if (p.includes('/rounds/')) {
      for (const r of parse(RoundsFileSchema, data, p)) rounds.set(r.id, r);
    } else if (p.includes('/dialogue/')) {
      for (const b of parse(BeatsFileSchema, data, p)) beats.set(b.id, b);
    } else if (p.includes('/puzzles/')) {
      const pz = parse(PuzzleSchema, data, p);
      puzzles.set(pz.id, pz);
    } else if (p.endsWith('/story/season.json')) {
      season = parse(SeasonSchema, data, p);
    } else if (p.endsWith('/story/clues.json')) {
      for (const c of parse(CluesFileSchema, data, p)) clues.set(c.id, c);
    } else if (p.endsWith('/story/board-reviews.json')) {
      for (const br of parse(z.array(BoardReviewSchema), data, p)) boardReviews.set(br.id, br);
    } else if (p.endsWith('/story/cast.json')) {
      cast = parse(z.array(CastMemberSchema), data, p);
    } else if (p.endsWith('/story/finale.json')) {
      finale = parse(FinaleSchema, data, p);
    } else if (p.endsWith('/story/epilogue.json')) {
      epilogue = parse(EpilogueSchema, data, p);
    } else if (p.includes('/ui-strings/')) {
      ui = parse(UiStringsSchema, data, p);
    }
  }

  if (!season) throw new Error('content/story/season.json missing');
  if (!finale) throw new Error('content/story/finale.json missing');
  if (!epilogue) throw new Error('content/story/epilogue.json missing');
  for (const lang of ['de', 'es', 'it'] as const) {
    if (!packs[lang]) throw new Error(`language pack missing: ${lang}`);
  }

  const lexemes: Record<Lang, Map<ConceptId, Lexeme>> = { de: new Map(), es: new Map(), it: new Map() };
  for (const lang of ['de', 'es', 'it'] as const) {
    for (const lx of packs[lang]!.lexemes) lexemes[lang].set(lx.concept, lx);
  }

  return {
    concepts,
    packs: packs as Record<Lang, LanguagePack>,
    lexemes,
    scenes,
    variants,
    rounds,
    beats,
    puzzles,
    season,
    clues,
    boardReviews,
    cast,
    castById: new Map(cast.map((c) => [c.id, c])),
    finale,
    epilogue,
    ui,
  };
}

// ---------- convenience helpers ----------

export function conceptOf(dbi: ContentDB, id: ConceptId): Concept {
  const c = dbi.concepts.get(id);
  if (!c) throw new Error(`unknown concept ${id}`);
  return c;
}

export function lexemeOf(dbi: ContentDB, lang: Lang, id: ConceptId): Lexeme {
  const lx = dbi.lexemes[lang].get(id);
  if (!lx) throw new Error(`missing ${lang} lexeme for ${id}`);
  return lx;
}

/** Join an article to a noun; elided articles (Italian "l'") attach without a space. */
export function joinArticle(article: string, word: string): string {
  return article.endsWith('\u2019') || article.endsWith("'") ? `${article}${word}` : `${article} ${word}`;
}

/** The canonical article+noun display form ("der Schlüssel", "l'ombrello"). */
export function nounDisplay(lx: Pick<Lexeme, 'article' | 'word'>): string {
  return joinArticle(lx.article, lx.word);
}

/** Sprite id for a placement (asset-manifest contract: prop-<concept-noun>). */
export function spriteIdFor(p: Pick<PropPlacement, 'id' | 'concept' | 'sprite'>): string {
  return p.sprite ?? `prop-${p.concept.split(':')[1] ?? p.id}`;
}

/** Resolve a scene (applying variant deltas if the id names a variant). */
export function resolveSceneDef(dbi: ContentDB, id: SceneId): SceneDef {
  const base = dbi.scenes.get(id);
  if (base) return base;
  const v = dbi.variants.get(id);
  if (!v) throw new Error(`unknown scene ${id}`);
  const parent = dbi.scenes.get(v.parent);
  if (!parent) throw new Error(`variant ${id} parent ${v.parent} missing`);
  const removed = new Set(v.removeProps);
  const moved = new Map(v.moveProps.map((m) => [m.id, m]));
  const props = parent.props
    .filter((prop) => !removed.has(prop.id))
    .map((prop) => {
      const m = moved.get(prop.id);
      return m
        ? {
            ...prop,
            x: m.x ?? prop.x,
            y: m.y ?? prop.y,
            scale: m.scale ?? prop.scale,
            rotation: m.rotation ?? prop.rotation,
            z: m.z ?? prop.z,
          }
        : prop;
    })
    .concat(v.addProps);
  return {
    ...parent,
    id: v.id,
    name: v.name,
    lightState: v.lightState,
    palette: v.palette ?? parent.palette,
    lightPools: v.lightPools.length ? v.lightPools : parent.lightPools,
    props,
  };
}
