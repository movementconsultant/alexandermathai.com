# Ecosystem governance

The rules that keep the TMI ecosystem (alexandermathai.com, texasmovement.com, and every
division site under it) honest and consistent as it grows across repos, contributors, and time.
This document is normative — code and content across the ecosystem should conform to it, and
future changes to status, claims, or new properties should be checked against it before shipping.

## Status vocabulary

Every division in the ecosystem is exactly one of five statuses. These are the only valid values
— do not invent a sixth without updating this document and every schema that enforces it
(`src/content/ecosystem/*.md` frontmatter, `ECOSYSTEM_MAP` in texasmovement.com, and any vendored
`@tmi/constants` registry).

| Status      | Meaning                                                                                       | UI treatment                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Live**    | Deployed to its real production hostname, reachable now, content is current and truthful.      | Full clickable node, external link if off the current domain.                |
| **Route**   | No independent deployment (yet); the honest move is to route visitors to a live page elsewhere (usually `/contact` or a parent hub) rather than a dead end. | Clickable node, but the link goes to the routing target, not a bare domain.  |
| **Building**| A real repo and active work exist, but nothing is deployed to a public hostname yet.           | Visible status badge with a concrete, truthful description of the work in progress. No link to an external URL. |
| **Reserve** | A name/domain is reserved for future use; no repo or active build exists yet.                  | Inert text at most — no link, no claim of activity. May be omitted from the UI entirely. |
| **Archive** | Was once live or building, has been intentionally retired or paused indefinitely.              | Clearly labeled as archived if shown at all; never presented alongside active divisions without that label. |

This is a separate, deliberate layer from any legacy `PROPERTIES[key].status` values in a vendored
constants package (e.g. `operating`, `available`, `publishing`, `in-development`,
`select-engagements`) used by individual repos' own content schemas. Where both exist, the
presentation layer (this vocabulary) governs what's shown to the public; it does not silently
overwrite the underlying data-layer field, and a mismatch between the two should be treated as a
bug to fix, not ignored.

## Conditions required before a division may claim "Live"

A division may be marked **Live** and linked as such only when **all** of the following are true:

1. It has a real, deployed production hostname (not a preview/pages.dev URL, not localhost).
2. `PUBLIC_PREVIEW` (or the repo's equivalent gate) is confirmed set to disable preview mode in
   that specific production environment.
3. Every claim, metric, date, and biography statement rendered on that hostname has been
   explicitly confirmed by the site owner — not assumed, not carried over from an earlier draft
   without re-confirmation.
4. Every external/social link rendered as clickable has `verified: true` set only after a human
   has manually opened the URL and confirmed it resolves to the correct, owned account.
5. The contact path (if any) either actually works, or is described honestly as not yet
   connected — never implied to work when it doesn't.
6. The site has passed its validation gate (typecheck, build, and an accessibility scan) against
   the actual production build output, not just a development build.

If any one of these is not true, the division must be **Route**, **Building**, or **Reserve** —
never **Live** — regardless of how complete the code looks. Code-complete is not the same as
launch-ready; verification is a separate, required step (see `docs/mark-2-release-audit.md` for
why this distinction mattered in practice this pass).

## Domain / subdomain decision rules

- **Do not register or wire up a new subdomain just because a name is available or "sounds like
  it fits."** A subdomain gets built only when there is a concrete division with real content or
  product behind it.
- Prefer routing to an existing live page (a section of texasmovement.com or
  alexandermathai.com) over standing up a new subdomain for a division that doesn't yet justify
  its own site. A **Route** status is not a failure state — it's the honest choice when a full
  site isn't warranted yet.
- A new subdomain only graduates from **Building** to **Live** once it clears every condition in
  the previous section — the domain existing in DNS or in a registrar account is not evidence of
  readiness.
- Keep the umbrella site (texasmovement.com) as the single source of truth for which domains
  exist and what status each is in (`ECOSYSTEM_MAP`); don't let individual division sites make
  independent claims about siblings' status that could drift out of sync.

## How to add a new project without diluting the ecosystem

1. Confirm the project has a real owner-approved reason to exist as its own division, distinct
   from an existing one — not just a new idea that could be a page or section of an existing
   property.
2. Add it to the umbrella site's ecosystem map first, at **Reserve** or **Building** status
   (never **Live** at creation) with a truthful one-line description of what it is and isn't yet.
3. Only after real content/product exists should a dedicated repo be created — and only after
   that repo passes its own launch gate should the status move to **Live**.
4. Do not create placeholder repos, empty subdomains, or "coming soon" pages purely to reserve
   visual space in the ecosystem map — an absent or **Reserve**-labeled entry is more honest than
   a hollow live-looking one.
5. Every new division must use the same governance primitives as the rest of the ecosystem: a
   `PUBLIC_PREVIEW` gate, a `verified` flag pattern for any external/social links, and the same
   five-value status vocabulary above — don't invent a parallel system per repo.

## Claim-verification rules

- No metric, date, client count, testimonial, award, press mention, or biographical detail ships
  in production copy unless it was explicitly supplied or confirmed by the site owner. Plausible
  is not the same as confirmed.
- When a claim is uncertain, the default is **exclusion**, not softened language — don't hedge a
  fabricated number into vague copy; leave it out and log it as a decision needed (see
  `docs/content-needed.md` for the pattern already in use in this repo, and replicate it in other
  repos that don't yet have an equivalent file).
- Claims that were confirmed once do not stay confirmed forever if the underlying fact could have
  changed (a "150+ clients" count, a cumulative view count) — treat time-sensitive claims as
  needing periodic reconfirmation, not one-time sign-off.
- Any change to a previously confirmed claim (a new number, a corrected date) must be traceable —
  prefer a commit message or doc note over a silent edit, so a future audit can tell what changed
  and why.

## Content draft / publication rules

- Every content collection in every repo must support a `draft: true` (or equivalent) field that
  excludes the entry from: the rendered route, any index/listing page, related-content surfaces,
  RSS/Atom feeds, the sitemap, and structured data (JSON-LD) — all five surfaces, not just the
  obvious one. A draft that's excluded from its own page but still appears in an RSS feed is not
  actually excluded.
- Verify draft-exclusion whenever a new content surface is added (a new feed, a new "related"
  widget) — it's a common place for a leak to slip in silently, as confirmed by the explicit
  draft-exclusion verification step in the release-audit process.
- Never use lorem ipsum, placeholder client names, or invented example content as a stand-in for
  missing real content, even temporarily — use a `draft: true` entry with real (if incomplete)
  information, or omit the entry until real content exists.

## Social-link verification rules

- Every social/external URL in every repo carries a `verified: boolean` field, defaulting to
  `false`. This is not decorative — every component that renders a social/external link must
  actually check this flag and omit or de-link the URL when `false`, not just store it as
  metadata. (This exact gap — data storing `verified: false` while components rendered the link
  anyway — was found and fixed across four components in this repo during the Mark 2 audit; treat
  it as the canonical failure mode to check for in every repo.)
- Flipping `verified: true` requires a human to have manually opened the URL and confirmed it
  resolves to the correct, currently-owned account. An agent without live web access must never
  set `verified: true` on its own judgment — leave it `false` and flag it for the owner.
- When a link is unverified, the correct UI treatment is plain text (the name/platform, not a
  link) or omission of that item entirely if it's the only item in a list — never a dead `href`
  and never a fabricated placeholder URL.
- Re-verify social links periodically (recommended: before each major release) — accounts get
  renamed, deleted, or compromised, and a stale `verified: true` is worse than an honest
  `verified: false`.
