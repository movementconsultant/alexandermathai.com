# Release definition of done — alexandermathai.com PR #2

This checklist defines what "done" means for `claude/founder-control-tower-rebuild` (PR #2)
across six independent categories. **Passing category A does not authorize anything in categories
B–F.** No category here is satisfied by this document existing — each item is either checked
because it was actually run/verified this session (cited), or left open as an owner action.

## A. Automated technical gates

- [x] `astro check` — 0 errors, 0 warnings (re-run this session)
- [x] `prettier --check .` — clean (re-run this session)
- [x] `npm run build` (`PUBLIC_PREVIEW` unset/true — preview mode) — 17 pages, success
- [x] `npm run build` (`PUBLIC_PREVIEW=false` — production mode) — 17 pages, success
- [x] `scripts/postbuild-guard.mjs` hard checks — 0 violations, both modes (auto-runs as
      `postbuild`)
- [x] `scripts/postbuild-guard.mjs` claims-registry audit — non-blocking, all 41 registered claims
      found in output, only 2 expected benign candidates (copyright year, a form budget-range
      option) flagged, both modes
- [x] E2E suite, preview mode (`npm run test:e2e:preview`) — 38/38 passed
- [x] E2E suite, production mode (`npm run test:e2e:production`) — 22/22 passed
- [ ] Unit tests — **none exist in this repo** (a pre-existing gap relative to sibling repos in
      this ecosystem, not addressed this pass; see `docs/mark-2-production-release-report.md`)

Passing every box above means: the build is clean, the safety guard's hard rules hold, and the
E2E suite's behavioral assertions hold, in both preview and production modes, verified by actually
running each command this session. **It does not mean the site is ready to launch** — see B–F.

## B. Owner editorial/claims decisions

- [ ] Every item in `docs/CLAIMS_REVIEW.md` has an explicit Approve/Qualify/Remove decision from
      the site owner (currently: 40 of 41 pending, 1 pre-approved as self-evident)
- [ ] Approved/qualified/removed decisions are actually applied to the live copy in a separate,
      explicit editorial pass (not this one — see `docs/CLAIMS_REVIEW.md` "How to review")
- [ ] `claims.registry.json`'s `ownerDecision` values updated to match, once B1 is done

## C. Hosted-preview visual checks

- [ ] The live Cloudflare Pages preview URL (`https://024a5366.alexandermathai.pages.dev` at time
      of writing, or whatever the current PR head's preview URL is) has been opened in a real
      browser by a human and visually reviewed — this session's environment has no general network
      access and could not do this (confirmed: both `curl` and the `WebFetch` tool return
      `EGRESS_BLOCKED` for `*.pages.dev` from this sandbox)
- [ ] Responsive layout checked at mobile/tablet/desktop breakpoints
- [ ] Dark/light theme toggle checked
- [ ] Reduced-motion behavior checked with the OS setting enabled

## D. External-link verification

- [ ] All 11 entries in `src/data/social.ts` manually opened and confirmed to resolve to the
      correct, owned account before any is flipped from `verified: false` to `verified: true`
- [ ] The `texasmovement.com` umbrella link (`tmiUrl`/`tmiUrlVerified` in `src/data/social.ts`)
      confirmed live and correct before being flipped to `verified: true`
- [ ] No claim in this checklist or `docs/CLAIMS_REVIEW.md` substitutes for this — a claim being
      "approved" in category B does not verify a URL

## E. Infrastructure/domain decisions

- [ ] Cloudflare Pages project confirmed connected (`alexandermathai` — confirmed to exist this
      session via GitHub Checks API, see `docs/mark-2-production-release-report.md`) with the
      correct production-branch setting
- [ ] Custom domain `alexandermathai.com` bound in that Cloudflare Pages project
- [ ] `www.alexandermathai.com` bound as a second custom domain so the committed
      `public/_redirects` rule takes effect
- [ ] `PUBLIC_PREVIEW=false` set as a **production-only** environment variable in that Cloudflare
      Pages project (never applied to preview deployments)
- [ ] Contact-form backend decision made and, if Option A (connect a real backend) is chosen,
      implemented as a reviewed code change (not an env var — see "F" below and
      `docs/claims-governance.md`-adjacent `docs/mark-2-launch-plan.md` "Contact-form decision")
- [ ] The GitHub Pages / Cloudflare Pages CNAME conflict check in
      `docs/infrastructure-owner-checklist.md` completed for `texasmovement.com` (a separate repo,
      but a launch-order dependency if both hubs go live together)

## F. Explicit release authorization

- [ ] Site owner has reviewed categories A–E above and explicitly states the site is authorized
      to merge PR #2 into `main`
- [ ] Site owner has separately and explicitly authorized the actual Cloudflare Pages production
      deploy — merging to `main` and deploying are two different authorizations, not one
- [ ] Site owner has separately and explicitly authorized binding the custom domain(s) — domain
      binding is a third, independent authorization
- [ ] **A future, separate decision**: whether/when to connect a verified contact-form backend.
      This is explicitly not bundled into "ready to launch" — the site can go live with the
      current honest "not connected yet" contact state, per `docs/mark-2-launch-plan.md`'s Option
      B, and this can be revisited independently post-launch.

**No combination of checked boxes in A alone equals a "go" decision.** Every category B–F requires
action a coding session cannot take on its own — human review, human verification of external
URLs, human dashboard access, and explicit human authorization at each of the three separate
gates in F.
