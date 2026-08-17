# Claims governance — schema and enforcement model

This document explains `claims.registry.json` and how it relates to `docs/CLAIMS_REVIEW.md` and
the postbuild guard. Read `docs/CLAIMS_REVIEW.md` first for the actual claim-by-claim content —
this file is about the mechanism, not the claims themselves.

## Two artifacts, one source of truth

- **`docs/CLAIMS_REVIEW.md`** — the human-readable, owner-facing decision artifact. Checkbox per
  claim, full context, grouped by where each claim appears.
- **`claims.registry.json`** — the same claims, machine-readable, at the repository root so a
  future build step can read it without parsing Markdown.

Both were generated from the same read-through of every content source in this repository in the
same pass; they should stay in sync. If a claim is added, removed, or reworded in one, update the
other in the same change.

## Schema (`claims.registry.json`)

Each entry in the `claims` array has:

| Field              | Meaning                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | Stable kebab-case identifier. Do not reuse an `id` for a different claim, and do not change an existing `id` without a reason — other tooling (the postbuild guard's audit report) may reference it.                 |
| `exactText`        | The literal rendered wording. If wording changes even slightly, treat it as a new claim (new `id`) unless it's a pure typo fix — the whole point is exact-text tracking.                                             |
| `routes`           | Every route the claim renders on, including non-HTML surfaces (RSS, JSON-LD-only routes).                                                                                                                            |
| `category`         | One of: `metric`, `timeline`, `title`, `biography`, `client-category`, `product-history`, `technical`, `other`.                                                                                                      |
| `qualification`    | The claim's current in-context hedging, if any: `none`, `founder-reported`, `documented`, or `other`. This mirrors the source data's own `evidenceLevel` field where one exists — it is not an independent judgment. |
| `evidenceStatus`   | Whether this repository contains a source document substantiating the claim. Almost always `"none-found"` — that's expected for founder-reported biography/business facts, not itself a defect.                      |
| `ownerDecision`    | `"pending"` for every claim except the one self-evident technical claim, which is `"documented"`. **This field does not currently affect the build in any way** (see "Enforcement" below).                           |
| `sourceLocations`  | File paths (and line numbers where stable) for every place the claim is defined and rendered.                                                                                                                        |
| `notes` (optional) | Factual context only — no editorializing, no invented support.                                                                                                                                                       |

## The "documented" criterion

`ownerDecision: "documented"` is reserved for exactly one claim in this registry
(`work-tmi-ecosystem-self-reference`): the assertion that this site's own architecture is the one
currently running it. That is mechanically, directly verifiable by reading this repository —
nothing outside it needs to be checked. Every other claim — every metric, date, client count,
product count, timeline entry, and biography statement — concerns a fact about the founder's
history or TMI's business that this repository cannot verify on its own, so it stays `"pending"`
regardless of how confidently it's worded in the UI, and regardless of any `evidenceLevel:
"documented"` label a content file might carry (see `proof-engineering-systems-builder` in
`docs/CLAIMS_REVIEW.md` for a case where the source data's own label doesn't meet this bar).

## Enforcement is intentionally off

`ownerDecision` values do **not** currently gate the build. The postbuild guard's claims-aware
extension (see `scripts/postbuild-guard.mjs` and the "Claims-registry audit" section it prints)
only **reports** — it cannot fail a build over a pending or unregistered claim. This is
deliberate: enforcement requires the owner to have actually completed the review in
`docs/CLAIMS_REVIEW.md` first. Turning on enforcement before that review is done would either (a)
fail every build immediately (40 of 41 claims are pending), or (b) require silently treating
"pending" as "fine," which defeats the point of a review gate.

**Future enforcement mode** (not implemented, described here so it doesn't require a content
migration when it is): once the owner has resolved every claim's `ownerDecision` in
`claims.registry.json` to `"approved"`, `"qualified"`, or `"removed"` (extending the current
`"pending"`/`"documented"` pair), a build flag (e.g. `CLAIMS_ENFORCE=true`) could make
`postbuild-guard.mjs` fail the build if: any `"removed"` claim's `exactText` still appears in
`dist/`, any `"pending"` claim's `exactText` appears in a **production** (`PUBLIC_PREVIEW=false`)
build, or a registered claim's `exactText` no longer matches its actual rendered wording (content
drifted without the registry being updated). None of that is active yet — this pass only adds the
registry and the non-blocking audit report.

## How to keep the registry current

- Adding a new numeric/timeline/credential claim to any page: add an entry to
  `claims.registry.json` and a matching item to `docs/CLAIMS_REVIEW.md` in the same change.
  `ownerDecision` starts at `"pending"` unless it meets the `"documented"` bar above.
- Changing an existing claim's wording: treat it as removing the old entry and adding a new one
  (new `id` if the wording materially changed), not editing `exactText` in place — this keeps the
  audit trail honest about what changed and when, consistent with
  `docs/ecosystem-governance.md`'s "Claim-verification rules."
- Removing a claim from the site: remove its entry from both files, or mark it in a future
  `"removed"` state once enforcement mode exists.
