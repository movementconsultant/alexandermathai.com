/**
 * Founder proof rail metrics. Every entry is a fact as stated by the site
 * owner about his own history (see rebuild brief section 1) — used as given,
 * not independently audited. `evidenceLevel` drives cautious phrasing in the
 * UI; it is not rendered as literal label text.
 */

export interface ProofMetric {
  value: string;
  label: string;
  context: string;
  evidenceLevel: "documented" | "reported-by-founder";
}

export const proofMetrics: ProofMetric[] = [
  {
    value: "2015",
    label: "Founded Texas Movement International",
    context: "Founder & President, operating continuously since founding.",
    evidenceLevel: "reported-by-founder",
  },
  {
    value: "2.1M+",
    label: "Media views across platforms",
    context: "Texas Movement Media, cumulative across YouTube, Instagram, and TikTok.",
    evidenceLevel: "reported-by-founder",
  },
  {
    value: "150+",
    label: "Consulting clients, historically",
    context:
      "Includes professional athletes and Fortune 500 executives, across the full consulting practice to date.",
    evidenceLevel: "reported-by-founder",
  },
  {
    value: "35+",
    label: "HERO products shipped",
    context:
      "Three footwear and apparel generations across fulfillment and ecommerce infrastructure.",
    evidenceLevel: "reported-by-founder",
  },
  {
    value: "1",
    label: "Engineering-trained systems builder",
    context:
      "Civil engineering education informs a first-principles, load-path approach to every system built.",
    evidenceLevel: "documented",
  },
];

export const proofDisclaimer = "Selected proof, not a complete résumé.";
