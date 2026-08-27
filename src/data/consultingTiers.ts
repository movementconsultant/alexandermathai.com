// src/data/consultingTiers.ts
//
// Mark 29 — single source of truth for the three Consulting pricing tiers
// on this site. Per the owner's explicit Mark 29 decision, Texas Movement
// Consulting is one practice with one set of pricing tiers and one Stripe
// checkout — not a separate AVM-branded commercial offering. This file is
// a duplicate of texasmovement.com's own src/lib/commerce/consultingTiers.ts
// (separate codebases, no shared package between them) holding the exact
// same tier names/ids/price ranges, kept in sync by hand. See that file's
// own header comment, and this site's src/components/ui/PurchaseButton.astro,
// for the full implementation record — including the disclosed gap that
// real Stripe Price IDs were never provided to this build.

export interface ConsultingTier {
  id: "diagnostic" | "systems-build" | "retainer";
  name: string;
  priceRange: string;
}

export const CONSULTING_TIERS: readonly ConsultingTier[] = [
  { id: "diagnostic", name: "Diagnostic", priceRange: "$1,500–$3,000" },
  { id: "systems-build", name: "Systems Build", priceRange: "$12,000–$25,000" },
  { id: "retainer", name: "Operator Retainer", priceRange: "$2,500–$5,000/month" },
];
