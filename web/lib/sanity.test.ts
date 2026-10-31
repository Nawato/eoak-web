import { afterEach, describe, expect, it, vi } from 'vitest';

const { fetch, createClient } = vi.hoisted(() => {
  const fetch = vi.fn().mockResolvedValue(null);
  return { fetch, createClient: vi.fn(() => ({ fetch })) };
});

vi.mock('next-sanity', () => ({ createClient }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.resetModules();
});

describe('Sanity content freshness', () => {
  it.each(['development', 'production'])('uses appropriate caching in %s', async (environment) => {
    vi.stubEnv('NODE_ENV', environment);
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubEnv('SANITY_API_READ_TOKEN', '');

    const { getSiteSettings, getPressKit, getReleases, getMembers } = await import('./sanity');
    await Promise.all([getSiteSettings(), getPressKit(), getReleases(), getMembers()]);

    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({
      useCdn: environment === 'production',
    }));
    expect(fetch).toHaveBeenCalledTimes(4);
    for (const call of fetch.mock.calls) {
      expect(call[2]).toEqual(environment === 'development'
        ? { cache: 'no-store' }
        : { next: { revalidate: 60, tags: ['sanity'] } });
    }
  });
});
