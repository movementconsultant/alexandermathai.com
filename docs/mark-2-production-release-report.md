# Mark 2 production release report — alexandermathai.com

Companion report lives at `docs/mark-2-production-release-report.md` in the
`texasmovement.com` repo. Read both before approving release — they describe
one coordinated two-site launch.

## Release candidate

- **Repository**: `movementconsultant/alexandermathai.com`
- **Branch**: `claude/founder-control-tower-rebuild`
- **PR**: [#2](https://github.com/movementconsultant/alexandermathai.com/pull/2) — open, draft,
  `mergeable_state: clean`, base `main`
- **Commit SHA**: `baac401347409af0472db1ba11ba16840ea38a98`
- **`main` branch status**: unchanged bootstrap commit `3ad687933e639ee1e624f5a42b96d694d925ebb8`
  ("chore: initialize empty repository") — confirmed via `git fetch origin main` immediately
  before this report. No drift.
- **Frozen placeholder** (`claude/alexander-mathai-placeholder` / PR #1): untouched, not part of
  this release candidate.
- **Stack**: Astro 7 (`output: "static"`, `trailingSlash: "never"`), TypeScript strict, MDX +
  `@astrojs/sitemap` integrations, Content Layer API collections. No server adapter — static
  output only.
- **Deploy target**: Cloudflare Pages, static `dist/` output. No Cloudflare account/project is
  connected in this environment — see "Cloudflare action plan" below.

## Final test results and commands run

All commands below were executed in this pass, against this exact commit's working tree, with
real output captured — none are paraphrased or assumed.

| Command                                                                                  | Result                                                                                                                                                              |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx astro check`                                                                        | **Pass** — 0 errors, 0 warnings (54 informational hints, pre-existing, unrelated to this pass — deprecated `z` import notices from Astro's content-collections API) |
| `npx prettier --check .`                                                                 | **Pass** (after `--write` on 2 doc files whose tables needed reflowing; re-checked clean)                                                                           |
| `npm run build` (`PUBLIC_PREVIEW` unset — preview mode)                                  | **Pass** — 17 pages generated                                                                                                                                       |
| `npm run build` (`PUBLIC_PREVIEW=false` — production mode)                               | **Pass** — 17 pages generated                                                                                                                                       |
| axe-core scan, 9 routes, production build, light theme                                   | **Pass** — 0 violations (`/`, `/work`, `/thesis`, `/ecosystem`, `/notes`, `/about`, `/contact`, `/privacy`, `/404`)                                                 |
| Manual: `grep -ri "hello@alexandermathai"` on prod `dist/`                               | **Pass** — 0 hits                                                                                                                                                   |
| Manual: unverified social `href` leak check on prod `dist/`                              | **Pass** — 0 hits (LinkedIn/Instagram/YouTube/TikTok all render as plain text, not links)                                                                           |
| Manual: `TBD` / lorem ipsum leak check on prod `dist/`                                   | **Pass** — 0 hits                                                                                                                                                   |
| Manual: `www.alexandermathai.com` / `pages.dev` / `localhost` leak check on prod `dist/` | **Pass** — 0 hits                                                                                                                                                   |
| Manual: preview-mode `robots.txt` + meta robots                                          | **Pass** — `Disallow: /`, `<meta name="robots" content="noindex, nofollow">`                                                                                        |
| Manual: production-mode `robots.txt` + meta robots + canonical                           | **Pass** — `Allow: /` + sitemap reference, no noindex tag, canonical points to `https://alexandermathai.com/`                                                       |
| Manual: H1-per-page count across all 17 routes                                           | **Pass** — one H1 each (verified in the preceding audit pass; re-spot-checked this pass)                                                                            |

No check in this table was skipped or assumed. The one pre-existing repo-tooling gap (no
`npm test`/`npm run lint` script, no bundled a11y script — accessibility was scanned with an
ad hoc script this pass, same as the prior audit pass) is listed under owner verification items.

## Production domain

- `https://alexandermathai.com`
- Canonical policy: apex is canonical. `www.alexandermathai.com` redirects permanently (301) to
  the apex — implemented this pass in `public/_redirects` (Cloudflare Pages `_redirects` syntax).
  This rule is inert until `www.alexandermathai.com` is also added as a custom domain on the same
  Cloudflare Pages project (see Cloudflare action plan).

## Cloudflare Pages project

**Correction (later pass, same day):** a connected project DOES exist — discovered via the
GitHub Checks API and the Cloudflare Pages bot's PR comment, not via any Cloudflare
credentials (this environment still has none). Project name **`alexandermathai`**, Cloudflare
account `c98bb3dd9f79a1a49ad9af7c44cd1259`. Every push to this PR's branch triggers a real preview
build automatically; the latest (commit `d4eee43`) completed successfully:

- Preview URL: `https://024a5366.alexandermathai.pages.dev`
- Branch preview URL: `https://claude-founder-control-tower.alexandermathai.pages.dev`
- Cloudflare dashboard log: `https://dash.cloudflare.com/?to=/c98bb3dd9f79a1a49ad9af7c44cd1259/pages/view/alexandermathai/024a5366-620d-489c-ba3f-c3ce3abf76a5`

**This environment could not fetch or inspect the content of either preview URL** — both `curl`
and the `WebFetch` tool return an egress-proxy block (`EGRESS_BLOCKED`) for `*.pages.dev`
domains, consistent with this environment's general no-web-access posture throughout this whole
project. So: the project's existence, name, and build-success status are confirmed (via
authenticated GitHub data); the actual rendered output of the preview (robots meta, canonical,
link behavior) is **not** independently verified from this session — someone with real browser or
unblocked network access needs to do that inspection before treating the preview as validated.

No custom-domain binding for `alexandermathai.com` itself could be confirmed or denied — the
Cloudflare dashboard link above is the way to check that, not available from this environment.

## Branch to deploy

`main`, per the release defaults — **but `main` does not currently contain this release
candidate.** `main` is still the original bootstrap commit. The release candidate lives on
`claude/founder-control-tower-rebuild` / PR #2. Merging PR #2 into `main` is a required
post-approval action (Section 8, step 1) — not performed in this pass.

## Preview configuration

- `PUBLIC_PREVIEW=true` or unset (default) → every page's `<BaseLayout>` sets
  `noindex = PUBLIC_PREVIEW` (true), robots.txt endpoint (`src/pages/robots.txt.ts`) serves
  `Disallow: /`. Verified against a real preview-mode build this pass.
- No secret is stored in any `PUBLIC_`-prefixed variable — confirmed by reading every
  `import.meta.env.PUBLIC_*` reference in `src/`: only `PUBLIC_PREVIEW` (boolean-like string) and
  `PUBLIC_CONTACT_ENDPOINT` (a URL, currently unset, not a secret) exist.

## Production configuration

- `PUBLIC_PREVIEW=false` — flips `noindex` off and `robots.txt` to `Allow: /` +
  `Sitemap: https://alexandermathai.com/sitemap-index.xml`. Verified against a real
  production-mode build this pass.
- No other environment variable is required for the canonical/site URL — `astro.config.mjs`
  hardcodes `SITE_URL = "https://alexandermathai.com"` as a source-controlled constant (not an
  env var), read by every page via `Astro.site`. Changing the production domain would require a
  code change to this one line, not an environment variable.
- `PUBLIC_CONTACT_ENDPOINT` — optional, currently unset. Leave unset for this release (see
  "Contact-path status" below).

## Verified/active external URLs

**None.** Every social/ecosystem URL in `src/data/social.ts` carries `verified: false` (11
entries: LinkedIn, 4×YouTube, 3×Instagram, 3×TikTok, plus the `texasmovement.com` umbrella link)
and every consumer (`Footer.astro`, `EcosystemMap.astro`, `DivisionCard.astro`, `about.astro`)
correctly renders these as plain text, not links — enforced and re-verified this pass (see
"Intentionally disabled/unverified destinations").

## Intentionally disabled/unverified destinations

- All 11 social/umbrella URLs above — plain text, no `href`, pending manual owner verification.
- Every ecosystem division without a live production hostname (HERO, Performance, Distribution,
  Social, FounderLink, Health, Reparations) — rendered with a status badge, no external link.
- Consulting and Media divisions reference their future subdomains
  (`consulting.texasmovement.com`, `media.texasmovement.com`) as plain inline text describing
  what's in development — not as links, since neither subdomain is confirmed live.

## Contact-path status

The `/contact` form is fully built (fields, client-side validation, accessible errors, honeypot)
but has **no backend connected**. `PUBLIC_CONTACT_ENDPOINT` is unset. The page and its scripts
state plainly that the form isn't connected yet and don't imply a submission was sent, reviewed,
or will get a response — re-verified in this pass's production build output (0 fabricated-success
strings, 0 `mailto:` leaks). No verified, owner-provided alternate contact address exists in
config to expose as a fallback (the one that previously existed,
`hello@alexandermathai.com`, was found fabricated and removed in the prior pass — see
`docs/mark-2-release-audit.md`). Per the release defaults, this does **not** block production
release; it's carried forward as post-launch priority #1.

## Owner verification items still required

1. **Cloudflare Pages custom-domain binding** — the project itself is confirmed to exist
   (`alexandermathai`, see "Cloudflare Pages project" above) and is auto-deploying previews
   successfully. What's still unconfirmed from this environment: whether `alexandermathai.com`
   and `www.alexandermathai.com` are already bound as custom domains on that project, and what
   its production-branch setting is. Check the Cloudflare dashboard link above.
2. **Social URLs** — manually open and confirm each of the 11 URLs in `src/data/social.ts`
   before flipping any `verified: true`.
3. **The 7 flagged claims** (2015 founding, 2.1M+ views, 150+ clients, SWEAT/HERO figures, About
   timeline, "Greater Chicago Area") — explicit owner sign-off, per
   `docs/mark-2-release-audit.md`.
4. **Contact backend decision** — Option A (connect a real backend) or Option B (supply a
   verified alternate contact address) per `docs/mark-2-launch-plan.md`.
5. **Cross-link to texasmovement.com** — `tmiUrl`/`tmiUrlVerified` in `src/data/social.ts` stays
   `false` until a human confirms `https://texasmovement.com` is live and correct post-launch;
   this is a one-line flip once confirmed, not done in this pass.

## Exact production checklist

1. Project already exists (`alexandermathai`, confirmed this session) and is auto-deploying
   preview builds successfully. Confirm its build command is `npm run build` and output directory
   `dist` in the Cloudflare dashboard (not verified from this environment — the automatic preview
   builds succeeding is strong evidence this is already correct).
2. Merge `claude/founder-control-tower-rebuild` (commit `baac401`) into `main` — only after the
   owner's explicit release approval (see release question).
3. Set the production environment variable `PUBLIC_PREVIEW=false` on the Cloudflare Pages
   **production** environment only (leave preview deployments on their default/unset value).
4. Add the custom domain `alexandermathai.com` to the Pages project; add `www.alexandermathai.com`
   as a second custom domain on the same project so the `_redirects` rule in this repo takes
   effect.
5. Confirm HTTPS is enforced on both hostnames once DNS validates.
6. Re-run the full validation gate (`npx astro check`, `npm run build` with
   `PUBLIC_PREVIEW=false`, the axe-core scan) against the actual deployed production URL, not
   just the local build.
7. Confirm `www.alexandermathai.com` redirects (301) to `https://alexandermathai.com/`.
8. Tag the release `v1.0.0-mark-2` once production validation passes.

## Rollback procedure

1. Cloudflare Pages retains prior deployments — use the dashboard's "rollback to previous
   deployment" action for immediate recovery; this restores service without touching git history.
2. If the regression is in code, fix forward with a new commit and `git revert` rather than
   force-pushing over `main` or the release branch.
3. If a specific claim or verified-link flag is found wrong post-launch, the narrowest fix is
   reverting that one flag/claim (e.g. back to `verified: false`) and redeploying — not a full
   site rollback.
4. Document every rollback in a follow-up commit message or PR comment so the audit trail stays
   accurate.

## Post-launch priorities

1. Add a real contact delivery path (connect `PUBLIC_CONTACT_ENDPOINT` or supply a verified
   alternate contact address).
2. Verify and selectively activate social destinations (manually confirm each of the 11 URLs,
   flip `verified: true` only on confirmed ones).
3. Audit / establish the HERO repository and release path (currently no accessible repo — hard
   blocker, unresolved).
4. Add an automated accessibility regression check to this repo (its siblings — texasmovement.com
   included — already have `npm run test:a11y`; this repo currently relies on an ad hoc script
   run manually during each audit pass).
5. Add new work/notes only through the content-governance rules in `docs/ecosystem-governance.md`
   and `docs/site-operations.md` — never bypass the `draft: true` / claim-verification pattern.

## Blockers

**Hard:**

- No Cloudflare account/project access in this environment — project name, existing bindings, and
  a live preview URL could not be determined or inspected (Section 6 requirement — see "Cloudflare
  Pages preview check" below).
- `tmi-constants` package repo still cannot be created (persistent `403 Resource not accessible
by integration`) — unrelated to this repo's own launch readiness, tracked in the shared
  ecosystem-governance doc.

**Recommended, not launch-blocking:**

- 11 social URLs unverified.
- 7 claims need explicit sign-off.
- No automated a11y guard script in this repo yet.

## Cloudflare Pages preview check

**Corrected (later pass, same day): a preview deployment does exist, and its existence/build
success was confirmed — its content could not be inspected.** A Cloudflare Pages project
(`alexandermathai`) is already connected and auto-deploys this branch on every push; the GitHub
Checks API and the Cloudflare Pages bot's PR comment confirm the latest push (commit `d4eee43`)
built and deployed successfully to `https://024a5366.alexandermathai.pages.dev` (and a stable
branch alias, `https://claude-founder-control-tower.alexandermathai.pages.dev`). Both `curl` and
the `WebFetch` tool were tried against these URLs from this session and both returned an
egress-proxy block (`EGRESS_BLOCKED`) — this sandbox cannot reach `*.pages.dev` domains, so the
required content checks (noindex/nofollow meta, restrictive preview robots, no canonical/OG/
JSON-LD/RSS/sitemap leaks, only-verified-links-active, honest contact-path behavior) could **not**
be performed against the live preview from this environment. **The exact action needed: someone
with unrestricted network access (or the Cloudflare dashboard itself) opens the preview URL above
and confirms those same checks that were already verified against the local build output** (see
"Final test results and commands run") — the local-build results should match, but that's an
assumption pending real confirmation, not a substitute for it.
