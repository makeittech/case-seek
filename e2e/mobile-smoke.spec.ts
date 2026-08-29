/**
 * Mobile smoke (390×844, touch): the new-case flow works at a phone viewport
 * with no horizontal overflow, and a scene find lands through a real touch
 * tap (pointerType "touch" → InputController → hit-test pipeline).
 */
import { expect, test } from '@playwright/test';
import { completeBeat, enterSearch, foundOf, startNewCase } from './helpers';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('Mobile: new case → first search → one find by touch', async ({ page }) => {
  await startNewCase(page, 'es', 'basics');
  await completeBeat(page);
  await enterSearch(page);

  // the phone layout must not overflow horizontally
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  const start = await foundOf(page);
  expect(start.found).toBe(0);
  expect(start.total).toBeGreaterThanOrEqual(8);

  // HUD essentials are reachable at this viewport
  await expect(page.getByTestId('found-counter')).toBeVisible();
  await expect(page.getByLabel('Zoom in')).toBeVisible();

  // one real find via touch taps on verified-tappable points
  const deadline = Date.now() + 45_000;
  let found = start.found;
  outer: while (Date.now() < deadline) {
    const targets = await page.evaluate(() => window.__caseSeekTest?.remainingTargets() ?? []);
    for (const t of targets) {
      await page.touchscreen.tap(t.x, t.y);
      // > double-tap window (320 ms) so successive taps never zoom
      await page.waitForTimeout(380);
      const pin = page.getByTestId('btn-pin-clue');
      if (await pin.isVisible().catch(() => false)) await pin.click();
      found = (await foundOf(page)).found;
      if (found > start.found) break outer;
    }
    await page.waitForTimeout(700); // let a covering word card fade out
  }
  expect(found).toBeGreaterThan(start.found);
});
