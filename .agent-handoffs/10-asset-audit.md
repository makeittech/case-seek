# Handoff 10 — Asset Completeness + Visual QA (FABLE)

Date: 2026-08-28 · Branch: `feat/case-and-seek-cd51`

## Verdict

**missing = 0 · placeholder = 0 · broken = 0.** All 736 manifest assets exist at
their `generatedPath`, decode cleanly, and pass visual QA. Manifest is fully
reconciled: every entry is `status: generated`, `qaStatus: passed`.

## Audit scope

Source of truth: `content/assets-manifest.json` (736 assets across 12 batches)
cross-checked against `public/assets/` (736 files — exact 1:1, no orphans, no
duplicate paths) and against runtime integration:

- Engine path contracts verified in code: `src/engine/render/SceneRenderer.ts`
  loads `/assets/scenes/<sceneId>.webp`; `src/engine/render/sprites.ts` loads
  `/assets/props/<sprite>.webp`. Both fall back gracefully if art is absent.
- Every `sprite` referenced by the 19 base scenes + 3 variants in
  `content/scenes/*.json` resolves to a real file; every scene id has a plate.
  Variant scenes (`scn-docks-fog`, `scn-gallery-storm`, `scn-shop-night`) use
  the `parent`/`addProps`/`moveProps`/`removeProps` schema and resolve fully.
- `npm run validate` passes (16 pre-existing content-authoring warnings,
  none asset-related).

## Checks performed

1. **Existence/decode**: all 736 files open and decode (Pillow).
2. **Placeholder heuristics**: file size, dimensions, near-solid-color variance.
3. **Alpha contract**: all 566 `transparentBackground: true` assets carry a real
   alpha channel with actual transparency; all 170 opaque assets are not
   accidentally transparent.
4. **Aspect sanity**: actual vs `targetDimensions` aspect within tolerance for
   all 736.
5. **Alpha-edge fringe scan**: semi-transparent edge luminance vs interior over
   all transparent assets; 3 flags triaged visually (see fixes; the remaining
   `pnt-copy-crated` flag is a benign 1-px antialias rim, confirmed clean at
   game scale).
6. **Scene consistency / prop scale / lighting**: composited 6 representative
   scenes (`docks-day`, `gallery-storm`, `shop-night`, `night-market`,
   `tavern`, `docks-fog`) using the exact engine draw math (plate → props
   z-ascending, 256 px sprite box × scale, rotation/flipX → light-state
   multiply). Painterly style, palette, and warm-key/teal-shadow lighting are
   consistent; prop scale reads correctly for hidden-object convention; no
   halos or floating-edge artifacts.

## Defects found and fixed (regenerated/repaired one-by-one)

| Asset | Defect | Fix |
| --- | --- | --- |
| `ui-board-string` | Effectively blank: max alpha 91/255, ~50 visible near-black pixels instead of a red thread | Regenerated with GenerateImage (red twine, style-matched to `ui-string-flag`), white-keyed to alpha, cropped 8:1, 512×64 WebP. Committed in `e273099`. |
| `prop-frame-gilt-original` | ~32k px semi-opaque white residue blob inside frame opening (rembg leftover) | Cleared via connected-component alpha masking (kept frame ring). Commit `1e64ce0`. |
| `prop-frame-hollow-duplicate` | ~170k px white residue blob bridged to the frame ring | Ring estimated geometrically (excluding near-white), interior hole filled and alpha-cleared with 2 px inner-lip margin. Commit `1e64ce0`. |

## Manifest updates

- All 736 entries: `status: generated` (658 stale `pending` flipped in
  `e273099`), `qaStatus: passed` (658 flipped in `1db93c5` after this audit;
  78 were already hand-set). `generatedPath` values verified — no changes
  needed; no code/content path fixes were required.

## Tooling added (re-runnable)

- `tools/audit-assets.py` — full manifest↔disk↔content audit; exits non-zero
  on any issue. Run: `python3 tools/audit-assets.py`.
- `tools/qa-composite.py` — offline scene composites matching engine draw math
  (handles variants). Run: `python3 tools/qa-composite.py scn-tavern ...`
  → writes `/tmp/qa-<scene>.png`.

## Notes for next agent

- A parallel QA session was active on this branch during the audit (commits
  `56c1d89`, `d21f5ef`, `e273099` landed mid-run, including PWA icons and the
  `ui-board-string` regeneration); everything was reconciled — re-run
  `python3 tools/audit-assets.py` for a clean 0-issue confirmation.
- The fringe scan will still name `pnt-copy-crated` and the two frames: those
  are bright-silhouette false positives (gilt/canvas edges), visually cleared.
