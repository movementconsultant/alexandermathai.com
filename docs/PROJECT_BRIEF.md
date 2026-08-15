# Project Brief

## What this is

A minimal, production-ready placeholder site for **Alexander Mathai**,
establishing him as the founder voice and authority layer for the broader
Texas Movement ecosystem. It is not the full site — it is a deliberate,
intentional first step that will be replaced/expanded once the full site is
ready.

## Owner

Alexander Mathai. All brand-sensitive decisions (contact destinations,
social links, launch/index state, organizational claims) require his
explicit approval — see `CLAUDE.md` for the specific list.

## Objective

Give `alexandermathai.com` a real, credible presence — not a "coming soon"
apology page — while making zero claims that haven't been explicitly
approved: no fabricated client work, no unverified contact channel, no
invented social presence, no organizational data about Texas Movement
International beyond a plain, contextual mention.

## What's in scope for this build

- A single homepage covering: founder headline, areas of work, an
  intentional work-in-progress statement, a Texas Movement International
  relationship mention, and one CTA (shipped inert — see
  `docs/LAUNCH_BLOCKERS.md`).
- A 404 page.
- Preview/noindex convention (`PUBLIC_PREVIEW`), defaulted on.
- Person-only structured data.
- Cloudflare-Pages-ready static build.
- Baseline accessibility (skip link, focus-visible states, semantic
  headings, alt text) and a postbuild content guard.

## What's explicitly out of scope for this build

- A working newsletter or contact form.
- Any social media links or icons.
- Additional pages (about, work/portfolio, blog, contact) — these belong to
  the full site, not this placeholder.
- Any Texas Movement International organizational/legal data.
- Deployment, DNS, or making the site publicly indexable.

## Identity separation

This is a **Person** site (schema.org `Person`), intentionally kept
structurally separate from the **Organization** identity used across the
texasmovement.com-family repos. See `CLAUDE.md` for why the shared
`@tmi/constants` package is not vendored here.
