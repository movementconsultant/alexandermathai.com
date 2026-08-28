# Mark 13 — AVM Founder Systems Archive (Visual System)

A coordinated, dark-first visual-system pass across texasmovement.com (TMI)
and alexandermathai.com (AVM). This document covers AVM's side. See the
sibling doc in the TMI repo (`docs/mark-13-tmi-future-firm-operating-console.md`)
for TMI's side, and `docs/internal/mark-13-operating-console-vs-founder-archive-decision-record.md`
(TMI repo) for the cross-property decision record.

**This is a visual-system pass only.** No routes, content, founder claims,
social links, external feeds, or new public modules were added. No data or
markup changed — every route, component prop, and test assertion is
identical to before this pass; only `src/styles/tokens.css` changed.

## Why this doc is short

Before starting any edit, this repo's existing design system
(`src/styles/tokens.css`, `src/styles/global.css`, and every component —
zero hardcoded colors found outside `tokens.css` across the whole
`src/pages`/`src/components` tree) was inspected against the Mark 13 brief's
"Founder Systems Archive" requirements. It already satisfies nearly all of
them, out of the box:

- **Dark-first with an equal-quality light theme** — `color-scheme: dark`
  by default, `prefers-color-scheme`-aware, plus an explicit `[data-theme]`
  toggle (`ThemeToggle.astro`) — more sophisticated than what Mark 13 asked
  for, not less.
- **Editorial, human, reflective identity distinct from an operating
  console** — headings already use a serif display stack (`--font-display`:
  "Iowan Old Style"/"Sitka Text"/Georgia), not a grotesk/mono system-index
  face. Body text uses a generous `--measure` (38rem) reading width and a
  three-tier text-color system (`--color-text` / `--color-text-muted` /
  `--color-text-faint`) already tuned for long-form reading.
  contrast documented and audited in `docs/mark-2-release-audit.md`.
- **Restrained, single, meaningfully-scarce accent** — `--color-accent`
  (orange), used for the focus ring, primary buttons, the eyebrow marker,
  and nothing else. Status is already communicated as text (`.status`'s
  `role="status"` + visible label), never by the accent color alone
  (`StatusBadge.astro`'s own doc comment cites WCAG 1.4.1 explicitly).
- **Modest, disciplined structure** — `--radius-sm: 3px` / `--radius-md:
  6px` (already crisper than TMI's original 12–16px, pre-Mark-13), hairline
  borders (`--border-hairline`), no glassmorphism, no gradients, no
  every-element-card layout.
- **No telemetry/dashboard/fake-status visuals anywhere** — the existing
  `/ledger` and `/systems` rails (Mark 13's *earlier*, differently-numbered
  telemetry pass — see `docs/mark-13-telemetry-rails-implementation.md`)
  already carry their own strict Ticker Tape Guardrails and were **not**
  touched by this pass.

Given that, redesigning AVM's already-correct, already-tested system to
chase a bigger visual diff would have added risk (74 passing e2e checks,
the claims/social-domain guards, the fallback machinery) without making the
result any more "Founder Systems Archive" than it already is — and would
have worked directly against the brief's own rule that AVM must never be
made to resemble a cloned TMI dashboard. So this pass is deliberately
narrow: one additive token layer, zero component changes.

## What changed

`src/styles/tokens.css` — a new `--ff-*` semantic alias block added to the
existing `:root` token declaration (see full list in the JSON companion
doc). Every alias points at an **existing** AVM token via `var(...)`, so
the light-theme override block and the `[data-theme]` toggle override
block (both already in this file) apply to the aliases automatically —
nothing needed to be duplicated into those blocks.

### The one deliberate deviation from the shared token vocabulary

The Mark 13 brief's suggested shared palette gives `--ff-accent-signal` a
literal green (`#00ff94`), matching TMI's new accent. AVM's alias instead
points at **AVM's own existing accent** (`var(--color-accent)`, orange in
both themes) — see the in-code comment in `tokens.css` for the full
reasoning, in short: giving both properties the literal same accent hue
would move them *toward* looking like the same brand, directly working
against this pass's own non-negotiable rule that "AVM must never be
visually or semantically collapsed into a TMI corporate route." The shared
vocabulary is the **role** of the token (one restrained, semantically-scarce
accent, reserved for focus/status/markers) — not a literal shared hex.
`--ff-focus-ring` follows the same reasoning and already works correctly
with zero other change, since AVM's focus ring was already its own accent
color.

## Property-specific interpretation

AVM is the founder/editorial authority layer: reading-first, archival,
human. Nothing in this pass added panel density, card-grid layouts, or any
operating-console framing to AVM — its serif headings, wide prose measure,
and sparse accent usage already deliver exactly that, and Mark 13
deliberately left them alone rather than making AVM's presentation "more
like TMI's" for the sake of a bigger diff.

## Tokens added/mapped and actual values used

All twelve `--ff-*` names from the shared vocabulary were added, as
aliases (not new literal values) onto AVM's existing tokens:

| `--ff-*` alias | Points at | Resolves to (dark) | Resolves to (light) |
|---|---|---|---|
| `--ff-bg-base` | `--color-bg` | `#0b0c0d` | `#f6f4ee` |
| `--ff-bg-panel` | `--color-bg-raised` | `#141517` | `#efece3` |
| `--ff-bg-panel-subtle` | `--color-surface` | `#1b1d20` | `#e9e5db` |
| `--ff-text-primary` | `--color-text` | `#eeece6` | `#17181a` |
| `--ff-text-secondary` | `--color-text-muted` | `#a6a9ad` | `#4d4f52` |
| `--ff-text-muted` | `--color-text-faint` | `#82868b` | `#5a5c5e` |
| `--ff-border-structural` | `--color-border` | `#2c2f33` | `#d3cfc3` |
| `--ff-border-emphasis` | `--color-border-strong` | `#3d4147` | `#b9b3a3` |
| `--ff-accent-signal` | `--color-accent` (see deviation above) | `#ff5a1f` | `#ad350e` |
| `--ff-accent-signal-muted` | `color-mix(in srgb, var(--color-accent) 16%, transparent)` | 16% orange tint | 16% orange tint |
| `--ff-focus-ring` | `--color-focus` | `#ff5a1f` | `#ad350e` |
| `--ff-font-ui` | `--font-sans` | InterVariable stack | (same, theme-independent) |
| `--ff-font-mono` | `--font-mono` | ui-monospace stack | (same, theme-independent) |

AVM's own three-tier text system and dedicated `--color-surface` mid-tier
mapped onto the shared vocabulary's three text/three background tiers
cleanly — no gaps, no invented values.

## Typography strategy

No font files, `@font-face` rules, or new `<link>` tags added, removed, or
changed. `--ff-font-ui`/`--ff-font-mono` alias AVM's existing local/system
stacks exactly as they already were.

## Routes/components styled

None beyond the token file itself — `src/styles/tokens.css` only. No page,
layout, or component was edited.

## Accessibility / contrast / focus / reduced-motion decisions

Unaffected by construction: every `--ff-*` value is a `var()` reference to
an already-audited existing token (see `docs/mark-2-release-audit.md` for
the original contrast audit of `--color-*`), not a new literal color. The
full e2e suite (which includes route-reachability, noindex/canonical,
inert-contact-form, and no-external-fetch checks, though not a dedicated
axe-core pass) was re-run after the change with zero regressions — see
Validation below.

## Existing content, links, claims, classifications, source gates, and release controls preserved

- Claims registry, claims governance, and the founder-claims content model
  — untouched (no file in that path was opened for editing).
- `--color-*` values themselves — untouched; only new aliases were added
  alongside them.
- Social-domain guard (`scripts/postbuild-guard.mjs`'s known-platform-domain
  check) and `src/data/blocklist.json` — untouched.
- `/contact` inertness (`PUBLIC_CONTACT_ENDPOINT` gating) — untouched,
  re-verified passing by the e2e suite's "stays inert with valid input"
  checks.
- `PUBLIC_PREVIEW` noindex/canonical/sitemap gating — untouched, re-verified
  by both preview-mode and production-mode e2e runs.
- The frozen fallback (`claude/alexander-mathai-placeholder`, PR #1) — never
  opened, read, or touched; this pass worked entirely on
  `claude/mark-18-avm-furnishing` (PR #3), a separate, non-fallback branch.

## Visual elements deliberately excluded

Everything Part E of the brief excludes was already absent from AVM before
this pass and remains absent: no crypto/trading language or visuals, no
fake status/telemetry/counters/logs, no cyberpunk/hacking/glitch motifs, no
political or LA28/Olympic content, no new social links or feeds, no remote
fonts or third-party network requests. This pass added nothing that could
introduce any of these.

## Manual owner acceptance criteria

- [ ] Feels like a founder systems archive, not a TMI clone.
- [ ] Reading experience remains primary (serif headings, wide prose
      measure, whitespace).
- [ ] Dark visual system is related to TMI's (same structural language —
      near-black base, hairline borders, one restrained accent) but
      visibly softer and editorial, not panel-dense.
- [ ] No new founder claims, social links, external feeds, or influencer
      cues anywhere.

## Validation results

- `npx astro check` — 0 errors, 0 warnings (64 pre-existing hints,
  unchanged before/after this pass).
- `npm run test:e2e:preview` — **46/46 passed**, including the no-external-
  fetch bundle check and every route's noindex assertion.
- `npm run test:e2e:production` — **28/28 passed**, including the
  `/contact`-stays-inert checks and the Ledger/Live-Systems safe-degradation
  checks.
- Postbuild guard (`scripts/postbuild-guard.mjs`, runs as part of both e2e
  suites' build step) — 0 violations both times.
- Manual visual QA: full-page screenshots of `/`, `/notes`, `/ledger` taken
  in both light (`prefers-color-scheme: light`, the Playwright default) and
  dark (`colorScheme: "dark"` explicitly emulated) against the built
  `dist/` output, confirming the dark-first default renders correctly and
  no visual regression is present.

## Explicit non-actions

- No merge, deploy, push to `main`, or PR draft-status change.
- No route, content, founder claim, social link, external feed, embed,
  analytics, or conversion path added.
- No dependency, package.json, or lockfile change.
- No font file added, downloaded, or loaded from a new remote origin.
- No accessibility/test/guard/fallback behavior removed or weakened.
- No political, campaign, election, or LA28/Olympic content added.
- The frozen fallback branch/PR (`claude/alexander-mathai-placeholder`,
  PR #1) was never touched.
