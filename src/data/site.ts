/**
 * Single canonical site config. Every page/component should read from here
 * rather than re-declaring the site name, domain, or default SEO copy.
 */

export const site = {
  name: "Alexander Mathai",
  legalName: "Alexander Mathai",
  tagline: "Founder-Operator, Texas Movement International",
  domain: "alexandermathai.com",
  url: "https://alexandermathai.com",
  locale: "en-US",
  // Conservative on residence per brief section 6 (About): use the
  // qualified regional phrase only, never a street-level claim.
  region: "Greater Chicago Area",
  foundedTmiYear: 2015,
} as const;

export const defaultSeo = {
  title: "Alexander Mathai — Founder-Operator, Texas Movement International",
  description:
    "Alexander Mathai builds owned systems — brand architecture, AI operations, web infrastructure, media, and commerce — for founders, brands, and performance-minded organizations. Founder & President of Texas Movement International since 2015.",
  ogImage: "/og/default.png",
} as const;

export const contact = {
  email: "hello@alexandermathai.com",
  formNote:
    "The form below routes inquiries for review. There is no automated booking system and no fixed response-time guarantee.",
} as const;

/**
 * Person schema data — used by structured-data JSON-LD. Only fields that are
 * directly supported by the brief's stated facts are included; nothing here
 * is invented (no jobTitle claims beyond what's given, no fabricated awards).
 */
export const personSchema = {
  name: "Alexander Mathai",
  url: site.url,
  jobTitle: "Founder & President, Texas Movement International",
  worksFor: "Texas Movement International",
  alumniOf: "Civil Engineering",
  description: defaultSeo.description,
} as const;

/**
 * Organization schema data for Texas Movement International. Included only
 * as the umbrella affiliation on the Person entity — TMI does not get a
 * standalone Organization page on this site, so no separate canonical URL
 * is asserted beyond the (unverified, see src/data/social.ts) umbrella site.
 */
export const organizationSchema = {
  name: "Texas Movement International",
  foundingDate: "2015",
} as const;

/** Analytics env keys — intentionally empty. See docs/site-operations.md. */
export const analytics = {
  plausibleDomain: import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN ?? "",
} as const;
