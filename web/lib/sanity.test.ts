import { afterEach, describe, expect, it, vi } from 'vitest';

const { fetch, createClient } = vi.hoisted(() => {
  const fetch = vi.fn().mockResolvedValue(null);
  return { fetch, createClient: vi.fn(() => ({ fetch })) };
});

vi.mock('server-only', () => ({}));
vi.mock('next-sanity', () => ({ createClient, defineQuery: (query: string) => query }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.resetModules();
});

describe('Sanity content freshness', () => {
  it('fetches only existence flags for navigation instead of full content lists', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    const { getNavigationContent } = await import('./sanity');
    await getNavigationContent();
    expect(fetch).toHaveBeenCalledOnce();
    const query = fetch.mock.calls[0][0];
    expect(query).toContain('"hasReleases": defined(*[_type == "release"][0]._id)');
    expect(query).toContain('"hasMembers": defined(*[_type == "member"][0]._id)');
    expect(query).not.toContain('cover');
  });
  it('uses a parameterized single-release query and an uncapped slug query', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    const { getRelease, getReleaseSlugs } = await import('./sanity');
    await getRelease('older-release');
    await getReleaseSlugs();
    expect(fetch.mock.calls[0][0]).toContain('slug.current == $slug');
    expect(fetch.mock.calls[0][1]).toEqual({ slug: 'older-release' });
    expect(fetch.mock.calls[1][0]).not.toContain('[0...50]');
  });
  it.each(['development', 'production'])('uses appropriate caching in %s', async (environment) => {
    vi.stubEnv('NODE_ENV', environment);
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubEnv('SANITY_API_READ_TOKEN', '');

    const { getSiteSettings, getPressKit, getReleases, getMembers } = await import('./sanity');
    await Promise.all([getSiteSettings(), getPressKit(), getReleases(), getMembers()]);

    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({
      useCdn: false,
      perspective: 'published',
    }));
    expect(fetch).toHaveBeenCalledTimes(4);
    for (const call of fetch.mock.calls) {
      expect(call[2]).toEqual(environment === 'development'
        ? { cache: 'no-store' }
        : { next: { revalidate: 60, tags: ['sanity'] } });
    }
  });
});
