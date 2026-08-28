# Case & Seek — Production Game Design Document

**Version:** 1.0 (Design Lock Candidate)
**Author:** FABLE, Lead Hidden Object Game Designer
**Status:** Complete production design. No implementation code in this document — design only.

> **Case & Seek** — a browser hidden-object detective game for language learning.
> *Find the objects. Learn the language. Solve the case.*

---

## Table of Contents

1. [Vision & Design Pillars](#1-vision--design-pillars)
2. [Player Experience Summary](#2-player-experience-summary)
3. [Core Loop](#3-core-loop)
4. [Time & Content Budget](#4-time--content-budget)
5. [Narrative Design — Season One: *The Hollow Frame*](#5-narrative-design--season-one-the-hollow-frame)
6. [Locations & Search Scene Inventory](#6-locations--search-scene-inventory)
7. [Search Scene Design](#7-search-scene-design)
8. [Language Learning Design](#8-language-learning-design)
9. [Hint Systems — Two Separate Systems](#9-hint-systems--two-separate-systems)
10. [Puzzles](#10-puzzles)
11. [The Notebook](#11-the-notebook)
12. [Difficulty & Progression](#12-difficulty--progression)
13. [New Case Flow (Onboarding)](#13-new-case-flow-onboarding)
14. [Search Mode Catalog](#14-search-mode-catalog)
15. [UX & Screens](#15-ux--screens)
16. [Audio Design](#16-audio-design)
17. [Save System & Offline-First](#17-save-system--offline-first)
18. [Accessibility](#18-accessibility)
19. [Content Pipeline & Authoring Rules](#19-content-pipeline--authoring-rules)
20. [Genre Research — Patterns Adopted & Rejected](#20-genre-research--patterns-adopted--rejected)
21. [Success Metrics](#21-success-metrics)
22. [Scope, Risks & Out of Scope](#22-scope-risks--out-of-scope)
23. [Glossary](#23-glossary)

---

## 1. Vision & Design Pillars

Case & Seek is a premium-feeling, browser-native hidden-object game (HOG) where the vocabulary of a foreign language *is* the search list. Players play a detective solving a season-long mystery; every object they find is a word they learn — with its article, its sound, and its picture — without ever seeing a flashcard.

### Design Pillars

1. **The search is the lesson.** Language learning is embedded in the core verb (finding objects), never bolted on as a separate drill screen. If a feature feels like homework, cut it or hide it inside play.
2. **A real mystery, honestly told.** The detective story is not wallpaper. Clues found in searches feed a genuine evidence board; the player closes the case because they paid attention, not because they tapped "continue."
3. **Fair, readable, generous.** No microscopic pixel hunts, no timers gating the campaign, no energy walls, no pay-to-see hints. Difficulty comes from clever scene composition and language scaffolding, never from unfairness.
4. **Respect both audiences.** HOG veterans get dense, gorgeous, layered scenes and mode variety. Language learners get honest pedagogy: articles from day one, audio everywhere, spaced re-exposure handled invisibly by the game.
5. **Plays anywhere, remembers everything.** Offline-first, instant resume, autosave after every found object. A browser tab closed mid-search costs the player nothing.

### Product Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Platform | Browser (desktop + mobile web), landscape-preferred, portrait supported | Zero-install reach; language learners live in browsers |
| Business model | Chapter 1 free; one-time unlock for the full season | No energy, no consumable IAP, no ads. Trust is the moat |
| UI language | English only (v1) | Scope control; learning content is the localized surface |
| Learning languages | German, Spanish, Italian (v1) | Three high-demand languages with meaningful article systems |
| Campaign timer | None, ever, on campaign content | Timed play exists only as an optional post-completion replay mode |
| Art direction | Painterly, warm, high-readability illustration; 1920s-flavored fictional European port city | Genre-appropriate density without visual noise; period-neutral enough to stay language-agnostic |

---

## 2. Player Experience Summary

### The first two minutes
The player picks a language (German / Spanish / Italian), picks how much they already know (four plain-English options), reads a one-page cold open — a letter slid under the detective's door — and is inside their first search scene finding their first object (and learning their first word, with its article, spoken aloud) in under two minutes. See [Section 13](#13-new-case-flow-onboarding).

### A typical session (25–40 minutes)
A story beat (1–3 minutes of illustrated dialogue) sends the detective to a location. The player works one or two search rounds (6–9 minutes each), finding 8–14 objects named in the target language. Each search ends with a 45–75 second **Debrief** — a quick, tactile recall moment using the words just found — and yields a **clue** that advances the case. Occasionally a puzzle (cipher, torn letter, lock) sits between the clue and the next beat. The Notebook quietly accumulates everything.

### The full campaign
Season One, *The Hollow Frame*, is six chapters, ~16 explorable locations, ~27 substantial search rounds, ~9 puzzles, and roughly **4.5–7.5 hours** for a first playthrough — inside the 4–8 hour target. A first-time player finishes knowing roughly **220–280 words** of their target language with articles, having heard each one spoken multiple times.

---

## 3. Core Loop

The canonical loop, in order, exactly as the game presents it:

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│   STORY    │ →  │  LOCATION  │ →  │ HOG SEARCH │ →  │LEARN WORDS │ →  │    CLUE    │ →  │ NEXT BEAT  │
│   beat     │    │  arrival   │    │  8–14 tgts │    │  Debrief   │    │  evidence  │    │ (or puzzle)│
└────────────┘    └────────────┘    └────────────┘    └────────────┘    └────────────┘    └────────────┘
```

1. **Story** — An illustrated dialogue beat or narration panel establishes why the detective must go somewhere. Skippable; always recapped in the Notebook (CASE tab).
2. **Location** — The player arrives at a scene via the city map. New locations get a 5-second establishing pan (the "casing the room" moment) that doubles as a subconscious preview of the scene.
3. **HOG Search** — The core verb. A target tray shows 8–14 words in the target language (with articles). The player finds the matching objects in a dense, layered scene. Finding an object plays its audio, flashes the word + article + English gloss briefly, and animates the object into the tray.
4. **Learn Words** — The **Debrief**: a 45–75 second post-search moment. Three to five of the just-found words come back as quick recall taps (word→image, article pick, or audio→image). Correct answers charge the hint meter. This is the only overtly "learning" surface in the loop, and it is fast, warm, and optional to ace (no fail state).
5. **Clue** — Every search round yields at least one story-critical item (an **evidence find**, always the last or second-to-last target). The clue is examined in a close-up, added to the CLUES tab, and often pinned to the evidence board.
6. **Next** — The clue unlocks the next beat: a new dialogue, a new location on the map, a puzzle, or a return visit to a known location with a new target list.

**Loop cadence:** one full loop ≈ 10–14 minutes. Chapters contain 4–5 loops plus 1–2 puzzles.

### Secondary loops

- **Vocabulary loop (invisible):** every exposure to a word (seen as target, found unaided, found with translation hint, recalled in Debrief) updates an internal strength model. The target-selection system re-serves weak words as targets in later scenes. The player never sees a review queue. See [Section 8.5](#85-internal-vocabulary-model-no-srs-ui).
- **Collection loop (visible):** the WORDS tab fills like a naturalist's journal — thumbnail, word, article, audio button. Completionists can chase "field notes complete" per location. No drills live here.

---

## 4. Time & Content Budget

### Time allocation targets (first playthrough)

| Activity | Target share | Design enforcement |
|---|---|---|
| HOG search (all modes) | **65–75%** | 27 rounds × 6–9 min ≈ 3.2–4.5 h |
| Narrative (dialogue, cutscene panels, map travel, clue close-ups) | **15–20%** | ~40 beats × 1–3 min, all skippable |
| Puzzles | **5–10%** | 9 puzzles × 3–6 min, all skippable after 2 failed attempts |
| Learning feedback (Debriefs, word reveals, milestone recaps) | **5–10%** | 27 Debriefs × 45–75 s + 6 chapter recaps × ~60 s |

**Worked example — one mid-game chapter (~62 min):**
- 4.5 search rounds × ~8.5 min = **~38 min (61%)** — plus mid-search word reveals push effective search-adjacent time to ~65%
- Dialogue + travel + clue examinations = **~12 min (19%)**
- 1.5 puzzles × ~4 min = **~6 min (10%)**
- 4.5 Debriefs + 1 chapter recap = **~6 min (10%)**

Pacing is tuned so search share never drops below 60% in any chapter and never exceeds 78% (players need narrative breathers; playtest against these rails).

### Content budget (Season One)

| Asset class | Count | Notes |
|---|---|---|
| Unique explorable locations | **16** (+1 hub) | Within the 12–18 target; see Section 6 |
| Scene variants (lighting/state) | 7 | Night, storm, "ransacked" states — each a distinct searchable composition |
| Substantial search rounds | **27** | Within the 20–30 target |
| Tagged props per scene | 40–110 | Median ~65; see Section 7 |
| Semantic concepts authored | ~420 | ~260 guaranteed-taught as targets; rest are decoy/bonus/Debrief-only |
| Lexeme entries | ~1,260 | 420 concepts × 3 languages, each with article, audio, gloss |
| Puzzles | 9 | Section 10 |
| Cast members (speaking) | 8 | Section 5 |
| Story beats | ~42 | Dialogue scenes + narration panels |

---

## 5. Narrative Design — Season One: *The Hollow Frame*

### Premise

**Marlowe Bay, 1927.** A fog-wrapped fictional European port city of trams, lighthouses, and old money. On the eve of its grand unveiling at the Belmont Museum, the celebrated painting *The Cartographer's Daughter* by Elias Vane vanishes from inside a locked gallery. The frame is left hanging — **hollow**. The museum's insurers hire the player: an independent detective with a good eye, a worn notebook, and (diegetically) an ear for the languages of the port.

The language-learning fiction is diegetic but light: Marlowe Bay is a polyglot port, and the detective's informants, dock workers, and shopkeepers label the world in their own tongue. The game never claims the whole city speaks German/Spanish/Italian — the target language is the detective's *study of the streets*, kept in the notebook. Story dialogue is in English; the target language lives in object names, signage flavor, and (at Advanced proficiency) idiom garnishes in dialogue with tap-to-gloss.

### Tone

Cozy-noir. Warm lamplight, dry wit, real stakes but no gore or horror. Closer to a well-made radio drama than a thriller. Rated for everyone; the darkest beat is a betrayal, not a body.

### Cast (PEOPLE tab dossiers)

| Character | Role | Function in loop |
|---|---|---|
| **The Detective** (player) | Player character; lightly characterized, dialogue is chosen from 2 flavor options at key beats (no branching plot) | Player embodiment |
| **Adele Voss** | Belmont Museum curator; commissioned the unveiling; hiding a professional secret | Quest-giver, chapter 1–2 anchor; red herring |
| **Inspector Bram Holt** | Weary, fair city inspector; territorial but honest | Gatekeeper; provides police-side clues; recurring foil |
| **Margo Lin** | Freelance journalist; fast, funny, always one step off to the side | Ally; unlocks locations via her contacts; delivers recaps naturally |
| **Victor Casal** | Urbane art dealer with a warehouse of "provenance flexible" goods | Primary suspect, chapters 2–4 |
| **Tobias Finch** | The museum's night guard; the last person to see the painting | Sympathetic witness; his debt problem is a key thread |
| **"Nachtigall" / The Broker** | Anonymous fence who brokers stolen art through the night market | Hidden antagonist's mask; identity is the season's central question |
| **Elias Vane** | The painter — long presumed dead | The twist: the season's quiet emotional core |

### Season structure — six chapters

Each chapter = one act of the case: 2–3 locations, 4–5 search rounds, 1–2 puzzles, ~6–8 story beats. Every chapter ends on a **hook clue** (a cliffhanger object found in the final search of the chapter).

| Ch. | Title | Story spine | Locations | Ends on |
|---|---|---|---|---|
| 1 | **The Empty Frame** | Survey the crime scene; learn the frame was swapped, not forced — an inside job | Museum Gallery, Curator's Office, Museum Archives | A pawn ticket hidden inside the hollow frame's lining |
| 2 | **Salt and Smoke** | The pawn ticket leads to the harbor; Finch's debts surface; a crate matching the painting's size shipped out — empty | Harbor Docks, The Rusty Anchor Tavern, Customs Warehouse | A customs stamp forged with Casal's dealer mark |
| 3 | **The Gilded Trail** | Confront Casal's world; he's guilty of much, but not this; someone is framing him too | Grand Hotel Lobby, Hotel Suite 412, Casal's Antique Shop | A telegram signed "Nachtigall" arranging a night-market meet |
| 4 | **Night Market** | Undercover among the stalls; find the Broker's dead-drop; discover the painting was *copied* before it was stolen | Night Market, Artist's Loft, Tram Depot | Pigment samples proving a living hand painted the copy — Vane's hand |
| 5 | **The Auction** | Vane is alive; the "theft" hides an authenticity war — the museum's *Cartographer's Daughter* may itself be the copy | Auction House, The Conservatory, Clocktower Workshop | The original's stretcher bar, stamped 1904, in the clocktower |
| 6 | **The Broker** | Race to the ferry; unmask the Broker (Adele's estranged mentor, the museum's founding conservator); choose what "solving it" means | Central Station, Boathouse & Ferry Pier, Belmont Rooftop (finale) | Case closed; epilogue teases Season Two |

**Finale note:** the last search round (Belmont Rooftop, night, storm variant) is an **Evidence Sweep** (see mode catalog) — every target is a story object from earlier chapters, a deliberate emotional callback that doubles as a natural vocabulary review of the season's hardest words.

### Story delivery rules

- Beats are illustrated portrait-dialogue panels (2–6 exchanges), not video. Text reveals at reading speed with tap-to-complete; fully skippable.
- Every beat writes a one-line summary to the CASE tab automatically. A player returning after two weeks reads three lines and knows exactly where they are.
- No beat may exceed 90 seconds of reading. No two beats back-to-back without a search or puzzle between them, except the cold open and the finale.

---

## 6. Locations & Search Scene Inventory

**16 unique explorable locations + 1 hub** (Detective's Office — Notebook home and map access, hosts the tutorial round). Locations are revisited with new target lists and, where noted, distinct lighting/state variants that are recomposed (props moved/added/removed), not just re-lit.

| # | Location | Ch. | Variants | Search rounds | Prop density | Character |
|---|---|---|---|---|---|---|
| 0 | Detective's Office (hub) | 1 | day | 1 (tutorial, 8 targets) | 45 | Cozy clutter: files, coffee, coat rack |
| 1 | Museum Gallery | 1, 6 | day / **night-storm (ransacked)** | 2 | 70 / 75 | Marble, velvet ropes, crated exhibits |
| 2 | Curator's Office | 1 | day | 2 | 60 | Paper storm: ledgers, catalogs, teacups |
| 3 | Museum Archives | 1, 5 | lamplit | 2 | 90 | Deep shelves, map drawers, dust |
| 4 | Harbor Docks | 2 | day / **fog-dusk** | 2 | 100 | Crates, ropes, gulls, cranes |
| 5 | The Rusty Anchor Tavern | 2 | evening | 2 | 85 | Bottles, dartboard, nets, chalk menu |
| 6 | Customs Warehouse | 2 | lamplit | 1 | 110 | The genre's beloved "organized junk pile," done fairly |
| 7 | Grand Hotel Lobby | 3 | day | 2 | 80 | Brass, luggage, palms, front desk |
| 8 | Hotel Suite 412 | 3 | day | 1 | 55 | Intimate scene; searched-room tension |
| 9 | Casal's Antique Shop | 3, 5 | day / **shuttered-night** | 2 | 105 | Dense curio density; fairness showcase |
| 10 | Night Market | 4 | night | 2 | 95 | Lanterns, stalls, produce, textiles |
| 11 | Artist's Loft | 4 | dawn | 2 | 75 | Easels, pigments, skylight, laundry line |
| 12 | Tram Depot | 4 | night | 1 | 70 | Machinery, timetables, toolboxes |
| 13 | Auction House | 5 | evening | 2 | 85 | Lots, paddles, velvet, gilt frames |
| 14 | The Conservatory | 5 | day | 1 | 65 | Glass, plants, wrought iron, birdcage |
| 15 | Clocktower Workshop | 5 | lamplit | 1 | 60 | Gears, tools, blueprints, pigeons |
| 16 | Central Station | 6 | night | 1 | 90 | Steam, kiosks, benches, clocks |
| 17 | Boathouse & Ferry Pier | 6 | storm | 1 | 70 | Oars, lanterns, tarps, tackle |
| 18 | Belmont Rooftop (finale) | 6 | **night-storm** | 1 (Evidence Sweep) | 50 | Sparse by design; emotional finale |

**Totals: 27 substantial search rounds** across 16 unique locations (+hub tutorial), 7 recomposed variants. Every location's prop pool supports at least two distinct target lists (see authoring rules, Section 19), so revisits always feel fresh — no "find the same 10 things again."

Domain coverage is deliberate: kitchen/food (tavern, market), tools (depot, clocktower), clothing/textiles (hotel, market), nature (conservatory, docks), household (office, suite), travel (station, pier), art/craft (loft, archives). This spreads the taught vocabulary across the most useful everyday semantic fields for a learner.

---

## 7. Search Scene Design

This is the product. Everything below is a hard requirement on scene authoring.

### 7.1 Layered prop composition (mandatory)

Scenes are **not** flattened paintings with invisible hitboxes. Every scene is composed of:

- **Background plate** — architecture, walls, sky, large fixed furniture. Non-interactive.
- **Prop layer stack** — 40–110 individually placed prop sprites, each with its own z-order, position, scale, rotation, and optional drop shadow. Props occlude each other naturally. Each prop's **hit shape is derived from its sprite's alpha silhouette** (with a small tolerance dilation for touch), never a hand-drawn invisible rectangle.
- **Overlay layer** — foreground occluders (a curtain edge, a crate in front), ambient effects (dust motes, steam, lantern flicker), and the light pass for variants.

**Why layered is non-negotiable:**
1. **Multiple rounds per scene** — target lists are drawn from the tagged prop pool; different rounds can even use *placement variants* (a subset of decoys shuffled between authored anchor positions) so revisits read differently.
2. **Fairness tuning** — a prop that playtests as too hard can be nudged, rescaled, or re-lit individually without repainting the scene.
3. **Variants** — night/storm/ransacked states recompose the same pool cheaply.
4. **Found-object feedback** — the found prop physically lifts out of the scene and flies to the tray; the scene visibly "empties" as the search progresses, which is both satisfying and a soft difficulty easing.
5. **Crisp zoom** — props render sharply at 3× zoom instead of upscaling a flat plate.

### 7.2 Density & target counts

- **Tagged props per scene:** 40–110 (median ~65). Every tagged prop maps to a semantic concept (Section 8.1) — including decoys. Untagged background detail is painted, not sprited.
- **Targets per round:** **8–14**, tuned by position in the campaign:
  - Chapter 1: 8–10 targets
  - Chapters 2–4: 10–12
  - Chapters 5–6: 12–14
- **Target mix per round:** ~70% new-to-player concepts, ~30% review concepts scheduled by the vocabulary model (Section 8.5). The evidence find (story item) is always included and always findable without language knowledge (it's visually distinct and narratively cued).
- **Decoy discipline:** at least 3 plausible decoys per target's semantic neighborhood (a *key* target sits in a scene that also contains a padlock, a keyhole plate, and a key-shaped bottle opener — all tagged, all potential future targets).

### 7.3 Fair HOG difficulty (the Fairness Charter)

Every target in every round must pass all of these checks in the authoring tool:

1. **Minimum size:** target's visible bounding area ≥ **0.9% of scene width** in its longest dimension at 1× zoom (≈ 30 px at 1080-wide baseline). Nothing microscopic, ever.
2. **Occlusion cap:** ≤ 60% of the prop's silhouette may be occluded; the visible portion must include a recognizable feature (a teapot hidden except its spout is fine; except a featureless curve is not).
3. **Contrast floor:** target silhouette vs. immediate surround must meet a minimum luminance/chroma separation (validated by tooling; night variants get lantern pools placed to keep targets inside lit regions).
4. **Edge safety:** no target's center within 4% of any scene edge, and never under persistent UI (tray, notebook button).
5. **Findable at 1×:** zoom is comfort, not requirement. Every target must be honestly identifiable without zooming on a 360-px-tall phone viewport.
6. **Camouflage honesty:** color-camouflage (brown violin on brown shelf) is allowed as a *late-game* spice, max 2 targets per round, and never combined with heavy occlusion on the same target.
7. **Semantic fairness:** the target must be a *typical* visual exemplar of its concept. If the player knows what *der Schlüssel* means, the on-screen key must read as a key. Stylized or ambiguous props may be decoys, never targets.

**Difficulty comes from:** scene density, semantic decoys, gentle camouflage, occlusion up to the cap, smaller (but never sub-minimum) targets, and — chiefly — the *language* layer (does the player know the word?). It never comes from unfair rendering.

### 7.4 Zoom & pan

- **Zoom:** 1×–3×, pinch on touch, scroll-wheel or +/− keys on desktop, double-tap/double-click to toggle 1×↔2× centered on the point.
- **Pan:** drag (touch or mouse); edge-glide when zoomed. Inertial, clamped to scene bounds.
- **Tray behavior:** target tray stays fixed during zoom/pan; a mini-map dot appears when zoomed past 1.5× so players don't get lost.
- **Fairness interaction:** hint highlights (Section 9.2) render in *scene space* and remain visible/indicated at any zoom (off-screen hint regions show an edge arrow).

### 7.5 Input & mistap handling

- Tap/click a prop: if it matches an active target → found (audio + word card + fly-to-tray). If it's a tagged non-target → gentle "not on the list" shimmer and, at New/Basics proficiency, a free micro-reveal: the tapped object's word flashes for 1.5 s ("curiosity is rewarded, not punished").
- **Anti-scrub:** 3 mistaps within 2 s → 0.8 s input cooldown with a soft "steady…" cue. No score damage beyond the round's accuracy star. No timer penalties (there is no timer).
- Found-object feedback: prop lifts with a paper-snap sound, its **word card** (target word + article + English gloss + speaker icon) floats for 2 s, audio auto-plays, tray chip flips to "found."

### 7.6 Round completion

Completing a round shows a compact results card: words found (with articles), accuracy star, no-search-hint star, streak star (best consecutive finds), then flows directly into the **Debrief** (Section 8.4), then the **clue** close-up. Total post-round flow ≤ 90 s.

---

## 8. Language Learning Design

### 8.1 Semantic concepts, not filenames

The vocabulary system is built on **semantic concept IDs** — stable, language-neutral keys of the form `object:key`, `object:teapot`, `object:lantern`, `object:violin`. **Nothing in the language layer ever binds to an art filename, sprite ID, or scene coordinate.**

Illustrative structure (design contract, not code):

```
concept: object:key
  domain: household
  tags: [metal, small, openable-related]
  art: → any number of prop sprites across scenes may declare they DEPICT object:key
  lexemes:
    de: { article: "der", word: "Schlüssel", plural: "die Schlüssel", audio: ✓, gloss: "key" }
    es: { article: "la",  word: "llave",     plural: "las llaves",   audio: ✓, gloss: "key" }
    it: { article: "la",  word: "chiave",    plural: "le chiavi",    audio: ✓, gloss: "key" }
```

Rules:

- **Many sprites → one concept.** The brass key in the Curator's Office and the iron key in the Boathouse both depict `object:key`. Finding either strengthens the same word.
- **One sprite → exactly one concept** (its most typical reading). Ambiguous props don't get tagged as targets (Fairness Charter #7).
- **Concepts carry pedagogy metadata:** frequency band (how useful the word is in real life), difficulty band (cognate vs. false friend vs. opaque), domain, and gender-trickiness flag (e.g., German *das Mädchen*-class surprises get extra Debrief attention).
- **Adding a language later = adding a lexeme column.** No scene, art, or logic changes. This is the single most important architectural constraint in the game.

### 8.2 Languages & articles (v1)

German, Spanish, Italian. **Words are never shown or spoken without their article.** The article is part of the word as far as Case & Seek is concerned.

| Language | Articles taught | Notes |
|---|---|---|
| German | der / die / das (+ plural die) | Gender is the famous pain point; Debrief article-picks are weighted toward German learners |
| Spanish | el / la (+ los / las) | Regular but with classic traps (el agua, la mano) — trap words flagged in concept metadata |
| Italian | il / lo / la / l' (+ i / gli / le) | Phonological article selection (lo specchio, l'arancia) is taught by exposure; Debrief occasionally asks "il, lo, or la?" |

- **Display convention:** tray chips show `der Schlüssel` (article visually distinguished — slightly lighter weight plus a small gender glyph ▲/●/■ for der/die/das so the cue survives colorblindness; equivalent glyph pairs for es/it). Optional subtle gender tinting exists as a setting, **off by default**, never the only cue.
- **Audio convention:** article + noun recorded as one natural phrase per lexeme by a native speaker; slow-replay variant available on long-press.
- **Plural exposure:** when a round asks for multiples ("die Flaschen ×3" — find 3 bottles), the plural form is shown and spoken. Multi-find targets are the plural-teaching mechanism; used 1–2 times per round from Chapter 2 on.

### 8.3 Proficiency tiers (chosen at New Case; changeable anytime in settings)

Proficiency changes **language scaffolding**, not search fairness. Scene composition and target physics are identical across tiers.

| Tier | Onboarding label | Tray chip shows | Word intro | Audio | Dialogue garnish |
|---|---|---|---|---|---|
| **New** | "I'm new to it" | Target word + article **and** English gloss, always | New words get a 3 s intro card (image + word + audio) before the round starts (max 5 intros/round) | Auto-plays on chip focus and on find | None |
| **Basics** | "I know the basics" | Target word + article; gloss on tap (translation hint, free) | No pre-round intros; word cards on find only | Auto-plays on find; on-demand on chip | None |
| **Conversational** | "I can hold a conversation" | Target word + article; 2–3 chips per round are short descriptive phrases instead ("etwas zum Öffnen einer Tür") | — | On find | Greetings/interjections in target language, tap-to-gloss |
| **Advanced** | "I'm advanced — challenge me" | Mixed: word, description-phrase, or audio-only chips (🔊 chip, tap to hear); English gloss still available via translation hint but visually de-emphasized | — | Primary channel for audio-only chips | Idioms and flavor lines in target language, tap-to-gloss |

The translation-hint system (Section 9.1) is available at **every** tier — Advanced players who blank on a word are never stuck.

### 8.4 The Debrief (learning feedback moment)

Immediately after each round's results card. Duration 45–75 s. Tone: the detective updating the notebook over coffee, not a quiz.

- **3–5 micro-recalls** drawn from the round's found words, weighted toward the words the vocabulary model rates weakest:
  - **Word → image:** the word (with article) shown; tap the matching object among 3 thumbnails from the actual scene.
  - **Article pick:** the noun shown bare; tap der/die/das (or el/la; il/lo/la/l'). German-heavy.
  - **Audio → image:** hear the phrase; tap the object.
- **No fail state.** A miss shows the right answer warmly (word card + audio) and schedules the word for early re-serve. A hit stamps the notebook and adds **+1 hint charge** (capped — Section 9.2).
- **Skippable** after the first chapter (skip forfeits the hint charges; the model still records the found-word exposures).
- **Chapter recap:** at chapter end, a single 60 s "field notes" montage — the chapter's 8 most important words replayed as image+audio, plus the case summary. Pure reinforcement, zero interaction required.

### 8.5 Internal vocabulary model (no SRS UI)

The game runs a spaced-repetition-*informed* scheduler entirely under the hood. **There is no review queue, no due-cards counter, no streak-guilt UI.**

- **Per concept per player, track:** exposure count, find-without-any-hint count, translation-hint-used count, search-hint-used count, Debrief hits/misses, timestamps.
- **Strength score** (0–5 internal): rises with unaided finds and Debrief hits, falls with translation-hint reliance and time decay (gentle half-life measured in days).
- **Scheduling output:** the round-builder's ~30% review slots (Section 7.2) are filled by the lowest-strength words *that have a tagged prop available in the upcoming scene*. If a weak word has no prop in the next scenes, it becomes a Debrief candidate instead.
- **Surfacing to the player:** only as flavor — the WORDS tab shows 0–3 subtle pips per word ("new / seen / known" bands, not the raw score) and the detective occasionally remarks "*der Leuchtturm*… that one keeps slipping." Never a to-do list.
- **Design guardrail:** review pressure must never make a round feel stale — the round-builder rejects review sets that would repeat >2 targets from the player's previous two rounds.

### 8.6 Vocabulary scope & selection

- ~420 concepts authored; **~260 guaranteed served as targets** across a campaign (a given playthrough serves ~285 target slots ≈ 200 unique + 85 review-repeats), remainder appear as decoys, curiosity-tap reveals, and Debrief items.
- Selection priorities: (1) concrete, picturable, unambiguous; (2) high real-world frequency; (3) domain spread per Section 6; (4) article variety (German sets deliberately balance der/die/das); (5) a seasoning of delightful specifics (der Sextant, la brújula) because detectives deserve good props.
- **Not in scope for v1 vocabulary:** verbs, adjectives, abstract nouns as *targets* (they may appear in description-phrase chips at Conversational+, teaching passively).

---

## 9. Hint Systems — Two Separate Systems

**Hard rule: translation help and search help are different systems, different buttons, different visual language, different economies.** Conflating "I don't know this word" with "I can't find this object" would corrupt both the pedagogy and the puzzle. Blueprint:

| | Translation Hint | Search Hint |
|---|---|---|
| Question it answers | "What does *der Fernrohr*… wait, *das Fernrohr* mean?" | "Where is the telescope?" |
| Trigger | Tap/flip the target chip in the tray | Hint button (magnifying-glass), then choose target (or nearest-to-done auto-picks) |
| Cost | **Free, unlimited** | 1 charge per escalation stage |
| Reveals location? | **Never** | Progressively |
| Records | Marks the word "assisted" for the vocab model | Marks the *find* assisted (affects round star only) |
| Visual language | Chip flips to gloss card (paper flip, notebook aesthetic) | Golden lens glow in the scene (detective's magnifier aesthetic) |

### 9.1 Translation hints

Tapping a tray chip flips it to reveal: English gloss, article + gender glyph, audio replay (normal + slow), and — at New/Basics — a thumbnail *of the concept in general* (a generic key icon), **never** the scene's actual prop. The chip flips back after 4 s or on tap. Unlimited, free, always. The only cost is honest: the vocabulary model logs the assist, so the word will come back sooner.

### 9.2 Search hints — three-stage escalation

Charges: the **Insight meter**, max 3 charges. Starts each round full. Regains: +1 per Debrief hit (bankable up to the cap into the next round), +1 per 3 minutes of active searching within a round (idle doesn't count). Never purchasable. Never expires.

Escalation per target (stages must be taken in order for that target):

1. **Region pulse (1 charge):** a soft golden pulse washes over a large region — roughly a quarter of the scene — containing the target. Lingers 5 s, replayable memory-ring stays faint for 20 s.
2. **Smaller circle (1 charge):** the lens tightens to a circle ~15% of scene width around the target. Lingers 5 s.
3. **Exact object (1 charge):** the target itself sparkles for 3 s. Finding it still requires the tap (and still plays the full word card + audio — the learning moment is preserved even on a full reveal).

Stages are per-target: escalating on the teapot doesn't spend the key's stages. Switching targets mid-escalation is allowed; prior stages on the old target remain "banked" for that target this round.

### 9.3 Anti-frustration nudge (automatic, free)

If 90 s pass with no find and no hint use, a faint ambient shimmer plays once over the *region* of a random unfound target (equivalent to a free stage-1, unlogged). Repeats at most every 90 s. Toggleable off in settings ("Purist mode"). This is the genre's kindness valve — players should end sessions because they're done, not because they're stuck and out of goodwill.

---

## 10. Puzzles

**9 puzzles across the season (5–10% of playtime).** Puzzles are evidence-flavored, diegetic, and each type appears at most twice. Every puzzle is skippable after 2 failed attempts or 3 minutes (skip = story continues; the CLUES tab marks it "solved off-screen by Margo" with gentle humor; no reward loss except the puzzle's achievement stamp).

| # | Ch. | Puzzle | Type | Language tie-in |
|---|---|---|---|---|
| 1 | 1 | The frame's hidden lining | Torn-paper reassembly (drag/rotate fragments) | Reassembled pawn ticket shows 3 learned words in situ |
| 2 | 2 | Harbor master's lockbox | Combination-from-clues (numbers hidden in prior scene finds) | None (pure deduction breather) |
| 3 | 2 | Shipping manifest | Pairs board: match 8 word cards to cargo images | **Pairs mode** as a puzzle, not a search |
| 4 | 3 | Casal's ledger cipher | Substitution-cipher wheel (short, 12-letter solution) | Solution word is a learned vocabulary item |
| 5 | 3 | The suite's luggage | Silhouette sort: place 6 objects into their outline positions | Reinforces shape↔word memory |
| 6 | 4 | Dead-drop lantern code | Light-sequence memory (Simon-like, 4→7 steps) | None |
| 7 | 4 | Pigment mixing bench | Ratio/recipe puzzle from the loft's notes | Color words taught passively in labels |
| 8 | 5 | Auction lot shuffle | Logic grid lite (3×3, statements from dossiers) | Statements reference PEOPLE tab facts |
| 9 | 6 | The station clock | Align clock hands per telegram riddle | Numbers/time flavor |

Design rules: no puzzle requires language knowledge to *solve* (language ties are enrichment, not gates); no puzzle exceeds 6 minutes at first encounter; every puzzle's fiction is "the detective handling evidence."

---

## 11. The Notebook

The Notebook is the game's soul object: the persistent meta-UI, opened via the leather-book button, styled as the detective's actual notebook. Four tabs, exactly:

### CASE
- Running case summary: one hand-written line per completed beat, grouped by chapter.
- Current objective, always phrased as an action ("Search the Customs Warehouse for the crate stamp").
- Chapter progress strip (searches/puzzles done).
- This is the "I've been away two weeks" recovery surface — reading the last three lines re-onboards a returning player in ten seconds.

### PEOPLE
- Dossier cards for the 8 cast members: portrait, role, status stamp (ally / suspect / cleared / unknown), and auto-appended facts as beats reveal them ("Finch owes the Anchor's bookmaker 40 crowns").
- Cards update visibly (a new fact slides in with a stamp sound) — the player watches suspicion shift without any manual deduction chore.

### CLUES
- The evidence board: found story items pinned with string connections that draw themselves as chapters conclude.
- Each clue is examinable in close-up with the detective's margin notes.
- At three season moments (end of Ch. 2, 4, 6), a **Board Review** beat has the player tap the two clues that connect (from 4–5 pinned) — a light deduction ritual, generous with retries, that makes the player feel like the detective rather than a passenger.

### WORDS
- The vocabulary journal: every encountered word as a collectible card — thumbnail (generic concept art), word with article and gender glyph, speaker button (normal/slow), the location where it was first found, and 0–3 strength pips (new/seen/known).
- Filter by chapter, domain, or "words that keep slipping" (bottom strength band — the *only* surfacing of the internal model, framed as flavor).
- Per-location "field notes complete" stamps for completionists.
- **Explicitly absent:** review queues, due counts, drill buttons, streaks, XP. The WORDS tab is a trophy room, not a to-do list.

---

## 12. Difficulty & Progression

Two orthogonal axes, deliberately kept separate:

### Axis 1 — Language proficiency (player-chosen: New / Basics / Conversational / Advanced)
Defined in Section 8.3. Changes scaffolding only. Changeable anytime; changing mid-campaign re-tiers future rounds without touching past progress.

### Axis 2 — Search & story difficulty (campaign-authored ramp)
- **Ch. 1:** 8–10 targets, high-contrast scenes, minimal occlusion, no camouflage, hint meter refills fast (+1/2 min). Tutorialization: round 1 teaches tap-to-find; round 2 teaches chip-flip translation hints; round 3 teaches the search-hint escalation (one free demonstration charge).
- **Ch. 2–3:** 10–12 targets, occlusion up to 45%, first multi-find plurals, first mode variants (silhouette, pairs-as-puzzle).
- **Ch. 4–5:** 10–13 targets, night scenes, camouflage seasoning (≤2/round), description-phrase chips (Conversational+), occlusion to the 60% cap.
- **Ch. 6:** 12–14 targets, the season's densest compositions, the Evidence Sweep finale — hard but built entirely of *reviewed* content, so it plays as a victory lap, not a wall.

No lives, no fail states, no energy, **no timer anywhere in the campaign**. The only "difficulty currency" is the Insight meter, and it regenerates through play.

### Post-campaign (replayability, v1-light)
- **Sprint replays:** any completed round replayable with an *optional* timer and fresh randomized target lists from the scene's pool; personal-best times. This is the only timed content in the game and it is 100% opt-in and post-completion.
- **Field-notes completion:** chase the untaught decoy words via curiosity taps and replays.
- A second New Case in a different language reuses every scene with a fresh vocabulary journey — the semantic-concept architecture makes trilingual replay a first-class feature, not an afterthought.

---

## 13. New Case Flow (Onboarding)

Target: **language → proficiency → story → first found object in ≤ 2 minutes.** Measured, not aspirational — this flow is a release gate.

1. **(0:00–0:15) Language.** Full-screen, three beautiful notebook covers: *Deutsch — German*, *Español — Spanish*, *Italiano — Italian*, each with a spoken greeting on hover/focus. One tap.
2. **(0:15–0:35) Proficiency.** Four plain-English cards: *"I'm new to it" / "I know the basics" / "I can hold a conversation" / "I'm advanced — challenge me"*, each with one line describing what the tray will look like, and the reassurance line: **"You can change this anytime — it never resets your case."** One tap. No placement test (a test is friction; the free unlimited translation hints make a wrong self-assessment cheap, and settings fix it in two taps).
3. **(0:35–1:20) Cold open.** The letter under the door — a single atmospheric panel sequence, ~40 s at reading speed, skippable at 10 s. Establishes: painting stolen, frame hollow, insurers desperate, gallery access at dawn.
4. **(1:20–2:00) First search.** The Detective's Office tutorial round: 8 targets, generous sizes, the first tap is soft-guided (the coat-rack keys shimmer once). First find fires the full reward stack — audio, word card *der Schlüssel / la llave / la chiave*, fly-to-tray — inside the two-minute mark.

Account creation is **not** in this flow. Play starts instantly with a local profile; an optional "protect your case file" sync prompt appears after Chapter 1 (Section 17).

---

## 14. Search Mode Catalog

**Standard Word-List search is the backbone: ≥ 80% of all rounds (23 of 27).** Optional modes are seasoning — each used sparingly, each introduced by a story reason, none appearing before Chapter 2. Budget below is the season total.

| Mode | What it is | Language value | Season budget | Placement rule |
|---|---|---|---|---|
| **Word-List (standard)** | Tray of 8–14 target-language words with articles | The core lesson | 23 rounds | Everywhere |
| **Silhouette** | Tray shows object outlines instead of words; finding reveals the word+audio as a *surprise* | Shape→word binding; a breather from reading | 1 round (Ch. 3 hotel suite) + 1 puzzle | Never two in a row; always followed by a word-list round reusing ≥4 of the same concepts |
| **Audio** | Chips are speaker icons; the phrase is spoken, replay free | Listening comprehension | 1 round (Ch. 4 night market — "follow the vendors' calls") | Conversational+ get it as authored; New/Basics get word+audio chips instead (mode softens, never blocks) |
| **Description** | Chips are short target-language phrases ("something that shows you the time") | Reading comprehension, circumlocution | 1 round (Ch. 5 auction house) | Conversational+ as authored; below that, phrase + gloss-on-flip |
| **Evidence Sweep** | All targets are story objects with proper names (untranslated) — pure narrative search | Review-by-context: finale sweep is built from season-taught concepts' scene props | 1 round (Ch. 6 finale) | Finale + optional replays |
| **Pairs** | Match word cards to image cards on a board (not an in-scene search) | Explicit word↔image consolidation | Appears only as Puzzle #3 | Never replaces a search round |

Rule of restraint: a player who dislikes gimmick modes loses nothing — alternate modes never carry unique vocabulary (their concepts re-appear in standard rounds) and never gate clues behind mode-specific skill.

---

## 15. UX & Screens

### Screen map

```
Boot → Title ─┬─ Continue (default, most-recent case)
              ├─ New Case (Section 13 flow)
              ├─ Case Files (saved cases: language/chapter/progress per slot)
              └─ Settings

In-game shell:
City Map ⇄ Location (Search / Beat / Puzzle) ⇄ Notebook (overlay, 4 tabs)
```

### Search screen layout (landscape)
- **Scene viewport:** full-bleed.
- **Target tray:** bottom strip of word chips (scrollable if >8); chips show word+article+gender glyph; tap = flip (translation hint); long-press = slow audio. Found chips fold into a compact "found" stack.
- **Top-left:** back/pause (autosaves instantly), objective breadcrumb.
- **Top-right:** Insight meter (3 lens segments) + hint button; Notebook button.
- **Portrait mode:** tray docks right-side vertical; all fairness checks re-validated for the portrait safe area.

### Feel & juice
- Found: prop lift + paper-snap + word card + soft chime; article glyph pings.
- Debrief: rubber-stamp thunks, pencil scribbles.
- Evidence find: heartbeat pause, iris-in to close-up, string-pin sound on CLUES add.
- All motion respects reduced-motion setting (Section 18).

### Settings (complete v1 list)
Language of study (switch = new case slot; existing cases keep theirs) · Proficiency tier (live-changeable) · Text size (3 steps) · Dyslexia-friendly font · Gender color tinting on/off · Reduced motion · Purist mode (disables auto-nudge) · Audio sliders (music/SFX/voice) · Slow-audio default · Left-handed tray flip · Sync on/off.

---

## 16. Audio Design

- **Vocabulary voice:** one native-speaker voice per language (studio-recorded, not TTS, for v1's ~1,260 lexeme phrases; article+noun as one natural utterance; a slow variant each). Consistent voice = the "teacher in your ear" the player comes to trust.
- **Music:** cozy-noir chamber palette (piano, clarinet, brushed drums, vibraphone); one theme per chapter with location-layer stems; search music is deliberately sparse mid-frequency so vocabulary audio always sits clearly on top (side-chain duck on word playback).
- **SFX:** the notebook/paper/stamp family is the signature set; found-object sounds vary by material family (glass, metal, cloth, wood) — a subtle extra semantic cue.
- **No story voice acting in v1** (text beats only) — budget goes to flawless vocabulary audio instead. Story VO is a Season Two candidate.

---

## 17. Save System & Offline-First

### Principles
1. **Local-first:** the device's storage is the source of truth. The game is fully playable offline after content is cached. Accounts and sync are optional accessories.
2. **Never lose a find:** autosave granularity is *per found object*, *per Debrief answer*, *per beat completed*. A closed tab mid-round resumes mid-round with found targets intact.
3. **Instant resume:** Title → Continue restores the exact prior screen.

### Design specification (behavioral, not code)
- **Storage:** browser persistent storage (IndexedDB-class) holding: profile, per-case progress (chapter/beat/round state), full vocabulary model, settings. Save schema is versioned with forward migrations from day one.
- **Content caching:** service-worker app shell + **per-chapter asset bundles** (scene layers, audio, ~15–25 MB each). Chapter N+1 prefetches in the background while N is played; an explicit "Download chapter for offline" control exists for players about to board a plane. Cold start after install-cache: playable with zero network.
- **Multiple cases:** case slots (one per language/run) are independent saves sharing nothing except settings. The vocabulary model is **per case** (your German strength doesn't pollute your Italian case).
- **Optional sync:** after Chapter 1, a single gentle prompt: "Protect your case file?" — email magic-link account. Sync policy: per-case latest-wins on story progress; **vocabulary model merges by taking per-concept max-strength + summed exposure counts** (never lose learning from either device). Conflicts surface only if two devices diverge on the *same case's* story position, resolved by a "keep which?" picker showing chapter/timestamp.
- **Data respect:** full local export/erase controls in settings. No progress is held hostage by the account system.

---

## 18. Accessibility

- **Vision:** gender glyphs never color-only; hint glows use luminance + motion, not hue alone; full UI at 3 text sizes; scene zoom to 3× doubles as low-vision support (with fairness still validated at 1× so zoom users aren't *required* to zoom, they're *helped* by it).
- **Motor:** hit-shape dilation on touch; no drag-required interactions in searches (drag exists only in 3 puzzles, each with a tap-based alternative); no timing-based inputs anywhere in the campaign.
- **Hearing:** audio-mode chips always long-press to reveal the written word (audio-first, never audio-only); all SFX cues have visual twins.
- **Cognitive:** CASE tab recap; objectives always visible; no fail states; Purist-mode nudges *on* by default; dyslexia-friendly font option; reading-speed text with tap-to-complete, never auto-advancing story.
- **Vestibular/photosensitive:** reduced-motion setting swaps flies/pans for fades; no flashing above safe thresholds; storm lightning in Ch. 6 is pre-checked and has a reduced variant.

---

## 19. Content Pipeline & Authoring Rules

The design contract between design, art, and the (later) implementation phase.

### 19.1 The Concept Dictionary
- Single source of truth: ~420 semantic concepts (Section 8.1), owned by design + a language lead per target language.
- Each concept row: `concept_id (object:*)`, English gloss, domain, frequency band, difficulty band, per-language lexeme (article, word, plural, audio asset key, trap-word flag), pedagogy notes.
- **Native-speaker review is a release gate** for every lexeme (article correctness, regional neutrality — e.g., prefer pan-Hispanic terms; where variants are unavoidable, pick one and note it).

### 19.2 Scene authoring rules
1. Author the background plate with *zero* findable detail painted in — anything findable is a prop sprite.
2. Tag every prop sprite with exactly one concept ID (or `untagged:ambience` for pure dressing, used sparingly).
3. Each scene declares its **prop pool** (all tagged props) and 2–4 authored **round templates** (curated target lists satisfying: 8–14 targets, domain spread, decoy-neighborhood rule, evidence-find slot, Fairness Charter pass, and ≥ 60% concept-disjointness between the scene's templates).
4. Variants (night/ransacked) are authored as prop-stack deltas: moved/added/removed props + light pass; each variant re-runs all fairness validation.
5. The authoring tool must render automated Fairness Charter checks (size %, occlusion %, contrast, edge safety) as pass/fail per prop per template — scenes ship only at 100% pass. (Tool requirement recorded here; built in implementation phase.)

### 19.3 Round-builder rules (runtime behavior spec)
- Start from the location's next authored template; fill its review slots (~30%) from the vocabulary model's weakest eligible words with props in this scene's pool; enforce the no-stale-repeat guardrail (Section 8.5); apply proficiency-tier chip presentation (Section 8.3).
- Deterministic per save-seed so a resumed round rebuilds identically.

### 19.4 Localization scope
- UI strings: English only (v1), but externalized from day one (UI localization is a Season Two lever).
- Learning content: the three lexeme columns + recorded audio. Story text: English only.

---

## 20. Genre Research — Patterns Adopted & Rejected

Design-pattern analysis of the genre's leaders. **Patterns only — no IP, no art, no names, no story elements are copied.**

### June's Journey (Wooga)
| Pattern observed | Case & Seek decision |
|---|---|
| Impeccable scene readability at high density; painterly lighting guides the eye | **Adopt** — Fairness Charter codifies it (contrast floor, occlusion cap) |
| Scene-mastery via repeated visits with fresh lists; scenes feel like places you *know* | **Adopt, adapted** — 1–3 rounds per scene with disjoint templates + variants; mastery expressed as WORDS field-notes stamps, not star grinding |
| Compact bottom target tray; find→fly-to-tray feedback | **Adopt** — extended with word-card + audio moment |
| Energy system gating session length; timed scoring pressure | **Reject** — no energy, no campaign timer; sessions end when players choose |
| Star-grind gating story behind scene replays | **Reject** — story never gated by replays |

### Hidden City (G5)
| Pattern observed | Case & Seek decision |
|---|---|
| Mode variety on the same scene (silhouette, night/anomaly variants, pairs) keeps content fresh | **Adopt, restrained** — mode catalog (Section 14) capped at ~15% of rounds; variants recomposed, not filtered |
| Scene "states" (curses/night) as content multipliers | **Adopt** — 7 authored variants with real prop deltas |
| Aggressive event/limited-time pressure and gacha-adjacent rewards | **Reject** — nothing time-limited in v1 |
| Long-term collection meta driving retention | **Adapt** — the vocabulary journal *is* the collection; no crafting-material slot machine |

### Seekers Notes (MyTona)
| Pattern observed | Case & Seek decision |
|---|---|
| Hint tools that recharge through play; multiple hint "shapes" | **Adopt, redesigned** — single Insight meter with 3-stage escalation; recharge via Debrief hits + active search time; never purchasable |
| Crafting/inventory meta layered over searches | **Reject** — meta weight goes to the case board and word journal instead |
| Rotating search modes as level modifiers imposed on the player | **Adapt** — modes are *authored* at story-appropriate moments, never imposed randomly |

### Big Fish HOPA tradition (Mystery Case Files et al.)
| Pattern observed | Case & Seek decision |
|---|---|
| Chaptered detective narrative with evidence puzzles between searches | **Adopt** — the entire loop skeleton (Section 3) is the HOPA structure, tuned to a 65–75% search share |
| Interactive close-ups and clue examination as reward beats | **Adopt** — evidence finds + CLUES tab close-ups |
| Junk-pile scene density as the genre's texture | **Adopt with fairness discipline** — density yes (Customs Warehouse, 110 props), microscopic/unfair placement no (Charter) |
| Sprawling item-combination adventure logic (use crowbar on 3-scenes-ago door) | **Reject** — inventory logic capped at "clue unlocks next beat"; no backtracking fetch chains |
| Timer-based hint recharge only | **Adapt** — time-based recharge kept, but the primary charge source is learning performance (Debrief), aligning the reward loop with pedagogy |

**Synthesis:** Case & Seek takes the HOPA narrative skeleton, June's-style scene craft and fairness, Hidden City's variant economy (defanged), and Seekers-style recharging hints — then replaces the genre's monetization pressure (energy, timers, gacha) with a pedagogy engine, because our retention loop is *the player is actually learning a language*.

---

## 21. Success Metrics

Design-level targets to instrument (telemetry is anonymous, opt-out, and never blocks offline play — events queue locally and flush when online):

| Metric | Target | Why |
|---|---|---|
| Time to first found object (new player) | ≤ 2:00 | Onboarding gate (Section 13) |
| Median first-playthrough length | 4.5–7.5 h | Scope promise |
| Search share of session time | 60–78% | Core-loop health rail |
| Per-target median find time | 8–45 s | <8 s = too easy; >45 s = Fairness Charter review for that prop |
| Search-hint stage-3 usage | <10% of finds | Fairness canary |
| Translation-hint usage at New tier | 30–60% of chips | Scaffolding is being used, not ignored or leaned on totally |
| Debrief participation (post-Ch. 1, when skippable) | >70% | Is the learning moment genuinely pleasant? |
| Words at "known" band by campaign end | ≥ 180 median | The learning promise |
| Chapter 2 → 3 continuation (post-purchase-wall) | >80% of purchasers | Story hook health |
| Offline sessions completing without data loss | 100% | Non-negotiable |

---

## 22. Scope, Risks & Out of Scope

### V1 ships
Season One complete (6 chapters, 16+1 locations, 27 rounds, 9 puzzles, 8 cast) · 3 languages with full articles + studio audio · 4 proficiency tiers · both hint systems · Notebook (4 tabs) · Debrief + invisible vocab model · offline-first saves + optional sync · Sprint replays · accessibility set (Section 18) · desktop + mobile browser.

### Explicitly out of scope (v1)
More languages · UI localization · story voice acting · multiplayer/co-op · live events/dailies · user-generated content/level editor · achievements platforms · native app wrappers · verbs/grammar drills · any monetization beyond the single season unlock.

### Top risks & mitigations
1. **Art cost of layered scenes** (16 locations × 40–110 props). *Mitigation:* shared prop library across scenes (a concept's sprite family reused with palette/wear variants — semantically ideal, since re-encountering *the same word as a different-looking prop* is good pedagogy); density budget concentrated in 4 showcase scenes.
2. **Vocabulary audio volume** (~1,260 phrases × 2 speeds). *Mitigation:* batch studio sessions per language; lock the concept dictionary before recording; TTS only as temporary dev placeholder, never shipping.
3. **Review scheduling makes rounds feel samey.** *Mitigation:* no-stale-repeat guardrail + 60% template disjointness + prop-family variety; playtest flag if any tester reports "I just found this."
4. **Proficiency self-selection errors.** *Mitigation:* free unlimited translation hints make over-selection cheap; a gentle one-time suggestion ("Chips getting flipped a lot — want glosses always on?") after sustained signals, two taps to accept, never nags again.
5. **Browser storage eviction losing saves.** *Mitigation:* request persistent-storage permission at first save; sync prompt after Chapter 1; export control.

---

## 23. Glossary

| Term | Meaning |
|---|---|
| **Round** | One search session in a scene with one target list (8–14 targets) |
| **Scene** | A location's searchable composition (a variant is a distinct scene sharing a location) |
| **Concept** | Language-neutral semantic ID (`object:key`) binding props to lexemes |
| **Lexeme** | A concept's realization in one language: article + word + plural + audio + gloss |
| **Template** | An authored, fairness-validated candidate target list for a scene |
| **Debrief** | The 45–75 s post-round recall moment |
| **Insight meter** | The 3-charge search-hint resource |
| **Evidence find** | The story-critical target in each round |
| **Fairness Charter** | The seven authoring checks in Section 7.3 |
| **Word card** | The find-moment UI: word + article + gloss + audio |

---

*End of document. Next phase: systems/technical design and content production planning. This document is the design authority for both.*
