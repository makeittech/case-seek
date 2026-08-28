# Status
DONE — full campaign playable end-to-end; build, unit/integration tests, and e2e all green.

## Outputs
The complete game on branch `feat/case-and-seek-cd51`:

- **Engine** (`src/engine/`, pure TS, no React): seeded PRNG (`rand.ts`), zod content schemas + loader with variant resolution (`content/`), camera with contain-fit/zoom 1–3×/clamped pan (`scene/camera.ts`), Canvas 2D renderer with webp plate/prop loading and glyph fallbacks (`render/SceneRenderer.ts`), pointer gesture adapter — tap/pan/pinch/wheel/double-tap/inertia (`render/InputController.ts`), alpha-mask hit testing with zoom-invariant dilation + 12 px coat-tail (`hit/`), round builder + runtime state machine (`rounds/`), spaced-repetition vocab scheduler (`vocab/scheduler.ts`), save migrations (`save/migrations.ts`).
- **Services** (`src/services/`): `SpeechService` (SpeechSynthesis, voice ladder, recorded-audio seam), `StorageService` (IndexedDB via idb, `saveVersion`, memory fake for tests), `AudioBus`.
- **App layer** (`src/app/`): flow controller over `season.json`, round orchestration (`roundFlow.ts`), story/beat flow, debounced event-granular autosave (`persist.ts`), boot/new-case/continue/delete.
- **UI** (`src/ui/`): title (Continue/New Case/Case Files), language + proficiency select, beat dialogue with garnish tips + flavor choices, map, the search screen (canvas + find-list tray + word cards + 3-stage hints + insight meter + zoom controls), results + stamps, Margo's debrief (3 item types), recap, clue close-up, board reviews, 9 puzzle mechanics + shell, finale accusation, epilogue, notebook (CASE/PEOPLE/CLUES/WORDS), settings. Noir/paper design system in `styles.css`, responsive + reduced-motion + aria labels throughout.
- **Content** (`content/`): 206 concepts; de/es/it language packs with articles, plurals, cognate flags, cautions; 19 scenes + 3 variants (~60–80 layered props each); 29 round templates (S00–S28 incl. evidence sweeps); full season flow — 45 beats, 24 clues, 6 board reviews, 6 puzzles, finale deduction, epilogue; generators in `tools/content-gen/`.
- **Validator** (`tools/validate.ts`): schema + cross-ref + design-rule checks; runs first in `npm run build`, fails the build on broken refs.
- **PWA**: app shell precached (~1.5 MB); the ~280 MB art library is runtime-cached (CacheFirst) as scenes are visited.

## Verification (all passing)
- `npm run build` — validator + `tsc --noEmit` (strict) + vite build.
- `npm run test` — 81 Vitest tests in 13 files: engine units (rng, camera, masks/hit, scheduler, round runtime, migrations, storage), content integration (full tree load, every round builds to size, presentation per tier), a **full-campaign simulation** (S00→epilogue through the real flow/orchestration/save layers), save/resume, and React onboarding smoke.
- `npm run test:e2e` — 3 Playwright tests: **Spanish full smoke** (new case → notebook tabs → S00 played to completion on the real canvas with evidence pin → results → debrief → story continues into b1.2/S01 → reload resumes mid-search with progress intact), **German + Italian smokes** (first beat → search loads with 8–14 chips → zoom → one real find). Chromium is installed via `npx playwright install chromium`.
- `npm run lint` / `npm run typecheck` — clean, `--max-warnings 0`.

## Notable fixes made during test hardening
- `buildRound` now pads the find list from remaining depictable scene concepts when review + authored fresh concepts fall short (early campaign), so every round hits its authored target count.
- `hitTest`: untagged ambience dressing is now transparent to real objects beneath it — a higher-z decoration could previously make a target unfindable (caught by the Spanish e2e on `p-office-hat-1` under `amb-office-6`; the round was uncompletable).
- Search screen exposes `window.__caseSeekTest` (verified-tappable target coordinates, filtered through `document.elementFromPoint`) so e2e drives the genuine canvas → gesture → hit-test pipeline.

## Handoff criteria check
- `npm run build` passes ✔ unit tests pass ✔
- New Case → Español → first search → find objects → story continues: proven by the Spanish e2e and the campaign integration test ✔

## Blockers
NONE

## Notes for future work
- Art integration is live: scene plates and prop webps load from `/assets/...` when present, with generated-glyph fallback. New art drops need no code changes.
- Recorded audio can replace TTS behind `SpeechService` without touching call sites.
- The main JS chunk is ~1.5 MB minified (content JSON is bundled); if it grows, split chapter dialogue/scenes into lazy-loaded chunks.
