# Notes

## Before pushing

Run the full check suite from the repository root:

```bash
npm run verify
```

This runs ESLint, TypeScript, the Vitest suite and a production build for `web/`.

## Environment

- Copy `web/.env.example` to `web/.env.local` for local development. Never commit real credentials.
- `NEXT_PUBLIC_SITE_URL` is required in production and must be an absolute HTTPS URL so canonical, Open Graph, sitemap and newsletter confirmation links never use plaintext or localhost.
- `RELEASE_CLICK_IP_HEADER` must name a header your reverse proxy overwrites with the real client IP. If it is empty, per-visitor click deduplication is skipped and contact/newsletter submissions use a conservative shared rate limit instead of trusting a spoofable header.
- To open the dev server from another device on the LAN or through a tunnel, set `ALLOWED_DEV_ORIGINS` to the comma-separated hostnames (no scheme or port), e.g. `192.168.178.*,*.tunnel.example.com`. This only affects development.
- Keep dependencies current and check for advisories (`npm audit` in `web/` and `studio/`).
- Native newsletter signup is active only when `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` and a signing secret are configured. Set `NEWSLETTER_SIGNING_SECRET` to an independent random value of at least 32 characters; `SESSION_SECRET` is only a fallback. Otherwise the section uses `newsletterSignupUrl` when set and stays hidden when neither exists.
- Newsletter confirmation links are HMAC-signed and expire after 48 hours. Do not log raw addresses or tokens. The confirmation route is idempotent and adds subscribers to the configured Resend Audience only after confirmation.
- `/press` is a redirect, not a content page. It returns 307 only when the Press feature is enabled and `pressUrl` is valid HTTPS; otherwise it returns 404.
- Public pages follow both feature flags and content availability: `/releases`, `/tour`, `/gallery`, the newsletter section, press links and the sitemap are hidden when disabled or empty. Release campaign overrides can only disable a globally enabled feature.
- Relevant Sanity webhook types are `siteSettings`, `pressKit`, `impressum`, `release`, `member`, `show`, `photo` and `video`.
