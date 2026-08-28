/**
 * "The Ledger" — build-time Substack RSS retrieval, per the owner's Mark 13
 * evidence and authorization: source URL
 * https://texasmovement.substack.com/feed, owner confirmed ownership,
 * authorized fields are title/date/link only (Mark 14 "Ticker Tape
 * Guardrails" — never an excerpt, description, or full article body).
 *
 * This module never throws. `getLedgerItems()` always resolves to a
 * `LedgerResult`; a fetch/parse failure resolves `status: "fallback"` with
 * an empty `items` array, and the calling component is responsible for
 * rendering a static fallback link instead of a list.
 *
 * No caching layer exists here (see docs/mark-13-telemetry-rails-implementation.md
 * "On the '60 minute cache' request" for why): each build fetches once. A
 * true time-based cache would require a persistent build-cache directory or
 * a scheduled rebuild trigger, both infrastructure changes outside this
 * task's scope.
 */
import { safeFetch } from "../utils/fetchWithTimeout";
import { decodeEntities, sanitizeTitle, safeIsoDate } from "../utils/telemetryText";
import blocklist from "../data/blocklist.json";

const SUBSTACK_FEED_URL = "https://texasmovement.substack.com/feed";
const MAX_ITEMS = 3;

export interface LedgerItem {
  title: string;
  link: string;
  publishedAt: string | null;
}

export interface LedgerResult {
  status: "ok" | "fallback";
  items: LedgerItem[];
}

function extractItems(xml: string): LedgerItem[] {
  const items: LedgerItem[] = [];
  const itemBlocks = xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/g) ?? [];

  for (const block of itemBlocks) {
    const titleMatch = block.match(/<title\b[^>]*>([\s\S]*?)<\/title>/);
    const linkMatch = block.match(/<link\b[^>]*>([\s\S]*?)<\/link>/);
    const dateMatch = block.match(/<pubDate\b[^>]*>([\s\S]*?)<\/pubDate>/);

    if (!titleMatch || !linkMatch) continue;

    const link = decodeEntities(linkMatch[1]).trim();
    if (!/^https:\/\/texasmovement\.substack\.com\//.test(link)) continue; // never trust an off-domain link from the feed body

    items.push({
      title: sanitizeTitle(titleMatch[1]),
      link,
      publishedAt: safeIsoDate(dateMatch?.[1]),
    });

    if (items.length >= MAX_ITEMS) break;
  }

  return items;
}

export async function getLedgerItems(): Promise<LedgerResult> {
  const result = await safeFetch(SUBSTACK_FEED_URL, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
  });

  if (!result) {
    return { status: "fallback", items: [] };
  }

  let items: LedgerItem[];
  try {
    items = extractItems(result.text);
  } catch (err) {
    console.warn(`[ledger] failed to parse feed body — falling back. (${err})`);
    return { status: "fallback", items: [] };
  }

  const blockedUrls = new Set<string>(blocklist.substack?.blockedUrls ?? []);
  items = items.filter((item) => !blockedUrls.has(item.link));

  if (items.length === 0) {
    return { status: "fallback", items: [] };
  }

  return { status: "ok", items };
}
