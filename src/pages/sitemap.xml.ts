import type { APIRoute } from "astro";
import { IS_PREVIEW, canonicalUrl } from "../config/site";

export const prerender = true;

// Preview builds ship an empty sitemap by design — no URLs are advertised
// for indexing until PUBLIC_PREVIEW=false is an approved, real decision.
const ROUTES = ["/"];

export const GET: APIRoute = () => {
  const urls = IS_PREVIEW
    ? ""
    : ROUTES.map(
        (route) => `  <url><loc>${canonicalUrl(route)}</loc></url>`,
      ).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls ? urls + "\n" : ""}</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
