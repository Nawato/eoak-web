import { NextRequest } from 'next/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.mock('@/lib/sanity', () => ({ SANITY_CACHE_TAG: 'sanity' }));
vi.mock('next-sanity/webhook', () => ({ parseBody: vi.fn() }));

import { revalidateTag } from 'next/cache';
import { parseBody } from 'next-sanity/webhook';
import { MAX_WEBHOOK_BODY_BYTES, POST } from './route';

const mockedParseBody = vi.mocked(parseBody);
const mockedRevalidateTag = vi.mocked(revalidateTag);

function request(body = '{"_type":"release"}', headers: Record<string, string> = {}) {
  return new NextRequest('https://band.example/api/revalidate', {
    method: 'POST',
    headers: { 'sanity-webhook-signature': 't=1,v1=abc', ...headers },
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SANITY_REVALIDATE_SECRET', 'test-webhook-secret');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

it('returns 503 instead of 500 when the webhook secret is not configured', async () => {
  vi.stubEnv('SANITY_REVALIDATE_SECRET', '');
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(mockedParseBody).not.toHaveBeenCalled();
});

it('revalidates for a valid signature', async () => {
  mockedParseBody.mockResolvedValue({ isValidSignature: true, body: {} });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(mockedRevalidateTag).toHaveBeenCalledWith('sanity', 'max');
});

it('rejects an invalid signature', async () => {
  mockedParseBody.mockResolvedValue({ isValidSignature: false, body: {} });
  const response = await POST(request());
  expect(response.status).toBe(401);
  expect(mockedRevalidateTag).not.toHaveBeenCalled();
});

it('forwards the capped body to the signature parser', async () => {
  mockedParseBody.mockResolvedValue({ isValidSignature: true, body: {} });
  await POST(request('{"_type":"release"}'));
  const forwarded = mockedParseBody.mock.calls[0][0] as NextRequest;
  expect(await forwarded.text()).toBe('{"_type":"release"}');
});

it('rejects a declared payload larger than the limit before parsing', async () => {
  const response = await POST(request('{}', {
    'content-length': String(MAX_WEBHOOK_BODY_BYTES + 1),
  }));
  expect(response.status).toBe(413);
  expect(mockedParseBody).not.toHaveBeenCalled();
});

it('rejects a streamed payload larger than the limit without a declared length', async () => {
  const response = await POST(request('x'.repeat(MAX_WEBHOOK_BODY_BYTES + 1)));
  expect(response.status).toBe(413);
  expect(mockedParseBody).not.toHaveBeenCalled();
});
