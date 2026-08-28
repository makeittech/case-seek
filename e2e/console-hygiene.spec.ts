/**
 * Console hygiene: the app must produce zero console errors, page errors, or
 * failed asset requests across a representative pass in every study language
 * (title → onboarding → first beat → map → notebook tabs → search → one find).
 * Guards against silent 404s and runtime exceptions.
 */
import { test, expect, type Page } from '@playwright/test';
import { startNewCase, completeBeat, enterSearch, findOneTarget } from './helpers';

type Issue = { kind: string; detail: string };

function watch(page: Page): Issue[] {
  const issues: Issue[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') issues.push({ kind: 'console.error', detail: msg.text() });
  });
  page.on('pageerror', (err) => issues.push({ kind: 'pageerror', detail: String(err) }));
  page.on('requestfailed', (req) => {
    // net::ERR_ABORTED fires for benign cancellations (e.g. navigation); keep everything else
    if (req.failure()?.errorText !== 'net::ERR_ABORTED') {
      issues.push({ kind: 'requestfailed', detail: `${req.url()} — ${req.failure()?.errorText}` });
    }
  });
  page.on('response', (res) => {
    if (res.status() >= 400) issues.push({ kind: `http ${res.status()}`, detail: res.url() });
  });
  return issues;
}

for (const lang of ['de', 'es', 'it'] as const) {
  test(`no console/network errors: ${lang} first-beat pass`, async ({ page }) => {
    const issues = watch(page);
    await startNewCase(page, lang, 'basics');
    await completeBeat(page);

    // notebook from the map, all four tabs
    await page.getByTestId('open-notebook').click();
    for (const t of ['case', 'people', 'clues', 'words'] as const) {
      await page.getByTestId(`nb-tab-${t}`).click();
      await expect(page.getByTestId(`nb-${t}`)).toBeVisible();
    }
    await page.getByLabel('Close notebook').click();

    await enterSearch(page);
    await findOneTarget(page);
    expect(issues, issues.map((i) => `${i.kind}: ${i.detail}`).join('\n')).toEqual([]);
  });
}
