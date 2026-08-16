import { test, expect } from "@playwright/test";
import { ROUTES, PRODUCTION_HOSTNAME } from "./routes";

/**
 * PUBLIC_PREVIEW=false mode. Run via `npm run test:e2e:production`, which
 * builds the site in production mode first — this spec assumes dist/
 * already reflects that build; it does not build anything itself.
 */

for (const route of ROUTES) {
  test(`${route} is reachable, indexable, and canonical points at production`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should return 200`).toBe(200);

    // 404 is intentionally noindex even in production (see src/pages/404.astro) —
    // every other route must have no robots meta tag at all.
    const robotsTag = page.locator('meta[name="robots"]');
    if (route === "/404") {
      const content = await robotsTag.first().getAttribute("content");
      expect(content?.toLowerCase()).toContain("noindex");
    } else {
      expect(await robotsTag.count(), `${route} unexpectedly has a robots meta tag`).toBe(0);
    }

    const canonicalHref = await page.locator('link[rel="canonical"]').first().getAttribute("href");
    expect(canonicalHref, `${route} missing canonical link`).not.toBeNull();
    expect(canonicalHref).toContain(`https://${PRODUCTION_HOSTNAME}`);
    expect(canonicalHref).not.toContain("localhost");
    expect(canonicalHref).not.toContain("pages.dev");
    expect(canonicalHref).not.toMatch(/^https?:\/\/(127\.0\.0\.1|0\.0\.0\.0)/);
  });
}

test("robots.txt allows crawling and references the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("Allow: /");
  expect(body).not.toContain("Disallow: /");
  expect(body).toContain(`Sitemap: https://${PRODUCTION_HOSTNAME}/sitemap-index.xml`);
});

test("sitemap-index.xml exists and points at sitemap-0.xml", async ({ request }) => {
  const response = await request.get("/sitemap-index.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("sitemap-0.xml");
});

test("sitemap-0.xml exists and includes the intended public pages", async ({ request }) => {
  const response = await request.get("/sitemap-0.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  for (const route of ROUTES) {
    if (route === "/404") continue; // 404 is intentionally excluded from the sitemap
    const expectedUrl =
      route === "/" ? `https://${PRODUCTION_HOSTNAME}` : `https://${PRODUCTION_HOSTNAME}${route}`;
    expect(body, `sitemap-0.xml missing ${expectedUrl}`).toContain(expectedUrl);
  }
  expect(body).not.toContain("localhost");
  expect(body).not.toContain("pages.dev");
});

test.describe("/contact stays inert with valid input", () => {
  test("submitting valid fields causes no navigation, no network request, and no success message", async ({
    page,
  }) => {
    await page.goto("/contact");
    const startUrl = page.url();

    await page.fill("#field-name", "Test Reviewer");
    await page.fill("#field-email", "reviewer@example.com");
    await page.selectOption("#field-reason", "consulting");
    await page.fill("#field-constraint", "Testing the inert contact form end to end.");
    await page.fill("#field-outcome", "Confirm no data leaves the page.");
    await page.selectOption("#field-timeline", "now");
    // Honeypot field is deliberately left untouched.

    const outgoingRequests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      // Ignore requests already in flight from page load itself; only
      // count anything initiated after this listener attaches.
      outgoingRequests.push(url);
    });

    await page.click("#contact-submit");
    // Give any (unexpected) async submission a moment to fire before asserting.
    await page.waitForTimeout(500);

    // No navigation: same document, same URL, no query string appended.
    expect(page.url()).toBe(startUrl);
    expect(page.url()).not.toContain("?");
    expect(page.url()).not.toContain("name=Test");

    // No network transmission of form data: no POST, and no GET carrying
    // field values in a query string, to any endpoint.
    const suspiciousRequests = outgoingRequests.filter(
      (url) => url.includes("name=Test") || url.includes("reviewer%40example.com"),
    );
    expect(
      suspiciousRequests,
      `unexpected outgoing request(s): ${suspiciousRequests.join(", ")}`,
    ).toHaveLength(0);

    // Visible status must be the honest "not connected" state, never an
    // implied success/sent message.
    const status = page.locator("#form-status");
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute("data-tone", "pending-integration");
    const statusText = (await status.textContent())?.toLowerCase() ?? "";
    expect(statusText).not.toContain("your inquiry has been received");
    expect(statusText).toMatch(/isn't connected|can't be sent/);
  });

  test("form has no action attribute and the inert onsubmit guard", async ({ page }) => {
    await page.goto("/contact");
    const form = page.locator("#contact-form");
    expect(await form.getAttribute("action")).toBeNull();
    expect(await form.getAttribute("onsubmit")).toBe("return false;");
  });
});
