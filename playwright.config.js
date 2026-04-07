import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directory that contains the test files
  testDir: './tests/e2e',

  // Run tests in parallel across workers
  fullyParallel: true,

  // Fail the build on CI if any test.only is left in source
  forbidOnly: !!process.env.CI,

  // Retry once on CI to reduce flakiness from timing issues
  retries: process.env.CI ? 1 : 0,

  // Reporter: dot on CI, list locally for readability
  reporter: process.env.CI ? 'dot' : 'list',

  use: {
    // All tests resolve relative URLs against this base
    baseURL: 'http://localhost:5173/carver/',

    // Capture trace on first retry to aid debugging
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Reuse the existing Vite dev server rather than launching a new one.
  // `reuseExistingServer: true` means Playwright won't error if the server is
  // already running, but it also won't start one automatically — run
  // `npm run dev` in a separate terminal before executing the tests.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/carver/',
    reuseExistingServer: true,
    // Give the server up to 30 s to become ready on a cold start
    timeout: 30_000,
  },
});
