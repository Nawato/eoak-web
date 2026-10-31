'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';
import { getSiteSettings } from '@/lib/sanity';
import { defaultContactEmail } from '@/lib/site';

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recentSubmissions = new Map<string, number[]>();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Best-effort per-instance limit; use a shared store (e.g. Upstash) for strict enforcement.
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (recentSubmissions.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(key, recent);
    return true;
  }
  recent.push(now);
  recentSubmissions.set(key, recent);
  if (recentSubmissions.size > 1000) {
    for (const [k, times] of recentSubmissions) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) recentSubmissions.delete(k);
    }
  }
  return false;
}

export interface SendContactEmailResult {
  success: boolean;
  error?: string;
}

export async function sendContactEmail(formData: FormData): Promise<SendContactEmailResult> {
  const name = typeof formData.get('name') === 'string' ? (formData.get('name') as string) : '';
  const email = typeof formData.get('email') === 'string' ? (formData.get('email') as string) : '';
  const message = typeof formData.get('message') === 'string' ? (formData.get('message') as string) : '';

  const honeypot = formData.get('website');
  if (typeof honeypot === 'string' && honeypot.length > 0) {
    return { success: true };
  }

  const trimmedName = name.replace(/[\r\n]+/g, ' ').trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (trimmedName.length < 2 || trimmedName.length > MAX_NAME) {
    return { success: false, error: 'Please enter your name.' };
  }
  if (trimmedEmail.length > MAX_EMAIL || !EMAIL_PATTERN.test(trimmedEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (trimmedMessage.length < 10 || trimmedMessage.length > MAX_MESSAGE) {
    return { success: false, error: `Please write a message (10 to ${MAX_MESSAGE} characters).` };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured.');
    return { success: false, error: 'The email could not be sent. Please try again later.' };
  }

  const requestHeaders = await headers();
  // Prefer headers set by the hosting platform; x-forwarded-for can be spoofed by clients.
  const clientIp =
    requestHeaders.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    requestHeaders.get('x-real-ip')?.trim() ||
    null;
  // Without a trustworthy IP we skip the per-client limit instead of throttling every visitor together.
  if (clientIp && isRateLimited(clientIp)) {
    return { success: false, error: 'Too many messages. Please try again later.' };
  }

  const resend = new Resend(apiKey);

  try {
    // Ignore legacy booking/management addresses and all client-supplied recipients.
    const recipient = (await getSiteSettings())?.contactEmail ?? defaultContactEmail;
    if (recipient.length > MAX_EMAIL || !EMAIL_PATTERN.test(recipient)) {
      console.error('Invalid contact email in Sanity Site Settings.');
      return { success: false, error: 'The email could not be sent. Please try again later.' };
    }

    const { error } = await resend.emails.send({
      from: `End Of All Known <${process.env.CONTACT_FROM_EMAIL ?? defaultContactEmail}>`,
      to: recipient,
      replyTo: trimmedEmail,
      subject: `End Of All Known – Contact from ${trimmedName}`,
      text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\n${trimmedMessage}`,
      html: `<p>Contact inquiry:</p><p><strong>${escapeHtml(trimmedName)}</strong> (${escapeHtml(trimmedEmail)}) wrote:</p><p>${escapeHtml(trimmedMessage).replace(/\n/g, '<br />')}</p>`,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: 'The email could not be sent. Please try again later.' };
    }

    return { success: true };
  } catch (e) {
    console.error('Failed to send contact email:', e);
    return { success: false, error: 'The email could not be sent. Please try again later.' };
  }
}
