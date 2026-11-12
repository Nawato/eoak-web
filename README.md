# End Of All Known - Website

Official website of **End Of All Known**, built with Next.js, React and Tailwind CSS, with content managed in a standalone Sanity Studio.

Features include CMS feature flags, release campaigns and landing pages, a Resend double opt-in newsletter, manual tour dates plus a consent-gated Bandsintown widget, photo and video galleries, an Instagram photo feed, band profiles, an external press/EPK link, contact channels, and German legal pages.

## Local development

Requires **Node.js 22.12 or newer** and npm.

```bash
npm run install:all
cp web/.env.example web/.env.local
# Fill in web/.env.local, then run these in separate terminals:
npm run dev:web       # http://localhost:3000
npm run dev:studio    # http://localhost:3333
```

Allow the local Studio origin in Sanity if needed:

```bash
cd studio
npx sanity cors add http://localhost:3333 --credentials
```

| Directory | Purpose |
| --- | --- |
| `web/` | Next.js App Router frontend and server endpoints |
| `studio/` | Sanity schemas and editorial interface |
| `docs/` | Project notes |

Default Sanity project: `lru32awc`, dataset: `production`. Generated files under `studio/.sanity/` are ignored.

## Environment

Use `web/.env.local` locally and your hosting provider's environment settings in production. See [`web/.env.example`](web/.env.example) for the full template.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Required Sanity connection |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, sitemap and sharing; required in production |
| `SANITY_API_READ_TOKEN` | Optional read token for private datasets; the website serves published content only |
| `SANITY_API_WRITE_TOKEN` | Release click counting; use the least privileges your Sanity plan supports |
| `SANITY_REVALIDATE_SECRET` | Signed content-revalidation webhook |
| `RESEND_API_KEY` | Contact email delivery and native newsletter signup |
| `CONTACT_FROM_EMAIL` | Resend-verified sender; defaults to `kontakt@endofallknown.de` |
| `RESEND_AUDIENCE_ID` | Resend Audience for native newsletter double opt-in |
| `NEWSLETTER_SIGNING_SECRET` | Independent newsletter token secret (at least 32 characters); falls back to `SESSION_SECRET` |
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | Instagram professional-account token and numeric user ID |
| `RELEASE_CLICK_HASH_SECRET` | Independent random secret for daily IP deduplication |
| `RELEASE_CLICK_IP_HEADER` | Client-IP header overwritten by a trusted reverse proxy (click deduplication, contact and newsletter rate limiting) |
| `RELEASE_CLICK_CLEANUP_SECRET` | Bearer secret for the scheduled analytics cleanup endpoint |
| `SESSION_SECRET` | Session secret for authorizing scheduled/admin API requests; falls back to `RELEASE_CLICK_CLEANUP_SECRET` if unset |

Never commit secrets or expose them through `NEXT_PUBLIC_` variables. Do not reuse a write-capable token as the read token. Restart or redeploy after changing environment variables.

## Editing content

Publish changes in Studio to make them visible. An uploaded asset or saved draft alone does not update the website. Local development bypasses the content cache; in production, Sanity content is cached for 60 seconds and the webhook clears it immediately. Pages are rendered per request so date-dependent release badges stay accurate.

| Studio area | Content |
| --- | --- |
| **Site Settings** | Branding, hero, social and streaming links, feature flags, tour labels, contact channels, newsletter copy, press URL, backgrounds and photo credits |
| **Press Kit** | Biography, press release and optional fallback PDF; the public press/EPK link is a redirect configured in Site Settings |
| **Impressum & Datenschutz** | Operator identity and deployment-specific legal/privacy details |
| **Releases** | Discography, upcoming releases, campaign content, landing pages and live click statistics |
| **Tour Dates** | Manual shows with venue, city, tickets, sold-out state, support acts and notes |
| **Gallery Photos / Gallery Videos** | Photo grid entries and videos with uploaded thumbnails |
| **Band Members** | Names, roles, instruments, biographies, social links, active years and portraits |

### Appearance and press materials

Site Settings is grouped into **Site-wide**, **Home Page**, **Features & Sections** and **Page Backgrounds**.

### Feature flags

**Features & Sections** switches individual areas on or off. Existing sections default to on, the newsletter defaults to off, and new optional pages default to on but still hide themselves when they have no content or credentials. Navigation, footer links and the sitemap follow the same flags, so disabling a section also removes its public entry points.

Release countdown, tracklist, credits and share buttons have global flags plus optional per-release overrides. An override can only disable a feature for that release; it cannot bypass a global kill switch.

- **Hero Logo** and **Header Logo** are independent; unset logos fall back to the band name. PNG, SVG and WebP are supported.
- Hero photo darkening defaults to 55%. Section backgrounds have independent images, hotspots, descriptions and darkening controls, defaulting to 65%.
- **Photographer Credits** appear in the footer, in their Studio order, with optional links and attributions.
- **Press / EPK Folder URL** must be HTTPS. When the Press feature is enabled, `/press` responds with a temporary redirect to this URL; otherwise the route returns 404. There is no separate EPK content page. For a Google Drive folder, enable **Anyone with the link → Viewer** and check access while signed out. The folder opens only after a click; it is not embedded.
- **Press Kit** biography and press release still render in the biography section when **Bio Section** is enabled. Its **Complete Press Kit Link** takes priority over the fallback PDF; the separate **Press / EPK Folder URL** supplies the navigation, footer and `/press` link.
- Social links support Instagram, YouTube, X, Facebook, TikTok, Spotify, Apple Music, Bandcamp, SoundCloud, Bluesky, Threads, Discord, Patreon and Twitch.

### Releases

Future-dated releases appear as **Coming soon**, with relative dates and an optional live countdown. On their release date in **Europe/Berlin** they switch to **Out now** and join the regular newest-first list.

Add a **Slug** to create `/releases/<slug>` and include it in the sitemap. **Teaser Text** is used on the page and in metadata. Releases without a slug still appear in lists.

A release can include:

- **Pre-save URL** and **Pre-order URL**, shown only while the release is upcoming.
- A **Tracklist** with optional durations and collapsible **Lyrics**.
- **Credits** for production, mixing, mastering, artwork, label, catalog number and additional roles.
- **Per-release overrides** for the countdown, tracklist, credits and share buttons. Unset follows the global feature flag; off hides the element for that release. Overrides cannot re-enable a globally disabled feature.

Release pages generate album metadata with the cover as the Open Graph and Twitter image, plus `MusicAlbum` and `BreadcrumbList` structured data. **Enabled** releases only appear in lists, the `/releases` archive, the sitemap and direct URLs. Disable the **Releases Archive Page** feature to remove `/releases`; the homepage section remains available.

### Tour dates

Tour data comes from **Tour Dates** documents in Studio or the consent-gated Bandsintown widget. Choose **Tour Data Source** in Site Settings:

- **Automatic** uses manual shows whenever upcoming shows exist, otherwise Bandsintown.
- **Manual** renders upcoming published shows server-side and never loads Bandsintown.
- **Bandsintown** always uses the widget.

Manual shows include date, optional start time, venue, city, region, country, ticket URL, sold-out state, support acts and notes. Past shows move automatically to the `/tour` archive; the homepage timeline shows upcoming shows only. **Tour Archive Page** enables `/tour`; the section heading, empty message, ticket label and sold-out label are editable. Upcoming shows add `MusicEvent` structured data. Disabled shows are ignored everywhere, including navigation and the sitemap.

The optional **Bandsintown Link** changes the fallback button, not the widget's artist; set the exact **Bandsintown Artist Name**. Keep `rest.bandsintown.com` allowed by both `script-src` and `connect-src` because the widget uses JSONP.

### Gallery

**Gallery Photos** and **Gallery Videos** are separate document types, ordered independently. Photos require alternative text and support captions, credits and dates. Videos accept YouTube URLs but use only uploaded Sanity thumbnails, so no YouTube image requests occur before consent.

**Gallery Page** enables `/gallery`; **Photo Gallery** and **Video Gallery** toggle the grids independently. Disabled items and the sitemap follow the same flags.

### Newsletter

The newsletter section defaults to off. Enable it under **Features & Sections** and choose one of two modes:

1. **Native double opt-in** requires `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` and a signing secret (`NEWSLETTER_SIGNING_SECRET`, or `SESSION_SECRET` as fallback). The form sends a confirmation email with a signed 48-hour token. Only after `/api/newsletter/confirm` succeeds is the address added to the Resend Audience. The confirmation endpoint is idempotent, and submission includes a honeypot, consent checkbox and per-IP rate limiting.
2. **External signup URL** is used when the native configuration is incomplete. The section links to the HTTPS URL instead of collecting addresses itself.

Without either configuration the section stays hidden. Raw email addresses are never logged. Configure a verified Resend sender domain and create an Audience before enabling native mode. Newsletter copy, button label, success message and privacy note are editable.

### Embeds and contact

YouTube, Spotify, Bandsintown and Instagram media load only after visitor consent. Consent can be revoked on each media block or on `/datenschutz`. When browser storage is blocked, the choice lasts until reload.

Contact submissions are routed by the selected topic to an enabled **Contact Channel**, or fall back to **Site Settings → Contact Email**, defaulting to `kontakt@endofallknown.de`. Unknown, disabled or invalid channel keys safely use the fallback. Channels support stable keys, labels, addresses, descriptions and ordering. The visitor's email is used as **Reply-To**, never as the sender. Delivery requires a verified Resend sender domain. The contact section, form and channel cards have separate feature flags; the form includes a privacy consent checkbox linking to `/datenschutz#consent`. Honeypot and per-process rate limiting provide basic spam protection, not distributed enforcement.

## Release click statistics

Listen links pass through `/go/<release>/<link>`. **Live Click Statistics** shows lifetime clicks and the cumulative sum of daily unique IPs per link. Known bots, prefetches and HEAD requests are excluded where detectable.

Statistics live in separate `releaseLinkStats` documents so publishing content cannot overwrite them. Existing legacy counters seed the new statistics on the next counted click. Redirects resolve the published destination first, then schedule writes through Next.js `after`; the host must support post-response work.

### Setup

1. Set `SANITY_API_WRITE_TOKEN`. Without it, redirects work but counting logs a configuration error. Prefer permissions limited to reading published releases and writing/deleting analytics documents where supported.
2. To enable unique-IP counting, set an independent random `RELEASE_CLICK_HASH_SECRET` of at least 32 random bytes and `RELEASE_CLICK_IP_HEADER`. Trust a header **only if your reverse proxy overwrites it** with the actual client IP. Without valid configuration or an IP, only total clicks are counted.
3. Schedule a daily `POST /api/release-clicks/cleanup`, authenticated with the configured cleanup secret in the Authorization header using the Bearer scheme.
4. Monitor cleanup failures and add an edge/WAF rate limit for `/go/*` in production.

The cleanup endpoint deletes `clickHash` documents older than 48 hours, giving 48–72-hour retention with a daily job. **No automatic deletion happens until that job is configured.** In-process write limits are 20 per IP per minute and 300 globally per minute per server process, not across instances.

### Accuracy and privacy

Unique means one normalized IP per link per UTC day, not one person. Shared IPs undercount, changing IPs overcounts, and returning visitors count again the next day. Rotating the hash secret resets the current day's deduplication.

Only a daily HMAC is stored, not raw IPs or browser information. These pseudonyms are **not anonymous data** and may be readable through the API on a public dataset. Review legal basis, privacy disclosures, access controls and processor arrangements before enabling tracking. Sanity-backed analytics is intended for this low-volume site, not a high-traffic analytics pipeline.

## Instagram feed

When the Instagram feature is enabled and both credentials are present, the home page fetches the latest six posts server-side and caches responses for 15 minutes. Images and carousel covers are displayed as complete photos; videos use thumbnails linking to the post. Photos load from Meta's CDN only after consent. No scraping or Instagram embed script is used.

Setup requires a **Business or Creator** Instagram account:

1. Create a Meta app with **Instagram API with Instagram Login** and connect the account. Standard Access is sufficient for an account you own/manage; add it to the app.
2. Grant `instagram_business_basic`, generate a long-lived token, and set `INSTAGRAM_ACCESS_TOKEN`.
3. Obtain the numeric ID from `/me?fields=user_id,username` and set `INSTAGRAM_USER_ID`, not the profile username.
4. Restart or redeploy. Refresh or replace the token before its 60-day expiry; this application does not implement OAuth or automatic renewal.

See [Meta's setup guide](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started). Missing credentials hide the section; incomplete/expired credentials or API failures show an unavailable message. Heading and follow-button text are editable; the profile link comes from **Social Links**.

## Deployment

Deploy `web/` as the frontend root, configure its environment variables, and allow the deployed Studio origin in Sanity CORS. Ensure the host supports Next.js post-response work.

Deploy Studio after schema or UI changes:

```bash
cd studio
npx sanity login
npm run deploy           # Hosted Studio
npm run deploy-schema    # Schema only
```

### Content revalidation

For updates faster than the 60-second cache, configure a Sanity webhook:

| Setting | Value |
| --- | --- |
| URL | `https://<your-domain>/api/revalidate` |
| Method | `POST` |
| Secret | Same value as `SANITY_REVALIDATE_SECRET` |
| Filter | `_type in ["siteSettings", "pressKit", "impressum", "release", "member", "show", "photo", "video"]` |

The filter excludes analytics mutations so each click does not invalidate content. Navigation uses existence-only queries; Instagram is fetched only by the home page.

### Legal launch checklist

The German legal pages describe implemented data flows; they are not a legal certification. Complete and publish **Verantwortlicher**, **Impressum** and **Datenschutz** in Studio.

- Provide the responsible entity, service address, contact details and applicable legal, register, VAT and editorial disclosures. Review § 36 VSBG applicability. Do not publish private tax numbers or obsolete EU ODR links.
- Document the actual host, processing locations, logs and retention; mailbox/Resend processing; Sanity analytics; international recipients and transfer safeguards; supervisory authority; and DPO where applicable.
- Verify provider contracts, Art. 28 processing agreements and transfer bases. Do not assume DPF certification. Obtain qualified German/EU legal review.
- Check that media providers receive no browser requests before opt-in and that withdrawal works on the deployed site. Consent currently has no automatic expiry.

Missing core legal details are visibly flagged, and Studio validation requires the core privacy fields.

References: [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html), [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html), [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [§ 36 VSBG](https://www.gesetze-im-internet.de/vsbg/__36.html).

## Validation and maintenance

Run before pushing:

```bash
cd web
npm run lint
npx tsc --noEmit
npm test
npm run build
npm audit --omit=dev

cd ../studio
npx tsc --noEmit
npx sanity schema validate
npm run build
npm audit --omit=dev
```

Use `npm run start` in `web/` to serve its production build. Dependabot opens weekly grouped dependency updates.

Both apps scope an `@oclif/core` override to `minimatch` v11.0.3+ for [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Remove it when upstream adopts a patched version. Development-only lint dependencies still report this advisory; do not globally force v11 because older consumers use removed APIs. Avoid untrusted glob inputs and revisit compatible upstream fixes.

## Credits

Social icons use [Simple Icons](https://simpleicons.org/). See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for licensing and trademark information.
