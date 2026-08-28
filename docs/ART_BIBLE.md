# Case & Seek — Art Bible

**Season One: *The Hollow Frame*** — Marlowe Bay, autumn 1927
**Version:** 1.0 (Art Direction Lock Candidate)
**Author:** FABLE, Hidden Object Game Art Director
**Authority:** This document is the visual source of truth. It obeys `/workspace/docs/GAME_DESIGN.md` (structure, fairness, budgets) and `/workspace/docs/STORY_BIBLE.md` (story fact, character fact, continuity). Where this bible and either document disagree, they win in that order. Scene-by-scene composition specs live in `/workspace/docs/SCENE_COMPOSITION.md`.

> **Specs only. No images are generated at this phase.** Every generation rule in §13 is written for the later production pass with SOL MAX FAST.

---

## Table of Contents

1. [Style Pillars](#1-style-pillars)
2. [The Look — Painterly Realism, Defined](#2-the-look--painterly-realism-defined)
3. [Marlowe Bay — World & Period Rules](#3-marlowe-bay--world--period-rules)
4. [Palette](#4-palette)
5. [Lighting States](#5-lighting-states)
6. [Camera & Perspective Standards](#6-camera--perspective-standards)
7. [Prop Art Standards](#7-prop-art-standards)
8. [Readable-Text Policy](#8-readable-text-policy)
9. [Character Consistency Sheets — Full Cast](#9-character-consistency-sheets--full-cast)
10. [Hero Asset — *The Cartographer's Daughter* Suite](#10-hero-asset--the-cartographers-daughter-suite)
11. [Motif Kit & Iconography](#11-motif-kit--iconography)
12. [UI, Notebook & Documentary Surfaces](#12-ui-notebook--documentary-surfaces)
13. [Image-Generation Guidance — SOL MAX FAST](#13-image-generation-guidance--sol-max-fast)
14. [Art QA Gates](#14-art-qa-gates)

---

## 1. Style Pillars

1. **Painterly realistic, never photoreal, never cartoon.** Oil-and-gouache illustration language: believable materials and anatomy, visible brushwork in backgrounds, crisp confident edges on anything findable. Think a well-restored 1920s travel-poster painter who took up crime scenes.
2. **Warm cinematic light is the narrator.** Every scene is lit like a graded film frame: one warm key (lamp, lantern, low sun), cool ambient fill, and light *pools* that guide the eye. Light does the storytelling the prose isn't allowed to.
3. **Readability outranks richness.** Density is the genre's texture, but the Fairness Charter (GDD §7.3) is a hard gate: every target silhouette must survive the contrast floor, occlusion cap, and minimum size. Where beauty and readability fight, readability wins and beauty finds another way.
4. **Cozy-noir, everyone keeps their dignity.** No gore, no horror, no grotesques. Shadows are deep but kind; rain is romantic, not miserable. The darkest image in the season is an empty frame.
5. **The world is a vocabulary.** Props are the lesson. Every tagged prop must read as the *typical* exemplar of its concept (Charter #7) — a key that is unmistakably a key, in 1927 clothing.
6. **Consistency is a system, not a hope.** Fixed palettes, fixed camera bands, fixed character descriptor blocks, one asset per generation. §13 makes consistency mechanical.

---

## 2. The Look — Painterly Realism, Defined

### Rendering rules

| Surface | Treatment |
|---|---|
| Background plates | Loose, confident brushwork; soft edges; atmospheric perspective; detail dissolves gracefully at distance. Zero findable detail painted in (GDD §19.2 rule 1) |
| Prop sprites | Tighter rendering than plates: full material description, crisp alpha-friendly silhouettes, controlled specular on metal/glass. Painterly, but "finished still-life" finish |
| Characters (portraits) | Between the two: painterly skin and cloth, sharp eyes and hands. Faces carry the acting; keep brushwork calm around eyes and mouth |
| Clue close-ups | The most rendered images in the game — evidence deserves macro fidelity. Paper fibers, brass wear, chalk ghosts |
| FX overlays | Soft translucent passes: fog cards, dust motes, steam, rain streaks, lantern glow. Never crunchy or particle-flat |

### Texture & edge grammar

- **Edge hierarchy:** findable prop > character > furniture > architecture > sky/fog. Sharper edge = closer to the player's task.
- **Brush direction** follows form on props, follows *light* on plates (strokes radiate from key sources — it subconsciously aims the eye).
- **No pure black, no pure white** anywhere except: specular pings on brass/glass (≤1% of any sprite's area) and the storm lightning key frames.
- Grain/canvas texture is applied globally in comp at low opacity — never baked per-asset (it would shimmer between layers).

### What this style is NOT

No cel shading, no outlines/linework, no vector flatness, no photobash seams, no lens artifacts (bokeh balls, chromatic aberration, vignette baked into assets — vignette lives in the comp/light pass only), no anime or caricature proportions.

---

## 3. Marlowe Bay — World & Period Rules

A **fictional European port city, 1927** — fog-wrapped, tram-veined, old money uphill, salt money at the waterline. Architectural mix: Hanseatic brick warehouses at the harbor, Beaux-Arts marble at the Belmont and Grand Hotel, timber-and-plaster in the Lantern Quarter, cast-iron-and-glass conservatory, one Gothic-shouldered clocktower above the chart rooms.

### Period discipline (hard rules)

- **Technology ceiling:** gas and early electric light coexist; candlestick telephones; steam ferries and trams; typewriters; no radios as hero props, no plastics, no zippers on principal wardrobe, no modern signage shapes.
- **Wardrobe:** mid-1920s European — dropped waists, cloche hats, three-piece suits, work canvas and oilskins at the harbor. Nothing costume-party; clothes are worn, brushed, mended.
- **Geography continuity:** the harbor skyline must keep the **North Mole breakwater** (built 1921) in all present-day exterior views — it is the season's smoking gun and must exist consistently in the world even where unremarked. The clocktower, Belmont dome, and lighthouse are the three skyline constants.
- **Language-neutral world:** street signage exists but is *greeked* (§8); localized Lantern Quarter signage is a separate typography overlay layer per study language (STORY_BIBLE §3), never baked into generated art.
- **Season:** autumn throughout — wet cobbles, brown leaves in gutters, breath-fog in night scenes, the finale storm.

---

## 4. Palette

### 4.1 Master palette — "Marlowe Bay Heritage"

All scenes grade into this family. Hex values are anchors for grading and QA, not cages.

| Swatch | Name | Hex | Use |
|---|---|---|---|
| ⬤ | Lamp Amber | `#E8A84C` | The signature key light; lanterns, windows at dusk, the hint-glow family |
| ⬤ | Candle Cream | `#F2E3C2` | Paper, marble in warm light, highlights |
| ⬤ | Old Brass | `#B98A3B` | Hardware, instruments, the Belmont's fittings |
| ⬤ | Oxblood Brick | `#8A3B2E` | Harbor warehouses, tavern wood, wax seals |
| ⬤ | Bottle Green | `#3E5C4B` | Shutters, lamp shades, tram livery |
| ⬤ | Harbor Slate | `#4A6B7C` | Sea, wet roofs, dusk sky |
| ⬤ | Shadow Teal | `#2E4048` | The universal shadow mixer — shadows are cool, never grey-black |
| ⬤ | Fog Silver | `#9AA3A8` | Fog cards, distance, storm midtones |
| ⬤ | Ink Umber | `#3B2F2A` | Darkest working value; leather, iron, notebook ink |
| ⬤ | Velvet Plum | `#5C3A4D` | Museum/auction velvet, night accents |

### 4.2 Reserved narrative colors (never used casually)

| Name | Hex | Rule |
|---|---|---|
| **Vane Green** | `#5E7C3F` (copper-resinate, warm, slightly translucent look) | Appears ONLY on: the painting suite (§10) foliage, the pigment pot C23, P7's mix, the loft's test card. Nowhere else in the season — the player's eye must learn it as a fingerprint |
| **Nachtigall Grey** | `#B8B2AD` (warm dove-grey) | Ottilie's gloves, veil, and wardrobe core; the brooch's patina field. Other characters never wear this exact grey |
| **Hint Gold** | `#F5C86E` at screen-blend | UI-side only: search-hint lens glow (GDD §9.2). No scene asset may use this as a local color — the hint must always be unambiguous |

### 4.3 Character accent swatches

Each speaker owns one accent (see §9) so dialogue panels and dossiers stay instantly attributable: Margo — Press Red `#C25B4E`; Adele — Slate Blue `#5B6E8C`; Holt — Ash Brown `#6B5B4A`; Casal — Peacock `#2F6B6B`; Finch — Faded Navy `#3D4A63`; Vane — Linseed Ochre `#C9A96A`; Ottilie — Nachtigall Grey (reserved above); Halloway — Ink Umber + the grey hat.

---

## 5. Lighting States

Seven authored states cover every scene and variant. Each state defines key color, fill/shadow, mood, and its Fairness Charter note (contrast floor, GDD §7.3 #3).

| State | Key | Fill / shadow | Mood & mechanics | Fairness note |
|---|---|---|---|---|
| **DAY-WARM** (museum, hotel, conservatory, suite) | Warm ivory daylight `#F2E3C2`, low-angle autumn sun | Cool bounce, Shadow Teal | Clear, generous, honest — Chapter 1's teaching light | Highest global contrast; camouflage prohibited in Ch. 1 anyway |
| **LAMPLIT** (archives, customs, clocktower) | Lamp Amber pools from practicals (oil/gas/desk lamps) | Deep Ink Umber falloff between pools | The "deep shelves" romance; pools sculpt search regions | Every target inside an authored pool; pool edges ≥ contrast floor |
| **EVENING-HEARTH** (tavern, auction) | Firelight + candle clusters, amber-orange | Oxblood-warm shadow, not teal (interior heat) | Convivial noir; glints on glass and brass | Bottle/glass targets get rim-light from a second practical |
| **FOG-DUSK** (docks variant) | Diffused lavender-slate skylight + lantern pools | Fog Silver swallows distance | The trail-gone-cold feeling; silhouettes stage the composition | Targets sit inside lantern pools or against fog-lit negative space |
| **NIGHT-LANTERN** (market, depot, station) | Paper-lantern and gas-arc pools, saturated Lamp Amber | Blue-black `#1E2A33` night, Shadow Teal midground | The season's most cinematic state; strings of warm pools on cool dark | Pool placement is authored per target list; no target in raw dark |
| **DAWN-ROSE** (artist's loft) | Rose-gold skylight wash `#E8C2A0`, top-down | Cool clean shadows | Sacred-quiet studio light; dust motes in the shaft | Skylight shaft is the primary search field; benches get bounce cards |
| **STORM-NIGHT** (pier, ransacked gallery, rooftop) | Constable's lamps / studio lamp warm cores + intermittent cool lightning key `#C8D4E0` | Deepest state; rain-wet speculars | The finale's register: warmth as sanctuary inside violent cool | Lightning is *never* required to find anything; warm pools carry all targets. Reduced-flash variant per GDD §18 |

**Global rules:** one warm key wins every frame; shadows always carry color (Shadow Teal indoors-cool, Oxblood indoors-hot); the hint-glow gold must remain distinguishable from every practical in every state (verified per scene in QA).

---

## 6. Camera & Perspective Standards

### 6.1 Scene plates — "the detective's survey"

- **Eye height:** 160 cm standing survey height. **Lens:** 35 mm equivalent (h-FOV ≈ 54°). **Tilt:** ≤ 5° downward — enough to show tabletops and floor clutter, never a top-down diorama.
- **Perspective:** one-point or gentle two-point. No dutch angles, no fisheye, no forced wide distortion at frame edges (edge props must not smear — Fairness edge-safety zone is 4%).
- **Horizon:** 52–58% of frame height (interior), 45–52% (exteriors with sky business).
- **Composition:** every scene has ONE focal anchor (usually the story clue's home) placed on a golden-section vertical, and 2–4 light pools that partition the scene into search neighborhoods. Leading lines (rails, shelves, ropes, floorboards) converge toward the anchor.
- **Aspect & safe areas:** master plates authored at **21:9 overscan** (crop to 16:9 landscape shipping frame; overscan feeds the 5-second establishing pan and portrait-mode reframing). Bottom 18% of the 16:9 frame is the tray zone — nothing story-critical composed there; portrait mode reserves the right 22% (GDD §15).
- **Resolution:** plates at **3840 × 1646 (21:9 master)** minimum; props authored at 3× their largest placement size so 3× zoom stays crisp (GDD §7.1).

### 6.2 Prop sprites — the universal prop camera

To let one sprite sit anywhere in any scene:

- **View:** three-quarter front, **15° above horizontal**, long-lens (85 mm equiv — near-orthographic, minimal perspective convergence).
- **Placement bands:** FG (bottom third) props may be swapped to a 20° top-tilt variant; BG shelf props to 8°. Three bands total — never author a prop at an angle outside its band.
- **Light:** neutral warm studio key upper-left, soft fill, **no baked cast shadow** (shadows are separate engine layers, GDD §7.1); grading into the scene's state happens in the scene light pass.

### 6.3 Character portraits (dialogue panels & PEOPLE tab)

- Bust crop (mid-chest up), 85 mm equivalent, eye-level, 3/4 turn toward frame center (speakers face inward in dialogue layouts; author each portrait facing LEFT, mirror in engine as needed — asymmetric wardrobe/props are flagged no-mirror in §9).
- Plain painterly backdrop in the character's accent color family, darker than the face by ≥ 2 value steps.
- Expression sets per character (§9); same crop, same light rig across the whole set — only face/pose changes.

### 6.4 Clue close-ups

- Documents/flat evidence: 60–75° top-down on a desk/table surface, macro framing, soft edge falloff outside the evidence.
- Objects (screw, die, brooch, stretcher bar): 15° hero angle on fabric or wood ground, single warm key, shallow depth suggestion at edges only.
- Side-by-side comparisons (C13↔C15 stamp; C02↔C24 maps) are authored as ONE composed close-up each, not two assets glued in engine.

---

## 7. Prop Art Standards

### 7.1 The sprite contract

Every tagged prop ships as: full-silhouette painterly sprite, clean alpha (hit shapes derive from alpha, GDD §7.1), no crop, no baked shadow, no baked scene light, authored at 3× placement scale. One prop = one semantic concept (GDD §8.1) = one most-typical visual reading (Charter #7).

### 7.2 Silhouette-first design

- A prop must be identifiable **from its alpha silhouette alone at 10% scale**. That is the authoring test. If the silhouette test fails, redesign the prop, not the placement.
- Occlusion planning: each sprite declares its "recognizable feature zones" (a teapot: spout + handle; a violin: scroll + waist) — placement may hide up to 60% but must keep ≥ 1 zone visible (Charter #2).

### 7.3 Material families (sound + paint agreement)

Found-object SFX vary by material (GDD §16); paint treatment must agree so eye and ear match:

| Family | Paint signature |
|---|---|
| Metal (brass/iron/tin) | Warm speculars, cool core; wear at grips and edges; brass leans Old Brass, iron leans Ink Umber |
| Glass/ceramic | One honest window highlight; transmitted scene color; never fully transparent (readability) |
| Cloth/leather | Matte, form-following folds; mended seams and worn naps tell the period |
| Wood/paper | Grain follows form; paper is Candle Cream aged toward ochre, never white |

### 7.4 Wear, reuse, and plural instances

- **Shared prop library** (GDD §22 risk 1): a concept's sprite family is reused across scenes with palette/wear variants (the brass key vs. the iron boathouse key both depict `object:key`). Variants change material dressing, never the concept's typical silhouette.
- **Multi-find plurals** (gulls ×3, bottles ×3, oranges ×3…): author 2–3 distinct pose/wear variants per plural concept so instances read as individuals, not stamps.
- Everything is *used*: scuffed, polished by hands, patched. Marlowe Bay owns nothing new except regret.

### 7.5 Ambience discipline

Untagged dressing sprites (`untagged:ambience`) are allowed sparingly (GDD §19.2); they must read ≥ 1 edge-step softer than tagged props and never mimic a taught concept's silhouette (no fake keys teasing the player).

---

## 8. Readable-Text Policy

**Hard rule: no important readable text is ever baked into a generated image.** Rationale: localization (3+ study languages), the UI-language surface, fair-play legibility, and generation reliability (models mangle text).

1. **Generated art carries *greeked* text only** — plausible illegible letterforms, blurred ledger lines, suggestion-of-print. Prompt token: "illegible painterly lettering, no readable words."
2. **All meaningful text is a typography overlay** composited in engine/comp: clue documents (tickets, telegrams, ledgers, waybills, the blotter's mirror writing), signage, the Chalk's slate, newspaper headlines, Lantern Quarter localized signage layers, the sketchbook caption (tap-glossed, STORY_BIBLE §3).
3. Each text-bearing asset spec declares its **text zone(s)**: a flat, evenly-lit, perspective-tagged rectangle the overlay maps onto. Generated art keeps those zones quiet (low texture, no strokes fighting the type).
4. **Numbers and single glyphs follow the same rule** — pawn ticket "No. 77," pass "No. 7," "E.V. 1904" stamp, "O.M." initials are overlays. The *only* sanctioned in-paint marks: the nightingale watermark/sigil, the lattice-diamond stall sigil, and maker's-mark style dings — pictographic, not textual.
5. **QA gate:** any generated asset containing an accidentally legible real word is rejected and regenerated.

---

## 9. Character Consistency Sheets — Full Cast

General rules: eight speakers (GDD-locked) + specified non-speakers. Each sheet fixes physique, wardrobe, signature props, accent swatch, expression set, and a **consistency token block** — the verbatim descriptor reused in every generation of that character (§13.4). Ages are as of October 1927. All cast wardrobe obeys §3 period discipline. **One character per generated image, always.**

### 9.1 Wren Halloway — the Detective (player; never fully depicted)

- **Presentation law (STORY_BIBLE §2):** behind-the-eyes protagonist. **Never show Halloway's face. Never imply gender** — dialogue has no pronoun dependency and neither may art.
- **What art MAY show:** the grey hat (a soft-brimmed grey felt, slightly loved-to-death — it is "lost" once per chapter, so it is also a standalone prop sprite); hands in close-ups (medium-tone, weathered, neutral, ink-stained fingers, no rings, no polish, plain dark coat cuff); the worn Ink-Umber overcoat from behind at distance ≤ silhouette scale; notebook forty-one; the magnifier; strong tea.
- **Hand rig:** ONE canonical hand design reused in every clue close-up and notebook surface — this is the most-seen "character art" in the game. Author a reference sheet: holding pen, holding magnifier, pinning evidence, lifting a teacup.
- **Epilogue/office shots:** Halloway framed out, from behind at range, or represented by the hat on its hook.
- **Consistency token block:** `weathered ink-stained hands of indeterminate gender, dark wool coat cuff, no face visible, grey felt hat as object`
- **Never:** face, hair, full unobscured figure, gendered silhouette cues, gloves (bare hands distinguish Halloway's close-ups from Ottilie's gloved ones).

### 9.2 Margo Lin — journalist, companion (one portrait set for all three study languages)

- **29.** Mixed heritage: East Asian father's line (the surname), European mother's line (the Lantern Quarter grandmother). Quick dark eyes that finish sentences early; black hair in a practical, slightly wind-undone 1920s bob; warm light-tan complexion; expressive brows; fast half-smile as resting state.
- **Wardrobe (canonical):** press-practical — rust-and-cream check jacket over a dark skirt, flat walking shoes, a battered leather satchel (notes, sandwiches, favors), pencil behind the right ear (⚠ no-mirror flag), Press Red `#C25B4E` scarf as the accent constant. **Variant M-2 "the one good dress":** dark green satin, same scarf tone in the wrap, for S19–S20 auction night. **Variant M-3 storm:** oversized borrowed oilskin over canonical, holding Halloway's hat down (S26).
- **Signature props:** reporter's notebook (dog-eared, rubber-banded), the satchel, a folded newspaper.
- **Language-skin rule:** Margo's design NEVER changes across German/Spanish/Italian runs (STORY_BIBLE §3) — only Lantern Quarter signage overlays change.
- **Expression set (8):** wry default · delighted scoop · conspiratorial whisper · velocity (mid-stride talk) · the wobble (Ch. 4 — torn, jaw set) · no-joke grave (B4.6) · operationally glamorous (auction) · quiet pride (finale, notebook out, not writing).
- **Token block:** `young East Asian-European woman, late 20s, black windblown 1920s bob, quick dark eyes, rust check jacket, red scarf, leather satchel, pencil behind ear`

### 9.3 Adele Voss — curator, red herring, then ally

- **34.** Brilliant, brittle-composed. Pale, fine-boned, fatigue under the eyes she out-dresses; dark blonde hair in a severe chignon that loosens exactly once (the S21 confession); rimless spectacles on a fine chain (S02's desk pair is hers).
- **Wardrobe:** impeccable museum tailoring — Slate Blue `#5B6E8C` suit, high collar, small pearl studs; a curator's white cotton gloves folded in the breast pocket (professional, distinct from Ottilie's grey kid gloves — never grey).
- **Signature props:** catalog folio, fountain pen held like a scalpel, the hidden pigment-scrape kit (small black case — also a prop sprite).
- **Expression set (7):** precise composure · brittle smile · flash of fear (hands only betraying) · defensive ice · the confession (undone, honest, older) · cleared/quiet gratitude · epilogue podium warmth.
- **Arc note:** portraits never change design; the *expression* set carries the herring→ally arc. PEOPLE-tab stamps do the labeling (GDD §11).
- **Token block:** `pale precise woman, mid 30s, dark blonde severe chignon, rimless spectacles on chain, slate-blue tailored 1920s suit, high collar, guarded composure`

### 9.4 Inspector Bram Holt — the honest wall

- **51.** Heavy, weathered, fair; a man rained on by procedure for thirty years. Grey-shot walrus mustache; deep-set patient eyes; brick complexion.
- **Wardrobe:** Ash Brown `#6B5B4A` belted overcoat over a serge suit, bowler, police whistle chain at the waistcoat, boots that have outlived three commissioners.
- **Signature props:** dog-eared warrant folder, pocket watch consulted like a verdict, blackthorn walking stick.
- **Expression set (6):** territorial flint · weary fairness · the maxim delivery (dry, eyes half-closed) · grudging respect · command (finale arrests) · the apology-shaped-like-a-case-file (B6.1).
- **Token block:** `heavy weathered police inspector, early 50s, grey walrus mustache, brick complexion, ash-brown belted overcoat, bowler hat, patient deep-set eyes`

### 9.5 Victor Casal — the framed suspect

- **45.** Urbane, silver-templed, theatrically composed; a dealer whose charm is inventory. Olive complexion, groomed short beard, pomaded dark hair, one raised eyebrow on retainer.
- **Wardrobe:** Peacock `#2F6B6B` silk waistcoat under charcoal tailoring, cravat with a moonstone pin, signet ring, spats. **Variant C-2:** the dressing gown of operatic magnificence (S23 — peacock silk, quilted shawl collar). **Variant C-3:** subdued genuine-outrage suit (post-framing, Ch. 5 — same tailoring, no pin: he stops performing).
- **Signature props:** the genuine stamp die (nicked serif — also clue C15), cipher ledger, ivory-handled magnifier.
- **Expression set (7):** salesman's delight · performed outrage · REAL outrage (quieter, stiller — the design difference matters) · calculating pause · framed-man fury · grudging alliance · epilogue flourish (selling Margo the hat).
- **Token block:** `urbane art dealer, mid 40s, silver-templed pomaded hair, groomed short beard, olive complexion, peacock silk waistcoat, cravat pin, theatrical poise`

### 9.6 Tobias Finch — the door that opened

- **57.** The museum's gentlest fixture; a widower shaped like an apology. Slight stoop, soft jowls, kind wet eyes, white hair combed with water; big careful hands.
- **Wardrobe:** navy night-guard uniform (Faded Navy `#3D4A63`), polished-but-cracked boots, brass buttons he keeps bright (his one vanity). **Variant F-2 daylight redemption (S25, epilogue):** brown civilian coat and soft cap, the sextant case under his arm.
- **Signature props:** the brass sextant + case (pawned, redeemed, polished obsessively — hero prop and clue chain), ring of museum keys, the duplicate log book.
- **Expression set (6):** anxious kindness · the bad lie (eyes down-left, hands busy) · half-crack fear (B2.6) · shame · the redemption resolve (station doors, papers held out) · daylight ease (epilogue pint).
- **Token block:** `gentle stooped night guard, late 50s, white water-combed hair, soft jowls, kind anxious eyes, faded navy uniform with bright brass buttons`

### 9.7 Ottilie Marsh / "Nachtigall" — the Broker (four guises, one face)

The season's central consistency problem: **one woman across 23 years and four presentations.** Author the canonical face first (9.7-a), then derive.

- **Canonical face:** strong-boned, upright, exact; silver-streaked dark hair; steady appraising grey-green eyes; conservator's hands (short nails, strong fingers). Age 43 in the present. Carries herself "like she owned the marble."
- **(a) Present-day / the tea beat & rooftop (Ch. 5–6):** widow-plain dove wardrobe in Nachtigall Grey `#B8B2AD` — high-collared blouse, long skirt, and the **grey kid gloves** (her constant; removed only on the rooftop when she re-pins the brooch). Hair pinned precisely. Design register: a museum case containing a person.
- **(b) The veiled woman (Ch. 3, S12 sighting):** same silhouette + grey traveling veil, grey gloves; face never rendered — posture and gloves ARE the identification. Distance/back-view compositions only.
- **(c) The 1919 photograph (S03 prop; reused by PEOPLE tab):** age 35, conservator's apron over shirtwaist, sleeves rolled, the same eyes; sepia photographic rendering (in-world photo, §12 documentary style). Adele (28) beside her, faces slightly turned.
- **(d) The sitter, 1904 (the painting + Lot 9 study, §10):** age 20 — the same bones young; dark hair down; the **nightingale brooch** at her collar; painted in Vane's hand (see §10 style-within-style).
- **Signature props:** grey kid gloves (one is clue C17), the nightingale brooch (C33 — silver, folded-wing songbird, worn patina), the retired conservator's seal (C34 — brass handle, nightingale matrix), the patent cradle blueprint bearing her signature.
- **Expression set, present-day (6):** courteous appraisal · the true-lie serenity (B5.5 tea) · professional correction (cannot help it) · masked-voice beat is AUDIO-ONLY (art: lattice screen + gloved fingertips at its edge — never her face, S14) · rooftop calm ("holding the truth level") · the question ("real, or true?").
- **Never:** hurried posture, disorder in dress, any second color dominating the dove-grey family, the brooch before Ch. 5's study reveal except inside the painting suite.
- **Token block (present-day):** `upright exact woman, early 40s, silver-streaked dark hair pinned, grey-green appraising eyes, dove-grey high-collar 1920s dress, grey kid gloves, conservator's poise`

### 9.8 Elias Vane / "Emil Sarto" — the painter

- **47.** Grey, gentle, unhurried; a man who watches light the way others listen to music. Weathered outdoor skin, cropped grey beard, deep crow's-feet; paint-stained cuticles that never fully clean; slow economical movements.
- **LEFT-HANDED — absolute continuity law.** Every depiction: shears, brush, pencil, trowel in the LEFT hand; smock buttons re-sewn right-over-left (S17 plant). ⚠ All Vane/Sarto art is **no-mirror flagged**.
- **Wardrobe:** gardener-restorer — collarless shirt, Linseed Ochre `#C9A96A` canvas apron (conservatory) or painter's smock (loft flashback dressing), wooden clogs at the glasshouse, a soft brown coat and scarf for the rooftop arrival through the rain.
- **Signature props:** left-handed shears, the sketchbook (C28), the Vane-green pigment pot (C23 — his lettering, greeked per §8 with overlay), orchids.
- **Expression set (5):** absorbed tending · watching-light stillness · the unpressed denial ("I never met the man" — mild, unreadable) · rooftop arrival (rain-wet, resolved) · the signing ("a Vane, after Vane" — grief and mischief at once).
- **Token block:** `gentle weathered gardener, late 40s, cropped grey beard, deep crow's-feet, collarless shirt, ochre canvas apron, paint-stained left hand holding tools`

### 9.9 Non-speakers & creatures (incidental sheet, one line each)

Rendered softer-edged than speakers (they are scene dressing with faces): **Corbin brothers** — two large mirror-of-each-other bruisers in cheap loud checks, indignant in handcuffs (S27 only); **the pawnbroker** — shawl-wrapped, lumbago posture, communicates in shrugs (S05); **customs clerk** — drowning in forms, gesture-only (S09); **night dispatcher** — thermos, pointing (S16); **the landlady** — pantomime rent (S17); **boathouse keeper** — oilskin monolith, weather-gestures (S26); **left-luggage clerk** — tag-buried (S25); **the Chalk** — not a person: a chalkboard (prop with typography overlay); **Witness** — a sturdy brindled harbor tabby, torn left ear, proprietary expression; appears S00, epilogue panel 6; affiliation unresolved by design. Pettibone and Dr. Lorentz are letters/telegrams only — never depicted.

---

## 10. Hero Asset — *The Cartographer's Daughter* Suite

The most important artwork in the game, in five derivations. **Production law: paint ONE master, derive the rest from that file. Never generate the versions independently** — their identity-except-for-one-detail is the plot.

| Asset | What it is | Differences from master |
|---|---|---|
| **PNT-MASTER (the 1904 original)** | Oil portrait: Ottilie at 20, three-quarter length, seated in the clocktower chart room; nightingale brooch at her collar; behind her, her father's **1904 harbor map** on the wall. Vane's palette: warm umbers, Candle Cream skin light, **Vane Green** foliage/map-land tones. Painterly-within-painterly: visible period brushwork, craquelure, warm old varnish | — (map shows **NO North Mole**) |
| **PNT-COPY (the 1926 copy)** | The museum's stolen canvas | IDENTICAL except the background map includes the **North Mole breakwater arm** — small, correct, "visible-but-unremarkable" (S02 art note); varnish artificially aged (very slightly cooler sheen — subliminal only, never a player tell) |
| **PNT-STUDY (Lot 9, 1904 study)** | Smaller preparatory study: the sitter younger-looser, brooch crisp, map background sketched | No North Mole; drier, sketchier handling; raw canvas edges |
| **PNT-PHOTO (the catalog photograph, C02)** | In-world sepia photograph OF the copy, tipped into the acquisition file | Documentary rendering (§12); the Mole legible at close-up zoom |
| **PNT-ROOFTOP (finale states)** | The original unrolled in lamplight (S28 plate element) + the crated copy | Master rolled/unrolled distortions; STORM-NIGHT grade |

Supporting suite: the **gilt frame** (on the copy, pre-theft), the **duplicate hollow frame** (Ottilie's joinery — clean, true, level; "a promise, not a decoy," S27), the **patent mounting cradle** (brass, 1905 design — matches blueprint C04), the **stretcher bar** (oak, keyed corners, "E.V. 1904" stamp zone greeked + overlay, fresh tack holes).

**The North Mole rule:** one canonical breakwater shape, defined once, used in: PNT-COPY's map, the present-day harbor skyline (all exterior plates), and the 1921 construction gazette close-up — and ABSENT from PNT-MASTER, PNT-STUDY, and the 1904 harbor chart (C06). This single shape is the season's forensic spine; it gets its own reference sheet.

---

## 11. Motif Kit & Iconography

A small vocabulary of recurring shapes, used deliberately, never decoratively:

- **The hollow frame / empty rectangle** — chapter cards, the CLUES board's empty pin spaces, negative space in gallery compositions. Frames-within-frames throughout (doorways, windows, the lattice screen): the theme made compositional.
- **The nightingale** — folded-wing songbird: the brooch, the watermark/seal matrix, the tiny ledger initial-mark. One canonical bird design, three material renderings. Pictographic, sanctioned in-paint (§8).
- **The wren** — small round-bodied bird, tail up: Halloway's quiet mark; appears only in notebook marginalia doodles and the Season Two coda. Never shares a frame with the nightingale until the finale's notebook page.
- **The lattice diamond** — the stall sigil (matchbook S06, note C17, the Lattice Stall itself): a pierced diamond grid, pictographic.
- **Grey gloves** — Ottilie's hand-presence across chapters (the drop, the screen edge, the "aunt" ledger note): always Nachtigall Grey, always kid leather, always composed.
- **String-and-pin** — the evidence board's red thread; echoes in laundry lines (loft), rigging (docks), the market's lantern strings: the connecting-line motif hiding in the world.
- **Brass** — the metal of institutions (Belmont fittings, sextant, seal, dawn-pass token). Brass = "authority, possibly borrowed."

---

## 12. UI, Notebook & Documentary Surfaces

(Interface layout is GDD §15's domain; this section fixes only its *material* look.)

- **The Notebook:** worn oxblood leather, rubber band, ink + pencil handwriting textures, rubber-stamp status marks, paper edge-tint from thumb wear. Tabs are physical dividers. All handwriting is typography overlay in a "Halloway hand" font family — never generated lettering.
- **Word cards / tray chips:** paper-chip aesthetic, Candle Cream stock, letterpress-style overlay type; gender glyphs ▲/●/■ per GDD §8.2 rendered as UI vectors, not art.
- **Documentary style (in-world paper/photo evidence):** a consistent sub-style for the season's ~35 clue close-ups — aged stocks (cream, buff, telegraph-yellow), period print suggestion (greeked), sepia photography for photos (1919 photo, catalog photo), wet-ink stamps. Text zones per §8.
- **City map:** Halloway's office wall map IS the map UI (S00 plant) — hand-drawn cartography, Vane-adjacent inkwork, harbor with North Mole present, pictographic landmark icons (dome, clocktower, lighthouse, lantern).
- **Dialogue panels:** portrait (§6.3) over a soft location-color wash + paper caption band. No comic balloons; the notebook aesthetic carries the type.

---

## 13. Image-Generation Guidance — SOL MAX FAST

For the later asset-production phase. **Nothing is generated during this design phase.**

### 13.1 The five laws

1. **One asset per generation.** One prop, one plate, one portrait, one close-up per image. **Never sprite sheets, never grids, never "N variations in one frame," never two characters in one image.** Variants are separate runs.
2. **No readable text, ever** (§8). Every prompt carries the greeking token; every output is QA'd for accidental words.
3. **Locked token blocks.** Every generation composes: `[GLOBAL STYLE] + [ASSET-CLASS TEMPLATE] + [SUBJECT] + [CAMERA BAND] + [LIGHT STATE] + [PALETTE ANCHORS] + [NEGATIVES]`. Token blocks are versioned in the asset database; changing a block re-opens every asset that used it.
4. **Reference-first characters.** Generate each character's canonical reference portrait, approve it, then produce the expression set and scene appearances against that reference (image-reference/seed-reuse where the tool supports it; verbatim token block always).
5. **Master-derives-copies** for the painting suite (§10): the copy/study/photo derive from the approved master by edit passes, never independent generation.

### 13.2 Global style block (verbatim)

```
painterly realistic oil-and-gouache illustration, 1927 fictional European port city,
warm cinematic lighting, visible brushwork, crisp readable object silhouettes,
cozy-noir mood, muted heritage palette with amber key light and cool teal shadows,
aged and well-used materials, no readable text, illegible painterly lettering only,
no watermark, no border, no photograph, no cartoon, no outlines
```

### 13.3 Asset-class templates

| Class | Template additions | Output handling |
|---|---|---|
| **Scene plate** | `wide interior/exterior establishing view, 35mm perspective, eye-level slight downward tilt, [scene structure per SCENE_COMPOSITION], empty of small findable objects, 21:9` | Paint-over pass for prop anchor cleanup; light-pool pass per state |
| **Prop sprite** | `single [concept], isolated, centered, full object visible, no crop, three-quarter view from 15 degrees above, soft studio key upper left, plain warm-grey background, no cast shadow` | Background removal → alpha; silhouette QA at 10%; band-angle variants as separate runs |
| **Character portrait** | `[character token block], bust portrait, 85mm, eye-level, three-quarter turn facing left, plain painterly backdrop in [accent] tones, [expression]` | One expression per run; no-mirror flags respected in engine |
| **Clue close-up** | `evidence close-up, [subject], on [surface], macro fidelity, single warm key light, quiet flat zone reserved for document text` | Typography overlay pass adds all real text |
| **FX overlay** | `translucent [fog/steam/rain/dust/lantern-glow] element on plain dark background, soft painterly` | Screen/add blend assets; tileable where flagged |
| **Documentary paper/photo** | `aged [paper stock] with illegible period print suggestion, sepia photograph rendering where photographic` | Text zones kept quiet; overlays finish |

### 13.4 Consistency mechanics

- **Character token blocks** (§9) are pasted verbatim — never paraphrased, never trimmed. Wardrobe variants swap ONLY the flagged wardrobe clause.
- **Palette anchoring:** name 2–3 hexes from §4 in the prompt (`amber #E8A84C key, shadow teal #2E4048`) — anchors grading and eases QA.
- **Reserved colors** (§4.2): Vane Green appears only in prompts for its sanctioned assets; QA rejects it elsewhere.
- **Batch order:** (1) palette/light-state test cards per scene → (2) scene plate → (3) that scene's evidence close-ups → (4) prop sprites by clutter family (family-batched days keep material handling consistent) → (5) portraits last (highest scrutiny). One scene fully closed before the next opens.

### 13.5 Negative-prompt standard

```
text, letters, words, numbers, captions, watermarks, signatures, borders, frames around image,
sprite sheet, grid, collage, multiple views, multiple objects, duplicated subject, cropped subject,
photorealism, lens flare, bokeh, chromatic aberration, neon, modern objects, plastic,
anime, cartoon, cel shading, line art, oversaturation, pure black, pure white
```

(For prop runs add: `scene background, floor, cast shadow, human hands`. For portrait runs add: `full body, second person, props unless specified`.)

### 13.6 Post-generation pipeline (per asset)

Generate → auto-QA (text detector, palette histogram vs. state anchors, single-subject check) → human art QA (§14 gates) → cutout/alpha (props) → 3× resolution verification (upscale pass only if generation resolution short of §6.1 targets) → grade into scene light state → fairness tooling validation (GDD §19.2 rule 5) → asset DB with prompt, seed, token-block versions recorded (regenerability is a requirement).

---

## 14. Art QA Gates

Every asset passes or is regenerated — no hand-waving:

1. **Style:** painterly-realistic per §2; no forbidden treatments (§2 "NOT" list).
2. **Palette:** histogram within its lighting state's family; reserved colors only where sanctioned.
3. **Silhouette (props):** identifiable from alpha alone at 10% scale; recognizable-feature zones present.
4. **Semantic typicality (props):** a learner who knows the word must recognize the object (Charter #7) — verified by someone who didn't author it.
5. **Text:** zero readable words; text zones quiet and flat where declared.
6. **Single subject:** no grids, no sheets, no accidental second characters.
7. **Continuity:** character token-block fidelity; left-hand law (Vane); glove/no-glove law (Ottilie/Halloway); North Mole presence/absence per §10; motif usage per §11.
8. **Fairness handoff:** scene assemblies pass the authoring tool's automated Charter checks (size %, occlusion %, contrast, edge safety) at 100% before a scene ships (GDD §19.2).

---

*End of Art Bible. Scene-by-scene composition and asset inventories: `/workspace/docs/SCENE_COMPOSITION.md`.*
