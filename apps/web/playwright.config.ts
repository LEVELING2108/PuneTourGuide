import { defineConfig, devices } from '@playwright/test';

/** End-to-end tests against the running dev stack (npm run dev). Mobile viewport. */
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5050',
    ...devices['Pixel 7'],
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'mobile-chromium', use: { browserName: 'chromium' } }],
});
