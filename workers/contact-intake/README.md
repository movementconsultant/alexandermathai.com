# Contact Intake Worker — alexandermathai.com

Standalone Cloudflare Worker for the `/contact` form. **Not deployed by any automated session** —
no Cloudflare account or dashboard access exists in the environment this was written in. This is
source code only, for you to review and deploy yourself.

## What it does

Accepts `POST` with JSON `{ name, email, organization?, message, hp_confirm? }`, validates and
sanitizes every field (length caps, email format, control-character stripping), checks a per-IP
rate limit, formats a plain HTML email, and sends it via [Resend](https://resend.com) to
`NOTIFY_EMAIL`. See `src/worker.ts` for the full implementation — it's short and worth reading
end to end before deploying.

## Deployment steps

1. `cd workers/contact-intake && npm install` — installs `wrangler` and TypeScript types for this
   Worker only; does not touch the main site's `node_modules` or lockfile.
2. `npx wrangler login` — authenticates with your own Cloudflare account.
3. **Verify a sending domain in Resend** (or swap the `sendEmail()` call in `src/worker.ts` for
   SendGrid/Mailchannels if you prefer — the task brief named all three as acceptable). Resend
   requires a verified domain before it will deliver to an arbitrary destination address; without
   this step, email sending will fail even with a valid API key.
4. `npx wrangler secret put RESEND_API_KEY` — paste your Resend API key when prompted. **Never**
   put this in `wrangler.toml` or any committed file.
5. Review and edit `wrangler.toml`'s `[vars]` block: `ALLOWED_ORIGIN`, `NOTIFY_EMAIL`, `FROM_EMAIL`.
6. **Rate limiting** (recommended before going live — see below): `npx wrangler kv namespace create
   RATE_LIMIT_KV`, then uncomment and fill in the `[[kv_namespaces]]` block in `wrangler.toml` with
   the id it prints.
7. `npm run deploy` (or `npx wrangler deploy`) — publishes the Worker and prints its URL
   (`https://avm-contact-intake.<your-subdomain>.workers.dev` by default, or your configured route).
8. Take the printed URL and set it as `PUBLIC_CONTACT_ENDPOINT` in the **main site's** Cloudflare
   Pages production environment variables (a separate project from this Worker).
9. **Required follow-up in the main site repo, not this Worker**: `scripts/postbuild-guard.mjs`'s
   `EXTERNAL_FETCH_PATTERN` check will fail the site's build once `PUBLIC_CONTACT_ENDPOINT` is set
   to a real URL (by design — see that script's own header comment). You'll need to add a narrow,
   explicit exception for your confirmed Worker URL before the site build passes with a live
   endpoint configured. This was deliberately not done in Mark 18 — see
   `docs/mark-18-contact-intake-implementation.md` in the site repo for why.

## Rate limiting

The Worker checks `RATE_LIMIT_KV` if bound (step 6 above) — 5 requests per IP per 10-minute window.
**If you skip step 6, the Worker still runs correctly but performs no rate limiting at all** (it
"fails open" — see the `checkRateLimit()` function's own comment). This isn't a hidden gap: real,
distributed rate limiting on Cloudflare Workers requires either a KV namespace (what this code
uses) or a Durable Object, both of which must be provisioned in your own Cloudflare account —
nothing that can be created without dashboard/API access.

## Testing before going live

`npm run dev` runs the Worker locally via `wrangler dev` against a `.dev.vars` file (create one,
git-ignored, with `RESEND_API_KEY=...`) — this lets you `curl` the local endpoint and confirm
validation/CORS/rate-limiting behave before touching production secrets.

## What was and wasn't verified this pass

- `npm run typecheck` (via this directory's own `tsconfig.json`, isolated from the main site's) —
  confirm this passes before deploying.
- **Not verified**: an actual Resend delivery, a real KV-backed rate limit under load, or the
  Worker running on real Cloudflare infrastructure. None of that is possible without deploying,
  which requires your own account.
