# Site operations

Practical, task-oriented notes for maintaining alexandermathai.com after this rebuild.

## How to add a note

1. Add a new Markdown file under `src/content/notes/`, e.g. `src/content/notes/my-new-note.md`.
   The filename (minus `.md`) becomes the URL slug at `/notes/<slug>`.
2. Fill in frontmatter per the schema in `src/content.config.ts`:
   - `title`, `description` (required)
   - `type`: one of `field-note`, `build-log`, `system-brief`, `essay`, `media-note`
   - `tags`: any of `systems`, `ai`, `web-infrastructure`, `brand`, `performance`, `media`,
     `commerce`, `founder-operations`
   - `publishDate` (required), `updatedDate` (optional)
   - `featured: true` to surface it in the homepage Field Notes section (max 3 shown, newest first)
   - `draft: true` to keep it out of the production build entirely while it's being written
   - Optional: `relatedWorkSlug`, `relatedEcosystemSlug`, `canonicalUrl`
3. Write the body in Markdown below the frontmatter. Headings (`##`, `###`) automatically populate
   the table of contents on the note page.
4. Run `npm run build` — draft notes are excluded automatically; everything else appears on
   `/notes`, in the RSS feed (`/notes.xml`), and in the sitemap.

## How to add work (a System Brief)

1. Add a Markdown file under `src/content/work/`, e.g. `src/content/work/my-project.md`.
2. Fill in frontmatter per `src/content.config.ts`: `title`, `summary`, `division` (must match an
   existing ecosystem division id, or `independent`), `categories` (one or more of `ai-systems`,
   `brand-architecture`, `web-infrastructure`, `media`, `commerce`, `performance`, `operations`),
   `evidenceLevel` (`documented` | `reported-by-founder` | `in-development`), `publishDate`.
3. Optional but recommended: `role`, `constraint`, `systemArchitecture`, `deliverables` (array),
   `outcome`, `whatChanged`, `relatedNoteSlug`, `relatedEcosystemSlug`.
4. Set `featured: true` to include it in the homepage Selected Work section.
5. **Governance**: only publish what's verified or explicitly given by the site owner. If detail is
   missing (a specific client name, a specific number), leave the entry as a System Brief with
   what's known, or set `draft: true` and log the gap in `docs/content-needed.md` — never invent a
   client name, outcome, or testimonial.

## How to update ecosystem status

1. Open the relevant file under `src/content/ecosystem/` (one file per division, e.g.
   `texas-movement-consulting.md`).
2. Update `status` (must be one of: `operating`, `available`, `publishing`, `building`,
   `in-development`, `select-engagements`, `archived`) and `statusLabel` (the human-readable text
   shown in the UI — keep it short and accurate).
3. If a division's dedicated subdomain goes live, add `externalUrl: "https://..."` to the
   frontmatter and update `internalRoute` if the "next action" CTA should now point off-site
   instead of to `/contact`.
4. `order` controls display order on `/ecosystem` and in the footer.
5. Never set a division to `operating` or `available` unless it is genuinely live and reachable —
   this is the core rule from brief §9 ("never present projects in development as operating
   businesses").

## How to change social URLs

All social and umbrella-site links live in one file: `src/data/social.ts`.

- Each entry has `verified: false` by default. **Before flipping any entry to `verified: true`,
  manually open the URL and confirm it's the correct, live account** — this build environment had
  no general web access and could not do that check itself (see `docs/rebuild-plan.md`).
- To add `rel="me"` (asserting verified identity ownership) to a link, do so only after
  `verified: true` is set, and add it directly in the component markup
  (`src/components/site/Footer.astro`, `src/pages/about.astro`) — it's intentionally omitted
  sitewide right now.
- `founderSocialLinks` / `socialLinksFor(context)` are the only exports components should use;
  don't hardcode a social URL anywhere else in the codebase.

## How to update metadata and OG graphics

- Sitewide defaults (title, description, canonical domain, default OG image) live in
  `src/data/site.ts` (`defaultSeo`) and are read by `src/layouts/BaseLayout.astro`.
- Every page passes its own `title` and `description` to `<BaseLayout>` — keep these unique and
  under ~160 characters for the description.
- The default OG image is `public/og/default.png` (1200×630), rendered from
  `public/og/default.svg`. To regenerate after editing the SVG:
  ```
  node -e "require('sharp')('public/og/default.svg').resize(1200,630).png().toFile('public/og/default.png')"
  ```
- To add a route-specific OG image, drop a new PNG in `public/og/`, then pass
  `ogImage="/og/your-image.png"` to that page's `<BaseLayout>` call.
- Structured data (JSON-LD) is assembled per-page via the `structuredData` prop on
  `<BaseLayout>`; the Person schema is included automatically on every page from
  `src/data/site.ts`.

## How to deploy (notes, not an actual deployment)

This repository was not deployed as part of this rebuild (out of scope — see the boundaries in
this PR's description). For when the owner is ready:

1. `npm install && npm run build` produces a fully static site in `dist/`.
2. The project has no server-rendering requirements — any static host works (Cloudflare Pages,
   Netlify, Vercel static, etc.). Build command: `npm run build`. Output directory: `dist`.
3. Set `PUBLIC_CONTACT_ENDPOINT` (see below) and, if analytics are enabled later,
   `PUBLIC_PLAUSIBLE_DOMAIN`, as environment variables in the hosting platform before the first
   production build that should have them active.
4. Point the `alexandermathai.com` domain at the chosen host and confirm HTTPS is enforced — no
   DNS or hosting-project changes were made as part of this rebuild.

## Contact-form integration point

The form at `/contact` (`src/pages/contact.astro`) is fully built — fields, client-side
validation, accessible errors, a honeypot field, and both a "not yet connected" state and real
success/failure states. It currently has no backend:

1. Stand up an email-delivery endpoint (a Cloudflare Pages Function, a Resend/Formspree endpoint,
   etc.) that accepts a `POST` with form-encoded fields and returns a 2xx on success.
2. Set `PUBLIC_CONTACT_ENDPOINT` to that URL as a build-time environment variable.
3. The existing client script in `src/pages/contact.astro` will automatically switch from the
   "not yet connected" message to a real `fetch()` POST, and will show the real success/failure
   state based on the response — no other code changes needed.
4. Apply rate limiting on the endpoint itself (the client already disables the submit button
   during a request and rejects honeypot-filled submissions, but real rate limiting has to live
   server-side).
5. Never wire this to anything that implies a fixed response-time commitment or an automated
   booking/scheduling flow — both are explicitly excluded by brief §9 and the current copy on the
   page reflects that.

## Content governance rules (carried forward from the rebuild brief)

- Never fabricate biography, client history, results, press, product inventory, media metrics,
  testimonials, awards, or timelines. If it isn't verified or explicitly given, it doesn't ship.
- Missing content becomes a `draft: true` entry (excluded from the production build automatically
  by every `getCollection` call in this codebase) plus a row in `docs/content-needed.md` — never a
  lorem-ipsum placeholder or an invented example.
- No clinical, medical, diagnostic, or injury-prevention claims for HERO products or Performance
  content. No claims of formal endorsement by leagues, athletes, employers, or institutions
  without explicit, confirmed evidence. No client names or logos without confirmed permission.
- A division is `operating`/`available`/`publishing` only when it's genuinely live. Everything
  else uses `building`/`in-development`/`select-engagements`/`archived` — and every in-development
  card offers a real next step (contact, related content), never a dead-end "coming soon."
