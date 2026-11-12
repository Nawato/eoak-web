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
import { GET } from './route';

const secret = 'test-newsletter-secret-with-enough-entropy';

function request(token: string) {
  return new Request(`https://band.example/api/newsletter/confirm?token=${encodeURIComponent(token)}`);
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

  it('rejects invalid tokens', async () => {
    const response = await GET(request('not-a-token'));
    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('adds the verified contact to the audience', async () => {
    const token = signNewsletterToken('fan@example.com', { secret })!;
    const response = await GET(request(token));
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
    const response = await GET(request(token));
    expect(response.status).toBe(200);
    expect(get).toHaveBeenCalledWith({ audienceId: 'audience-id', email: 'fan@example.com' });
  });

  it('returns a service error when configuration is missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('RESEND_API_KEY', '');
    const token = signNewsletterToken('fan@example.com', { secret })!;
    expect((await GET(request(token))).status).toBe(503);
    expect(create).not.toHaveBeenCalled();
  });
});
