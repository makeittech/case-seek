# Image handoff — props B + clue close-ups

Completed on `feat/case-and-seek-cd51`.

## Scope

- Generated the alphabetically sorted final 120 of 240 `prop-sprite` records (`prop-laundry-line` through `prop-wrench`), one asset per image.
- Generated all 46 `clue-closeup` records.
- Saved every file at its manifest `generatedPath`.

## Output contract

- Props use clean alpha WebP output and manifest dimensions. Most are `1024×1024`; `prop-stretcher-bar-1904` is `1400×700` at `public/assets/paintings/prop-stretcher-bar-1904.webp`.
- Clue close-ups are opaque `1920×1440` WebPs, matching their manifest `transparentBackground: false` requirement and authored evidence surfaces.
- Prompts enforce painterly realistic oil-and-gouache rendering, 1927 materials, isolated single props, no cast shadows, no sprite sheets, and no readable text.

## Validation

Manifest-driven validation passed:

```text
validated_props=120 validated_clues=46 failures=0
```

The check verifies every requested generated path, exact target dimensions, and an alpha-bearing pixel format for every prop.

## Commits

- `8570ec3` — first prop sprite batch
- `8770605` — second prop sprite batch
- `b6b255e` — third prop sprite batch
- `06aa662` — fourth prop sprite batch
- `d968fbf` — fifth prop sprite batch
- `64e222f` — sixth prop sprite batch
- `d4d5729` — final prop sprite batch
- `d2fea12` — first clue close-up batch
- `74a80ef` — second clue close-up batch
- `4cc0be8` — third clue close-up batch
- `d823810` — fourth clue close-up batch
- `21f21dd` — final clue close-up batch
- `098ca2a`, `49e9884` — stretcher path/aspect corrections

The shared branch was concurrently active; `b6b255e` also includes `prop-anchor.webp` from complementary first-half prop work.
