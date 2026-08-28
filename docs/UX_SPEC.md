# Case & Seek — UX Specification

**Version:** 1.0 (UX Lock Candidate)
**Author:** FABLE, Senior Game UX Designer
**Authority:** This document is the UX source of truth. It obeys `/workspace/docs/GAME_DESIGN.md` (the GDD) in all design-structure matters and `/workspace/docs/STORY_BIBLE.md` in all story-fact matters. Where this spec and the GDD disagree on structure, the GDD wins.
**Scope:** Screens, layouts, components, interaction rules, responsive behavior, input, accessibility, motion, and edge states. **No engine code — behavioral specification only.**

> The interface of Case & Seek is the detective's world: a desk, a notebook, a wall map, a brass lens. If a surface could not plausibly sit on Wren Halloway's desk in 1927, it does not ship.

---

## Table of Contents

1. [UX Principles](#1-ux-principles)
2. [Screen Map & Navigation Model](#2-screen-map--navigation-model)
3. [Title Screen — Continue / New Case](#3-title-screen--continue--new-case)
4. [New Case Flow — Language, then Proficiency](#4-new-case-flow--language-then-proficiency)
5. [The Search Screen](#5-the-search-screen)
6. [The Find List (Target Tray)](#6-the-find-list-target-tray)
7. [Scene Interaction — Taps, Hitboxes, Mistaps](#7-scene-interaction--taps-hitboxes-mistaps)
8. [Zoom & Pan — Desktop and Mobile](#8-zoom--pan--desktop-and-mobile)
9. [Two Hint Systems, Two Visual Languages](#9-two-hint-systems-two-visual-languages)
10. [Audio & Pronunciation Playback (TTS Policy)](#10-audio--pronunciation-playback-tts-policy)
11. [The Debrief & Round Results](#11-the-debrief--round-results)
12. [Story Beats & Dialogue — Tap-to-Translate](#12-story-beats--dialogue--tap-to-translate)
13. [The Notebook — CASE / PEOPLE / CLUES / WORDS](#13-the-notebook--case--people--clues--words)
14. [City Map, Clue Close-ups & Puzzle Shell](#14-city-map-clue-close-ups--puzzle-shell)
15. [Responsive Layout — Viewport Matrix 390×844 → 1440×900](#15-responsive-layout--viewport-matrix-390844--1440900)
16. [Input Model — Touch, Mouse, Keyboard](#16-input-model--touch-mouse-keyboard)
17. [Accessibility](#17-accessibility)
18. [Motion, Feedback & Juice](#18-motion-feedback--juice)
19. [Art-Is-The-UI — Visual Language Rules](#19-art-is-the-ui--visual-language-rules)
20. [System & Edge States](#20-system--edge-states)
21. [Design Tokens](#21-design-tokens)
22. [UX Acceptance Checklist](#22-ux-acceptance-checklist)

---

## 1. UX Principles

1. **Art is the UI.** No dashboard cards, no floating material panels, no chrome that announces "app." Every interactive surface is a diegetic object — paper, card stock, leather, brass, chalk, string. Section 19 defines the enforcement rules.
2. **Generous by default.** Every hit region is bigger than it looks (Section 7). Every mistake is forgiven cheaply. Every text can be re-read, every audio replayed, every hint re-shown. Nothing punishes curiosity.
3. **The scene is sacred.** During a search, persistent chrome is capped at four elements (Section 5.1). Everything else earns its pixels by being summonable and dismissible in one gesture.
4. **Two questions, two buttons.** "What does this word mean?" and "Where is this object?" are answered by two visually and mechanically separate systems (Section 9). They never share a button, a meter, or a glow.
5. **No clocks on the case.** There is no timer, countdown, or time-pressure UI anywhere in the campaign — not in searches, not in puzzles, not in menus. The only stopwatch in the product is the opt-in post-completion Sprint pocket watch (Section 20.6).
6. **Never lose a find.** Autosave is invisible and continuous (per found object, per Debrief answer, per beat). The UX never shows a "saving…" spinner and never asks the player to save.
7. **Sound is a first-class channel, never the only channel.** Every audio cue has a visual twin; every audio-first surface has a text fallback one gesture away (Sections 10, 17).
8. **One layout brain, five viewports.** From a 390×844 phone to a 1440×900 laptop, the same components re-flow by rule, not by redesign (Section 15).

---

## 2. Screen Map & Navigation Model

Per GDD §15, unchanged, with overlay semantics made explicit:

```
Boot ──▶ Title ─┬─ Continue (default focus; resumes exact prior screen)
                ├─ New Case ──▶ Language ──▶ Proficiency ──▶ Cold Open ──▶ S00 tutorial search
                ├─ Case Files (saved case slots)
                └─ Settings

In-game shell (one continuous space):
City Map ⇄ Location ─┬─ Search Screen ──▶ Results ──▶ Debrief ──▶ Clue Close-up
                     ├─ Story Beat (dialogue panels)
                     └─ Puzzle
Notebook = overlay, summonable from every in-game screen (4 tabs)
Settings = overlay, summonable from Title and from the pause sheet
```

### Navigation rules

- **Overlay, not stack.** The Notebook and Settings are overlays that slide over the current screen and return to it exactly on close. Opening the Notebook mid-search pauses nothing visible (there is no timer) and loses nothing.
- **Back is always safe.** The back/pause control in a search autosaves instantly and exits to the location/map. Re-entering resumes the round mid-state: found targets stay found, banked hint stages stay banked (deterministic rebuild per GDD §19.3).
- **One-gesture depth.** No in-game state is more than two gestures from the search scene: Notebook (1), any tab (2). Map travel is: back (1), tap pin (2).
- **Browser behavior:** the browser back button behaves as the in-game back control (never dumps the player to a blank tab state); refresh restores the exact screen via autosave.

---

## 3. Title Screen — Continue / New Case

### Fiction

The title screen **is Halloway's office desk at dusk** — a painted scene, not a menu page. The menu items are objects on the desk, each with a small string-tied paper label (diegetic, but always labeled — discoverability never relies on guessing what an object does).

```
┌────────────────────────────────────────────────────────┐
│   CASE & SEEK                       (painted logotype) │
│   ─ The Hollow Frame ─                                 │
│                                                        │
│   [open notebook: CONTINUE]      [sealed letter:       │
│    Deutsch · Ch. 3               NEW CASE]             │
│    "Resume: Curator's Office"                          │
│                                                        │
│   [card drawer: CASE FILES]      [desk lamp: SETTINGS] │
└────────────────────────────────────────────────────────┘
```

### Behavior

| Element | Object | Behavior |
|---|---|---|
| **Continue** | The open case notebook, front and center | Default focus. Shows the most-recent case: language (notebook cover color + name), chapter, and a one-line resume location ("Resume: Curator's Office — mid-search"). One tap/Enter restores the exact prior screen (GDD §17). Absent on true first run. |
| **New Case** | A sealed letter with the Aldermere wax seal | Starts the onboarding flow (Section 4). On true first run this letter sits centered and lamp-lit — it *is* the primary action. |
| **Case Files** | The card drawer | Opens the case-slot sheet: one paper folder per case (language, chapter, words learned, last played). Actions per folder: Open, Export, Delete (Delete requires typing the case language name — the only deliberately heavy confirmation in the game). |
| **Settings** | The desk lamp | Opens the Settings overlay (complete list per GDD §15). |

### Rules

- Continue is the **default focused element** whenever a save exists; pressing Enter/Space/Gamepad-A on boot resumes in one input. Time from tab-focus to gameplay: one interaction.
- No patch notes, no news panel, no daily banner, no badge dots. The desk is quiet.
- First-run detection: no saves → the letter is the hero; Continue and Case Files are absent (not disabled — absent).
- Version string and legal links live small on the desk blotter edge, not in a footer bar.

---

## 4. New Case Flow — Language, then Proficiency

Order is fixed: **language first, proficiency second** (GDD §13). The flow is a release gate: language → proficiency → cold open → first found object in **≤ 2:00**.

### 4.1 Language select (0:00–0:15)

- Full-screen: three **notebook covers** on the desk — *Deutsch — German*, *Español — Spanish*, *Italiano — Italiano*, each a distinct cover material/color.
- **Hover/focus** on a cover plays a native spoken greeting (Guten Abend / Buenas noches / Buonasera) and lifts the cover slightly. On touch (no hover), a small speaker glyph on each cover replays the greeting on tap-and-hold; a simple tap selects.
- One tap advances. No confirmation step.
- Back affordance: a small "return to desk" corner fold, top-left.

### 4.2 Proficiency select (0:15–0:35)

- Four **paper cards** in Halloway's handwriting, plain English (GDD §8.3 labels): *"I'm new to it" / "I know the basics" / "I can hold a conversation" / "I'm advanced — challenge me."*
- Each card carries a **live miniature Find List chip** rendered exactly as that tier will show it (e.g., New: `▲ der Schlüssel — key`; Advanced: a 🔊 chip). The preview is the explanation — no paragraph of settings prose.
- Beneath the cards, one reassurance line, always visible: **"You can change this anytime — it never resets your case."**
- One tap advances to the cold open. Back returns to language select (selection preserved).

### 4.3 Cold open & first search (0:35–2:00)

- The letter-under-the-door panel sequence (~40 s at reading speed, skippable after 10 s via a corner "skip" fold).
- Flows directly into S00 (Detective's Office tutorial): 8 targets; the coat-rack keys shimmer once (soft-guided first tap); first find fires the full word-card stack inside the two-minute gate.
- **No account creation anywhere in this flow.** The sync prompt appears once, after Chapter 1 (Section 20.4).

### Tutorialization placement (per GDD §12)

| Round | Teaches | UX vehicle |
|---|---|---|
| S00 | Tap-to-find | One-time shimmer on the first target; word card anatomy runs at full ceremony |
| S01 | Chip-flip translation hint | First time the player idles 20 s with no find, one chip performs a single unprompted demonstration flip, with a one-line caption ("Tap a word to see what it means — always free.") |
| S02 | Search-hint escalation | One free demonstration charge; the Insight meter introduces itself with a one-line caption ("The lens shows *where*. It never tells you *what*.") |

Tutorial captions are hand-written margin notes, appear once per mechanic per profile, and never re-appear.

---

## 5. The Search Screen

The core surface; 65–75% of all play time happens here. Layout obeys one law: **the scene is full-bleed; chrome floats over it and is capped at four persistent elements.**

### 5.1 Landscape layout (desktop, tablet landscape, phone landscape)

```
┌──────────────────────────────────────────────────────────────┐
│ [◀ back]  Curator's Office · "Find the acquisition file"     │ ← top-left cluster
│                                          [◐◐○ lens] [🕮]     │ ← top-right cluster
│                                                              │
│                    SCENE  (full-bleed)                       │
│                                                              │
│                                        (mini-map, if >1.5×)  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ▲ der Schlüssel │ ● die Lampe │ ■ das Buch │ +4 ▸ │[found]│ │ ← Find List
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

The four persistent chrome elements:

1. **Back/pause** (top-left): instant autosave + exit. 48×48 hit target.
2. **Objective breadcrumb** (top-left, beside back): location name · current objective, ≤ 40 characters, in the CASE tab's handwriting. Non-interactive on phones; tap opens the Notebook CASE tab on tablet/desktop.
3. **Insight cluster** (top-right): the Insight meter (three brass lens segments) + the hint button (magnifying glass). See Section 9.2.
4. **Notebook button** (top-right, outermost): the leather book. A small paper tab peeks out when a new entry was just added (new clue, new dossier fact) — a nudge, never a badge count.

The **Find List** docks bottom, full-width (Section 6). The mini-map appears only when zoomed past 1.5× (Section 8).

### 5.2 Portrait layout (phone/tablet portrait)

Per GDD §15, the Find List docks as a **right-edge vertical rail** (left-edge if the left-handed setting is on). Top clusters compress: back + breadcrumb collapse into one row; Insight cluster and Notebook stack under the top-right corner. The scene fits by height and pans horizontally at 1× (Section 8); fairness is re-validated for the portrait safe area (GDD §15).

```
┌───────────────────────┐
│ [◀] Curator's Office  │
│              [◐◐○][🕮]│
│                 ┌────┐│
│                 │▲der││
│   SCENE         │Schl.││
│  (fit height,   ├────┤│
│   pans left-    │●die││
│   right at 1×)  │Lampe││
│                 ├────┤│
│  ◂ scene strip ▸│ +5 ││
│                 ├────┤│
│                 │folio││ ← found stack
│                 └────┘│
└───────────────────────┘
```

- A slim **scene strip** (a 3-px vellum line with a position thumb, bottom edge) shows horizontal pan position at 1× in portrait. It is an indicator, not a scrubber, on phones; draggable on tablet/desktop.
- The rail is collapsible to a 32-px spine (chevron on the rail edge; state remembered per session). Collapsed, it shows only remaining-count ("6") in pencil. Auto-expands on any find or hint.

### 5.3 What is *not* on the search screen

No score display. No timer. No combo meter. No currency. No settings gear. No banner space. The round's stars (accuracy / unassisted / streak) are computed silently and revealed only on the results card (Section 11.2).

---

## 6. The Find List (Target Tray)

Design name: **the Find List**. It is drawn as a strip of Halloway's notebook paper — torn edge, pencil rules — never as a pill bar.

### 6.1 Word chip anatomy

```
┌───────────────────┐
│ ▲ der Schlüssel   │   gender glyph · article (lighter weight) · noun (heavier)
└───────────────────┘
```

- **Gender glyph** (▲/●/■ for der/die/das; equivalent fixed pairs for es/it) always precedes the article — the cue survives colorblindness (GDD §8.2). Optional gender tinting (settings, off by default) tints the glyph only, never the text.
- **Article** is set in a lighter weight than the noun; both are one tap target.
- **Multi-find (plural) chips:** `● die Flaschen ×3` — the counter is a pencil tally that crosses off per find (×3 → ×2 → ×1 → found).
- **Tier variants** (GDD §8.3): New tier appends the gloss in small caps (`▲ der Schlüssel — KEY`); Conversational may carry a short phrase chip (two-line, italic); Advanced may carry an audio-only chip (a speaker glyph; tap plays, replays free) or phrase chips. Silhouette mode chips show the object outline; Evidence Sweep chips show proper names in small caps (untranslated).
- **Evidence chip:** the round's story target carries a small red string-dot at its corner — findable without language knowledge is guaranteed by scene authoring (GDD §7.2); the dot marks it as "case business."

### 6.2 Chip states

| State | Rendering | Trigger |
|---|---|---|
| Default | Paper chip, pencil text | — |
| Focused/hovered | Chip lifts 2 px; at New tier, audio auto-plays on focus | Pointer hover, keyboard focus, touch long-press start |
| Flipped (translation hint) | Paper-flip to gloss card (Section 9.1) | Tap/click/Enter |
| Hint-banked | 1–2 tiny lens pips on the chip corner | Search-hint stages banked on this target (Section 9.2) |
| Found | Text struck through in pencil, chip folds and flies to the **found stack** | Target found |
| New (mid-round add) | Not applicable — target lists never grow mid-round | — |

### 6.3 Overflow & the found stack

- **Landscape:** chips lay in one row, left-aligned. Up to 8 visible; beyond that, horizontal scroll with edge-fade and a `+N ▸` pencil note (tap scrolls one page). Chips are never shrunk below the minimum size to squeeze more in.
- **Portrait:** vertical rail, up to 6 visible, vertical scroll, same `+N` note.
- **Found stack:** found chips fold into a compact folio at the tray's end showing `7/12` in pencil. Tapping the folio fans out found chips (read-only); tapping any found chip replays its word card + audio — free review, always available.
- **Sort order:** authored order, stable all round (no reshuffling underfoot). Found chips leave the row; remaining chips slide to close the gap with a 200 ms ease.

### 6.4 Chip interactions (complete)

| Gesture | Result |
|---|---|
| Tap / click / Enter | Flip to translation gloss (Section 9.1) |
| Long-press (≥ 450 ms) / right-click | Play **slow audio** variant |
| Hover / focus (New tier) | Auto-play normal audio |
| Tap found-stack chip | Replay word card + audio |
| Drag | Nothing — chips are not draggable; drag on the tray scrolls it |

---

## 7. Scene Interaction — Taps, Hitboxes, Mistaps

### 7.1 Hit shapes — generous by rule

- Every prop's hit shape is its **sprite alpha silhouette** (GDD §7.1) **dilated in screen space**: **+10 px on touch, +6 px on pointer**, constant regardless of zoom level (so generosity does not shrink at 1× or bloat at 3×).
- **Effective minimum:** silhouette + dilation must yield ≥ **44 px** in the longest screen dimension for any legal target at 1× on the smallest supported viewport. (Fairness Charter minimum prop size ~30 px + 10 px dilation clears this; the authoring tool validates it per viewport class.)
- **Coat-tail rule (near-miss forgiveness):** a tap that lands outside all silhouettes but within **12 px** of exactly one *active target's* silhouette counts as a hit on it. Within 12 px of two or more candidates: resolve to the nearest silhouette edge; ties to the topmost z-order. Near-misses on non-targets get no coat-tail — forgiveness serves finds, not noise.
- **Occlusion honesty:** hit-testing respects z-order — a tap on the visible part of a partially occluded target hits the target; a tap on the occluder hits the occluder. The dilated halo of an occluded target extends only from its *visible* silhouette.

### 7.2 Tap outcomes (per GDD §7.5, with UX detail)

| Tapped | Feedback |
|---|---|
| **Active target** | Found: prop lifts with paper-snap SFX, word card fires (Section 7.3), prop flies to its chip, chip folds to found stack. Input stays live during the animation (no lockout). |
| **Tagged non-target** | Gentle "not on the list" shimmer traced along the prop silhouette (600 ms, luminance-based). At New/Basics: the prop's word flashes for 1.5 s in a small paper slip at the tap point — the **curiosity reveal** (logged as exposure, teaches decoys). |
| **Untagged ambience / background** | A soft dust-puff at the tap point, 300 ms, no sound above a whisper. Never a "wrong" buzzer. |
| **Found prop's former position** | Nothing (prop is gone; taps pass through to what's behind). |

### 7.3 The word card (find moment)

Fires on every find, at every tier, even after a full stage-3 hint reveal (the learning moment is preserved — GDD §9.2):

```
┌──────────────────────────────┐
│  ▲  der Schlüssel            │  ← article + noun, large
│     key                      │  ← English gloss, small caps
│     🔊  (auto-plays)         │  ← replay; long-press = slow
└──────────────────────────────┘
```

- Floats near the found prop's position (clamped inside the safe area, never under the tray), lingers **2.0 s**, then dissolves. Tap anywhere dismisses early; tapping the 🔊 replays and resets the linger.
- Audio (article + noun as one phrase) auto-plays with the card (Section 10).
- Multi-find targets show the **plural form** on the final find of the set (`die Flaschen`), singular on earlier finds.
- Reduced-motion variant: card fades in place, prop dissolves instead of flying (Section 18).

### 7.4 Mistap & anti-scrub handling

- **Anti-scrub** (GDD §7.5): 3 mistaps within 2 s → 0.8 s input cooldown. UX: the cursor/touch ripple turns to a slow pencil-circle with the caption *"steady…"* in margin handwriting. No sound sting, no score popup, no shake. The round's accuracy star is affected silently.
- Mistaps never subtract hint charges, never dim the scene, never add time (there is no time).
- The cooldown ignores taps on chrome and the Find List — only scene taps count as scrubbing.

---

## 8. Zoom & Pan — Desktop and Mobile

Zoom is comfort, never requirement: every target is findable at 1× (Fairness Charter #5).

### 8.1 Controls

| Action | Touch | Mouse | Keyboard |
|---|---|---|---|
| Zoom in/out (1×–3×, continuous) | Pinch | Scroll wheel (centered on cursor) | `+` / `−` (centered on view center or reticle) |
| Quick toggle 1× ↔ 2× | Double-tap (centered on tap point) | Double-click (centered on click point) | `Z` |
| Pan | One-finger drag | Drag (see 8.3) | Arrow keys (edge-accelerating) |
| Reset to 1× | Tap the `1×` chip | Click the `1×` chip | `0` |

- Zoom is **clamped 1×–3×** with a soft rubber-band at both ends (reduced-motion: hard clamp, no bounce).
- Pan is **inertial** (touch flicks glide and settle) and **clamped to scene bounds** with a soft edge resistance. **Edge-glide:** while zoomed, holding a drag at a viewport edge continues panning at constant speed.
- A small `1×` **reset chip** fades in beside the mini-map whenever zoom > 1.05×; one tap/click resets zoom and re-centers.

### 8.2 Orientation & fit rules

- **Landscape at 1×:** the full scene is visible (contain-fit within the scene area). No panning exists at 1× — pan unlocks with zoom.
- **Portrait at 1×:** the scene fits by **height** and pans horizontally; the scene strip (Section 5.2) shows position. Fairness (including edge safety and target visibility) is re-validated against the portrait safe area per GDD §15.

### 8.3 Disambiguation: tap vs. pan vs. scroll

- Pointer/touch movement **≤ 8 px** between down and up = a tap; **> 8 px** = a pan. No modifier keys needed; props are never dragged (GDD §18 — no drag-required interactions in searches).
- Drags beginning on the Find List scroll the tray; drags beginning on the scene pan the scene. Chrome swallows its own gestures.
- Browser default gestures (pull-to-refresh, pinch-page-zoom, back-swipe) are suppressed inside the scene area only; the page never scrolls under the game.

### 8.4 Staying oriented

- **Mini-map:** appears when zoom > 1.5× (GDD §7.4) — a small vellum rectangle (max 120×68 px) above the tray's end, showing the scene outline and the current viewport as a pencil rectangle. Tap/drag on the mini-map jumps the view. Fades to 40% opacity when untouched for 3 s.
- **Hint visibility at any zoom:** active hint regions render in scene space; if a hint region is off-screen, a **brass edge arrow** points toward it from the nearest viewport edge until it enters view (GDD §7.4).
- The tray, HUD, word cards, and all chrome stay fixed and unscaled during zoom/pan.

---

## 9. Two Hint Systems, Two Visual Languages

The GDD's hard rule, restated as UX law: **translation help and search help never share a control, a meter, a color, or an animation family.** Translation = *paper* (the notebook world, cool ivory). Search = *brass and light* (the lens world, warm gold). A player must be able to say which system they're using with their eyes closed, from the sound alone (paper flip vs. lens chime).

| | Translation hint | Search hint |
|---|---|---|
| Question | "What does *das Fernrohr* mean?" | "Where is the telescope?" |
| Control | The word chip itself (tap to flip) | The magnifying-glass button, top-right |
| Cost | Free, unlimited, forever | 1 Insight charge per stage |
| Visual family | Paper flip, pencil, ivory | Golden lens glow, brass |
| Sound | Soft page-flip | Low warm lens chime |
| Reveals location? | Never | Progressively (3 stages) |
| Meter | None | Insight meter (3 lens segments) |

### 9.1 Translation hint — the chip flip

- Tap any unfound chip → it **flips like a paper card** to its gloss face: English gloss (large), article + gender glyph, 🔊 replay (tap = normal, long-press = slow), and — at New/Basics tiers — a small **generic concept thumbnail** (a drawn "any key," never the scene's actual prop sprite; GDD §9.1).
- Flips back after **4 s** or on tap. Multiple chips may be flipped in sequence; only one stays flipped at a time (flipping a second flips the first back).
- No confirmation, no cost dialog, no cooldown. The only consequence is invisible: the vocabulary model logs the assist.
- Keyboard: focus chip + Enter flips; Escape flips back.

### 9.2 Search hint — the Insight meter and the lens

- **The Insight meter:** three brass lens segments in the top-right cluster. Full at round start; refills +1 per Debrief hit (banked into the next round, capped at 3) and +1 per 3 minutes of *active* searching (input within the last 20 s counts as active). Refill moment: a segment fills with a soft golden pour — noticeable, not celebratory. **Never purchasable; the meter has no "+" button and no store link.**
- **Invoking:** tap the magnifying-glass →
  - the scene dims 15% (luminance, not blur),
  - the Find List's unfound chips lift and glow faint gold ("choose a target"),
  - a "let the lens choose" brass toggle appears above the tray (auto-picks the target nearest to completion, per GDD §9).
  - Tap a chip (or the toggle) to spend the stage. Tap anywhere else / Escape to cancel — cancel costs nothing.
- **Escalation stages, per target, in order** (GDD §9.2):
  1. **Region pulse** — a golden wash over ~¼ of the scene; lingers 5 s; a faint memory-ring remains 20 s.
  2. **Smaller circle** — a lens circle ~15% of scene width; lingers 5 s.
  3. **Exact object** — the target sparkles 3 s. The player must still tap it; the full word card + audio still fires.
- **Banked stages:** a target's spent stages persist for the round; the chip shows 1–2 tiny lens pips. Re-invoking on that chip continues from the next stage.
- **When the meter is empty:** the hint button doesn't gray out or disappear (grayed buttons read as broken). It stays present; tapping it shows the meter with a one-line pencil note: *"The lens recharges as you search — and when you remember your words."* No countdown numeral is shown (no clocks on the case); the filling segment itself is the progress indicator.

### 9.3 The auto-nudge (anti-frustration)

Per GDD §9.3: after 90 s with no find and no hint, a faint ambient shimmer plays once over the region of a random unfound target — unlogged, free, at most every 90 s. UX requirements: the shimmer must be visually **weaker than a stage-1 pulse** (it should feel like light catching dust, not a hint firing), it never moves the camera, and it is disabled by the **Purist mode** setting. No caption accompanies it — deniability is the charm.

---

## 10. Audio & Pronunciation Playback (TTS Policy)

### 10.1 Source policy

Shipping vocabulary audio is **studio-recorded native speech** — article + noun as one natural phrase, plus a slow variant, one consistent voice per language (GDD §16). **TTS appears only as a development placeholder and never ships** (GDD §22, Risk 2). This spec therefore defines playback UX that is *source-agnostic*: every behavior below is identical whether the pipeline is temporarily serving TTS in a dev build or final recordings — no UI element may depend on which is playing, and no screen may say "TTS."

### 10.2 Playback surfaces (complete inventory)

| Surface | Trigger | Variant |
|---|---|---|
| Word card (on find) | Auto-plays | Normal; 🔊 tap replays; long-press = slow |
| Find List chip | New tier: auto on focus/hover · all tiers: 🔊 on flipped gloss face | Normal / slow (long-press) |
| Audio-mode chip (Advanced / S14) | Tap the speaker chip; replays free, unlimited | Normal; long-press reveals the written word (audio-first, never audio-only — GDD §18) |
| Debrief audio→image recall | Auto-plays once; replay button always present | Normal / slow |
| WORDS tab card | 🔊 button | Normal / slow (two small buttons: 🔊 and 🐢) |
| Language select covers | Greeting on hover/focus | Normal |
| Dialogue gloss popover | 🔊 in the popover | Normal |

### 10.3 Playback rules

- **One voice at a time:** a new vocabulary utterance stops the previous one. Music side-chain ducks −6 dB under any vocabulary playback (GDD §16); SFX are not ducked.
- **Visual twin:** every playback renders a small ink-ripple animation on its 🔊 glyph for the utterance duration — the deaf/hard-of-hearing player always sees *that* audio happened and *where*.
- **Slow variant** is always the same gesture everywhere: **long-press (touch) / right-click (pointer)** on any 🔊, plus the explicit 🐢 button in the WORDS tab and Debrief. "Slow-audio default" setting swaps which variant plays first.
- **Autoplay policy compliance:** browsers block audio before a user gesture. The first interactive tap of any session (title screen tap counts) unlocks audio silently. If the cold open is reached with audio still locked, word audio queues and fires on the next tap; no error dialog, no "click to enable sound" interstitial.
- **Muted state:** if voice volume is 0, auto-play surfaces still show the word card, chip text, and ripple (nothing is gated on hearing).

---

## 11. The Debrief & Round Results

### 11.1 Flow

Round complete → **results card** (≤ 10 s) → **Debrief** (45–75 s) → **clue close-up** → next beat. Total post-round flow ≤ 90 s (GDD §7.6). Every step advances on tap; nothing auto-advances faster than reading speed.

### 11.2 Results card

A paper report slip, stamped, over the darkened scene:

- **Words found:** the round's words with articles, each with a small 🔊 (tap to replay — the card is a review surface, not just a scoreboard).
- **Three rubber stamps** (not dashboard stars): *Accuracy* (mistap rate), *Unassisted* (no search hints), *Streak* (best consecutive finds). Earned stamps thunk in one by one; unearned ones simply don't appear — no empty gray star sockets, no "2/3" fraction. Missing a stamp is invisible unless you know to look.
- One action: **"File it"** → Debrief.

### 11.3 Debrief — anatomy

A notebook double-page over the darkened scene ("the detective updating the notebook over coffee" — GDD §8.4):

- **3–5 micro-recalls**, one at a time, each a single interaction:
  - **Word → image:** the word (with article) written on the left page; three scene-photo thumbnails (min 96×96 px, generous 8 px spacing) pasted on the right. Tap one.
  - **Article pick:** the bare noun; three (or four for Italian) article tabs to tap. Tabs are full-height touch targets, min 64 px wide.
  - **Audio → image:** 🔊 auto-plays (replay + 🐢 always visible); three thumbnails.
- **Feedback:** hit = rubber-stamp thunk on the page + the Insight meter pours +1 (if under cap, the pour animates toward the top-right meter so the economy teaches itself). Miss = no buzzer; the correct answer circles itself in pencil, its word card + audio replay warmly, and the page turns. **No fail state, no retry, no score.**
- **Skip:** from Chapter 2 on, a corner fold: *"File it later"* (GDD §8.4 — skip forfeits the hint charges; exposures still logged). The fold is quiet — present, never pulsing.
- **Chapter recap** (chapter end): a non-interactive 60 s montage — the chapter's 8 key words as image + audio over case-summary handwriting. Skippable the same way. The finale's Debrief *is* the recap (per S28); the season's last word card is *die Nachtigall / el ruiseñor / l'usignolo*, played once, softly.

---

## 12. Story Beats & Dialogue — Tap-to-Translate

### 12.1 Beat panel anatomy

- Illustrated **portrait-dialogue panels** (GDD §5): speaker portrait left (or right, alternating by speaker), name plate, and a paper text panel. 2–6 exchanges per beat, ≤ 90 s reading.
- **Text reveal at reading speed** (~180 wpm), tap/click/Space to complete the current line instantly, second tap advances. Never auto-advances (GDD §18 — cognitive accessibility).
- **Skip:** a corner fold ("skip scene") after 10 s, hold-to-confirm (600 ms hold fills a pencil circle — prevents accidental double-tap skips). Skipped beats still write their CASE tab summary line.
- **Flavor choices** (DRY / WARM, GDD §5): two paper slips, identical size, no highlighted "correct" option, no timer. Both lead to the same next state; the choice colors flavor only.

### 12.2 Tap-to-translate glosses (the garnish system)

Carries the Story Bible §3 code-switching rules (L0/L1/L2 per proficiency tier) to the screen:

- Non-English tokens in dialogue render with a **fine dotted underline** and a faint gender-glyph prefix where the token is a noun. The underline is the only affordance — no brackets, no color shift (survives colorblindness; underline + glyph are shape cues).
- **Tap/click a token** → a small **gloss popover** anchored to the word: token (large) · English gloss · 🔊 (recorded phrase; Section 10) · optionally the article + glyph. Dismisses on outside-tap or after 4 s. One popover at a time.
- Popovers never obscure the tapped line (anchor above the line if space below is short) and never pause the text reveal — reading flow is sacred.
- Every gloss tap is logged as a passive exposure for the vocabulary model; no UI reflects this (no "+1" floaters).
- **Comprehension guarantee** (Story Bible rule): every dialogue line must remain fully comprehensible with all glossed tokens deleted — the UX therefore never requires a gloss tap: no beat, choice, or objective ever depends on reading a garnish token.
- Hit target for a gloss token: the word's text box dilated to ≥ 44×32 px; adjacent glossable tokens must not have overlapping dilations (authoring check).

---

## 13. The Notebook — CASE / PEOPLE / CLUES / WORDS

The Notebook is the meta-UI and the game's soul object (GDD §11). It opens from the leather book button as a physical object: slides up, leather cover, four **paper index tabs** on the page edge — CASE, PEOPLE, CLUES, WORDS — in fixed order. Close = the same button, the cover corner fold, Escape, or swipe-down on the cover spine.

**Layout:** two-page spread on ≥ 1024 px widths; single page with the tab rail on smaller widths. Opening is instant-feeling (≤ 300 ms slide; reduced motion: fade).

### 13.1 CASE

- **Current objective** pinned at the top of the right page, always action-phrased ("Search the Customs Warehouse for the crate stamp").
- Below: the running case summary — one handwritten line per completed beat (≤ 14 words each, per Story Bible §18), grouped by chapter with chapter titles as section headers. Newest entries at the reading position when opened (auto-scrolled), history above.
- **Chapter progress strip:** pencil tick-boxes for the chapter's searches and puzzles — drawn as Halloway's checklist, not a progress bar. No percentages.
- This is the "away two weeks" surface: the last three lines + the objective must re-onboard a returning player in ten seconds. Nothing else competes for attention on this tab.

### 13.2 PEOPLE

- Eight **dossier cards**: portrait, name, role line, and a **status stamp** — ALLY / SUSPECT / CLEARED / UNKNOWN — rubber-stamped diagonally.
- Facts append as beats reveal them; when the Notebook is next opened after a change, the new fact line slides in with the stamp sound, once (GDD §11). A paper-tab peek on the Notebook button signals it (Section 5.1).
- Card list scrolls; tapping a card opens its full dossier page (portrait large, all facts, status history — stamps layer visibly, e.g., SUSPECT under CLEARED).
- Status changes are system-driven; the player never manually tags suspects (no deduction chores).

### 13.3 CLUES

- **The evidence board:** cork, pinned clue photos/objects, hand-labeled, red string connections that draw themselves as chapters conclude. Pans/zooms with the same gesture grammar as scenes (pinch/wheel/drag; Section 8), so the player's hands already know it.
- **Tap a pin** → clue close-up: the object large, Halloway's margin notes, and (where relevant) a 🔊 for any glossed target-language caption (e.g., C28's sketchbook line). Close-ups are the same component used for evidence finds in-round (Section 14.2).
- **Board Reviews** (BR1/BR2/BR3, GDD §11): the board presents 4–5 pins with a prompt line ("Two of these are the same fact wearing different coats"). The player taps two pins: correct pair → the string snaps taut between them with the pin sound and the deduction line is written beneath; wrong pair → the string sags and drops off gently, no sound sting, retry immediately, unlimited. After three misses, the two correct pins glow faintly (generosity per GDD §11); the ritual never blocks progress.
- Skipped-puzzle clues show their "solved off-screen by Margo" note here, with her byline.

### 13.4 WORDS

- The vocabulary journal as a naturalist's collection: a card per encountered word — generic concept thumbnail, word with article + gender glyph, 🔊 and 🐢 buttons, first-found location line, and **0–3 strength pips** (new/seen/known bands — the only surfacing of the internal model, drawn as pencil dots).
- **Filters** as paper tabs across the page top: by chapter · by domain · *"words that keep slipping"* (bottom strength band). Filters are flavor-framed, never urgent (the slipping filter's empty state: *"Nothing's slipping. Suspicious."*).
- Per-location **"field notes complete"** stamps for completionists.
- **Explicitly absent, enforced:** review queues, due counts, drill buttons, streaks, XP, notification badges. If a proposed WORDS feature resembles a to-do list, it is rejected at design review (GDD §11).

---

## 14. City Map, Clue Close-ups & Puzzle Shell

### 14.1 City map

- The map **is** the wall map of Marlowe Bay from Halloway's office (planted diegetically in S00). Painted, annotated in the detective's hand.
- **Pins:** visited locations get a pin + hand-lettered label; the current objective's location gets the red string flag and a slow lamp-glow. Locked/future locations are simply *absent* (fog and unpainted map edge) — never a padlock icon or grayed marker.
- Tap a pin → location panel slip: location name, one-line status ("New round available" / "Nothing new — for now"), Go. Travel is a cut (with a brief map-pan under reduced motion off), never a walk.
- Return visits with new rounds re-use the same pin with a fresh string flag. No exclamation-point quest markers.

### 14.2 Clue close-up (evidence find moment)

- On finding an evidence target: heartbeat pause (400 ms input hold — the one deliberate lockout in the game), iris-in to the close-up: the object large and lit, name in small caps, Halloway's margin note beneath, and one action: **"Pin it"** → string-pin sound, flies to the CLUES board.
- Close-up examination supports pinch/scroll zoom (same grammar as scenes).
- Reduced motion: iris becomes a fade; the fly-to-board becomes a stamp-in-place.

### 14.3 Puzzle shell

Every puzzle (P1–P9) lives inside a consistent shell so nine mechanics feel like one game:

- **Framing:** the puzzle object sits on a desk/bench close-up; an instruction line in Halloway's hand states the goal in one sentence; Margo or the fiction restates it diegetically in the entry beat.
- **No timer, no move counter.** The skip fail-safe (after 2 failed attempts or 3 minutes, GDD §10) surfaces as a quiet corner slip — *"Margo can take this one."* — that simply *appears*; there is **no visible countdown** to its appearance. Skip = story continues; CLUES notes it with gentle humor; no reward loss except the achievement stamp.
- **Input:** all drag interactions (the 3 puzzles that use them) have a tap-based alternative: tap-to-select, tap-to-place (GDD §18). Rotation controls are on-screen buttons as well as two-finger twist.
- Reset control on every puzzle (a "start over" pencil eraser), free and unlimited.

---

## 15. Responsive Layout — Viewport Matrix 390×844 → 1440×900

One component set, four layout classes, resolved by viewport width/height and orientation. All values are CSS px; art renders at device pixel ratio for crispness (props stay sharp to 3× zoom per the layered-scene rule).

### 15.1 Layout classes

| Class | Trigger | Find List | Top chrome | Notebook |
|---|---|---|---|---|
| **Compact portrait** | portrait, width < 600 | Right vertical rail (left if left-handed setting), collapsible to spine | Two stacked mini-clusters | Single page, full-screen |
| **Compact landscape** | height < 500 | Bottom strip, slim (56 px chips) | Single merged row, corners | Single page, full-screen |
| **Medium** | 600 ≤ width < 1024 (or tablet portrait) | Bottom strip (portrait tablet: right rail) | Standard corners | Single page, large |
| **Expanded** | width ≥ 1024 and height ≥ 500 | Bottom strip, full chips, up to 10 visible | Standard corners + breadcrumb tap-to-CASE | Two-page spread overlay |

### 15.2 Named test viewports (release-gate matrix)

Every screen in this spec must pass design review at all eight; the search screen must additionally pass the Fairness Charter re-validation at the starred rows:

| Viewport | Class | Notes |
|---|---|---|
| **390×844** (phone portrait) ★ | Compact portrait | Minimum supported. Scene fit-height + horizontal pan at 1×; rail 96 px; scene area ≥ 294 px wide |
| **844×390** (phone landscape) ★ | Compact landscape | The fairness baseline (GDD: findable on a ~360-px-tall viewport); tray 56 px; scene area ≥ 320 px tall |
| 430×932 (large phone portrait) | Compact portrait | — |
| 768×1024 (tablet portrait) ★ | Medium | Right rail; two-column Debrief |
| 1024×768 (tablet landscape) | Expanded | First class with two-page Notebook |
| 1280×800 (small laptop) | Expanded | — |
| 1366×768 (common laptop) | Expanded | Height-constrained: verify tray + word card never overlap |
| **1440×900** (laptop) | Expanded | Maximum design target; beyond this, the scene letterboxes gracefully (painted vignette bars, no stretch) |

### 15.3 Cross-class rules

- **State survives resize/rotation.** Rotating a phone mid-round re-flows the tray (bottom ↔ rail) without losing found chips, flipped state, banked hints, or zoom center. Rotation is never blocked ("please rotate" screens are forbidden; landscape is *preferred*, both are supported — GDD §1).
- **Safe areas:** all chrome respects device safe-area insets (notches, home indicators). The Find List rail/strip is inset accordingly; the Fairness Charter's edge-safety check uses the *post-inset* visible area.
- **Text scaling:** the 3-step text-size setting (100/115/130%) re-flows chips (they grow; visible count drops; scrolling absorbs the difference) and never truncates a target word — chips wrap to two lines before they ellipsize, and target-language words are never ellipsized.
- **Pointer vs. touch is detected per input event,** not per device (convertibles exist): hover affordances activate on pointer input, dilation switches to touch values on touch input, live per interaction.

---

## 16. Input Model — Touch, Mouse, Keyboard

### 16.1 Touch (complete gesture grammar)

| Gesture | On scene | On Find List | On Notebook/board |
|---|---|---|---|
| Tap | Find attempt (Section 7) | Flip chip | Select/pin |
| Long-press | Nothing (no hidden menus) | Slow audio | Clue close-up peek |
| Drag | Pan (when zoomed, or portrait at 1×) | Scroll tray | Pan board |
| Pinch | Zoom 1–3× | — | Zoom board/close-up |
| Double-tap | Zoom toggle 1×↔2× | — | Zoom toggle |
| Swipe-down on cover | — | — | Close Notebook |

### 16.2 Mouse

Hover states everywhere a pointer is live: chips lift, desk objects glow their label tags, pins raise. Scroll wheel zooms the scene under the cursor; wheel over the tray scrolls the tray. Right-click = slow audio on any 🔊/chip (and is otherwise suppressed inside the game surface). Cursor forms: default arrow; magnifier over the scene; grab/grabbing during pan.

### 16.3 Keyboard (full-session playability)

The whole game is playable without a pointer, without trivializing the search:

- **Global:** Tab / Shift-Tab cycles chrome and tray chips (never scene props — cycling props would solve the puzzle); Enter activates; Escape = back/close-overlay; `N` toggles Notebook.
- **Scene:** arrows pan (edge-accelerating), `+`/`−` zoom, `Z` toggle 1×↔2×, `0` reset.
- **Reticle mode** (`F` toggles): a brass crosshair appears at view center; arrows move it (accelerating), Enter "taps" at the reticle, Shift+arrows pan under it. The reticle is the keyboard's finger — hit rules including dilation and the coat-tail rule apply identically (pointer dilation values).
- **Dialogue:** Space completes/advances; `1`/`2` pick flavor choices; `G` opens the gloss for the line's first glossable token, repeat presses cycle tokens.
- Focus rings are drawn as pencil outlines (visible, high-contrast, on-brand); focus order follows visual order.

---

## 17. Accessibility

Restates GDD §18 as testable UX requirements and adds interface-level specifics.

### Vision
- All text meets **WCAG AA contrast (4.5:1)** against its paper/scene backing; word cards and chips carry a subtle paper backing at all times so scene art never undermines text contrast.
- Gender is never color-only: glyph (shape) + article (text) always present; optional tinting is additive (GDD §8.2).
- Hint effects (pulse/circle/sparkle) are **luminance + motion**, verified in grayscale; the auto-nudge shimmer likewise.
- 3 text sizes; **dyslexia-friendly font** option swaps reading faces everywhere including chips and word cards (target-language words keep diacritics fully rendered at all sizes).
- Zoom to 3× doubles as low-vision support; fairness holds at 1× so zoom is never *required* (Charter #5).

### Motor
- All interactive elements ≥ **44×44 px** effective (chrome and chips by geometry; scene props by silhouette + dilation, Section 7.1).
- **No drag-required interactions** in searches; the 3 drag puzzles have tap alternatives; no timing-based inputs anywhere in the campaign (the Simon-style P6 lantern code paces itself to the player's inputs and replays the sequence free, unlimited).
- Full keyboard playability (Section 16.3). No gesture requires more than two simultaneous touch points, and every two-finger gesture (pinch, twist) has a one-finger or button alternative (double-tap zoom; rotation buttons).

### Hearing
- Audio-mode chips long-press to reveal the written word — audio-first, never audio-only (GDD §18).
- Every SFX cue has a visual twin (ink ripple for speech, shimmer for nudge, stamp visual for stamp sound).
- No information is conveyed by audio alone anywhere, including the Debrief audio→image recall (its replay + reveal-word controls are always present).

### Cognitive
- CASE tab recap + always-visible objective breadcrumb; no fail states; text never auto-advances; auto-nudge on by default; Purist mode is the opt-*out*.
- One new mechanic taught per round in Chapter 1 (Section 4.3); tutorial captions are one line, once.

### Vestibular / photosensitive
- **Reduced-motion setting** (also honors the OS/browser preference on first run): flights → fades, iris → fade, parallax pans → cuts, rubber-band zoom → hard clamp, establishing pans → single still with vignette.
- No flashing above safe thresholds; Ch. 6 storm lightning ships in a pre-checked reduced variant (per S27/S28 notes).

### Screen readers (scoped, honest)
- The full shell — title, onboarding, settings, Notebook, dialogue, Debrief, results, map, puzzles with tap alternatives — is semantically labeled and screen-reader navigable; dialogue and case lines read in order; word cards announce "der Schlüssel — key — found."
- The search scene itself is an inherently visual puzzle; v1 does not claim non-visual search play. Documented as a known limitation; the Insight system and reticle mode are the assistive affordances within it. (Recorded for the v2 backlog: an audio-described search variant.)

---

## 18. Motion, Feedback & Juice

Signature moments, with durations (all durations are targets ±20%; reduced-motion variants in parentheses):

| Moment | Motion & sound | Duration |
|---|---|---|
| Found object | Prop lifts + paper-snap; flies arc to its chip (fades out in place); chip folds to stack | Lift 150 ms · flight 450 ms · fold 200 ms |
| Word card | Scale-in 95→100% + auto audio (fade-in) | In 150 ms · hold 2.0 s · out 250 ms |
| Chip flip | Y-axis paper flip (cross-fade) | 220 ms |
| Hint stage 1/2 | Golden wash blooms from cast point (fade-in region tint) | Bloom 400 ms · linger 5 s |
| Hint stage 3 | Sparkle traces silhouette (steady glow) | 3 s |
| Evidence find | 400 ms heartbeat hold → iris-in (fade) → pin thunk | ≤ 1.5 s total |
| Debrief stamp | Rubber-stamp drop + ink spread (appear + sound) | 250 ms |
| Insight refill | Segment pours full, brass glint (fill without glint) | 600 ms |
| Notebook open | Slide-up + page settle (fade) | 300 ms |
| Establishing pan (new location) | 5 s slow pan, skippable by tap (single still) | 5 s |

Rules: no motion longer than 600 ms may block input (the establishing pan and evidence heartbeat are the only exceptions, both skippable/short); celebration never interrupts flow — the player can tap the next find while the previous flight is mid-air; every sound in the notebook/paper/stamp family stays under conversational volume.

---

## 19. Art-Is-The-UI — Visual Language Rules

The enforcement section. A screen passes only if all of these hold:

1. **No dashboard cards.** No rounded-rectangle floating panels with drop shadows, no card grids, no "stats at a glance" tiles. Information lives on diegetic surfaces: notebook pages, paper slips, dossier cards (which are period card stock, photographed-object styling), chalk, brass.
2. **Material palette is closed:** paper/vellum, pencil/ink, leather, brass, cork, string, chalk, rubber stamp. A new material requires design sign-off. Glass/glow is reserved exclusively for the lens (search-hint) family.
3. **Buttons are objects or stamped labels.** Primary actions are physical things (a letter, a fold, a pin); secondary actions are stamped or handwritten labels. Never a filled-pill "CTA button."
4. **Text lives on paper.** No text floats bare over scene art without a paper/vellum backing (this is also the contrast guarantee, Section 17).
5. **Numbers are humble.** Counts render as pencil tallies or handwriting (7/12, ×3, +N). No large numerals, no odometers, no XP-style counters, no percentages anywhere player-facing.
6. **Empty states are in character.** ("Nothing's slipping. Suspicious." / an unpainted map edge / a blank dossier awaiting a name.) Never "No data."
7. **No badge dots, no red circles.** The paper-tab peek (Section 5.1) is the only "something new" affordance, and it never carries a count.
8. **Typography:** one hand-written face (Halloway's hand — case lines, margin notes, labels), one period serif (story text, dossiers), one high-legibility face for target-language vocabulary (chips, word cards — clarity beats period flavor where learning happens; swaps to the dyslexia-friendly face with the setting). All faces must render de/es/it diacritics correctly at all sizes.
9. **The lens is the only glow.** Golden light = "the game is showing you *where*." Nothing else in the UI may glow gold.
10. **No clocks.** No countdown rings, hourglasses, or timer numerals anywhere in campaign UI (the Sprint pocket watch is post-completion, opt-in, and diegetic — Section 20.6).

---

## 20. System & Edge States

### 20.1 Autosave & resume
Invisible, continuous (per found object / Debrief answer / beat). No save UI exists. Resume (Title → Continue, or browser refresh) restores the exact screen and mid-round state. The only save-related surface: Case Files export/erase controls (Section 3) and the storage-permission moment (20.5).

### 20.2 Offline
- After a chapter's bundle is cached, everything plays offline with zero UI difference. Chapter N+1 prefetches silently during N.
- **"Pack for travel"** control (Settings and the map's margin): downloads the next chapter bundle explicitly; shows a pencil-fill progress ring on the map margin — the one permitted progress indicator, since it's about the network, not the player.
- Offline with the next bundle *not* cached: at the chapter boundary, a paper slip — *"The next chapter isn't in the bag. Connect once and I'll pack it."* Never mid-round (rounds are always fully cached before they're reachable).
- Connectivity loss never interrupts play; sync (if enabled) queues silently.

### 20.3 Purchase wall (end of Chapter 1)
After the Ch. 1 hook clue and recap: a single letter from Mr. Pettibone — the season retainer. One screen: price, what's included (Chapters 2–6, all languages, forever, no other purchases exist), Restore purchase, and "Not yet" (returns to title; Ch. 1 remains replayable, Sprint-less). No countdown offers, no discount banners, no re-prompts on a schedule — the letter waits on the desk (a pinned envelope on the title screen thereafter, silent).

### 20.4 Sync prompt (once)
After Chapter 1: *"Protect your case file?"* — one paper slip, email magic-link, Later. "Later" never re-prompts; sync remains available in Settings. Conflict resolution per GDD §17: a "keep which?" picker showing chapter + timestamp for the same case on two devices; vocabulary merges automatically (max-strength) with no UI.

### 20.5 Storage permission
On first save, request persistent storage silently where the browser allows; if the browser requires a prompt, it rides the first natural pause (post-tutorial results card) with one line of fiction: *"Somewhere safe for the notebook."*

### 20.6 Sprint replays (post-completion only)
Unlocked per round after campaign completion, from the map pin's location slip. Opt-in per attempt; the timer is a **diegetic pocket watch** in the top-right (replacing the Insight cluster — Sprints disable hints rather than gray them). Personal best shown as a pencil note on the location slip. Sprint UI never appears anywhere before campaign completion — a player who never opts in never sees a clock, all season.

### 20.7 Error & degraded states
- Failed asset load mid-scene: retry silently twice; then a paper slip ("The fog's thick tonight — one moment.") with a retry action. Never a stack trace, never a blank canvas.
- Audio file missing (dev builds with TTS placeholders included): the word card renders normally; the 🔊 shows a small pencil "×" instead of the ripple. Text is never blocked on audio.

---

## 21. Design Tokens

Single reference for the numbers used throughout (CSS px at 100% text size):

| Token | Value |
|---|---|
| Minimum touch target (chrome, chips, thumbnails) | 44×44 |
| Prop hit dilation — touch / pointer | +10 / +6 (screen space, zoom-invariant) |
| Coat-tail near-miss radius | 12 |
| Tap vs. pan movement threshold | 8 |
| Long-press threshold | 450 ms |
| Anti-scrub trigger / cooldown | 3 mistaps in 2 s / 0.8 s |
| Word card linger / chip flip-back | 2.0 s / 4 s |
| Hint linger — stage 1 & 2 / memory ring / stage 3 | 5 s / 20 s / 3 s |
| Auto-nudge idle threshold / repeat floor | 90 s / 90 s |
| Zoom range / quick-toggle / mini-map threshold | 1×–3× / 2× / >1.5× |
| Find List chip minimum (landscape) | 120×56 |
| Find List rail width (compact portrait) / collapsed spine | 96 / 32 |
| Tray height (compact landscape) | 56 |
| Debrief thumbnail minimum | 96×96 |
| Mini-map maximum | 120×68 |
| Text size steps | 100% / 115% / 130% |
| Text reveal speed | ~180 wpm |
| Skip-hold confirm | 600 ms |
| Contrast floor (text) | WCAG AA 4.5:1 |
| Viewport support range | 390×844 → 1440×900 (letterbox beyond) |

---

## 22. UX Acceptance Checklist

Release-gate checks owned by UX (in addition to the GDD's metrics, §21):

- [ ] Title → gameplay in one input when a save exists (Continue default-focused).
- [ ] New Case: language → proficiency → first found object ≤ 2:00, measured on 390×844 touch hardware.
- [ ] All eight matrix viewports pass layout review; ★ rows pass Fairness Charter re-validation post-inset.
- [ ] Translation hint and search hint share zero controls, colors, meters, or sounds (blindfold audio test: paper flip vs. lens chime distinguishable).
- [ ] No timer, countdown, or clock UI reachable before campaign completion.
- [ ] Every 🔊 supports normal + slow; every audio cue has a visual twin; audio-only chips reveal text on long-press.
- [ ] Every scene target's effective hit region ≥ 44 px at 1× on 844×390.
- [ ] Rotation mid-round preserves all round state on phone and tablet.
- [ ] Keyboard-only full campaign playthrough possible (reticle mode).
- [ ] Reduced-motion pass: no flight, iris, pan, or bounce animations remain.
- [ ] Notebook: CASE last-3-lines + objective re-onboards a cold tester in ≤ 10 s (playtest protocol).
- [ ] No dashboard cards, filled-pill buttons, badge counts, percentages, or bare floating text anywhere (Section 19 audit).
- [ ] Browser back, refresh, and tab-close/reopen all land the player exactly where they were.

---

*End of UX specification. Downstream phases: visual design language boards, component library, and implementation — this document is the UX authority for all three.*
