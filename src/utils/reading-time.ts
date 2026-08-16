const WORDS_PER_MINUTE = 200;

/** Estimate reading time from raw markdown/MDX body text. */
export function readingTime(rawBody: string): string {
  const words = rawBody.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
