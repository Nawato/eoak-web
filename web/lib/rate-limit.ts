export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  maxClients?: number;
}

/**
 * Best-effort per-process rate limiting. Use a shared store (e.g. Upstash) for
 * strict enforcement across instances. The returned function records a hit and
 * returns true when the caller should be throttled.
 */
export function createRateLimiter({
  windowMs,
  max,
  maxClients = 1000,
}: RateLimiterOptions): (key: string) => boolean {
  const submissions = new Map<string, number[]>();

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    for (const [client, times] of submissions) {
      if (times.every((time) => now - time >= windowMs)) submissions.delete(client);
    }
    if (!submissions.has(key) && submissions.size >= maxClients) return true;
    const recent = (submissions.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      submissions.set(key, recent);
      return true;
    }
    recent.push(now);
    submissions.set(key, recent);
    return false;
  };
}
