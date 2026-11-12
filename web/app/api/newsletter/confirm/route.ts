import { Resend } from 'resend';
import { verifyNewsletterToken } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

function page(title: string, message: string, status: number): Response {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${title} | End Of All Known</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090b;color:#e4e4e7;font-family:system-ui,sans-serif}main{max-width:32rem;padding:2rem;text-align:center}h1{font-size:1.5rem;text-transform:uppercase;letter-spacing:.12em}a{color:#fb7185}</style>
</head>
<body><main><h1>${title}</h1><p>${message}</p><p><a href="/">Back to the homepage</a></p></main></body>
</html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    },
  );
}

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const verified = verifyNewsletterToken(token);
  if (!verified) {
    return page(
      'Confirmation failed',
      'This confirmation link is invalid or has expired. Please sign up again to receive a new link.',
      400,
    );
  }

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
      email: verified.email,
      unsubscribed: false,
    });

    if (!created.error) {
      return page('Subscription confirmed', 'You are now subscribed to the newsletter. Thank you!', 200);
    }

    // The Resend API is not transactional; if the contact already exists, treat
    // the confirmation as successful so repeated clicks remain safe.
    const existing = await resend.contacts.get({ audienceId, email: verified.email });
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
