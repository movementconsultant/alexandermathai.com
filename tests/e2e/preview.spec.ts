import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";

/**
 * PUBLIC_PREVIEW=true/default mode. Run via `npm run test:e2e:preview`,
 * which builds the site in preview mode first — this spec assumes dist/
 * already reflects that build; it does not build anything itself.
 */

for (const route of ROUTES) {
  test(`${route} is reachable and noindex,nofollow`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should return 200`).toBe(200);

    const robotsContent = await page.locator('meta[name="robots"]').first().getAttribute("content");
    expect(robotsContent, `${route} missing <meta name="robots">`).not.toBeNull();
    expect(robotsContent?.toLowerCase()).toContain("noindex");
    expect(robotsContent?.toLowerCase()).toContain("nofollow");
  });
}

test("robots.txt disallows all crawling in preview mode", async ({ page }) => {
  const response = await page.goto("/robots.txt");
  expect(response?.status()).toBe(200);
  const body = await response?.text();
  expect(body).toContain("Disallow: /");
  expect(body).not.toContain("Sitemap:");
});

test("sitemap-index.xml is absent (404) in preview mode", async ({ request }) => {
  const response = await request.get("/sitemap-index.xml");
  expect(response.status()).toBe(404);
});

test("sitemap-0.xml is absent (404) in preview mode", async ({ request }) => {
  const response = await request.get("/sitemap-0.xml");
  expect(response.status()).toBe(404);
});

test.describe("no submission-capable surface on any route", () => {
  for (const route of ROUTES) {
    test(`${route} has no mailto link, external form action, or external social anchor`, async ({
      page,
    }) => {
      await page.goto(route);
      const html = await page.content();

      expect(html.toLowerCase(), `${route}: mailto: link found`).not.toContain("mailto:");

      const externalFormActions = await page.locator('form[action^="http"]').count();
      expect(externalFormActions, `${route}: <form> with external action found`).toBe(0);

      const socialDomains = [
        "twitter.com",
        "x.com",
        "facebook.com",
        "instagram.com",
        "linkedin.com",
        "youtube.com",
        "youtu.be",
        "tiktok.com",
      ];
      for (const domain of socialDomains) {
        const liveSocialLink = await page.locator(`a[href*="${domain}"]`).count();
        expect(liveSocialLink, `${route}: live href to ${domain} found`).toBe(0);
      }

      // Any <form> present must carry the inert-submission guard.
      const forms = page.locator("form");
      const formCount = await forms.count();
      for (let i = 0; i < formCount; i++) {
        const onsubmit = await forms.nth(i).getAttribute("onsubmit");
        expect(onsubmit, `${route}: <form> missing onsubmit inert guard`).toBe("return false;");
      }
    });
  }
});

test("no built JS bundle contains a fetch() call to an external URL", async ({ request }) => {
  const indexResponse = await request.get("/");
  const html = await indexResponse.text();
  const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  for (const src of scriptSrcs) {
    if (!src.startsWith("/")) continue;
    const scriptResponse = await request.get(src);
    const body = await scriptResponse.text();
    expect(
      /fetch\s*\(\s*["'`]https?:\/\//.test(body),
      `${src} contains an external fetch() call`,
    ).toBe(false);
  }
});
