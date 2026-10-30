'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

export interface SendContactEmailResult {
  success: boolean;
  error?: string;
}

export async function sendContactEmail(formData: FormData): Promise<SendContactEmailResult> {
  const name = typeof formData.get('name') === 'string' ? (formData.get('name') as string) : '';
  const email = typeof formData.get('email') === 'string' ? (formData.get('email') as string) : '';
  const message = typeof formData.get('message') === 'string' ? (formData.get('message') as string) : '';

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (trimmedName.length < 2) {
    return { success: false, error: 'Please enter your name.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (trimmedMessage.length < 10) {
    return { success: false, error: 'Please write a message (at least 10 characters).' };
  }

  try {
    const { error } = await resend.emails.send({
      from: 'End Of All Known <booking@endofallknown.de>',
      to: process.env.CONTACT_EMAIL_RECIPIENT ?? 'booking@endofallknown.de',
      replyTo: trimmedEmail,
      subject: `End Of All Known – Contact from ${trimmedName}`,
      text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\n${trimmedMessage}`,
      html: `<p>Hi End Of All Known,</p><p><strong>${trimmedName}</strong> (${trimmedEmail}) wrote:</p><p>${trimmedMessage.replace(/\n/g, '<br />')}</p>`,
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
