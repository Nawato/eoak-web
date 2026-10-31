import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { POST } from './route';

const mocks = vi.hoisted(() => ({ delete: vi.fn() }));
vi.mock('next-sanity', () => ({ createClient: () => ({ delete: mocks.delete }) }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('RELEASE_CLICK_CLEANUP_SECRET', 'cleanup-secret');
  vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'example');
  vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
  vi.stubEnv('SANITY_API_WRITE_TOKEN', 'test-write-token');
  mocks.delete.mockResolvedValue({});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it('requires a valid bearer secret before deleting anything', async () => {
  const response = await POST(new Request('https://band.example/api/release-clicks/cleanup', { method: 'POST' }));
  expect(response.status).toBe(401);
  expect(mocks.delete).not.toHaveBeenCalled();
});

it('deletes only deduplication documents more than 48 hours old', async () => {
  const before = Date.now() - 2 * 86_400_000;
  const response = await POST(new Request('https://band.example/api/release-clicks/cleanup', {
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
  const response = await POST(new Request('https://band.example/api/release-clicks/cleanup', {
    method: 'POST', headers: { authorization: 'Bearer cleanup-secret' },
  }));
  expect(response.status).toBe(503);
});
