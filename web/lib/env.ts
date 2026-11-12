import 'server-only';

const MIN_SECRET_LENGTH = 32;

/** Trimmed env value, treating empty strings (e.g. `VAR=""` from .env.example) as unset. */
export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function requiredEnv(name: string): string {
  const value = optionalEnv(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// Public origin without a trailing slash. Fails fast in production instead of
// silently emitting localhost canonical, Open Graph and sitemap URLs.
export const siteUrl = (() => {
  const configured = optionalEnv('NEXT_PUBLIC_SITE_URL');
  if (configured) return configured.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is required in production (e.g. https://example.com). Refusing to fall back to localhost.',
    );
  }
  return 'http://localhost:3000';
})();

function assertSecret(name: string, value: string | undefined): void {
  if (value && value.length < MIN_SECRET_LENGTH) {
    throw new Error(`${name} must be at least ${MIN_SECRET_LENGTH} characters.`);
  }
}

// Called once from instrumentation.ts before the server handles requests.
export function validateServerEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;
  requiredEnv('NEXT_PUBLIC_SANITY_PROJECT_ID');
  requiredEnv('NEXT_PUBLIC_SANITY_DATASET');
  assertSecret('RELEASE_CLICK_HASH_SECRET', optionalEnv('RELEASE_CLICK_HASH_SECRET'));
  assertSecret(
    'SESSION_SECRET / RELEASE_CLICK_CLEANUP_SECRET',
    optionalEnv('SESSION_SECRET') ?? optionalEnv('RELEASE_CLICK_CLEANUP_SECRET'),
  );
  assertSecret('NEWSLETTER_SIGNING_SECRET', optionalEnv('NEWSLETTER_SIGNING_SECRET'));
}
