import { timingSafeEqual } from 'node:crypto';

// Session secret used to authorize scheduled/admin API requests (e.g. click-statistics cleanup).
// Prefer SESSION_SECRET; fall back to the legacy cleanup secret so existing deployments keep working
// until they rotate to the dedicated session secret.
// Empty values (e.g. `SESSION_SECRET=""` from .env.example) count as unset so the fallback still works.
function sessionSecret(): string | undefined {
  const secret =
    process.env.SESSION_SECRET?.trim() || process.env.RELEASE_CLICK_CLEANUP_SECRET?.trim();
  return secret || undefined;
}

export function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match ? match[1] : null;
}

export function isValidSession(request: Request): boolean {
  const secret = sessionSecret();
  if (!secret) return false;
  const token = bearerToken(request);
  if (!token) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(`Bearer ${token}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Returns a 401 response when no valid session is present, otherwise null so the handler can proceed.
export function requireSession(request: Request): Response | null {
  if (!isValidSession(request)) {
    return new Response('Session not found.', { status: 401 });
  }
  return null;
}
