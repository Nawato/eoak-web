import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bearerToken, requireSession } from './session';

function request(authorization?: string): Request {
  return new Request('https://band.example/api/release-clicks/cleanup', {
    method: 'POST',
    headers: authorization ? { authorization } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SESSION_SECRET', 'session-secret');
  vi.stubEnv('RELEASE_CLICK_CLEANUP_SECRET', 'cleanup-secret');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('session authorization', () => {
  it('extracts a bearer token from the authorization header', () => {
    expect(bearerToken(request('Bearer abc123'))).toBe('abc123');
    expect(bearerToken(request('bearer abc123'))).toBe('abc123');
    expect(bearerToken(request())).toBeNull();
    expect(bearerToken(request('Basic xyz'))).toBeNull();
    expect(bearerToken(request('Bearer'))).toBeNull();
  });

  it('rejects requests without a session', () => {
    expect(requireSession(request())).not.toBeNull();
    expect((requireSession(request()) as Response).status).toBe(401);
    expect((requireSession(request()) as Response).body).not.toBeNull();
  });

  it('rejects requests with an invalid session', () => {
    expect((requireSession(request('Bearer wrong-secret')) as Response).status).toBe(401);
  });

  it('accepts the configured session secret', () => {
    expect(requireSession(request('Bearer session-secret'))).toBeNull();
  });

  it('accepts the legacy cleanup secret as a fallback', () => {
    vi.stubEnv('SESSION_SECRET', undefined);
    expect(requireSession(request('Bearer cleanup-secret'))).toBeNull();
  });

  it('treats an empty SESSION_SECRET as unset so the fallback still works', () => {
    vi.stubEnv('SESSION_SECRET', '');
    expect(requireSession(request('Bearer cleanup-secret'))).toBeNull();
  });

  it('returns 401 with "Session not found." when no secret is configured at all', () => {
    vi.stubEnv('SESSION_SECRET', '');
    vi.stubEnv('RELEASE_CLICK_CLEANUP_SECRET', '');
    expect((requireSession(request('Bearer anything')) as Response).status).toBe(401);
  });
});
