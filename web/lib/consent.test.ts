import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_COOKIE_NAME,
  allowedMedia,
  createConsentState,
  deniedMedia,
  serializeConsentCookie,
} from './cookie-consent';
import type * as ConsentModule from './consent';

type Channel = { postMessage: ReturnType<typeof vi.fn>; onmessage: (() => void) | null };

let consent: typeof ConsentModule;
let cookie: string;
let channel: Channel;
let fetchMock: ReturnType<typeof vi.fn>;

function stubFetch(ok: boolean, media = deniedMedia) {
  fetchMock = vi.fn(async () => ({
    ok,
    json: async () => ({ media, updatedAt: 123 }),
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(async () => {
  cookie = '';
  channel = { postMessage: vi.fn(), onmessage: null };
  vi.stubGlobal('document', {
    get cookie() {
      return cookie;
    },
    visibilityState: 'visible',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  vi.stubGlobal('window', {
    localStorage: { getItem: () => null, removeItem: vi.fn() },
  });
  vi.stubGlobal('BroadcastChannel', class {
    postMessage = channel.postMessage;
    set onmessage(listener: (() => void) | null) {
      channel.onmessage = listener;
    }
    get onmessage() {
      return channel.onmessage;
    }
  });
  stubFetch(true);
  // The consent store keeps module-level state; a fresh module per test keeps
  // onceProviders/current/settingsRequested from bleeding between tests.
  vi.resetModules();
  consent = await import('./consent');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('session-only media loading', () => {
  it('allows one provider for the session without recording a cookie', () => {
    expect(consent.isProviderAllowed('youtube')).toBe(false);
    consent.loadConsentOnce('youtube');
    expect(consent.isProviderAllowed('youtube')).toBe(true);
    expect(consent.isProviderAllowed('spotify')).toBe(false);
  });

  it('stops once-loaded media when the visitor rejects all', async () => {
    consent.loadConsentOnce('youtube');
    expect(consent.isProviderAllowed('youtube')).toBe(true);

    await consent.rejectAllConsent();

    expect(consent.isProviderAllowed('youtube')).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith('/api/consent', expect.objectContaining({
      body: JSON.stringify(deniedMedia),
    }));
  });
});

describe('saving consent', () => {
  it('hides the banner after a successful save and notifies other tabs', async () => {
    expect(consent.getBannerMode()).toBe('notice');
    consent.subscribeConsent(() => {});
    stubFetch(true, { ...deniedMedia, youtube: true });

    await consent.saveConsent({ ...deniedMedia, youtube: true });

    expect(consent.getBannerMode()).toBe('hidden');
    expect(consent.getConsentMedia().youtube).toBe(true);
    expect(channel.postMessage).toHaveBeenCalledWith('change');
  });

  it('throws and leaves the banner visible when the POST fails', async () => {
    stubFetch(false);
    await expect(consent.saveConsent(allowedMedia)).rejects.toThrow(/could not be saved/i);
    expect(consent.getBannerMode()).toBe('notice');
  });

  it('throws when the server returns an invalid selection', async () => {
    fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ media: { youtube: 'yes' }, updatedAt: 123 }) }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(consent.saveConsent(deniedMedia)).rejects.toThrow(/response was invalid/i);
  });
});

describe('revocation', () => {
  it('keeps a once-only grant when the POST fails so the error can be shown', async () => {
    consent.loadConsentOnce('youtube');
    stubFetch(false);

    await expect(consent.revokeConsent('youtube')).rejects.toThrow(/could not be saved/i);
    expect(consent.isProviderAllowed('youtube')).toBe(true);
  });

  it('drops a once-only grant after the denial is persisted', async () => {
    consent.loadConsentOnce('youtube');
    stubFetch(true);

    await consent.revokeConsent('youtube');

    expect(consent.isProviderAllowed('youtube')).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith('/api/consent', expect.objectContaining({
      body: JSON.stringify({ ...deniedMedia, youtube: false }),
    }));
  });
});

describe('banner mode and cross-tab sync', () => {
  it('toggles the settings mode without touching the cookie', () => {
    expect(consent.getBannerMode()).toBe('notice');
    consent.openConsentSettings();
    expect(consent.getBannerMode()).toBe('settings');
    consent.closeConsentSettings();
    expect(consent.getBannerMode()).toBe('notice');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('re-reads the cookie when another tab announces a change', () => {
    consent.subscribeConsent(() => {});
    expect(consent.isProviderAllowed('spotify')).toBe(false);

    // Another tab wrote the cookie; the message invalidates our cached value.
    cookie = `${CONSENT_COOKIE_NAME}=${serializeConsentCookie(
      createConsentState({ ...deniedMedia, spotify: true }, Date.now()),
    )}`;
    channel.onmessage?.();

    expect(consent.isProviderAllowed('spotify')).toBe(true);
    expect(consent.getBannerMode()).toBe('hidden');
  });
});

describe('legacy localStorage migration', () => {
  it('imports old choices once and removes the legacy keys', async () => {
    const stored = new Map<string, string>([
      ['eoak-consent:YouTube', '1'],
      ['eoak-consent:Bandsintown', '1'],
    ]);
    const removeItem = vi.fn((key: string) => stored.delete(key));
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => stored.get(key) ?? null,
        removeItem,
      },
    });
    stubFetch(true, { ...deniedMedia, youtube: true, bandsintown: true });

    await consent.migrateLegacyConsent();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith('/api/consent', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ ...deniedMedia, youtube: true, bandsintown: true }),
    }));
    expect(removeItem).toHaveBeenCalledTimes(4);
    expect(stored.size).toBe(0);
  });
});
