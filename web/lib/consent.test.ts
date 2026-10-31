import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readConsent, subscribeConsent, writeConsent } from './consent';

describe('media consent', () => {
  let browser: EventTarget & { localStorage: Storage };
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    browser = Object.assign(new EventTarget(), {
      localStorage: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => { storage.set(key, value); }),
        removeItem: vi.fn((key: string) => { storage.delete(key); }),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
    });
    vi.stubGlobal('window', browser);
    // Reset the module's session state through the same event a browser sends.
    const unsubscribe = subscribeConsent(() => {});
    const event = Object.assign(new Event('storage'), { key: null });
    browser.dispatchEvent(event);
    unsubscribe();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('requires explicit consent and supports persistence and revocation', () => {
    expect(readConsent('YouTube')).toBe(false);
    writeConsent('YouTube', true);
    expect(readConsent('YouTube')).toBe(true);
    expect(storage.get('eoak-consent:YouTube')).toBe('1');
    expect(readConsent('Spotify')).toBe(false);
    writeConsent('YouTube', false);
    expect(readConsent('YouTube')).toBe(false);
    expect(storage.has('eoak-consent:YouTube')).toBe(false);
  });

  it('allows loading and revoking when accessing localStorage throws', () => {
    Object.defineProperty(browser, 'localStorage', {
      get() { throw new Error('Storage disabled'); },
    });
    const callback = vi.fn();
    const unsubscribe = subscribeConsent(callback);
    expect(readConsent('YouTube')).toBe(false);
    writeConsent('YouTube', true);
    expect(readConsent('YouTube')).toBe(true);
    writeConsent('YouTube', false);
    expect(readConsent('YouTube')).toBe(false);
    expect(callback).toHaveBeenCalledTimes(2);
    unsubscribe();
    writeConsent('YouTube', true);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('uses the in-memory choice when writes fail but reads still work', () => {
    vi.mocked(browser.localStorage.setItem).mockImplementation(() => { throw new Error('Quota exceeded'); });
    writeConsent('Spotify', true);
    expect(storage.size).toBe(0);
    expect(readConsent('Spotify')).toBe(true);
    writeConsent('Spotify', false);
    expect(readConsent('Spotify')).toBe(false);
  });

  it('responds to another tab revoking consent', () => {
    writeConsent('Spotify', true);
    const callback = vi.fn();
    const unsubscribe = subscribeConsent(callback);
    storage.delete('eoak-consent:Spotify');
    browser.dispatchEvent(Object.assign(new Event('storage'), { key: 'eoak-consent:Spotify' }));
    expect(readConsent('Spotify')).toBe(false);
    expect(callback).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it('never accesses browser storage during server rendering', () => {
    vi.stubGlobal('window', undefined);
    expect(readConsent('YouTube')).toBe(false);
  });
});
