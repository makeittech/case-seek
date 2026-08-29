/**
 * Zod schemas for every content file. One schema definition serves the runtime
 * loader (dev validation), the content validator CLI, and inferred TS types.
 */
import { z } from 'zod';

// ---------- vocabulary ----------

export const ConceptIdRe = /^(object|evidence):[a-z0-9-]+$/;

export const ConceptSchema = z
  .object({
    id: z.string().regex(ConceptIdRe),
    gloss: z.string().min(1),
    domain: z.enum([
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
    ]),
    tags: z.array(z.string()).default([]),
    freq: z.enum(['A', 'B', 'C']),
    icon: z.string().min(1), // stand-in glyph; doubles as debrief thumbnail
    multiFindOk: z.boolean().default(false),
    notes: z.string().optional(),
  })
  .strict();

export const ConceptsFileSchema = z.array(ConceptSchema);

export const LexemeSchema = z
  .object({
    concept: z.string().regex(ConceptIdRe),
    article: z.string().min(1),
    word: z.string().min(1),
    plural: z.string().optional(), // full plural display "die Schlüssel"
    glyph: z.enum(['▲', '●', '■']),
    difficulty: z.enum(['cognate', 'transparent', 'opaque', 'false-friend']).default('opaque'),
    gloss: z.string().optional(), // overrides concept gloss when EN ambiguous
    caution: z.string().optional(), // trap-word gloss-card line
    ttsText: z.string().optional(),
    ttsTextPlural: z.string().optional(),
    phrase: z.string().optional(), // ≤6-word description phrase (Conversational+)
    trapFlags: z.array(z.string()).default([]),
  })
  .strict();

export const TokenSchema = z
  .object({
    key: z.string(),
    level: z.enum(['L1', 'L2']),
    text: z.string(),
    gloss: z.string(),
  })
  .strict();

export const LanguagePackSchema = z
  .object({
    lang: z.enum(['de', 'es', 'it']),
    name: z.string(), // "Deutsch"
    nameEn: z.string(), // "German"
    locale: z.string(), // "de-DE"
    greeting: z.string(), // spoken on cover hover
    grandmother: z.string(), // Margo's grandmother, localized ("Oma Katja") — {gran} in dialogue
    slowRate: z.number().min(0.4).max(1),
    articles: z.array(z.string()).min(2),
    articleOptionSets: z.array(z.array(z.string()).min(2)).min(1), // debrief pick option rows
    articlePickWeight: z.number().min(0).max(1),
    lexemes: z.array(LexemeSchema),
    tokens: z.array(TokenSchema).default([]),
    vendorCalls: z.array(z.string()).default([]),
    signage: z.array(z.string()).default([]),
  })
  .strict();

// ---------- scenes ----------

export const PoolSchema = z.object({ x: z.number(), y: z.number(), r: z.number() }).strict();

export const PropSchema = z
  .object({
    id: z.string().min(1),
    concept: z.string().regex(ConceptIdRe).or(z.literal('untagged:ambience')),
    clue: z.string().optional(), // evidence props carry their clue id
    sprite: z.string().optional(), // defaults to prop-<concept-noun>
    x: z.number(),
    y: z.number(),
    scale: z.number().positive(),
    rotation: z.number().default(0),
    z: z.number(),
    band: z.enum(['fg', 'mg', 'bg']).default('mg'),
    flipX: z.boolean().default(false),
  })
  .strict();

export const MotifSchema = z
  .object({
    kind: z.enum(['rect', 'ellipse', 'beam', 'arch', 'window']),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    color: z.string(),
    alpha: z.number().min(0).max(1).default(1),
  })
  .strict();

export const PaletteSchema = z
  .object({
    wallTop: z.string(),
    wallBottom: z.string(),
    floor: z.string(),
    accent: z.string(),
    light: z.string().default('#ffe9b8'),
    motifs: z.array(MotifSchema).default([]),
  })
  .strict();

export const SceneSchema = z
  .object({
    id: z.string().regex(/^scn-[a-z0-9-]+$/),
    name: z.string(),
    locationId: z.string(),
    lightState: z.enum([
      'day',
      'dawn',
      'evening',
      'lamplit',
      'night',
      'night-lantern',
      'fog-dusk',
      'storm',
      'night-storm',
    ]),
    plate: z.string().optional(), // /assets/scenes/<id>.webp when art lands
    size: z.object({ w: z.number(), h: z.number() }).strict(),
    palette: PaletteSchema,
    lightPools: z.array(PoolSchema).default([]),
    props: z.array(PropSchema),
  })
  .strict();

export const SceneVariantSchema = z
  .object({
    id: z.string().regex(/^scn-[a-z0-9-]+$/),
    name: z.string(),
    parent: z.string(),
    lightState: SceneSchema.shape.lightState,
    palette: PaletteSchema.optional(),
    lightPools: z.array(PoolSchema).default([]),
    removeProps: z.array(z.string()).default([]),
    addProps: z.array(PropSchema).default([]),
    moveProps: z
      .array(
        z
          .object({
            id: z.string(),
            x: z.number().optional(),
            y: z.number().optional(),
            scale: z.number().optional(),
            rotation: z.number().optional(),
            z: z.number().optional(),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();

// ---------- rounds ----------

export const RoundSchema = z
  .object({
    id: z.string().regex(/^S\d{2}$/),
    sceneId: z.string(),
    chapter: z.number().int().min(1).max(6),
    mode: z.enum(['word-list', 'silhouette', 'audio', 'description', 'evidence-sweep']),
    targetCount: z.number().int().min(8).max(14),
    objective: z.string(), // breadcrumb, ≤40 chars target
    freshConcepts: z.array(z.string().regex(ConceptIdRe)),
    pluralSlots: z
      .array(z.object({ concept: z.string(), count: z.number().int().min(2).max(4) }).strict())
      .default([]),
    evidence: z
      .object({
        propId: z.string(),
        clueId: z.string(),
        position: z.enum(['last', 'second-to-last']).default('last'),
      })
      .strict(),
    sweepClues: z.array(z.string()).optional(), // evidence-sweep rounds: ordered clue targets
    reviewShare: z.number().min(0).max(0.45),
    debriefFlavor: z.string().optional(),
  })
  .strict();

export const RoundsFileSchema = z.array(RoundSchema);

// ---------- dialogue ----------

export const LineSchema = z
  .object({
    speaker: z.string(), // cast id or 'narration' | 'letter'
    en: z.string().min(1),
    garnish: z
      .object({
        level: z.enum(['L1', 'L2']),
        key: z.string(), // token bank key
        pos: z.enum(['lead', 'tail']).default('lead'),
      })
      .strict()
      .optional(),
    echo: z.boolean().default(false), // receives the round's weakest found noun
  })
  .strict();

export const BeatSchema = z
  .object({
    id: z.string().regex(/^b\d+\.\d+[a-z]?$/),
    chapter: z.number().int().min(1).max(6),
    title: z.string(),
    lines: z.array(LineSchema).min(1),
    caseLine: z.string().min(1), // ≤14 words, validator-checked
    peopleFacts: z
      .array(
        z
          .object({
            characterId: z.string(),
            fact: z.string(),
            stamp: z.enum(['ally', 'suspect', 'cleared', 'unknown', 'witness', 'culprit']).optional(),
          })
          .strict(),
      )
      .default([]),
    flavorChoice: z
      .object({ dry: z.string(), warm: z.string() })
      .strict()
      .optional(),
    illustration: z.string().optional(), // /assets/story/... when art lands
  })
  .strict();

export const BeatsFileSchema = z.array(BeatSchema);

// ---------- puzzles ----------

export const PuzzleSchema = z
  .object({
    id: z.string().regex(/^P\d$/),
    mechanic: z.enum([
      'torn-paper',
      'combination',
      'pairs',
      'cipher-wheel',
      'silhouette-sort',
      'light-sequence',
      'ratio-mix',
      'logic-grid',
      'clock-hands',
    ]),
    title: z.string(),
    prompt: z.string(), // one-sentence goal in Halloway's hand
    skipNote: z.string(), // "solved off-screen by Margo" CLUES note
    clueId: z.string().optional(), // clue the puzzle yields
    params: z.record(z.string(), z.unknown()),
  })
  .strict();

// ---------- story structure ----------

export const FlowNodeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('beat'), id: z.string() }).strict(),
  z.object({ type: z.literal('round'), id: z.string() }).strict(),
  z.object({ type: z.literal('puzzle'), id: z.string() }).strict(),
  z.object({ type: z.literal('board-review'), id: z.string() }).strict(),
  z.object({ type: z.literal('recap'), chapter: z.number().int() }).strict(),
  z.object({ type: z.literal('accusation') }).strict(),
  z.object({ type: z.literal('epilogue') }).strict(),
]);

export const SeasonSchema = z
  .object({
    title: z.string(),
    chapters: z.array(
      z.object({ n: z.number().int(), title: z.string() }).strict(),
    ),
    flow: z.array(FlowNodeSchema).min(1),
  })
  .strict();

export const ClueSchema = z
  .object({
    id: z.string().regex(/^C\d{2}$/),
    name: z.string(),
    icon: z.string(),
    note: z.string(), // Halloway's margin note
    caption: z.string().optional(), // caption fallback when no captionKey resolves
    captionKey: z.string().optional(), // token-bank key → study-language caption (C28), tap-gloss
    pin: z.boolean().default(true),
  })
  .strict();

export const CluesFileSchema = z.array(ClueSchema);

export const BoardReviewSchema = z
  .object({
    id: z.string().regex(/^BR\d$/),
    prompt: z.string(),
    pins: z.array(z.string()).min(3).max(6),
    pair: z.tuple([z.string(), z.string()]),
    line: z.string(), // deduction line on success
  })
  .strict();

export const CastMemberSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    icon: z.string(),
    initialStamp: z.enum(['ally', 'suspect', 'cleared', 'unknown', 'witness', 'culprit']),
  })
  .strict();

export const FinaleSchema = z
  .object({
    prompt: z.string(),
    suspects: z.array(z.object({ id: z.string(), label: z.string() }).strict()).min(4),
    culprit: z.string(),
    wrongLine: z.string(),
    exhibits: z.array(z.string()), // clue ids recited in the accusation
    confrontation: z.array(LineSchema),
    flavorChoice: z.object({ dry: z.string(), warm: z.string() }).strict(),
    resolution: z.array(LineSchema),
  })
  .strict();

export const EpiloguePanelSchema = z
  .object({
    location: z.string(),
    text: z.string(),
    caseLine: z.string(),
    icon: z.string(),
  })
  .strict();

export const EpilogueSchema = z
  .object({
    panels: z.array(EpiloguePanelSchema).min(4),
    codaTitle: z.string(),
    coda: z.array(z.string()).min(1),
  })
  .strict();

export const UiStringsSchema = z.record(z.string(), z.string());

// ---------- inferred types ----------

export type Concept = z.infer<typeof ConceptSchema>;
export type Lexeme = z.infer<typeof LexemeSchema>;
export type LanguagePack = z.infer<typeof LanguagePackSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type SceneDef = z.infer<typeof SceneSchema>;
export type SceneVariantDef = z.infer<typeof SceneVariantSchema>;
export type PropPlacement = z.infer<typeof PropSchema>;
export type ScenePalette = z.infer<typeof PaletteSchema>;
export type RoundTemplate = z.infer<typeof RoundSchema>;
export type Beat = z.infer<typeof BeatSchema>;
export type Line = z.infer<typeof LineSchema>;
export type PuzzleConfig = z.infer<typeof PuzzleSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type FlowNode = z.infer<typeof FlowNodeSchema>;
export type Clue = z.infer<typeof ClueSchema>;
export type BoardReview = z.infer<typeof BoardReviewSchema>;
export type CastMember = z.infer<typeof CastMemberSchema>;
export type Finale = z.infer<typeof FinaleSchema>;
export type Epilogue = z.infer<typeof EpilogueSchema>;
