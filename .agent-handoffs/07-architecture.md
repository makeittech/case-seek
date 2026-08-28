# Status
DONE

## Outputs
- `/workspace/docs/ARCHITECTURE.md` — technical source of truth, 16 sections + decision log, ready for parallel implementation agents.

## Key decisions
- **Stack:** React 18 + TypeScript (strict) + Vite. Only runtime deps: zustand, zod, idb, vite-plugin-pwa. Rejected: PixiJS/Phaser, react-router, redux, i18next, Howler (rationale in §1).
- **Engine vs content:** `src/engine` is pure TS (no React); all content is validated JSON in `content/` (story, scenes, dialogue, vocabulary, languages, puzzles) + `assets/` (scenes, props, characters, clues, story, ui, audio). Adding a scene/language/chapter touches zero `src/` files. No hardcoded React trees — enforced by lint/review rules (§2).
- **HOG engine:** single Canvas 2D viewport; layered prop stacks `{x, y, scale, rotation, z, band}`; hit areas from precomputed ½-res 1-bit alpha masks with zoom-invariant screen-space dilation (+10/+6 px) and 12 px coat-tail; props tagged with semantic concept IDs; variants as prop-stack deltas. Camera: 1–3× zoom, clamped inertial pan, reticle keyboard mode.
- **Determinism:** seeded PRNG; round-builder/scheduler pure functions — resumed rounds rebuild identically.
- **Localization:** typed UI strings (en, externalized) + language packs as pure content drops; TTS via `SpeechService` seam (SpeechSynthesis v1, voice ladder, recorded-audio upgrade path).
- **Save:** IndexedDB, `saveVersion` + forward migrations, event-granularity autosave, per-case word records, offline-first PWA with ≤25 MB chapter bundles.
- **Validator CLI:** schemas + cross-refs + static Fairness Charter/pedagogy lint, CI-blocking.
- **Asset pipeline:** webp, per-chapter manifests, lazy decode-to-display-size, mask extraction.
- **Tests:** Vitest unit/integration, content validation, Playwright E2E automating the UX §22 checklist; perf budgets (§14).
- **§15:** 12 parallel workstreams, contracts-first (WS-0 golden content), Chapter 1 vertical slice as first milestone.

## Verification
- Cross-checked against all five design docs; LANG §7 TTS amendment honored via provider seam; UX tokens and GDD fairness values carried verbatim. Docs only — no code written.

## Blockers
NONE
