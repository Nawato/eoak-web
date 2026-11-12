import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { send, headers } = vi.hoisted(() => ({
  send: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock('next/headers', () => ({ headers }));

import { newsletterIpRateLimiter, newsletterSharedRateLimiter } from '@/lib/form-rate-limit';
import { subscribeToNewsletter } from './newsletter';

function newsletterForm(email = 'fan@example.com'): FormData {
  const form = new FormData();
  form.set('email', email);
  form.set('privacyConsent', 'on');
  return form;
}

describe('subscribeToNewsletter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    newsletterIpRateLimiter.reset();
    newsletterSharedRateLimiter.reset();
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('RESEND_AUDIENCE_ID', 'audience-id');
    vi.stubEnv('NEWSLETTER_SIGNING_SECRET', 'test-newsletter-secret-with-enough-entropy');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'kontakt@endofallknown.de');
    headers.mockResolvedValue(new Headers());
    send.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends a signed confirmation email without adding the contact yet', async () => {
    expect(await subscribeToNewsletter(newsletterForm(' Fan@Example.com '))).toEqual({ success: true });
    expect(send).toHaveBeenCalledOnce();
    const payload = send.mock.calls[0][0];
    expect(payload.to).toBe('fan@example.com');
    expect(payload.from).toBe('End Of All Known <kontakt@endofallknown.de>');
    expect(payload.html).toContain('/api/newsletter/confirm?token=');
    expect(payload.text).toContain('/api/newsletter/confirm?token=');
    expect(payload.html).not.toContain('Fan@Example.com');
  });

  it('requires a valid email address', async () => {
    expect(await subscribeToNewsletter(newsletterForm('not-an-email'))).toEqual({
      success: false,
      error: 'Please enter a valid email address.',
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('requires privacy consent', async () => {
    const form = newsletterForm();
    form.delete('privacyConsent');
    expect(await subscribeToNewsletter(form)).toEqual({
      success: false,
      error: 'Please confirm the privacy notice before subscribing.',
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('silently accepts honeypot submissions', async () => {
    const form = newsletterForm();
    form.set('website', 'https://spam.example');
    expect(await subscribeToNewsletter(form)).toEqual({ success: true });
    expect(send).not.toHaveBeenCalled();
  });

  it('does not log raw email addresses when delivery fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    send.mockResolvedValue({
      error: { name: 'validation_error', statusCode: 422, message: 'fan@example.com' },
    });
    expect((await subscribeToNewsletter(newsletterForm())).success).toBe(false);
    expect(error.mock.calls.flat().join(' ')).not.toContain('fan@example.com');
  });

  it('reports missing configuration without contacting Resend', async () => {
    vi.stubEnv('RESEND_AUDIENCE_ID', '');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await subscribeToNewsletter(newsletterForm())).success).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it('applies a shared fallback limit when no trusted IP is configured', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-11-12T12:00:00Z'));
      vi.stubEnv('RELEASE_CLICK_IP_HEADER', '');
      headers.mockResolvedValue(new Headers({ 'x-forwarded-for': '198.51.100.9' }));
      for (let index = 0; index < 30; index++) {
        expect((await subscribeToNewsletter(newsletterForm())).success).toBe(true);
      }
      expect((await subscribeToNewsletter(newsletterForm())).error).toContain('Too many requests');
      vi.advanceTimersByTime(10 * 60 * 1000);
      expect((await subscribeToNewsletter(newsletterForm())).success).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rate limits per trusted client IP', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-11-12T12:00:00Z'));
      vi.stubEnv('RELEASE_CLICK_IP_HEADER', 'x-real-ip');
      headers.mockResolvedValue(new Headers({ 'x-real-ip': '192.0.2.55' }));
      for (let index = 0; index < 3; index++) {
        expect((await subscribeToNewsletter(newsletterForm())).success).toBe(true);
      }
      expect((await subscribeToNewsletter(newsletterForm())).error).toContain('Too many requests');
      vi.advanceTimersByTime(10 * 60 * 1000);
      expect((await subscribeToNewsletter(newsletterForm())).success).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
