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
| Forbidden-string sweep | Case-insensitive, whole-tree search (excluding `.git/`) for the superseded working name from `CLAUDE.md` rule 1 | 0 hits, confirmed across the whole working tree including `node_modules` and `dist` |

## Not done (by design — see docs/LAUNCH_BLOCKERS.md)

- No working CTA destination (ships as an inert coming-soon badge).
- No social links (no confirmed handles).
- Not set to indexable (`PUBLIC_PREVIEW` stays default-on).
- No deploy has been triggered.
- No pages beyond `/` and `/404` — this is a placeholder, not the full site.

## Hosted preview review — 2026-08-15

- Local verification passed (typecheck, production build + public-output
  guard, unit tests, axe-core accessibility scan, and the superseded
  working-name sweep described in `CLAUDE.md` rule 1 — see "Checks run and
  results" above).
- The Cloudflare branch preview (`claude/alexander-mathai-placeholder`,
  configured as a preview deployment, `main` remains the production branch)
  was manually reviewed by the owner and found acceptable for this stage.
- Agent-side hosted verification of the live preview URL is unavailable in
  this environment: outbound access to `pages.dev` is blocked by the
  session's network egress policy (`EGRESS_BLOCKED`). All verification
  above this section is source-level/local only.
- The placeholder remains `noindex` (`PUBLIC_PREVIEW` default-on) and is
  **not approved for production-domain launch**.
- Remaining launch blockers before production: a verified newsletter/CTA
  destination, verified social URLs, production-domain/DNS approval, and
  final owner approval to merge.

## Open questions / nothing currently blocking a draft PR

None. Everything ambiguous enough to guess wrong on (CTA behavior, TMI
mention scope, JSON-LD shape, package vendoring) is resolved per the
explicit rules in the brief and documented in `docs/LAUNCH_BLOCKERS.md` and
`CLAUDE.md`.
