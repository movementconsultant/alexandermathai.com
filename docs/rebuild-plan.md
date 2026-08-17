# Rebuild plan — alexandermathai.com

## 1. Audit findings (this branch, `claude/founder-control-tower-rebuild`)

- `main` contains a single bootstrap commit with no site code — just a `.gitkeep`. There is
  **no content skeleton on this branch to preserve**. The owner's brief describes a "content
  skeleton" that already exists; the real prior work referenced there lives on the separate,
  frozen `claude/alexander-mathai-placeholder` branch (PR #1, draft), which this rebuild does
  **not** touch, read into, merge, or comment on. This rebuild starts from the `main` bootstrap
  state and builds the full architecture fresh, per the brief's own structure.
- The working container had a stray, untracked `node_modules/` and `dist/` left over from a prior
  build in this same filesystem (matching the placeholder site's preview build). Neither was
  tracked in git on this branch. Both were removed and rebuilt cleanly from a new `package.json`.
- No `package.json`, `astro.config`, `tsconfig`, CMS, or content collections existed on this
  branch prior to this rebuild.
- Network egress in this build environment is restricted to an infrastructure allowlist
  (npm registry, GitHub, PyPI, etc.). General web fetches — including to LinkedIn, YouTube,
  Instagram, TikTok, and even `example.com` — return `EGRESS_BLOCKED`/403 at the proxy. This
  means **no social profile URL or the `texasmovement.com` umbrella URL could be verified live**
  during this build. See "Decisions requiring owner approval" below and `src/data/social.ts`.

## 2. Assets/content worth preserving

None — there was nothing on this branch to preserve. (The placeholder branch's finished,
frozen build remains untouched and available as a fallback, per instruction.)

## 3. One structural deviation from the brief's literal file list

Brief §8 lists `src/content/config.ts` as the content-collections config path. The Astro version
resolved by this environment (Astro 7.2.2) requires that file at `src/content.config.ts` instead
(a legacy-path build error otherwise) — everything else in that structure list (`src/layouts/`,
`src/components/{site,home,work,ecosystem,content,ui}/`, `src/content/{notes,work,ecosystem}/`,
`src/data/`, `src/styles/`, `public/{og,icons}/`) matches exactly.

## 4. Stack decision

The brief's "preferred stack if this repository uses Astro" section applies directly, since
this is being built as a new Astro project:

- Astro (static output), TypeScript strict mode
- Astro Content Collections (Content Layer API, `glob` loader) for `work`, `notes`, `ecosystem`
- MDX enabled for the rare case a note needs a rich embed later; all current content is plain
  Markdown
- Vanilla CSS with design tokens — no UI framework added
- `@astrojs/sitemap` for sitemap.xml, `@astrojs/rss` for the Notes feed
- System-safe font stacks only (serif display + sans + mono) — no external font requests, both
  for performance and because this environment cannot reach a font CDN to verify licensing/uptime

## 5. Two environment gaps assumed by the owner's brief but not available here

1. **No photo assets.** The hero/about sections reference portrait and action photography that
   were never uploaded as files into this build environment. Rather than fabricate a placeholder
   image or invent a file path that silently 404s, the hero uses the brief's own explicit
   fallback: a typographic/diagrammatic visual (grid, load-path line, engineering annotation).
   Expected file paths for the owner to drop in later are documented in `docs/content-needed.md`.
2. **No contact-form backend.** No email-delivery service or credentials exist in this
   environment. The form at `/contact` is fully built — fields, client-side validation,
   accessible errors, honeypot, and both a "not yet connected" state and a real success/failure
   state that activates automatically once `PUBLIC_CONTACT_ENDPOINT` is set. The integration
   point is documented in `docs/site-operations.md`.

## 6. Decisions made without asking (conservative, truthful, recorded here)

- **Social and umbrella URLs are unverifiable in this environment.** Handles were given exactly
  as supplied in the brief; the URLs in `src/data/social.ts` apply each platform's standard,
  deterministic profile-URL pattern to those handles (not invented handles), but every entry is
  flagged `verified: false`. They are still rendered in the UI (omitting them entirely would
  break the required IA in brief §4/§5.11), but this is flagged as an **owner approval item**:
  confirm each URL resolves to the correct account before launch. `rel="me"` was deliberately
  **not** added to any of them, since that relation asserts verified identity ownership.
- **Ecosystem division status** reflects the task's current-reality instructions, not the
  brief's more optimistic defaults: Consulting is "Select engagements" (the practice itself is
  real; its dedicated subdomain is not live), Media is "Publishing on social channels · site in
  development" (the channels are real and cited in the proof rail; the dedicated subdomain is
  not), and HERO / Performance / Social / FounderLink are "Building" / "In development." None of
  the six ecosystem subdomains (`consulting.`, `media.`, `hero.`, `performance.`,
  `founderlink.`, `social.texasmovement.com`) are linked as reachable live destinations.
- **FounderLink** is included as a bare, honestly-labeled "in development" card (name + stage
  only) because the brief names it explicitly as belonging in the ecosystem, but no owner-given
  description of what it does exists anywhere in the brief or task context. Inventing a mandate
  for it would be fabrication; logged in `docs/content-needed.md`.
- **`/now` was not built.** The brief makes it conditional on "a usable content source" existing;
  none does, so per the brief's own instruction it was skipped rather than filled with a stub.
- **No redirects were configured.** There are no legacy URLs on this branch's history to redirect
  from (see audit finding above).
- **Notes**: two thesis-elaboration essays and one build log about this rebuild itself were
  written as real, published content — they expand the given operating-thesis worldview and
  describe this build process, without inventing any biographical fact, client, or metric not
  already given. A media-note stub and a deeper individual consulting case study are marked
  `draft: true` and excluded from the production build, since no specific source content exists
  for either yet (see `docs/content-needed.md`).
- **Work / System Briefs**: five entries were built directly from the facts given in the brief
  (TMI digital architecture — this site itself; Texas Movement Consulting; Texas Movement Media;
  HERO Footwear; SWEAT). Per brief §5.6/§6, these are framed as "System Briefs," not full
  narrative case studies, since no per-engagement narrative detail was supplied. `evidenceLevel`
  is set to `documented` only for this site itself; every historical business fact is
  `reported-by-founder`, and that shapes a quiet "As reported by the founder." caveat near each
  outcome stat rather than a literal on-page "evidence level" label.
- **Default OG image only** (no per-route OG images yet). Building a full per-page OG-image
  pipeline without any real photography or brand assets to work with would mean generating
  near-identical typographic images for every route; the single, higher-effort default image
  (`public/og/default.png`, rendered from `public/og/default.svg`) is used everywhere for now.
  This is a reasonable future enhancement, not a fabrication — logged as a nice-to-have.

## 7. What's explicitly out of scope here (hard boundaries respected)

No merge of any PR, no push to or edit of `main`, no production deploy, no DNS/domain/Cloudflare
project changes, no package publishing, no new GitHub repos, no secrets committed, and no
reference to "LexMathAI" anywhere in source, docs, config, or generated output. This rebuild's
branch and PR are fully separate from, and make no edits to, `claude/alexander-mathai-placeholder`
/ PR #1.
