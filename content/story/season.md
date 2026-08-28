# Season One — *The Hollow Frame* — Content Map

**Source of truth:** `/workspace/docs/STORY_BIBLE.md` (story facts) under `/workspace/docs/GAME_DESIGN.md` (structure).
**This folder:** one file per chapter (`chN-*/chapter.md`) and one purpose file per search round (`sNN-*.md`). Clue IDs (C01–C35), puzzle IDs (P1–P9), and beat rules are the bible's.

## Round index (canonical order of play)

| ID | Chapter | Scene (location · variant) | Mode | Targets | Evidence find (clue) |
|---|---|---|---|---|---|
| S00 | 1 | Detective's Office (hub) · day | Word-List (tutorial) | 8 | Gallery One dawn pass |
| S01 | 1 | Museum Gallery · day | Word-List | 9 | Wrong-pattern mounting screw (C01) |
| S02 | 1 | Curator's Office · day (R1) | Word-List | 9 | 1926 acquisition file + catalog photo (C02) |
| S03 | 1 | Curator's Office · day (R2) | Word-List | 10 | Blotter telegram draft to Dr. Lorentz (C03) |
| S04 | 1 | Museum Archives · lamplit (R1) | Word-List | 10 | Cradle blueprint "O. Marsh, 1905" (C04) → P1 → pawn ticket (C07) |
| S05 | 2 | Harbor Docks · day | Word-List | 10 | Pawn ledger, item 77 (C08) |
| S06 | 2 | Rusty Anchor Tavern · evening (R1) | Word-List | 11 | The Chalk's slate, debt wiped Oct 12 (C09) |
| S07 | 2 | Harbor Docks · fog-dusk | Word-List | 11 | SS *Vesper* lading slip (C11) |
| S08 | 2 | Rusty Anchor Tavern · evening (R2) | Word-List | 12 | Finch's duplicate log book (C12) |
| S09 | 2 | Customs Warehouse · lamplit | Word-List (+P3 pairs) | 12 | Forged customs stamp, Casal mark (C13) — **hook** |
| S10 | 3 | Grand Hotel Lobby · day (R1) | Word-List | 10 | Hotel register: Casal 412; Lorentz Oct 20 (C14) |
| S11 | 3 | Casal's Antique Shop · day | Word-List | 12 | Genuine stamp die, nicked serif (C15) + cipher ledger (C16/P4) |
| S12 | 3 | Grand Hotel Lobby · day (R2) | Word-List | 11 | Lattice-stall sigil note; the veiled woman (C17) |
| S13 | 3 | Hotel Suite 412 · day | **Silhouette** (+P5) | 10 | Telegram signed NACHTIGALL (C18) — **hook** |
| S14 | 4 | Night Market · night (R1) | **Audio** (+P6) | 11 | Dead-drop note: "the wren flies too close" (C19) |
| S15 | 4 | Night Market · night (R2) | Word-List | 12 | Pigment seller's order book → E. Sarto (C20) |
| S16 | 4 | Tram Depot · night | Word-List | 11 | Freight waybill → Clocktower Lane (C21) |
| S17 | 4 | Artist's Loft · dawn (R1) | Word-List (+P7) | 12 | Pounced cartoon fragment (C22) |
| S18 | 4 | Artist's Loft · dawn (R2) | Word-List | 13 | Vane-green pigment pot (C23) — **hook** |
| S19 | 5 | Auction House · evening (R1) | **Description** | 12 | Lot 9: the 1904 study (C24) |
| S20 | 5 | Auction House · evening (R2) | Word-List (+P8) | 12 | Consignment ledger: Aurelia Trust liquidating (C25) |
| S21 | 5 | Museum Archives · lamplit (R2) | Word-List | 13 | 1919 minute: "seal not recovered" (C26) |
| S22 | 5 | The Conservatory · day | Word-List | 11 | Sarto's sketchbook caption (C28) |
| S23 | 5 | Casal's Antique Shop · shuttered-night | Word-List | 12 | Floor-safe 1926 dossier (C29) |
| S24 | 5 | Clocktower Workshop · lamplit | Word-List | 13 | Original stretcher bar, E.V. 1904 (C30) — **hook** |
| S25 | 6 | Central Station · night | Word-List (+P9) | 13 | Telegraph counterfoil "O.M." (C32) — plus beat: Finch's papers (C31) |
| S26 | 6 | Boathouse & Ferry Pier · storm | Word-List | 12 | Brooch + note: "I'm going home" (C33) |
| S27 | 6 | Museum Gallery · night-storm (ransacked) | Word-List | 13 | The discarded retired seal (C34) |
| S28 | 6 | Belmont Rooftop · night-storm | **Evidence Sweep** | 14 | The case itself (C35) — finale |

## Budget reconciliation

- **29 authored rounds = 1 tutorial (S00) + 28 substantial.** The GDD §6 location table sums to 28 substantial rounds; its prose total reads "27." We map the full table. If production must hit 27 exactly, the marked **trim/merge candidates are S02+S03 (merge into one 11-target Curator's Office round) or S12 (fold its stakeout beat into S10's exit)** — both pre-cleared narratively (their clues survive merging).
- Chapter round counts: Ch1 = 4 (+tutorial) · Ch2 = 5 · Ch3 = 4 · Ch4 = 5 · Ch5 = 6 · Ch6 = 4. Chapter 5 is deliberately the widest (the inversion chapter); it carries only one puzzle and two brisk low-density scenes (Conservatory 65, Clocktower 60 props) to stay inside GDD §4 pacing rails.
- Target ramp per GDD §12: Ch1 8–10 · Ch2–3 10–12 · Ch4–5 10–13 · Ch6 12–14. Multi-find plural targets appear 1–2 per round from Chapter 2 on.
- Mode placements per GDD §14: Silhouette S13 · Audio S14 · Description S19 · Evidence Sweep S28 · Pairs = P3 only. All other rounds standard Word-List.
- Puzzles P1–P9 per GDD §10, placed: P1 after S04 · P2 after S06 · P3 within S09 · P4 after S11 · P5 with S13 · P6 within S14 · P7 after S17 · P8 after S20 · P9 within S25.

## Chapter files

- `ch1-the-empty-frame/` · `ch2-salt-and-smoke/` · `ch3-the-gilded-trail/` · `ch4-night-market/` · `ch5-the-auction/` · `ch6-the-broker/` · plus `cast.md`, `epilogue.md`.
