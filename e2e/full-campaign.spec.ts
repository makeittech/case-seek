/**
 * FULL CAMPAIGN PLAYTHROUGH — a fresh detective plays New Case → Case Solved
 * in a real browser. Every one of the 88 season flow nodes is visited in
 * order: all 39 beats read line by line, all 29 search rounds (S00–S28)
 * played to completion on the live canvas (word-list, silhouette, audio,
 * description, and evidence-sweep modes), every debrief answered, all nine
 * puzzles genuinely solved through their mechanics (the skip button is never
 * touched), all three board reviews connected, all six chapter recaps, the
 * rooftop accusation (including one deliberate wrong deduction), and the
 * epilogue — ending back at the title with the case stamped Solved.
 */
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { completeBeat, completeDebrief, enterSearch, findAllTargets, foundOf, startNewCase } from './helpers';
import { mulberry32, shuffle } from '../src/engine/rand';

type FlowNode =
  | { type: 'beat' | 'round' | 'puzzle' | 'board-review'; id: string }
  | { type: 'recap'; chapter: number }
  | { type: 'accusation' }
  | { type: 'epilogue' };

interface PuzzleDef {
  id: string;
  mechanic: string;
  title: string;
  clueId?: string;
  params: Record<string, unknown>;
}

function json<T>(rel: string): T {
  return JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8')) as T;
}

const season = json<{ flow: FlowNode[] }>('../content/story/season.json');
const boardReviews = json<{ id: string; pair: [string, string] }[]>('../content/story/board-reviews.json');
const finale = json<{ culprit: string; wrongLine: string; suspects: { id: string }[] }>(
  '../content/story/finale.json',
);
const epilogue = json<{ panels: unknown[] }>('../content/story/epilogue.json');
const puzzleDefs = new Map<string, PuzzleDef>(
  ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'].map((id) => [
    id,
    json<PuzzleDef>(`../content/puzzles/${id}.json`),
  ]),
);

// ---------------------------------------------------------------- puzzles

/** Torn paper: mirror the component's deterministic shuffle, then tap-swap into order. */
async function solveTornPaper(page: Page, params: Record<string, unknown>): Promise<void> {
  const caption = String(params.caption ?? '');
  const pieceCount = Number(params.pieces ?? 6);
  const words = caption.split(' ');
  const per = Math.ceil(words.length / pieceCount);
  const pieces: string[] = [];
  for (let i = 0; i < words.length; i += per) pieces.push(words.slice(i, i + per).join(' '));

  const rng = mulberry32(caption.length * 7 + 13);
  const order = pieces.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  if (order.every((v, i) => v === i) && order.length > 1) [order[0], order[1]] = [order[1]!, order[0]!];

  const tiles = page.getByTestId('torn-paper').locator('button');
  for (let i = 0; i < order.length; i++) {
    if (order[i] === i) continue;
    const j = order.indexOf(i);
    await tiles.nth(i).click();
    await tiles.nth(j).click();
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
}

/** Combination lock: dial in the digits from the hint, then try the lock. */
async function solveCombination(page: Page, params: Record<string, unknown>): Promise<void> {
  const digits = (params.digits as number[]) ?? [];
  for (let i = 0; i < digits.length; i++) {
    for (let k = 0; k < digits[i]!; k++) {
      await page.getByRole('button', { name: `dial ${i + 1} up`, exact: true }).click();
    }
  }
  await page.getByTestId('btn-combo-try').click();
}

/** Pairs: word → its picture, replaying the component's deterministic shuffles. */
async function solvePairs(page: Page, params: Record<string, unknown>): Promise<void> {
  const concepts = (params.concepts as string[]) ?? [];
  const words = shuffle(concepts, mulberry32(41));
  const icons = shuffle(concepts, mulberry32(97));
  const wordTiles = page.getByTestId('pairs-words').locator('button');
  const iconTiles = page.getByTestId('pairs-icons').locator('button');
  for (const c of concepts) {
    await wordTiles.nth(words.indexOf(c)).click();
    await iconTiles.nth(icons.indexOf(c)).click();
    await page.waitForTimeout(80);
  }
}

/** Cipher wheel: Caesar shift of 7 — turn the wheel forward seven clicks. */
async function solveCipherWheel(page: Page): Promise<void> {
  for (let i = 0; i < 7; i++) {
    await page.getByRole('button', { name: 'Turn wheel forward', exact: true }).click();
    await page.waitForTimeout(60);
  }
}

/** Silhouette sort: object → its outline, via the deterministic shuffles. */
async function solveSilhouetteSort(page: Page, params: Record<string, unknown>): Promise<void> {
  const concepts = (params.concepts as string[]) ?? [];
  const slots = shuffle(concepts, mulberry32(23));
  const tokens = shuffle(concepts, mulberry32(59));
  const tokenTiles = page.getByTestId('silhouette-tokens').locator('button');
  const slotTiles = page.getByTestId('silhouette-slots').locator('button');
  for (const c of concepts) {
    await tokenTiles.nth(tokens.indexOf(c)).click();
    await slotTiles.nth(slots.indexOf(c)).click();
    await page.waitForTimeout(80);
  }
}

/** Lantern code: wait out each playback, then repeat the deterministic sequence. */
async function solveLightSequence(page: Page, params: Record<string, unknown>): Promise<void> {
  const lamps = Number(params.lamps ?? 4);
  const startLength = Number(params.startLength ?? 4);
  const endLength = Number(params.endLength ?? 6);
  const lengths = [startLength, Math.round((startLength + endLength) / 2)];
  for (let r = 0; r < lengths.length; r++) {
    await expect(page.getByText(`Signal ${r + 1} of ${lengths.length} — now repeat it.`)).toBeVisible({
      timeout: 30_000,
    });
    const rng = mulberry32(191 + r * 37);
    const seq = Array.from({ length: lengths[r]! }, () => Math.floor(rng() * lamps));
    for (const lamp of seq) {
      await page.getByRole('button', { name: `lamp ${lamp + 1}`, exact: true }).click();
      await page.waitForTimeout(280);
    }
  }
}

/** Pigment bench: measure each part to the bench's recorded amount, then mix. */
async function solveRatioMix(page: Page, params: Record<string, unknown>): Promise<void> {
  const target = (params.target as Record<string, number>) ?? {};
  const labels = (params.labels as Record<string, string>) ?? {};
  for (const [k, amount] of Object.entries(target)) {
    for (let i = 0; i < amount; i++) {
      await page.getByRole('button', { name: `more ${labels[k] ?? k}`, exact: true }).click();
    }
  }
  await page.getByTestId('btn-mix').click();
}

/** Logic grid: cycle each lot until it shows its true provenance, then check. */
async function solveLogicGrid(page: Page, params: Record<string, unknown>): Promise<void> {
  const lots = (params.lots as string[]) ?? [];
  const statements = (params.statements as string[]) ?? [];
  const solution = (params.solution as number[]) ?? [];
  const rows = page.getByTestId('logic-grid').locator('button');
  for (let i = 0; i < lots.length; i++) {
    const want = statements[solution[i]!]!;
    for (let tries = 0; tries <= statements.length + 1; tries++) {
      const text = await rows.nth(i).innerText();
      if (text.includes(want)) break;
      await rows.nth(i).click();
    }
  }
  await page.getByTestId('btn-grid-check').click();
}

/** Station clock: set the hands to the telegram's riddle (05:40). */
async function solveClockHands(page: Page, params: Record<string, unknown>): Promise<void> {
  const hour = Number(params.hour ?? 12);
  const minute = Number(params.minute ?? 0);
  for (let i = 0; i < hour % 12; i++) {
    await page.getByRole('button', { name: 'hour up', exact: true }).click();
  }
  for (let i = 0; i < Math.round(minute / 5); i++) {
    await page.getByRole('button', { name: 'minute up', exact: true }).click();
  }
  await page.getByTestId('btn-clock-check').click();
}

/** Solve a puzzle for real — the skip button is never used. */
async function solvePuzzle(page: Page, puzzleId: string): Promise<void> {
  const def = puzzleDefs.get(puzzleId);
  if (!def) throw new Error(`unknown puzzle ${puzzleId}`);
  await expect(page.getByTestId('puzzle-screen')).toBeVisible();
  switch (def.mechanic) {
    case 'torn-paper':
      await solveTornPaper(page, def.params);
      break;
    case 'combination':
      await solveCombination(page, def.params);
      break;
    case 'pairs':
      await solvePairs(page, def.params);
      break;
    case 'cipher-wheel':
      await solveCipherWheel(page);
      break;
    case 'silhouette-sort':
      await solveSilhouetteSort(page, def.params);
      break;
    case 'light-sequence':
      await solveLightSequence(page, def.params);
      break;
    case 'ratio-mix':
      await solveRatioMix(page, def.params);
      break;
    case 'logic-grid':
      await solveLogicGrid(page, def.params);
      break;
    case 'clock-hands':
      await solveClockHands(page, def.params);
      break;
    default:
      throw new Error(`no solver for mechanic ${def.mechanic}`);
  }
  // the continue button renders only once the mechanic reports solved
  await expect(page.getByTestId('btn-puzzle-continue')).toBeVisible();
  await page.getByTestId('btn-puzzle-continue').click();
  if (def.clueId) {
    await expect(page.getByTestId('clue-screen')).toBeVisible();
    await page.getByTestId('btn-clue-continue').click();
  }
}

// ------------------------------------------------------------------ rounds

async function playRound(page: Page, roundId: string, log: string[]): Promise<void> {
  await expect(page.getByTestId('btn-go-there')).toBeVisible();
  const chapterLine = await page.locator('.map-card__chapter').innerText();
  const sceneName = await page.locator('.map-card__scene').innerText();
  await enterSearch(page);
  const { found, total } = await foundOf(page);
  expect(found, `${roundId} starts fresh`).toBe(0);
  expect(total, `${roundId} target count`).toBeGreaterThanOrEqual(6);
  expect(total, `${roundId} target count`).toBeLessThanOrEqual(16);
  await findAllTargets(page);
  await expect(page.getByTestId('results-screen')).toBeVisible();
  log.push(`${roundId} · ${sceneName} (${chapterLine}) — ${total} targets found`);
  await completeDebrief(page);
}

// ---------------------------------------------------------------- the case

test('full campaign: German conversational, New Case → Case Solved', async ({ page }) => {
  test.setTimeout(2_700_000);
  const log: string[] = [];

  await startNewCase(page, 'de', 'conversational');

  let brIndex = 0;
  for (const node of season.flow) {
    switch (node.type) {
      case 'beat': {
        await expect(page.getByTestId('beat-screen')).toBeVisible();
        await completeBeat(page);
        log.push(`beat ${node.id}`);
        break;
      }
      case 'round': {
        await playRound(page, node.id, log);
        break;
      }
      case 'puzzle': {
        await solvePuzzle(page, node.id);
        log.push(`puzzle ${node.id} solved (${puzzleDefs.get(node.id)!.mechanic})`);
        break;
      }
      case 'board-review': {
        await expect(page.getByTestId('board-review-screen')).toBeVisible();
        const br = boardReviews[brIndex++]!;
        await page.getByTestId(`pin-${br.pair[0]}`).click();
        await page.getByTestId(`pin-${br.pair[1]}`).click();
        await page.getByTestId('btn-board-confirm').click();
        await expect(page.getByTestId('btn-board-continue')).toBeVisible();
        await page.getByTestId('btn-board-continue').click();
        log.push(`board review ${br.id}: ${br.pair[0]} ↔ ${br.pair[1]}`);
        break;
      }
      case 'recap': {
        await expect(page.getByTestId('recap-screen')).toBeVisible();
        await page.getByTestId('btn-recap-continue').click();
        log.push(`chapter ${node.chapter} recap`);
        break;
      }
      case 'accusation': {
        await expect(page.getByTestId('accusation-screen')).toBeVisible();
        await page.getByTestId('btn-accuse-begin').click();
        // a wrong deduction first — the board pushes back, nothing advances
        const wrong = finale.suspects.map((s) => s.id).find((id) => id !== finale.culprit)!;
        await page.getByTestId(`suspect-${wrong}`).click();
        await expect(page.getByText(finale.wrongLine)).toBeVisible();
        // then the real one
        await page.getByTestId(`suspect-${finale.culprit}`).click();
        for (let i = 0; i < 60; i++) {
          if (await page.getByTestId('btn-finale-warm').isVisible().catch(() => false)) break;
          await page.getByTestId('btn-accuse-next').click();
          await page.waitForTimeout(80);
        }
        await page.getByTestId('btn-finale-warm').click();
        for (let i = 0; i < 60; i++) {
          if (await page.getByTestId('btn-accuse-finish').isVisible().catch(() => false)) break;
          await page.getByTestId('btn-accuse-next').click();
          await page.waitForTimeout(80);
        }
        await page.getByTestId('btn-accuse-finish').click();
        log.push(`accusation: named ${finale.culprit} (after one wrong pick: ${wrong})`);
        break;
      }
      case 'epilogue': {
        await expect(page.getByTestId('epilogue-screen')).toBeVisible();
        for (let i = 0; i < epilogue.panels.length; i++) {
          await page.getByTestId('btn-epilogue-next').click();
          await page.waitForTimeout(80);
        }
        await page.getByTestId('btn-epilogue-finish').click();
        log.push(`epilogue: ${epilogue.panels.length} panels + coda`);
        break;
      }
    }
  }

  // back on the title; the finished case is filed under Case Files as Solved
  await expect(page.getByTestId('btn-new-case')).toBeVisible();
  await expect(page.getByTestId('btn-continue')).not.toBeVisible();
  await page.getByTestId('btn-case-files').click();
  await expect(page.getByText('· Solved')).toBeVisible();
  await expect(page.getByText('Ch. 6')).toBeVisible();

  const rounds = log.filter((l) => /^S\d\d /.test(l)).length;
  const puzzles = log.filter((l) => l.startsWith('puzzle')).length;
  const beats = log.filter((l) => l.startsWith('beat')).length;
  expect(rounds).toBe(29);
  expect(puzzles).toBe(9);
  expect(beats).toBe(39);
  console.log(`\n===== CAMPAIGN PLAYTHROUGH LOG (${log.length} flow nodes) =====`);
  for (const line of log) console.log(line);
});
