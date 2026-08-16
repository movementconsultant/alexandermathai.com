#!/usr/bin/env node
/**
 * Postbuild guard.
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

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

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
  let scanned = 0;

  for (const file of files) {
    const ext = file.slice(file.lastIndexOf("."));
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    scanned += 1;

    const content = readFileSync(file, "utf-8");
    const rel = relative(process.cwd(), file);

    violations.push(...scanContent(content, { ext, isPreview, label: rel }));
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
}

// Only run when executed directly (`node scripts/postbuild-guard.mjs`), not
// when imported (e.g. for scanContent from a future test file).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
