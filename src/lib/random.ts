/**
 * Picks up to `max` items at random, in random order — a Fisher-Yates
 * shuffle, not just "first N". Returns `items` unchanged if it's already
 * at or under `max` (nothing to trim).
 *
 * Runs server-side at page-generation time (ISR `revalidate`, currently
 * 300s across the site), not per-visitor — so the selection stays the same
 * for everyone until the next revalidate, rather than reshuffling on every
 * single request (which would also defeat image/page caching).
 */
export function pickRandom<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, max);
}
