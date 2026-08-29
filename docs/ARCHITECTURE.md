# Case & Seek — Technical Architecture

**Version:** 1.0 (Architecture Lock Candidate)
**Author:** FABLE, Principal Web Game Architect
**Authority:** This document is the technical source of truth. It obeys `/workspace/docs/GAME_DESIGN.md` (structure, budgets, fairness), `/workspace/docs/UX_SPEC.md` (all interaction behavior and tokens), `/workspace/docs/LANGUAGE_DESIGN.md` (vocabulary model, scheduler, SpeechSynthesis amendment), `/workspace/docs/STORY_BIBLE.md` + `/workspace/content/story/` (story fact), and `/workspace/docs/ART_BIBLE.md` + `/workspace/docs/SCENE_COMPOSITION.md` (asset contracts). Where those documents specify *what* and *why*, this document specifies *how* and *where in the codebase*.
**Audience:** the parallel implementation agents. Every section ends in buildable contracts; §15 assigns ownership.

> One sentence of architecture: **a framework-free TypeScript game engine driven entirely by validated content files, wrapped in a thin React shell — nothing hardcoded, everything data.**

---

## Table of Contents

1. [Stack Decision](#1-stack-decision)
2. [Architectural Principles](#2-architectural-principles)
3. [Repository Layout](#3-repository-layout)
4. [Content & Data Model](#4-content--data-model)
5. [The HOG Engine](#5-the-hog-engine)
6. [Application Shell — State, Screens, Features](#6-application-shell--state-screens-features)
7. [Services & Platform Seams](#7-services--platform-seams)
8. [Localization Architecture](#8-localization-architecture)
9. [Save System & Offline-First](#9-save-system--offline-first)
10. [Audio Architecture](#10-audio-architecture)
11. [Content Validator](#11-content-validator)
12. [Asset Pipeline](#12-asset-pipeline)
13. [Testing Strategy](#13-testing-strategy)
14. [Performance Budgets](#14-performance-budgets)
15. [Parallel Implementation Plan](#15-parallel-implementation-plan)
16. [Decision Log](#16-decision-log)

---

## 1. Stack Decision

**React 18 + TypeScript (strict) + Vite.** Lightweight, boring, dependable. The scene itself is *not* React (see §5.2); React owns chrome, overlays, and flow.

### Dependencies (complete v1 list — additions require an ADR in §16)

| Package | Role | Why this one |
|---|---|---|
| `react`, `react-dom` | UI shell | Locked by brief |
| `zustand` | State stores | ~1 KB, no boilerplate, subscribable outside React (engine ↔ UI bridge) |
| `zod` | Schema validation | One schema definition serves runtime loaders, the content validator CLI, and inferred TS types |
| `idb` | IndexedDB wrapper | ~1 KB, promise-based; save system (§9) |
| `vite-plugin-pwa` (Workbox) | Service worker, app-shell precache, chapter-bundle caching | Standard Vite PWA path; offline-first (§9) |
| `vitest`, `@testing-library/react` | Unit + integration tests | Vite-native |
| `@playwright/test` | E2E tests | Release-gate flows (§13) |
| `sharp` (dev only) | Asset pipeline: webp encode, mask extraction, resize | Build-time only, never shipped |
| `eslint`, `typescript-eslint`, `prettier` | Lint/format | CI gates |

### Explicitly rejected

| Rejected | Reason |
|---|---|
| PixiJS / Phaser / Three | A HOG scene is ≤ ~120 static sprites + a camera + FX cards. A hand-rolled Canvas 2D renderer (§5.2) is ~1/50th the payload and we need per-pixel alpha access anyway for hit testing |
| react-router | The screen map (UX §2) is a small state machine with custom browser-back semantics; a router fights it. `NavigationService` (§7.5) owns the History API |
| redux / mobx | Zustand covers it |
| i18next | UI is English-only v1 with externalized strings (GDD §19.4); learning content localization is our own language-pack system (§8) — a general i18n lib models neither well |
| Howler.js | WebAudio graph is small (§10); vocabulary audio is SpeechSynthesis, which no audio lib routes anyway |

---

## 2. Architectural Principles

These are enforceable rules, not aspirations. The validator, lint rules, and code review hold the line.

1. **Engine vs content.** `src/engine/` is pure TypeScript: no React, no DOM globals outside the render/input adapters, no fetch. It operates on typed data loaded from `content/` and `assets/`. Adding a scene, a language, a chapter, or 100 new words touches **zero** `src/` files.
2. **No giant hardcoded React trees.** No component ever enumerates scenes, props, targets, words, beats, puzzles, or cast members in JSX. Components render *data*; content files supply it. A JSX file containing a concept ID string or a scene coordinate fails review.
3. **Determinism.** Round building, review-slot filling, and Debrief item selection are pure functions of `(content, wordRecords, saveSeed, roundIndex)` (GDD §19.3). A resumed round rebuilds identically. No `Math.random()` outside the seeded PRNG in `engine/rand.ts`.
4. **Provider seams for every platform API.** SpeechSynthesis, IndexedDB, WebAudio, `navigator.storage`, History — each behind an interface with a fake for tests (LANG §7.6 is the model). Nothing imports a browser global except `src/services/`.
5. **Schema or it doesn't ship.** Every content file validates against a zod schema at build time (validator, §11) *and* at load time in dev. Malformed content fails CI, never a player session.
6. **Serializable game state.** Everything the player can lose lives in stores whose contents round-trip through JSON (autosave granularity per GDD §17). Transient render state (camera velocity, in-flight animations) is explicitly outside the save boundary.
7. **The two-systems law is structural.** Translation hints and search hints (GDD §9) live in separate modules with separate state, and share no component, sound, or CSS token — the codebase mirrors the design separation so it cannot erode.

---

## 3. Repository Layout

```
/workspace
├── docs/                          # design authority (existing) + this file
├── content/                       # DATA: validated, engine-agnostic, no code
│   ├── story/                     # existing design .md (authoring refs) + runtime JSON:
│   │   ├── season.json            #   compiled round index (from season.md)
│   │   └── chN-*/chapter.json     #   chapter meta: beats order, rounds, puzzles, case lines
│   ├── scenes/                    # one folder per scene plate
│   │   └── scn-01-gallery-day/
│   │       ├── scene.json         #   plate, prop placements, light pools, pan path
│   │       ├── rounds.json        #   authored round templates (S01 …)
│   │       └── variants/scn-01v-gallery-storm.json   # prop-stack delta + light pass ref
│   ├── dialogue/                  # beat scripts with token slots, one file per beat
│   │   └── chN/bN-M.json
│   ├── vocabulary/
│   │   └── concepts.json          # the Concept Dictionary (~420 rows, LANG §3.2)
│   ├── languages/                 # language packs (LANG §11) — one folder per language
│   │   └── de/ pack.json lexemes.json phrases.json tokens.json calls.json signage.json
│   ├── puzzles/                   # P1–P9 configs (mechanic id + parameters + text refs)
│   └── ui-strings/en.json         # externalized UI strings (GDD §19.4)
├── assets/                        # ART & AUDIO sources (pipeline input, §12)
│   ├── scenes/                    # plates, light passes, FX overlays
│   ├── props/                     # prop sprite families (+ generated alpha masks)
│   ├── characters/                # portrait sets
│   ├── clues/                     # ~40 close-up heroes
│   ├── story/                     # beat illustrations, epilogue panels, title desk
│   ├── ui/                        # notebook, paper stock, map, glyphs, fonts
│   └── audio/                     # music stems, SFX families (no vocab audio in v1 — TTS)
├── src/
│   ├── engine/                    # pure TS game engine (no React)
│   │   ├── types.ts               # shared domain types (single import point)
│   │   ├── rand.ts                # seeded PRNG (mulberry32-class)
│   │   ├── content/               # zod schemas + typed loaders (shared with validator)
│   │   ├── scene/                 # scene model, coordinate math, camera
│   │   ├── render/                # Canvas 2D renderer, layer compositor, FX
│   │   ├── hit/                   # alpha-mask hit testing, dilation, coat-tail
│   │   ├── rounds/                # round-builder + round runtime state machine
│   │   ├── vocab/                 # scheduler: strength, spacing, decay, debrief picks
│   │   ├── hints/                 # search-hint escalation state (Insight)
│   │   └── save/                  # save schemas, saveVersion migrations, event log
│   ├── components/                # shared presentational React (paper/brass primitives)
│   ├── features/                  # one folder per screen/flow (see §6.3)
│   ├── state/                     # zustand stores + persistence middleware
│   ├── services/                  # platform seams (§7)
│   └── app/                       # bootstrap, screen state machine, providers
├── tools/
│   ├── validate-content/          # the validator CLI (§11)
│   └── build-assets/              # asset pipeline (§12)
├── public/                        # pipeline OUTPUT: hashed bundles + manifests (gitignored where generated)
└── e2e/                           # Playwright suites
```

Rules: `content/` and `assets/` import nothing and are imported by nothing — they are read by loaders and the pipeline. `src/engine` may import only `src/engine`. `src/features` may import `engine`, `components`, `state`, `services`. `src/services` is the only home of browser globals.

---

## 4. Content & Data Model

All shapes below are **normative contracts** — zod schemas in `src/engine/content/` are the executable versions; TypeScript types are inferred from them (`z.infer`). IDs are stable forever once shipped (saves depend on them).

### 4.1 Concept Dictionary (`content/vocabulary/concepts.json`) — LANG §3.2

```ts
interface Concept {
  id: ConceptId;                  // "object:key" — grammar: object:<kebab-noun>
  glossEn: string;
  domain: Domain;                 // one of the 12 canonical domains (LANG §3.4)
  tags: string[];                 // semantic-neighborhood tags (decoy rules)
  frequency: 'A' | 'B' | 'C';
  multiFindOk: boolean;
  debriefThumb: AssetId;          // generic concept icon — never a scene prop
  notes?: string;
}
```

### 4.2 Language pack (`content/languages/<lang>/`) — LANG §11

```ts
interface Lexeme {
  conceptId: ConceptId;
  article: string;                // "der"
  word: string;                   // "Schlüssel"
  display: string;                // exact tray-chip string "der Schlüssel"
  pluralDisplay?: string;         // "die Schlüssel"
  gloss?: string;                 // overrides concept.glossEn when EN is ambiguous
  genderGlyph: '▲' | '●' | '■';
  difficulty: 'cognate' | 'transparent' | 'opaque' | 'false-friend';
  trapFlags: string[];            // 'gender-surprise' | 'el-agua-class' | …
  cautionNote?: string;           // gloss-card line for traps (LANG §6.1)
  ttsText?: string;               // SpeechSynthesis respelling override (LANG §7.5)
  ttsTextPlural?: string;
  review: 'PENDING' | 'NATIVE_APPROVED';   // validator gate: all APPROVED to ship
}
interface LanguagePack {
  lang: 'de' | 'es' | 'it';
  locale: string;                 // "de-DE" — TTS locale (LANG §7.2)
  slowRate: number;               // 0.7 ± pack calibration
  articleModule: { articles: string[]; pluralMap: Record<string,string>;
                   debriefOptionSets: ArticleOptionRule[] };   // LANG §11.2–11.4
  lexemes: Lexeme[];
  phrases: DescriptionPhrase[];   // ≤6 words, Conversational+ chips
  tokenBank: TokenBankEntry[];    // L1/L2 garnish + echo forms (LANG §10)
  vendorCalls: string[];          // S14 ambience script
  signage: SignageString[];       // Lantern Quarter overlay strings
}
```

**Adding language N+1 = adding one folder.** No `src/` change; the validator confirms pack completeness against the concept dictionary.

### 4.3 Scene composition (`content/scenes/*/scene.json`) — GDD §7.1, SCENE_COMPOSITION

Scene space = master-plate pixel coordinates (21:9 master, e.g. 3840×1646; ART §6.1). The shipping 16:9 crop, tray-zone and portrait-zone exclusions are declared per scene and checked by the validator.

```ts
interface SceneDef {
  id: SceneId;                    // "scn-01-gallery-day"
  locationId: string; lightState: LightState;    // ART §5
  plate: AssetId;                 // background plate (zero findable detail)
  size: { w: number; h: number }; // master pixels
  crop16x9: Rect;                 // shipping frame within the master
  panPath: PanKeyframe[];         // 5 s establishing pan (skippable)
  props: PropPlacement[];         // the layered prop stack
  overlays: OverlayDef[];         // FG occluders + FX cards (fog, rain, dust, steam)
  lightPass: AssetId;             // grade layer (multiply/screen)
  lightPools: Pool[];             // authored pools — validator contrast anchors + hint regions
  hintRegions?: Region[];         // optional authored stage-1 regions (default: 2×2 quadrants)
}
interface PropPlacement {
  id: string;                     // scene-unique instance id ("p041")
  sprite: AssetId;                // → assets/props manifest (sprite + alpha mask)
  conceptId: ConceptId | 'untagged:ambience';
  x: number; y: number;           // anchor (sprite center) in scene px
  scale: number;                  // 1.0 = authored size (sprites authored at 3×; §12)
  rotation: number;               // degrees
  z: number;                      // draw order; also hit-test priority
  band: 'fg' | 'mg' | 'bg';       // 20°/15°/8° prop-camera band (ART §6.2)
  flipX?: boolean;                // default false; forbidden on no-mirror-flagged sprites
  shadow?: { dx: number; dy: number; blur: number; alpha: number };
  featureZones?: Rect[];          // recognizable-feature zones (occlusion honesty, ART §7.2)
  textZone?: Rect;                // [TXT] props: typography-overlay rectangle (ART §8)
}
interface SceneVariantDef {       // night/storm/ransacked = prop-stack delta (GDD §19.2)
  id: SceneId; parent: SceneId; lightState: LightState;
  plateDelta?: AssetId; lightPass: AssetId; lightPools: Pool[];
  removeProps: string[]; addProps: PropPlacement[];
  moveProps: { id: string; x?: number; y?: number; scale?: number; z?: number }[];
}
```

### 4.4 Round templates (`content/scenes/*/rounds.json`) — GDD §19.2/§19.3

```ts
interface RoundTemplate {
  id: RoundId;                    // "S01"
  sceneId: SceneId; chapter: number;
  mode: 'word-list' | 'silhouette' | 'audio' | 'description' | 'evidence-sweep';
  targetCount: number;            // 8–14, per chapter ramp
  freshConcepts: ConceptId[];     // authored order; Fairness-Charter-passed
  evidenceFind: { propId: string; clueId: ClueId; position: 'last' | 'second-to-last';
                  displayName: LocalizedRef };  // proper-named, no language load
  pluralSlots?: { conceptId: ConceptId; count: number }[];   // "die Flaschen ×3"
  reviewShare: number;            // 0.15–0.40 ramp (LANG §9.1)
  camouflageTargets?: string[];   // ≤2, Charter #6 — validator-checked
  followUpFrom?: RoundId;         // silhouette follow-up rule (LANG §9.3)
}
```

### 4.5 Dialogue & story (`content/dialogue/`, `content/story/`)

```ts
interface Beat {
  id: BeatId;                     // "b1.5"
  chapter: number; followsInto: RoundId | PuzzleId | BeatId | 'chapter-end';
  panels: Panel[];                // ≤90 s total at 180 wpm — validator-estimated
  caseLine: string;               // auto-written CASE tab line (≤14 words)
  peopleFacts?: { characterId: string; fact: string; stamp?: StatusStamp }[];
  flavorChoice?: { dry: LineRef; warm: LineRef };
}
interface Line {
  speaker: string; en: string;    // canonical English
  tokens?: { slot: string; level: 'L1' | 'L2'; nounConcept?: ConceptId }[];
    // token slots filled from the pack's token bank per tier (STORY_BIBLE §3);
    // echo slots receive the round's weakest found nouns at runtime (LANG §8.6)
}
```

Puzzle configs (`content/puzzles/pN.json`) carry `{ id, mechanic, params, hostRound, skipNote }` where `mechanic` keys into the puzzle module registry (§6.3).

### 4.6 Save data — see §9 for schema and `wordRecord` (LANG §13) storage.

---

## 5. The HOG Engine

### 5.1 Scene model

The engine's scene instance is a resolved, immutable composition: plate + resolved prop stack (variant deltas applied) + overlays + light pass, plus a mutable `RoundState`. Resolution happens in `engine/scene/resolve.ts`: `resolveScene(sceneDef, variantDef?) → SceneInstance`. Props are sorted by `z` once; the array index is the draw order and the reverse-iteration order for hit testing.

### 5.2 Rendering — one canvas, layered draw, React never draws props

The scene viewport is a **single `<canvas>` (Canvas 2D)** owned by `engine/render/SceneRenderer`. Draw order per frame: plate → props (z-ascending, skipping found props) → prop shadows inline → overlay occluders → FX cards → light pass (`multiply`/`screen` via `globalCompositeOperation`) → hint effects (Hint Gold family only — UX §9.2) → nudge shimmer. The renderer:

- is `devicePixelRatio`-aware; draws only on dirty state (camera moved, prop found, FX tick) — a static scene burns no CPU;
- decodes sprites via `createImageBitmap` with `resizeWidth` matched to placement size × 3 (max zoom), never at full authored resolution (§14);
- exposes `sceneToScreen`/`screenToScene` transforms consumed by React overlays (word cards, fly-to-tray animation start points, mini-map viewport rect);
- implements reduced-motion variants (fade instead of fly; hard clamp instead of rubber-band) from a single `motionPolicy` flag (UX §17/§18).

**Why not React/DOM for the scene:** 40–110 sprites re-transforming at 60 fps during pinch-zoom on a 2019 phone, plus blend-mode light passes, plus per-pixel hit tests, is canvas territory. React renders everything *around* the canvas: tray, chrome, word cards, Debrief, Notebook — all data-driven components.

### 5.3 Hit testing — alpha silhouettes, dilation, coat-tail (GDD §7.1, UX §7.1)

`engine/hit/HitTester` answers `hitTest(screenPt, camera, pointerType) → HitResult`:

1. **Alpha masks** are precomputed at build time (§12): 1-bit bitmaps at ½ sprite resolution, packed as `Uint8Array` rows, shipped in the prop manifest. No runtime canvas readback, no decode stalls.
2. Transform the tap point to scene space; iterate props **z-descending**, skipping found props; test point-in-mask (accounting for placement transform).
3. **Dilation is screen-space and zoom-invariant:** +10 px touch / +6 px pointer (UX tokens). Implemented as a mask lookup within a screen-space disc mapped back to mask space — not by inflating masks.
4. **Occlusion honesty:** the first z-descending mask hit wins; an occluded target's dilated halo extends only from its visible silhouette (test occluders first — a hit on a higher-z prop terminates).
5. **Coat-tail rule:** if nothing hit, search *active targets only* within 12 px screen-space of a silhouette edge; nearest edge wins, z-order breaks ties. No coat-tail for non-targets.
6. Result classes: `target-hit`, `tagged-non-target` (→ shimmer + curiosity reveal at New/Basics), `ambience`, `miss` (→ dust puff), feeding the anti-scrub counter (3 in 2 s → 0.8 s cooldown; scene taps only).

Unit-tested exhaustively with synthetic masks (§13).

### 5.4 Camera — zoom & pan (GDD §7.4, UX §8)

`engine/scene/Camera` is a pure state + math module: `{ scale: 1–3, center, velocity }`, clamped to scene bounds with soft rubber-band (hard clamp under reduced motion). `engine/render/InputController` (the one DOM-adjacent engine adapter) translates Pointer Events into gestures — 8 px tap-vs-pan threshold, pinch, double-tap toggle 1×↔2×, wheel-zoom-at-cursor, inertial flick, edge-glide, keyboard (`+`/`−`/`Z`/`0`/arrows) and **reticle mode** (`F`) which reuses `hitTest` with pointer dilation. Portrait at 1× = fit-height with horizontal pan; landscape 1× = contain-fit, pan locked. The camera emits state for the mini-map (>1.5×), the `1×` reset chip, and off-screen hint edge-arrows. Browser gestures are suppressed inside the scene element only.

### 5.5 Round runtime

`engine/rounds/RoundRuntime` is a state machine over `RoundState`:

```ts
interface RoundState {
  roundId: RoundId; seed: number;
  targets: ResolvedTarget[];        // built list: conceptId|evidence, propIds, plural count
  found: Record<string, FoundRecord>;         // per target: timestamp, assist class
  flippedThisRound: ConceptId[];    // translation-assist transient (LANG §13.1)
  hintStages: Record<string, 0|1|2|3>;        // banked per target
  insight: number;                  // 0–3 charges
  activeSearchMs: number;           // input within last 20 s counts (hint regen)
  mistapWindow: number[];           // anti-scrub
}
```

Events (`find`, `flip`, `hintStage`, `mistap`, `nudge`) are pure reducers; every state-changing event is appended to the save event log (§9) — that *is* the autosave. The runtime computes exposure events for the scheduler (unaided/assisted/revealed find — LANG §8.1) and drives round completion → results stamps → Debrief handoff.

### 5.6 Round-builder & vocabulary scheduler

- `engine/rounds/buildRound(template, sceneInstance, wordRecords, packLexemes, seed, recentRounds)` implements LANG §9: 1 evidence slot + review slots (urgency-ordered due words with a depicting prop in this pool) + fresh slots from the template, under all seven constraints (no-stale-repeat, domain spread ≥3, decoy neighborhood ≥3 via tags, German article variety, tier presentation applied last, deterministic by seed).
- `engine/vocab/scheduler.ts` implements strength (0–5, event weights per LANG §8.1), spacing stages S0–S5 in rounds-elapsed, **lazy exponential decay** computed on read (half-life by stage; LANG §8.4), band/pip projection, Debrief item selection (priority + weakest-channel item type; article-pick weights per language), cold-open review boost, and echo-candidate output (two weakest found nouns → dialogue token slots).
- Both are pure and heavily unit-tested; they are the pedagogy — treat regressions here as release blockers.

Insight/hint escalation (`engine/hints/`) holds the three-stage-per-target ladder, charge economy (+1 per Debrief hit banked to cap, +1 per 3 min active search), and the 90 s auto-nudge timer (Purist-mode gated). It shares nothing with the translation-flip code path (Principle 7).

---

## 6. Application Shell — State, Screens, Features

### 6.1 Screen state machine

`src/app/screens.ts` defines the UX §2 map as a typed state machine: `boot → title → (newCase: language → proficiency → coldOpen) → inGame(map | search | beat | puzzle | debrief | results | clueCloseup) + overlays (notebook, settings)`. Transitions are the only way to change screens. `NavigationService` (§7.5) mirrors it onto the History API so browser back = in-game back and refresh restores the exact screen from the save.

### 6.2 Stores (`src/state/`)

Zustand stores, one per domain, all JSON-serializable: `caseStore` (slots, active case, chapter/beat/round position), `roundStore` (mirrors `RoundState`), `vocabStore` (word records, per-case), `notebookStore` (CASE lines, PEOPLE facts/stamps, CLUES pins/strings, WORDS journal), `settingsStore`, `uiStore` (screen machine state, overlay flags — not saved except screen position). A persistence middleware forwards every mutation-with-save-consequence to `SaveService` as an event (§9). Engine modules receive plain state and return new state; stores never leak into `src/engine`.

### 6.3 Features (`src/features/`) — one folder per surface, no cross-imports except via `state`/`engine`

`title/` · `onboarding/` (language, proficiency, cold open) · `map/` · `search/` (viewport host, Find List, chrome, word card, hint UI, mini-map) · `debrief/` (+ results card, chapter recap) · `dialogue/` (beat runner: reading-speed reveal, tap-to-complete, gloss popovers, flavor choices) · `notebook/` (4 tabs + Board Reviews) · `clue-closeup/` · `puzzles/` (shell + registry) · `settings/` · `purchase/` (the Pettibone letter) · `epilogue/` · `sprint/` (post-completion only).

**Puzzle registry:** each of the 8 mechanics (torn-paper, combination, pairs, cipher wheel, silhouette sort, light-sequence, ratio mix, logic grid, clock hands) is a self-contained module implementing:

```ts
interface PuzzleModule {
  mechanic: string;
  Component: React.FC<{ config: PuzzleConfig; onSolved(): void; onSkipAvailable(): void }>;
  validateConfig(config: unknown): PuzzleConfig;   // zod
}
```

The shell provides framing, the skip fail-safe (2 fails or 3 min), tap-alternatives for drag, and reset — modules provide only the mechanic. Nine puzzles = nine config files + eight modules, individually assignable to agents.

**Find List / chips:** a single `WordChip` component renders all chip variants (word, gloss-visible, phrase, audio-only, silhouette, evidence, plural tally, flipped gloss card) purely from a `ChipModel` computed in `engine/rounds/present.ts` (tier presentation). No tier logic in JSX.

---

## 7. Services & Platform Seams

All in `src/services/`, each an interface + browser implementation + test fake.

### 7.1 `SpeechService` — the provider seam (LANG §7)

```ts
interface SpeechService {
  speak(req: { conceptId: ConceptId; form: 'singular' | 'plural'; speed: 'normal' | 'slow' }): SpeakHandle;
  cancel(): void;                                  // new utterance cancels in-flight
  voiceStatus(): 'ready' | 'pending' | 'unavailable';
  onStateChange(cb: (s: SpeechState) => void): Unsub;
}
```

v1 implementation: SpeechSynthesis with the voice-selection ladder (player choice → local exact-locale → default-flagged → primary-subtag → degradation), persisted per case slot, re-run silently on `voiceschanged`; `ttsText` overrides applied; rate 1.0 / pack-calibrated slow; unlock piggybacks the session's first user gesture. Degradation flags flow to UI (disabled speaker affordances, audio-only chips fall back to word chips — LANG §7.5). The post-v1 recorded-audio provider implements the same interface per lexeme with synthesis fallback; **no caller may know which provider is speaking** (UX §10.1).

### 7.2 `AudioBus` — §10. &nbsp; 7.3 `StorageService` — idb wrapper, `navigator.storage.persist()` at first save; §9.
### 7.4 `AssetService` — manifest-driven loader/prefetcher; §12. &nbsp; 7.5 `NavigationService` — History API adapter for the screen machine.
### 7.6 `TelemetryService` — anonymous aggregate events (GDD §21), local queue, flush-when-online, opt-out; never blocks offline play; carries only band counts/rates, never per-word history.

---

## 8. Localization Architecture

Two entirely separate surfaces, by design (GDD §19.4):

1. **UI strings** — English-only v1, but externalized from day one in `content/ui-strings/en.json` with typed keys (`t('search.hintEmpty')`). No literal player-facing string in JSX (lint rule). UI localization later = adding files, not refactoring.
2. **Learning content** — the concept dictionary + language packs (§4.1–4.2). The renderer of any vocabulary surface receives a resolved `Lexeme` (display string, glyph, gloss, caution) — components never construct language strings. Article+noun is one unit everywhere (LANG §4.1); the sole bare-noun surface is the Debrief article pick, which the Debrief feature owns explicitly.
3. **Scene-level localization** — Lantern Quarter signage overlays are per-language image layers named in the pack's `signage.json` and composited by the renderer above the plate; the sole art surface that varies by study language (STORY_BIBLE §3).
4. **Dialogue token slots** — beat lines carry `L1`/`L2` slots; the beat runner fills them from the pack's token bank per proficiency tier, with tap-to-gloss popovers logging passive exposure. Deleting all tokens must leave lines comprehensible — validator-linted (§11).

---

## 9. Save System & Offline-First

### 9.1 Storage layout (IndexedDB via `idb`)

```
db "case-and-seek" (dbVersion = saveVersion)
├── profile        { profileId, createdAt, settings }        // settings shared across cases
├── cases          { caseId, lang, proficiency, chapter, screenPos, roundSeed,
│                    saveVersion, updatedAt }                 // one row per case slot
├── wordRecords    key [caseId, conceptId] → WordRecord       // LANG §13 shape, verbatim
├── exposureLog    append-only { caseId, seq, event, conceptId, roundId, ts }
├── roundState     key caseId → serialized RoundState (mid-round resume)
└── notebook       key caseId → CASE lines, PEOPLE facts, CLUES pins, WORDS journal meta
```

### 9.2 Rules

- **`saveVersion` + forward migrations from day one.** `engine/save/migrations.ts` is an ordered registry `v(n)→v(n+1)`; opening a save runs pending migrations before load; downgrade is refused with export offered. Migration tests are mandatory for every schema change (§13).
- **Event-granularity autosave** (GDD §17): every find, flip, hint stage, Debrief answer, beat completion writes synchronously-ordered events (batched with `requestIdleCallback`, flushed on `visibilitychange`/`pagehide`). Closing the tab mid-flight loses at most the current uncommitted animation, never a find.
- **Deterministic resume:** `roundSeed` + exposureLog position rebuild the identical round (Principle 3). Refresh restores the exact screen via `cases.screenPos`.
- **Case slots are islands:** word records are per case (German strength never touches the Italian case); settings are the only shared state.
- **Export/erase:** JSON export of a full case slot from Case Files; delete requires the typed-confirmation flow (UX §3).
- **Sync-readiness (v1 ships local-only sync-*ready*):** the data model already satisfies the merge contract — per-concept `max(strength)`, summed counters, higher `spacingStage`, later timestamps (LANG §13.2); story position conflicts surface a keep-which picker. The sync transport itself is a post-v1 service behind `SyncService`.
- **Offline:** `vite-plugin-pwa` precaches the app shell; chapter bundles (§12) are runtime-cached; chapter N+1 prefetches during N; "Pack for travel" forces the next bundle with the pencil-ring progress UI. Rounds are reachable only when fully cached (UX §20.2).

---

## 10. Audio Architecture

`AudioBus` (WebAudio) has three channels: **music** (chapter stems, location layers, crossfade), **sfx** (material-family found sounds, notebook/paper/stamp family, lens chime), **voice-duck trigger**. Vocabulary speech is SpeechSynthesis and cannot route through WebAudio, so ducking is event-driven: `SpeechService` emits utterance start/end; the bus side-chains music −6 dB with 80 ms attack / 400 ms release (GDD §16). SFX are not ducked. One vocabulary utterance at a time (cancel-on-new). All audio unlocks on the session's first gesture; every playback surface renders its visual twin (ink ripple) from the same events — audio is a channel, never a gate. Sound assets ship per-chapter in the asset bundles; SFX families are keyed by the prop's material tag in the manifest.

---

## 11. Content Validator

`tools/validate-content/` — a Node CLI (`npm run validate:content`), sharing the zod schemas in `src/engine/content/`. Runs in CI (blocking), as a pre-commit option, and in dev via a Vite plugin (warn overlay). Three layers:

1. **Schema layer** — every file parses against its schema; IDs match their grammars; no unknown keys.
2. **Cross-reference layer** — every `conceptId` in scenes/rounds/dialogue exists in the dictionary; every concept has a lexeme row in every pack (and all rows `NATIVE_APPROVED` for a release build); every `clueId`, `beatId`, `roundId`, `puzzleId`, `AssetId` resolves; season round index ↔ scene rounds ↔ chapter files agree; silhouette follow-up rule (≥4 shared concepts); mode placements match GDD §14.
3. **Design-rule layer (Fairness & pedagogy lint)** — static checks:
   - target visible size ≥ 0.9% scene width at 1× (mask bbox × scale); edge safety 4%; tray-zone (bottom 18%) and portrait-zone exclusions (Charter #1, #4, SCENE_COMPOSITION rule 2);
   - occlusion estimate ≤ 60% (mask overlap of higher-z placements) + ≥1 feature zone visible (Charter #2);
   - contrast floor (Charter #3): render-assisted — the tool composites plate+props+light pass via `sharp` and measures target-vs-surround luminance/chroma separation; night scenes verified inside declared pools;
   - decoy neighborhood ≥3 per target (tag match in the scene pool); ≥60% template disjointness per scene; no camouflage+heavy-occlusion combos; camouflage ≤2/round;
   - target counts vs chapter ramp; review-share ramp values; plural slots only for `multiFindOk` concepts with ≥3 depicting props; German template gender balance;
   - beat length ≤90 s at 180 wpm; ≤1 token per line (L1) / ≤2 per beat (L2); tokens never on `caseLine`/clue text; CASE lines ≤14 words;
   - domain distribution 20–55 per domain; frequency shares (A ≥55%, C ≤10%) over taught targets;
   - no-mirror flags respected (no `flipX` on flagged sprites); Hint Gold absent from asset palettes (histogram check, ART §4.2).

Output: human-readable report + JSON for CI annotations; `--strict` (release) vs `--dev` severity profiles. What cannot be checked statically (semantic typicality, comic TTS prosody) is listed in the report as a manual QA queue.

---

## 12. Asset Pipeline

`tools/build-assets/` transforms `assets/` (source, PNG/PSD-exported) into `public/` (shipping, hashed):

1. **Encode:** all raster art → **WebP** (quality-tiered: plates q80, props q85 lossless-alpha where needed, thumbnails q70). AVIF is a post-v1 flag; no PNG fallback (all supported browsers ship WebP).
2. **Resolution variants:** plates at 1× and 2× DPR variants; props authored at 3× placement size (ART §6.1) and shipped at authored resolution — the renderer decodes to display size (§5.2), so no prop variants needed.
3. **Alpha masks:** for every prop sprite, extract a 1-bit mask at ½ resolution (`sharp` threshold α > 8), pack binary, emit alongside the sprite. Hit testing never decodes image pixels at runtime.
4. **Manifests:** per-chapter `chapter-N.manifest.json` — every asset URL + bytes + hash the chapter's scenes/beats/puzzles need (scene JSON declares its assets; the tool walks references). The service worker and the prefetcher consume manifests; the "Pack for travel" ring is `bytesLoaded/bytesTotal`. Target ≤ 25 MB/chapter (GDD §17) — the tool **fails the build** when exceeded.
5. **Lazy loading:** `AssetService` loads a scene's assets on location entry (already cached in normal flow via chapter prefetch), decodes progressively (plate → mg/fg props → bg props → FX), and evicts decoded bitmaps of scenes two hops away (LRU by scene).
6. **Audio:** music/SFX → opus in ogg (+ m4a for Safari), listed in manifests.
7. **Fonts:** the three faces + dyslexia-friendly alternative, subset to de/es/it diacritic coverage (validator cross-checks pack character inventory vs font coverage).

---

## 13. Testing Strategy

| Layer | Tool | What (non-exhaustive, release-gating) |
|---|---|---|
| **Unit** (`src/**/*.test.ts`) | Vitest | Scheduler math (strength events, decay half-lives, stage ladders, band promotion incl. proof requirement); round-builder determinism (same seed ⇒ identical list) + all 7 constraints; hit-test geometry (masks, z-order, dilation zoom-invariance, coat-tail ties); camera clamping/fit rules; save migrations (every version pair, forward-only); tier presentation matrix; Debrief selection priorities; article option-set rules per pack |
| **Integration** (`src/features/**`) | Vitest + Testing Library, fake services | Search flow: find → word card → chip fold → autosave event emitted; flip logs assist; two-hint-systems separation (no shared handlers/tokens — also a static lint); Debrief flows incl. miss-warm-correction; beat runner reveal/skip/gloss; Notebook tab data binding; puzzle shell skip fail-safe; onboarding tier previews |
| **Content** | Validator (§11) in CI | The whole content corpus, `--strict` on release branches |
| **E2E** (`e2e/`) | Playwright | The UX §22 checklist automated where possible: title→gameplay in one input with a save; New Case → first find ≤ 2:00 (scripted taps, timed); mid-round reload restores exact state (found chips, banked hints, zoom); browser back = in-game back; offline round completion (SW cached, network disabled); keyboard-only round via reticle mode; rotation mid-round preserves state; reduced-motion audit (no fly/iris animations); viewport matrix at 390×844 ★, 844×390 ★, 768×1024 ★, 1440×900; no timer UI reachable pre-completion (selector sweep) |
| **Perf** | Playwright + CDP traces | §14 budgets on a throttled profile (4× CPU, Fast 3G first-load) |

CI (GitHub Actions): `tsc --noEmit` → ESLint → unit → validator → build (incl. bundle-size gates) → integration → Playwright (chromium + webkit) → perf smoke. All blocking.

---

## 14. Performance Budgets

| Budget | Target | Enforced by |
|---|---|---|
| JS bundle (app shell, gz) | ≤ 300 KB | build gate |
| First interactive (mid phone, cold, Fast 3G) | ≤ 3 s shell / ≤ 5 s into title art | Playwright perf smoke |
| Scene enter → searchable (assets cached) | ≤ 2 s (plate visible ≤ 700 ms, progressive props) | perf smoke |
| Pan/zoom frame rate | 60 fps target, 30 fps floor on 4× throttle | CDP trace assert |
| Hit test latency | < 4 ms worst case (110 props) | unit benchmark |
| Decoded image memory per scene | ≤ 160 MB (decode-to-display-size + LRU eviction) | runtime assert in dev |
| Chapter bundle | ≤ 25 MB | pipeline build gate |
| Save event write | ≤ 8 ms p95, batched | unit benchmark |

---

## 15. Parallel Implementation Plan

### 15.1 Contracts first

Workstream 0 lands the skeleton everything else compiles against: Vite scaffold, CI, `engine/types.ts`, all zod schemas (§4), service interfaces (§7), store shapes (§6.2), the screen machine, test fakes, and **golden sample content** (one scene [SCN-00], one round [S00], 20 concepts, a 20-row slice of each language pack, beats B1.1–B1.2, one puzzle config). Every other workstream builds and tests against the golden set; content production scales it later.

### 15.2 Workstreams (independent after WS-0; interfaces are the only coupling)

| WS | Scope | Depends on |
|---|---|---|
| 0 | Scaffold, schemas, contracts, fakes, golden content, CI | — |
| 1 | `engine/scene` + `engine/render` + `engine/hit` + camera/input (the viewport) | 0 |
| 2 | `engine/vocab` scheduler + `engine/rounds` builder/runtime + hints | 0 |
| 3 | `engine/save` + `StorageService` + persistence middleware + PWA/offline | 0 |
| 4 | `SpeechService` + `AudioBus` (+ degradation states) | 0 |
| 5 | `features/search` (Find List, chrome, word card, hint UI, mini-map) | 1, 2 (fakes until ready) |
| 6 | `features/debrief` + results + recap; `features/dialogue` + gloss system | 2, 4 |
| 7 | `features/notebook` (4 tabs, Board Reviews) + map + clue close-up | 3 |
| 8 | Puzzle shell + 8 mechanic modules (subdividable per mechanic) | 0 |
| 9 | Title/onboarding/settings/purchase/epilogue/sprint | 3, 4 |
| 10 | Validator CLI + asset pipeline + manifests | 0 (schemas) |
| 11 | Content production: scene JSON, round templates, dialogue JSON, packs (from docs/content .md) | 10 |

Rules of engagement: no workstream edits another's folders; contract changes go through WS-0 files with an ADR note (§16); every WS ships with its tests; UI workstreams develop against fakes and the golden content, so nothing serializes on art or full content.

### 15.3 Integration order

0 → (1,2,3,4,8,10 in parallel) → 5,6,7,9 → 11 scales content → E2E hardening on the full Chapter 1 vertical slice (S00–S04 + P1), which is the first playable milestone and the ≤2:00 onboarding release gate.

---

## 16. Decision Log

| # | Decision | Rationale (full text in section) |
|---|---|---|
| A1 | Canvas 2D scene renderer, no game framework | §1, §5.2 — payload, pixel access, control |
| A2 | React for all non-scene UI; content-driven components only | §2 P2 |
| A3 | Zustand + zod + idb as the only runtime state/validation/storage deps | §1 |
| A4 | Precomputed ½-res 1-bit alpha masks for hit testing | §5.3, §12 |
| A5 | Screen-space, zoom-invariant hit dilation; 12 px coat-tail, targets only | §5.3 (UX §7.1) |
| A6 | Seeded PRNG everywhere; deterministic round rebuild | §2 P3 |
| A7 | SpeechSynthesis v1 behind `SpeechService` seam (LANG §7 amendment honored; UX source-agnostic playback preserved) | §7.1 |
| A8 | Event-log autosave with `saveVersion` + forward migrations; IndexedDB | §9 |
| A9 | Language packs as pure content drops; adding a language touches zero code | §4.2, §8 |
| A10 | Validator = schemas + cross-refs + static Fairness/pedagogy lint, CI-blocking | §11 |
| A11 | WebP-only art, per-chapter manifests ≤ 25 MB, lazy decode-to-display-size | §12 |
| A12 | No router; custom screen machine + History adapter | §1, §6.1 |
| A13 | Puzzles as registry modules behind one shell interface | §6.3 |
| A14 | Translation-hint and search-hint code paths structurally separated | §2 P7 |

---

*End of architecture. Implementation agents start at §15.1 (Workstream 0). This document, beneath the five design authorities, governs all technical decisions; changes to §16 decisions require an ADR entry here.*
