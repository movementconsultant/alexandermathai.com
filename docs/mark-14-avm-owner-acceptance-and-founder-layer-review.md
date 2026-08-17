# Mark 14 — AVM Owner Acceptance & Founder-Layer Review

## 1. State at start of Mark 14

- Repository: `movementconsultant/alexandermathai.com`
- Branch: `claude/mark-18-avm-furnishing`
- HEAD SHA before Mark 14 changes: `2f198d7` (Mark 13's "feat: apply AVM founder systems archive")
- PR: **#3**, state `open`, `draft: false`
- Base: `main` (SHA `109477d`, unchanged since Mark 13)
- `mergeable_state`: `clean`
- Frozen fallback (`claude/alexander-mathai-placeholder`, PR #1) — read-only
  verified via `pull_request_read`: `state: open`, `draft: true`, head SHA
  `f0fc58a` (unchanged). Never checked out, edited, or commented on.

## 2. Property role

AVM is Alexander Mathai's founder/editorial authority layer: a reading-first
personal systems archive, distinct from TMI's institutional operating
console. It shares TMI's structural grammar (dark-first, hairline borders,
one restrained accent) but not its type identity, layout density, or
literal palette.

## 3. Owner-acceptance checklist

| # | Question | Result |
|---|---|---|
| 1 | Does `/` read as a founder systems archive: editorial, disciplined, authored, reading-first? | **PASS** — serif display headings, generous whitespace, "Selected work"/"Field notes" framed as authored records, not marketing tiles. |
| 2 | Does it remain related to the ecosystem without becoming a TMI clone? | **PASS** — footer names every TMI vertical as plain non-clickable text (matching TMI's own lifecycle-gating convention — none is `status: "live"` yet); no shared literal palette or type with TMI (see cross-repo record). |
| 3 | Does the orange accent remain restrained and purposeful? | **PASS** — used for the active-nav underline, primary CTA buttons, and the eyebrow marker only; not used as a background fill or decorative glow anywhere observed. |
| 4 | Are light and dark modes internally coherent and accessible? | **PASS** — both screenshotted; light mode uses the same structure and darker/AA-safe accent value already audited in `docs/mark-2-release-audit.md`; Mark 13 added no new literal color, only `var()` aliases, so nothing here could have regressed. |
| 5 | Do `/notes` and `/ledger` reinforce an archive rather than a marketing identity? | **PASS** — `/notes` shows dated, tagged, authored entries; `/ledger` explicitly discloses its automated, not-individually-reviewed nature and degrades to a static "read the newsletter directly" link when the build-time fetch is unavailable (as it is in this sandbox — confirmed by the rendered fallback box in the screenshot). |
| 6 | Are founder-claim, social, preview, contact, and fallback protections intact? | **PASS** — `scripts/postbuild-guard.mjs`'s social-domain guard and `src/data/blocklist.json` untouched; `/contact` re-verified inert (46+28 e2e checks below); `PUBLIC_PREVIEW` gating re-verified; frozen fallback untouched (see §1). |
| 7 | Any minor layout, typography, focus, status-label, or mobile issue that reduces founder credibility? | **PASS**, no issue found — see §6 for review detail. |

**Overall: PASS**, no watch items rise to blocking.

## 4. Routes manually reviewed

`/`, `/notes`, `/ledger` — each at:
- Desktop, 1280×900, dark (`colorScheme: "dark"` emulated)
- Desktop, 1280×900, light (`colorScheme: "light"` emulated — Playwright's default, and the condition under which most first-time visitors without a dark-mode OS preference will land)
- Mobile, 390×844, dark

All against the built `dist/` output via a local, pre-installed Chromium
instance.

## 5. Tests run and results

| Command | Result |
|---|---|
| `npx astro check` | 0 errors, 0 warnings, 64 pre-existing hints (unchanged since before Mark 13) |
| `npm run test:e2e:preview` (Playwright, builds first) | **46/46 passed** |
| `npm run test:e2e:production` (Playwright, `PUBLIC_PREVIEW=false` build first) | **28/28 passed** |
| Postbuild guard (`scripts/postbuild-guard.mjs`, runs as part of both e2e build steps) | 0 violations, both runs |

There is no separate `test:a11y` script in this repository (confirmed via
`package.json`) — accessibility coverage here lives inside the e2e specs
(noindex/canonical checks, inert-form checks, route-reachability checks),
all of which passed. No command from the Mark 14 brief's AVM validation
list was unavailable.

## 6. Findings detail

No defect, contrast issue, layout break, or mobile-readability problem was
found on any of the three reviewed routes at any of the three
viewport/theme combinations. Both themes render the same structural
content with correct, previously-audited contrast values (Mark 13 added
zero new literal colors — every `--ff-*` token is a `var()` alias to an
already-audited existing token, so there was nothing new to regress).

## 7. Changes made in this pass

**None.** No file was edited. The audit found the implementation already
correct against every question in §3.

## 8. Explicit confirmation of what was not changed

- No route, page, component, or token file edited.
- No founder claim, social link, external feed, embed, analytics, form, or
  conversion path added, removed, or altered.
- No dependency, `package.json`, or lockfile change.
- No Cloudflare, DNS, domain, deployment, or GitHub setting touched.
- No PR metadata (draft status, base branch, reviewers) touched on PR #3
  **or** PR #1.
- The frozen fallback branch (`claude/alexander-mathai-placeholder`) was
  never checked out, read beyond the single read-only API status
  confirmation in §1, or modified in any way.
- `main` untouched (still at `109477d`, matching Mark 13's report).

## 9. Commercial readiness — not yet implemented

Three smallest possible future work packages, **none started or scoped
beyond a one-line description here**:

1. **Verified `PUBLIC_CONTACT_ENDPOINT`.** The Worker exists
   (`workers/contact-intake/`, undeployed — see
   `docs/mark-18-contact-intake-implementation.md`); connecting it is an
   owner-run deployment step (Cloudflare account, secret provisioning),
   not an engineering task available in this environment.
2. **A second, real artifact.** `/artifacts` currently holds one explicitly
   labeled placeholder entry (`systems-over-tactics.mdx`) — adding a real,
   owner-authored piece is a content task, not a code task.
3. **KV-backed rate limiting on the contact Worker.** Currently fails open
   (documented limitation) until the owner provisions a Cloudflare KV
   namespace — an infrastructure step, not a code change.

## 10. Recommended owner decision

**Ready to review.**

No blocking defects were found. The founder-layer identity is intact and
distinct from TMI, both themes are coherent, all existing safeguards
(claims, social-domain, contact inertness, preview gating, frozen fallback)
were verified untouched, and every validation gate passes with zero
regressions since Mark 13.
