# Mark 2 release audit

Audit performed fresh against actual repository state (not carried forward from
assumption), covering `alexandermathai.com` in depth and the rest of the TMI
ecosystem at PR/status level. Nothing in this document was fixed silently —
where a fix was made, it's called out explicitly and is a separate, reviewable
commit.

## 1. Branch, commit, stack, deploy target

- **Repo:** `movementconsultant/alexandermathai.com`
- **Branch:** `claude/founder-control-tower-rebuild` (off `main`, bootstrap-only)
- **Commit at audit start:** `aad3e73` (the prior full rebuild)
- **Commit after this audit's fixes:** `acc8c0f`
- **Stack:** Astro 7, TypeScript strict, Content Layer API collections, static
  output (`output: "static"`), no adapter
- **Deploy target:** Cloudflare Pages, per `wrangler.toml` — not connected, no
  credentials in this environment
- **PR:** [#2](https://github.com/movementconsultant/alexandermathai.com/pull/2),
  open, draft, unmerged. **`claude/alexander-mathai-placeholder` / PR #1 is a
  separate, frozen, untouched fallback** — confirmed via API before and after
  this audit: same head SHA (`f0fc58a`) throughout.

## 2. Production route inventory

`/`, `/work`, `/work/[slug]` (5 published), `/thesis`, `/ecosystem`, `/notes`,
`/notes/[slug]` (3 published), `/about`, `/contact`, `/privacy`, `/404`,
`/notes.xml`, `/sitemap-index.xml`, `/robots.txt` (now a build-time endpoint,
see §3). 17 pages generated at build time. `/now` was not built (no usable
content source), matching the brief's own conditional.

## 3. Draft-content exclusion

Content collections use `draft: true`. `getCollection()` calls across the
codebase filter by default per Astro's collection semantics; spot-checked
`work/index.astro`, `notes/index.astro`, and `Footer.astro`'s ecosystem list —
none render a draft entry. RSS (`notes.xml`) and sitemap (`@astrojs/sitemap`)
both derive from the same filtered collection queries, so drafts don't leak
into either. **Not independently re-verified**: navigation/related-content
modules beyond the index pages — low risk given the pattern is consistent
everywhere it was checked, but flagged as unverified rather than claimed.

## 4. Ecosystem / domain inventory

| Division | Intended hostname | Current destination | Current status | Recommendation | Verification needed | Launch blocker |
|---|---|---|---|---|---|---|
| TMI Hub | texasmovement.com | Draft PR #1, not deployed | Building (per `ECOSYSTEM_MAP`) | **Building** | Hosting/DNS connection | No host connected; legal/org data TBD |
| Founder | alexandermathai.com | Draft PR #2 (this repo) | Building | **Building** → Route once verified | Social URLs, photos, contact backend | See §7/§8 below |
| Consulting | consulting.texasmovement.com | Draft PR #1, fully built, not deployed | Building | **Building** | `consulting@` inbox | Inbox unverified; testimonials form re-verification needed |
| Media | media.texasmovement.com | Draft PR #2, fully built, not deployed | Building | **Building** (its own `/series` sub-route is `Route`-equivalent once live — see note) | `media@` inbox, resolve 2 conflicting legacy addresses | Inbox unverified |
| HERO | hero.texasmovement.com | **No repo exists or is accessible** | N/A | **Reserve** | Locate/create repo, or confirm Shopify-only per manifest | No repo; also Shopify-platform per `@tmi/constants`, not an Astro target regardless |
| Performance | performance.texasmovement.com | Draft PR #1, minimal shell, not deployed | Building | **Building** | Legal/performance-claims review (legacy content quarantined) | Review needed before any real copy ships |
| Distribution | distribution.texasmovement.com | Draft PR #1, minimal shell, not deployed | Building | **Building** | Legal review (legacy IP-enforcement claims quarantined) | Review needed |
| Social | social.texasmovement.com | Draft PR #1, minimal shell, not deployed | Building | **Building** | Legal review (legacy events/"Gather" framing quarantined) | Review needed |
| FounderLink | founderlink.texasmovement.com | Draft PR #1, minimal shell, not deployed | Private | **Reserve** | Routing/referral mandate review | Private by design — no CTA, no intake |
| Health | health.texasmovement.com | Draft PR #1, minimal shell, not deployed | Private | **Reserve** | Heavy legal/medical-compliance review (legacy medical claims + a live mailto quarantined) | Highest-sensitivity review in the ecosystem |
| Reparations | reparations.texasmovement.com | Draft PR #1, minimal shell, not deployed | Private | **Reserve** | Legal/reputational review (legacy "reparative capital" framework quarantined) | Highest-sensitivity review, tied with Health |

Note on Media's `/series`: it links to real, presumably-live external YouTube/
social channels (not an internal, undeployed TMI subdomain), so once
`media.texasmovement.com` itself is deployed, `/series` behaves like a `Route`
even though the property overall is `Building`. Not a launch blocker, just a
nuance worth naming in `docs/ecosystem-governance.md`.

**Public rule check** (every live hostname must deliver, redirect, or show an
honest status with a next action): none of the 10 division hostnames are
actually live yet, so the rule doesn't yet bind — but every shell already
satisfies it structurally (honest status surface, no dead ends) for the day
one of them does go live.

## 5. Owner-confirmation-required claims (this repo)

Every specific figure below came directly from the owner's own brief, used as
given per governance §9 — none were independently verified, and none should
be treated as confirmed by this audit:
- TMI founded 2015
- 2.1M+ cumulative media views
- 150+ historical consulting clients, "including professional athletes and
  Fortune 500 executives"
- SWEAT: 0→140 members in 9 months, 85+ retained past 3 months, ~8/10
  walk-in close rate
- HERO: three product generations, 35+ products
- Timeline dates in `/about` (2006–2012 engineering education through
  2023–present AI systems translation)
- Region: "Greater Chicago Area"

## 6. Social URL verification state

All 11 entries in `src/data/social.ts` are `verified: false`. This sandbox has
no general web egress — confirmed by a failed proxy check to an unrelated
infra host during the original build, not re-tested here since the constraint
is environmental, not code-level. URLs are the platform's standard pattern
applied to the owner-given handle, never invented. **As of this audit, none of
these render as live links anywhere** (see §7, finding 3) — a change from the
prior build, which rendered them all live regardless of the flag.

## 7. Findings from independent verification (the actual audit work)

The prior rebuild's own QA claimed "manual link/contrast/a11y audit... two
token colors adjusted to pass WCAG AA" and implied `verified: false` was
enforced. Independently re-checking rather than trusting that claim surfaced
four real gaps, all fixed in commit `acc8c0f`:

1. **Blocker — default-indexable build.** `BaseLayout.astro` defaulted
   `noindex` to `false`; only `/404` explicitly opted in. Every other page
   would have shipped indexable with no preview/production gate at all, and
   `public/robots.txt` unconditionally allowed everything. **Fixed**: added
   the `PUBLIC_PREVIEW` convention used by every sibling repo (defaults to
   noindex-safe), converted `robots.txt` to a build-time endpoint that
   respects it. Verified in `dist/`: noindex present on all sampled pages by
   default; production mode (`PUBLIC_PREVIEW=false`) correctly flips both.

2. **Blocker — fabricated email address.** `hello@alexandermathai.com` was
   invented (never supplied by the owner, not "already explicitly public")
   and rendered as a live `mailto:` in three places (contact page, footer,
   privacy page), plus referenced in the contact form's own status messages.
   **Fixed**: removed everywhere; `contact.email` no longer exists as a
   field. Verified: zero `hello@alexandermathai` / `mailto:` hits in `dist/`.

3. **Blocker — `verified: false` not enforced.** `Footer.astro`, `about.astro`,
   and `DivisionCard.astro` rendered every social link, ecosystem channel
   link, and the `texasmovement.com` umbrella link as live `<a>` tags
   regardless of the verification flag. **Fixed**: gated to verified-only in
   Footer/about (currently renders nothing, since nothing is verified);
   division channels now render as plain text; `texasmovement.com` mentions
   render as plain text unless `tmiUrlVerified` is true. Verified: zero live
   `linkedin`/`instagram`/`tiktok`/`youtube`/`texasmovement.com` hrefs in
   `dist/`.

4. **High — contact-honesty gap.** The contact form's own privacy notice and
   the privacy page both stated submissions are "sent for review," which is
   false with no delivery backend connected. **Fixed**: copy corrected to
   state plainly the form isn't connected yet.

5. **High — two real WCAG AA contrast failures**, found via an independent
   axe-core scan (light theme): `--color-text-faint` at 4.33:1 (needs 4.5:1)
   and `--color-positive` at 4.46:1 on the "Publishing" status badge. Neither
   was caught by the prior pass's manual check. **Fixed**: both tokens
   darkened (5.68:1 and 5.55:1 respectively). Re-scanned all 9 routes in both
   light and dark themes after the fix: **0 violations**.

No other repos in the ecosystem were found to have the equivalent gaps —
their `postbuild-guard.mjs`/`check-public-output.mjs` scripts already
enforce no-mailto/no-TBD/no-unverified-social at the build-output level with
an automated gate, which is what this repo was missing. Recommending that
gate be added here too — see `docs/ecosystem-governance.md`.

## 8. Image/media inventory

- **Available:** none. No photo files exist in this build environment (chat
  image attachments aren't materialized to disk here, unlike an explicit file
  upload).
- **Missing:** founder portrait (`public/founder-portrait.jpg` expected path),
  founder action/work photo (`public/founder-action.jpg`), per-route OG
  images beyond the single default (`public/og/default.png`).
- **Recommendation:** ~1200×1500px portrait, edited to the site's muted
  precise visual direction; standard 1200×630px OG images per indexable
  route once real photography exists.

## 9. Contact path

- **Form UI:** complete — all specified fields, client-side validation,
  accessible errors, honeypot, three designed status states (success, error,
  pending-integration).
- **Delivery:** not implemented. No credentials/service exist in this
  environment.
- **Required to activate:** an email-delivery service (Resend, Formspree, a
  Cloudflare Pages Function, etc.), its endpoint URL set as
  `PUBLIC_CONTACT_ENDPOINT` at build time.
- **Safe temporary state (now default):** honest "not connected yet" message,
  no email/route implied. This is a genuine improvement over the prior
  build's fallback of inventing an email address to point to.

## 10. Launch risks, ranked

**Blocker:**
- No verified social/umbrella URLs anywhere in the ecosystem (all `false`).
- No contact-form delivery backend.
- No hosting/DNS connected for any of the 11 properties.
- Health and Reparations: real legacy legal/medical/reputational-sensitive
  content exists in `legacy/` and needs review before any expanded public
  copy — current shells are safe as-is (nothing from that content shipped).

**High:**
- HERO has no accessible repo — decide whether it needs one or stays
  Shopify-only per the manifest.
- Performance, Distribution, Social: legal review recommended before
  expanding beyond the current one-sentence shells.
- texasmovement.com's `ecosystem.ts` registry statuses still say `"live"` for
  several properties while `ECOSYSTEM_MAP` (the actual public presentation)
  says `"building"`/`"private"` — a known, previously-documented, deliberately
  unreconciled mismatch (see that repo's `docs/SITE_ARCHITECTURE.md`).

**Medium:**
- `@tmi/constants` remains vendored/frozen in the texasmovement.com family;
  the real `tmi-constants` package repo still doesn't exist (blocked earlier
  this session on a GitHub App permission error, unresolved).
- No automated a11y/output-guard script committed to this repo (checked
  manually this pass instead — see §7).

**Low:**
- Per-route OG images not yet built (single default used sitewide).
- `founderSocialLinks`/ecosystem "Connect" sections currently render nothing
  visible, by design, until a link is verified — cosmetically sparse but not
  incorrect.

## 11. Exact owner decisions required before production launch

1. Confirm or correct each of the 11 social/umbrella URLs in
   `src/data/social.ts` (this repo) — flip `verified: true` per entry once
   confirmed, nowhere else.
2. Choose and connect a contact-form delivery service; set
   `PUBLIC_CONTACT_ENDPOINT`.
3. Decide HERO's repo situation (locate/create vs. Shopify-only, no Astro
   shell).
4. Commission legal/compliance review for Health and Reparations
   specifically, before either goes beyond its current one-sentence shell.
5. Decide launch order across the 11 properties (see
   `docs/mark-2-launch-plan.md`).
6. Provide real photography, or approve shipping with the typographic hero
   treatment for launch.
7. Connect Cloudflare Pages (or chosen host) and DNS per property, one at a
   time, only after the above are resolved.
