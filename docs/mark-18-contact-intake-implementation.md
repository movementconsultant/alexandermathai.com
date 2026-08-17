# Mark 18 — Contact Intake Worker & Content Architecture

Companion record for the Mark 18 brief ("Furnishing the House"). Covers the
`/contact` intake path on this repository (alexandermathai.com / AVM). The
sibling record for texasmovement.com lives at
`../../texasmovement.com/docs/mark-18-contact-intake-implementation.md`
(same governance basis, same Worker shape, TMI-specific values).

## What shipped

1. **`workers/contact-intake/`** — a standalone Cloudflare Worker (source
   code only, not deployed — see "What did not happen," below).
2. **`src/pages/contact.astro`** — wired to a real, gated fetch (the page
   and its client-side validation already existed; Mark 18 added the live
   submission branch, matching the plan already recorded in
   `docs/site-operations.md`).
3. **`src/content/artifacts/`** — a new MDX content collection with an
   index page and a per-item route, seeded with one placeholder entry.
4. `tsconfig.json` updated to exclude `workers/` from `astro check`
   (Worker code targets `@cloudflare/workers-types`, a different runtime
   than the Astro site).

## API contract — `workers/contact-intake/src/worker.ts`

Identical contract to the TMI Worker (see the sibling doc), with this
repo's own configuration values: `ALLOWED_ORIGIN = "https://alexandermathai.com"`,
`FROM_EMAIL = "intake@alexandermathai.com"`, `NOTIFY_EMAIL =
"movementconsultant@gmail.com"` — set in `workers/contact-intake/wrangler.toml`.

**Endpoint:** `POST /` (path is whatever the Worker is routed to).

**Request** — `Content-Type: application/json`:

```json
{
  "name": "string, required",
  "email": "string, required, must match a basic email pattern",
  "organization": "string, optional",
  "message": "string, required",
  "hp_confirm": "string, optional — honeypot; if non-empty, request is silently discarded and a fake 200 OK is returned"
}
```

Field length caps (excess truncated, not rejected): `name` 200, `email`
320, `organization` 200, `message` 5000. Control characters stripped from
every field before use.

**Responses:**

| Status | Body | Meaning |
|---|---|---|
| 200 | `{"ok": true}` | Delivered (or honeypot silently absorbed) |
| 400 | `{"ok": false, "error": "..."}` | Invalid JSON or failed validation |
| 403 | `{"ok": false, "error": "Origin not allowed."}` | `Origin` header didn't match `ALLOWED_ORIGIN` |
| 405 | `{"ok": false, "error": "Method not allowed."}` | Non-POST, non-OPTIONS request |
| 429 | `{"ok": false, "error": "Too many requests. Try again later."}` | Rate limit exceeded (only enforced if `RATE_LIMIT_KV` is bound) |
| 502 | `{"ok": false, "error": "Delivery failed. Try again shortly."}` | Resend API call failed or errored |

**CORS:** only `Origin: https://alexandermathai.com` receives an
`Access-Control-Allow-Origin` header.

**Delivery:** one HTML email via the Resend API, from `FROM_EMAIL` to
`NOTIFY_EMAIL`, `reply_to` set to the submitter's email. Body is
HTML-escaped field-by-field before interpolation.

**Rate limiting:** fixed-window, 5 requests / 10 minutes / IP, via an
optional `RATE_LIMIT_KV` binding. **Unbound by default — fails open** (logs
a warning, allows every request). Real rate limiting requires the owner to
provision the KV namespace (see the Worker's own `README.md`).

## Frontend wiring — `src/pages/contact.astro`

This repo's existing form already had accessible fields, client validation,
and a honeypot before Mark 18. What Mark 18 added:

```astro
const contactEndpoint = import.meta.env.PUBLIC_CONTACT_ENDPOINT ?? "";
```

```astro
<form
  id="contact-form"
  class="contact-form"
  novalidate
  data-contact-endpoint={contactEndpoint}
  onsubmit={contactEndpoint ? undefined : "return false;"}
>
```

The client script reads `form.dataset.contactEndpoint` (deliberately a
`data-*` attribute rather than `define:vars`, so the script keeps full
TypeScript processing instead of downgrading to `is:inline` — this repo's
`astro check` still reports 0 errors/0 warnings after this change, same as
before).

- **Unset (every build this repository runs today):** `contactEndpoint`
  resolves to `""`; the `onsubmit="return false;"` hardening stays active,
  and the submit handler's live-fetch branch is unreachable. No literal
  external `fetch()` target reaches `dist/` — confirmed by
  `tests/e2e/production.spec.ts`'s "no built JS bundle contains a fetch()
  call to an external URL" check, and by the "/contact stays inert with
  valid input" test, both still passing (46/46 preview, 28/28 production).
- **Set to a real deployed Worker URL:** `onsubmit` hardening is removed,
  and the submit handler POSTs the four fields as JSON, showing "Sending…"
  then a success or error status.

## Content schema — `artifacts` (this repo, AVM)

```ts
defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/artifacts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.enum([
        "AI", "Systems", "Brand", "Web Infrastructure", "Performance", "Commerce",
      ])).default([]),
      summary: z.string(),          // one-paragraph, restrained summary
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      coverImage: image().optional(),
      coverImageAlt: z.string().optional(),
    }),
});
```

**How to add an artifact:**

1. Add an `.mdx` file under `src/content/artifacts/`, e.g.
   `src/content/artifacts/my-artifact.mdx`. The filename (minus `.mdx`)
   becomes the URL slug at `/artifacts/<slug>`.
2. Frontmatter needs `title`, `date`, `summary`. Optional: `tags` (any of
   `AI`, `Systems`, `Brand`, `Web Infrastructure`, `Performance`,
   `Commerce`), `updatedDate`, `coverImage` (a relative path — the schema's
   `image()` helper validates and optimizes it), `coverImageAlt`.
3. `draft: true` keeps an artifact out of the production build entirely
   (same convention as `notes` and `work`) — use this while a piece is
   still being written, and log the gap in `docs/content-needed.md` if it's
   blocked on real information.
4. Write the body in MDX below the frontmatter. `/artifacts/[...slug].astro`
   renders it with the same "related by tag" section and Article/
   BreadcrumbList JSON-LD pattern already used by `notes/[slug].astro`.
5. Run `npm run build` — non-draft artifacts appear automatically at
   `/artifacts` (sorted newest-first) and at their own slug.

**Seed:** `src/content/artifacts/systems-over-tactics.mdx` — explicitly
labeled placeholder content ("Placeholder artifact — owner review
required"), `draft: false` so it's visible for review, but written to make
clear it's a template, not a real published piece.

**Distinguishing `/artifacts` from `/ledger` and `/systems`:** the
`/artifacts` index page explicitly contrasts itself with the telemetry
rails — artifacts are vetted, owner-reviewed pieces (subject to the full
G-M1–G-M8 governance chain), while `/ledger` and `/systems` are the
Raw-Telemetry-classified auto-pulled streams established in Marks 13–14.

## Guard rails (unchanged)

`scripts/postbuild-guard.mjs`'s pre-existing `EXTERNAL_FETCH_PATTERN` check
already covered this repo before Mark 18 — no guard code changed here. It
currently passes with 0 violations because `PUBLIC_CONTACT_ENDPOINT` is
unset in every build run in this environment. The moment the owner sets it
to a real Worker URL in production, this guard **will fail** until a
narrow, explicit exception is added for that confirmed URL — see
`docs/site-operations.md`, "Public-output guard."

## What did not happen, and why

- **No Cloudflare Worker was deployed.** This session has no Cloudflare
  account, dashboard, or API access. `workers/contact-intake/` is complete,
  typechecked source code (`npx tsc --noEmit` passes clean), ready to
  deploy via `wrangler deploy` once the owner runs it from their own
  machine/account.
- **No secret was created, stored, or requested.** `RESEND_API_KEY` is read
  only via `env.RESEND_API_KEY`; `wrangler.toml` documents `wrangler secret
  put RESEND_API_KEY` and contains no key material.
- **No KV namespace was created.** Rate limiting is disabled (fails open)
  until the owner runs `wrangler kv namespace create RATE_LIMIT_KV` and
  uncomments the binding.
- **`PUBLIC_CONTACT_ENDPOINT` was not set anywhere in this repository.**
  `/contact` stays fully inert by construction in every build this
  repository runs.
- **The public-output guard's exception was not added** — same reasoning
  as the TMI doc: adding it before a real endpoint exists would be an
  unused carve-out; add it in the same commit that sets a real
  `PUBLIC_CONTACT_ENDPOINT`.

## Deployment steps (owner-run, outside this session)

See `workers/contact-intake/README.md` for the full walkthrough. Summary:

1. `cd workers/contact-intake && npm install`
2. Sign up / log in to Resend (or your chosen provider), verify a sending
   domain, get an API key.
3. `npx wrangler login` (your own Cloudflare account)
4. `npx wrangler secret put RESEND_API_KEY` and paste the key when prompted
5. (Optional but recommended) `npx wrangler kv namespace create RATE_LIMIT_KV`,
   then uncomment and fill in the `[[kv_namespaces]]` block in `wrangler.toml`
6. `npx wrangler deploy`
7. Copy the deployed Worker's URL, set `PUBLIC_CONTACT_ENDPOINT` to it in
   Cloudflare Pages' production environment variables for this repo's site
8. Add the confirmed URL as an explicit exception to
   `EXTERNAL_FETCH_PATTERN`'s check in `scripts/postbuild-guard.mjs`, in the
   same commit/deploy that sets step 7's env var
9. Rebuild — `/contact` becomes live; the guard should still pass because
   of step 8's exception

## Governance basis

Same "Raw Telemetry" / build-discipline standard established across Marks
13–14, and the absolute constraints reaffirmed throughout this project: no
secrets ever created or requested, no deployment access assumed, no guard
weakened.
