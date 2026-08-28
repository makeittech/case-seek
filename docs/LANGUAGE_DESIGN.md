# Case & Seek — Language Learning Design

**Version:** 1.0 (Language Design Lock Candidate)
**Author:** FABLE, Senior Language Learning Game Designer
**Status:** Complete language-layer design. No implementation code in this document — design only.
**Authority:** This document is the source of truth for the language-learning layer: vocabulary model, scheduling, tiers, translation, pronunciation, tracking. It obeys `/workspace/docs/GAME_DESIGN.md` (the GDD) in all structural matters and `/workspace/docs/STORY_BIBLE.md` in all story matters. Where this document refines a GDD language mechanic, this document wins; every such refinement is flagged inline as **[GDD refinement]** with rationale. There is exactly one deliberate amendment (pronunciation, §7).

> The player is never studying. The player is detecting. Every mechanism in this document exists to keep that sentence true while a real vocabulary, with real articles and real pronunciation, accumulates in the player's head.

---

## Table of Contents

1. [Purpose, Scope & the One Amendment](#1-purpose-scope--the-one-amendment)
2. [The Learning Thesis — Invisible Learning](#2-the-learning-thesis--invisible-learning)
3. [The Vocabulary Model — Concepts & Lexemes](#3-the-vocabulary-model--concepts--lexemes)
4. [Articles — the Word Includes Its Article](#4-articles--the-word-includes-its-article)
5. [Proficiency Tiers — New / Basics / Conversational / Advanced](#5-proficiency-tiers--new--basics--conversational--advanced)
6. [Translation — Free, On-Demand, Always](#6-translation--free-on-demand-always)
7. [Pronunciation — SpeechSynthesis Design](#7-pronunciation--speechsynthesis-design)
8. [Repetition & Spacing — the Invisible Scheduler](#8-repetition--spacing--the-invisible-scheduler)
9. [Target Selection per Search (8–14)](#9-target-selection-per-search-814)
10. [Story Language & Code-Switching](#10-story-language--code-switching)
11. [Language Architecture — the German / Spanish / Italian Packs](#11-language-architecture--the-german--spanish--italian-packs)
12. [The WORDS Tab](#12-the-words-tab)
13. [Internal Tracking — the Word Record](#13-internal-tracking--the-word-record)
14. [Language-Layer Metrics & Tuning](#14-language-layer-metrics--tuning)
15. [Glossary Additions](#15-glossary-additions)

---

## 1. Purpose, Scope & the One Amendment

### What this document defines

The GDD (§8, §9, §19) establishes the language layer's shape. This document makes it buildable: exact data fields, exact scheduling behavior, exact tier scaffolding, exact article pedagogy per language, and the work orders for the three language specialists who follow. The engineering phase implements from here; the German, Spanish, and Italian specialists author from §11.

### In scope (v1)

Concrete picturable nouns as taught vocabulary (~420 concepts × 3 languages), articles and plurals, listening (synthesized pronunciation), free on-demand translation, invisible spaced re-exposure, tier scaffolding, code-switch garnish surfaces, WORDS-tab collection, per-concept tracking, and the data architecture that makes language N+1 a content drop.

### Out of scope (v1, per GDD §22)

Verbs, adjectives, and abstract nouns as *targets* (they appear passively in description-phrase chips and garnish lines); grammar drills; writing/typing input; speech-recognition input; UI localization; placement testing.

### The one amendment — pronunciation ships on SpeechSynthesis

GDD §16 specified studio-recorded native audio for v1, with TTS as a dev placeholder. **This document amends that decision: v1 pronunciation ships on the browser's SpeechSynthesis engine** (the Web Speech API's synthesis half), designed to production standard in §7.

Rationale, honestly stated:

1. **Cost & schedule.** ~1,260 lexeme phrases × 2 speeds × retakes is the single largest content line item in the game, and it re-occurs for every future language. Synthesis removes it entirely.
2. **Offline & bundle weight.** Local synthesis voices produce audio with zero download; the GDD's 15–25 MB chapter bundles shed their largest asset class.
3. **Trilingual day one.** All three languages get complete audio coverage the moment their lexeme tables exist — no studio dependency on the critical path.
4. **The upgrade path is preserved.** All pronunciation flows through one **audio provider seam** (§7.6). Recorded native audio remains the intended post-v1 upgrade; when it arrives, it replaces synthesis per-lexeme with no content, scene, or scheduling changes. GDD §16's "consistent teacher voice" principle is honored within synthesis (§7.3).

The cost of the amendment — synthesis quality varies by device and voice — is mitigated systematically in §7.5. Everything else in GDD §16 (audio ducking, SFX families, no story VO) stands.

---

## 2. The Learning Thesis — Invisible Learning

Case & Seek's retention loop is *the player is actually learning a language* (GDD §20). The language layer's job is to make that happen without ever presenting as a course. The operating principle:

> **Every learning surface is disguised as detective work. If a surface's disguise fails — if it reads as homework — the surface is redesigned or cut, never explained.**

### The disguise ledger

Every pedagogical mechanism in the game, and the fiction it wears:

| Pedagogy (what it really is) | Disguise (what the player experiences) |
|---|---|
| Vocabulary presentation | The target tray — a detective's search list |
| Picture–word–sound binding at the moment of success | The find reward: word card + article + audio as the prop flies to the tray |
| Retrieval practice (testing effect) | The Debrief — updating the notebook over coffee |
| Spaced repetition | ~30% of each round's targets, indistinguishable from fresh ones |
| Contextual reinforcement | Margo's echo rule — she reuses found words in banter |
| Error-driven review | A missed Debrief tap warmly shows the answer; the word quietly returns sooner |
| Listening comprehension | Audio chips; the S14 "follow the vendors' calls" round |
| Reading comprehension / circumlocution | Description-phrase chips; the S19 auctioneer's coy catalog copy |
| Consolidation review | Chapter recap ("field notes" montage) and the S28 Evidence Sweep finale |
| Progress feedback | The WORDS tab — a naturalist's trophy journal, never a report card |

### Prohibitions (hard rules, restated from GDD and made testable)

- **No review queue, no due-cards counter, no "N words to review today."** The scheduler's output is invisible inside target lists and Debrief picks.
- **No streaks, no XP, no levels, no daily goals, no guilt notifications.** Absence is met with a warmer welcome (the CASE tab recap and one round of gentle review boost, §8.6), never a broken-chain graphic.
- **No percentage scores, no grades, no red X marks.** Debrief misses get the right answer and a kind line; the strength model does the bookkeeping silently.
- **No unprompted grammar exposition.** Articles are taught by unfailing co-presentation (§4), plurals by multi-find exposure, Italian article phonology by pattern accumulation. The game never lectures; at most, the detective muses.
- **Surfacing budget:** the internal model may reach the player only as (a) 0–3 strength pips on WORDS cards, (b) the "words that keep slipping" filter, and (c) an occasional one-line detective remark ("*der Leuchtturm*… that one keeps slipping"). Anything beyond this list is a design violation.

### What "learned" means here

The v1 bar for a word is honest and bounded: **recognize the written word (with its article) and the spoken phrase, and bind both to the object's image.** Production (saying/writing the word unprompted) is beyond a hidden-object game's input surface and is not claimed. The GDD's promise — finish knowing roughly 220–280 words with articles — is a *recognition-with-article* promise, and §8's model is tuned to deliver it (budget math in §9.4).

---

## 3. The Vocabulary Model — Concepts & Lexemes

### 3.1 Two-layer model

The vocabulary system has exactly two content layers, per GDD §8.1:

- **Concept** — a language-neutral semantic unit (`object:key`). What a thing *is*. Owns picturability, domain, frequency, art bindings, pedagogy metadata that is true in every language.
- **Lexeme** — one concept realized in one language (`de: der Schlüssel`). What a thing is *called*. Owns article, word form, plural, gloss, difficulty, traps, and pronunciation data.

**Nothing in the language layer binds to art filenames, sprite IDs, or scene coordinates — ever.** Props declare which concept they depict; the language layer never learns more about art than that.

### 3.2 The concept record (design contract, not code)

```
concept: object:key
  gloss_en:      "key"                    # canonical English; also the translation surface
  domain:        household                 # one of the 12 canonical domains (§3.4)
  tags:          [metal, small, lock-related]   # semantic-neighborhood tags for decoy rules
  frequency:     A                         # A / B / C usefulness band (§3.5)
  picturability: locked-pass               # authoring gate: typical exemplar drawable & recognizable
  multi_find_ok: true                      # may appear as a plural ×N target (§4.4)
  debrief_thumb: art key (generic concept icon — never a scene prop; GDD §9.1)
  notes:         "avoid car-key styling; period is 1927"
  lexemes:       de | es | it              # §3.3 — one column per language
```

Concept ID grammar: `object:<kebab-noun>`, stable forever once shipped (save files and sync depend on it). Disambiguating suffixes where English collides: `object:scale-weighing` vs. `object:scale-fish` — the ID is for machines; the player only ever sees lexemes and glosses.

Rules (restating GDD §8.1, now normative for the pipeline):

- **Many sprites → one concept.** Every prop depicting `object:key` anywhere in the season strengthens the same word record. Re-encountering the same word as a different-looking prop is deliberate pedagogy (varied exemplars generalize the category).
- **One sprite → exactly one concept.** A prop's most typical reading, or it isn't tagged as a target candidate (Fairness Charter #7).
- **Adding a language = adding a lexeme column.** No concept, art, scene, or scheduling change. This constraint is load-bearing for §11.

### 3.3 The lexeme record (design contract, not code)

```
lexeme: object:key / de
  article:        "der"                   # citation article, singular
  word:           "Schlüssel"
  display:        "der Schlüssel"         # exact tray-chip string
  plural_display: "die Schlüssel"         # exact multi-find chip string
  gloss:          "key"                   # defaults to concept gloss_en; override when EN is ambiguous
  gender_glyph:   ▲                       # §4.2 glyph mapping
  difficulty:     opaque                  # cognate / transparent / opaque / false-friend (§3.5)
  trap_flags:     [ ]                     # e.g. gender-surprise, el-agua-class, false-friend (§4, §11)
  tts_text:       null                    # override string fed to SpeechSynthesis when the display
                                          # text mispronounces (§7.5); display never changes
  tts_text_plural: null
  notes:          "—"
  review:         PENDING → NATIVE-APPROVED   # release gate per lexeme (GDD §19.1)
```

**[GDD refinement] Difficulty band lives on the lexeme, not the concept.** GDD §8.1 placed the difficulty band on the concept; that is language-pair-blind. `object:lamp` is a near-cognate in German (*die Lampe*), transparent in Spanish (*la lámpara*), and both differ from Italian. Cognate status, false-friendliness, and gender-trickiness are properties of one language's word, so they move to the lexeme. The concept keeps what is language-neutral: frequency, domain, picturability. Nothing downstream breaks; the concept dictionary simply carries the band per column.

### 3.4 Canonical domains (12)

Fixed vocabulary of `domain` values, sized to the season's locations (GDD §6) and to a learner's real-world usefulness. Every concept declares exactly one.

| Domain | Anchor scenes | Examples |
|---|---|---|
| `household` | Detective's Office, Suite 412 | key, lamp, cup, umbrella, mirror |
| `kitchen-food` | Tavern, Night Market | bottle, bread, cheese, orange, teapot |
| `clothing-textile` | Hotel, Market, Suite | coat, hat, glove, scarf, button |
| `tools` | Depot, Clocktower, Customs | hammer, screwdriver, ladder, saw, gear |
| `art-craft` | Loft, Gallery, Archives | easel, brush, frame, pigment, canvas |
| `stationery-office` | Curator's Office, Archives | notebook, inkwell, stamp, ledger, envelope |
| `maritime` | Docks, Boathouse, Customs | rope, anchor, oar, lantern, crate |
| `travel-transit` | Station, Depot, Pier | suitcase, ticket, bench, clock, timetable |
| `nature` | Conservatory, Docks | plant, orchid, birdcage, shell, feather |
| `music-leisure` | Tavern, Market | violin, dartboard, drum, playing-card |
| `instruments-measures` | Clocktower, Archives, Auction | sextant, compass, scale, magnifier, pocket-watch |
| `furniture-fixtures` | Gallery, Hotel, Auction | chandelier, cushion, shelf, curtain, candelabra |

Distribution guardrail: no domain below 20 or above 55 concepts; the round-builder's domain-spread rule (GDD §19.2) draws on these values.

### 3.5 Frequency & difficulty bands

**Frequency (concept-level):** how useful the word is outside the game.

- **A** — everyday core (≈ top-1000 in general frequency lists): *key, bottle, coat, clock.* Target: ≥ 55% of taught targets.
- **B** — common (≈ top-3000): *anchor, ladder, envelope, scarf.* Target: ≈ 35%.
- **C** — delightful specifics the fiction earns: *sextant, candelabra, birdcage.* Cap: ≤ 10% of taught targets — detectives deserve good props, learners deserve useful ones.

**Difficulty (lexeme-level):** how hard the word is *for an English speaker in this language.*

- **cognate** — near-free (*die Lampe*, *el mapa*, *la lampada*): scheduled lightly, graduates fast.
- **transparent** — guessable with a hint of pattern (*der Kaffee*, *la botella*).
- **opaque** — no purchase from English (*der Schlüssel*, *la llave*, *la chiave*): gets the scheduler's standard care.
- **false-friend** — actively misleading (*das Gift* ≠ gift): flagged; Debrief gives these word→image items early, and the gloss card carries a one-line caution note.

### 3.6 Scope numbers

~420 concepts authored (GDD §4). Per the final round table (`content/story/season.md`, S00–S28): **329 target slots**, of which 29 are evidence finds (story objects, no language load), leaving **300 vocabulary slots ≈ 205 unique concepts guaranteed-taught + ~95 scheduled review serves** (full math in §9.4). The remaining ~215 authored concepts appear as decoys, curiosity-tap reveals, garnish glosses, and Debrief-only items — the WORDS tab's completionist long tail.

---

## 4. Articles — the Word Includes Its Article

### 4.1 The iron rule

**A noun is never shown, spoken, or tested without its article.** Not in the tray, not on the word card, not in the Debrief, not in the WORDS tab, not in a Margo echo. The article is part of the word as far as Case & Seek is concerned — because for a learner, retrofitting gender onto a bare noun is the classic, avoidable failure. The single exception is the Debrief **article pick**, whose entire point is that the player supplies the missing article (§8.5).

### 4.2 Article systems per language

| Language | Singular articles taught | Plural articles | The teaching problem |
|---|---|---|---|
| German | der / die / das | die (uniform) | Gender is arbitrary and must be memorized per noun; the payoff of habit-forming is highest here |
| Spanish | el / la | los / las | Regular and gentle — but the trap class is famous (§11.2) |
| Italian | il / lo / la / l' | i / gli / le | Gender **plus phonology**: the article depends on the noun's initial sound (*lo specchio*, *l'arancia*, *gli specchi*) |

**Gender glyphs** (GDD §8.2, made normative): every chip, word card, and WORDS entry carries a small glyph so the gender cue survives colorblindness and never relies on hue: **▲ masculine · ● feminine · ■ neuter** (German uses all three; Spanish and Italian use ▲/● only). Elided Italian *l'* shows the glyph of the underlying gender (*l'arancia* → ●) — the glyph quietly disambiguates what the elision hides, which is exactly when a learner needs it. Optional gender color-tinting exists as a setting, off by default, never the only cue.

### 4.3 How articles are taught (by channel, never by lecture)

1. **Co-presentation, always.** Every visual and audio exposure is `article + noun` as one unit. After thirty exposures to *der Schlüssel* as a single spoken phrase, "Schlüssel without der" starts to sound wrong — which is the goal state.
2. **Debrief article picks** (§8.5): the noun appears bare, the player taps the article. Weighted by language (German-heavy per GDD §8.3) and by the player's per-word article record (§13: `articleMisses` schedules more picks for that word).
3. **Trap flagging.** Lexemes with `trap_flags` (German gender surprises like *das Mädchen*; Spanish *el agua / la mano* class; Italian *lo/l'* phonology cases) get: earlier first Debrief appearance, a caution line on the gloss card, and a slightly slower graduation ramp (§8.3).
4. **Italian phonological patterning.** The game never states the *lo* rule. It ensures Italian target sets naturally include *lo/l'* nouns at a floor rate (≥ 1 per round from Chapter 2), so the pattern accumulates by ear and eye; occasional Debrief picks offer *il / lo / la* as options and let pattern intuition win (§11.3).

### 4.4 Plurals — the multi-find channel

Plural forms are taught exclusively through **multi-find targets** ("die Flaschen ×3" — find 3 bottles), per GDD §8.2: 1–2 per round from Chapter 2 on. The chip shows and speaks the plural phrase; the WORDS card back lists singular and plural together after the player's first plural encounter (`pluralSeen`). Only concepts with `multi_find_ok: true` and a scene pool containing ≥ 3 depicting props are eligible. German's uniform plural *die* is quietly excellent news for learners and gets one detective margin note the first time ("Plurals in German all take *die*. First mercy this case has shown.") — one line, once, never a lesson.

---

## 5. Proficiency Tiers — New / Basics / Conversational / Advanced

Chosen at New Case in plain English; changeable anytime in settings; changes **scaffolding only, never search fairness** (GDD §8.3, §12). Scene composition, target physics, and hint economies are identical across tiers. This section is the normative scaffolding matrix.

### 5.1 The scaffolding matrix

| Surface | **New** ("I'm new to it") | **Basics** ("I know the basics") | **Conversational** ("I can hold a conversation") | **Advanced** ("challenge me") |
|---|---|---|---|---|
| Tray chip | word + article + glyph + **English gloss always visible** | word + article + glyph; gloss on flip | word + article + glyph; **2–3 chips/round are description phrases** in the target language | mixed: word chips, description phrases, and **audio-only chips** (🔊, tap to hear; long-press reveals text) |
| Pre-round intros | new words get a 3 s card (image + phrase + audio), max 5/round | none | none | none |
| Audio auto-play | on chip focus **and** on find | on find; on-demand per chip | on find | on find; audio is the primary channel for 🔊 chips |
| Word card on find | 2 s: word + article + glyph + gloss + audio | same | same | same (the find moment is never degraded — it is the lesson) |
| Translation hint (§6) | free, unlimited (gloss already visible; flip adds thumbnail + slow audio) | free, unlimited | free, unlimited | free, unlimited, **visually de-emphasized** (smaller flip affordance), never removed |
| Debrief mix (§8.5) | word→image heavy | word→image + article picks | + audio→image | audio→image and article picks heavy; description→image appears |
| Dialogue garnish (§10) | none (L0) | none (L0) | greetings/interjections, tap-to-gloss (L1) | idioms and short clauses, tap-to-gloss (L2) |
| Mode softening (GDD §14) | Audio round S14 → word+audio chips; Description round S19 → phrase + gloss-on-flip | same as New | as authored | as authored |

### 5.2 Tier rules

- **Tier is presentation, not curriculum.** All tiers walk the same concept sequence, same scheduler, same rounds. An Advanced player learns the same 200+ words — through harder channels.
- **Live-changeable, non-destructive.** Changing tier re-tiers future chip presentation and Debrief mixes only. Word records, strength, and story progress are untouched. Mid-round changes apply from the next round.
- **The one-time nudge** (GDD §22 risk 4): if translation-flip rate stays above 85% of chips across 3 consecutive rounds at Basics+, one gentle suggestion offers always-on glosses (i.e., New-tier tray). Two taps, never repeats, never automatic.
- **Description-phrase authoring** (Conversational+): phrases are authored per lexeme by the language specialists (§11.5), ≤ 6 words, present tense, using only structural vocabulary plus at most one taught noun ("etwas zum Öffnen einer Tür" — *something for opening a door*). Phrases teach passively; they are never tested.
- **Audio-only chips** (Advanced): capped at 4 per round; each is always long-press-to-reveal-text (GDD §18 — audio-first, never audio-only); unavailable-voice degradation per §7.5 falls back to word chips.

---

## 6. Translation — Free, On-Demand, Always

Translation is the player's unconditional safety net, and it is **free, unlimited, on demand, at every tier** (GDD §9.1). Its design goal: make not-knowing a word cost nothing socially and nothing economically — while telling the scheduler the truth.

### 6.1 The chip flip

Tapping any tray chip flips it (paper flip, notebook aesthetic) to the **gloss card**:

- English gloss (e.g., "key")
- article + gender glyph restated (*der* ▲)
- audio replay buttons: normal and slow (§7.4)
- at New/Basics: a **generic concept thumbnail** (the dictionary's icon for `object:key`) — **never the scene's actual prop** (that would be a free search hint; the systems stay separate per GDD §9)
- for `false-friend` lexemes: a one-line caution ("not English *gift* — this one's poison")

The card flips back after 4 s or on tap. Flips are unlimited and never gated, cooled down, or monetized.

### 6.2 Everywhere else translation lives

- **Word card on find** already carries the gloss at every tier — finding is never a comprehension test.
- **Garnish glosses** (§10): any code-switched token in dialogue is tap-to-gloss with the same card anatomy (gloss + audio; article included when the token is a noun).
- **WORDS tab cards** (§12) carry gloss permanently — the journal is bilingual by design.
- **Evidence and clue text is English** (Story Bible fair-play audit): translation is never required to solve the case. The free-translation guarantee protects the pedagogy; the English-evidence guarantee protects the mystery.

### 6.3 What a flip records (the honest cost)

The only cost of translation is truthful bookkeeping: a flip increments `timesTranslated` and marks the chip **assisted-this-round**; a subsequent find of that target credits reduced strength (§8.3) and the word returns sooner. This is stated to the player exactly once, in the Chapter 1 tutorial, in character: *"Look anything up, as often as you like. The notebook just remembers what needed looking up."* No meters, no shame UI.

---

## 7. Pronunciation — SpeechSynthesis Design

All spoken vocabulary in v1 is produced by the browser's **SpeechSynthesis** engine. This section specifies it to production standard. (Design behavior only; API names appear as design vocabulary, not code.)

### 7.1 What gets spoken

| Utterance | Content | Trigger |
|---|---|---|
| Find phrase | `article + noun` as one utterance ("der Schlüssel") | auto on every find (all tiers) |
| Chip audio | same phrase | chip focus (New), speaker tap (all), audio-only chips (Advanced) |
| Slow replay | same phrase at reduced rate | long-press on chip or gloss card |
| Plural phrase | `plural article + plural noun` ("die Flaschen") | multi-find chips and their finds |
| Debrief audio | the phrase, for audio→image items and after any miss (the warm correction always speaks) | Debrief |
| WORDS tab | phrase, normal + slow buttons per card | player tap |
| Garnish tokens | the token as written (idioms spoken whole) | tap-to-gloss card |
| Recap montage | the chapter's 8 words, sequential | chapter recap |

Story dialogue is never synthesized (English text beats, GDD §16). Vendors' calls in S14's ambience are authored SFX/music design, not synthesis — the *chips* in S14 speak standard phrases.

### 7.2 Utterance parameters (normative defaults)

- **Language:** each utterance carries the language pack's locale (`de-DE`, `es-ES`, `it-IT`). Never speak a lexeme through another language's voice.
- **Rate:** 1.0 normal; **0.7 slow variant** (tunable per language pack ±0.05 — Italian gemination and German final consonants survive different slowdowns differently; the specialist calibrates, §11.5).
- **Pitch/volume:** 1.0 / 1.0 — the vocabulary voice is a stable exemplar, never pitched for juice. Delight lives in SFX, not in wobbling the teacher.
- **Interruption:** a new vocabulary utterance cancels any in-flight one (rapid find chains must never queue a backlog). Music side-chain ducks under any vocabulary utterance (GDD §16).

### 7.3 Voice selection — the ladder

One voice per case slot, chosen once and kept: consistency is the synthesized version of the GDD's "teacher in your ear."

1. **Player-chosen voice** from settings (list filtered to the study language's voices), if set and still installed.
2. Else the **default pick**: prefer an offline/local voice exactly matching the locale (`de-DE`); among candidates, prefer the platform's default-flagged voice.
3. Else any voice matching the primary language subtag (`de-*` — e.g., `de-AT`).
4. Else **no-voice degradation** (§7.5).

The chosen voice is persisted per case slot. If it vanishes (OS update, device change), re-run the ladder silently; a one-line settings note records the change, no interruption. Voice enumeration is refreshed on the platform's voices-changed signal — voice lists load asynchronously on several platforms, and the design must not speak until the ladder has run.

### 7.4 Autoplay & gesture unlocking

Browsers gate audio behind a user gesture. The design guarantees the first vocabulary utterance always follows a tap by construction: the first spoken phrase in any session is triggered by the player's own find or chip tap (GDD §13's flow reaches the first find inside two minutes, and the find *is* a tap). The audio system performs its priming/unlock on the first input of the session; a muted-device icon state on chips covers the edge where the platform still refuses.

### 7.5 Quality assurance & degradation

Synthesis quality varies by device. The design absorbs this in four layers:

1. **`tts_text` overrides** (§3.3): when a display string mispronounces (rare; loanwords, elisions, homographs), the specialist authors a respelled string fed to synthesis while the display stays orthographically correct. Italian *l'arancia*-class elisions get verified per voice; overrides are the escape hatch.
2. **QA matrix as release gate:** each language specialist validates all ~420 phrases (plus plurals and slow variants) against the major platform voices (the current Chrome/Safari/Firefox/Edge system voices on desktop and mobile OS defaults). Pass criteria: correct segmentals, article not swallowed, no comic prosody. Failures → override or lexeme substitution. This QA pass **replaces** the GDD's studio-recording gate at the same position in the pipeline (native review, GDD §19.1, still applies to the *text*).
3. **Slow replay as comprehension backstop:** every audio surface offers the 0.7-rate variant; slowed synthesis is the accepted v1 substitute for studio "slow takes."
4. **No-voice degradation:** if the ladder finds no voice for the study language — speaker affordances render disabled with a quiet tooltip; Advanced audio-only chips fall back to word chips; the S14 audio round falls back to its authored New/Basics softening (word+audio chips become word chips); Debrief drops audio→image items in favor of word→image. **The game remains fully playable and fully fair silent** — audio is a channel, never a gate (GDD §18).

### 7.6 The provider seam (upgrade path)

All of §7.1's surfaces request audio through one abstraction: *speak (conceptId, form ∈ {singular, plural}, speed ∈ {normal, slow})*. v1 fulfills it with SpeechSynthesis; the post-v1 studio-audio upgrade fulfills it with recorded assets **per lexeme**, falling back to synthesis for anything unrecorded. Languages can upgrade independently, partially, and without touching any other system. Telemetry keeps per-surface playback counts (§13) so the upgrade can prioritize the most-heard words first.

---

## 8. Repetition & Spacing — the Invisible Scheduler

The scheduler is a spaced-repetition-*informed* system with no SRS UI (GDD §8.5). It answers exactly three questions: *how strong is each word, which words fill a round's review slots, and which words the Debrief should poke.* The player never sees a queue.

### 8.1 Exposure taxonomy

Every contact between player and word is one of these events (each maps to tracking fields, §13):

| Event | What it proves | Strength effect (§8.3) |
|---|---|---|
| **Unaided find** — found while the chip showed target-language text only, no flip this round, no stage-3 search hint | recognition: word → object | **+1.0** |
| **Assisted find** — found after flipping that chip this round | exposure, not recognition | +0.3 |
| **Revealed find** — found via stage-3 search hint (exact sparkle) | passive exposure (word card still plays) | +0.2 |
| **Debrief hit** (word→image, article pick, audio→image) | active recall of the tested channel | **+0.75** |
| **Debrief miss** | a lapse, warmly corrected | **−0.5**, regress a spacing stage, early re-serve |
| **Article miss** (Debrief pick wrong; noun otherwise known) | gender lapse specifically | −0.25, logged to `articleMisses`, schedules article picks |
| **Curiosity tap** — tapped a tagged non-target, saw its 1.5 s word flash (New/Basics) | glimpse | +0.1, marks the word *glimpsed* (eligible for earliest intro) |
| **Passive audio/echo** — heard in recap, garnish echo, WORDS tab replay | maintenance | +0.05, capped once/day/word |

Search hints stage 1–2 do **not** mark the word assisted — they answer "where," not "what" (GDD §9's separation, honored in the model). New-tier finds are all scored as assisted-at-most (+0.3 baseline, since the gloss is permanently visible) with one exception: New-tier Debrief hits count in full — that is where New-tier players prove recognition.

### 8.2 Strength score

Per concept per case slot: **strength ∈ [0.0, 5.0]**, stored, updated by the event weights above, decayed by time (§8.4).

Band mapping (the only player-visible projection, as WORDS pips — §12):

| Strength | Band | Pips |
|---|---|---|
| never served as target (glimpsed/decoy only) | — | 0 |
| < 1.5 | **new** | 1 |
| 1.5 – 3.4 | **seen** | 2 |
| ≥ 3.5 with ≥ 2 unaided proofs (find or Debrief hit) | **known** | 3 |

The "known" band's proof requirement stops a word from graduating on passive exposure alone; the season promise (§14) counts this band.

### 8.3 Spacing stages

Each word carries a **spacing stage S0–S5** advancing on proof events (unaided find, Debrief hit) and regressing on lapses (Debrief miss; two assisted finds in a row). Because play sessions are irregular, the spacing unit is **rounds elapsed**, not wall-clock — with wall-clock decay overlaid (§8.4).

| Stage | Meaning | Due again after (rounds) |
|---|---|---|
| S0 | introduced / lapsed | next eligible round |
| S1 | one proof | 2 |
| S2 | two proofs | 5 |
| S3 | three proofs | 9 |
| S4 | strong | 16 |
| S5 | graduated | no round scheduling; recap & Evidence Sweep only |

Modifiers: `cognate` lexemes start at S1 and advance on a shortened ladder (2 → 6 → graduate); `false-friend` and `trap_flags` lexemes advance on a lengthened one (extra stop at 3 rounds) and get earlier Debrief attention. A due word that can't be served (no depicting prop in upcoming scene pools) becomes a **Debrief candidate** instead — the Debrief is the scheduler's overflow valve (GDD §8.5).

### 8.4 Time decay

Strength decays exponentially toward 0 with a half-life that grows with the word's stage: **S0–S1: 4 days · S2–S3: 10 days · S4: 30 days · S5: 90 days.** Decay is computed lazily whenever a record is read (no background process; offline-friendly). Decay can demote a band but never demotes spacing stage below S1 — a returning player's words come back *sooner*, they don't restart.

### 8.5 The Debrief as scheduled recall

3–5 items per Debrief, 45–75 s, no fail state (GDD §8.4). Selection priority, in order:

1. Words **missed** in the previous Debrief (immediate second chance, different channel).
2. Due-but-unservable words (§8.3 overflow).
3. This round's found words, weakest-strength first.
4. Trap-flagged articles due for an article pick.

Item-type assignment matches the word's weakest tracked channel: shaky article (`articleMisses`) → **article pick**; found-but-often-flipped → **word→image**; never heard actively → **audio→image**. German case slots weight article picks ≈ 40% of items; Spanish ≈ 20%; Italian ≈ 30% with *il/lo/la/l'* option sets (§11.3). A hit stamps the notebook and charges the Insight meter (+1, capped); a miss shows the word card warmly, replays audio, and sets stage S0. Skipping the Debrief (allowed post-Ch. 1) forfeits charges only; found-word exposures were already recorded.

### 8.6 Session-boundary behavior

- **Returning after ≥ 4 days:** the first round's review share may rise from ~30% to a cap of 40% ("cold-open review boost"), selected from decayed known-band words — one round only, never announced, never exceeding the cap, still obeying the no-stale-repeat guardrail.
- **The echo rule** (Story Bible §3): within two beats of a search, Margo naturally reuses 1–2 of the round's taught nouns. The scheduler feeds the beat system the round's two *weakest found words* as echo candidates; writers author lines with token slots. Echoes log passive exposure (+0.05).
- **Chapter recap:** the montage's 8 words are the chapter's lowest-strength found words (not a "best of" — a quiet rescue mission wearing a victory lap).
- **Evidence Sweep (S28):** all 14 targets are proper-named story objects whose props belong to season-taught concepts — the finale is a full-context review by design; each find logs passive exposure for its concept.

### 8.7 Guardrails

- **No-stale-repeat:** the round-builder rejects review sets repeating > 2 targets from the player's previous two rounds (GDD §8.5).
- **Review starvation is acceptable; review pressure is not.** If few words are due, review slots fill with fresh concepts — never padded with drills, never carried as visible debt.
- **Determinism:** scheduling inputs are part of the save; a resumed round rebuilds the identical target list (GDD §19.3).

---

## 9. Target Selection per Search (8–14)

The round-builder assembles each round's target list at round start. It is the point where authored content (templates) meets the player's model (review slots). Behavior spec:

### 9.1 Slot arithmetic

For a round of **N targets** (N = 8–14, authored per round; ramp per GDD §12 — Ch1 8–10, Ch2–3 10–12, Ch4–5 10–13, Ch6 12–14):

- **1 evidence slot** — the round's story object (always included, findable without language knowledge, visually distinct, narratively cued; occupies the final or second-to-final find position). Carries **no language load** and no word record.
- **Review slots** — `round((N − 1) × review_share)`, where review_share ramps: Ch1 ≈ 0.15 (little exists to review) → Ch2–5 ≈ 0.30 → Ch6 ≈ 0.40 (the season closes by consolidating). Filled from the scheduler's due list (§8.3), urgency-ordered: `(3.5 − strength) × rounds_overdue`, eligible only if a depicting prop exists in this scene's prop pool.
- **New slots** — the remainder, taken from the authored template's fresh concepts in authored order.
- **Plural slots** — 1–2 of the above (Ch2+) may be authored as multi-find (§4.4); review words are plural-eligible if `pluralSeen` is false and the pool has ≥ 3 depicting props (teaching the plural of a known word is prime review).

### 9.2 Constraints (all must hold)

1. Template integrity: fresh concepts come from the scene's authored, Fairness-Charter-passed templates (GDD §19.2) — the builder never invents a target the authors didn't validate.
2. No-stale-repeat guardrail (§8.7).
3. Domain spread: ≥ 3 domains represented among vocabulary targets (authored templates already guarantee this for fresh slots; review fills must not collapse it).
4. Decoy neighborhood: every target retains ≥ 3 semantic-neighbor decoys in-scene (GDD §7.2 — authored property, verified at build).
5. Article variety (German): a round's vocabulary targets never carry a single gender exclusively (authored templates balance der/die/das; review fills preserve at least two genders).
6. Tier presentation applied last (§5.1): the same list renders as gloss-visible chips (New), flip chips (Basics), phrase chips (Conversational), or mixed/audio chips (Advanced).
7. Deterministic per save-seed (GDD §19.3).

### 9.3 Mode interactions

- **Silhouette (S13):** targets render as outlines; the word card on find is the *reveal*. All finds score as unaided (the player matched shape, then received the word — the follow-up rule guarantees ≥ 4 of these concepts return as word-list targets in S14/S15, where recognition is actually tested).
- **Audio (S14):** chips speak instead of showing text (Conversational+). Finds score unaided **for the listening channel** and set an `audioProven` marker (§13).
- **Description (S19):** phrase chips; finds mark passive exposure for the phrase's helper words, full credit for the target concept.
- **Evidence Sweep (S28):** proper-named story objects; no word records touched beyond passive exposure (§8.6).

### 9.4 Season vocabulary budget (worked math)

From `season.md`'s canonical table (S00–S28): 329 total target slots − 29 evidence slots = **300 vocabulary slots**.

| Chapter | Vocab slots | New | Review |
|---|---|---|---|
| 1 (S00–S04) | 41 | ~35 | ~6 |
| 2 (S05–S09) | 51 | ~36 | ~15 |
| 3 (S10–S13) | 39 | ~27 | ~12 |
| 4 (S14–S18) | 54 | ~38 | ~16 |
| 5 (S19–S24) | 67 | ~47 | ~20 |
| 6 (S25–S27) | 35 | ~21 | ~14 |
| 6 (S28 sweep) | 13 (contextual) | 0 | 13 |
| **Season** | **300** | **≈ 204** | **≈ 96** |

**≈ 200–210 unique concepts served as vocabulary targets**, each seen 1.5× on average through review, plus Debrief-only serves, plural forms, curiosity reveals, and garnish glosses lifting total encountered words to ~280–320. Against §8's model, the median completing player lands **220–280 words at recognition-with-article** — the GDD §2 promise, with §14's metric (≥ 180 at known band) as the conservative floor. *(Note: GDD §8.6's "~285 slots ≈ 200 unique + 85 review" was estimated from the 27-round prose total; the table above supersedes it using the final 29-round map — same shape, reconciled numbers.)*

---

## 10. Story Language & Code-Switching

The story is told in English; the target language lives in the world's objects and in authored garnish. The Story Bible (§3) owns the fiction (Margo, the Lantern Quarter, the grandmothers); this section owns the language-layer contract.

### 10.1 Where each language lives

| Surface | Language | Notes |
|---|---|---|
| Dialogue, narration, CASE lines, clue text | English | fair-play rule: language knowledge never gates a deduction |
| Target chips, word cards, WORDS tab | target language + article (gloss per tier/flip) | the learning surface |
| Garnish tokens in dialogue | target language, tier-gated L0/L1/L2 | tap-to-gloss, never load-bearing |
| Signage & scene flavor (Lantern Quarter layers, shop signs) | target language | ambient print exposure; never required reading; localized art layers per pack |
| Vendors' calls (S14 ambience) | target language | authored audio-design lines from the pack's call script (§11.5) |
| Vane's sketchbook caption (C28), the *Nachtigall* alias gloss | target language, tap-to-gloss | authored, canonical in the bible |

### 10.2 Code-switching levels (normative, per Story Bible §3 and GDD §8.3)

- **L0 (New, Basics):** zero non-English tokens. Culture shows through English (grandmother proverbs quoted in translation).
- **L1 (Conversational):** max **one** non-English token per line; discourse markers, greetings, exclamations (*Also…*, *Bueno…*, *Allora…*); at emotion peaks and transitions only.
- **L2 (Advanced):** short idioms and clauses (≤ 5 words); at most one per line, two per beat.

**Authoring rules (enforced at content lint):** every token/idiom is tap-to-gloss; comprehension must survive deleting all non-English tokens; never mid-fact, never on clue content; Margo never translates herself ("no classroom English"). Tokens are drawn from the pack's **token bank** (§11.5) so writers author language-neutral lines with token slots, and each pack fills them.

### 10.3 The echo rule as a language surface

Echo lines (§8.6) are the one place dialogue intersects the scheduler. Contract: the beat system requests up to 2 echo tokens = the round's weakest found nouns; the line renders the noun *with its article* in italics, tap-to-gloss ("You found the *der Schlüssel*—" is a lint error; the token slot receives the full phrase: "You found the *Schlüssel*? Good—" style is authored per pack with article included where the syntax welcomes it, dropped where it would be ungrammatical in the frame sentence — the pack's token bank marks each noun's echo form).

### 10.4 What code-switching never does

Never carries plot facts; never gates puzzles; never appears in Board Reviews or the accusation block (English, verbatim from the bible); never exceeds tier gates; never gets tested. Garnish is seasoning on the story — the tray is the meal.

---

## 11. Language Architecture — the German / Spanish / Italian Packs

Everything language-specific ships as a **language pack**: a self-contained content unit with no scene, art, or logic dependencies. The concept dictionary defines *what* is taught; a pack defines *how one language says it*. Adding language N+1 (French, say) = authoring one new pack. This section is the work order for the three v1 language specialists.

### 11.1 Pack contents (deliverables checklist, per language)

1. **Lexeme table** — all ~420 concepts × the §3.3 record: article, word, `display`, `plural_display`, gloss override where needed, difficulty band, trap flags, `tts_text` overrides, notes. *Release gate: native-speaker review of every row (GDD §19.1) — article correctness, regional neutrality, period fit (1927 — no anachronistic loanwords).*
2. **Article module** — the pack's article inventory, glyph mapping (▲/●/■ subset), Debrief article-pick option sets and distractor rules (§11.2–11.4), plural article mapping.
3. **Trap register** — the pack's flagged lexemes with one-line caution notes for gloss cards (§6.1).
4. **Description-phrase set** — one ≤ 6-word phrase per concept in the Conversational/Description pool (~120 concepts minimum: everything appearing in Ch3+ templates), plus S19's authored dozen.
5. **Token bank** — L1 markers/greetings/exclamations (~25), L2 idioms with glosses (~40, including the bible's canonical lines: the grandmother proverbs, the wren/nightingale bird glosses, C28's caption), echo forms for all A/B-frequency nouns (§10.3).
6. **Vendors' call script** — S14's ambient market calls (~12 short lines) using taught A-band food/market nouns.
7. **Signage strings** — Lantern Quarter and shop-sign flavor text (art hands letterforms; pack hands correct strings).
8. **SpeechSynthesis QA pass** — §7.5's matrix: every `display`/`plural_display` (and overrides) verified against major platform voices at both rates; slow-rate calibration for the pack (§7.2).
9. **Selection review** — confirm the pack's target-taught subset satisfies §3.5 frequency shares and §9.2 article-variety needs (German especially: taught nouns land ≈ ⅓ der / ⅓ die / ⅓ das, so article picks stay honest).

### 11.2 German pack notes (for the German specialist)

- **Articles:** der/die/das + uniform plural *die*. The season's hardest and highest-value article system; Debrief article-pick weighting ≈ 40% (§8.5). All three glyphs in play (▲/●/■).
- **Traps:** gender surprises (*das Mädchen*, *das Messer*-class counterintuitives) flagged `gender-surprise`; classic false friends (*das Gift*, *der Rock*, *bald*-adjacent nouns as applicable to the noun-only scope) flagged `false-friend`.
- **Compounds policy:** prefer simple forms; a compound is allowed when it *is* the everyday word (*der Leuchtturm*, *die Taschenuhr*). No compound longer than 4 syllables as a taught target; longer delights may exist as C-band decoy reveals.
- **Orthography:** noun capitalization is free incidental teaching — always render correctly; never flagged or explained.
- **TTS QA focus:** final devoicing, *ch* variants, compound stress; verify the article never elides into the noun at 0.7 rate.

### 11.3 Italian pack notes (for the Italian specialist)

- **Articles:** il/lo/la/l' + i/gli/le. The pack's special duty is **phonological article selection taught by exposure**: template review (§11.1 item 9) must guarantee ≥ 1 *lo/l'*-class noun per round from Ch2 (*lo specchio*, *l'arancia*, *l'orologio*, *gli occhiali*…).
- **Debrief distractor rule:** article picks offer only phonologically *plausible* options (for *specchio*: il/lo/la — never l'; for *arancia*: la/l' plus one gender foil). The pick teaches the pattern, never punishes phonology the player hasn't accumulated.
- **Elision display:** `display` strings render the apostrophe tight (*l'arancia*); the gender glyph disambiguates the hidden gender (§4.2); `tts_text` overrides wherever a voice reads the apostrophe as a pause.
- **TTS QA focus:** gemination (*ll*, *cch*), open/closed vowels, article-noun liaison at slow rate.

### 11.4 Spanish pack notes (for the Spanish specialist)

- **Articles:** el/la + los/las. Two glyphs (▲/●). Debrief article weighting ≈ 20% — the budget saved funds more word→image and audio→image items.
- **Traps:** the stressed-á feminine class (*el agua*, *el hacha* — flagged `el-agua-class`, gloss card carries the one-line note "feminine — *el* only in the singular"), gender-counterintuitives (*la mano*, *el mapa*, *el día*, *la foto*), false friends within noun scope (*la ropa*, *el éxito*-class as applicable).
- **Regional neutrality:** pan-Hispanic lexical choice is the rule (GDD §19.1); where variants are unavoidable, pick the most broadly understood term and record the decision in `notes` (e.g., a single canonical choice among *gafas/lentes/anteojos*, applied consistently).
- **Orthography:** accents and *ñ* always rendered — chips, cards, journal, everywhere.
- **TTS QA focus:** *ll/y* realization consistency within the chosen voice, syllable-timed clarity at 0.7 rate.

### 11.5 Pack-neutral authoring rules

- Every pack teaches the **same 420 concepts** on the same schedule — packs never add, remove, or reorder curriculum.
- Description phrases and token banks may not introduce untaught *content* nouns as load-bearing (structural/function words are free).
- Slow-rate calibration (§7.2) and echo forms (§10.3) are per-pack decisions, documented in the pack.
- A pack is shippable when: lexeme table 100% native-approved, TTS QA matrix 100% dispositioned (pass or override), token bank lint-clean against §10.2, and the §11.1 checklist signed by the language specialist.

---

## 12. The WORDS Tab

The vocabulary journal (GDD §11): a trophy room, never a to-do list. Diegetically, it is Halloway's study notebook — *"a word a day keeps the fog off."*

### 12.1 The word card

Every encountered concept gets one collectible card:

- **Front:** generic concept thumbnail (never a scene prop) · `display` phrase with gender glyph · speaker buttons (normal / slow) · 0–3 strength pips (§8.2 band mapping) · "first found: Museum Gallery" location line.
- **Back (tap to flip):** English gloss · plural phrase (revealed once `pluralSeen`) · trap caution line if flagged · the detective's one-line margin note where authored (C-band delights get flavor: *"der Sextant — Finch's whole fortune, apparently"*).
- Words that were only *glimpsed* (curiosity taps, decoy reveals — never served as targets) appear as **penciled entries**: greyed sketch style, 0 pips, no location line — the collection's visible frontier, inviting completionists without demanding anything.

### 12.2 Organization & filters

- Default sort: journal order (first-encounter). Filters: **chapter · domain (§3.4) · "words that keep slipping"** (bottom strength band — the model's only self-aware surfacing, framed as flavor per GDD §8.5).
- **Field-notes stamps:** per-location completion stamps when every concept in that location's prop pool has been encountered (found or glimpsed) — the completionist chase (GDD §12), fed by curiosity taps and Sprint replays.
- **Explicitly absent, forever:** review queues, due counts, drill/practice buttons, streaks, XP, percentages, "mastery" language. The strongest allowed claim is three quiet pips.

### 12.3 Journal behaviors

- A card is created on first exposure of any kind; pips and location line appear on first *serve as target*.
- The pip animation on band promotion is a single soft stamp — visible if you're watching, missable if you're not. No toast, no fanfare.
- Audio replays from the journal log passive exposure (§8.1) — browsing the trophy room quietly counts as maintenance, which is exactly how a real notebook works.

---

## 13. Internal Tracking — the Word Record

The model's storage contract. One **word record** per `(caseSlot, conceptId)` — the model is per case, per GDD §17 (your German strength never pollutes your Italian case). Design contract, not code:

```
wordRecord:
  conceptId:          object:key         # stable key (§3.2)

  # exposure counters (monotonic)
  timesSeen:          int                # any exposure: served, word card, Debrief item,
                                         #   curiosity reveal, garnish gloss, journal replay
  timesServedAsTarget:int                # rounds in which it was a vocabulary target
  timesFound:         int                # all finds
  timesFoundUnaided:  int                # finds with no flip this round & no stage-3 hint
  timesTranslated:    int                # chip flips + garnish-gloss taps (the honest cost, §6.3)
  timesSearchHinted:  int                # finds where any search-hint stage was used on this target
  stage3Finds:        int                # finds via exact-reveal (scored as revealed, §8.1)
  timesHeard:         int                # utterances played for this word (any surface)
  timesHeardSlow:     int
  debriefHits:        int
  debriefMisses:      int
  articleHits:        int                # article-pick results tracked separately from the noun —
  articleMisses:      int                #   knowing "Schlüssel" ≠ knowing "der" (§4.3)

  # channel proof markers
  audioProven:        bool               # ≥1 audio→image hit or audio-mode unaided find (§9.3)
  pluralSeen:         bool               # plural phrase shown/spoken at least once
  pluralFound:        bool               # completed a multi-find of this concept

  # timestamps & provenance
  firstSeenAt:        timestamp
  lastSeenAt:         timestamp
  lastProofAt:        timestamp          # last unaided find or Debrief hit
  firstFoundRound:    S-id               # e.g. S01 — drives the journal's location line
  introducedAtTier:   tier               # proficiency at first serve (analytics only)

  # scheduler state
  strength:           float 0.0–5.0      # §8.2; decayed lazily on read (§8.4)
  spacingStage:       S0–S5              # §8.3
  dueAtRound:         int                # rounds-elapsed pointer (player round counter)
  lapses:             int                # Debrief misses + assisted-find regressions
```

### 13.1 Derivations (never stored twice)

Band/pips derive from strength + proof counts (§8.2). Debrief item-type selection derives from the channel counters (§8.5). "Assisted" status is a *round-scoped* transient (this chip was flipped this round), not a record field — it resolves into `timesFoundUnaided` vs. the +0.3 event at find time.

### 13.2 Event log & sync

Beneath the counters, exposures append to a compact per-case **exposure event log** (event type §8.1, conceptId, round, timestamp). Autosave granularity is per event (GDD §17: never lose a find, never lose a Debrief answer). Sync merge follows the GDD's rule, restated here as the model's contract: **per-concept max(strength) + summed counters from both devices; spacingStage takes the higher; timestamps take the later.** Learning is never lost from either device; counters may double-count in pathological merges, which biases the scheduler *gentler* — the correct failure direction.

### 13.3 Per-case aggregates (cheap, derived, cached)

Words at each band (drives §14 metrics and the chapter recap's word selection) · per-domain encounter coverage (drives field-notes stamps) · translation-flip rate over last 3 rounds (drives the §5.2 one-time nudge) · per-word playback counts (drives the §7.6 studio-upgrade priority list).

### 13.4 Privacy posture

All records are local-first game state, not telemetry. The GDD §21 telemetry stream carries only anonymous aggregates (band counts, flip rates), opt-out, never per-word history off-device except via the player's own optional sync.

---

## 14. Language-Layer Metrics & Tuning

Extends GDD §21 with the language layer's own instruments (same telemetry posture):

| Metric | Target | Tuning lever if missed |
|---|---|---|
| Words at **known** band, campaign end | ≥ 180 median (GDD promise floor) | review_share ramp (§9.1); Debrief item count toward 5 |
| Unaided-find rate on **review** targets | 55–80% | too low → shorten spacing intervals (§8.3); too high → lengthen (words are under-spaced) |
| Debrief hit rate | 60–85% | outside band → §8.5 selection weights (too easy/hard defeats the testing effect) |
| Translation-flip rate, New tier | 30–60% of chips (GDD) | below → gloss placement; above → onboarding tier copy |
| Translation-flip rate, Basics+ trend | declining chapter-over-chapter | flat/rising → scheduler or tier-nudge review (§5.2) |
| Article-pick accuracy, German, Ch5+ | ≥ 70% | below → raise article-pick share earlier; audit trap-flag coverage |
| Audio replays per word (any tier) | ≥ 1.5 mean | below → speaker affordance visibility; verify §7.4 unlock isn't failing silently |
| No-voice degradation rate | < 3% of sessions | above → widen §7.3 ladder; revisit voice guidance in settings |
| "Keeps slipping" filter usage | present but < 15% of WORDS visits | above → the invisible model is leaking anxiety; soften surfacing |

Tuning discipline: levers move one at a time, playtest-gated, and **no lever may violate a §2 prohibition** — if a metric can only be hit by adding a streak or a due counter, the metric is wrong, not the principle.

---

## 15. Glossary Additions

Extends GDD §23:

| Term | Meaning |
|---|---|
| **Language pack** | One language's complete content unit: lexeme table, article module, traps, phrases, token bank, calls, signage, TTS QA (§11) |
| **Word record** | The per-case, per-concept tracking structure (§13) |
| **Strength / band / pips** | 0–5 internal score → new/seen/known band → 0–3 journal pips (§8.2) |
| **Spacing stage** | S0–S5 rounds-based re-serve ladder (§8.3) |
| **Proof event** | Unaided find or Debrief hit — the only events that advance spacing |
| **Assisted find** | Find after flipping that chip this round; reduced strength credit (§8.1) |
| **Glimpsed word** | Encountered via curiosity tap/decoy reveal, never served as target; penciled journal entry (§12.1) |
| **Provider seam** | The single audio abstraction behind which SpeechSynthesis (v1) and recorded audio (later) are interchangeable (§7.6) |
| **`tts_text` override** | Respelled string fed to synthesis when display text mispronounces; display never changes (§7.5) |
| **Token bank** | A pack's authored L1/L2 code-switch inventory with glosses and echo forms (§11.5) |
| **Echo rule** | Margo reuses the round's weakest found nouns in post-search banter (§8.6, Story Bible §3) |
| **Cold-open review boost** | One-round review-share raise (≤ 40%) after ≥ 4 days away (§8.6) |

---

*End of document. Downstream: the German, Spanish, and Italian language specialists author packs from §11 against the concept dictionary; the systems/engineering phase implements §7–§9 and §13 from this specification. This document, the GDD, and the Story Bible are jointly the design authority for the language layer.*
