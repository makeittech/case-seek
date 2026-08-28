/**
 * Accessibility audit: axe-core on every screen of the core loop. Fails on
 * critical and serious violations (blocking gaps). Runs with reduced motion so
 * axe measures settled colors rather than mid-entrance-animation blends.
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { completeBeat, enterSearch } from './helpers';

test.use({ contextOptions: { reducedMotion: 'reduce' } });

async function expectNoBlockingViolations(page: Page, screen: string): Promise<void> {
  await page.waitForTimeout(200);
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  const detail = blocking
    .map((v) => `${screen}: [${v.impact}] ${v.id} — ${v.help}\n${v.nodes.map((n) => `  ${n.target.join(' ')}`).join('\n')}`)
    .join('\n');
  expect(blocking, detail).toEqual([]);
}

test('axe: title, onboarding, beat, map, notebook, search', async ({ page }) => {
  await page.goto('/');
  await expectNoBlockingViolations(page, 'title');

  await page.getByTestId('btn-new-case').click();
  await expectNoBlockingViolations(page, 'language select');
  await page.getByTestId('lang-de').click();
  await expectNoBlockingViolations(page, 'tier select');
  await page.getByTestId('tier-basics').click();
  await expectNoBlockingViolations(page, 'beat');

  await completeBeat(page);
  await expectNoBlockingViolations(page, 'map');

  await page.getByTestId('open-notebook').click();
  await expectNoBlockingViolations(page, 'notebook');
  await page.getByLabel('Close notebook').click();

  await enterSearch(page);
  await expectNoBlockingViolations(page, 'search');
});
