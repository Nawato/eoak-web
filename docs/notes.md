# Notes

## Before pushing

Run the full check suite from the repository root:

```bash
npm run verify
```

This runs ESLint, TypeScript, the Vitest suite and a production build for `web/`.

## Environment

- Copy `web/.env.example` to `web/.env.local` for local development. Never commit real credentials.
- `NEXT_PUBLIC_SITE_URL` is required in production so canonical, Open Graph and sitemap URLs never point at localhost.
- `RELEASE_CLICK_IP_HEADER` must name a header your reverse proxy overwrites with the real client IP. If it is empty, per-visitor click deduplication and contact-form rate limiting are skipped instead of trusting a spoofable header.
- Keep dependencies current and check for advisories (`npm audit` in `web/` and `studio/`).
