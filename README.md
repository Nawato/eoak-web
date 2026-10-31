# End Of All Known – Website

Official website of the metalcore band **End Of All Known**. A Next.js frontend whose content is managed in Sanity Studio.

## Features

- Hero with band photo background and logo (PNG or SVG), both editable in Sanity
- Discography, band members, streaming links and merch button
- Music (YouTube and Spotify embeds, loaded only after consent), tour dates (Bandsintown), bio and press release, gallery with lightbox, press kit PDF
- One contact form for booking and management, sent to `kontakt@endofallknown.de`; visitors must provide their own email for replies
- Impressum and Datenschutz pages, sitemap, robots, Open Graph image
- Security headers and CSP, honeypot and rate limiting on the contact form, signed webhook for cache revalidation

## Structure

| Folder | Description |
| --- | --- |
| `web/` | Next.js app (App Router, React, Tailwind CSS) |
| `studio/` | Standalone Sanity Studio |
| `docs/` | Project notes |

Sanity project `lru32awc`, dataset `production`.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm run install:all          # installs web/ and studio/
cp web/.env.example web/.env.local   # then fill in the values
npm run dev:web              # http://localhost:3000
npm run dev:studio           # http://localhost:3333
```

Allow the site origin in Sanity (once per origin):

```bash
cd studio && npx sanity cors add http://localhost:3000 --credentials
```

## Environment variables (`web/.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Sanity project (required) |
| `SANITY_API_READ_TOKEN` | Only for private datasets or drafts |
| `RESEND_API_KEY` | Sends contact emails ([resend.com](https://resend.com)); server-only |
| `CONTACT_FROM_EMAIL` | Sender address on a domain verified in Resend; defaults to `kontakt@endofallknown.de` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, sitemap, Open Graph |
| `SANITY_REVALIDATE_SECRET` | Secret for the revalidation webhook |

Never commit `.env.local` or put secrets in `NEXT_PUBLIC_` variables.

## Managing content in Sanity

The Studio has three single documents plus two lists (**Releases** and **Band Members**, ordered by release date / order number):

- **Site Settings** – band name, logo, hero background photo (with hotspot and alt text), hero text, share image, favicon, social links, YouTube and Spotify URLs, streaming and merch links, Bandsintown name, contact email
- **Press Kit** – biography, press release, press kit PDF, gallery
- **Impressum** – legal details

Until a logo or photo is uploaded, the site shows the band name and a gradient background.

Deploy the Studio after schema changes (requires `npx sanity login`):

```bash
cd studio
npm run deploy          # hosted Studio
npm run deploy-schema   # schema only
```

### Instant updates (webhook)

Content is cached for 60 seconds. For instant updates, create a webhook in Sanity (manage.sanity.io → API → Webhooks):

- URL: `https://<your-domain>/api/revalidate`
- Method POST, with a secret equal to `SANITY_REVALIDATE_SECRET`

## Contact form

All inquiries go to the single **Contact Email** in Sanity Site Settings, defaulting to `kontakt@endofallknown.de` if that field is not yet set. Legacy booking/management fields and recipient environment variables are no longer used.

Visitors must enter their own valid email address. It is included in the message and used as **Reply-To**, so replying reaches the visitor. The **From** address stays on your Resend-verified domain to avoid spoofing visitors' addresses and failing email authentication.

## Scripts (in `web/`)

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
npm test         # Vitest
```

## Deployment

Deploy `web/` (for example on Vercel with `web` as the root directory). Set all environment variables above in the host, add the production origin to Sanity CORS, and configure the revalidation webhook.
