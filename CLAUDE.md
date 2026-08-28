# CLAUDE.md — alexandermathai.com

Scope, safety rules, and working commands for this repository. Read this
before making changes.

## What this repo is

A minimal, production-ready **placeholder** site for Alexander Mathai —
founder voice and authority layer for the broader Texas Movement ecosystem.
It is deliberately small: one homepage, a 404, and the metadata/infra
scaffolding to be Cloudflare-Pages-ready. It is not the full site.

This is a **Person identity**, kept structurally separate from the Texas
Movement Organization identity (texasmovement.com and its sibling repos).
Do not blur that line — see "Do not vendor `@tmi/constants`" below.

## Hard safety rules — never violate these

1. **The superseded working name for this project must never appear in this
   repo, in any form or case.** Not in copy, code, comments, `package.json`,
   git config/remotes, commit messages, docs — anywhere in this working
   tree. An earlier, superseded plan referenced a GitHub repo under that
   old name (paired with a repo path ending in `/AVM`) as this site's
   eventual home; that plan is dead. `movementconsultant/alexandermathai.com`
   is the permanent home. Before finishing any change, do a case-insensitive,
   whole-tree search (excluding `.git/`) for that old working name and
   confirm zero hits. Do not write the old name itself into this file or any
   other doc while describing this rule — describe the rule, don't repeat
   the string.

2. **Do not vendor the shared `@tmi/constants` package** (used by the
   texasmovement.com-family repos) into this repo. Two independent reasons:
   - Its `ecosystem.ts` source contains a comment on the `founder` entry
     that names the old working name described in rule 1 — vendoring the
     package leaks that string into this repo.
   - This site's whole point is a Person identity kept structurally separate
     from the Texas Movement Organization identity. Pulling in the full
     multi-property org registry works against that separation.

   Site-wide constants live in `src/config/site.ts` instead — small,
   self-contained, and specific to this repo.

3. **No unverified contact or social routes.** No email address anywhere
   (visible text, `mailto:`, JSON-LD, meta tags) unless Alexander has
   explicitly approved a destination. No social icons/links unless a
   confirmed handle has been given — do not invent or reuse handles from the
   Texas Movement `social.ts` registry.

4. **No working newsletter/contact form.** No verified ESP or delivery
   destination exists. The CTA ships as an inert, non-submitting
   "coming soon" element — see `docs/LAUNCH_BLOCKERS.md` for the current
   state and what would need to change to make it live.

5. **No `TBD` in public output.** If something is genuinely unknown, either
   omit it or state the real status in plain language (e.g. "in
   development"), never a placeholder marker in shipped copy.

6. **Person schema only.** `src/layouts/BaseLayout.astro` emits a single
   `schema.org/Person` JSON-LD block. Do not add a standalone
   `schema.org/Organization` node for Texas Movement International or
   anything else. The one sanctioned exception is the `affiliation` field
   on the Person node, limited to `{ "@type": "Organization", name, url }`
   with no other properties — do not extend it.

7. **No invented facts.** No client names, numbers, dates, or product claims
   that haven't been explicitly supplied. This is a placeholder; keep the
   "areas of work" copy generic.

## What needs Alexander's explicit approval before happening

- Turning the CTA into a real, submitting form (requires a verified ESP
  account and confirmed delivery destination).
- Adding any social link/icon (requires a confirmed handle per platform).
- Setting `PUBLIC_PREVIEW=false` / flipping the site to indexable
  (production launch decision).
- Adding any Organization-level JSON-LD, entity/legal detail, or address
  for Texas Movement International.
- Vendoring any shared package from the texasmovement.com-family repos.
- Any deploy, DNS change, package publish, or secret creation.

## Build & test commands

```bash
npm install
npm run dev          # local dev server
npm run build         # astro build; postbuild guard runs automatically
npm run check         # astro check (typecheck)
npm test              # unit tests (node:test)
npm run test:a11y     # axe-core scan against every built route
```

`npm run build` runs `scripts/postbuild-guard.mjs` automatically via the
`postbuild` npm lifecycle hook. It fails the build if `dist/` contains a
literal `TBD`, any `mailto:` link, any `<form>` element, any known social
domain, or an HTML page missing the noindex meta tag while
`PUBLIC_PREVIEW` is not explicitly `"false"`.

## Preview / noindex convention

`PUBLIC_PREVIEW` defaults to preview mode (anything other than the literal
string `"false"` is treated as preview). In preview mode the site ships
`<meta name="robots" content="noindex, nofollow">` on every page, an empty
`sitemap.xml`, a `robots.txt` that disallows all crawling, and omits the
canonical link (so nothing points at the live domain while unresolved).

## Deploy target

Cloudflare Pages, static build (`output: "static"`, no adapter). See
`wrangler.toml`. This repo does not deploy itself — deployment is a separate,
explicitly-approved action.
