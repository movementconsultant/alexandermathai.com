import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Evidence level is an internal governance field (see docs/site-operations.md
 * and section 9 of the rebuild brief). It is never rendered verbatim as
 * user-facing legalese — it exists so page templates can choose careful,
 * defensible language and so drafts never leak into production.
 *
 *  - documented        verifiable in this repository or a linked, public source
 *  - reported-by-founder  a fact as stated directly by Alexander Mathai about
 *                      his own business/history; used as given, not invented
 *  - in-development    forward-looking / not yet operating at claimed scale
 */
const evidenceLevel = z.enum(["documented", "reported-by-founder", "in-development"]);

const statusEnum = z.enum([
  "operating",
  "available",
  "publishing",
  "building",
  "in-development",
  "select-engagements",
  "archived",
]);

const workCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().describe("One-line outcome or project premise"),
      division: z
        .enum([
          "tmi-ecosystem",
          "texas-movement-consulting",
          "texas-movement-media",
          "hero-footwear",
          "texas-movement-performance",
          "sweat",
          "independent",
        ])
        .describe("Which ecosystem division this system brief belongs to"),
      categories: z
        .array(
          z.enum([
            "ai-systems",
            "brand-architecture",
            "web-infrastructure",
            "media",
            "commerce",
            "performance",
            "operations",
          ]),
        )
        .min(1),
      evidenceLevel,
      role: z.string().optional(),
      constraint: z.string().optional().describe("The problem/constraint being solved"),
      systemArchitecture: z.string().optional(),
      deliverables: z.array(z.string()).default([]),
      outcome: z.string().optional().describe("Evidence / outcome, stated conservatively"),
      whatChanged: z.string().optional(),
      relatedNoteSlug: z.string().optional(),
      relatedEcosystemSlug: z.string().optional(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      coverImage: image().optional(),
      coverImageAlt: z.string().optional(),
    }),
});

const notesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      type: z.enum(["field-note", "build-log", "system-brief", "essay", "media-note"]),
      tags: z
        .array(
          z.enum([
            "systems",
            "ai",
            "web-infrastructure",
            "brand",
            "performance",
            "media",
            "commerce",
            "founder-operations",
          ]),
        )
        .default([]),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      canonicalUrl: z.string().url().optional(),
      relatedWorkSlug: z.string().optional(),
      relatedEcosystemSlug: z.string().optional(),
      featuredImage: image().optional(),
      featuredImageAlt: z.string().optional(),
    }),
});

/**
 * Vetted Artifacts — deep-dive, owner-reviewed case studies and systems
 * essays. Distinct from the Ledger/Live Systems telemetry rails
 * (src/lib/ledger.ts, src/lib/liveSystems.ts): those are automatically
 * retrieved, unreviewed "Raw Telemetry" per the Mark 13/14 governance
 * decision; every entry in this collection is hand-authored and committed
 * directly by a human, exactly like `work` and `notes` — no fetch, no
 * telemetry exemption, no kill switch needed.
 */
const artifactsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/artifacts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z
        .array(z.enum(["AI", "Systems", "Brand", "Web Infrastructure", "Performance", "Commerce"]))
        .default([]),
      summary: z.string().describe("One-paragraph, restrained summary of the artifact"),
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      coverImage: image().optional(),
      coverImageAlt: z.string().optional(),
    }),
});

const ecosystemCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/ecosystem" }),
  schema: z.object({
    name: z.string(),
    mandate: z.string().describe("One-sentence mandate"),
    status: statusEnum,
    statusLabel: z.string().describe("Human-readable status shown in the UI"),
    relationshipToTmi: z.string(),
    externalUrl: z.string().url().optional(),
    internalRoute: z.string().optional(),
    channels: z
      .array(
        z.object({
          platform: z.string(),
          handle: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
    order: z.number().default(0),
    commercialPriority: z.enum(["highest", "high", "medium", "exploratory"]).optional(),
  }),
});

export const collections = {
  work: workCollection,
  notes: notesCollection,
  ecosystem: ecosystemCollection,
  artifacts: artifactsCollection,
};
