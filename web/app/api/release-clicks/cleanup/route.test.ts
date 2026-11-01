import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ delete: vi.fn() }));
vi.mock('next-sanity', () => ({ createClient: () => ({ delete: mocks.delete }) }));

let route: typeof import('./route');

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('RELEASE_CLICK_CLEANUP_SECRET', 'cleanup-secret');
  vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
  vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
  vi.stubEnv('SANITY_API_WRITE_TOKEN', 'test-write-token');
  mocks.delete.mockResolvedValue({});
  route = await import('./route');
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it('requires a valid bearer secret before deleting anything', async () => {
  const response = await route.POST(new Request('https://band.example/api/release-clicks/cleanup', { method: 'POST' }));
  expect(response.status).toBe(401);
  expect(await response.text()).toBe('Session not found.');
  expect(mocks.delete).not.toHaveBeenCalled();
});

it('deletes only deduplication documents more than 48 hours old', async () => {
  const before = Date.now() - 2 * 86_400_000;
  const response = await route.POST(new Request('https://band.example/api/release-clicks/cleanup', {
    method: 'POST', headers: { authorization: 'Bearer cleanup-secret' },
  }));
  expect(response.status).toBe(204);
  const argument = mocks.delete.mock.calls[0][0];
  expect(argument.query).toBe('*[_type == "clickHash" && _createdAt < $cutoff]');
  expect(new Date(argument.params.cutoff).getTime()).toBeGreaterThanOrEqual(before);
  expect(new Date(argument.params.cutoff).getTime()).toBeLessThanOrEqual(Date.now() - 2 * 86_400_000);
});

it('returns an explicit failure on Sanity errors', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.delete.mockRejectedValue(new Error('unavailable'));
  const response = await route.POST(new Request('https://band.example/api/release-clicks/cleanup', {
    method: 'POST', headers: { authorization: 'Bearer cleanup-secret' },
  }));
  expect(response.status).toBe(503);
});

it('returns 503 without a write token instead of throwing at import time', async () => {
  vi.resetModules();
  vi.stubEnv('SANITY_API_WRITE_TOKEN', '');
  const unconfigured = await import('./route');
  const response = await unconfigured.POST(new Request('https://band.example/api/release-clicks/cleanup', {
    method: 'POST', headers: { authorization: 'Bearer cleanup-secret' },
  }));
  expect(response.status).toBe(503);
  expect(mocks.delete).not.toHaveBeenCalled();
});

it('accepts GET for schedulers such as Vercel Cron with the same bearer check', async () => {
  const unauthorized = await route.GET(new Request('https://band.example/api/release-clicks/cleanup'));
  expect(unauthorized.status).toBe(401);
  expect(mocks.delete).not.toHaveBeenCalled();

  const response = await route.GET(new Request('https://band.example/api/release-clicks/cleanup', {
    headers: { authorization: 'Bearer cleanup-secret' },
  }));
  expect(response.status).toBe(204);
  expect(mocks.delete).toHaveBeenCalledOnce();
});
