// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Canonical production domain. Update here only — every page reads
// Astro.site rather than hardcoding the URL.
const SITE_URL = "https://alexandermathai.com";

// Same PUBLIC_PREVIEW convention as src/layouts/BaseLayout.astro and
// src/pages/robots.txt.ts: defaults to preview (safe) unless explicitly
// disabled. Evaluated here via process.env because astro.config.mjs runs as
// plain Node, not through Vite's import.meta.env.
const PUBLIC_PREVIEW = process.env.PUBLIC_PREVIEW !== "false";

export default defineConfig({
  site: SITE_URL,
  output: "static",
  trailingSlash: "never",
  integrations: [
    mdx(),
    sitemap({
      // Drafts are already excluded from getCollection() at build time
      // (see src/content/config.ts), so nothing further to filter here.
      changefreq: "weekly",
      priority: 0.7,
      // Lifecycle-aware: in preview mode, filter out every page so the
      // integration emits no sitemap file at all (see
      // node_modules/@astrojs/sitemap — an empty filtered set logs a
      // warning and skips writing sitemap-index.xml/sitemap-0.xml rather
      // than writing an empty one; either way, no production URL is
      // advertised while PUBLIC_PREVIEW is true). Matches the noindex/
      // disallow-all robots.txt behavior for the same build.
      filter: () => !PUBLIC_PREVIEW,
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
    },
  },
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
