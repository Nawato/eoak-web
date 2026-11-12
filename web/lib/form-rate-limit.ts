import { createRateLimiter, type RateLimiter } from '@/lib/rate-limit';

const WINDOW_MS = 10 * 60 * 1000;
const PER_CLIENT_MAX = 3;
// Conservative cap when the hosting proxy is not configured to supply a trusted
// client IP. Without it, every submission would be unlimited (fail-open).
const SHARED_MAX = 30;

export const contactIpRateLimiter = createRateLimiter({
  windowMs: WINDOW_MS,
  max: PER_CLIENT_MAX,
  maxClients: 1000,
});

export const contactSharedRateLimiter = createRateLimiter({
  windowMs: WINDOW_MS,
  max: SHARED_MAX,
  maxClients: 1,
});

export const newsletterIpRateLimiter = createRateLimiter({
  windowMs: WINDOW_MS,
  max: PER_CLIENT_MAX,
  maxClients: 1000,
});

export const newsletterSharedRateLimiter = createRateLimiter({
  windowMs: WINDOW_MS,
  max: SHARED_MAX,
  maxClients: 1,
});

/**
 * Per-client limits when a trusted IP is available; otherwise a shared fallback
 * limit so a missing reverse-proxy header never disables throttling entirely.
 */
export function isFormSubmissionRateLimited(
  clientIp: string | undefined,
  ipLimiter: RateLimiter,
  sharedLimiter: RateLimiter,
): boolean {
  return clientIp ? ipLimiter(clientIp) : sharedLimiter('shared');
}
