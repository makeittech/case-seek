import { defineConfig, devices } from '@playwright/test';

/**
 * Full-campaign playthrough config. Runs the (long) e2e/full-campaign.spec.ts
 * against the static production build via `vite preview` — no dev-server file
 * watching, so a 20-minute New Case → Case Solved session cannot be reloaded
 * from under the player. Build first: `npm run build`, then `npm run test:campaign`.
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/full-campaign.spec.ts',
  timeout: 2_700_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4655',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx vite preview --port 4655 --strictPort',
    url: 'http://localhost:4655',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
