# Status
DONE — principal-engineer architecture review of Case & Seek, with every finding **implemented** (not just noted), committed in reviewable slices, and the full pipeline green.

## Verification (final state, all passing)
- `npm run lint` — 0 errors/warnings (`--max-warnings 0`, src/tools/e2e)
- `npm run typecheck` — clean (strict)
- `npm test` — 81/81 in 13 files
- `npm run build` — validator + tsc + vite; **main chunk 341 KB min / 103 KB gz** (was 1,610 KB / 228 KB)
- `npm run test:e2e` — 7/7 (smokes ×3, console hygiene ×3-in-1, axe audit, Spanish full playthrough with mid-round reload), re-run after every slice
- `npm run test:campaign` — full 88-node campaign (29 rounds, 9 puzzles, 39 beats, accusation, epilogue) passes in 7.2 min against the production preview, both with and without the content nudges (the previously stalling Museum Archives rounds S04/S21 complete)

## What was found and fixed

### 1. Weak typing at the persistence boundary (commit `5a02752`)
`putRoundState`/`getRoundState` traded in `Record<string, unknown>` with `as unknown as` casts on both the write (persist.ts) and read (roundFlow resume) sides; `CaseRow.screen` did the same dance through `savedScreenOf`; profile settings hydrated via `as Record<string, never>`.
- `StorageService` now owns the persisted shapes: `SavedRound` (roundId/sceneId/RoundState), `SavedScreen` (structural, so services stay UI-agnostic), `SettingsData` (which `SettingsState` extends). All the double-casts are gone; the single remaining narrow lives in `savedScreenOf`, which now **validates `kind` against SAVED_KINDS** before trusting an IDB row.
- Settings hydrate sanitizes unknown/mistyped keys from old saves.
- `roundStore.mode` is `RoundMode` (was `string` + `as 'word-list'` casts in two files); `difficultyOf` reuses the scheduler's `Difficulty` instead of re-inlining the union.

### 2. Fragile state (same commit)
- `flush()` cleared each dirty flag **before** its write; a failed IndexedDB write was silently dropped. It now snapshots the flags, clears them, and merges the snapshot back on failure so the next save event (or pagehide) retries.
- `roundStore` carried `hintPickerOpen` (written from roundFlow, **never read** — the picker is component-local state) and `demoHintDone` (never referenced) — both deleted. `reset()` had already drifted from the field list (it forgot `demoHintDone`); it now spreads one `initial` const so that bug class is gone.
- Not a bug, checked deliberately: insight starting full each round matches GDD §9.2 ("Starts each round full"); the `bankedInsight` no-op in `skipDebrief` is vestigial spec surface, left alone as a design question, not an engineering one.

### 3. Giant component (commit `3de1468`)
`SearchScreen.tsx` was 642 lines mixing renderer lifecycle, hit-testing (duplicated twice), the e2e hook, and five overlays. Now `src/ui/screens/search/`:
- `useSceneCanvas` — camera/renderer/InputController lifecycle + the tap → hit-test → roundFlow → FX pipeline
- `SearchHud`, `WordCardOverlay`, `HintPicker`, `EvidenceOverlay`, `IntroCards`, `FindTray` — one overlay each, subscribing to the stores they need
- `testHook.ts` — `window.__caseSeekTest` install/uninstall
- `hitProps.ts` — `toHitProps`/`taggedPropIds`/`HIT_DILATION_PX`, replacing the RenderProp→HitProp block that existed twice
- `glyphs.ts` — domain tints + fallback glyphs + `spriteIdFor`
DOM structure, testids, and aria labels are unchanged; all 7 e2e specs pass on the split.

### 4. Duplicated logic (same commit)
- `nounDisplay(lx)` (engine/content/loader) replaces eight hand-rolled `` `${lx.article} ${lx.word}` `` sites across present, roundFlow, speak, storyFlow, Pairs, Notebook, IntroCards.
- Latent divergence fixed: the `RenderProp.sprite` field defaulted to `prop-<concept-noun>` while the sprite-cache request defaulted to `prop-<propId>`. All 532 content props set `sprite` explicitly so nothing changed at runtime, but the two fallbacks now agree (schema-documented form).

### 5. Asset memory (commit `b34c873`)
The sprite cache never evicted: each entry pins a decoded 256×256 RGBA canvas (~262 KB) + hit mask, ~30–80 props per scene, 19 scenes — a full-campaign session accumulated hundreds of MB. `pruneSpriteCache(keep)` runs on scene entry and bounds the cache to the active scene; evicted art reloads on demand from the service-worker CacheFirst art cache.

### 6. Loading (commit `bfb77a2`)
The eager content glob lived in `loader.ts`, imported statically by every screen, so ~1.3 MB of content JSON shipped inside the main chunk (the split seam 08-engineering predicted). The glob moved to `engine/content/source.ts`, reached only via dynamic import in `app/content.initContent()`, awaited by `boot()` in parallel with `storage.init()`.
- Main chunk 1,610→341 KB min (228→103 KB gz); content is its own chunk and caches independently of app code (content-only changes no longer bust the app chunk, and vice versa).
- `db()` stays synchronous after boot. Engine tests import `loadContent` from `source`; app-level suites `await initContent()` in `beforeAll`. The validator CLI (`buildContentDB` + fs) is untouched.

### 7. Accessibility (commit `3b0d053`)
Dialogs had `role="dialog"` but no modal semantics, no focus management, no Escape.
- New `useModal` hook: initial focus (optionally targeted, e.g. the pin/next buttons), Tab wrapping, Escape-to-close, focus restore on unmount. Wired into notebook, settings sheet, hint picker, evidence card, and intro cards, all now `aria-modal="true"`. The evidence card deliberately has no Escape (the pin is a required story beat). Overlays were split so the hook mounts only with the dialog.
- Find feedback now reaches screen readers: found counter `aria-live="polite"`; word card, curiosity slip, and steady toast `role="status"`.
- The axe e2e audit stays clean.

### 8. Fairness regression the pipeline couldn't see (commits `ee69126`, `29c3951`, `9dbb40a`)
Chasing a full-campaign stall (Museum Archives 9/10, the stool never findable) surfaced three layered problems:
- **The e2e hook lied about occlusion** (`ee69126`). `remainingTargets()` passed an **empty `taggedIds`** to `hitTest`, so higher-z tagged props were treated as see-through ambience: the hook reported page points as tappable that a real tap resolves to the occluder (shimmer, no find) — an unfixable stall for the driver. It now uses the same `taggedPropIds()` as the live tap path, and samples the target's **own silhouette cells center-out** instead of a fixed offset spiral, so anything a determined player could tap is eventually reported. Plus a race fix in `findAllTargets` (the last find swaps search→results on a timer between two checks).
- **The validator never implemented its own spec** (`29c3951`). ARCH §11 promises "occlusion estimate ≤ 60% (mask overlap of higher-z placements)"; no such check existed, and ten targets (one an evidence find) sat up to **80% buried** under higher-z tagged props — untappable where covered, per occlusion honesty. New `tools/gen-prop-masks.py` bakes every prop webp's alpha silhouette into `tools/prop-masks.json` (64×64 bit grids mirroring the runtime sprite fit + mask threshold, content-hashed for staleness detection); `tools/validate.ts` replays the exact HitTester transform over resolved scenes (variants included): every tagged prop (any can become a review-pool target) and every round-required clue prop must keep ≥40% visible (error; warn <45%), with per-occluder coverage in the message. `spriteIdFor` moved to `engine/content/loader` — a content contract, not a UI detail.
- **Twelve placements fixed** (`9dbb40a`) by exhaustive-search nudges (≤60 px) constrained to: 4% edge safety, light-pool membership preserved, z follows y, and **no other findable prop in any affected scene/variant regresses**. Variant-only burials move via the variant's `moveProps`/`addProps` so parents stay untouched. Validator now clean of fairness errors and warnings.

## Commits (this review)
`5a02752` typed persistence · `3de1468` SearchScreen decomposition · `b34c873` sprite eviction · `bfb77a2` content code-split · `3b0d053` a11y modals + live regions · `ee69126` honest e2e hook · `29c3951` occlusion validator · `9dbb40a` placement fixes

## Blockers
NONE

## Notes for future work
- `useModal` wraps Tab but doesn't fence `focus()` calls from outside — fine for these overlays; revisit if a dialog ever hosts async-injected content.
- The canvas itself is still pointer-only; the reticle keyboard mode from ARCH §5 remains the one open a11y feature (11-qa's assessment unchanged).
- `pruneSpriteCache` keys off scene entry; if a future overworld preloads neighboring scenes, switch the `keep` set to the union of active + preloaded.
- Content chunk is one file (~125 KB gz). Per-chapter splitting is possible with the same source-module pattern if it ever matters; today it loads in parallel with boot and is precached by the SW anyway.
- `tools/prop-masks.json` must be regenerated when prop art changes (`python3 tools/gen-prop-masks.py`, needs Pillow — same dep as the art pipeline). The validator detects stale/missing masks via content hash and **warns** rather than failing the build, so art iteration is never blocked; regenerate before trusting fairness numbers.
- The occlusion check covers prop-vs-prop burial. The remaining Charter automation gaps (contrast floor, decoy neighborhoods, feature-zone visibility) still have no tooling — same status as before this review, now one item shorter.
