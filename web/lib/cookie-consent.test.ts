import { describe, expect, it } from 'vitest';
import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_MAX_COOKIE_LENGTH,
  allowedMedia,
  createConsentState,
  deniedMedia,
  normalizeConsentMedia,
  parseConsentCookie,
  serializeConsentCookie,
} from './cookie-consent';

const now = Date.UTC(2026, 10, 16, 12, 0, 0);

function serialized(media = deniedMedia, updatedAt = now): string {
  return serializeConsentCookie(createConsentState(media, updatedAt));
}

describe('consent cookie serialization', () => {
  it.each([
    ['all denied', deniedMedia],
    ['all allowed', allowedMedia],
    ['mixed', { ...deniedMedia, youtube: true, bandsintown: true }],
    ['only spotify', { ...deniedMedia, spotify: true }],
    ['only instagram', { ...deniedMedia, instagram: true }],
  ])('round-trips %s', (_label, media) => {
    const value = serialized(media);
    expect(value.length).toBeLessThanOrEqual(CONSENT_MAX_COOKIE_LENGTH);
    expect(parseConsentCookie(value, now)).toEqual({
      version: 1,
      media,
      updatedAt: now,
    });
  });

  it('round-trips a percent-encoded cookie value', () => {
    const value = serialized({ ...deniedMedia, youtube: true });
    expect(parseConsentCookie(encodeURIComponent(value), now)?.media.youtube).toBe(true);
  });

  it('keeps the payload free of personal data', () => {
    const value = serialized(allowedMedia);
    expect(value).not.toMatch(/@/);
    expect(value).not.toMatch(/\d{1,3}(\.\d{1,3}){3}/);
  });
});

describe('consent cookie validation', () => {
  it.each([
    ['missing', null],
    ['empty', ''],
    ['whitespace', '   '],
    ['malformed JSON', '{not-json'],
    ['JSON array', '[]'],
    ['JSON string', '"consent"'],
    ['wrong version', JSON.stringify({ v: 2, necessary: true, media: deniedMedia, t: now })],
    ['missing necessary flag', JSON.stringify({ v: 1, media: deniedMedia, t: now })],
    ['necessary false', JSON.stringify({ v: 1, necessary: false, media: deniedMedia, t: now })],
    ['missing timestamp', JSON.stringify({ v: 1, necessary: true, media: deniedMedia })],
    ['non-numeric timestamp', JSON.stringify({ v: 1, necessary: true, media: deniedMedia, t: 'now' })],
    ['missing media', JSON.stringify({ v: 1, necessary: true, t: now })],
    ['non-boolean toggle', JSON.stringify({ v: 1, necessary: true, media: { ...deniedMedia, youtube: 'true' }, t: now })],
    ['numeric toggle', JSON.stringify({ v: 1, necessary: true, media: { ...deniedMedia, youtube: 1 }, t: now })],
    ['missing provider', JSON.stringify({ v: 1, necessary: true, media: { youtube: true }, t: now })],
    ['oversized value', 'x'.repeat(CONSENT_MAX_COOKIE_LENGTH + 1)],
  ])('denies %s', (_label, value) => {
    expect(parseConsentCookie(value, now)).toBeNull();
  });

  it('denies prototype-polluting payloads', () => {
    const payload = `{"v":1,"necessary":true,"media":{"__proto__":{"youtube":true},"youtube":true,"spotify":true,"instagram":true,"bandsintown":true},"t":${now}}`;
    expect(parseConsentCookie(payload, now)).toBeNull();
  });

  it('ignores unknown media keys', () => {
    const payload = JSON.stringify({
      v: 1,
      necessary: true,
      media: { ...deniedMedia, youtube: true, tiktok: true },
      t: now,
    });
    expect(parseConsentCookie(payload, now)?.media).toEqual({ ...deniedMedia, youtube: true });
  });

  it.each([
    ['expired', now - CONSENT_COOKIE_MAX_AGE_SECONDS * 1000 - 1],
    ['far in the future', now + 2 * 24 * 60 * 60 * 1000],
  ])('denies a %s timestamp', (_label, updatedAt) => {
    expect(parseConsentCookie(serialized(deniedMedia, updatedAt), now)).toBeNull();
  });

  it('allows a timestamp slightly in the future for clock skew', () => {
    const updatedAt = now + 60 * 60 * 1000;
    expect(parseConsentCookie(serialized(deniedMedia, updatedAt), now)?.updatedAt).toBe(updatedAt);
  });
});

describe('server action input validation', () => {
  it.each([
    ['null', null],
    ['array', []],
    ['string', 'youtube'],
    ['missing provider', { youtube: true }],
    ['non-boolean toggle', { ...deniedMedia, youtube: 'yes' }],
    ['prototype key', JSON.parse('{"__proto__":{},"youtube":false,"spotify":false,"instagram":false,"bandsintown":false}')],
  ])('rejects %s', (_label, value) => {
    expect(normalizeConsentMedia(value)).toBeNull();
  });

  it('drops unknown keys from a valid selection', () => {
    expect(normalizeConsentMedia({ ...deniedMedia, youtube: true, tiktok: true })).toEqual({
      ...deniedMedia,
      youtube: true,
    });
  });
});
