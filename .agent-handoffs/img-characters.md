# Character art handoff

Completed on `feat/case-and-seek-cd51`.

## Scope

- Generated all 4 `reference-sheet` assets.
- Generated all 59 `character-portrait` assets.
- Generated all 15 `character-overlay` assets.
- Saved all 78 files at their exact manifest `generatedPath`.

## Output contract

- Every output is a real WebP at its exact manifest dimensions.
- All character overlays have transparent backgrounds and alpha-bearing pixel data.
- Portraits and reference sheets are opaque.
- Source generations were resized with Lanczos and encoded as production WebPs.
- Manifest records for this scope are `status: generated` and `qaStatus: passed`.

## Continuity

- Halloway never shows a face or gendered figure. The set contains only canonical bare-hand close-ups plus the grey hat and empty overcoat object stand-in.
- Vane's portrait set and Sarto overlay are no-mirror art. Tool-bearing poses place tools in his anatomical left hand.
- Ottilie's present-day portraits and rooftop overlay share `ottilie-ref.webp`; the veiled guise has no rendered face. Her 1904 sitter and 1919 photograph are painting/clue assets outside this character batch and should derive from the same canonical face.
- Margo's set uses one canonical face and preserves the pencil/no-mirror continuity.

## Validation

Manifest-driven validation passed:

```text
reference-sheet=4
character-portrait=59
character-overlay=15
total=78
missing=0
bad-format=0
bad-dimensions=0
bad-overlay-alpha=0
```

Visual contact-sheet QA covered every output. A duplicate-face reflection in `ottilie-courteous-appraisal.webp` was regenerated, and `ref-north-mole.webp` was corrected to `1600×900`.

## Commits

- `50913aa` — reference sheets
- `574a913` — Margo portraits
- `71fa33c` — Adele portraits
- `de48631` — Holt portraits
- `759e672` — Casal portraits
- `dd13a53` — Finch portraits
- `ff38494` — Ottilie portraits
- `fe55beb` — Vane portraits
- `e8f5a03` — Halloway portraits
- `61ce442`, `c2c987a` — character overlays
- `31fd612` — final visual QA fixes
