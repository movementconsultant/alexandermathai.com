/**
 * "Live Systems / Proof of Work" — build-time retrieval of recent public
 * GitHub PushEvent activity for the `movementconsultant` organization, per
 * the owner's Mark 13 evidence and authorization: no PAT is used or
 * required — unauthenticated public-events access only, at whatever rate
 * limit that carries (see docs/mark-13-telemetry-rails-implementation.md
 * "GitHub rate-limit note" — this module makes exactly one request per
 * build).
 *
 * Ticker Tape Guardrails (Mark 14): only repository name, a truncated
 * first-line commit message (max 50 chars), and a date ever render — never
 * a diff, commit body, or PR description. This module never throws;
 * `getLiveSystemsItems()` always resolves, with `status: "fallback"` and an
 * empty array on any failure.
 */
import { safeFetch } from "../utils/fetchWithTimeout";
import { truncateCommitMessage, safeIsoDate } from "../utils/telemetryText";
import blocklist from "../data/blocklist.json";

const GITHUB_EVENTS_URL = "https://api.github.com/users/movementconsultant/events/public";
const MAX_ITEMS = 4;

export interface LiveSystemsItem {
  repo: string;
  message: string;
  commitUrl: string;
  occurredAt: string | null;
}

export interface LiveSystemsResult {
  status: "ok" | "fallback";
  items: LiveSystemsItem[];
}

interface RawGitHubEvent {
  type?: string;
  repo?: { name?: string };
  created_at?: string;
  payload?: {
    commits?: Array<{ sha?: string; message?: string; distinct?: boolean }>;
  };
}

function extractItems(rawJson: string): LiveSystemsItem[] {
  const events = JSON.parse(rawJson) as unknown;
  if (!Array.isArray(events)) return [];

  const items: LiveSystemsItem[] = [];

  for (const event of events as RawGitHubEvent[]) {
    if (event.type !== "PushEvent") continue;
    const repoName = event.repo?.name;
    const commit = event.payload?.commits?.find((c) => c.distinct !== false);
    if (!repoName || !commit?.sha || !commit.message) continue;

    items.push({
      repo: repoName,
      message: truncateCommitMessage(commit.message),
      commitUrl: `https://github.com/${repoName}/commit/${commit.sha}`,
      occurredAt: safeIsoDate(event.created_at),
    });

    if (items.length >= MAX_ITEMS) break;
  }

  return items;
}

export async function getLiveSystemsItems(): Promise<LiveSystemsResult> {
  const result = await safeFetch(GITHUB_EVENTS_URL, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!result) {
    return { status: "fallback", items: [] };
  }

  let items: LiveSystemsItem[];
  try {
    items = extractItems(result.text);
  } catch (err) {
    console.warn(`[live-systems] failed to parse response body — falling back. (${err})`);
    return { status: "fallback", items: [] };
  }

  const blockedShas = new Set<string>(blocklist.github?.blockedShas ?? []);
  items = items.filter((item) => {
    const sha = item.commitUrl.split("/commit/")[1];
    return !blockedShas.has(sha);
  });

  if (items.length === 0) {
    return { status: "fallback", items: [] };
  }

  return { status: "ok", items };
}
