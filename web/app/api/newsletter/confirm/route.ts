import { Resend } from 'resend';
import { verifyNewsletterToken } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

const MAX_CONFIRM_TOKEN_LENGTH = 4096;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function page(title: string, message: string, status: number, formToken?: string): Response {
  const form = formToken
    ? `<form method="post" action="/api/newsletter/confirm">
  <input type="hidden" name="token" value="${escapeHtml(formToken)}" />
  <button type="submit">Confirm subscription</button>
</form>`
    : '';
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<meta name="referrer" content="no-referrer" />
<title>${escapeHtml(title)} | End Of All Known</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090b;color:#e4e4e7;font-family:system-ui,sans-serif}main{max-width:32rem;padding:2rem;text-align:center}h1{font-size:1.5rem;text-transform:uppercase;letter-spacing:.12em}a{color:#fb7185}button{margin:1.5rem 0;padding:.8rem 1.4rem;border:0;border-radius:2px;background:#e11d48;color:#fff;font:inherit;font-weight:600;cursor:pointer}button:hover{background:#be123c}</style>
</head>
<body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${form}<p><a href="/" rel="noreferrer">Back to the homepage</a></p></main></body>
</html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
        'Referrer-Policy': 'no-referrer',
      },
    },
  );
}

function tokenFromQuery(request: Request): string {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  return token.length <= MAX_CONFIRM_TOKEN_LENGTH ? token : '';
}

/**
 * Renders a confirmation form instead of performing the subscription. Mail
 * scanners, link previews and prefetchers can issue GET requests, so the
 * state-changing step must be an explicit POST.
 */
export async function GET(request: Request): Promise<Response> {
  const token = tokenFromQuery(request);
  const verified = verifyNewsletterToken(token);
  if (!verified) {
    return page(
      'Confirmation failed',
      'This confirmation link is invalid or has expired. Please sign up again to receive a new link.',
      400,
    );
  }
  return page(
    'Confirm your subscription',
    'Click the button below to confirm your newsletter subscription.',
    200,
    token,
  );
}

export async function POST(request: Request): Promise<Response> {
  let token = '';
  try {
    const form = await request.formData();
    const value = form.get('token');
    if (typeof value === 'string') token = value;
  } catch {
    return page(
      'Confirmation failed',
      'This confirmation link is invalid or has expired. Please sign up again to receive a new link.',
      400,
    );
  }

  if (!token || token.length > MAX_CONFIRM_TOKEN_LENGTH) {
    return page(
      'Confirmation failed',
      'This confirmation link is invalid or has expired. Please sign up again to receive a new link.',
      400,
    );
  }

  const verified = verifyNewsletterToken(token);
  if (!verified) {
    return page(
      'Confirmation failed',
      'This confirmation link is invalid or has expired. Please sign up again to receive a new link.',
      400,
    );
  }

  return confirmSubscription(verified.email);
}

async function confirmSubscription(email: string): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();
  if (!apiKey || !audienceId) {
    console.error('Newsletter confirmation is not configured.');
    return page(
      'Newsletter unavailable',
      'The newsletter is currently unavailable. Please try again later.',
      503,
    );
  }

  const resend = new Resend(apiKey);
  try {
    const created = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: false,
    });

    if (!created.error) {
      return page('Subscription confirmed', 'You are now subscribed to the newsletter. Thank you!', 200);
    }

    // The Resend API is not transactional; if the contact already exists, treat
    // the confirmation as successful so repeated clicks remain safe.
    const existing = await resend.contacts.get({ audienceId, email });
    if (!existing.error && existing.data?.email) {
      return page('Subscription confirmed', 'You are already subscribed to the newsletter.', 200);
    }

    console.error('Newsletter contact creation failed:', created.error.name, created.error.statusCode);
    return page(
      'Confirmation failed',
      'We could not confirm your subscription. Please try again later.',
      502,
    );
  } catch (error) {
    console.error('Newsletter contact creation failed:', error instanceof Error ? error.name : 'unknown error');
    return page(
      'Confirmation failed',
      'We could not confirm your subscription. Please try again later.',
      502,
    );
  }
}
