import { NextRequest } from 'next/server';
import { afterEach, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.mock('@/lib/sanity', () => ({ SANITY_CACHE_TAG: 'sanity' }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

it('returns 503 instead of 500 when the webhook secret is not configured', async () => {
  vi.stubEnv('SANITY_REVALIDATE_SECRET', '');
  const { POST } = await import('./route');
  const response = await POST(new NextRequest('https://band.example/api/revalidate', { method: 'POST' }));
  expect(response.status).toBe(503);
});
