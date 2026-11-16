import { describe, expect, it, vi } from 'vitest';
import {
  CONSENT_COOKIE_NAME,
  createConsentState,
  deniedMedia,
  serializeConsentCookie,
} from './cookie-consent';

const mocks = vi.hoisted(() => ({ cookies: vi.fn(), get: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: mocks.cookies }));

import { readConsent } from './consent-server';

function cookieValue(raw: string) {
  mocks.get.mockReturnValue({ value: raw });
}

describe('readConsent', () => {
  it('returns null when no consent cookie is present', async () => {
    mocks.cookies.mockResolvedValue({ get: mocks.get });
    mocks.get.mockReturnValue(undefined);

    expect(await readConsent()).toBeNull();
    expect(mocks.get).toHaveBeenCalledWith(CONSENT_COOKIE_NAME);
  });

  it('parses a valid cookie into media consent', async () => {
    mocks.cookies.mockResolvedValue({ get: mocks.get });
    const state = createConsentState({ ...deniedMedia, youtube: true }, Date.now());
    cookieValue(serializeConsentCookie(state));

    expect(await readConsent()).toEqual(state);
  });

  it('fails closed on a tampered cookie', async () => {
    mocks.cookies.mockResolvedValue({ get: mocks.get });
    cookieValue('{"v":1,"necessary":true,"media":{"youtube":"yes"},"t":123}');

    expect(await readConsent()).toBeNull();
  });
});
