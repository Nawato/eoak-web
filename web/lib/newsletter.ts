import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NEWSLETTER_TOKEN_TTL_MS = TOKEN_TTL_MS;

export function isValidNewsletterEmail(value: string): boolean {
  return value.length > 0 && value.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(value);
}

export function normalizeNewsletterEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Prefer the dedicated newsletter secret, falling back to SESSION_SECRET. */
export function getNewsletterSigningSecret(): string | undefined {
  const secret = process.env.NEWSLETTER_SIGNING_SECRET?.trim() || process.env.SESSION_SECRET?.trim();
  return secret || undefined;
}

/** The native double opt-in flow needs an audience, a signing secret and a Resend API key. */
export function hasNativeNewsletterConfiguration(): boolean {
  return Boolean(
    process.env.RESEND_AUDIENCE_ID?.trim() &&
    getNewsletterSigningSecret() &&
    process.env.RESEND_API_KEY?.trim(),
  );
}

function base64Url(value: Buffer): string {
  return value.toString('base64url');
}

function signature(payload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(payload).digest();
}

export interface NewsletterTokenOptions {
  secret?: string;
  now?: Date;
  ttlMs?: number;
}

/**
 * Creates a signed double opt-in token containing only the normalized email and
 * an expiry timestamp. Returns null when no signing secret is configured.
 */
export function signNewsletterToken(email: string, options: NewsletterTokenOptions = {}): string | null {
  const secret = options.secret ?? getNewsletterSigningSecret();
  const normalized = normalizeNewsletterEmail(email);
  if (!secret || !isValidNewsletterEmail(normalized)) return null;
  const now = options.now ?? new Date();
  const ttl = options.ttlMs ?? TOKEN_TTL_MS;
  const payload = base64Url(Buffer.from(JSON.stringify({ email: normalized, exp: now.getTime() + ttl })));
  return `${payload}.${base64Url(signature(payload, secret))}`;
}

export interface VerifiedNewsletterToken {
  email: string;
}

/** Verifies signature and expiry. Never returns a partially valid token. */
export function verifyNewsletterToken(
  token: string,
  options: Pick<NewsletterTokenOptions, 'secret' | 'now'> = {},
): VerifiedNewsletterToken | null {
  const secret = options.secret ?? getNewsletterSigningSecret();
  if (!secret || typeof token !== 'string') return null;
  const [payload, encodedSignature, extra] = token.split('.');
  if (!payload || !encodedSignature || extra !== undefined) return null;

  let expected: Buffer;
  let actual: Buffer;
  try {
    expected = signature(payload, secret);
    actual = Buffer.from(encodedSignature, 'base64url');
  } catch {
    return null;
  }
  // Reject non-canonical base64url so equivalent encodings (for example a
  // changed trailing character that only alters unused padding bits) fail.
  if (base64Url(actual) !== encodedSignature) return null;
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as unknown;
    if (!decoded || typeof decoded !== 'object') return null;
    const { email, exp } = decoded as { email?: unknown; exp?: unknown };
    if (typeof email !== 'string' || !isValidNewsletterEmail(email)) return null;
    if (typeof exp !== 'number' || !Number.isFinite(exp)) return null;
    const now = (options.now ?? new Date()).getTime();
    if (exp <= now) return null;
    return { email };
  } catch {
    return null;
  }
}
