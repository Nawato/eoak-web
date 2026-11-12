'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';
import { getSiteSettings } from '@/lib/sanity';
import { resolveFeatures } from '@/lib/features';
import { defaultContactEmail } from '@/lib/site';
import { getTrustedClientIp } from '@/lib/client-ip';
import {
  contactIpRateLimiter,
  contactSharedRateLimiter,
  isFormSubmissionRateLimited,
} from '@/lib/form-rate-limit';
import { getContactChannelByKey, getEnabledContactChannels, isValidContactEmail } from '@/lib/contact';

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hasConsent(formData: FormData): boolean {
  const value = formData.get('privacyConsent');
  return value === 'on' || value === 'true';
}

export interface SendContactEmailResult {
  success: boolean;
  error?: string;
}

export async function sendContactEmail(formData: FormData): Promise<SendContactEmailResult> {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  const channelKey = formData.get('channel');

  const honeypot = formData.get('website');
  if (typeof honeypot === 'string' && honeypot.length > 0) {
    return { success: true };
  }

  const trimmedName = typeof name === 'string' ? name.replace(/[\r\n]+/g, ' ').trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (trimmedName.length < 2 || trimmedName.length > MAX_NAME) {
    return { success: false, error: 'Please enter your name.' };
  }
  if (trimmedEmail.length > MAX_EMAIL || !isValidContactEmail(trimmedEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (trimmedMessage.length < 10 || trimmedMessage.length > MAX_MESSAGE) {
    return { success: false, error: `Please write a message (10 to ${MAX_MESSAGE} characters).` };
  }
  if (!hasConsent(formData)) {
    return { success: false, error: 'Please confirm the privacy notice before sending.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured.');
    return { success: false, error: 'The email could not be sent. Please try again later.' };
  }

  const requestHeaders = await headers();
  // Only trust a header that the hosting proxy is configured to overwrite (shared with /go).
  // When no trusted IP is available, fall back to a conservative shared limit instead of
  // disabling throttling entirely.
  const clientIp = getTrustedClientIp(requestHeaders, process.env.RELEASE_CLICK_IP_HEADER);
  if (isFormSubmissionRateLimited(clientIp, contactIpRateLimiter, contactSharedRateLimiter)) {
    return { success: false, error: 'Too many messages. Please try again later.' };
  }

  const resend = new Resend(apiKey);

  try {
    const settings = await getSiteSettings();
    const features = resolveFeatures(settings?.features);
    // A forged key cannot route mail through channels while the channel UI is disabled.
    const channels = features.contactChannels ? getEnabledContactChannels(settings?.contactChannels) : [];
    const selected = getContactChannelByKey(channels, typeof channelKey === 'string' ? channelKey : null);
    // Only route to a validated, editor-configured channel. Unknown keys, disabled
    // channels and missing selections all fall back to the single contact inbox.
    const recipient = selected?.email ?? settings?.contactEmail ?? defaultContactEmail;
    if (!isValidContactEmail(recipient)) {
      console.error('Invalid contact email in Sanity Site Settings.');
      return { success: false, error: 'The email could not be sent. Please try again later.' };
    }

    const topic = selected?.label;
    const { error } = await resend.emails.send({
      from: `End Of All Known <${process.env.CONTACT_FROM_EMAIL ?? defaultContactEmail}>`,
      to: recipient,
      replyTo: trimmedEmail,
      subject: `End Of All Known – ${topic ? `${topic}: ` : ''}Contact from ${trimmedName}`,
      text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}${topic ? `\nTopic: ${topic}` : ''}\n\n${trimmedMessage}`,
      html: `<p>Contact inquiry${topic ? ` (${escapeHtml(topic)})` : ''}:</p><p><strong>${escapeHtml(trimmedName)}</strong> (${escapeHtml(trimmedEmail)}) wrote:</p><p>${escapeHtml(trimmedMessage).replace(/\n/g, '<br />')}</p>`,
    });

    if (error) {
      console.error('Resend error:', error.name, error.statusCode);
      return { success: false, error: 'The email could not be sent. Please try again later.' };
    }

    return { success: true };
  } catch (e) {
    console.error('Failed to send contact email:', e instanceof Error ? e.name : 'unknown error');
    return { success: false, error: 'The email could not be sent. Please try again later.' };
  }
}
