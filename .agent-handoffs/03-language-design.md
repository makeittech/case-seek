# Status
DONE

## Outputs
- `/workspace/docs/LANGUAGE_DESIGN.md` — complete language-layer design: two-layer vocabulary model (language-neutral concepts `object:key` → per-language lexemes); 12 canonical domains; frequency bands A/B/C; difficulty band moved concept→lexeme (flagged **[GDD refinement]** — cognate status is language-pair-specific); articles as inseparable parts of words (der/die/das ▲●■, el/la + el-agua traps, il/lo/la/l' phonological selection taught by exposure); plurals via multi-find; four tiers (New/Basics/Conversational/Advanced) as a normative scaffolding matrix — presentation only, never curriculum or fairness; translation free/unlimited/on-demand (chip flip; only cost is honest logging); **pronunciation on SpeechSynthesis** — the one deliberate GDD §16 amendment (voice-selection ladder, 0.7 slow rate, `tts_text` overrides, QA matrix as release gate, no-voice degradation, provider seam preserving the studio-audio upgrade path); invisible scheduler (8 exposure event types with weights, strength 0–5, new/seen/known bands, spacing stages S0–S5 in rounds-elapsed, lazy time decay, Debrief as overflow valve, echo rule, cold-open review boost); round-builder spec for 8–14 targets (1 evidence + review + new slots, review share 0.15→0.40 ramp, 7 constraints, mode interactions); story-language/code-switching contract (L0/L1/L2, token banks); language-pack architecture with per-specialist work orders (de/es/it, 9-item deliverables checklist); WORDS-tab journal spec; word-record tracking contract (`conceptId`, `timesSeen`, `timesTranslated`, `timesFoundUnaided`, `articleMisses`, `spacingStage`, etc.) with sync-merge rules; metrics table with tuning levers.

## Verification
- All brief-mandated topics covered; no engine code (data shapes as design contracts only, matching GDD precedent).
- Season budget recomputed from `season.md`'s 29-round table: 329 slots − 29 evidence = 300 vocab ≈ 204 new + 96 review → 220–280-word promise supported; GDD §8.6 estimate reconciled.
- Consistent with GDD §8/§9/§14/§17/§19 and Story Bible §3 (echo rule, garnish gates, canonical glosses).

## Blockers
NONE — de/es/it specialists can start from §11 immediately.
