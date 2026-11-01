import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  createClient: vi.fn(),
  commit: vi.fn(),
  after: vi.fn(),
  tasks: [] as (() => Promise<void>)[],
  transactions: [] as {
    stats?: { _id: string; clicks: number; uniqueClicks: number };
    hash?: { _id: string; day: string };
    patchId?: string;
    increments?: Record<string, number>;
  }[],
}));
vi.mock('next/server', async (importOriginal) => ({
  ...await importOriginal<typeof import('next/server')>(),
  after: mocks.after,
}));
vi.mock('next-sanity', () => ({ createClient: mocks.createClient }));

let route: typeof import('./route');

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.transactions.length = 0;
  mocks.tasks.length = 0;
  mocks.after.mockImplementation((task: () => Promise<void>) => { mocks.tasks.push(task); });
  vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
  vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
  vi.stubEnv('SANITY_API_WRITE_TOKEN', 'test-write-token');
  vi.stubEnv('RELEASE_CLICK_HASH_SECRET', 'a-test-secret-independent-of-the-write-token');
  vi.stubEnv('RELEASE_CLICK_IP_HEADER', 'x-real-ip');
  mocks.fetch.mockResolvedValue({ url: 'https://music.example/release' });
  mocks.commit.mockResolvedValue({});
  mocks.createClient.mockReturnValue({
    fetch: mocks.fetch,
    transaction: () => {
      const state: (typeof mocks.transactions)[number] = {};
      mocks.transactions.push(state);
      const builder = {
        createIfNotExists(stats: NonNullable<typeof state.stats>) { state.stats = stats; return builder; },
        create(hash: NonNullable<typeof state.hash>) { state.hash = hash; return builder; },
        patch(id: string, callback: (patch: { inc: (values: Record<string, number>) => void }) => void) {
          state.patchId = id;
          callback({ inc: (values) => { state.increments = values; } });
          return builder;
        },
        commit: mocks.commit,
      };
      return builder;
    },
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const actual = await import('./route');
  route = {
    ...actual,
    GET: async (...args) => {
      const response = await actual.GET(...args);
      await Promise.all(mocks.tasks.splice(0).map((task) => task()));
      return response;
    },
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function request(extra: Record<string, string> = {}) {
  return new NextRequest('https://band.example/go/release/link', {
    headers: { 'user-agent': 'Mozilla/5.0', 'x-real-ip': '192.0.2.1', ...extra },
  });
}
const context = (id = 'release', key = 'link') => ({ params: Promise.resolve({ id, key }) });

describe('release click redirects', () => {
  it('returns the redirect before performing analytics writes', async () => {
    const actual = await import('./route');
    const response = await actual.GET(request(), context());
    expect(response.status).toBe(302);
    expect(mocks.commit).not.toHaveBeenCalled();
    expect(mocks.tasks).toHaveLength(1);
    await mocks.tasks[0]();
    expect(mocks.commit).toHaveBeenCalledOnce();
  });
  it('counts in a separate statistics singleton, preserving legacy totals', async () => {
    mocks.fetch.mockResolvedValue({ url: 'https://music.example/release', clicks: 7, uniqueClicks: 3 });
    const response = await route.GET(request(), context());
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://music.example/release');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(mocks.fetch).toHaveBeenCalledWith(expect.any(String), { id: 'release', key: 'link' }, {
      cache: 'force-cache',
      next: { revalidate: 60, tags: ['sanity'] },
    });
    const transaction = mocks.transactions[0];
    expect(transaction.stats).toMatchObject({ clicks: 7, uniqueClicks: 3, releaseId: 'release', linkKey: 'link' });
    expect(transaction.patchId).toBe(transaction.stats?._id);
    expect(transaction.increments).toEqual({ clicks: 1, uniqueClicks: 1 });
    expect(transaction.hash?._id).toMatch(/^clickHash\.[a-f0-9]{64}$/);
    expect(JSON.stringify(transaction)).not.toContain('192.0.2.1');
  });

  it('does not change visitor identity when User-Agent changes', async () => {
    await route.GET(request(), context());
    await route.GET(request({ 'user-agent': 'Different browser' }), context());
    expect(mocks.transactions[0].hash?._id).toBe(mocks.transactions[1].hash?._id);
  });

  it('normalizes equivalent IPv6 addresses before deduplication', async () => {
    await route.GET(request({ 'x-real-ip': '2001:db8::1' }), context());
    await route.GET(request({ 'x-real-ip': '2001:0db8:0:0:0:0:0:1' }), context());
    expect(mocks.transactions[0].hash?._id).toBe(mocks.transactions[1].hash?._id);
  });

  it('isolates statistics and deduplication by link', async () => {
    await route.GET(request(), context('release', 'spotify'));
    await route.GET(request(), context('release', 'bandcamp'));
    expect(mocks.transactions[0].stats?._id).not.toBe(mocks.transactions[1].stats?._id);
    expect(mocks.transactions[0].hash?._id).not.toBe(mocks.transactions[1].hash?._id);
  });

  it('counts a duplicate only in the total after an atomic creation conflict', async () => {
    mocks.commit.mockRejectedValueOnce({ statusCode: 409 }).mockResolvedValue({});
    await route.GET(request(), context());
    expect(mocks.transactions).toHaveLength(2);
    expect(mocks.transactions[1].hash).toBeUndefined();
    expect(mocks.transactions[1].increments).toEqual({ clicks: 1 });
  });

  it('uses a different visitor hash on the next UTC day', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-10-31T12:00:00Z'));
      await route.GET(request(), context());
      vi.setSystemTime(new Date('2026-11-01T12:00:00Z'));
      await route.GET(request(), context());
      expect(mocks.transactions[0].hash?._id).not.toBe(mocks.transactions[1].hash?._id);
    } finally { vi.useRealTimers(); }
  });

  it.each(['', 'invalid-ip'])('does not invent a unique visitor for unavailable IP: %s', async (ip) => {
    await route.GET(request({ 'x-real-ip': ip }), context());
    expect(mocks.transactions[0].hash).toBeUndefined();
    expect(mocks.transactions[0].increments).toEqual({ clicks: 1 });
  });

  it('ignores unconfigured forwarded headers and does not fall back to the write token as a hash secret', async () => {
    vi.stubEnv('RELEASE_CLICK_IP_HEADER', '');
    await route.GET(request({ 'x-forwarded-for': '198.51.100.1' }), context());
    vi.stubEnv('RELEASE_CLICK_IP_HEADER', 'x-real-ip');
    vi.stubEnv('RELEASE_CLICK_HASH_SECRET', '');
    await route.GET(request(), context());
    expect(mocks.transactions.every((transaction) => !transaction.hash)).toBe(true);
  });

  it('does not let spoofed forwarded headers change a trusted IP identity', async () => {
    await route.GET(request({ 'x-forwarded-for': '198.51.100.1' }), context());
    await route.GET(request({ 'x-forwarded-for': '198.51.100.2' }), context());
    expect(mocks.transactions[0].hash?._id).toBe(mocks.transactions[1].hash?._id);
  });

  it('caps writes per visitor in the current server process', async () => {
    for (let index = 0; index < 25; index++) await route.GET(request(), context());
    expect(mocks.commit).toHaveBeenCalledTimes(20);
  });

  it.each<Record<string, string>>([
    { 'user-agent': 'Googlebot' },
    { purpose: 'prefetch' },
    { 'sec-purpose': 'prefetch;prerender' },
    { 'next-router-prefetch': '1' },
  ])('does not count bots or prefetches: %j', async (headers) => {
    expect((await route.GET(request(headers), context())).status).toBe(302);
    expect(mocks.commit).not.toHaveBeenCalled();
  });

  it('does not count HEAD requests', async () => {
    expect((await route.HEAD(request(), context())).status).toBe(302);
    expect(mocks.commit).not.toHaveBeenCalled();
  });

  it.each([['drafts.release', 'link'], ['versions.release', 'link'], ['release', 'x"]'], ['release', 'a.b']])(
    'rejects invalid IDs without a Sanity lookup: %s / %s',
    async (id, key) => {
      expect((await route.GET(request(), context(id, key))).status).toBe(404);
      expect(mocks.fetch).not.toHaveBeenCalled();
    },
  );

  it.each([null, { url: 'javascript:alert(1)' }])('returns 404 for absent or unsafe stored links', async (link) => {
    mocks.fetch.mockResolvedValue(link);
    expect((await route.GET(request(), context())).status).toBe(404);
    expect(mocks.commit).not.toHaveBeenCalled();
  });

  it('reports lookup outages as 503 instead of caching a false 404', async () => {
    mocks.fetch.mockRejectedValue(new Error('secret details'));
    expect((await route.GET(request(), context())).status).toBe(503);
    expect(console.error).toHaveBeenCalledWith('Release link lookup failed.');
  });

  it('still redirects when analytics fails, without logging credentials or IPs', async () => {
    mocks.commit.mockRejectedValue(new Error('test-write-token'));
    expect((await route.GET(request(), context())).status).toBe(302);
    expect(console.error).toHaveBeenCalledWith('Counting release click failed.');
  });

  it('makes missing write configuration explicit without breaking the link', async () => {
    vi.stubEnv('SANITY_API_WRITE_TOKEN', '');
    vi.resetModules();
    const unconfigured = await import('./route');
    expect((await unconfigured.GET(request(), context())).status).toBe(302);
    expect(console.error).toHaveBeenCalledWith('Release click counting requires SANITY_API_WRITE_TOKEN.');
    expect(mocks.commit).not.toHaveBeenCalled();
  });
});
