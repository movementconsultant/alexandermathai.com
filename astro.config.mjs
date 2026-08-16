// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Canonical production domain. Update here only — every page reads
// Astro.site rather than hardcoding the URL.
const SITE_URL = "https://alexandermathai.com";

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
