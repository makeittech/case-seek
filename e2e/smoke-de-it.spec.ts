/**
 * German + Italian smokes: New Case → language → tier → cold open → first
 * search loads with a GDD-sized find list → zoom responds → one real find.
 */
import { expect, test } from '@playwright/test';
import { completeBeat, enterSearch, findOneTarget, foundOf, startNewCase, type SmokeLang, type SmokeTier } from './helpers';

const CASES: { name: string; lang: SmokeLang; tier: SmokeTier }[] = [
  { name: 'German', lang: 'de', tier: 'conversational' },
  { name: 'Italian', lang: 'it', tier: 'basics' },
];

for (const { name, lang, tier } of CASES) {
  test(`${name}: new case → first beat → search loads → one find`, async ({ page }) => {
    await startNewCase(page, lang, tier);
    await completeBeat(page);
    await expect(page.getByTestId('btn-go-there')).toBeVisible();

    await enterSearch(page);
    const start = await foundOf(page);
    expect(start.found).toBe(0);
    expect(start.total).toBeGreaterThanOrEqual(8);
    expect(start.total).toBeLessThanOrEqual(14);

    // zoom controls respond without breaking the scene
    await page.getByLabel('Zoom in').click();
    await page.getByLabel('Zoom out').click();

    await findOneTarget(page);
    const after = await foundOf(page);
    expect(after.total).toBe(start.total);
  });
}
