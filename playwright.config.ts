import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for testing BUILT output (dist/), not the dev server. Each of
 * `npm run test:e2e:preview` / `npm run test:e2e:production` builds the
 * site in the relevant PUBLIC_PREVIEW mode first, then this config starts
 * scripts/static-server.mjs against that dist/ and points the matching
 * spec file at it. See docs/site-operations.md "E2E regression tests".
 *
 * PLAYWRIGHT_CHROMIUM_PATH: this sandboxed build/CI environment requires an
 * explicit executablePath because `npx playwright install` cannot reach the
 * network here — a Chromium build is pre-installed at a fixed path instead.
 * A normal environment with `npx playwright install chromium` run once
 * needs neither this env var nor the override below; leave it unset and
 * Playwright's bundled browser resolution applies as usual.
 */
const PORT = Number(process.env.STATIC_SERVER_PORT ?? 4510);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 15_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: `node scripts/static-server.mjs`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 10_000,
    env: { STATIC_SERVER_PORT: String(PORT) },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
          : {}),
      },
    },
  ],
});
