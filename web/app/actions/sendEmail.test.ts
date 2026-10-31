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
vi.mock('@/lib/site', async () => import('../../lib/site'));

import { sendContactEmail } from './sendEmail';

function contactForm(email = 'fan@example.com'): FormData {
  const form = new FormData();
  form.set('name', 'A Fan');
  form.set('email', email);
  form.set('message', 'Hello, I would like to book the band.');
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

  it('sends to the single inbox with the visitor as reply-to, without an inquiry choice', async () => {
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
});
