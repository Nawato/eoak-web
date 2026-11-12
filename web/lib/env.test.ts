import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('server environment validation', () => {
  it('falls back to localhost outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    const { siteUrl } = await import('./env');
    expect(siteUrl).toBe('http://localhost:3000');
  });

  it('strips a trailing slash from the configured site URL', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/');
    const { siteUrl } = await import('./env');
    expect(siteUrl).toBe('https://example.com');
  });

  it('refuses to publish localhost URLs in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    await expect(import('./env')).rejects.toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it('rejects a short hash secret in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubEnv('RELEASE_CLICK_HASH_SECRET', 'too-short');
    const { validateServerEnv } = await import('./env');
    expect(() => validateServerEnv()).toThrow(/RELEASE_CLICK_HASH_SECRET/);
  });

  it('accepts an empty hash secret (unique tracking disabled) in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubEnv('RELEASE_CLICK_HASH_SECRET', '');
    const { validateServerEnv } = await import('./env');
    expect(() => validateServerEnv()).not.toThrow();
  });

  it('rejects a short newsletter signing secret in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubEnv('NEWSLETTER_SIGNING_SECRET', 'too-short');
    const { validateServerEnv } = await import('./env');
    expect(() => validateServerEnv()).toThrow(/NEWSLETTER_SIGNING_SECRET/);
  });
});
