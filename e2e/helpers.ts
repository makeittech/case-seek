/**
 * Shared drivers for the smoke suite. Scene finds use the verified-tappable
 * page coordinates exposed by the app's `window.__caseSeekTest` hook, so the
 * click path exercises the real canvas → InputController → hit-test pipeline.
 */
import { expect, type Page } from '@playwright/test';

export type SmokeLang = 'de' | 'es' | 'it';
export type SmokeTier = 'new' | 'basics' | 'conversational' | 'advanced';

export async function startNewCase(page: Page, lang: SmokeLang, tier: SmokeTier): Promise<void> {
  await page.goto('/');
  await page.getByTestId('btn-new-case').click();
  await page.getByTestId(`lang-${lang}`).click();
  await page.getByTestId(`tier-${tier}`).click();
  await expect(page.getByTestId('beat-screen')).toBeVisible();
}

/** Reveal every dialogue line, then take whichever completion button appears. */
export async function completeBeat(page: Page): Promise<void> {
  for (let i = 0; i < 60; i++) {
    if (await page.getByTestId('btn-beat-continue').isVisible().catch(() => false)) {
      await page.getByTestId('btn-beat-continue').click();
      return;
    }
    if (await page.getByTestId('btn-beat-warm').isVisible().catch(() => false)) {
      await page.getByTestId('btn-beat-warm').click();
      return;
    }
    const next = page.getByTestId('btn-beat-next');
    if (await next.isVisible().catch(() => false)) await next.click();
    else await page.waitForTimeout(150);
  }
  throw new Error('beat never offered a completion button');
}

/** Map → search; dismisses New-tier intro cards and waits for the e2e hook. */
export async function enterSearch(page: Page): Promise<void> {
  await page.getByTestId('btn-go-there').click();
  await expect(page.getByTestId('search-screen')).toBeVisible();
  for (let i = 0; i < 30; i++) {
    const intro = page.getByTestId('btn-intro-next');
    if (await intro.isVisible().catch(() => false)) {
      await intro.click();
      await page.waitForTimeout(120);
    } else break;
  }
  await page.waitForFunction(() => window.__caseSeekTest !== undefined);
}

export async function foundOf(page: Page): Promise<{ found: number; total: number }> {
  const text = await page.getByTestId('found-counter').innerText();
  const m = /(\d+)\s*\/\s*(\d+)/.exec(text);
  if (!m) throw new Error(`unreadable found counter: ${text}`);
  return { found: Number(m[1]), total: Number(m[2]) };
}

async function remainingCount(page: Page): Promise<number> {
  return page.evaluate(() => window.__caseSeekTest?.remainingTargets().length ?? 0);
}

/** Pin the evidence close-up if it is blocking the canvas. */
async function pinIfEvidence(page: Page): Promise<boolean> {
  const pin = page.getByTestId('btn-pin-clue');
  if (await pin.isVisible().catch(() => false)) {
    await pin.click();
    await page.waitForTimeout(250);
    return true;
  }
  return false;
}

/**
 * Keep making finds until the found counter shows one more completed target
 * (a plural chip needs several prop finds before it counts as done).
 * Retries other candidates when a word card briefly covers a click point.
 */
export async function findOneTarget(page: Page): Promise<void> {
  const start = (await foundOf(page)).found;
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    await pinIfEvidence(page);
    if ((await foundOf(page)).found > start) return;
    const before = await remainingCount(page);
    if (before === 0) return; // round already complete
    const targets = await page.evaluate(() => window.__caseSeekTest?.remainingTargets() ?? []);
    let advanced = false;
    for (const t of targets) {
      await page.mouse.click(t.x, t.y);
      // > double-tap window (320 ms) so successive taps never zoom
      await page.waitForTimeout(380);
      await pinIfEvidence(page);
      if ((await foundOf(page)).found > start) return;
      if ((await remainingCount(page)) < before) {
        advanced = true;
        break;
      }
    }
    if (!advanced) await page.waitForTimeout(900); // let a covering word card fade out
  }
  throw new Error('could not complete a single target');
}

/** Find everything (vocab + evidence) until the results screen appears. */
export async function findAllTargets(page: Page): Promise<void> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (await page.getByTestId('results-screen').isVisible().catch(() => false)) return;
    await pinIfEvidence(page);
    if (await page.getByTestId('results-screen').isVisible().catch(() => false)) return;
    const before = await remainingCount(page);
    if (before === 0) {
      if (!(await page.getByTestId('search-screen').isVisible().catch(() => false))) {
        throw new Error('left the search screen before the round completed');
      }
      await page.waitForTimeout(250);
      continue;
    }
    const targets = await page.evaluate(() => window.__caseSeekTest?.remainingTargets() ?? []);
    let advanced = false;
    for (const t of targets) {
      await page.mouse.click(t.x, t.y);
      await page.waitForTimeout(380);
      if (await pinIfEvidence(page)) {
        advanced = true;
        break;
      }
      if (await page.getByTestId('results-screen').isVisible().catch(() => false)) return;
      if ((await remainingCount(page)) < before) {
        advanced = true;
        break;
      }
    }
    if (!advanced) await page.waitForTimeout(900);
  }
  throw new Error('search round did not reach the results screen in time');
}

/** Results → Margo's debrief → answer every item correctly → back to the case. */
export async function completeDebrief(page: Page): Promise<void> {
  await page.getByTestId('btn-debrief').click();
  await expect(page.getByTestId('debrief-screen')).toBeVisible();
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (await page.getByTestId('btn-debrief-done').isVisible().catch(() => false)) {
      await page.getByTestId('btn-debrief-done').click();
      return;
    }
    const correct = page.locator('[data-testid="debrief-options"] button[data-correct="1"]').first();
    if (await correct.isVisible().catch(() => false)) {
      await correct.click();
      await page.waitForTimeout(850); // correct-answer advance delay is 700 ms
    } else {
      await page.waitForTimeout(150);
    }
  }
  throw new Error('debrief never finished');
}
