/**
 * Text sanitization for the telemetry rails (Ledger, Live Systems). These
 * are the "Ticker Tape Guardrails" from the Mark 13/14 governance decision:
 * every raw string pulled from an external source at build time passes
 * through here before it ever reaches a component. See
 * docs/mark-13-telemetry-rails-implementation.md.
 */

/** Decodes the small set of HTML/XML entities RSS/Atom feeds commonly use. */
export function decodeEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .trim();
}

/**
 * GitHub-commit-message guardrail: first line only, hard-capped at 50
 * characters (Mark 14 "Ticker Tape Guardrails" — never a diff, commit body,
 * or PR description).
 */
export function truncateCommitMessage(raw: string, maxLen = 50): string {
  const firstLine = decodeEntities(raw).split("\n")[0].trim();
  if (firstLine.length <= maxLen) return firstLine;
  return `${firstLine.slice(0, maxLen - 1).trimEnd()}…`;
}

/** Generic title guardrail — plain text only, no HTML, reasonable length cap. */
export function sanitizeTitle(raw: string, maxLen = 140): string {
  const plain = decodeEntities(raw).replace(/<[^>]+>/g, "");
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1).trimEnd()}…`;
}

/** Best-effort ISO date string from whatever the source supplied; null if unparsable. */
export function safeIsoDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.valueOf())) return null;
  return d.toISOString();
}
