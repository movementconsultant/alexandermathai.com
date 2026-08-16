/**
 * Centralized social / platform routing.
 *
 * Handles below are exactly as supplied in the rebuild brief by the site
 * owner. This build environment has no general web egress (verified: every
 * outbound host except a small infra allowlist returns EGRESS_BLOCKED, see
 * docs/rebuild-plan.md "Audit findings"), so none of these could be fetched
 * and confirmed live during this build.
 *
 * `url` is the platform's standard, deterministic profile-URL pattern applied
 * to the owner-given handle (never an invented handle). `verified` is false
 * across the board until a human confirms each destination resolves and is
 * the correct account. Treat `verified` as a release gate, not a UI toggle —
 * see docs/site-operations.md "Updating social URLs".
 */

export interface SocialLink {
  platform: string;
  handle: string;
  url: string;
  verified: boolean;
  /** Shown in the accessible label, e.g. "Alexander Mathai on LinkedIn" */
  context:
    "alexander" | "tmi" | "texas-movement-media" | "hero-footwear" | "texas-movement-performance";
}

export const socialLinks: SocialLink[] = [
  {
    platform: "LinkedIn",
    handle: "alexandermathai",
    url: "https://www.linkedin.com/in/alexandermathai",
    verified: false,
    context: "alexander",
  },
  {
    platform: "YouTube",
    handle: "texasmovementmedia",
    url: "https://www.youtube.com/@texasmovementmedia",
    verified: false,
    context: "texas-movement-media",
  },
  {
    platform: "YouTube",
    handle: "herofootwear",
    url: "https://www.youtube.com/@herofootwear",
    verified: false,
    context: "hero-footwear",
  },
  {
    platform: "YouTube",
    handle: "tmipresident",
    url: "https://www.youtube.com/@tmipresident",
    verified: false,
    context: "alexander",
  },
  {
    platform: "YouTube",
    handle: "texasmovementperformance",
    url: "https://www.youtube.com/@texasmovementperformance",
    verified: false,
    context: "texas-movement-performance",
  },
  {
    platform: "Instagram",
    handle: "alexanderofnazareth",
    url: "https://www.instagram.com/alexanderofnazareth",
    verified: false,
    context: "alexander",
  },
  {
    platform: "Instagram",
    handle: "herofootwearusa",
    url: "https://www.instagram.com/herofootwearusa",
    verified: false,
    context: "hero-footwear",
  },
  {
    platform: "Instagram",
    handle: "tmmediausa",
    url: "https://www.instagram.com/tmmediausa",
    verified: false,
    context: "texas-movement-media",
  },
  {
    platform: "TikTok",
    handle: "alexandervmathai",
    url: "https://www.tiktok.com/@alexandervmathai",
    verified: false,
    context: "alexander",
  },
  {
    platform: "TikTok",
    handle: "texasmovementmedia",
    url: "https://www.tiktok.com/@texasmovementmedia",
    verified: false,
    context: "texas-movement-media",
  },
  {
    platform: "TikTok",
    handle: "herofootwear",
    url: "https://www.tiktok.com/@herofootwear",
    verified: false,
    context: "hero-footwear",
  },
];

/** Alexander's personal-profile subset, used in the header/footer utility nav. */
export const founderSocialLinks = socialLinks.filter((l) => l.context === "alexander");

/** Texas Movement International umbrella site. Also unverified in this environment. */
export const tmiUrl = "https://texasmovement.com";
export const tmiUrlVerified = false;

export function socialLinksFor(context: SocialLink["context"]): SocialLink[] {
  return socialLinks.filter((l) => l.context === context);
}
