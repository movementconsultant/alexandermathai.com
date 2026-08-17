#!/usr/bin/env node
/**
 * Postbuild guard.
 *
 * ALSO runs a non-blocking claims-registry audit (see runClaimsAudit below)
 * — it can never fail the build, only print a report. See
 * docs/claims-governance.md for why enforcement is intentionally off.
 *
 * Fails the build (non-zero exit) if the built dist/ output contains any of:
 *  - the literal string "TBD" or "__TBD__"
 *  - a `mailto:` link, or a bare email-address-shaped string
 *  - a link to a known social platform domain (every social/ecosystem URL in
 *    this build is currently `verified: false` in src/data/social.ts and
 *    should never render as a live href — see docs/ecosystem-governance.md)
 *  - evidence of a contact-form submission endpoint: a `fetch(...)` call
 *    targeting an absolute external URL, or a <form> with an external
 *    `action` — this build ships no owner-approved, verified delivery
 *    backend, so no such target should ever appear (see
 *    src/pages/contact.astro and docs/mark-2-launch-plan.md
 *    "Contact-form decision")
 *  - any reference to "lexmathai" (case-insensitive)
 *  - a missing noindex robots meta tag on an HTML page, while the build ran
 *    in preview mode (PUBLIC_PREVIEW !== "false")
 *
 * Equivalent in intent to scripts/postbuild-guard.mjs on the
 * claude/alexander-mathai-placeholder branch (PR #1), adapted for this
 * site's real content and its (deliberately inert) contact form — this
 * build legitimately ships a <form>, so unlike PR #1's guard this one does
 * not fail on <form> presence itself, only on evidence that it could
 * actually submit somewhere.
 *
 * Run automatically as the `postbuild` npm script — do not weaken any check
 * here to make a build pass; fix the underlying content instead.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const CLAIMS_REGISTRY_PATH = join(process.cwd(), "claims.registry.json");

const DIST_DIR = join(process.cwd(), "dist");
const TEXT_EXTENSIONS = new Set([".html", ".htm", ".xml", ".txt", ".json", ".css", ".js", ".svg"]);

const SOCIAL_DOMAINS = [
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "threads.net",
  "pinterest.com",
  "snapchat.com",
  "reddit.com",
  "bsky.app",
  "mastodon.social",
];

// Matches a plausible email address (word@word.tld), but not CSS at-rules
// like @font-face/@media (no literal "." immediately after the identifier).
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;

// A fetch() call whose first argument is a string literal pointing at an
// absolute external URL — the shape a live, unverified submission endpoint
// would take if one were ever wired up without review.
const EXTERNAL_FETCH_PATTERN = /fetch\s*\(\s*["'`]https?:\/\//i;

// A <form> element whose action attribute points off-site.
const EXTERNAL_FORM_ACTION_PATTERN = /<form\b[^>]*\baction\s*=\s*["']https?:\/\//i;

const isPreview = process.env.PUBLIC_PREVIEW !== "false";

/**
 * Scan a single file's text content for violations. Pure function, exported
 * for potential unit testing.
 *
 * @param {string} content
 * @param {{ ext: string; isPreview: boolean; label?: string }} opts
 * @returns {string[]} human-readable violation messages
 */
export function scanContent(content, { ext, isPreview: preview, label = "<file>" }) {
  /** @type {string[]} */
  const violations = [];

  if (content.includes("TBD")) {
    violations.push(`${label}: contains literal "TBD"`);
  }
  if (content.includes("__TBD__")) {
    violations.push(`${label}: contains literal "__TBD__"`);
  }

  if (content.includes("mailto:")) {
    violations.push(`${label}: contains a "mailto:" link`);
  }
  if (EMAIL_PATTERN.test(content)) {
    violations.push(`${label}: contains a bare email-address-shaped string`);
  }

  for (const domain of SOCIAL_DOMAINS) {
    if (content.toLowerCase().includes(domain)) {
      violations.push(
        `${label}: references social domain "${domain}" (unverified — see src/data/social.ts)`,
      );
    }
  }

  if (EXTERNAL_FETCH_PATTERN.test(content)) {
    violations.push(
      `${label}: contains a fetch() call targeting an external URL (unverified contact-form endpoint)`,
    );
  }
  if (EXTERNAL_FORM_ACTION_PATTERN.test(content)) {
    violations.push(
      `${label}: contains a <form> with an external action (unverified contact-form endpoint)`,
    );
  }

  if (content.toLowerCase().includes("lexmathai")) {
    violations.push(`${label}: contains "lexmathai"`);
  }

  if (preview && (ext === ".html" || ext === ".htm")) {
    const hasNoindex =
      /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex[^"']*["']/i.test(content);
    if (!hasNoindex) {
      violations.push(
        `${label}: missing <meta name="robots" content="noindex, ..."> in preview mode`,
      );
    }
  }

  return violations;
}

/** Collapse whitespace runs to a single space and decode the one HTML entity
 * this codebase's build actually produces in body text (Astro leaves em
 * dashes, curly quotes, and trademark symbols as literal UTF-8 — only "&"
 * gets entity-encoded). Applied to both registry exactText and scanned file
 * content so the two are comparable. */
function normalize(text) {
  return (
    text
      .replace(/&amp;/g, "&")
      .replace(/&#0?39;|&apos;|&rsquo;/g, "'")
      .replace(/&mdash;/g, "—")
      // Astro's Markdown renderer (content collections) applies typographic
      // smart quotes to prose apostrophes (U+2019); .astro-file string
      // literals do not. Registry text uses a plain straight apostrophe
      // throughout, so fold the curly form down to match either source.
      .replace(/’/g, "'")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Some registry exactText values join multiple distinct rendered text
 * nodes with " / " or " [...] " for human readability (e.g. a stat's
 * value/label/context, or a frontmatter summary + a separately-rendered
 * outcome field) — neither separator appears literally in HTML output. Split
 * on both so each real text fragment is checked independently rather than
 * requiring the artificial concatenation to match verbatim. */
function claimSegments(exactText) {
  return normalize(exactText)
    .split(/\s*\[\.\.\.\]\s*|\s+\/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Strip <script> and <style> element contents, then all remaining tags, to
 * approximate visible body text — used only for the claims-audit candidate
 * scan, never for the safety checks above (which intentionally scan raw
 * source, tags included). */
function extractVisibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) blocks.push(m[1]);
  return blocks.join(" ");
}

function extractMetaContent(html) {
  const out = [];
  const re =
    /<meta[^>]+(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]*content=["']([^"']*)["']/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out.join(" ");
}

// Deliberately narrow, per the task's own "avoid brittle generic number
// matching" instruction: only claim-shaped numeric patterns (a count/metric
// with a trailing "+"/scale letter, e.g. "150+", "35+", "2.1M+") and 4-digit
// years in the 1900-2099 range that are NOT immediately preceded by a
// copyright mark. Deliberately does NOT match bare small numbers, viewport
// values, hashes, or asset filenames (none of which are HTML tags away in
// the visible-text-only scope this runs in).
const CANDIDATE_METRIC_PATTERN = /\b\d+(?:\.\d+)?[a-zA-Z]{0,2}\+/g;
const CANDIDATE_YEAR_PATTERN = /(?<!©\s{0,3})\b(19|20)\d{2}\b/g;

/**
 * Non-blocking claims-registry audit. Never throws, never affects the
 * process exit code — see docs/claims-governance.md "Enforcement is
 * intentionally off". Prints three sections: registry entries not found in
 * this build's output, claim-shaped candidates in output not mapped to any
 * registered claim, and (once any claim is ever marked "approved") a
 * wording-drift check — not yet applicable since every claim is currently
 * "pending" or "documented".
 *
 * @param {{ path: string; content: string }[]} htmlFiles
 */
function runClaimsAudit(htmlFiles) {
  if (!existsSync(CLAIMS_REGISTRY_PATH)) {
    console.log("\nClaims-registry audit: skipped — no claims.registry.json found.");
    return;
  }

  /** @type {{ claims: Array<{ id: string; exactText: string; ownerDecision: string }> }} */
  let registry;
  try {
    registry = JSON.parse(readFileSync(CLAIMS_REGISTRY_PATH, "utf-8"));
  } catch (err) {
    console.log(
      `\nClaims-registry audit: skipped — could not parse claims.registry.json (${err.message}).`,
    );
    return;
  }

  const normalizedFiles = htmlFiles.map((f) => ({
    path: f.path,
    fullText: normalize(f.content),
    visibleText: normalize(extractVisibleText(f.content)),
    jsonLd: normalize(extractJsonLd(f.content)),
    metaContent: normalize(extractMetaContent(f.content)),
  }));

  // 1. Registry entries not found anywhere in this build's output. A claim
  //    counts as found if every one of its text segments (see
  //    claimSegments) appears in at least one single file — segments are
  //    checked together per-file so a match reflects the claim actually
  //    rendering as a unit somewhere, not fragments scattered across
  //    unrelated pages.
  const missing = [];
  for (const claim of registry.claims ?? []) {
    const segments = claimSegments(claim.exactText);
    const found = normalizedFiles.some((f) => segments.every((seg) => f.fullText.includes(seg)));
    if (!found) missing.push(claim.id);
  }

  // 2. Claim-shaped candidates in visible text/metadata/JSON-LD not mapped
  //    to any registered claim's exactText (checked segment-by-segment —
  //    see claimSegments — so a candidate inside one part of a compound
  //    claim still counts as mapped).
  const registeredTexts = (registry.claims ?? []).flatMap((c) => claimSegments(c.exactText));
  /** @type {Map<string, Set<string>>} */
  const unmapped = new Map();
  for (const f of normalizedFiles) {
    const scope = [f.visibleText, f.jsonLd, f.metaContent].join(" ");
    for (const pattern of [CANDIDATE_METRIC_PATTERN, CANDIDATE_YEAR_PATTERN]) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(scope))) {
        const candidate = m[0];
        const mappedToRegistry = registeredTexts.some((t) => t.includes(candidate));
        if (mappedToRegistry) continue;
        if (!unmapped.has(candidate)) unmapped.set(candidate, new Set());
        unmapped.get(candidate).add(relative(process.cwd(), f.path));
      }
    }
  }

  // 3. Wording-drift check for any claim marked "approved" — not yet
  //    reachable since no claim currently carries that value, but wired for
  //    when one does.
  const driftCandidates = (registry.claims ?? []).filter((c) => c.ownerDecision === "approved");
  const drifted = driftCandidates.filter((c) => {
    const segments = claimSegments(c.exactText);
    return !normalizedFiles.some((f) => segments.every((seg) => f.fullText.includes(seg)));
  });

  console.log("\nClaims-registry audit (non-blocking — see docs/claims-governance.md)");
  console.log("-".repeat(64));
  console.log(
    `Registry: ${registry.claims?.length ?? 0} claim(s) loaded from claims.registry.json`,
  );

  if (missing.length > 0) {
    console.log(`\nRegistry entries NOT found in this build's output (${missing.length}):`);
    for (const id of missing) console.log(`  - ${id}`);
  } else {
    console.log("\nAll registry entries found in this build's output.");
  }

  if (unmapped.size > 0) {
    console.log(
      `\nClaim-shaped candidates in output not mapped to any registered claim (${unmapped.size}):`,
    );
    for (const [candidate, files] of unmapped) {
      console.log(
        `  - "${candidate}" — ${[...files].slice(0, 3).join(", ")}${files.size > 3 ? ", ..." : ""}`,
      );
    }
    console.log("  (Review these manually — this scan cannot tell a business metric from a form");
    console.log(
      "   option label or a content publish date. Add a registry entry if it's a real claim.)",
    );
  } else {
    console.log("\nNo unmapped claim-shaped candidates found.");
  }

  if (drifted.length > 0) {
    console.log(
      `\nApproved claims whose exact wording no longer matches rendered output (${drifted.length}):`,
    );
    for (const c of drifted) console.log(`  - ${c.id}`);
  }

  console.log("-".repeat(64));
  console.log("Enforcement is OFF — nothing above affects the build result.");
}

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function main() {
  let files;
  try {
    files = walk(DIST_DIR);
  } catch (err) {
    console.error(`postbuild-guard: could not read ${DIST_DIR} — did the build run?`);
    console.error(err);
    process.exit(1);
    return;
  }

  /** @type {string[]} */
  const violations = [];
  /** @type {{ path: string; content: string }[]} */
  const htmlFiles = [];
  let scanned = 0;

  for (const file of files) {
    const ext = file.slice(file.lastIndexOf("."));
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    scanned += 1;

    const content = readFileSync(file, "utf-8");
    const rel = relative(process.cwd(), file);

    violations.push(...scanContent(content, { ext, isPreview, label: rel }));
    if (ext === ".html" || ext === ".htm" || ext === ".xml") {
      htmlFiles.push({ path: file, content });
    }
  }

  if (violations.length > 0) {
    console.error("postbuild-guard: build FAILED — forbidden content found in dist/:\n");
    for (const v of violations) console.error(`  - ${v}`);
    console.error(`\n${violations.length} violation(s).`);
    process.exit(1);
  }

  console.log(
    `postbuild-guard: OK — ${scanned} file(s) scanned (of ${files.length} total), 0 violations. (preview=${isPreview})`,
  );

  runClaimsAudit(htmlFiles);
}

// Only run when executed directly (`node scripts/postbuild-guard.mjs`), not
// when imported (e.g. for scanContent from a future test file).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
