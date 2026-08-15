# Implementation Plan

This describes the plan this build executed against. See
`docs/IMPLEMENTATION_STATUS.md` for what's actually done.

## 1. Repository bootstrap

- Confirm the repo is genuinely empty.
- One minimal commit on `main` (`.gitkeep`) to establish a stable base;
  no further commits land on `main`.
- All real work on `claude/alexander-mathai-placeholder`, opened as a draft
  PR against `main`.

## 2. Project scaffold

- Astro + TypeScript, `output: "static"`.
- `wrangler.toml` for Cloudflare Pages, no adapter.
- Self-contained `src/config/site.ts` (explicitly not a vendored
  `@tmi/constants` copy — see `CLAUDE.md`).

## 3. Homepage sections (in required order)

1. Founder headline (exact approved copy) + brief positioning.
2. Areas of work (six short entries, no invented specifics).
3. Intentional work-in-progress statement.
4. Texas Movement International relationship mention (plain-noun,
   linked, no org data).
5. One CTA, shipped inert (see CTA rules in `docs/LAUNCH_BLOCKERS.md`).

## 4. Preview / metadata infrastructure

- `PUBLIC_PREVIEW` convention: noindex meta, empty sitemap, no unresolved
  canonical, defaulted to preview.
- OG/Twitter tags, canonical helper.
- Person-only JSON-LD.

## 5. Accessibility & production baseline

- Skip link, focus-visible states, semantic headings, alt text (favicon SVG
  carries an `aria-label`/role via `<text>`/`role="img"`).
- Responsive layout, no horizontal scroll at any width.

## 6. Guardrails

- `scripts/postbuild-guard.mjs` wired as `postbuild`.
- Unit tests for the guard's detection logic and the `site.ts` helpers.
- axe-core scan script (`npm run test:a11y`) against every built route.

## 7. Docs

- Root `CLAUDE.md`.
- `docs/PROJECT_BRIEF.md`, `BRAND_SYSTEM.md`, `SITE_ARCHITECTURE.md`,
  `IMPLEMENTATION_PLAN.md` (this file), `IMPLEMENTATION_STATUS.md`,
  `LAUNCH_BLOCKERS.md`, `MIGRATION_INVENTORY.md`.

## 8. Validation

- `npm run check` (astro check / typecheck).
- `npm run build` (astro build + postbuild guard).
- `npm test` (unit tests).
- `npm run test:a11y` (axe-core against the built preview).
- A case-insensitive, whole-tree search for the superseded working name
  described in `CLAUDE.md` rule 1 — must return zero hits.

## 9. PR

- Push both branches.
- Open the PR from `claude/alexander-mathai-placeholder` into `main` as a
  **draft**, using `mcp__github__create_pull_request`.
- No merge, no deploy, no DNS, no secrets, no other branches.
