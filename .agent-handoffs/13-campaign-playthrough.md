# Status
DONE — the complete campaign was played New Case → Case Solved in a real browser through the real flow controller and real content, with no developer skip. Two genuine blockers plus two harness defects were found, fixed, and re-verified. Placeholder sweep clean.

## What was played (fresh agent, did not build the game)
A single continuous session — **German, Conversational tier** — driven by Playwright against the **production build** (`vite preview`), clicking the live canvas through the real `InputController → hitTest → handleSceneTap` pipeline:

- **All 88 season flow nodes in authored order** (`content/story/season.json`): 39 beats read line-by-line (garnish tokens rendering at L1), **all 29 search rounds S00–S28** played to completion (8–14 targets each; word-list, **silhouette S13**, **audio S14**, **description S19**, and **evidence-sweep S28** modes all exercised), every debrief taken (never skipped), **all 9 puzzles genuinely solved through their mechanics** — torn-paper, combination (7-4-9), pairs, cipher-wheel (shift 7), silhouette-sort, light-sequence (two signals), ratio-mix (2·3·1), logic-grid, clock-hands (05:40) — the skip button was never touched, all 3 board reviews connected (C07↔C09, C22↔C23, C31↔C26), all 6 chapter recaps, the **rooftop accusation** (one deliberate wrong pick — Casal — bounced with the wrong-line as designed, then Ottilie named), the **6-panel epilogue + Season Two coda**, landing back on the title with the case filed **“· Solved”** under Case Files.
- Evidence pins, notebook peeks, results stamps, insight charges, plural chips (“die Laterne ×2” class), and word cards all behaved during the run; every found chip folded with its ✓.

The full 88-node log is at the bottom.

## How to re-run it
```
npm run build && npm run test:campaign        # ~7¼ minutes, chromium
```
- `e2e/full-campaign.spec.ts` — the playthrough driver. Walks season.json node by node and asserts the UI presents exactly the expected screen for each; solves each puzzle from its real UI (mirroring the components' deterministic shuffles); makes one wrong accusation on purpose; asserts 29 rounds/9 puzzles/39 beats and the Solved stamp at the end.
- `playwright.campaign.config.ts` — runs it against `vite preview` on :4655. The dev server is unusable for a 20-minute session: any file save triggers an HMR full reload mid-round (observed live — another agent was editing this branch during the run). The regular 7-spec suite ignores this spec (`testIgnore` in `playwright.config.ts`).

## Blockers found → fixed
1. **Solved case file unreachable after the finale** (`src/ui/screens/TitleScreen.tsx`). The title screen filtered completed saves out of state and gated the Case Files button on that filtered list — finish the only case and Continue *and* Case Files both vanish, so the “Solved” stamp/export/delete were dead UI. Now Continue offers only unfinished cases while Case Files lists every slot. Fixed in `5582498`, verified by the playthrough's final assertions.
2. **Test hook reported occluded points as tappable** (now `src/ui/screens/search/testHook.ts`). `remainingTargets()` passed an **empty `taggedIds`** to `hitTest`, which treats untagged hits as see-through ambience — so the hook claimed the S04 stool was tappable at its center while a real tap there hit the compass lying on top of it (verified with an offline mask simulation *and* in-page tap logging: hook said `target-hit`, real pipeline said `tagged-non-target → shimmer`). The hook now builds `taggedIds` exactly like a real tap.
3. **Hook sampling couldn't reach legitimately occluded targets** (same file). The old 15-point offset spiral never escaped the compass covering the stool's center. The hook now walks the target's own silhouette cells center-out until the full pipeline confirms a top-most, on-canvas, unobstructed point — the S04 stool is found at its legs, exactly where a player would tap. (Fairness check: the stool is 57% visible — within the Charter's ≤60% occlusion cap; sim: 2 317 of 4 046 mask cells win the hit test.)
4. **`findAllTargets` race with round completion** (`e2e/helpers.ts`). The last find schedules `completeRound` on a 700 ms timer; the slower mask-scan widened the window in which the results screen replaces the search screen between the helper's two checks, throwing “left the search screen”. The helper re-checks for the results screen before declaring failure.

Fixes 2–4 were root-caused and verified in a pinned worktree here, and landed on the branch in `ee69126` (coordinated with the concurrently-working agent, who folded them into its SearchScreen decomposition and then went further: `29c3951` now enforces the occlusion cap from real silhouettes in the validator, and `9dbb40a` nudged twelve buried placements above it).

## Verification (pinned worktrees, shared-branch churn excluded)
- `npm run validate` — OK, 16 known warnings (accepted since 09-localization).
- `npm run lint` / `npx tsc --noEmit` — clean (checked at `ee69126`).
- `npm test` — 81/81, including `src/app/campaign.test.ts` (the store-level full-campaign integration: same 88 nodes through the flow controller with service fakes).
- `npm run build` — clean.
- `npm run test:e2e` — 7/7 (smokes, console hygiene ×3, axe) (at `ee69126`).
- `npm run test:campaign` — **PASSED, 7.2 min** — at `ee69126` *and re-run at `9dbb40a`* after the placement nudges (both runs: 29 rounds, 9 puzzles, 39 beats, Solved).

## Placeholder sweep — CLEAN
Swept `src`, `content`, `e2e`, `tools`, `public`, `index.html`, `docs` for TODO/FIXME/XXX/HACK/TBD/WIP, lorem/ipsum, dummy/stub/sample text, “coming soon”, “not implemented”, changeme/test123/asdf/foobar, `???`, Untitled/unnamed, and empty JSON string values. Zero real hits. Every match is legitimate: Spanish/Italian vocabulary (“…todos…”, “lista todos los lotes”), the asset auditor's own placeholder heuristics, the validator's `{echo}`/`{gran}` token lint, story canon (“an unnamed master”, the unnamed 1919 Ottilie), and design-doc language about TTS-as-dev-placeholder (superseded by LANG §7's SpeechSynthesis amendment).

## Coordination note
Another agent worked this branch throughout (persistence refactor, SearchScreen decomposition, code-split, a11y modals, occlusion validator). Its dev-server edits are what reloaded my first in-browser run mid-round — hence the production-preview campaign config. All my verification ran in worktrees pinned to committed SHAs; only my own files were staged.

## Notes for future work
- The campaign spec is CI-ready but long (~7¼ min); it belongs in a nightly/release lane, not the PR loop.
- The hook's mask walk makes `remainingTargets()` heavier (~100–300 ms per call with a full find list); fine for e2e, dev-hook-only code.
- If a future scene ever places a target whose *entire* visible silhouette sits under DOM chrome at 1×, the driver would need zoom/pan support — the current content never triggers this (29/29 rounds complete at 1×).

## Playthrough log (88 flow nodes, German conversational, production build @ 9dbb40a)
```
beat b1.1
S00 · Detective's Office (CHAPTER 1 — THE EMPTY FRAME) — 8 targets found
beat b1.2
S01 · Museum Gallery (CHAPTER 1 — THE EMPTY FRAME) — 9 targets found
beat b1.3
beat b1.4
S02 · Curator's Office (CHAPTER 1 — THE EMPTY FRAME) — 9 targets found
beat b1.5
S03 · Curator's Office (CHAPTER 1 — THE EMPTY FRAME) — 10 targets found
beat b1.6
S04 · Museum Archives (CHAPTER 1 — THE EMPTY FRAME) — 10 targets found
puzzle P1 solved (torn-paper)
beat b1.7
chapter 1 recap
beat b2.1
S05 · Harbor Docks (CHAPTER 2 — SALT AND SMOKE) — 10 targets found
beat b2.2
S06 · The Rusty Anchor (CHAPTER 2 — SALT AND SMOKE) — 11 targets found
beat b2.3
puzzle P2 solved (combination)
beat b2.4
S07 · Harbor Docks — Berth 9 (CHAPTER 2 — SALT AND SMOKE) — 11 targets found
beat b2.5
S08 · The Rusty Anchor (CHAPTER 2 — SALT AND SMOKE) — 12 targets found
beat b2.6
S09 · Customs Warehouse (CHAPTER 2 — SALT AND SMOKE) — 12 targets found
puzzle P3 solved (pairs)
beat b2.7
board review BR1: C07 ↔ C09
chapter 2 recap
beat b3.1
S10 · Grand Hotel Lobby (CHAPTER 3 — THE GILDED TRAIL) — 10 targets found
beat b3.2
S11 · Casal's Antique Shop (CHAPTER 3 — THE GILDED TRAIL) — 12 targets found
puzzle P4 solved (cipher-wheel)
beat b3.3
S12 · Grand Hotel Lobby (CHAPTER 3 — THE GILDED TRAIL) — 11 targets found
beat b3.4
S13 · Hotel Suite 412 (CHAPTER 3 — THE GILDED TRAIL) — 10 targets found
puzzle P5 solved (silhouette-sort)
beat b3.5
chapter 3 recap
beat b4.1
S14 · Night Market (CHAPTER 4 — NIGHT MARKET) — 11 targets found
puzzle P6 solved (light-sequence)
beat b4.2
beat b4.3
S15 · Night Market (CHAPTER 4 — NIGHT MARKET) — 12 targets found
beat b4.4
S16 · Tram Depot (CHAPTER 4 — NIGHT MARKET) — 11 targets found
beat b4.5
S17 · Artist's Loft (CHAPTER 4 — NIGHT MARKET) — 12 targets found
puzzle P7 solved (ratio-mix)
S18 · Artist's Loft (CHAPTER 4 — NIGHT MARKET) — 13 targets found
beat b4.6
board review BR2: C22 ↔ C23
chapter 4 recap
beat b5.1
S19 · Auction House (CHAPTER 5 — THE AUCTION) — 12 targets found
beat b5.2
S20 · Auction House (CHAPTER 5 — THE AUCTION) — 12 targets found
puzzle P8 solved (logic-grid)
beat b5.3
S21 · Museum Archives (CHAPTER 5 — THE AUCTION) — 13 targets found
beat b5.4
beat b5.5
S22 · The Conservatory (CHAPTER 5 — THE AUCTION) — 11 targets found
beat b5.6
beat b5.7
S23 · Antique Shop — Shuttered (CHAPTER 5 — THE AUCTION) — 12 targets found
beat b5.8
S24 · Clocktower Workshop (CHAPTER 5 — THE AUCTION) — 13 targets found
chapter 5 recap
beat b6.1
beat b6.2
S25 · Central Station (CHAPTER 6 — THE BROKER) — 13 targets found
puzzle P9 solved (clock-hands)
beat b6.3
S26 · Boathouse & Ferry Pier (CHAPTER 6 — THE BROKER) — 12 targets found
beat b6.4
S27 · Museum Gallery — Ransacked (CHAPTER 6 — THE BROKER) — 13 targets found
beat b6.5
beat b6.6
S28 · Belmont Rooftop (CHAPTER 6 — THE BROKER) — 14 targets found
board review BR3: C31 ↔ C26
chapter 6 recap
accusation: named ottilie (after one wrong pick: casal)
epilogue: 6 panels + coda
```
