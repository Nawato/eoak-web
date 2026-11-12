const isDev = process.env.NODE_ENV !== 'production';

// Development-only: hostnames (without scheme/port) allowed to request dev
// assets and HMR when the dev server is opened from another device or tunnel.
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ''}https://widget.bandsintown.com https://rest.bandsintown.com`,
  "style-src 'self' 'unsafe-inline' https://*.bandsintown.com",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.bandsintown.com https://*.cdninstagram.com https://*.fbcdn.net",
  "font-src 'self' data:",
  "connect-src 'self' https://*.bandsintown.com",
  'frame-src https://www.youtube-nocookie.com https://open.spotify.com https://*.bandsintown.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]),
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  allowedDevOrigins,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        // Only optimize images from this project, not arbitrary Sanity-hosted files.
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/**`,
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
