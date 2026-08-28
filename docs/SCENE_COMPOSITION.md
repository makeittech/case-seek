# Case & Seek — Scene Composition Bible

**Season One: *The Hollow Frame*** — Marlowe Bay, 1927
**Version:** 1.0 (Composition Lock Candidate)
**Author:** FABLE, Hidden Object Game Art Director
**Authority:** Obeys `/workspace/docs/GAME_DESIGN.md` (GDD — structure, densities, fairness), `/workspace/docs/STORY_BIBLE.md` and `/workspace/content/story/` (story fact, clue IDs, round purposes), and `/workspace/docs/ART_BIBLE.md` (style, palette, lighting states, camera bands, generation rules). **Specs only — no images generated at this phase.**

This document specifies **every searchable composition** in Season One: **22 scene plates** (19 base compositions + 3 recomposed variants) serving **29 search rounds** (S00 tutorial + S01–S28), per the GDD §6 location inventory and the season round index in `/workspace/content/story/season.md`.

---

## 1. How to Read a Scene Spec

Each scene entry carries:

- **Scene ID / Location / Rounds served** — plate identifier, GDD location number and state, and the rounds (S-numbers) that play on this plate.
- **Narrative purpose** — why the player searches here (from the round purpose files; the search must always be honest detection, never "because game").
- **Camera** — specific application of ART_BIBLE §6.1 (all plates: 160 cm eye height, 35 mm equiv, ≤5° down-tilt, 21:9 master with 16:9 shipping crop unless noted).
- **Lighting** — ART_BIBLE §5 state + scene-specific key sources and pool layout.
- **Background structure** — the non-interactive plate: architecture, fixed furniture, sky. Authored with zero findable detail (GDD §19.2).
- **Foreground / Midground / Background** — the three placement bands (prop camera angles per ART_BIBLE §6.2) and what lives in each.
- **Clutter families** — the semantic families that make up the prop pool (drives family-batched sprite production and decoy discipline).
- **Target pools** — authored target concepts per round (from the story files; the runtime round-builder adds ~30% review slots per GDD §19.3, so pools list the authored template spine).
- **Decoy pools** — the semantic-neighborhood decoys satisfying GDD §7.2 (≥3 plausible decoys per target neighborhood; all tagged, all potential future targets).
- **Story clues** — evidence finds and secondary plants with clue IDs (STORY_BIBLE §11), plus their close-up asset needs.
- **Required assets** — plate, prop sprite count (tagged density per GDD §6), overlays/FX, close-ups, character overlays, pan path.

### Global standards (apply to every scene; not repeated below)

1. **Densities** are the GDD §6 tagged-prop counts; ~10–15% of each pool is shared-library reuse with palette/wear variants (ART_BIBLE §7.4).
2. **Fairness hooks:** every target placement passes the seven Charter checks (GDD §7.3) in tooling before ship; night/storm scenes author explicit **lantern/lamp pools** and every target sits inside one; no target center within 4% of any edge; bottom-18% tray zone and portrait right-22% zone kept clear of story-critical composition.
3. **Evidence finds** are always visually distinct and narratively cued (GDD §7.2): slightly warmer local key, cleaner edge, and placed at a light-pool focus — findable with zero language knowledge.
4. **Establishing pan:** each plate declares a 5-second pan path (the "casing the room" move, GDD §3) inside the 21:9 overscan; default is a slow left→right drift ending on the focal anchor. Deviations noted per scene.
5. **Plural multi-find concepts** (GDD §8.2) ship 2–3 pose/wear sprite variants each (ART_BIBLE §7.4).
6. **Layer naming:** `LOC##_STATE_BG` (plate) / `_P###` (props, z-ordered) / `_OVL_*` (occluders) / `_FX_*` (effects) / `_LP_*` (light pass). Variants are prop-stack deltas + light pass on the parent plate (GDD §19.2 rule 4).
7. **Text-bearing props** follow the ART_BIBLE §8 greeking + typography-overlay rule; each is flagged `[TXT]` below and declares a quiet text zone.
8. **Clue close-ups** are separate hero assets (ART_BIBLE §6.4) — one per pinned clue, plus the composed side-by-side comparisons noted in scenes.

---

## 2. Scene / Round Matrix

| Scene ID | Location (GDD #) | State | Rounds | Density | Chapter(s) |
|---|---|---|---|---|---|
| SCN-00-OFFICE | Detective's Office (0) | early morning | S00 | 45 | 1 |
| SCN-01-GALLERY-DAY | Museum Gallery (1) | day | S01 | 70 | 1 |
| SCN-01V-GALLERY-STORM | Museum Gallery (1) | night-storm, ransacked (variant) | S27 | 75 | 6 |
| SCN-02-CURATOR | Curator's Office (2) | day | S02, S03 | 60 | 1 |
| SCN-03-ARCHIVES | Museum Archives (3) | lamplit | S04, S21 | 90 | 1, 5 |
| SCN-04-DOCKS-DAY | Harbor Docks (4) | day | S05 | 100 | 2 |
| SCN-04V-DOCKS-FOG | Harbor Docks (4) | fog-dusk (variant) | S07 | 100 | 2 |
| SCN-05-TAVERN | Rusty Anchor Tavern (5) | evening | S06, S08 | 85 | 2 |
| SCN-06-CUSTOMS | Customs Warehouse (6) | lamplit | S09 | 110 | 2 |
| SCN-07-LOBBY | Grand Hotel Lobby (7) | day / evening-service | S10, S12 | 80 | 3 |
| SCN-08-SUITE412 | Hotel Suite 412 (8) | day | S13 | 55 | 3 |
| SCN-09-SHOP-DAY | Casal's Antique Shop (9) | day | S11 | 105 | 3 |
| SCN-09V-SHOP-NIGHT | Casal's Antique Shop (9) | shuttered-night (variant) | S23 | 105 | 5 |
| SCN-10-MARKET | Night Market (10) | night | S14, S15 | 95 | 4 |
| SCN-11-LOFT | Artist's Loft (11) | dawn | S17, S18 | 75 | 4 |
| SCN-12-DEPOT | Tram Depot (12) | night | S16 | 70 | 4 |
| SCN-13-AUCTION | Auction House (13) | evening | S19, S20 | 85 | 5 |
| SCN-14-CONSERVATORY | The Conservatory (14) | day | S22 | 65 | 5 |
| SCN-15-CLOCKTOWER | Clocktower Workshop (15) | lamplit | S24 | 60 | 5 |
| SCN-16-STATION | Central Station (16) | night | S25 | 90 | 6 |
| SCN-17-PIER | Boathouse & Ferry Pier (17) | storm | S26 | 70 | 6 |
| SCN-18-ROOFTOP | Belmont Rooftop (18) | night-storm | S28 | 50 | 6 (finale) |

Rounds sharing a plate use **≥60% concept-disjoint templates** (GDD §19.2 rule 3); template strata noted per scene.

---

## 3. Scene Specifications

---

### SCN-00-OFFICE — Detective's Office (Hub) — "Kit Before Dawn"

- **Scene ID:** SCN-00-OFFICE · **Location:** #0 Detective's Office, early morning · **Rounds served:** S00 (tutorial, 8 targets, density 45)
- **Narrative purpose:** Assemble the working kit before the dawn appointment at the Belmont; establish Halloway through property — 41 numbered notebooks, labeled jars, the cat that isn't Halloway's cat. Teaches tap-to-find (GDD §13: first find ≤ 2:00).
- **Camera:** snug one-point interior toward the window wall; desk lower-left third, coat rack right golden-section vertical (the soft-guided first find — the keys — hangs there, generously lit). Horizon 55%. Pan path: door → shelves → ends on coat rack.
- **Lighting:** DAY-WARM edged toward dawn: desk lamp amber key (pool 1: desk), cool grey first light through the window (pool 2: coat rack/window), warm dim fill on the shelf wall (pool 3). Cozy, high-contrast, tutorial-honest.
- **Background structure:** small third-floor office — window with rooftop-and-harbor view (North Mole on the skyline per ART_BIBLE §10), shelf wall of numbered notebooks, filing cabinets, door with frosted glass, floorboards, wainscoting. The **wall map of Marlowe Bay** (city-map UI ancestor) painted as plate feature.
- **Foreground:** desk edge with tea things, letter, magnifier (20° band). **Midground:** desk top, chair, coat rack, small stove, cat basket (15°). **Background:** notebook shelves, jar wall, filing cabinets, window sill (8°).
- **Clutter families:** stationery/paperwork · outerwear & rain kit · tea & kitchenette · detective's instruments · labeled-jar oddities (ambience-leaning).
- **Target pool (S00):** object:key · object:notebook · object:magnifier · object:coat · object:hat · object:lamp · object:cup · object:umbrella.
- **Decoy pools:** key neighborhood (padlock, keyhole escutcheon, key-shaped bottle opener); paper neighborhood (envelope, folder, calendar); wearables (scarf, glove, boot); light sources (candle, matchbox, second lamp shade); vessels (teapot, saucer, jar).
- **Story clues:** evidence find — **the Gallery One dawn pass** (brass token clipped to Pettibone's letter `[TXT]`); plants — wall map (map-UI fiction), blank notebook 41 (WORDS-tab fiction). Close-ups: dawn pass + letter (1).
- **Required assets:** 1 plate (21:9) · 45 tagged prop sprites (incl. hero variants of key/hat/notebook reused season-wide) · Witness-the-cat overlay sprite (ambience) · FX: dust motes in lamp shaft · 1 clue close-up · pan path. Light pass: single state.

---

### SCN-01-GALLERY-DAY — Museum Gallery — "The Hole in the Wall"

- **Scene ID:** SCN-01-GALLERY-DAY · **Location:** #1 Museum Gallery, day · **Rounds served:** S01 (9 targets, density 70)
- **Narrative purpose:** Process the crime scene: how did a painting leave a locked room without the room noticing? A gallery half-dressed for an unveiling is legitimately full of crates, tools, and dust sheets — inventorying it IS detection. Plants C01 and the season's fair-play geography (service stair).
- **Camera:** wide one-point down the gallery axis; the **hollow frame** on the far wall at the left golden-section vertical — the composition's negative-space anchor (the emptiness is the subject). Horizon 54%. Pan: entry doors → right wall exhibits → settles on the hollow frame.
- **Lighting:** DAY-WARM — tall windows rake warm ivory light across marble; skylight fill; Shadow Teal in the coffers. Pool layout: window shafts (3 pools), frame wall wash (pool 4, slightly warmer — the anchor), crate cluster bounce (pool 5).
- **Background structure:** Beaux-Arts hall — marble floor, pilasters, coffered ceiling, tall windows, the hollow gilt frame ON its patent cradle (plate feature: frame + cradle painted in, since it's story-fixed, with the close-up as separate hero asset), **service-stair door behind a dust sheet** (right edge, visible, unremarked — S27 payoff), roped-off exhibit bays.
- **Foreground:** dust-sheeted bench, open crate with straw, toolbox spill (20°). **Midground:** ladder, velvet rope stanchions (one re-spaced 30 cm — flavor corroboration), packing materials, exhibit plinths (15°). **Background:** frame wall, high sills, chandelier, distant doorway (8°).
- **Clutter families:** unveiling logistics (crates/straw/tools) · museum furniture (ropes/plinths/benches) · maintenance kit (ladder/sheets/gloves) · fixtures (chandelier/sconces/labels `[TXT]`).
- **Target pool (S01):** object:frame · object:rope (velvet) · object:crate · object:ladder · object:glove · object:screwdriver · object:label `[TXT]` · object:bench · object:chandelier.
- **Decoy pools:** fastener neighborhood (nails, tacks, second screwdriver size, pliers — serves the screw evidence find); textile neighborhood (dust sheet, curtain cord, banner); container neighborhood (crate sizes, hatbox, tool chest); rope family (sash cord, twine, picture wire).
- **Story clues:** evidence find — **C01: mounting screw with fresh burr + wrong slot pattern** beneath the frame, with the re-tensioned patent cradle close-up ("swapped, not forced"); plants — service-stair door (S27), split frame lining with paper fragments (→ P1), re-spaced stanchion. Close-ups: C01 screw+cradle composed close-up (1), lining fragments detail (1).
- **Required assets:** 1 plate · 70 tagged sprites · overlay: dust-sheet edge occluder (FG) · FX: window-shaft dust · 2 close-ups · frame+cradle hero rendering (shared with §10 suite) · pan path.

---

### SCN-01V-GALLERY-STORM — Museum Gallery (Night-Storm, Ransacked) — "Twice a Crime Scene"

- **Scene ID:** SCN-01V-GALLERY-STORM · **Location:** #1 variant (prop-stack delta on SCN-01 plate + storm light pass) · **Rounds served:** S27 (13 targets, density 75)
- **Narrative purpose:** The Corbins turned the gallery over hunting leverage; Holt has them; sweep the double crime scene and find which way Ottilie went. Their crudeness against her tidiness (S13/S23) closes the double-cross arc; the trail goes **up**.
- **Camera:** same plate camera (variant law) — but the pan path REVERSES (frame → wreckage → service stair door, now uncovered): the room remembered backwards.
- **Lighting:** STORM-NIGHT — constable's lamps as 3 warm pools (frame wall, center wreckage, stair door); intermittent lightning through the tall windows (cool key, pre-checked flash safety, reduced-motion variant per GDD §18); wet reflections by the broken case. Every target inside lamp pools.
- **Background structure delta:** dust sheets torn down (service-stair door now exposed — the way up), display case shattered (glass field), storm rain on windows, wet footprint track (small, even-paced — *she arrived calm*) painted as plate feature toward the stair.
- **Foreground:** collapsed dust sheet drift, glass shards, dropped constable kit (20°). **Midground:** overturned bench, snapped velvet rope, ransacked crates, bootprint cast in plaster (15°). **Background:** hollow frame (untouched, level — "a promise, not a decoy"), stair door ajar, lightning windows (8°).
- **Clutter families:** wreckage (shards/overturned furniture) · police kit (lamps/handcuffs/cast) · S01 carry-overs redressed (crates, ladder, tools — recomposed positions) · the seal (hero).
- **Target pool (S27):** object:dust-sheet · object:candelabra (review) · object:crate (review) · object:rope (velvet, snapped — review) · object:constables-lamp · object:glass-shard · object:screwdriver (review) · object:bootprint-cast · object:handcuffs · object:ladder (review) · object:seal (THE seal) · object:frame (review — the hollow one) · object:key (service-stair, review). 1 camouflage target max (Charter cap).
- **Decoy pools:** lamp family (bullseye lantern, candle stub, match tin); restraint/hardware family (chain, rope end, buckle); glass family (case pane fragments, tumbler, monocle); print family (second partial cast, chalk circle markers).
- **Story clues:** evidence find (second-to-last) — **C34: the retired conservator's seal**, brass nightingale matrix, discarded at the foot of the hollow frame; final target — the **service-stair key** (S01 geography paid off); plants — wet even-paced footprints, the frame's suddenly-legible trueness. Close-ups: C34 seal hero (1), footprint/stair direction beat frame (1).
- **Required assets:** parent plate reuse + ransack delta layer · ~30 new/repositioned sprites (delta) + 45 redressed carry-overs · FX: rain-on-glass, lightning frames (+ reduced variant), lamp-pool glows · 2 close-ups · Corbins-in-handcuffs beat illustration (non-searchable dialogue panel art) · storm light pass.

---

### SCN-02-CURATOR — Curator's Office — "The Paper Coup" / "What the Blotter Kept"

- **Scene ID:** SCN-02-CURATOR · **Location:** #2 Curator's Office, day · **Rounds served:** S02 (9 targets) and S03 (10 targets; desk-stratum template, ≥60% disjoint) · density 60
- **Narrative purpose:** S02 — reconstruct the painting's paper life (the 1926 miracle's receipt). S03 — read the *person*, not the paperwork: what Adele keeps near the blotter is what she touches when she thinks. Plants the season's smoking-gun photograph (C02) and the Lorentz wire (C03).
- **Camera:** gentle two-point; desk dominant lower-right, bookcase wall left, window behind desk chair. Horizon 53%. The desk is the S03 focal stratum; the cabinet/table span is S02's. Pan: bookcases → cabinet → ends on desk.
- **Lighting:** DAY-WARM — window backlight rim on desk objects, warm bounce off paper drifts; green-shaded desk lamp as secondary amber pool (lit even by day — she works late). Pools: desk lamp, window wash, cabinet corner.
- **Background structure:** panelled office of a career on display — bookcase wall (catalogues), glass-front cabinet, framed exhibition posters (greeked `[TXT]`), the paper storm on every horizontal surface as painted drift + sprite topping, radiator, coat stand.
- **Foreground:** visitor chair with catalog stack, floor folio piles (20°). **Midground:** THE DESK — blotter, telephone, tea service, letter racks; side table with acquisition files (15°). **Background:** cabinet shelves, posters, window sill with the **framed 1919 photograph** (8°).
- **Clutter families:** curatorial paperwork (ledgers/folders/envelopes `[TXT]`) · desk instruments (inkwell/letter-opener/sealing-wax) · domestic graces (teacups/candle/ribbon) · personal artifacts (photograph/spectacles/clock).
- **Target pool (S02):** object:ledger `[TXT]` · object:teacup · object:envelope · object:stamp (desk) · object:inkwell · object:scissors · object:folder · object:spectacles · object:telephone.
- **Target pool (S03):** object:blotter `[TXT]` · object:candle · object:sealing-wax · object:letter-opener · object:calendar `[TXT]` · object:drawer · object:key (review) · object:photograph · object:ribbon · object:clock (desk).
- **Decoy pools:** paper neighborhood (memo tray, card index, gazette — ≥3 per paper target); blade neighborhood (paper knife, penknife, scissors sizes); seal/stamp neighborhood (wax sticks, seal handle, ink pads); timekeeping (wall clock vs. desk clock, watch); optics (pince-nez, magnifier).
- **Story clues:** S02 evidence find (second-to-last) — **C02: the 1926 acquisition file + catalog photograph** (close-up shows the painting properly; **North Mole visible-but-unremarkable** — ART_BIBLE §10 rule) + Vane's 1904 materials note tucked in the jacket; S03 evidence find — **C03: blotter mirror-writing** of the Lorentz wire (close-up with reversed-type overlay zone). Plants — **framed 1919 photo** (young Adele + unnamed Ottilie; sepia documentary style; reused by PEOPLE tab), retired-letterhead drawer (decoy prop), doubled-policy memo (herring #5), scrape-kit dust gap on shelf (S21 retro-payoff).
- **Required assets:** 1 plate · 60 tagged sprites (two template strata) · 3 close-ups (C02 file+photo composed; C03 blotter; 1919 photograph hero — doubles as PEOPLE-tab asset) · FX: window dust · pan path.

---

### SCN-03-ARCHIVES — Museum Archives — "Deep Shelves" / "Seal Not Recovered"

- **Scene ID:** SCN-03-ARCHIVES · **Location:** #3 Museum Archives, lamplit · **Rounds served:** S04 (10 targets, Ch. 1) and S21 (13 targets, Ch. 5; personnel-stacks & map-wall template) · density 90
- **Narrative purpose:** S04 — who understands the Belmont's mounting system; where is the painting's older paper trail (plants C04/C05/C06; hosts P1's workroom table). S21 — the season's inversion round: retrieve the 1904 chart, open the 1919–21 personnel file, find the *Aurelia* manifest; Adele's confession plays here.
- **Camera:** one-point down a shelf canyon; workroom table foreground-right; the **map wall** terminates the view (C06 lives there, visible from round one). Horizon 50% (tall shelves compress the sky-less space). Pan: shelf canyon → map drawers → table.
- **Lighting:** LAMPLIT — green-shaded reading lamps and a hand lantern: 4 authored amber pools (table, map wall, ladder bay, card-index) in deep Ink Umber shelf-dark. Dust in every shaft. S21 re-pools toward personnel stacks (delta light pass).
- **Background structure:** basement archive — deep oak shelving canyons, flat map-drawer cabinets, rolling ladder on rail, the workroom table (P1 site: the hollow frame lies here in S04's state), card-index bank, pipes overhead.
- **Foreground:** table with frame/fragments (S04) or opened board-file boxes (S21), stool (20°). **Midground:** shelf faces with archive boxes, map drawers half-open, lantern, ladder (15°). **Background:** map wall (the 1904 harbor chart pinned among others), high shelf dimness (8°).
- **Clutter families:** archival storage (boxes/folders/registers `[TXT]`) · cartography (maps/chart tubes/drafting tools) · conservation bench kit (brushes/ink/string/magnet) · press & records (newspapers/gazettes `[TXT]`) · instruments (sextant — Finch echo).
- **Target pool (S04):** object:blueprint `[TXT]` · object:newspaper `[TXT]` · object:map · object:box (archive) · object:lantern · object:brush · object:ink-bottle · object:stool · object:string · object:magnet (map-drawer).
- **Target pool (S21):** object:folder ×3 (plural) · object:map (review — THE map) · object:letter (sealed) · object:rubber-stamp (review) · object:register `[TXT]` · object:card-index · object:portrait (staff photo) · object:ruler · object:compass (drafting) · object:sextant (review) · object:seal (wax, review) · object:gazette `[TXT]` · object:manifest (review) `[TXT]`.
- **Decoy pools:** flat-paper neighborhood (charts, posters, elevations — the map's neighbors); box/folio sizes (≥3); small-brass neighborhood (compass, dividers, stamp handles, the seal family); print ephemera (clippings, catalogues); string/wire/ribbon family.
- **Story clues:** S04 — **C04: patent cradle blueprint "O. Marsh, 1905"** (evidence find, second-to-last; close-up with signature text-zone overlay); **C05:** 1907 "Belmont's nightingale" clipping (tagged decoy find, curiosity-tap reward); **C06:** 1904 harbor chart on the map wall (background plant, close-up in S21); the hollow frame on the table → **P1** (torn-lining reassembly board art: lining fragments + pawn ticket C07 output `[TXT]`). S21 — **C26: the 1919/21 board file + 1918 nightingale-watermark letter** (evidence find; composed close-up: minute + margin + watermark); **C27:** *Aurelia* manifest, optional-depth find; C06 retrieved (close-up: no North Mole + 1921 gazette alongside).
- **Required assets:** 1 plate · 90 tagged sprites (two strata) · P1 puzzle board art (fragment set, table felt, reassembled ticket) · 5 close-ups (C04, C05 clipping, C06 chart, C26 composed, C27 manifest) · FX: lamp-shaft dust · delta light pass for S21 · pan path.

---

### SCN-04-DOCKS-DAY — Harbor Docks — "Ticket No. 77"

- **Scene ID:** SCN-04-DOCKS-DAY · **Location:** #4 Harbor Docks, day · **Rounds served:** S05 (10 targets incl. gulls ×3 plural, density 100)
- **Narrative purpose:** Find Brassbound Pawn and put a name to ticket No. 77; the search is the *price* of the ledger (helping the pawnbroker's delivery inventory). Canvassing maps the harbor for the chapter.
- **Camera:** wide two-point exterior; quay running lower-left → right, Brassbound Pawn's shopfront at the right golden section, harbor and **berth 9 / SS Vesper across the water** left-distant. Crane diagonals cross the sky. Horizon 47%. Pan: harbor panorama (Vesper legible) → cranes → shopfront.
- **Lighting:** DAY-WARM maritime — low autumn sun raking across wet cobbles, cool Harbor Slate water, warm highlights on brass and rust. Pools: shopfront awning warmth, crate-stack sun patch, bollard-line rake.
- **Background structure:** working quay — warehouse facades (Oxblood brick), cranes, moored barge (with the Lantern-Quarter lantern hung on it — Ch. 4 thread), the pawnshop front with three-ball sign (pictographic, sanctioned), distant **North Mole** on the horizon (world-continuity law), gulls in the sky (painted, distinct from the 3 target gull sprites).
- **Foreground:** delivery clutter on cobbles — crates, barrels, coiled rope (20°). **Midground:** the pawnbroker's stall table, netting racks, bollards, chains, gangway (15°). **Background:** crane bases, warehouse doors, moored hulls, berth 9 (8°).
- **Clutter families:** cargo (crates `[TXT]` stencils/barrels/sacks) · rigging (ropes/nets/hooks/chains) · ship hardware (anchor/bell/bollard) · harbor fauna (gulls/dock cat) · pawnshop spill (instruments, oddments — Finch's sextant-family neighbors).
- **Target pool (S05):** object:crate · object:rope (review) · object:seagull ×3 (plural — 3 pose variants) · object:anchor · object:barrel · object:hook · object:net · object:bell (ship's) · object:bollard · object:chain.
- **Decoy pools:** bird family (pigeon, tern silhouette, weathervane cock); heavy-iron family (cleat, winch hook, grapnel — anchor's neighbors); coopered goods (kegs, tubs, pails); cord family (hawser, twine ball, fishing line).
- **Story clues:** evidence find — **C08: the pawn ledger open to item 77** `[TXT]` (close-up: ledger line overlay); plants — **crate stencil digits ×3** feeding P2's combination (stencils greeked EXCEPT the three digit zones, which are typography overlays — fair-play legibility), berth 9 + Vesper geography, the barge lantern. Close-ups: C08 ledger (1), stencil-digit trio (in-scene zoom fidelity, no separate asset).
- **Required assets:** 1 plate · 100 tagged sprites · pawnbroker character overlay (non-speaker, soft-edged) · FX: gull-flight ambience, water glints, chimney smoke · 1 close-up · pan path.

---

### SCN-04V-DOCKS-FOG — Harbor Docks (Fog-Dusk) — "Berth 9"

- **Scene ID:** SCN-04V-DOCKS-FOG · **Location:** #4 variant (prop-stack delta + fog light pass) · **Rounds served:** S07 (11 targets incl. lanterns ×2 plural, density 100)
- **Narrative purpose:** Chase the paper trail of the *Vesper* crate through berth 9's freight shed at shift change — sorting the night's slips by lamplight, officially "helping." The trail is gift-wrapped; the fog says so.
- **Camera:** same plate camera; composition re-weighted to the freight shed (right side opens into the lit shed interior — the primary search field); the harbor dissolves into fog cards left. Pan: fog harbor (Vesper a ghost) → rail spur glint → shed interior.
- **Lighting:** FOG-DUSK — lavender-slate ambient, 5 authored lantern pools (shed table, gangplank, bollard line, crane base, shed shelves). Fairness: every target inside pools; fog swallows all non-search distance.
- **Background structure delta:** freight shed interior revealed (shelving, paper spike, weighing beam), **freight-tram rails glinting inland** (S16 seed — a deliberate glint line in the light pass), fog cards at three depths, Vesper's masthead lights.
- **Foreground:** tarpaulin-draped stack, ledger table (20°). **Midground:** winch, gangplank, oilskin on hook, padlocked bond cage, dock cat on a crate (15°). **Background:** fog harbor, rails, crane silhouettes (8°).
- **Clutter families:** freight paper (slips/manifests/ledgers `[TXT]`) · wet-weather gear (oilskins/sou'westers/boots) · lifting kit (winch/gangplank/hand-hooks) · shed hardware (padlocks/lamps/whistle).
- **Target pool (S07):** object:lantern ×2 (plural) · object:tarpaulin · object:winch · object:ledger (berth) `[TXT]` · object:crate (review) · object:gangplank · object:oilskin · object:whistle · object:cat (dock) · object:padlock · object:manifest `[TXT]`.
- **Decoy pools:** light family (hurricane lamp, candle lamp, masthead light — lantern's neighbors ≥3); canvas family (sail scrap, awning, sack); lock family (chain-lock, hasp, key ring); paper family (slips, tags, chits).
- **Story clues:** evidence find (second-to-last) — **C11: the lading slip** `[TXT]` ("V.C. FINE ARTS", 140×110×30 crate; close-up with the *too-crisp* customs stamp impression legible — pays off against C15); plants — stamp crispness observation, inland rails. Close-ups: C11 slip + stamp (1).
- **Required assets:** parent plate + shed/fog delta layer · ~35 new sprites + redressed carry-overs · FX: 3-depth fog cards, lantern glow set, breath-fog wisps · fog-dusk light pass · 1 close-up · pan path.

---

### SCN-05-TAVERN — The Rusty Anchor — "The Shape of a Debt" / "A Bird's Name"

- **Scene ID:** SCN-05-TAVERN · **Location:** #5 Rusty Anchor Tavern, evening · **Rounds served:** S06 (11 targets incl. bottles ×3) and S08 (12 targets incl. keys ×2; back-room & bar-top stratum) · density 85
- **Narrative purpose:** S06 — find the sad museum man and read the room around him; the Chalk's board makes debts public architecture; Halloway "helps close up." S08 — search Finch's corner of the world (locker, regular table) with his shaky permission; the round that first *hears* "Nachtigall."
- **Camera:** cozy two-point from the door; bar sweeping left, hearth and Finch's corner table right golden section, the **Chalk's board** on the back wall centered over the bar — the room's public conscience, always legible. Horizon 55%. Pan: hearth → dartboard wall → bar → Chalk's board.
- **Lighting:** EVENING-HEARTH — fire glow (pool 1: hearth corner), candle clusters on tables (pools 2–3), oil lamps over the bar (pool 4), bottle-glass glints. Oxblood-warm shadows. S08 re-pools toward the back-room door and bar-top (delta pass).
- **Background structure:** low-beamed harbor tavern — dark wood bar, bottle shelves, hearth, netting and glass floats on beams, dartboard alcove, the chalkboard `[TXT]`, back-room doorway (S08 stratum), Finch's corner table (plate feature).
- **Foreground:** table tops with tankards/cards/bread (20°). **Midground:** bar top, stools, hearth kit, dartboard, Finch's corner (15°). **Background:** bottle shelves, chalkboard, netting beams, back-room shelving (8°).
- **Clutter families:** drink (bottles ×3 variants/tankards/jugs) · pub food (bread/cheese/kettle) · games (dartboard/cards/dominoes) · publican's kit (aprons/brooms/towels/mousetrap) · locker personalia (logbook/sextant case/matchbox).
- **Target pool (S06):** object:bottle ×3 (plural) · object:tankard · object:dartboard · object:chalk · object:bread · object:cheese · object:candle · object:cards (playing) · object:stool · object:kettle · object:pipe.
- **Target pool (S08):** object:barrel (review) · object:logbook `[TXT]` · object:apron · object:mousetrap · object:jug · object:broom · object:coin · object:matchbox · object:clock (wall) · object:towel · object:crate (review) · object:lamp (review) · object:key ×2 (plural, review).
- **Decoy pools:** glassware family (tumbler, flask, float — bottle's neighbors); dairy/larder (butter crock, sausage, onions); game pieces (dice, cribbage board, second dart set); brush family (scrub brush, mop, besom); small-metal pocket family (coins, buttons, fob).
- **Story clues:** S06 evidence find — **C09: the Chalk's slate, "T.F. — 40 — PAID 12 OCT" in chalk ghost** `[TXT]` (close-up: wiped-but-readable overlay); plants — dartboard chalk digits (P2 remainder, overlay zones), **Lattice-sigil matchbook** in the ashtray (pictographic sigil, pre-echo of C17/C18), gossip beat only (no asset). S08 evidence find — **C12: Finch's duplicate log book** `[TXT]` (close-up: rewritten entries + carbon gap); plants — polished sextant case (sympathy engine), **torn envelope corner with partial bird watermark** (nightingale motif's first physical trace; close-up). Close-ups: C09, C12, watermark scrap (3).
- **Required assets:** 1 plate · 85 tagged sprites (two strata) · Finch seated overlay (beat state, non-searchable) · FX: hearth flicker, candle glow set, pipe-smoke wisp · 3 close-ups · delta light pass (S08) · pan path.

---

### SCN-06-CUSTOMS — Customs Warehouse — "Nine Kilograms"

- **Scene ID:** SCN-06-CUSTOMS · **Location:** #6 Customs Warehouse, lamplit · **Rounds served:** S09 (12 targets incl. stamps ×2; density 110 — the season's junk-pile showcase, Charter-fair)
- **Narrative purpose:** Release the held *Vesper* crate by physically locating every associated document in the warehouse's magnificent filing non-system; weigh the lie (9 kg) and read its forged stamp. The genre's beloved organized junk pile, done fairly.
- **Camera:** deep one-point down the bonded-goods canyon; the held crate on the weighing platform at center-right golden section — the destination object; clerk's caged office left. Horizon 51%. Pan: shelf canyon crescendo → scale platform → crate.
- **Lighting:** LAMPLIT — high gantry lamps in green shades: 5 pools (scale platform brightest, clerk's cage, lost-property shelf, stamp desk, tea-chest stack). Deliberately theatrical shafts through the rafters — density needs sculpting light to stay fair.
- **Background structure:** cathedral-height bonded warehouse — rack canyons, gantry, the weighing platform with beam scale, clerk's wire cage `[TXT: notice board]`, lost-property shelving, roller door, the held crate (open, raw batting interior — a plate feature with close-up).
- **Foreground:** document drifts, twine spools, hand-truck (20°). **Midground:** scale + crate, stamp desk (ink pads, dies, ledgers), typewriter table, tea-chest stack, birdcage on the lost-property shelf (15°). **Background:** rack canyons receding, gantry lamps, roller door (8°).
- **Clutter families:** weights & measures (scales/weights/gauges) · stamping & sealing (rubber stamps ×2 variants/ink pads/lead seals) · packing (twine/sacks/funnels/tea-chests) · office machinery (typewriter/bell/files `[TXT]`) · lost property (umbrella/birdcage/oddities — rich decoy field).
- **Target pool (S09):** object:scale · object:stamp (rubber) ×2 (plural) · object:twine · object:funnel · object:typewriter · object:sack · object:tea-chest · object:umbrella (lost-property) · object:birdcage (empty — cheeky) · object:seal (lead) · object:hand-truck · object:bell (counter).
- **Decoy pools:** weight family (weight sets, spring balance, steelyard); impression family (wax seal kit, embossing press, ink pads — the stamp's ≥3 neighbors, crucial: this scene TEACHES stamp/seal semantics before C13/C15 comparisons); vessel family (jars, tins, kegs); office family (letter trays, spike files, blotters).
- **Story clues:** evidence find — **C13: forged customs stamp impression with Casal's mark + manifest line "gross 9 kg"** `[TXT]` (composed close-up: impression + manifest — the impression's *cleanliness* rendered for later contrast with C15's nicked serif); plants — crate interior (raw batting, no canvas dust, no rub-marks; close-up), Board Review 1 plays after (UI-side). **P3 pairs board:** 8 word-card ↔ cargo-image pairs drawn from this chapter's cargo vocabulary (16 card assets: 8 cargo thumbnails + 8 word cards, word cards UI-typography).
- **Required assets:** 1 plate · 110 tagged sprites (peak count; heavy shared-library reuse of crate/barrel/lamp families) · customs-clerk overlay (gesturing, soft) · FX: gantry shafts, dust · 2 close-ups (C13 composed; crate interior) · P3 board art + 8 cargo thumbnails · pan path.

---

### SCN-07-LOBBY — Grand Hotel Lobby — "The Register" / "The Veiled Woman"

- **Scene ID:** SCN-07-LOBBY · **Location:** #7 Grand Hotel Lobby, day + evening-service delta · **Rounds served:** S10 (10 targets incl. suitcases ×2) and S12 (11 targets; evening luggage-tide template + light delta) · density 80
- **Narrative purpose:** S10 — place Casal and "Dr. Lorentz" under one roof via the register; earn it by matching lost property to guests. S12 — the stakeout: watch the room until its objects confess; the search list is literally "what changed since this afternoon."
- **Camera:** grand two-point from the entrance steps; front desk right, palm court and stair sweep left, key-rack behind the desk legible (the empty 412 hook must read at 1×). Horizon 52%. Pan S10: doors → palm court → desk. Pan S12 (delta): the SAME path — the player's memory of the afternoon is the mechanic.
- **Lighting:** S10 DAY-WARM — glass-canopy daylight, brass glows, marble bounce; pools: desk, palm court table, luggage bay. S12 delta: EVENING-HEARTH-adjacent — sconces up, canopy dark, chandelier amber; pool layout identical in POSITION (fairness + the "what changed" fiction), warmer in color.
- **Background structure:** Beaux-Arts lobby — marble floor, brass-railed stair, front desk with key-rack and register stand, palm court (potted palms, café tables), revolving door, lift cage, mezzanine rail.
- **Foreground:** luggage bay clutter — trunks, hatboxes, umbrella stand (20°). **Midground:** desk top (register `[TXT]`, bell, tip saucer), café tables, luggage cart, palms (15°). **Background:** key-rack `[TXT: tags greeked]`, pigeonholes, stair, mezzanine (8°).
- **Clutter families:** luggage (suitcases ×2 variants/trunks/hatboxes) · desk service (bell/register/keys/letters) · guest leavings (gloves/canes/cigarette cases/newspapers) · service ware (trays/buckets/saucers) · botanical (palms/carnations).
- **Target pool (S10):** object:suitcase ×2 (plural) · object:palm (potted) · object:bell (desk) · object:newspaper (review) `[TXT]` · object:gloves · object:cane · object:hatbox · object:key-rack · object:telephone (review) · object:ashtray.
- **Target pool (S12):** object:tray · object:champagne-bucket · object:umbrella-stand · object:luggage-cart · object:letter (front-desk) `[TXT]` · object:carnation · object:cigarette-case · object:tip-saucer · object:coat (review) · object:lamp (review) · object:glove (single, grey — the find).
- **Decoy pools:** leather-goods family (valise, satchel, portmanteau — suitcase neighbors); small-brass family (bell sizes, ashtray, saucer); paper family (letters, cards, telegrams in pigeonholes); glove family (pairs in lost property — makes the *single grey* glove a designed standout, not a cheat: it is the evidence find, visually cued per global rule 3).
- **Story clues:** S10 evidence find — **C14: the hotel register** `[TXT]` (close-up: Casal 412 + Lorentz Oct 20 lines); plants — **empty 412 spare hook** on the key-rack (S13 alibi; must be legible at 1×), bell-boy gossip (beat only). S12 evidence find — **C17: the drop note (lattice sigil + FRIDAY) + the single grey kid glove** (composed close-up; sigil pictographic, day-word overlay); plants — the veiled-woman sighting (B3.4 dialogue panel art: back-view/distance guise (b) per ART_BIBLE §9.7 — never her face), sigil↔matchbook match. Close-ups: C14, C17 composed (2).
- **Required assets:** 1 plate · 80 tagged sprites (two strata; S12 adds evening-service props + repositions) · veiled-woman beat illustration (distance/back view) · FX: canopy light shafts (day), sconce glow set (evening) · 2 close-ups · evening delta light pass · pan path (shared).

---

### SCN-08-SUITE412 — Hotel Suite 412 — "Already Searched" (Silhouette)

- **Scene ID:** SCN-08-SUITE412 · **Location:** #8 Hotel Suite 412, day · **Rounds served:** S13 (Silhouette mode, 10 targets, density 55 — intimate, searched-room tension)
- **Narrative purpose:** Someone searched Casal's suite before us — *tidily* — and put everything back *almost* right. The silhouette mode is the fiction: what belongs where, and what's missing from its shape? Ends on the chapter hook (C18).
- **Camera:** intimate one-point from the suite door; bed left, bureau/desk right golden section (the false drawer's home), window with harbor view center-back (**North Mole present**). Tighter framing than any prior scene — 40 mm feel. Horizon 56%. Pan: door → wardrobe → window → bureau.
- **Lighting:** DAY-WARM, curtained — one soft window key through sheers, amber table lamp secondary; the room slightly dim (blinds half-drawn: discretion). Pools: window wash, bureau lamp, wardrobe mirror bounce. High shape-readability (silhouette mode floors edge contrast).
- **Background structure:** first-class suite — brass bed, wardrobe with mirror, writing bureau (the sticking false drawer — plate feature), valet stand, marble washstand, armchair, harbor window.
- **Foreground:** open travel-case on luggage bench (P5 site), slippers, dropped cravat (20°). **Midground:** bureau top (pens, decanter, photograph), valet stand, washstand kit (15°). **Background:** wardrobe interior hint, window sill, bed with pressed-flat coverlet (*almost* right — one corner wrong; ambience storytelling) (8°).
- **Clutter families:** gentleman's dressing kit (cufflinks/razor/shoehorn/cravat) · writing kit (pens/decanter/paper) · travel gear (cases/labels/straps) · grooming china (washstand family).
- **Target pool (S13):** object:cufflink · object:razor · object:shoehorn · object:pocket-watch · object:decanter · object:slipper · object:cravat · object:travel-case · object:fountain-pen · object:photograph (review). **Silhouette-mode asset law:** each target's outline render is auto-derived from its sprite alpha (no separate silhouette paintings) — sprites must therefore pass the 10%-scale silhouette test with margin (ART_BIBLE §7.2).
- **Decoy pools:** small-jewelry family (studs, tie pin, watch chain — cufflink neighbors); blade family (strop, scissors, penknife); glass family (tumblers, cologne bottles — decanter neighbors); footwear family (oxfords, boot trees — slipper neighbors).
- **Story clues:** evidence find — **C18: the telegram taped behind the false drawer's back panel** `[TXT]` ("LATTICE STALL. FRIDAY… — NACHTIGALL"; close-up: telegram with sigil + signature overlay zones); plants — the tidy search itself (the Broker's manners; S27 contrast), Friday = market night. **P5 luggage-silhouette board:** the open travel-case with 6 outline wells + 6 object sprites (one deliberately mis-welled: "Velvet *under* brass?").
- **Required assets:** 1 plate · 55 tagged sprites (+ auto-silhouette derivations) · P5 board art (case interior + 6 wells) · 1 close-up (C18) · FX: sheer-curtain light, dust · pan path.

---

### SCN-09-SHOP-DAY — Casal's Antique Shop — "The Nicked Serif"

- **Scene ID:** SCN-09-SHOP-DAY · **Location:** #9 Casal's Antique Shop, day · **Rounds served:** S11 (12 targets incl. candlesticks ×2; ≤1 camouflage; density 105 — curio-density fairness showcase)
- **Narrative purpose:** Take Casal's theatrical "search me" literally: audit the shop, find his genuine stamp die, compare it to the customs impression; his cipher ledger, which he does not offer, is here too. An inventory audit of a business model made of clutter-with-provenance.
- **Camera:** dense two-point from the shop door; counter right (die + ledger territory), curio wall left, the **frame wall with one recent square gap** center-back (the devastating plant — must read as a gap at 1×). Horizon 54%. Pan: window display → curio canyon → frame wall gap → counter.
- **Lighting:** DAY-WARM through a dressed shopwindow — warm shafts across brass and lacquer; green desk lamp at the counter; pools: window display, counter, frame wall, cabinet corner. Brass-on-brass camouflage target authorized (≤1, no heavy occlusion — Charter #6).
- **Background structure:** deep narrow shop — glass cabinets, curio shelving to the ceiling, the gilt-frame wall (with gap), counter with till and ledger shelf, dressing-screen corner, chandelier cluster overhead (stock, not fixture).
- **Foreground:** floor stock — globe on stand, chessboard table, rolled rugs (20°). **Midground:** counter top (die, ink pad, ledgers `[TXT]`), cabinet shelves (medals, fans, snuffboxes), violin on a stand (15°). **Background:** frame wall, high shelf silhouettes, mirror (bounces the window — placed to lift the back-shop light honestly) (8°).
- **Clutter families:** instruments & optics (violin/telescope/globes) · lighting stock (candlesticks ×2 variants/candelabra/lamps) · vanity & vertu (mirrors/fans/medals/snuffboxes) · games (chess sets) · dealer's kit (dies/ink/ledgers/tags `[TXT]`).
- **Target pool (S11):** object:candlestick ×2 (plural) · object:violin · object:globe · object:mirror · object:vase · object:medal · object:fan · object:chessboard · object:stamp-die · object:ledger (review) `[TXT]` · object:clock (review) · object:telescope.
- **Decoy pools:** stringed family (mandolin silhouette, bow, music stand — violin neighbors); sphere family (armillary, paperweight orbs — globe neighbors); reflective family (hand mirrors, silver trays — mirror neighbors ≥3); medal/coin/brooch flat-metal family (also quietly rehearses brooch-recognition for C33); die/seal/stamp family (continues the impression-literacy chain from SCN-06).
- **Story clues:** evidence find (second-to-last) — **C15: the genuine dealer die with the nicked serif** (HERO close-up: composed side-by-side against C13's clean impression — the season's forensic teaching image); after-round **P4 cipher wheel** art (brass wheel, greeked ring glyphs, solution word rendered UI-side per language) + **C16 cipher ledger** close-up `[TXT]`; plants — the **frame-wall gap** (duplicate frame's raw material; captioned in S23), one oversized keyed 1926 entry (S23 thread). Close-ups: C15 side-by-side composed, C16 ledger (2).
- **Required assets:** 1 plate · 105 tagged sprites · P4 wheel art · 2 close-ups · FX: window shafts, dust · pan path.

---

### SCN-09V-SHOP-NIGHT — Casal's Antique Shop (Shuttered-Night) — "The Floor Safe"

- **Scene ID:** SCN-09V-SHOP-NIGHT · **Location:** #9 variant (prop-stack delta + night light pass) · **Rounds served:** S23 (12 targets, 1 camouflage, density 105)
- **Narrative purpose:** Midnight break-in aftermath: intruders took exactly one thing (the 1926 file drawer). Sweep the shuttered shop to confirm what was and wasn't touched — insurance habit — then open the floor safe together. The intruders' *tidy* disarray is her people again.
- **Camera:** same plate camera; the rolled-back rug + open floor safe replaces the counter as focal (center-right); shutter-slat light bars rake the floor toward it. Pan: shuttered window bars → untouched cabinets (the tidiness read) → disturbed drawer → floor safe.
- **Lighting:** NIGHT-LANTERN interior — Casal's hand lamp + two candelabra as 3 warm pools (safe, counter, cabinet lane); shutter-slat moonlight bars (cool) as graphic structure. Lamplight lanes = the authored search corridors; 1 camouflage target inside the brightest pool only.
- **Background structure delta:** shutters down (slat bars), dust sheets on half the stock, ONE drawer pulled and empty (the only violence), rug rolled back, floor-safe hatch open, the frame-wall gap now shadow-dramatic.
- **Foreground:** rolled rug, crowbar left by intruders (cheeky target), lamp (20°). **Midground:** strongbox, cashbox, letter-scale on counter, curtain to the back room (15°). **Background:** sheeted cabinets, frame wall, shutter bars (8°).
- **Clutter families:** night-shop security (strongboxes/cashboxes/key-rings/locks) · drapery (curtains/sheets/rolled rugs) · S11 stock redressed under sheets · document kit (files/letter-scale `[TXT]`).
- **Target pool (S23):** object:lantern (review) · object:cashbox (review) · object:curtain · object:strongbox · object:candelabra (review) · object:rug (rolled) · object:clock (review) · object:crowbar · object:snuffbox · object:letter-scale · object:key-ring (review) · object:file (document) `[TXT]`.
- **Decoy pools:** lockbox family (deed box, tea caddy, jewel case — strongbox/cashbox neighbors ≥3); tool family (pry bar vs. fireplace poker vs. chisel — crowbar neighbors); textile rolls (rug/tapestry/bolt); small-lid family (snuffbox/pillbox/inkbox).
- **Story clues:** evidence find — **C29: the duplicate 1926 sale dossier from the floor safe** `[TXT]` (close-up: Aurelia Trust letterhead, 9 Clocktower Lane, Casal's dated margin doubt); plants — tidy-disarray signature (S13 match), the frame-gap caption lands (beat), premeditation documented. Close-ups: C29 dossier (1).
- **Required assets:** parent plate + shutter/sheet/safe delta layer · ~30 new sprites + redressed carry-overs · Casal-in-dressing-gown beat portrait (variant C-2, dialogue panel) · FX: slat-light bars, lamp pools · night light pass · 1 close-up · pan path.

---

### SCN-10-MARKET — Night Market — "Follow the Vendors' Calls" / "The Pigment Seller"

- **Scene ID:** SCN-10-MARKET · **Location:** #10 Night Market (Lantern Quarter), night · **Rounds served:** S14 (Audio mode, 11 targets incl. oranges ×3; P6 within) and S15 (12 targets incl. brushes ×2, 1 camouflage; craft-row template) · density 95
- **Narrative purpose:** S14 — find the Lattice Stall without asking (asking gets reported): navigate by the stalls' calls; the audio mode IS the plot. S15 — the trail goes material: earn the pigment seller's order book by helping restock; sorting jars is the interrogation.
- **Camera:** immersive two-point down the market lane; stall rows converging toward the **Lattice Stall** (pierced-diamond screen, right of center-back — present from round one, unremarked); lantern strings overhead create the connecting-line motif. Horizon 50%. Pan S14: lane entry → stall row crescendo → lattice screen glimpse. Pan S15 (craft row): re-weighted left into the craft stalls.
- **Lighting:** NIGHT-LANTERN — the season's most cinematic state: strings of paper lanterns (Lamp Amber saturated), brazier glows, blue-black sky between awnings. 6 authored pools (produce stall, fish stall, textile stall, craft row bench, lattice screen, teahouse corner). Every target pooled; the lattice screen's pool is warm but *soft* (she is behind it).
- **Background structure:** Lantern Quarter lane — timber-and-plaster facades, stall frames with awnings, hanging signage (ALL greeked; localized signage = per-language typography overlay layers per STORY_BIBLE §3 — the only scene with language-skinned overlays), the Lattice Stall screen, teahouse glow, laundry lines above (string motif).
- **Foreground:** produce baskets, crate spill, brazier (20°). **Midground:** stall counters (fish on ice, cheese wheels, textiles, toy stall with drum; craft row: pigment jars, mortars, loom), the hollow dead-drop lantern hanging AT the lattice screen (15°). **Background:** facades, lantern strings, upper windows (8°).
- **Clutter families:** produce (oranges ×3 variants/garlic/peppers) · fish & provisions · textiles & notions (scarves/bolts/thimbles/buttons/beads) · craft supplies (brushes ×2/pigment jars/mortars/oil flasks/folding easel) · market kit (scales/baskets/teapots/toys).
- **Target pool (S14):** object:orange ×3 (plural) · object:lantern (review) · object:scarf · object:basket · object:cheese (review) · object:garlic · object:pepper · object:fish · object:scale (review) · object:teapot · object:drum (toy). (Audio-mode chips; ≥4 concepts here reuse S13's per the GDD silhouette follow-up rule — handled by round-builder, art unaffected.)
- **Target pool (S15):** object:brush (artist's) ×2 (plural) · object:pigment-jar · object:bolt (cloth) · object:thimble · object:button · object:mortar · object:candle (review) · object:ribbon (review) · object:bead · object:loom (small) · object:oil-flask · object:easel (folding). 1 camouflage (Charter-capped).
- **Decoy pools:** citrus/round-fruit family (lemons, apples, pomegranates — orange neighbors); vessel family (kettles, jugs, samovar — teapot neighbors); notions family (spools, needle books, scissors — thimble/button neighbors ≥3); grinding family (pestle, grinder, muller — mortar neighbors); jar family (spice jars, ink pots — pigment-jar neighbors).
- **Story clues:** S14 evidence find — **C19: the hollow dead-drop lantern + slip "the wren flies too close"** `[TXT]` (close-up: opened lantern + slip; opened via **P6 light-sequence** — P6 art: the stall-keeper's signal lamp with 4–7 step glow states); masked-meeting beat art: lattice screen + gloved fingertips at its edge (ART_BIBLE §9.7 guise d — never her face). S15 evidence find — **C20: the pigment seller's order book** `[TXT]` (close-up: standing order, 1904 pigments, "E. SARTO, 6 Kestrel Lane"); plants — no-modern-white absence (close-up copy detail), "the aunt" ledger note (grey-glove thread), stallholder deference (staging note: figures angled protectively near the lattice stall). Close-ups: C19 composed, C20 order book (2).
- **Required assets:** 1 plate · 95 tagged sprites (two strata) · localized signage overlay set ×3 languages (typography, not generation) · P6 signal-lamp state art · masked-meeting beat illustration · vendor overlay figures (3–4, soft-edged, non-speakers) · FX: lantern-glow string set, brazier embers, steam from teahouse · 2 close-ups · pan paths ×2.

---

### SCN-11-LOFT — Artist's Loft — "Pinholes" / "Vane Green"

- **Scene ID:** SCN-11-LOFT · **Location:** #11 Artist's Loft, 6 Kestrel Lane, dawn · **Rounds served:** S17 (12 targets; P7 after) and S18 (13 targets incl. jars ×3, 1 camouflage — green pot on green shelf; bench-and-shelves template) · density 75
- **Narrative purpose:** S17 — establish what kind of work happens here: the room IS the witness statement (pounce dust, aged varnish, no signatures). S18 — prove *whose recipe*: inventory the bench like a conservator taking a deposition. Ends on the season's mid-point hook (C23).
- **Camera:** one-point under the skylight; easel position center-left in the light shaft (empty of canvas — the absence composed as presence), workbench right (S18 stratum), laundry line crossing the upper third (string motif; the tell-tale smock hangs on it). Horizon 57% (attic intimacy). Pan: door → laundry line → skylight shaft → bench.
- **Lighting:** DAWN-ROSE — rose-gold skylight shaft as the hero pool; cool clean shadow elsewhere; stove ember warmth (pool 2), bench bounce-card pool (pool 3). Dust motes in the shaft (the room smells of linseed and patience — paint that).
- **Background structure:** top-floor studio — sloped skylight roof, plank floor with pounce-dust ghost beneath the easel position (plate feature), plaster walls with pin-shadows (bare — no signatures anywhere: a statement), stove, cot corner, shelf wall (S18 stratum), drying rack with **two washed teacups** (plate feature; nobody comments).
- **Foreground:** paint-crusted table edge, rag pile, jar cluster (20°). **Midground:** easel, palette on stool, smock on line (buttons re-sewn for a left-handed man — close-up carries it), low oven tray + amber jars (varnish-aging kitchen) (15°). **Background:** shelf wall (jars ×3 territory, the GREEN pot among green-toned neighbors — the authored camouflage), skylight, laundry line (8°).
- **Clutter families:** painter's kit (easels/palettes/brushes/charcoal/knives) · pigments & media (jars/oil flasks/beeswax/pestle) · studio domestic (kettle/stove/smock/rags/mirror) · paper & study (sketchbooks/labels/twine `[TXT]`).
- **Target pool (S17):** object:easel · object:palette · object:rag · object:skylight-pole · object:jar (review) · object:kettle (review) · object:smock · object:charcoal · object:laundry-line · object:mirror (review) · object:stove · object:sketchbook.
- **Target pool (S18):** object:pigment-jar ×3 (plural, review) · object:pestle · object:funnel (review) · object:beeswax-block · object:oil-flask (review) · object:knife (palette) · object:scale (small, review) · object:label `[TXT]` · object:twine (review) · object:crate (small, review) · object:apron (review) · object:magnifier (review) · object:notebook (review).
- **Decoy pools:** stick family (maulstick, brush handles, poles — skylight-pole neighbors); jar/bottle spectrum (≥6 — the plural + camouflage demands depth; green-glass, amber, stoneware); wax/soap/chalk block family (beeswax neighbors); blade family (palette knife vs. putty knife vs. quill knife).
- **Story clues:** S17 evidence find (second-to-last) — **C22: pounced cartoon fragment (the Daughter's hands, pinholes)** (HERO close-up: tracing paper against lamplight, pricked lines matching the S02 catalog photo's hands — composed echo); plants — varnish-aging setup (close-up), left-handed smock (close-up detail), pressed orchid loose page (Conservatory pre-echo). **P7 pigment bench art:** recipe cards (greeked + color-word overlay zones), mixing wells, the wet green test card (**Vane Green — reserved color's sanctioned appearance**). S18 evidence find — **C23: the "GRÜN — E.V." pigment pot** `[TXT — lettering greeked, overlay]` (HERO close-up: pot + hand-lettering + left-worn palette + left-seated shears; Vane Green sanctioned); Board Review 2 follows (UI-side). Close-ups: C22, C23, varnish kitchen, smock buttons (4).
- **Required assets:** 1 plate · 75 tagged sprites (two strata) · P7 bench board art · 4 close-ups · FX: skylight motes, stove ember glow · pan paths ×2 · delta prop shuffle for S18 stratum.

---

### SCN-12-DEPOT — Tram Depot — "Rails Go Two Directions"

- **Scene ID:** SCN-12-DEPOT · **Location:** #12 Tram Depot, night · **Rounds served:** S16 (11 targets incl. tickets ×3, density 70)
- **Narrative purpose:** If the painting didn't sail, it rolled: find the night of Oct 11 in the depot's waybills and dispatch chalkboard. The dispatcher trades access for help finding his lost signal-lamp key — which is on the target list (diegetic loop).
- **Camera:** two-point along the shed's rail axis; a dark tramcar bulks left (midground occluder), dispatch office glazed booth right golden section (waybill territory), the chalk dispatch board `[TXT]` legible beside it. Rails lead the eye out the shed mouth toward the **Clocktower silhouette on the hill** (destination geography, painted). Horizon 49%. Pan: shed mouth/clocktower → tramcar → workbench → dispatch booth.
- **Lighting:** NIGHT-LANTERN industrial — gas-arc shed lamps (greenish-warm) in 4 pools (dispatch booth, workbench, tram step, timetable wall); signal lamp's red-green accents (small, non-target-critical); blue night through the shed mouth.
- **Background structure:** iron-truss tram shed — rails and inspection pit (safety-railed), the tramcar, glazed dispatch booth, timetable wall `[TXT]`, workbench row, coal stove, the shed mouth night.
- **Foreground:** workbench clutter — toolbox, oilcan, wrench set (20°). **Midground:** tram step and coupling, dispatch counter with waybill spike, conductor's coat hooks (15°). **Background:** timetable wall, booth interior, rails receding (8°).
- **Clutter families:** hand tools (wrenches/oilcans/toolboxes/gears) · transit paper (timetables/tickets ×3 variants/waybills `[TXT]`) · signal kit (lamps/whistles/flags) · crew personalia (caps/thermos/benches).
- **Target pool (S16):** object:wrench · object:oilcan · object:timetable `[TXT]` · object:ticket ×3 (plural) `[TXT]` · object:signal-lamp · object:toolbox · object:gear · object:bench (review) · object:whistle (review) · object:cap (conductor's) · object:waybill `[TXT]`.
- **Decoy pools:** spanner/hammer/pliers family (wrench neighbors ≥3); can family (grease pot, funnel can, kettle — oilcan neighbors); paper-chit family (chits, tags, counterfoils — ticket neighbors, deliberately deep: rehearses S25's left-luggage tags); lamp family (hand lantern, headlamp, red lamp).
- **Story clues:** evidence find — **C21: the freight waybill + dispatch-board entry** `[TXT]` (composed close-up: waybill + chalk line "23:15 museum spur → Clocktower Lane — pass No. 7"); plants — pass No. 7's 1907 issue year (quiet identity rung), the siding-serves-one-address geography (shed-mouth view). Close-ups: C21 composed (1).
- **Required assets:** 1 plate · 70 tagged sprites · dispatcher overlay (thermos, pointing — soft) · FX: gas-arc glow, stove ember, night haze at shed mouth · 1 close-up · pan path.

---

### SCN-13-AUCTION — Auction House — "Lot 9" / "The Consignor"

- **Scene ID:** SCN-13-AUCTION · **Location:** #13 Auction House, evening · **Rounds served:** S19 (Description mode, 12 targets) and S20 (12 targets incl. labels ×3; back-rooms/lot-storage template) · density 85
- **Narrative purpose:** S19 — preview night: examine every lot before the paddles fly, above all Lot 9; description-mode chips are the auctioneer's coy catalog copy read back. S20 — get behind the rostrum: consignment ledger, provenance cards, payment instructions (lot-storage reconciliation earns it).
- **Camera:** S19: elegant one-point down the preview salon; **Lot 9 on its display easel** at the right golden section under its own picture lamp — the composition's destination; rostrum and gavel left. Horizon 53%. S20 (stratum): the view pivots into the back rooms — racked lots, packing benches, the ledger desk. Pan S19: salon sweep → lot row → Lot 9. Pan S20: rack canyon → packing bench → ledger desk.
- **Lighting:** EVENING-HEARTH formal — candelabra + picture lamps: each lot gets its own warm pool (the search fields ARE the lots); Velvet Plum shadow. Lot 9's pool is the warmest (evidence cue). S20: working gaslight over the desk, rack lanes pooled.
- **Background structure:** salon — paneled walls hung with gilt-framed lots (all greeked plaques `[TXT]`), rostrum with gavel rail, velvet-roped viewing lane, chandeliers; back rooms — lot racks, packing bench, ledger desk, telegraph corner.
- **Foreground:** S19 velvet cushions with small lots, catalogue stack; S20 packing blankets, trolley (20°). **Midground:** display easels, paddle rack, magnifier on chain at the viewing rail; S20 crate row, cashbox desk (15°). **Background:** hung lots, rostrum; S20 racks and stencil wall (8°).
- **Clutter families:** auction furniture (easels/rostrums/paddles/cushions) · lots (frames/vertu/instruments — deep decoy field by design) · cataloguing kit (catalogues/labels ×3/ink/telegraph forms `[TXT]`) · packing (crates/blankets/trolleys/stencils).
- **Target pool (S19):** object:gavel · object:paddle (bidding) · object:velvet-cushion · object:frame (review) · object:magnifier (review) · object:catalogue `[TXT]` · object:candelabra · object:easel (display, review) · object:pocket-watch (review) · object:rope (velvet, review) · object:inkwell (review) · object:study (Lot 9 — the find). (Description-mode: chips are phrases; every phrase-object passes Charter #7 typicality.)
- **Target pool (S20):** object:label ×3 (plural, review) `[TXT]` · object:crate (review) · object:ledger (review) `[TXT]` · object:seal (wax, review) · object:brush (dusting) · object:trolley · object:blanket (packing) · object:scissors (review) · object:telegram-form `[TXT]` · object:cashbox · object:lamp (review) · object:stencil.
- **Decoy pools:** hammer family (mallet, knocker — gavel neighbors); fan/paddle/hand-mirror flat family; frame spectrum (≥4 gilt profiles — frame neighbors + the season's frame literacy); tag/ticket/chit family (label neighbors ≥3); textile family (dust covers, felt wraps).
- **Story clues:** S19 evidence find — **C24: Lot 9, the 1904 preparatory study** (PNT-STUDY hero asset, ART_BIBLE §10: younger sitter, crisp nightingale brooch, map WITHOUT North Mole; close-up composed against the S02 catalog photograph — the maps-differ image); plant — the sitter's face matchable to the 1919 photo (unforced). S20 evidence find — **C25: the consignment ledger** `[TXT]` (close-up: Aurelia Trust line + tiny nightingale initial-mark + liquidation instruction); plants — bearer-bond instruction (finale restitution), nightingale-mark habit (third artifact). **P8 logic-grid board** (3×3, statements from PEOPLE-tab facts — UI-typography). Close-ups: C24 composed comparison, C25 ledger (2).
- **Required assets:** 1 plate + back-room stratum extension · 85 tagged sprites (two strata) · PNT-STUDY hero painting (from master derivation) · P8 board art · Margo variant M-2 portrait (auction dress) · FX: candle pools, picture-lamp glows · 2 close-ups · pan paths ×2.

---

### SCN-14-CONSERVATORY — The Conservatory — "The Orchid Keeper"

- **Scene ID:** SCN-14-CONSERVATORY · **Location:** #14 The Conservatory, day · **Rounds served:** S22 (11 targets incl. flowerpots ×3, density 65 — the season's quiet round)
- **Narrative purpose:** Two threads end at the glasshouse: the pressed orchid and the orchid on Ottilie's sill. Help the head gardener's seasonal inventory; mid-round, simply *see* Sarto (left-handed shears) — the game's gentlest revelation.
- **Camera:** luminous one-point down the glasshouse nave; wrought-iron ribs converge; the potting bench right (the sketchbook's home), orchid stand left, **Sarto working midground-left** — in frame, never centered, never highlighted (the player's eye must *earn* him). Horizon 55%. Pan: door → nave canopy → orchid stand → potting bench (Sarto passes through frame mid-pan).
- **Lighting:** DAY-WARM through glass — bright diffuse canopy light, leaf-dappled pools (4: potting bench, orchid stand, birdcage corner, path), Bottle Green world with Candle Cream sky through panes. The kindest light of the season.
- **Background structure:** Victorian glasshouse — cast-iron ribs and glass, central path, raised beds, palm canopy, the orchid stand, potting bench, hanging birdcage (occupied — a canary; the wink, uncommented), water tank.
- **Foreground:** path-edge pots ×3 territory, watering can, trowel in soil (20°). **Midground:** potting bench (shears, sketchbook, labels, thermometer), orchid stand, Sarto overlay, bench seat (15°). **Background:** glass wall, canopy, cage, tank (8°).
- **Clutter families:** horticulture kit (pots ×3 variants/cans/trowels/wands/shears) · botany (orchids/palms/labels) · glasshouse instruments (thermometers/misters) · the personal (sketchbook/gardening gloves).
- **Target pool (S22):** object:flowerpot ×3 (plural) · object:watering-can · object:orchid · object:birdcage (review — occupied) · object:trowel · object:glove (gardening, review) · object:thermometer · object:bench (review) · object:shears · object:watering-wand · object:sketchbook (review).
- **Decoy pools:** pot/urn/planter spectrum (≥4 sizes); hand-tool family (dibber, fork, secateurs — trowel/shears neighbors); glass family (cloche, mister, panes); bird family (the canary itself, a wren-shaped topiary wire — motif mischief, ambience-tagged).
- **Story clues:** evidence find — **C28: Sarto's sketchbook, open on the potting bench** (HERO close-up: recent sketch of an older woman wearing the nightingale brooch; caption text-zone for the study-language line + tap-gloss — the season's one sanctioned in-fiction study-language text, rendered as overlay per ART_BIBLE §8); plants — Sarto's left-handed shears (in his LEFT hand — continuity law), the canary-not-nightingale wink, B5.6 stakeout kill (beat art: wire + glasshouse alibi framing). Close-ups: C28 sketchbook (1).
- **Required assets:** 1 plate · 65 tagged sprites · **Sarto in-scene character overlay** (working pose, left-handed, soft-edged but tender rendering — the exception where a non-focal figure gets portrait-grade face fidelity at distance) · Ottilie tea-beat portrait art (guise a — dialogue panel, B5.5) · FX: leaf-dapple, glass glare, mist · 1 close-up · pan path.

---

### SCN-15-CLOCKTOWER — Clocktower Workshop — "The Chart Rooms"

- **Scene ID:** SCN-15-CLOCKTOWER · **Location:** #15 Clocktower Workshop, 9 Clocktower Lane, lamplit · **Rounds served:** S24 (13 targets incl. gears ×2, density 60 — brisk, dense with meaning not props)
- **Narrative purpose:** Aurelian Marsh's chart rooms, leased unbroken since 1911: find what a cartographer's daughter kept here for twenty-three years, and what she's doing with it now — searching a life mid-departure, object by object. Chapter hook (C30).
- **Camera:** intimate two-point under the clock machinery; the great gear train overhead (upper third), chart walls converging on the **trunk + stretcher bar by the stair door** (right golden section — the leaving-objects anchor); the empty crate-shaped dust void center floor (negative-space plant). Horizon 56%. Pan: clock gears → chart walls → height-marks doorframe → trunk/stretcher.
- **Lighting:** LAMPLIT — one oil lamp on the drafting table (hero pool) + stove glow + moonlit clockface glazing (cool disc, back wall). 3 pools: drafting table, trunk corner, burn barrel. The dust void reads by pool-edge raking light.
- **Background structure:** tower room — the clock's gear train and weights overhead, wall-to-wall harbor charts (all 1904-era: NO North Mole anywhere in this room — continuity law), drafting table, pigeon sill (open shutter), stove, the doorframe with child's height-marks ("O." at six ages — plate feature, uncommented), stair door.
- **Foreground:** packing straw, rope coil, chart tubes (20°). **Midground:** drafting table (compass, blueprint, oilcan), trunk, burn barrel, stool, old easel (15°). **Background:** chart walls, clockface glow, pigeons, stove (8°).
- **Clutter families:** cartographer's kit (compasses/rulers/chart tubes/blueprints `[TXT]`) · clockwork (gears ×2 variants/weights/oilcans) · departure (trunks/straw/rope/timetables `[TXT]`) · hearth & sill (stove/pigeons).
- **Target pool (S24):** object:gear ×2 (plural) · object:blueprint (review) `[TXT]` · object:compass (drafting, review) · object:pigeon · object:oilcan (review) · object:chart-tube · object:stool (review) · object:stove (review) · object:burn-barrel · object:timetable (review) `[TXT]` · object:easel (old, review) · object:trunk · object:stretcher-bar.
- **Decoy pools:** wheel family (pulleys, winch drum, capstan toy — gear neighbors ≥3); tube family (rolled charts, pipe lengths, telescope — chart-tube neighbors); bar/batten family (curtain rod, level, yardstick — stretcher-bar neighbors, deliberately deep: the find must be *won* semantically); bird family (the pigeons ×2 ambience beyond the target).
- **Story clues:** evidence find — **C30: the original's stretcher bar** ("E.V. 1904" stamp zone + fresh tack holes; HERO close-up) beside the **circled Selene timetable** `[TXT]` (composed close-up); plants — burn barrel with charred gilt + frame-nail sweepings (METHOD forensics close-up), height-marks doorframe (the saddest two square centimeters — quiet plate feature), crate-shaped dust void (the copy's absence), Halloway-feeds-pigeons entry beat (hands-only character art per ART_BIBLE §9.1). Close-ups: C30 composed, burn barrel (2).
- **Required assets:** 1 plate · 60 tagged sprites · FX: lamp pool, stove ember, moonlit clockface glow, pigeon flutter · 2 close-ups · Halloway-hands pigeon-feeding beat art · pan path.

---

### SCN-16-STATION — Central Station — "The Counterfoil"

- **Scene ID:** SCN-16-STATION · **Location:** #16 Central Station, night · **Rounds served:** S25 (13 targets incl. clocks ×2 — the famous disagreeing pair; P9 within; density 90)
- **Narrative purpose:** If she runs, it starts here: the telegraph office and left-luggage hall know first. Storm-warning night = luggage chaos incarnate; the drowning-in-tags clerk deputizes anyone with steady hands. Finch's redemption beat (C31) plays at the doors.
- **Camera:** grand two-point under the iron vault; concourse sweeping to the platform gates (steam beyond), the **two disagreeing clock faces** flanking the departures board `[TXT]` high-center (P9's diegetic anchor), telegraph counter right, left-luggage mountain left. Horizon 48% (vault height). Pan: entrance doors (Finch beat staging) → concourse → clocks/board → telegraph counter.
- **Lighting:** NIGHT-LANTERN monumental — globe electroliers down the concourse (5 pools: left-luggage, kiosk, benches, telegraph counter, platform gate), steam backlit at the gates, storm-dark glazing overhead.
- **Background structure:** iron-and-glass terminus — vault trusses, departures board, the twin clocks, ticket kiosk, telegraph office counter, left-luggage cage, platform gates with standing steam, wet-footed marble.
- **Foreground:** luggage tide — trunks, suitcases, umbrella drips (20°). **Midground:** benches with waiting-crowd leavings, kiosk counter, mailbag trolley, telegraph counter (counterfoil spike) (15°). **Background:** board, clocks, gates, steam (8°).
- **Clutter families:** luggage tide (suitcases/trunks/tags ×many `[TXT]`) · station furniture (benches/kiosks/clocks ×2 faces) · rail kit (whistles/signal lamps/steam gauges) · postal & telegraph (mailbags/forms/counterfoils `[TXT]`).
- **Target pool (S25):** object:clock (review) ×2 (plural — the disagreeing pair) · object:bench (review) · object:kiosk · object:timetable (review) `[TXT]` · object:suitcase (review) · object:whistle (review) · object:ticket (review) `[TXT]` · object:steam-gauge · object:mailbag · object:telegram-form (review) `[TXT]` · object:signal-lamp (review) · object:umbrella (review) · object:left-luggage-tag `[TXT]`.
- **Decoy pools:** dial family (station barometer, gauge cluster, pocket watches — clock/gauge neighbors ≥3); bag family (kit bags, hampers, hatboxes — deep, this is the luggage scene); paper-chit family (platform tickets, receipts, forms — tag neighbors, rehearsed in SCN-12); pole family (umbrellas, canes, flag staffs).
- **Story clues:** entry beat — **C31: Finch's kept transfer papers** (HERO composed close-up: grand papers + the nightingale-watermark seal impression — the KEY CONTRADICTION's final piece; watermark pictographic, text greeked+overlay); evidence find — **C32: the telegraph counterfoil "HOLD CABIN SELENE PIER 4 — O.M."** `[TXT]` (close-up); plants — the left-luggage tag matched mid-search (one trunk, books and instruments, no painting — first tremor of the homecoming; close-up optional), Holt stationing constables (beat staging). **P9 station-clock art:** interactive clock face with movable hands (dial glyphs pictographic). Close-ups: C31 composed, C32 counterfoil (2).
- **Required assets:** 1 plate · 90 tagged sprites · Finch variant F-2 redemption portrait (dialogue panel) · P9 clock-face interactive art · FX: steam cards, electrolier glows, wet-marble reflections · 2 close-ups · pan path.

---

### SCN-17-PIER — Boathouse & Ferry Pier — "For the Wren"

- **Scene ID:** SCN-17-PIER · **Location:** #17 Boathouse & Ferry Pier, storm · **Rounds served:** S26 (12 targets incl. oars ×2, density 70)
- **Narrative purpose:** The *Selene* is held; search the boathouse and pierhead for Ottilie's traces before the storm scrubs them — the keeper has hauled the canceled sailing's abandoned property inside; one woman's is among it. The round that inverts the chase into a homecoming.
- **Camera:** two-point from inside the boathouse mouth looking along the pier: interior shelter right (the primary search field — lamplit), storm-lashed pierhead left through the open door, the **abandoned travel crate** on the sorting bench right golden section (destination object). In the far storm-grey: the Belmont's hill. Horizon 46%. Pan: pierhead storm → moored pontoon (the seasick comedy beat staging) → boathouse interior → sorting bench.
- **Lighting:** STORM-NIGHT — swinging boathouse lanterns (3 warm shelter pools: sorting bench, tackle wall, stove corner) against blue-grey storm; rain streaks backlit at the door; one flare-box red accent (small). All targets inside shelter pools (Charter #3); lightning pre-checked + reduced variant.
- **Background structure:** timber boathouse — slipway, hull on trestles, tackle wall, sorting bench with the canceled sailing's property, stove; through the door: pier planks, bollards, rails into rain, the held *Selene*'s lights far off.
- **Foreground:** wet tarpaulin drift, coiled rope, tackle box (20°). **Midground:** sorting bench (crate, trunk from S25's tag, lost property), oars ×2 racked, lifebuoy, sou'wester on peg (15°). **Background:** hull, tackle wall, door storm (8°).
- **Clutter families:** boat gear (oars ×2 variants/lifebuoys/tackle/flares) · weather gear (sou'westers/oilskins/tarpaulins) · pier hardware (bollards/lanterns/barometers) · the abandoned property (cases/rugs/umbrellas — decoy field of a fled crowd).
- **Target pool (S26):** object:oar ×2 (plural) · object:lifebuoy · object:tarpaulin (review) · object:lantern (review) · object:rope (review) · object:tackle-box · object:sou'wester · object:flare · object:crate (travel, review) · object:bollard (review) · object:barometer · object:brooch (the find).
- **Decoy pools:** paddle/boathook/gaff pole family (oar neighbors ≥3); ring family (life ring vs. rope coil vs. barrel hoop); box family (tackle vs. tool vs. flare box); small-jewelry family (the S11 medal/brooch literacy pays off here — the nightingale brooch must be *recognized*, not stumbled on).
- **Story clues:** evidence find — **C33: the nightingale brooch pinned inside the canvas-lined crate, with the unused ticket and the card "For the wren. I'm going home."** (HERO composed close-up: brooch + ticket + card, text overlay; the brooch is the §11 canonical bird design, silver, worn patina); plants — the S25 trunk present (books/instruments confirm no-escape twice), the keeper's pointing arm through the rain (beat art: oilskin figure + the small distant figure with a long wrapped burden walking TOWARD the Belmont — the season's turn, one image). Close-ups: C33 composed (1) + the turn beat illustration.
- **Required assets:** 1 plate · 70 tagged sprites · boathouse-keeper overlay · the turn beat illustration · FX: rain cards (2 depths), lantern swing glow (animable), door gust spray, reduced-flash variant · 1 close-up · pan path.

---

### SCN-18-ROOFTOP — Belmont Rooftop — "What the Frame Holds" (Evidence Sweep Finale)

- **Scene ID:** SCN-18-ROOFTOP · **Location:** #18 Belmont Rooftop conservation studio, night-storm · **Rounds served:** S28 (Evidence Sweep, 14 targets, density 50 — sparse by design; every object matters)
- **Narrative purpose:** Her old studio under the storm glass. She has laid the whole case out on her worktable because a conservator ends a job with a full inventory. The sweep IS the summation: each found story object voices one line of the accusation (WHO → MOTIVE → METHOD → TIMELINE → KEY CONTRADICTION → CRITICAL EVIDENCE). The player closes the case, object by object.
- **Camera:** the season's most intimate wide: one-point across the studio; the **worktable inventory** spanning the midground (the 14 exhibits laid in conservator's order), the **original unrolled in lamplight** on the raking table beyond it (PNT-ROOFTOP hero), the crated copy against the wall right, **Ottilie standing beyond the table** — composed at the vanishing point, hands folded, lit by her own lamp. Storm glass above; the city's lights far below through rain. Horizon 55%. Pan: storm glass → the city below → the unrolled painting → down the worktable inventory → Ottilie.
- **Lighting:** STORM-NIGHT sanctuary — ONE great warm pool: the conservation lamp over table and painting (all 14 targets inside it — the finale is deliberately the fairest search of the season); rain-traced cool glass everywhere else; lightning rim-lights the glazing bars only (reduced variant authored). The warm/cool border IS the scene's meaning: the case, lit; the storm, outside.
- **Background structure:** rooftop conservation studio — glazed roof and walls (iron ribs), raking easel-table with the unrolled original, shelf remains of her 1907–21 tenure (empty, dust-ghosted), the crated copy, service-stair door (arrival point, S27 continuity), lightning-lit dome fragment and city beyond.
- **Foreground:** worktable near-edge exhibits (20°). **Midground:** worktable far-edge exhibits, her lamp, the painting table (15°). **Background:** Ottilie, the crated copy, glass, storm (8°).
- **Clutter families:** none new — **all 14 targets are recovered evidence sprites from Chapters 1–5, re-dressed** (GDD Evidence Sweep rule; maximal asset reuse by design). Ambience: conservator's studio remains (empty easels, tool ghosts) — soft-edged, sparse, non-teasing.
- **Target pool (S28, canonical order):** the pawn ticket (C07) · the chalk slate (C09) · the lading slip (C11) · the forged stamp impression (C13) · the nicked die (C15) · the Nachtigall telegram (C18) · the dead-drop slip (C19) · the pigment pot (C23) · the pounced cartoon (C22) · the 1904 study (C24) · the 1919 minute (C26) · the stretcher bar (C30) · the transfer papers (C31) · **the nightingale brooch (C33 — final find, always)**. (Proper-named, untranslated chips per GDD §14.)
- **Decoy pools:** minimal and reverent — a handful of her conservation tools and blank papers on the table (tagged `untagged:ambience` mostly; the finale's difficulty is emotional, not perceptual). No semantic-decoy requirement is enforced here (mode exception: Evidence Sweep targets are unique named objects, GDD §14).
- **Story clues:** the round IS the clue (**C35 — the case itself**): finds 1–4 voice TIMELINE, 5–7 METHOD, 8–10 the fraud and the hand (Vane's arrival lands here — beat art: Vane rain-wet at the stair door; the signing "a Vane, after Vane" close-up: his left hand, brush, the copy's corner), 11–13 KEY CONTRADICTION (Board Review 3 inline), 14 WHO — the brooch returned to her collar **by her own hand** (close-up: gloves off, the season's only bare-handed Ottilie image). Then the accusation block, Adele + Holt arrivals, surrender standing up.
- **Required assets:** 1 plate (the season's hero plate — budget accordingly) · ~20 re-dressed evidence sprites + ~30 ambience · PNT-ROOFTOP painting states (unrolled original; crated copy) · Ottilie rooftop portrait states (waiting; correcting; the question; bare-handed brooch) · Vane arrival + signing art · Adele/Holt arrival staging art · FX: rain-on-glass, glazing-bar lightning rims (+ reduced variant), lamp breath, city-light bokeh-free glimmer · 3 close-ups (signing; brooch-to-collar; the two paintings together) · pan path (the season's slowest).

---

## 4. Cross-Scene Production Notes

### 4.1 Shared prop library (GDD §22 risk-1 mitigation)

Highest-reuse concept families, authored ONCE with palette/wear variants: crates (7 scenes) · lanterns/lamps (9) · ropes/twine (6) · ledgers/folders/papers (8) · bottles/jars (5) · clocks/watches (5) · keys/locks (4) · stamps/seals/dies (4 — the season's forensic literacy chain: SCN-06 → SCN-09 → SCN-16 → SCN-18) · frames (4) · benches/stools (5). Re-encountering the same word as a different-looking prop is good pedagogy — variants change dressing, never silhouette typicality.

### 4.2 Clue close-up register (35 pinned clues + composites)

Every C01–C34 pin gets one close-up asset (composites noted in scenes: C01, C13, C15↔C13, C17, C21, C24↔C02, C26, C30, C31, C33); C35 is the finale suite. All text via typography overlay (ART_BIBLE §8). Documentary sub-style per ART_BIBLE §12. Total close-up budget: **~40 hero assets**.

### 4.3 FX / overlay library (shared)

Fog cards (3 depths) · rain cards (2 depths + gust spray) · lightning frame set + reduced-motion variant · steam cards · dust-mote shafts · lantern/candle/hearth glow sprites (screen-blend, distinct from Hint Gold by QA rule) · breath-fog wisps · leaf-dapple. Authored once, graded per state.

### 4.4 Non-search art inventory (for completeness of the art budget)

Dialogue portrait sets (8 speakers × expression sets, ART_BIBLE §9) · beat illustrations flagged in scenes (veiled woman, masked meeting, the turn, arrivals, signing) · puzzle boards P1–P9 (art specs in their host scenes: P1 SCN-03, P2 output-only [berth ledger close-up, SCN-04V], P3 SCN-06, P4 SCN-09, P5 SCN-08, P6 SCN-10, P7 SCN-11, P8 SCN-13, P9 SCN-16) · epilogue panels ×6 + coda letter (locations reuse existing plates as graded crops; panel-specific character staging per STORY_BIBLE §16) · city map (ART_BIBLE §12) · notebook/UI surfaces · title/chapter cards (hollow-frame motif) · the painting suite (ART_BIBLE §10).

---

*End of Scene Composition Bible. Style, palette, characters, and generation rules: `/workspace/docs/ART_BIBLE.md`. Round purposes and clue canon: `/workspace/content/story/` and `/workspace/docs/STORY_BIBLE.md`.*
