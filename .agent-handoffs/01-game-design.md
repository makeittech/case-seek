# Status
DONE

## Outputs
- /workspace/docs/GAME_DESIGN.md — complete production game design for Case & Seek (Season One: *The Hollow Frame*)

## Key decisions (for downstream agents)
- Core loop: story → location → HOG search → Debrief (learn words) → clue → next. Time split: 65–75% search, 15–20% narrative, 5–10% puzzles, 5–10% learning feedback.
- Content: 16 unique locations + hub, 7 recomposed variants, 27 search rounds, 9 puzzles, 6 chapters, ~4.5–7.5 h first play.
- Scenes are layered prop stacks (40–110 tagged sprites, alpha-derived hit shapes) — never flattened bg + invisible hitboxes. 8–14 targets/round. Fairness Charter (7 checks) in §7.3. Zoom 1–3× with pan; findable at 1×.
- Language binds to semantic concept IDs (`object:key`) → per-language lexemes with articles (de/es/it), never filenames. ~420 concepts, ~1,260 lexemes with native audio.
- Translation hints (free, unlimited, chip-flip) and search hints (Insight meter, 3-stage escalation: region pulse → smaller circle → exact object) are separate systems — §9.
- Proficiency tiers New/Basics/Conversational/Advanced change scaffolding only, not search fairness. No timer on campaign; timed Sprint mode is opt-in post-completion only.
- Notebook tabs: CASE, PEOPLE, CLUES, WORDS. Vocabulary model is internal (strength scores drive ~30% review slots in target lists); no SRS UI.
- Offline-first: local-first saves per found object, per-chapter asset bundles, optional merge-safe sync. New Case flow ≤2 min to first find.
- Optional modes capped (~15% of rounds): silhouette, audio, description, evidence sweep, pairs-as-puzzle.
- Genre pattern analysis (June's Journey, Hidden City, Seekers Notes, Big Fish HOPA) in §20 — patterns only, no IP.

## Verification
- passed — all 21 mandated requirements present and cross-checked against the brief; budgets/pacing math internally consistent; no implementation code included

## Blockers
NONE
