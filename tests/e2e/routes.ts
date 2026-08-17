/** The production HTML routes this site builds. Kept as one shared list
 * so preview.spec.ts and production.spec.ts test the same surface — update
 * here if a route is added or removed. */
export const ROUTES = [
  "/",
  "/work",
  "/work/hero-footwear-product-system",
  "/work/sweat-boxing-growth-system",
  "/work/texas-movement-consulting-systems",
  "/work/texas-movement-media-distribution-system",
  "/work/tmi-digital-ecosystem",
  "/thesis",
  "/ecosystem",
  "/notes",
  "/notes/building-this-site-in-the-open",
  "/notes/ownership-beats-dependency",
  "/notes/performance-is-a-systems-problem",
  "/ledger",
  "/systems",
  "/about",
  "/contact",
  "/privacy",
  "/404",
] as const;

export const PRODUCTION_HOSTNAME = "alexandermathai.com";
