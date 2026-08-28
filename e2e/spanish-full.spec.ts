/**
 * Spanish full smoke: New Case → Español → cold open → notebook → first
 * search (find everything, pin the evidence) → results → debrief → story
 * continues into the next beat and round → reload resumes mid-search.
 */
import { expect, test } from '@playwright/test';
import {
  completeBeat,
  completeDebrief,
  enterSearch,
  findAllTargets,
  findOneTarget,
  foundOf,
  startNewCase,
} from './helpers';

test('Spanish: new case through the first two rounds, save survives reload', async ({ page }) => {
  await startNewCase(page, 'es', 'new');

  // b1.1 cold open plays out, then the city map shows the first destination
  await completeBeat(page);
  await expect(page.getByTestId('btn-go-there')).toBeVisible();

  // notebook opens with all four tabs before the first search
  await page.getByTestId('open-notebook').click();
  await expect(page.getByTestId('notebook')).toBeVisible();
  for (const t of ['case', 'people', 'clues', 'words'] as const) {
    await page.getByTestId(`nb-tab-${t}`).click();
    await expect(page.getByTestId(`nb-${t}`)).toBeVisible();
  }
  await page.getByLabel('Close notebook').click();
  await expect(page.getByTestId('notebook')).not.toBeVisible();

  // S00: a GDD-sized find list, played to completion on the real canvas
  await enterSearch(page);
  const s00 = await foundOf(page);
  expect(s00.found).toBe(0);
  expect(s00.total).toBeGreaterThanOrEqual(8);
  expect(s00.total).toBeLessThanOrEqual(14);
  await findAllTargets(page);

  // results slip, then Margo's debrief
  await expect(page.getByTestId('results-screen')).toBeVisible();
  await completeDebrief(page);

  // story continues: beat b1.2, then the map points at round S01
  await expect(page.getByTestId('beat-screen')).toBeVisible();
  await completeBeat(page);
  await expect(page.getByTestId('btn-go-there')).toBeVisible();

  // the S00 evidence is pinned in the notebook's CLUES tab
  await page.getByTestId('open-notebook').click();
  await page.getByTestId('nb-tab-clues').click();
  await expect(page.getByTestId('nb-clues')).toBeVisible();
  await expect(page.getByTestId('nb-clues')).not.toContainText(/^\s*$/);
  await page.getByLabel('Close notebook').click();

  // S01: land one find, let the autosave flush, then simulate a crash
  await enterSearch(page);
  await findOneTarget(page);
  const midRound = await foundOf(page);
  await page.waitForTimeout(1800); // autosave debounce
  await page.reload();

  // Continue resumes on the exact search screen with progress intact
  await page.getByTestId('btn-continue').click();
  await expect(page.getByTestId('search-screen')).toBeVisible();
  const resumed = await foundOf(page);
  expect(resumed.total).toBe(midRound.total);
  expect(resumed.found).toBeGreaterThanOrEqual(1);
});
