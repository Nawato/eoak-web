import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  createConsentState,
  normalizeConsentMedia,
  serializeConsentCookie,
} from '@/lib/cookie-consent';

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  // Same-origin fetch requests may omit Origin; a supplied Origin must match.
  if (!origin) return true;
  const host = request.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

/** Use the externally visible protocol (TLS-terminating proxies set this header). */
function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  if (forwarded) return forwarded === 'https';
  return new URL(request.url).protocol === 'https:';
}

function isLocalhost(request: Request): boolean {
  // URL.hostname keeps IPv6 brackets, e.g. "[::1]".
  const hostname = new URL(request.url).hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost')
  );
}

/** Stores the granular media selection in the first-party consent cookie. */
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const media = normalizeConsentMedia(payload);
  if (!media) {
    return NextResponse.json({ error: 'Invalid consent selection.' }, { status: 400 });
  }

  const updatedAt = Date.now();
  const state = createConsentState(media, updatedAt);
  const cookieStore = await cookies();
  // Next.js encodes the cookie value; store the JSON as-is to avoid double encoding.
  cookieStore.set(CONSENT_COOKIE_NAME, serializeConsentCookie(state), {
    path: '/',
    sameSite: 'lax',
    // Derive Secure from the actual request scheme so a TLS-terminating proxy
    // or a plain-HTTP non-local deployment cannot make the cookie unusable.
    secure: isSecureRequest(request) && !isLocalhost(request),
    httpOnly: false,
    maxAge: CONSENT_COOKIE_MAX_AGE_SECONDS,
  });

  return NextResponse.json(
    { media, updatedAt },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
