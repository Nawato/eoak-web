import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { create, get } = vi.hoisted(() => ({
  create: vi.fn(),
  get: vi.fn(),
}));

vi.mock('resend', () => ({
  Resend: class {
    contacts = { create, get };
  },
}));

import { signNewsletterToken } from '@/lib/newsletter';
import { GET, POST } from './route';

const secret = 'test-newsletter-secret-with-enough-entropy';

function getRequest(token: string) {
  return new Request(`https://band.example/api/newsletter/confirm?token=${encodeURIComponent(token)}`);
}

function postRequest(token: string) {
  return new Request('https://band.example/api/newsletter/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }).toString(),
  });
}

describe('newsletter confirmation route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('RESEND_AUDIENCE_ID', 'audience-id');
    vi.stubEnv('NEWSLETTER_SIGNING_SECRET', secret);
    create.mockResolvedValue({ data: { id: 'contact-1' }, error: null });
    get.mockResolvedValue({ data: { id: 'contact-1', email: 'fan@example.com' }, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('rejects invalid tokens on GET', async () => {
    const response = await GET(getRequest('not-a-token'));
    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('renders a POST confirmation form without subscribing', async () => {
    const token = signNewsletterToken('fan@example.com', { secret })!;
    const response = await GET(getRequest(token));
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('method="post"');
    expect(html).toContain('name="token"');
    expect(html).toContain(token);
    expect(create).not.toHaveBeenCalled();
  });

  it('adds the verified contact to the audience on POST', async () => {
    const token = signNewsletterToken('fan@example.com', { secret })!;
    const response = await POST(postRequest(token));
    expect(response.status).toBe(200);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      audienceId: 'audience-id',
      email: 'fan@example.com',
      unsubscribed: false,
    }));
  });

  it('is idempotent when the contact already exists', async () => {
    create.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', statusCode: 422, message: 'Contact already exists' },
    });
    const token = signNewsletterToken('fan@example.com', { secret })!;
    const response = await POST(postRequest(token));
    expect(response.status).toBe(200);
    expect(get).toHaveBeenCalledWith({ audienceId: 'audience-id', email: 'fan@example.com' });
  });

  it('rejects a missing or invalid POST token', async () => {
    expect((await POST(postRequest(''))).status).toBe(400);
    expect((await POST(postRequest('not-a-token'))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('returns a service error when configuration is missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('RESEND_API_KEY', '');
    const token = signNewsletterToken('fan@example.com', { secret })!;
    expect((await POST(postRequest(token))).status).toBe(503);
    expect(create).not.toHaveBeenCalled();
  });
});
