# Brand System

This is an independent visual system for Alexander Mathai's personal-founder
brand. It is not required to reuse the Texas Movement design-system tokens
verbatim — this is a distinct identity, even though the accessibility bar
matches.

## Palette

Dark, editorial, restrained. Defined as CSS custom properties in
`src/styles/global.css`.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#0b0c0e` | Page background |
| `--color-bg-raised` | `#131417` | Card / raised surfaces |
| `--color-text` | `#f3f2ee` | Primary text |
| `--color-text-muted` | `#a8a7a2` | Secondary text |
| `--color-border` | `#2a2b2f` | Hairlines, card borders |
| `--color-accent` | `#c9a24b` | Accent (eyebrows, links, CTA dot) |
| `--color-focus` | `#7fb4ff` | Focus-visible outline only |

Contrast was chosen for a dark, near-black background with warm off-white
text and a muted gold accent used sparingly (never for body copy).

## Type

- **Serif** (`Georgia`/system serif fallback stack) for headings — gives the
  founder voice an editorial, authoritative register.
- **Sans** (system UI stack) for body copy, navigation, and UI chrome —
  keeps long-form text easy to scan.

No webfonts are loaded. System font stacks keep the build dependency-free
and fast, and avoid a design decision (a specific licensed typeface) that
hasn't been given.

## Layout

- A single content column (`--measure: 40rem`) for body copy, a wider wrap
  (`68rem`) for section framing.
- Sections separated by hairline borders, generous vertical rhythm
  (`--space-5`/`--space-6`), no heavy imagery — the placeholder should read
  as considered, not decorated.
- "Areas of work" uses a responsive auto-fit card grid so it degrades
  cleanly at any width without a breakpoint audit.

## Components

- **Skip link** (`.skip-link`) — visually hidden until focused, jumps to
  `#main-content`.
- **Preview banner** — a small, accent-colored strip shown only when
  `PUBLIC_PREVIEW` is true, so nobody mistakes a preview build for the live
  site.
- **CTA badge** (`.cta-badge`) — an inert, dashed-border pill reading
  "Follow the build — coming soon". No `<form>`, no `href`, no click target
  that implies functionality. See `docs/LAUNCH_BLOCKERS.md`.

## What's intentionally absent

- No logo/wordmark beyond a plain serif text lockup — a real mark hasn't
  been supplied.
- No photography or illustration — none has been supplied, and a
  placeholder site shouldn't fabricate a visual identity around stock
  imagery.
- No social icons — no confirmed handles exist yet (see `CLAUDE.md`).
