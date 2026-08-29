# Image handoff — props A + in-scene evidence

Completed on `feat/case-and-seek-cd51`.

## Scope

- Generated the alphabetically sorted first 120 of 240 `prop-sprite` records (`amb-1` through `prop-lantern-b`), one asset per image.
- Generated all 30 `evidence-sprite` records (`evid-c00` through `evid-c34`, using the manifest's non-contiguous IDs), one asset per image.
- Saved every file at its manifest `generatedPath`.

## Output contract

- All 150 sprites are isolated, full-silhouette painterly WebPs with clean alpha, no baked cast shadow, and exact manifest dimensions.
- Props use the Art Bible's 1927 oil-and-gouache still-life treatment, near-orthographic prop camera, warm upper-left key, colored fill, aged materials, and language-neutral surfaces.
- The painting-related prop records are stored at their manifest paths under `public/assets/paintings/`; all remaining assigned sprites are under `public/assets/props/`.
- Evidence continuity uses the canonical lattice-diamond and nightingale motifs. `evid-c24` and `evid-c30` were derived from their required painting-suite sources.
- No sprite sheets or collage crops were used.

## Validation

Manifest-driven validation passed:

```text
assigned_props=120 evidence=30 validated=150 failures=0
```

The check verifies every assigned path, exact target dimensions, an alpha-bearing pixel format, full 0–255 alpha range, and transparent corners.

## Commits

- `0028fc5`, `5d1a299`, `fa0d15f`, `4318aa1`, `2f707b0` — first-half prop generation batches
- `7649b18` — ambience props
- `747f931` — missing first-half gavel
- `063d0d4`, `49777ed` — evidence generation batches
- `ec30812`, `6a220e4` — painting-suite evidence derivations and continuity correction
- `00ffb83`, `1fc5981` — alpha cutouts and glass cleanup
- `ec9e2a4` — canonical evidence motif corrections
