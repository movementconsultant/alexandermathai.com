# Infrastructure owner checklist — legacy CNAME conflict risk

This is documentation only. **No file in `texasmovement.com` was modified, and no file was
deleted or added to `.gitignore` as part of writing this** — this session's constraints
explicitly prohibit touching that repository in this task. This lives in `alexandermathai.com`
(PR #2) because that's the repository this task authorized changes to; it applies to both hub
repos' eventual production launch and is recorded here so it isn't lost.

## Where the CNAME exists

- **Repository**: `movementconsultant/texasmovement.com`
- **Path**: `public/CNAME`
- **Content**: `texasmovement.com` (a single line, the bare apex domain)
- **Branch**: `claude/texas-movement-rebuild-pq14fo` (the current release-candidate branch), tracked
  since the repository's initial commit history — this is not a new addition, it has been present
  throughout this project's work on that repo.
- Because it lives under `public/`, Astro copies it verbatim into `dist/CNAME` on every build —
  confirmed present in that repo's own build output.

`alexandermathai.com` (this repo) has **no equivalent `CNAME` file anywhere** — checked explicitly
this session; that repo is not affected by this specific risk.

## The known potential conflict

A `CNAME` file at the root of a static site's build output is the file GitHub Pages uses to bind
a custom domain to a GitHub Pages deployment. If GitHub Pages is (or ever becomes) enabled for
`movementconsultant/texasmovement.com` with this file present, GitHub Pages will attempt to serve
`texasmovement.com` from that platform — independently of, and in conflict with, a Cloudflare
Pages custom-domain binding for the same hostname. Two platforms claiming DNS/serving authority
over the same domain produces unpredictable results (whichever one currently holds the DNS record
wins, but certificate provisioning, redirects, or a future accidental GitHub Pages enable could
silently break or redirect production traffic away from the intended Cloudflare Pages deployment).

This risk is **not currently active or confirmed** — it depends entirely on whether GitHub Pages
happens to be enabled for that repository right now, which this session cannot check (no
dashboard access). It is a real risk to verify before launch, not a diagnosed problem.

## Exact owner dashboard checks needed

1. **GitHub Pages**: open `https://github.com/movementconsultant/texasmovement.com/settings/pages`
   and confirm the "Build and deployment" source. If it shows anything other than "None" /
   disabled, GitHub Pages is currently live for this repo and is a direct conflict with the
   intended Cloudflare Pages deployment — resolve this before binding `texasmovement.com` in
   Cloudflare.
2. **Cloudflare Pages**: in the `texasmovement` project's dashboard (see
   `docs/mark-2-production-release-report.md` for the exact project reference discovered this
   session), check Custom Domains for `texasmovement.com` — confirm whether it's already bound,
   and if so, whether DNS currently resolves to Cloudflare or to GitHub Pages' IP/CNAME targets.
3. **DNS**: whoever controls the `texasmovement.com` domain's DNS records should confirm what the
   apex `A`/`ALIAS` and any `CNAME` records currently point to, independent of what either
   platform's dashboard claims — DNS is the actual source of truth for which platform serves
   traffic.

## Decision paths

- **Preserve** — if GitHub Pages is confirmed disabled and DNS is confirmed pointed at Cloudflare
  (or is not yet configured at all), the `public/CNAME` file is inert and can be left exactly as
  it is. No action needed; it does nothing on a Cloudflare Pages deployment.
- **Remove** — if GitHub Pages is confirmed disabled and will stay disabled, the file could be
  deleted as unnecessary legacy artifact. This is a separate, explicit decision — not made in this
  pass, and not appropriate to make from this session per the task's constraints (`Do not delete
public/CNAME`, `Do not add it to .gitignore`).
- **Replace** — if GitHub Pages is intentionally the chosen host for `texasmovement.com` instead
  of Cloudflare Pages (a real, if currently undocumented, possibility this session cannot rule
  out), the file should stay and a Cloudflare Pages custom-domain binding should NOT be attempted
  for that hostname — the two are mutually exclusive hosting choices for a given domain via
  DNS/CNAME record singularity, not a resolvable coexistence.

**Deletion, or any other change to this file, requires a separate explicit approval after the
dashboard state above is actually confirmed** — not assumed, not inferred from the absence of
mentions elsewhere in this project's documentation. Nothing in this checklist authorizes any
action beyond recording what needs to be checked and by whom.
