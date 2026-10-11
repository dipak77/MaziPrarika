import { defineConfig, devices } from '@playwright/test';

/**
 * Cake Atelier Pro — browser end-to-end configuration.
 *
 *   npx playwright install chromium     # once, downloads the browser
 *   npm run dev                         # in another terminal
 *   npx playwright test
 *
 * The suite drives the studio the way a customer does: pick a design, type a
 * name, change palette and font, save and reopen, then download each export and
 * check the bytes. `webServer` starts the app automatically when it is not
 * already running, so `npx playwright test` works from a cold checkout.
 *
 * NOTE: this sandbox has no browser binary, so these specs are committed but were
 * not executed here. The Node-level suite (tests/cake-atelier.e2e.mjs) covers the
 * same API surface and *does* run in this environment.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    acceptDownloads: true,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000/cake',
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
