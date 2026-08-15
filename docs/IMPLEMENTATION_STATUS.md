# Implementation Status

Status as of the initial placeholder build (branch
`claude/alexander-mathai-placeholder`).

## Done

- Repository bootstrapped: one minimal commit on `main`
  (`.gitkeep`), all real work on `claude/alexander-mathai-placeholder`.
- Astro + TypeScript scaffold, `output: "static"`, `wrangler.toml` for
  Cloudflare Pages (no adapter).
- Self-contained `src/config/site.ts` — no vendoring of `@tmi/constants`.
- Homepage (`/`) with all five required sections in order: founder
  headline, areas of work, intentional work-in-progress statement, Texas
  Movement International relationship mention, one CTA.
- 404 page (`/404`).
- `PUBLIC_PREVIEW` convention wired through robots meta, `robots.txt`,
  `sitemap.xml`, canonical-link emission, and a visible preview banner.
  Defaults to preview mode.
- OG/Twitter metadata, canonical URL helper.
- Single `schema.org/Person` JSON-LD block with an `affiliation` limited to
  plain name + url for Texas Movement International. No Organization node.
- Skip link, focus-visible states, semantic headings, responsive layout.
- Postbuild content guard (`scripts/postbuild-guard.mjs`), wired as
  `postbuild`.
- Unit tests for the guard's detection logic and the `site.ts` helpers
  (`tests/*.test.mjs`, run via `node --test`).
- axe-core a11y scan script (`scripts/a11y-scan.mjs`) against every built
  route, using the pre-installed Chromium (no `playwright install` run).
- All docs listed in the project brief.

## Checks run and results

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx astro check` | 0 errors, 0 warnings, 0 hints |
| Build | `npm run build` (includes `postbuild` guard) | Success — 2 pages built, postbuild guard: 0 violations |
| Unit tests | `npm test` | 12/12 passed |
| Accessibility | `npm run test:a11y` | `/` and `/404`: 0 axe-core violations each |
| Forbidden-string sweep | `grep -ril lexmathai . --exclude-dir=.git` | 0 hits (exit code 1 / no match), confirmed across the whole working tree including `node_modules` and `dist` |

## Not done (by design — see docs/LAUNCH_BLOCKERS.md)

- No working CTA destination (ships as an inert coming-soon badge).
- No social links (no confirmed handles).
- Not set to indexable (`PUBLIC_PREVIEW` stays default-on).
- No deploy has been triggered.
- No pages beyond `/` and `/404` — this is a placeholder, not the full site.

## Open questions / nothing currently blocking a draft PR

None. Everything ambiguous enough to guess wrong on (CTA behavior, TMI
mention scope, JSON-LD shape, package vendoring) is resolved per the
explicit rules in the brief and documented in `docs/LAUNCH_BLOCKERS.md` and
`CLAUDE.md`.
