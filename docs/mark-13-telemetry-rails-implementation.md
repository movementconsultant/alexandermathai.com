# Mark 13/14 Telemetry Rails Implementation

Build-time-fetched "telemetry" rails — The Ledger (`/ledger`, Substack) and Live Systems
(`/systems`, GitHub public events) — implemented per the owner's explicit Mark 13 architectural
authorization and evidence, and the Mark 14 "Raw Telemetry" governance classification that resolved
the G-M8 tension this introduced. This is an implementation record, not an audit — see
`docs/mark-12-external-feed-feasibility-and-governance.md` (a separate repository) for the prior
feasibility analysis this build now acts on.

## Governance basis

- **Mark 13** (owner directive): authorized build-time `fetch()` in Astro frontmatter only — no
  Workers, no proxies, no client-side fetching. Supplied source evidence: Substack feed URL
  (`https://texasmovement.substack.com/feed`), GitHub org (`movementconsultant`, unauthenticated
  public API, no PAT), and field authorization (title/date/link for Substack; repo/commit-message/
  date for GitHub).
- **Mark 14** (owner directive, in response to a raised G-M8 conflict): introduced the
  **Container vs. Stream** distinction. The rail component/schema/inclusion decision is an
  Artifact subject to G-M1–G-M8 (satisfied by this implementation itself being explicitly
  requested and reviewed). The individual items inside a rail are **Raw Telemetry**, explicitly
  exempt from per-item G-M8, conditional on:
  1. The **Ticker Tape Guardrails** (field-level content sanitization — see below) being strictly
     enforced in code.
  2. A visible, honest **disclosure** on every rail stating the content is automatically retrieved
     and not individually reviewed (`TelemetryDisclosure.astro`).
  3. A working **kill switch** (`src/data/blocklist.json`) the owner can edit directly to hide any
     specific item.

## Ticker Tape Guardrails — what's enforced and where

| Source                | Fields shown                                            | Fields never shown                     | Enforced in                                                                                                     |
| --------------------- | ------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Substack (Ledger)     | Title, date, link                                       | Excerpt, description, full body        | `src/lib/ledger.ts` `extractItems()` — only `<title>`/`<link>`/`<pubDate>` are ever read from the feed          |
| GitHub (Live Systems) | Repo name, commit message (first line, ≤50 chars), date | Diff, full commit body, PR description | `src/utils/telemetryText.ts` `truncateCommitMessage()` — applied to every message before it reaches a component |

Both `src/lib/ledger.ts` and `src/lib/liveSystems.ts` construct their output objects with an
explicit, closed field set (`LedgerItem`/`LiveSystemsItem` interfaces) — there is no path for an
unlisted field from the raw response to reach a component.

## Kill switch

`src/data/blocklist.json` holds per-source arrays (`github.blockedShas`, `substack.blockedUrls`,
a reserved `youtube.blockedVideoIds` for parity with the TMI-side implementation). Both
`getLedgerItems()` and `getLiveSystemsItems()` filter against it before returning. No network call,
no deploy pipeline change, no restart beyond a normal rebuild — add an identifier, commit, rebuild.

## Build-time-only, never client-side

`fetch()` is called only from `src/lib/ledger.ts` and `src/lib/liveSystems.ts`, both imported only
by `.astro` frontmatter (`LedgerRail.astro`, `LiveSystemsRail.astro`), which executes exclusively
during `astro build`/`astro dev`. Confirmed by the pre-existing Playwright assertion "no built JS
bundle contains a fetch() call to an external URL" (`tests/e2e/preview.spec.ts`), which still
passes. `scripts/postbuild-guard.mjs`'s `EXTERNAL_FETCH_PATTERN` check (scans `dist/` for a literal
`fetch("https://...")` string) also still passes — the fetch calls never reach built output as
source text.

## Network-verification limitation (disclosed, not hidden)

**This sandboxed build/verification environment cannot reach any of the three real endpoints.**
Confirmed empirically this pass, consistent with this repository's own prior documented finding
(`docs/rebuild-plan.md` "Audit findings": general web egress beyond an infra allowlist returns
`EGRESS_BLOCKED`):

- `https://texasmovement.substack.com/feed` — connection blocked at the proxy (`CONNECT tunnel
failed, response 403`).
- `https://api.github.com/users/movementconsultant/events/public` — reaches GitHub's API
  infrastructure (unlike Substack, `api.github.com` itself is allowlisted for this session's
  repository-scoped operations) but this specific unscoped endpoint is explicitly rejected by this
  session's own proxy: `"This GitHub API path is not available: sessions are bound to their
configured repositories."` — a sandbox-specific restriction, not a GitHub rate limit or policy.

**Consequence:** every build run in this environment exercises the _fallback_ path for both rails,
never the _live-data_ path. That fallback path is now proven — real fetch failures, not simulated
ones, degraded to the static fallback link with zero build errors, in both `PUBLIC_PREVIEW` modes.
What is **not** verified from this environment: that a successful fetch against the real endpoints
parses correctly and renders the expected title/date/link fields. Cloudflare Pages' actual build
environment has ordinary internet access and is a materially different network context than this
sandbox — the code is expected to reach the live-data path there, but that has not been, and could
not be, confirmed from this session. Recommended: a human with real network access should open a
preview deploy of this branch and visually confirm both `/ledger` and `/systems` render live items
before treating this as production-ready.

## "60-minute cache" — not implemented as literally requested, and why

The owner's Mark 13 evidence requested a 60-minute cache for Substack. No caching layer exists
anywhere in this repository, and this build is stateless per-run (each `astro build` starts fresh,
consistent with a normal Cloudflare Pages build). A literal time-based cache would require either a
persistent build-cache directory or a scheduled rebuild trigger — both infrastructure changes
outside a `.astro`-frontmatter-only, no-Workers-no-proxies implementation. What exists instead: one
fetch per build, which in practice refreshes the content on whatever cadence the site is rebuilt
(a push, or a future scheduled trigger, neither of which this task configures). Flagged here rather
than silently deviating from the request.

## GitHub rate-limit note

Unauthenticated GitHub REST API requests are limited per-IP. No PAT is used, per the owner's
explicit instruction. In a real production build environment, if this rail's request ever returns
`403`/`429` due to rate limiting (indistinguishable, from this code's perspective, from any other
fetch failure), it degrades to the static fallback link exactly like any other failure — the same
mechanism observed firsthand in this sandbox (see above), just for a different underlying cause.

## Validation performed this pass

```
npx astro check                    → 0 errors, 0 warnings (55 pre-existing unrelated hints)
npm run build (preview default)    → 19 pages, postbuild-guard 0 violations
PUBLIC_PREVIEW=false npm run build → 19 pages, postbuild-guard 0 violations, sitemap generated
npm run test:e2e:preview           → 42/42 passed (incl. the pre-existing external-fetch-in-bundle check)
npx playwright test tests/e2e/production.spec.ts → 26/26 passed (incl. 2 new telemetry-rail assertions)
```

Manual `dist/` inspection: both `/ledger` and `/systems` rendered their fallback state cleanly (no
partial/broken list, no forbidden domain string, no diff/commit-body/excerpt leak).

## Not done this pass

No caching infrastructure, no scheduled rebuild trigger, no PAT/secret, no Worker/proxy, no
Cloudflare/DNS/deployment change, no merge, no production release. `/ledger` and `/systems` were
added to `src/data/nav.ts` (primary + footer nav) and `tests/e2e/routes.ts` so they're reachable
and covered by every existing route-level check.
