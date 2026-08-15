# Site Architecture

## Stack

- **Astro** (`output: "static"`) + TypeScript. No UI framework — the whole
  site is static markup with zero client-side JavaScript.
- **Cloudflare Pages** as the deploy target (`wrangler.toml`), no adapter
  required for a static build.

## Routes

| Route | Source | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Homepage — all five required sections |
| `/404` | `src/pages/404.astro` | Not-found page |
| `/robots.txt` | `src/pages/robots.txt.ts` | Reflects `PUBLIC_PREVIEW` |
| `/sitemap.xml` | `src/pages/sitemap.xml.ts` | Empty in preview mode |

## Directory layout

```
src/
  components/       Header, Footer, SkipLink — small, presentational
  config/site.ts     Self-contained site config (see below)
  layouts/BaseLayout.astro   <head> metadata, JSON-LD, preview banner
  pages/             Routes (see table above)
  styles/global.css  The entire visual system, plain CSS custom properties
scripts/
  postbuild-guard.mjs  Content guard, wired as npm `postbuild`
  a11y-scan.mjs        axe-core scan over the built preview
tests/               node:test unit tests for the guard and site config
docs/                This document and its siblings
```

## Configuration model

`src/config/site.ts` is the single source of truth for:

- `SITE` — name, title, tagline (the exact approved headline), description.
- `TMI` — the one approved Texas Movement International mention (plain
  name + url only).
- `IS_PREVIEW` — derived from `PUBLIC_PREVIEW`, defaults to `true`.
- `canonicalUrl(path)` — absolute URL helper rooted at `SITE_URL`.
- `AREAS_OF_WORK` — the six areas-of-work entries rendered on the homepage.

This file deliberately replaces what would otherwise be a vendored copy of
the shared `@tmi/constants` package. See `CLAUDE.md` for why that package is
not used here.

## Metadata & structured data

`BaseLayout.astro` owns all `<head>` output:

- Title/description, OG tags (no `og:image` — none has been supplied to
  fabricate), Twitter `summary` card.
- `noindex, nofollow` robots meta when `IS_PREVIEW` is true; otherwise
  `index, follow` plus a canonical link.
- A single `schema.org/Person` JSON-LD block — see `CLAUDE.md` rule 6 for
  what is and isn't allowed in it.

## Preview convention

`PUBLIC_PREVIEW` (a `PUBLIC_`-prefixed Astro/Vite env var, read via
`import.meta.env`) controls: robots meta, `robots.txt` body, `sitemap.xml`
contents, canonical link emission, and the visible preview banner. It
defaults to preview mode when unset. See `docs/LAUNCH_BLOCKERS.md`.

## Build-time enforcement

`scripts/postbuild-guard.mjs` runs automatically after `astro build` via the
`postbuild` npm script and scans every text file in `dist/` for the
forbidden content listed in `CLAUDE.md` and `README`-equivalent docs. It
exits non-zero (failing CI) on any violation.
