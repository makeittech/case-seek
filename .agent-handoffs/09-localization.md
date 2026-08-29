# Status
DONE — complete, native-quality German / Spanish / Italian language packs; validator, typecheck, lint, 81 unit tests, and production build all green.

## Outputs

### Language packs (`content/languages/{de,es,it}/pack.json`)
Generated from the single source of truth `tools/gen/vocab-data.mjs` via `node tools/gen/generate.mjs` — **never edit the pack JSONs by hand**.

Per language: **207 lexemes** (100% concept coverage), each with:
- correct article (der/die/das · el/la/los/las · il/lo/la/l'/i/gli/le) derived from authored gender, with explicit overrides for the *el-agua* class («el ancla» → «las anclas») and pluralia tantum («las tijeras», «le forbici», «die Handschellen»);
- full plural display forms (198/200/198 — mass nouns and pluralia tantum intentionally have none);
- difficulty band (cognate / transparent / opaque / false-friend) per lexeme, not per concept;
- a ≤6-word present-tense description phrase for every concept (Description-mode chips, Conversational+), never leaking the target word;
- trap register: caution note + structured `trapFlags` (`gender-surprise`, `el-agua-class`, `false-friend`, `polysemy`, `plural-only`) — 7 de / 18 es / 14 it entries.

Pack metadata: localized `greeting`, `grandmother` (Oma Katja / Abuela Rosa / Nonna Lucia), tuned `slowRate` (de 0.70 — keeps Auslaut crisp; es 0.72; it 0.75 — gemination survives), `articleOptionSets` for debrief picks (es adds a `[los, las]` row for pluralia tantum; it has three phonologically plausible rows so «l'» is never offered for «specchio»), `articlePickWeight` per LANGUAGE_DESIGN §8.5 (de .4 / es .2 / it .3), 12 vendor calls and 12 signage strings per language (Ch. 4 market ambience, built from A-band market nouns).

### Code-switching token bank (69 shared keys × 3 languages)
- **L1** (31): discourse markers, greetings, exclamations — «Also/Bueno/Allora», «Genau/Exacto/Esatto», plus the canon bird-words.
- **L2** (38): idioms and proverbs ≤5 words — «Wer sucht, der findet / El que busca, encuentra / Chi cerca trova» (the grandmother's proverb, STORY_BIBLE canon), «Die Nachtigall singt noch…» (C28), wren-words «der Zaunkönig / el chochín / lo scricciolo», and detective-flavored idioms (auf frischer Tat, aquí hay gato encerrado, gatta ci cova…). Adaptations are idiomatic per language, not literal («klar wie Kloßbrühe» ↔ «más claro, el agua» ↔ «chiaro come il sole»).

### Concepts (`content/vocabulary/concepts.json`)
`multiFindOk` is now true for exactly the 17 concepts used by `rounds.json` plural slots (seagull, bottle, lantern, key, …) — all 17 have plural forms in all three languages (validator-enforced).

### Engine additions (schema + runtime)
- `LanguagePackSchema.grandmother` + **`{gran}` placeholder** in dialogue lines, resolved in `renderLine` (`src/app/storyFlow.ts`) to the study-language name. Names are fair at every tier.
- `ClueSchema.captionKey` + `clueCaption()` helper: C28's sketchbook caption now renders in the study language from the token bank («Die Nachtigall singt noch.» — "the nightingale still sings"), with the English `caption` as fallback. Wired into ClueScreen, Notebook, SearchScreen.

### Dialogue fixes (was hardcoded German → broke es/it runs)
- «My Oma …» ×4 → `{gran}` (ch1, ch2 ×2, ch5); «na ja» → English (the lead garnish token already carries the flavor) (ch3).
- Ch4 alias beat: bird-word now glossed via the `nightingale` L1 garnish per STORY_BIBLE §5 («Nachtigall» itself stays German in all runs — it is her 1907 staff nickname).
- Added the canonical Ch4 wren garnish beat (L2 `wren` token) — was specified in the bible, missing from dialogue.
- «Herr Finch» → "Mr. Finch" (garnish carries the code-switch); «Mr. Halloway» → "Detective" (Halloway is gender-neutral by design, STORY_BIBLE §2).
- ch5 «look» garnish level corrected L2 → L1 to match the bank.

### Validator (`tools/validate.ts`) — new language QA lints, all as build-failing errors
Article ∈ language set; der/die/das ↔ gender-glyph agreement; German plurals take «die»; Spanish feminine + «el» must be flagged `el-agua-class`; Italian article phonology (l' before vowel, lo before s+cons/z/gn/ps, il/la elsewhere, i/gli/le plural agreement); description phrase required, ≤6 words, no target-word leak; trapFlags require a caution note; duplicate article+word forms per pack (audio-round ambiguity); L2 tokens ≤5 words; token key sets identical across packs; garnish line-level must match bank level; only `{echo}`/`{gran}` placeholders allowed; pluralSlots require `multiFindOk`; captionKey must resolve in every pack.

## Second-pass QA (independent review) — issues found & fixed
- es «Ahí está la madre del cordero» was 6 words (L2 limit 5) → «Ahí está el quid».
- Distinct-form audit: crate/drawer collision in es resolved («la caja de embalaje» vs «el cajón»); candlestick/candelabra/chandelier, caja/cassa compounds, carrello variants all verified distinct per language.
- Full 207-row read-through of the generated table (de/es/it side by side): gender traps verified (die Leiter, das Band, der Anhänger; el mapa, la mano de mortero, la foto; lo specchio → gli specchi, l'ancora → le ancore).
- Style sweep: German nouns capitalized, es/it lowercase, ASCII apostrophes throughout, no phrase over 6 words, no target-word leaks — mechanical checks now permanent in the validator.

## Verification
- `node tools/gen/generate.mjs` → deterministic regeneration, no drift.
- `npm run validate` — OK, 0 errors (16 pre-existing warnings: round fill capacity + caseLine length, outside localization scope).
- `npm run typecheck`, `npm run lint`, `npm test` (81/81), `npm run build` — all green.

## English UI strings
`content/ui-strings/en.json` is complete: all 38 statically referenced `ui()` keys plus the dynamic `tab.*`/`clue.*` families resolve. **No `content/languages/en` pack was created on purpose** — the loader's lang enum is `de|es|it` (English is the frame language, not a study language); an en pack would fail schema validation.

## Judgment calls (defensible simplifications)
- de «Tabakdose» for snuffbox (precise «Schnupftabakdose» too long for chips); de/es/it dust sheet rendered as sheet-words (Laken/sábana/lenzuolo) — the draped-furniture context carries the meaning.
- es «el pescado» (market fish on the slab) with a caution teaching «el pez»; es «martillo» for the auction gavel (it gets the precise «martelletto»).
- Pluralia tantum are excluded from multi-find; their plural display field stays empty because the base form is already plural.

## Blockers
NONE

## Notes for future work
- `ttsText`/`ttsTextPlural` override seam exists in the schema but is unused — spot-check real SpeechSynthesis voices on device; likely candidates: it elisions read fine, but de compound stress and es «paragüero» deserve a listen.
- `vendorCalls`/`signage` are authored and validated but not yet consumed by the ambience layer (Ch. 4 audio round soundscape) — wire when audio lands.
- Unused-but-ready tokens: `mister` (Herr/Señor/Signor) for future honorific beats.
