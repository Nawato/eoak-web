# End Of All Known – Website

Official website of the metalcore band **End Of All Known**. A Next.js frontend whose content is managed in Sanity Studio.

## Features

- Hero with band photo background and logo (PNG or SVG), both editable in Sanity
- Discography, band members, streaming links and merch button
- Music (YouTube and Spotify embeds, loaded only after consent), tour dates (Bandsintown), bio and press release, press kit PDF
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
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | Server-only Instagram professional account token and numeric user ID for the latest-six photo feed |

Never commit `.env.local` or put secrets in `NEXT_PUBLIC_` variables.

## Managing content in Sanity

The Studio has three single documents plus two lists (**Releases** and **Band Members**, ordered by release date / order number):

- **Site Settings** – band name, logo, hero background photo (with hotspot and alt text), hero text, share image, favicon, social links, YouTube and Spotify URLs, streaming and merch links, Bandsintown name, contact email
- **Press Kit** – biography, press release, complete press kit link (e.g. Google Drive), editable button label, optional fallback PDF
- **Impressum & Datenschutz** (same existing document) – operator identity, conditional legal disclosures and deployment-specific privacy details

Until a logo or photo is uploaded, the site shows the band name and a gradient background.

**Site Settings** is organized into **Site-wide** (branding, social links, sharing and footer credits), **Home Page** (hero, music, tour dates, Instagram and contact), and **Page Backgrounds**. Backgrounds have separate tabs for **Home Page**, **Impressum**, and **Privacy / Datenschutz**. Press text, releases, members and Impressum content remain in their dedicated documents. This organization does not move or reset any saved content or assets.

**Site Settings → Hero Logo** controls the large front-page logo; **Header Logo** controls the compact navigation logo independently. Both accept PNG, SVG or WebP. An unset header logo shows the band name as text, not the hero logo.

Use **Site Settings → Hero Photo Darkening (%)** to balance photo visibility and text readability (default 55%). Releases and Band navigation links appear only when their sections have published content. On smaller screens the menu collapses to avoid crowding. Embedded media also works when browser storage is blocked; in that case consent lasts until the page is reloaded.

Tour dates require **Load Bandsintown content** consent. Set the exact band profile name in **Home Page → Tour Dates → Bandsintown Artist Name**. Past dates are hidden. The widget uses Bandsintown's JSONP event endpoint, so `rest.bandsintown.com` must be permitted by both `script-src` and `connect-src` in the website CSP. A direct Bandsintown search link remains available if an ad blocker or network error prevents loading.

Set **Site Settings → Home Page → Tour Dates → Bandsintown Link** to change the destination of **View shows on Bandsintown** (HTTPS). Leave it empty to keep the artist-name search fallback. This link does not change the artist used by the embedded widget.

Under **Site Settings → Page & Section Backgrounds**, set independent photos for Music, Releases, Tour Dates, Bio / Press, The Band, Contact, Impressum and Privacy / Datenschutz. Each has a hotspot, optional image description and darkening control (default 65%). Photos fade into the page at the edges; areas without an image keep their original styling. The hero uses its existing separate settings.

Add photographers under **Site Settings → Photographer Credits** with their names, optional websites/social profiles and photo attributions (e.g. live photos, member portraits or hero photo). Reorder entries by dragging them in Sanity. They appear at the bottom of every page; **Credits Heading** controls the section title. The section stays hidden until credits are added. Upload member portraits through **Band Members**; additional press photos can remain in your linked Google Drive EPK.

For the complete press kit, paste your Google Drive folder URL into **Press Kit → Complete Press Kit Link**. In Google Drive, set sharing to **Anyone with the link → Viewer** and check access in a signed-out browser. The button opens the folder in a new tab; Google Drive is not embedded or loaded before a click. If no valid HTTPS link is configured, the existing PDF download remains available.

Deploy the Studio after schema changes (requires `npx sanity login`):

```bash
cd studio
npm run deploy          # hosted Studio
npm run deploy-schema   # schema only
```

### Instant updates (webhook)

Publish your edits in Studio to make them visible on the website; uploading an image only saves a draft until you publish. Refresh the local website after publishing. Local development bypasses the content cache and Sanity CDN so published edits appear on refresh.

In production, content is cached for 60 seconds. For faster updates, create a webhook in Sanity (manage.sanity.io → API → Webhooks):

- URL: `https://<your-domain>/api/revalidate`
- Method POST, with a secret equal to `SANITY_REVALIDATE_SECRET`

## Latest Instagram photos

The website automatically displays the account's latest six posts as complete images, without Instagram's embed UI. Carousel posts show their cover image; videos/reels show their thumbnail and open the original post when clicked. Fewer than six posts are shown if the account has fewer posts. Photos load only after visitor consent, directly from Meta's CDN. No scraping or third-party feed subscription is used.

Setup requires the band's **Business or Creator** Instagram account:

1. Create a Meta developer app with **Instagram API with Instagram Login**, and connect the band's account under **Instagram → API setup with Instagram business login**. For an account you own/manage, Standard Access is sufficient; add the account to the app.
2. Grant `instagram_business_basic` and use **Generate token** beside the account in the Meta App Dashboard. Store the long-lived token as `INSTAGRAM_ACCESS_TOKEN` in `web/.env.local` and your deployment host's environment settings.
3. Obtain the numeric Instagram user ID from the `/me?fields=user_id,username` endpoint using that token; set it as `INSTAGRAM_USER_ID`. The profile username/URL is not a user ID. See [Meta's setup guide](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started).
4. Restart/redeploy the website. API responses are cached for 15 minutes; updates appear on subsequent visits after cache revalidation. Long-lived tokens expire after 60 days: refresh them using Meta's refresh endpoint before expiry or generate a replacement and update the host. This site does not implement OAuth or automatic token renewal.

The section and navigation link are hidden until credentials are configured. Invalid/expired credentials or API outages produce an unavailable message with the follow link; diagnostic errors are logged server-side without tokens. The section heading (also used in navigation), follow button label and background remain editable in Sanity. The follow link uses the Instagram entry under **Social Links**. Previously curated post URLs are no longer used. Deploy the updated Studio and website, including the updated image CSP.

## Contact delivery
All inquiries go to the single **Contact Email** in Sanity Site Settings, defaulting to `kontakt@endofallknown.de` if that field is not yet set. Legacy booking/management fields and recipient environment variables are no longer used.

Visitors must enter their own valid email address. It is included in the message and used as **Reply-To**, so replying reaches the visitor. The **From** address stays on your Resend-verified domain to avoid spoofing visitors' addresses and failing email authentication.

## Legal pages: required setup before launch

The German legal pages describe the implemented data flows; they are not a legal certification. In **Impressum & Datenschutz**, complete and publish the **Verantwortlicher**, **Impressum** and **Datenschutz** tabs. Existing operator data remains in the same document. Old TMG wording is no longer rendered; the imprint uses § 5 DDG. No sample address, telephone number or legal representative is prefilled for new documents.

Provide the actual legally responsible person/entity and service address, email and means of direct contact; add legal form, representatives, register, VAT/business ID and editorial responsibility only where applicable. Review § 36 VSBG applicability and the actual dispute-resolution statement. Do not publish a private tax number or link to the discontinued EU ODR platform.

Privacy setup requires the actual host's name/address, processing locations and log retention; mailbox/Resend provider details and message/log deletion periods; actual third-country recipients and Art. 45/46 safeguards with access to copies; and the competent supervisory authority. Add DPO details if appointed. Unknown details remain explicitly marked as missing on the public page instead of being invented. Sanity validation requires the core privacy fields before publishing.

Before production, verify these disclosures against your host, proxy logs, provider contracts and account retention settings, conclude necessary Art. 28 processing agreements, and verify any third-country transfer basis (do not assume DPF certification). New tracking/services require a new assessment. Obtain a qualified German/EU legal review for your actual business and deployment; filling these fields alone does not establish compliance.

Visitors can revoke all four media-provider choices on `/datenschutz`, in addition to the controls on each media block. Consent preferences currently have no automatic expiry; the notice explicitly describes this. Browser tests should confirm no provider requests before opt-in and withdrawal on your deployed site.

References: [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html), [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html), [GDPR, especially Arts. 13, 21, 28 and 44–49](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [§ 36 VSBG](https://www.gesetze-im-internet.de/vsbg/__36.html).

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

## Third-party icons

Social brand logos use [Simple Icons](https://simpleicons.org/). See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for licensing and trademark information. Social profile links remain editable in Sanity Site Settings.
