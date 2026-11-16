import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  deniedMedia,
  parseConsentCookie,
} from '@/lib/cookie-consent';

const mocks = vi.hoisted(() => ({ cookies: vi.fn(), set: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: mocks.cookies }));

import { POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cookies.mockResolvedValue({ set: mocks.set });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://band.example/api/consent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: 'band.example',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('consent route', () => {
  it('stores a validated selection in the first-party cookie', async () => {
    const response = await POST(request({ ...deniedMedia, youtube: true, instagram: true }));
    expect(response.status).toBe(200);

    const [name, value, options] = mocks.set.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(name).toBe(CONSENT_COOKIE_NAME);
    expect(value.startsWith('%')).toBe(false);
    expect(options).toEqual(expect.objectContaining({
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      secure: false,
      maxAge: CONSENT_COOKIE_MAX_AGE_SECONDS,
    }));
    expect(parseConsentCookie(value)?.media).toEqual({ ...deniedMedia, youtube: true, instagram: true });
  });

  it('rejects an invalid selection without setting a cookie', async () => {
    const response = await POST(request({ ...deniedMedia, youtube: 'yes' }));
    expect(response.status).toBe(400);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON without setting a cookie', async () => {
    const response = await POST(new Request('https://band.example/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', host: 'band.example' },
      body: '{not-json',
    }));
    expect(response.status).toBe(400);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it('rejects a cross-origin request', async () => {
    const response = await POST(request(deniedMedia, { origin: 'https://evil.example' }));
    expect(response.status).toBe(403);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it('accepts a same-origin request with an Origin header', async () => {
    const response = await POST(request(deniedMedia, { origin: 'https://band.example' }));
    expect(response.status).toBe(200);
    expect(mocks.set).toHaveBeenCalledOnce();
  });

  it('marks the response as uncacheable', async () => {
    const response = await POST(request(deniedMedia));
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
