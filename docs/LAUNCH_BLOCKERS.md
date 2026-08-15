# Launch Blockers

Things that must happen — and who needs to approve them — before this site
can move past "placeholder" toward a real launch.

## 1. CTA has no working destination

**Decision shipped:** the CTA renders as an inert, non-submitting
"coming-soon" element (`.cta-badge` in `src/pages/index.astro`) — a styled
badge reading "Follow the build — coming soon", with no `<form>`, no
`action`, no `href`, and no live destination of any kind.

**Why this option over omitting the CTA entirely:** the section headline
("Where this site is") and the work-in-progress statement are explicitly
meant to read as intentional forward motion, not an apology. An inert
coming-soon badge reinforces that tone — it signals "something is coming"
without collecting data, promising delivery, or claiming a channel exists.
Omitting the CTA section entirely was the other option considered; it would
have been equally correct per the brief, but reads slightly more like an
absence than a decision. Either is defensible; this is the call made for
this build.

**Blocker to going live with a real CTA:** no verified ESP (email service
provider) account and no confirmed delivery destination exist. Per the
explicit rule for this build, `hello@texasmovement.com` (or any other
email) may **not** be used as this site's CTA destination without separate
approval. Nothing here should be turned into a working form until:

- An ESP account exists and is confirmed by Alexander.
- A confirmed delivery destination (list ID, form endpoint, etc.) is
  supplied.
- Alexander explicitly approves wiring it up.

## 2. No social links

No confirmed handle exists for this site's own identity on any platform.
Per the explicit rule for this build, nothing from the Texas Movement
`social.ts` registry may be reused here — those are TMI's accounts, not
Alexander's personal ones. Blocker: a confirmed handle per platform,
supplied and approved by Alexander, before any icon/link is added.

## 3. Site is not indexable

`PUBLIC_PREVIEW` defaults to `true`. The site currently ships
`noindex, nofollow`, an empty sitemap, a robots.txt that disallows all
crawling, and no canonical link to the production domain. Blocker: an
explicit decision from Alexander to set `PUBLIC_PREVIEW=false` for a real
production build — this is a launch decision, not a technical one.

## 4. No deploy has happened

This repo has never been deployed. `wrangler.toml` declares the Cloudflare
Pages project shape only. Blocker: Alexander (or someone he designates)
connects the Cloudflare Pages project and triggers a deploy — out of scope
for this build per the stated hard boundaries.

## 5. This is a placeholder, not the full site

Only a homepage and a 404 exist. No about/work/portfolio/contact pages.
Blocker: scope, copy, and structure for the full site, to be defined in a
future pass once Alexander has more to share.
