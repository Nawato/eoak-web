import 'server-only';
import { cookies } from 'next/headers';
import { CONSENT_COOKIE_NAME, parseConsentCookie, type ConsentState } from './cookie-consent';

/**
 * Reads the media consent cookie in a Server Component. Pages that render
 * third-party embeds already opt into dynamic rendering, so this does not add
 * request-time work to otherwise static routes.
 */
export async function readConsent(): Promise<ConsentState | null> {
  const cookieStore = await cookies();
  return parseConsentCookie(cookieStore.get(CONSENT_COOKIE_NAME)?.value ?? null);
}
