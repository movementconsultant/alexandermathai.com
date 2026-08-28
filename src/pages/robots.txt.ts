import type { APIRoute } from "astro";
import { IS_PREVIEW, SITE_URL } from "../config/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const lines = IS_PREVIEW
    ? [
        "# Preview build — noindex convention in effect.",
        "User-agent: *",
        "Disallow: /",
      ]
    : [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${new URL("/sitemap.xml", SITE_URL).toString()}`,
      ];

  return new Response(lines.join("\n") + "\n", {
import { site } from "../data/site";

export const prerender = true;

/**
 * PUBLIC_PREVIEW-aware, matching the convention used across the rest of the
 * ecosystem: defaults to disallow-all (safe) unless PUBLIC_PREVIEW=false is
 * set explicitly for a production build. See BaseLayout.astro and
 * docs/mark-2-release-audit.md — this replaces a static public/robots.txt
 * that unconditionally allowed everything regardless of build mode.
 */
export const GET: APIRoute = () => {
  const isPreview = import.meta.env.PUBLIC_PREVIEW !== "false";

  const body = isPreview
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap-index.xml\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
