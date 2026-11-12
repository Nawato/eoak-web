import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { send, getSiteSettings, headers } = vi.hoisted(() => ({
  send: vi.fn(),
  getSiteSettings: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock('next/headers', () => ({ headers }));
vi.mock('@/lib/sanity', () => ({ getSiteSettings }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/site', async () => import('../../lib/site'));

import { sendContactEmail } from './sendEmail';

function contactForm(email = 'fan@example.com'): FormData {
  const form = new FormData();
  form.set('name', 'A Fan');
  form.set('email', email);
  form.set('message', 'Hello, I would like to book the band.');
  form.set('privacyConsent', 'on');
  return form;
}

describe('sendContactEmail', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'kontakt@endofallknown.de');
    headers.mockResolvedValue(new Headers());
    getSiteSettings.mockResolvedValue({ contactEmail: 'kontakt@endofallknown.de' });
    send.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends to the fallback inbox with the visitor as reply-to when no channel is selected', async () => {
    expect(await sendContactEmail(contactForm())).toEqual({ success: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      from: 'End Of All Known <kontakt@endofallknown.de>',
      to: 'kontakt@endofallknown.de',
      replyTo: 'fan@example.com',
      text: expect.stringContaining('Email: fan@example.com'),
    }));
  });

  it('uses the default inbox for existing settings and ignores legacy or client recipients', async () => {
    getSiteSettings.mockResolvedValue({
      bookingEmail: 'old-booking@example.com',
      managementEmail: 'old-management@example.com',
    });
    vi.stubEnv('CONTACT_EMAIL_RECIPIENT', 'old-env@example.com');
    const form = contactForm();
    form.set('to', 'attacker@example.com');
    form.set('inquiryType', 'management');
    expect(await sendContactEmail(form)).toEqual({ success: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'kontakt@endofallknown.de' }));
  });

  it('honors the single contact email edited in Sanity', async () => {
    getSiteSettings.mockResolvedValue({ contactEmail: 'new-inbox@example.com' });
    await sendContactEmail(contactForm());
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'new-inbox@example.com',
      replyTo: 'fan@example.com',
    }));
  });

  it('requires the privacy consent checkbox', async () => {
    const form = contactForm();
    form.delete('privacyConsent');
    expect(await sendContactEmail(form)).toEqual({
      success: false,
      error: 'Please confirm the privacy notice before sending.',
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('routes to an enabled, configured contact channel', async () => {
    getSiteSettings.mockResolvedValue({
      contactEmail: 'fallback@example.com',
      contactChannels: [
        { key: 'booking', label: 'Booking', email: 'booking@example.com', enabled: true, order: 1 },
        { key: 'press', label: 'Press', email: 'press@example.com', enabled: true, order: 2 },
      ],
    });
    const form = contactForm();
    form.set('channel', 'press');
    expect(await sendContactEmail(form)).toEqual({ success: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'press@example.com',
      subject: expect.stringContaining('Press'),
      text: expect.stringContaining('Topic: Press'),
    }));
  });

  it('falls back to the single inbox when channel routing is disabled', async () => {
    getSiteSettings.mockResolvedValue({
      contactEmail: 'fallback@example.com',
      features: { contactChannels: false },
      contactChannels: [
        { key: 'booking', label: 'Booking', email: 'booking@example.com', enabled: true, order: 1 },
      ],
    });
    const form = contactForm();
    form.set('channel', 'booking');
    expect(await sendContactEmail(form)).toEqual({ success: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'fallback@example.com' }));
  });

  it('ignores unknown, disabled and malformed channel keys', async () => {
    getSiteSettings.mockResolvedValue({
      contactEmail: 'fallback@example.com',
      contactChannels: [
        { key: 'booking', label: 'Booking', email: 'booking@example.com', enabled: true, order: 1 },
        { key: 'old', label: 'Old', email: 'old@example.com', enabled: false, order: 2 },
        { key: 'evil', label: 'Evil', email: 'not-an-email', enabled: true, order: 3 },
      ],
    });
    for (const channel of ['missing', 'old', 'evil']) {
      const form = contactForm();
      form.set('channel', channel);
      expect(await sendContactEmail(form)).toEqual({ success: true });
    }
    for (const call of send.mock.calls) {
      expect(call[0]).toEqual(expect.objectContaining({ to: 'fallback@example.com' }));
    }
  });

  it.each(['', 'not-an-email', 'fan@example.com\r\nBcc: other@example.com'])(
    'rejects a missing or invalid visitor email: %j',
    async (email) => {
      expect(await sendContactEmail(contactForm(email))).toEqual({
        success: false,
        error: 'Please enter a valid email address.',
      });
      expect(send).not.toHaveBeenCalled();
    },
  );

  it('escapes visitor input in HTML', async () => {
    const form = contactForm();
    form.set('name', '<b>Fan</b>');
    form.set('message', '<script>alert("hello")</script>');
    await sendContactEmail(form);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      html: expect.stringContaining('&lt;script&gt;'),
    }));
    expect(send.mock.calls[0][0].html).not.toContain('<script>');
  });

  it.each(['name', 'email', 'message'])('rejects file input for the %s field', async (field) => {
    const form = contactForm();
    form.set(field, new Blob(['not a text field']), 'input.txt');
    expect((await sendContactEmail(form)).success).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it('reports a CMS failure instead of claiming delivery', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getSiteSettings.mockRejectedValue(new Error('Sanity unavailable'));
    expect(await sendContactEmail(contactForm())).toEqual({
      success: false,
      error: 'The email could not be sent. Please try again later.',
    });
    expect(send).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('reports a delivery error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    send.mockResolvedValue({ error: { message: 'Sender domain not verified' } });
    expect((await sendContactEmail(contactForm())).success).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('limits submissions per client and allows them again after the window expires', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-10-31T12:00:00Z'));
      vi.stubEnv('RELEASE_CLICK_IP_HEADER', 'x-real-ip');
      headers.mockResolvedValue(new Headers({ 'x-real-ip': '192.0.2.10' }));
      for (let index = 0; index < 3; index++) expect((await sendContactEmail(contactForm())).success).toBe(true);
      expect((await sendContactEmail(contactForm())).error).toContain('Too many messages');
      vi.advanceTimersByTime(10 * 60 * 1000);
      expect((await sendContactEmail(contactForm())).success).toBe(true);
    } finally { vi.useRealTimers(); }
  });

  it('ignores forwarded headers when no trusted header is configured', async () => {
    vi.stubEnv('RELEASE_CLICK_IP_HEADER', '');
    headers.mockResolvedValue(new Headers({
      'x-real-ip': '198.51.100.7',
      'x-vercel-forwarded-for': '198.51.100.7',
      'x-forwarded-for': '198.51.100.7',
    }));
    for (let index = 0; index < 5; index++) expect((await sendContactEmail(contactForm())).success).toBe(true);
  });

  it('does not throttle when the configured header has no valid IP', async () => {
    vi.stubEnv('RELEASE_CLICK_IP_HEADER', 'x-real-ip');
    headers.mockResolvedValue(new Headers({ 'x-real-ip': 'not-an-ip' }));
    for (let index = 0; index < 5; index++) expect((await sendContactEmail(contactForm())).success).toBe(true);
  });

  it('bounds the number of retained clients even when every request uses a new address', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-11-01T12:00:00Z'));
      vi.stubEnv('RELEASE_CLICK_IP_HEADER', 'x-real-ip');
      for (let index = 0; index < 1000; index++) {
        const ip = `10.0.${Math.floor(index / 256)}.${index % 256}`;
        headers.mockResolvedValue(new Headers({ 'x-real-ip': ip }));
        expect((await sendContactEmail(contactForm())).success).toBe(true);
      }
      headers.mockResolvedValue(new Headers({ 'x-real-ip': '10.0.3.232' }));
      expect((await sendContactEmail(contactForm())).error).toContain('Too many messages');
      vi.advanceTimersByTime(10 * 60 * 1000);
      expect((await sendContactEmail(contactForm())).success).toBe(true);
    } finally { vi.useRealTimers(); }
  });
});
