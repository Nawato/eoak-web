export const CONSENT_COOKIE_NAME = 'eoak-consent-v1';
export const CONSENT_COOKIE_VERSION = 1;
export const CONSENT_COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
export const CONSENT_MAX_COOKIE_LENGTH = 400;

export const consentProviders = ['youtube', 'spotify', 'bandsintown'] as const;
export type ConsentProvider = (typeof consentProviders)[number];

export type ConsentMedia = Record<ConsentProvider, boolean>;

export interface ConsentState {
  version: typeof CONSENT_COOKIE_VERSION;
  media: ConsentMedia;
  updatedAt: number;
}

export const deniedMedia: ConsentMedia = Object.freeze({
  youtube: false,
  spotify: false,
  bandsintown: false,
});

export const allowedMedia: ConsentMedia = Object.freeze({
  youtube: true,
  spotify: true,
  bandsintown: true,
});

export const consentProviderLabels: Record<ConsentProvider, string> = {
  youtube: 'YouTube',
  spotify: 'Spotify',
  bandsintown: 'Bandsintown',
};

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasForbiddenKey(value: Record<string, unknown>): boolean {
  return Object.keys(value).some((key) => FORBIDDEN_KEYS.has(key));
}

/**
 * Validates an untrusted provider selection. Every known provider must be a
 * boolean; unknown keys are ignored and any malformed value fails closed.
 */
export function normalizeConsentMedia(value: unknown): ConsentMedia | null {
  if (!isPlainObject(value) || hasForbiddenKey(value)) return null;
  const media = { ...deniedMedia };
  for (const provider of consentProviders) {
    const candidate = value[provider];
    if (typeof candidate !== 'boolean') return null;
    media[provider] = candidate;
  }
  return media;
}

/** Cookie values may arrive percent-encoded from Set-Cookie or decoded by Next. */
export function decodeConsentCookieValue(value: string): string {
  if (!value.includes('%')) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Parses the first-party consent cookie. Unknown, tampered, stale or malformed
 * values return null so callers deny every provider and show the banner again.
 */
export function parseConsentCookie(raw: string | null | undefined, now = Date.now()): ConsentState | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  if (raw.length > CONSENT_MAX_COOKIE_LENGTH) return null;

  const decoded = decodeConsentCookieValue(raw);
  if (decoded.length > CONSENT_MAX_COOKIE_LENGTH) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return null;
  }

  if (!isPlainObject(parsed) || hasForbiddenKey(parsed)) return null;
  if (parsed.v !== CONSENT_COOKIE_VERSION) return null;
  if (parsed.necessary !== true) return null;
  if (typeof parsed.t !== 'number' || !Number.isFinite(parsed.t) || parsed.t <= 0) return null;
  // Reject timestamps far in the future (allow one day for clock skew).
  if (parsed.t > now + 24 * 60 * 60 * 1000) return null;
  if (now - parsed.t > CONSENT_COOKIE_MAX_AGE_SECONDS * 1000) return null;

  const media = normalizeConsentMedia(parsed.media);
  if (!media) return null;

  return { version: CONSENT_COOKIE_VERSION, media, updatedAt: parsed.t };
}

export function serializeConsentCookie(state: ConsentState): string {
  return JSON.stringify({
    v: CONSENT_COOKIE_VERSION,
    necessary: true,
    media: {
      youtube: state.media.youtube,
      spotify: state.media.spotify,
      bandsintown: state.media.bandsintown,
    },
    t: state.updatedAt,
  });
}

export function createConsentState(media: ConsentMedia, updatedAt = Date.now()): ConsentState {
  return {
    version: CONSENT_COOKIE_VERSION,
    media: { ...media },
    updatedAt,
  };
}
