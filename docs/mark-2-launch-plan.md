# Mark 2 launch plan

Owner-facing plan for taking the TMI ecosystem from its current draft state to a controlled,
honest public release. This plan assumes the findings and domain matrix in
`docs/mark-2-release-audit.md` — read that first if you haven't.

This document describes what to do. It does not itself deploy, merge, or connect anything —
no action in this plan has been taken as part of this pass.

## Launch order

Launch in this sequence, not all at once — each step depends on the previous one being verified
live and correct before the next begins:

1. **alexandermathai.com** (founder control tower) — the most complete, most independently
   audited property in the ecosystem. Launch first because every other division's "Route" links
   point outward from here and from texasmovement.com, and because the owner-confirmation list
   for this repo is short (see audit §6).
2. **texasmovement.com** (umbrella / routing layer) — launch second, immediately after, since its
   `ECOSYSTEM_MAP` is what makes the routing model truthful. Launching the hub without the
   umbrella (or vice versa) leaves half the cross-links pointing at nothing live.
3. **consulting.texasmovement.com** and **media.texasmovement.com** — the two divisions closest
   to a genuine public experience per the audit's Live/Route/Building classification. Launch
   together once their own owner-confirmation items (see each repo's audit notes) are cleared.
4. **Everything else** (Performance, Distribution, Social, FounderLink, Health, Reparations,
   HERO) — stays in **Building** or **Reserve** mode (see below) until each one individually
   clears its own launch gate. Do not launch a division just because its repo exists and builds.

## What should launch first

alexandermathai.com and texasmovement.com, as described above — both were audited this pass and
have working `PUBLIC_PREVIEW` gating, honest ecosystem routing, no fabricated claims found beyond
those flagged for owner confirmation, and a real (if unconnected) contact experience.

## What should route

Any division without its own deployed, reachable production hostname should render as a **Route**
in the ecosystem UI: a card describing the division truthfully, linking back to
`/contact` or another live page as the "next action," and never claiming to be independently
live. Per the audit's domain matrix, that currently applies to Distribution, Social,
FounderLink, Health, and Reparations at minimum — confirm each one's actual deploy status before
launch, since a repo having a draft PR does not mean it has a live URL.

## What should remain Building / Reserve

- **Building**: a division with a real, in-progress repo and draft PR, but no verified production
  deployment yet (Performance, and provisionally Distribution/Social/FounderLink/Health/
  Reparations pending the check above). These should show a "Building" status badge with a
  concrete description of what's being built — never a bare "Coming soon."
- **Reserve**: a division that exists only as a domain/name reservation with no repo or active
  build (HERO, until its repo access issue in the audit's blockers section is resolved). These
  should not appear as a clickable ecosystem node at all, or should appear only as inert text —
  no link, no status claiming activity, per the Public Rule in the audit.

## Required verification sequence

Before any hostname goes live, in this order:

1. **Claims** — walk the "Claims requiring owner confirmation" table in the audit and get an
   explicit yes/no/correction on each row from the site owner. Do not launch with an unconfirmed
   claim still in production copy.
2. **Social URLs** — manually open each of the 11 unverified URLs in `src/data/social.ts` (and
   the equivalent files in other repos) and confirm they resolve to the correct, owned account.
   Flip `verified: true` only after that manual check — do this by hand; there is no automated way
   to do it from this build environment (no web egress).
3. **Contact path** — decide and implement the contact-form backend decision (below) before
   claiming the form works anywhere in copy.
4. **Preview QA** — run the preview deployment QA steps (below) against a Cloudflare Pages
   preview URL, not just local `npm run build`.
5. **Production build** — confirm `PUBLIC_PREVIEW=false` is set correctly for the production
   environment only, and re-run the validation gate (format/typecheck/build/a11y) against that
   production build output specifically.
6. **DNS / deploy** — only after 1–5 pass, proceed to the production DNS and deployment steps.

## Contact-form decision

Every repo in the ecosystem currently ships a contact form UI with no backend connected — this is
intentional (see `docs/ecosystem-governance.md` for the rule). Before launch, the owner must pick
one:

- **Option A — connect a real backend.** Stand up a Cloudflare Pages Function, or a vendor like
  Formspree/Resend, that accepts the POST and delivers to a real, owner-approved inbox. Set
  `PUBLIC_CONTACT_ENDPOINT` as a build-time environment variable per repo. This is the only
  configuration change needed in code — see `docs/site-operations.md` §"Contact-form integration
  point" for the exact mechanism already built.
- **Option B — launch without a working form.** Keep the current honest "not connected yet"
  state and give visitors an alternate verified path (a real, confirmed email address or a
  scheduling link the owner actually monitors). This requires the owner to supply that
  verified contact detail — none currently exists in the codebase (the fabricated
  `hello@alexandermathai.com` address was removed this pass specifically because it was never
  confirmed as real).

Do not launch any hostname whose copy implies the form sends somewhere, until one of these two
options is actually implemented.

## Image upload steps

alexandermathai.com currently uses a typographic/diagrammatic hero (no photo asset), per the
rebuild brief's own fallback rule, because no approved photo file was available in the repo at
build time. If the owner wants to use one of the photos supplied during the original rebuild
request:

1. Add the image file to `public/images/` (e.g. `public/images/founder-portrait.jpg`), sized and
   compressed appropriately (a hero image should be under ~300KB after compression; use a tool
   like `sharp` or `squoosh` — do not commit an unoptimized multi-MB source photo).
2. Update the relevant hero component (`src/components/home/Hero.astro` or equivalent) to render
   the `<img>` with a real, descriptive `alt` attribute — never `alt=""` on a meaningful photo,
   never a generic `alt="photo"`.
3. Regenerate the default OG image if the photo should also appear in social-share previews (see
   `docs/site-operations.md` §"How to update metadata and OG graphics").
4. Re-run the a11y scan after the change — an added image is a new node axe-core will check for
   alt text and contrast if it has overlaid text.

## Preview deployment QA steps

1. Push the branch and let Cloudflare Pages (or the chosen host) build a preview deployment from
   it — do not skip straight to production.
2. Confirm the preview's `robots.txt` returns `Disallow: /` (this only happens automatically if
   `PUBLIC_PREVIEW` is unset or not literally `"false"` in that environment — verify the actual
   env var value in the hosting dashboard, don't assume).
3. Confirm every `<meta name="robots">` tag across the preview's pages reads `noindex` (view
   source on at least the homepage and one content page).
4. Click through the full route inventory listed in the audit (17 pages for this repo) on the
   live preview URL, not just localhost — CDN/edge behavior can differ from `astro dev`.
5. Re-run the axe-core accessibility scan against the preview URL (swap `BASE` in the a11y check
   script for the preview hostname).
6. Confirm no `localhost`, `.pages.dev`, or other preview-only URL leaks into canonical tags,
   structured data, sitemap entries, or visible copy.

## Production DNS / deployment steps

Not performed as part of this pass — this is a plan for the owner to execute or explicitly
authorize:

1. In the hosting platform (e.g. Cloudflare Pages), create the production project for each repo
   being launched (per the launch order above), connected to that repo's release branch.
2. Set `PUBLIC_PREVIEW=false` as a production-only environment variable (leave it unset or `true`
   for preview/staging environments on the same project, if the host supports per-environment
   variables — do not use a single global value for both).
3. Set `PUBLIC_CONTACT_ENDPOINT` in production if Option A (connected backend) was chosen above.
4. Add the custom domain (e.g. `alexandermathai.com`) to the Pages project and follow the host's
   DNS instructions (typically a `CNAME` or the host's provided A/AAAA records) — this requires
   access to the domain's DNS provider, which this build environment does not have and did not
   touch.
5. Confirm HTTPS is enforced (most hosts do this automatically once DNS validates) and there is
   no plain-HTTP fallback left reachable.
6. Re-run the full verification sequence above against the live production hostname once DNS
   propagates, before telling anyone the site is live.

## Rollback plan

- Cloudflare Pages (and equivalent hosts) keep prior deployments addressable — if a production
  push introduces a regression, use the host's "rollback to previous deployment" action rather
  than reverting code first; that restores service immediately while the code fix happens
  separately.
- Keep the git branch history intact: `claude/founder-control-tower-rebuild` and PR #2 remain the
  release branch. If a bad commit reaches it, revert with a new commit (`git revert`) rather than
  force-pushing — this repo's git-safety rules prohibit force pushes to shared branches without
  explicit owner authorization.
- If a launched hostname is found to contain an unconfirmed claim or a broken verified-link
  assertion after launch, the fastest safe fix is to redeploy with that specific claim/link
  reverted to its prior honest state (e.g. `verified: false`, or the claim removed), not a full
  site rollback — keep the blast radius of any rollback matched to the actual defect.
- Document any rollback in the repo (a short note in the PR or a follow-up commit message)
  so the audit trail stays accurate for future maintenance.

## Post-launch week-one priorities

1. Manually verify all social URLs (see "Required verification sequence" above) and flip
   `verified: true` only on the ones confirmed — this was blocked during this pass by lack of web
   egress and is the single largest remaining honesty gap.
2. Resolve the two hard blockers from the audit: the `tmi-constants` package repo creation
   (currently blocked by a GitHub App permission error) and HERO's missing/inaccessible repo.
3. Get the owner's explicit answers to all 7 "owner decisions required" items in the audit and
   implement whichever choices they make.
4. Decide and implement the contact-form backend (Option A or B above) if not already done before
   launch.
5. Add the missing automated accessibility-guard script to alexandermathai.com (the other repos
   in the ecosystem already have this pattern; this repo currently relies on the one-off manual
   scan run during this pass) — see audit §9 for the specific gap.
6. Monitor the production `robots.txt` and `noindex` meta output on a real cadence (e.g. weekly)
   until every division that should be indexable is confirmed correctly indexed and every
   Building/Reserve division stays correctly excluded.
7. Re-review the domain matrix in the audit against real-world status monthly for the first
   quarter post-launch — statuses in a fast-moving ecosystem go stale quickly, and
   `docs/ecosystem-governance.md` defines the rule for keeping them current.
