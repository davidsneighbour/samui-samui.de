import { defineConfig, devices } from '@playwright/test';

const port = 4327;

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  outputDir: '.playwright/test-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: `https://127.0.0.1:${port}`,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `ASTRO_DEV_BACKGROUND=0 npm run dev:site -- --host 127.0.0.1 --port ${port} --ignore-lock`,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: `https://127.0.0.1:${port}/tests/masthead-frame`,
  },
});
