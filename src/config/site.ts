/**
 * Self-contained site configuration for alexandermathai.com.
 *
 * This is intentionally NOT a vendored copy of the shared `@tmi/constants`
 * package used by the texasmovement.com-family repos. Two independent
 * reasons:
 *
 * 1. That package's `ecosystem.ts` source carries organization-registry
 *    data and comments that have no place in a Person-identity site.
 * 2. The whole point of this site is a Person identity kept structurally
 *    separate from the Texas Movement Organization identity — pulling in
 *    the full multi-property org registry works against that separation.
 *
 * Keep this file small. Anything that isn't plain, already-approved fact
 * (name, canonical URL, the one approved TMI mention) does not belong here.
 */

/** Canonical production URL. Never changes based on preview state. */
export const SITE_URL = "https://alexandermathai.com";

export const SITE = {
  name: "Alexander Mathai",
  title: "Alexander Mathai",
  tagline:
    "Alexander Mathai builds high-performance digital ecosystems where brand, technology, AI, media, commerce, and disciplined execution become durable businesses.",
  description:
    "Alexander Mathai builds high-performance digital ecosystems where brand, technology, AI, media, commerce, and disciplined execution become durable businesses. The full site is in development.",
  locale: "en-US",
} as const;

/**
 * The one approved, contextual mention of Texas Movement International.
 * Plain proper noun and a live URL only — no entity/legal details, no
 * formation info, no address. Do not extend this object.
 */
export const TMI = {
  name: "Texas Movement International",
  url: "https://texasmovement.com",
} as const;

/**
 * Preview / noindex convention.
 *
 * Any value other than the literal string "false" for PUBLIC_PREVIEW is
 * treated as preview mode. This defaults to preview mode when the env var
 * is unset, per the launch checklist in docs/LAUNCH_BLOCKERS.md.
 */
export const IS_PREVIEW: boolean = import.meta.env?.PUBLIC_PREVIEW !== "false";

/** Build an absolute canonical URL for a given site-relative path. */
export function canonicalUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

/**
 * Areas of work — short, intentionally generic. This is a placeholder site;
 * no client names, numbers, dates, or product claims belong here unless
 * Alexander explicitly supplies them.
 */
export const AREAS_OF_WORK = [
  {
    title: "Digital systems",
    body: "Architecture and infrastructure built to hold up under real growth, not just launch day.",
  },
  {
    title: "Brand architecture",
    body: "The structural work beneath a brand — how its parts relate, and how a name earns durable trust over time.",
  },
  {
    title: "AI",
    body: "Applied, production-grade uses of AI in the systems that run a business, not experiments left in a demo.",
  },
  {
    title: "Performance",
    body: "Marketing and media measured by what actually compounds, not by what is easy to report.",
  },
  {
    title: "Culture",
    body: "The operating standards and habits that let disciplined execution scale past any one person.",
  },
  {
    title: "Building in public",
    body: "Sharing the process, not just the outcome — including the parts still under construction.",
  },
] as const;
