/**
 * Build-time-only network helper for the telemetry rails (Ledger, Live
 * Systems). Never used client-side — every call site is Astro frontmatter,
 * which executes only during `astro build` / `astro dev`, never in the
 * browser. See docs/mark-13-telemetry-rails-implementation.md for the
 * governance context (owner-authorized build-time fetch, Mark 13/14).
 *
 * Design constraint: this function must NEVER throw and must NEVER let a
 * slow/unreachable source hang or fail the build. Every failure mode
 * (network error, timeout, non-2xx status) resolves to `null` — the caller
 * is responsible for falling back to a static, non-network destination
 * when that happens. This is gate F5's "build reliability, cache, timeout,
 * and fallback proof" made concrete in code, not just documented.
 */

const DEFAULT_TIMEOUT_MS = 8000;

export interface SafeFetchResult {
  text: string;
  status: number;
}

/**
 * Fetches `url` with a hard timeout and a plain, non-browser-spoofing User
 * Agent. Returns `null` on any error, timeout, or non-2xx response — never
 * throws. Callers must treat `null` as "source unavailable this build" and
 * degrade to a static fallback, never as an error to surface to a visitor.
 */
export async function safeFetch(
  url: string,
  init: { timeoutMs?: number; headers?: Record<string, string> } = {},
): Promise<SafeFetchResult | null> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {} } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "alexandermathai.com-build (+https://alexandermathai.com)",
        ...headers,
      },
    });
    if (!response.ok) {
      console.warn(`[telemetry] ${url} responded ${response.status} — falling back.`);
      return null;
    }
    const text = await response.text();
    return { text, status: response.status };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[telemetry] ${url} fetch failed (${reason}) — falling back.`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
