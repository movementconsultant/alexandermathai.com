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
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
