import { vi } from 'vitest';
import {
  CONSENT_COOKIE_NAME,
  createConsentState,
  deniedMedia,
  serializeConsentCookie,
  type ConsentMedia,
} from '@/lib/cookie-consent';

/** Start each DOM test with an isolated consent environment. */
export function resetConsentEnvironment(media: ConsentMedia | null = null) {
  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0`;
  if (media) {
    const value = encodeURIComponent(serializeConsentCookie(createConsentState(media, Date.now())));
    document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/`;
  }
  vi.stubGlobal('BroadcastChannel', undefined);
}

export function stubConsentFetch(options: { ok?: boolean; media?: ConsentMedia } = {}) {
  const media = options.media ?? deniedMedia;
  const fetch = vi.fn(async () => ({
    ok: options.ok ?? true,
    json: async () => ({ media, updatedAt: Date.now() }),
  }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}
