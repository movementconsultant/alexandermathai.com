#!/usr/bin/env node
/**
 * Axe-core accessibility scan against every route of the built preview,
 * served locally with `astro preview`. Requires `npm run build` to have run
 * first. Uses the pre-installed Chromium at PLAYWRIGHT_BROWSERS_PATH.
 *
 * Usage: npm run test:a11y
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The installed Playwright package version's expected browser revision can
// drift from what's pre-installed at PLAYWRIGHT_BROWSERS_PATH. Prefer the
// pre-installed full Chromium binary (not the headless-shell build) via its
// stable "chromium" symlink so this script doesn't require a network
// download (`playwright install` is intentionally not run in this repo).
const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
const preinstalledChromium = browsersPath ? join(browsersPath, "chromium") : undefined;
const executablePath =
  preinstalledChromium && existsSync(preinstalledChromium) ? preinstalledChromium : undefined;

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const ROUTES = ["/", "/404"];

function waitForServer(url, attempts = 40) {
  return new Promise((resolve, reject) => {
    const tryOnce = async (n) => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status === 404) return resolve();
      } catch {
        // not up yet
      }
      if (n <= 0) return reject(new Error("preview server did not start in time"));
      await delay(250);
      tryOnce(n - 1);
    };
    tryOnce(attempts);
  });
}

async function main() {
  const server = spawn(
    "npx",
    ["astro", "preview", "--port", String(PORT), "--host", "127.0.0.1"],
    { stdio: "pipe" },
  );

  let serverOutput = "";
  server.stdout.on("data", (d) => (serverOutput += d.toString()));
  server.stderr.on("data", (d) => (serverOutput += d.toString()));

  try {
    await waitForServer(BASE_URL + "/");

    const browser = await chromium.launch(executablePath ? { executablePath } : {});
    const context = await browser.newContext();
    const page = await context.newPage();

    /** @type {{ route: string; violations: unknown[] }[]} */
    const results = [];

    for (const route of ROUTES) {
      await page.goto(BASE_URL + route, { waitUntil: "networkidle" });
      const scan = await new AxeBuilder({ page }).analyze();
      results.push({ route, violations: scan.violations });
    }

    await browser.close();

    let failed = false;
    for (const { route, violations } of results) {
      if (violations.length === 0) {
        console.log(`a11y: OK — ${route} (0 violations)`);
      } else {
        failed = true;
        console.error(`a11y: FAIL — ${route} (${violations.length} violation(s))`);
        for (const v of violations) {
          console.error(`  - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
        }
      }
    }

    if (failed) process.exit(1);
    console.log(`a11y: all ${ROUTES.length} route(s) passed with 0 violations.`);
  } catch (err) {
    console.error("a11y-scan: error", err);
    console.error("--- preview server output ---");
    console.error(serverOutput);
    process.exit(1);
  } finally {
    server.kill();
  }
}

main();
