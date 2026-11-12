'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';
import { getTrustedClientIp } from '@/lib/client-ip';
import {
  isFormSubmissionRateLimited,
  newsletterIpRateLimiter,
  newsletterSharedRateLimiter,
} from '@/lib/form-rate-limit';
import { defaultContactEmail, siteUrl } from '@/lib/site';
import {
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
  signNewsletterToken,
} from '@/lib/newsletter';

export interface SubscribeToNewsletterResult {
  success: boolean;
  error?: string;
}

function hasConsent(formData: FormData): boolean {
  const value = formData.get('privacyConsent');
  return value === 'on' || value === 'true';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function subscribeToNewsletter(formData: FormData): Promise<SubscribeToNewsletterResult> {
  const honeypot = formData.get('website');
  if (typeof honeypot === 'string' && honeypot.length > 0) {
    return { success: true };
  }

  const rawEmail = formData.get('email');
  const email = typeof rawEmail === 'string' ? normalizeNewsletterEmail(rawEmail) : '';

  if (!isValidNewsletterEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!hasConsent(formData)) {
    return { success: false, error: 'Please confirm the privacy notice before subscribing.' };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();
  if (!apiKey || !audienceId) {
    console.error('Newsletter is not configured (RESEND_API_KEY / RESEND_AUDIENCE_ID).');
    return { success: false, error: 'The newsletter is currently unavailable. Please try again later.' };
  }

  const requestHeaders = await headers();
  const clientIp = getTrustedClientIp(requestHeaders, process.env.RELEASE_CLICK_IP_HEADER);
  if (isFormSubmissionRateLimited(clientIp, newsletterIpRateLimiter, newsletterSharedRateLimiter)) {
    return { success: false, error: 'Too many requests. Please try again later.' };
  }

  const token = signNewsletterToken(email);
  if (!token) {
    console.error('Newsletter signing secret is not configured.');
    return { success: false, error: 'The newsletter is currently unavailable. Please try again later.' };
  }

  const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: `End Of All Known <${process.env.CONTACT_FROM_EMAIL ?? defaultContactEmail}>`,
      to: email,
      subject: 'Please confirm your newsletter subscription',
      text: `Thanks for signing up for the End Of All Known newsletter.\n\nPlease confirm your subscription within 48 hours:\n${confirmUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Thanks for signing up for the End Of All Known newsletter.</p><p>Please confirm your subscription within 48 hours:</p><p><a href="${escapeHtml(confirmUrl)}">Confirm subscription</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });

    if (error) {
      // Never log the recipient address or provider payloads that may contain it.
      console.error('Newsletter confirmation email failed:', error.name, error.statusCode);
      return { success: false, error: 'The confirmation email could not be sent. Please try again later.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Newsletter confirmation email failed:', error instanceof Error ? error.name : 'unknown error');
    return { success: false, error: 'The confirmation email could not be sent. Please try again later.' };
  }
}
