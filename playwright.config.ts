import { defineConfig, devices } from '@playwright/test';

/**
 * E2E smoke suite. Runs against the Vite dev server (fast boot, same app
 * code); `npm run build` is verified separately in CI before this step.
 */
export default defineConfig({
  testDir: 'e2e',
  // the full-campaign playthrough is a ~20 min run with its own config
  // (playwright.campaign.config.ts, production preview server)
  testIgnore: '**/full-campaign.spec.ts',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5199',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
