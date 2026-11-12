import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  NEWSLETTER_TOKEN_TTL_MS,
  getNewsletterSigningSecret,
  hasNativeNewsletterConfiguration,
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
  signNewsletterToken,
  verifyNewsletterToken,
} from './newsletter';

const secret = 'test-newsletter-secret-with-enough-entropy';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('newsletter token signing', () => {
  it('signs and verifies a normalized email', () => {
    const now = new Date('2026-11-12T12:00:00Z');
    const token = signNewsletterToken(' Fan@Example.COM ', { secret, now });
    expect(token).toBeTruthy();
    expect(verifyNewsletterToken(token!, { secret, now: new Date(now.getTime() + 1000) })).toEqual({
      email: 'fan@example.com',
    });
  });

  it('rejects tampered payloads and signatures', () => {
    const token = signNewsletterToken('fan@example.com', { secret, now: new Date() })!;
    const [payload, signature] = token.split('.');
    expect(verifyNewsletterToken(`${payload}.${signature.slice(0, -1)}x`, { secret })).toBeNull();
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    decoded.email = 'attacker@example.com';
    const tampered = `${Buffer.from(JSON.stringify(decoded)).toString('base64url')}.${signature}`;
    expect(verifyNewsletterToken(tampered, { secret })).toBeNull();
  });

  it('expires tokens after 48 hours', () => {
    const now = new Date('2026-11-12T12:00:00Z');
    const token = signNewsletterToken('fan@example.com', { secret, now })!;
    expect(verifyNewsletterToken(token, {
      secret,
      now: new Date(now.getTime() + NEWSLETTER_TOKEN_TTL_MS - 1),
    })).toEqual({ email: 'fan@example.com' });
    expect(verifyNewsletterToken(token, {
      secret,
      now: new Date(now.getTime() + NEWSLETTER_TOKEN_TTL_MS),
    })).toBeNull();
  });

  it.each(['', 'not-a-token', 'a.b.c', 'a.b', '....'])('rejects malformed tokens: %j', (token) => {
    expect(verifyNewsletterToken(token, { secret })).toBeNull();
  });

  it('returns null without a signing secret', () => {
    vi.stubEnv('NEWSLETTER_SIGNING_SECRET', '');
    vi.stubEnv('SESSION_SECRET', '');
    expect(getNewsletterSigningSecret()).toBeUndefined();
    expect(signNewsletterToken('fan@example.com')).toBeNull();
  });

  it('falls back to SESSION_SECRET for signing', () => {
    vi.stubEnv('NEWSLETTER_SIGNING_SECRET', '');
    vi.stubEnv('SESSION_SECRET', secret);
    expect(getNewsletterSigningSecret()).toBe(secret);
    const token = signNewsletterToken('fan@example.com')!;
    expect(verifyNewsletterToken(token)).toEqual({ email: 'fan@example.com' });
  });

  it('requires the full native configuration', () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('RESEND_AUDIENCE_ID', 'audience');
    vi.stubEnv('NEWSLETTER_SIGNING_SECRET', secret);
    expect(hasNativeNewsletterConfiguration()).toBe(true);
    vi.stubEnv('RESEND_AUDIENCE_ID', '');
    expect(hasNativeNewsletterConfiguration()).toBe(false);
  });

  it('validates and normalizes email addresses', () => {
    expect(normalizeNewsletterEmail(' Fan@Example.com ')).toBe('fan@example.com');
    expect(isValidNewsletterEmail('fan@example.com')).toBe(true);
    expect(isValidNewsletterEmail('invalid')).toBe(false);
    expect(isValidNewsletterEmail('fan@example.com\r\nBcc: other@example.com')).toBe(false);
  });
});
