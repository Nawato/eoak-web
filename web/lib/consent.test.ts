import { afterEach, describe, expect, it, vi } from 'vitest';
import { migrateLegacyConsent, isProviderAllowed, loadConsentOnce } from './consent';
import { deniedMedia } from './cookie-consent';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('session-only media loading', () => {
  it('allows one provider for the session without recording a cookie', () => {
    expect(isProviderAllowed('youtube')).toBe(false);
    loadConsentOnce('youtube');
    expect(isProviderAllowed('youtube')).toBe(true);
    expect(isProviderAllowed('spotify')).toBe(false);
  });
});

describe('legacy localStorage migration', () => {
  it('imports old choices once and removes the legacy keys', async () => {
    const stored = new Map<string, string>([
      ['eoak-consent:YouTube', '1'],
      ['eoak-consent:Bandsintown', '1'],
    ]);
    const removeItem = vi.fn((key: string) => stored.delete(key));
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ media: { ...deniedMedia, youtube: true, bandsintown: true }, updatedAt: 123 }),
    }));

    vi.stubGlobal('document', { cookie: '', visibilityState: 'visible' });
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => stored.get(key) ?? null,
        removeItem,
      },
    });
    vi.stubGlobal('BroadcastChannel', undefined);
    vi.stubGlobal('fetch', fetch);

    await migrateLegacyConsent();

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith('/api/consent', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ ...deniedMedia, youtube: true, bandsintown: true }),
    }));
    expect(removeItem).toHaveBeenCalledTimes(4);
    expect(stored.size).toBe(0);
  });
});
