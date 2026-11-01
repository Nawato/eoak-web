# End Of All Known - Website

Official website of **End Of All Known**, built with Next.js, React and Tailwind CSS, with content managed in a standalone Sanity Studio.

Features include releases and pre-release landing pages, consent-gated music and tour embeds, an Instagram photo feed, band profiles, press materials, a contact form, and German legal pages.

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
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, sitemap and sharing |
| `SANITY_API_READ_TOKEN` | Optional read token for private datasets; the website serves published content only |
| `SANITY_API_WRITE_TOKEN` | Release click counting; use the least privileges your Sanity plan supports |
| `SANITY_REVALIDATE_SECRET` | Signed content-revalidation webhook |
| `RESEND_API_KEY` | Contact email delivery |
| `CONTACT_FROM_EMAIL` | Resend-verified sender; defaults to `kontakt@endofallknown.de` |
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | Instagram professional-account token and numeric user ID |
| `RELEASE_CLICK_HASH_SECRET` | Independent random secret for daily IP deduplication |
| `RELEASE_CLICK_IP_HEADER` | Client-IP header overwritten by a trusted reverse proxy |
| `RELEASE_CLICK_CLEANUP_SECRET` | Bearer secret for the scheduled analytics cleanup endpoint |
| `SESSION_SECRET` | Session secret for authorizing scheduled/admin API requests; falls back to `RELEASE_CLICK_CLEANUP_SECRET` if unset |

Never commit secrets or expose them through `NEXT_PUBLIC_` variables. Do not reuse a write-capable token as the read token. Restart or redeploy after changing environment variables.

## Editing content

Publish changes in Studio to make them visible. An uploaded asset or saved draft alone does not update the website. Local development bypasses the content cache; production content is cached for 60 seconds.

| Studio area | Content |
| --- | --- |
| **Site Settings** | Branding, hero, social and streaming links, embeds, contact email, backgrounds and photo credits |
| **Press Kit** | Biography, press release, external press kit link and optional fallback PDF |
| **Impressum & Datenschutz** | Operator identity and deployment-specific legal/privacy details |
| **Releases** | Discography, upcoming releases, landing pages and live click statistics |
| **Band Members** | Names, roles and portraits, ordered by the numeric order field |

### Appearance and press materials

Site Settings is grouped into **Site-wide**, **Home Page** and **Page Backgrounds**.

- **Hero Logo** and **Header Logo** are independent; unset logos fall back to the band name. PNG, SVG and WebP are supported.
- Hero photo darkening defaults to 55%. Section backgrounds have independent images, hotspots, descriptions and darkening controls, defaulting to 65%.
- **Photographer Credits** appear in the footer, in their Studio order, with optional links and attributions.
- **Complete Press Kit Link** takes priority over the fallback PDF. For a Google Drive folder, enable **Anyone with the link → Viewer** and check access while signed out. The folder opens only after a click; it is not embedded.

### Releases

Future-dated releases appear first as **Coming soon**, with relative dates. They join the regular newest-first list on their release date in **Europe/Berlin**.

Add a **Slug** to create `/releases/<slug>` and include it in the sitemap. **Teaser Text** is optional. Releases without a slug still appear in the home-page section.

### Embeds and contact

YouTube, Spotify, Bandsintown and Instagram media load only after visitor consent. Consent can be revoked on each media block or on `/datenschutz`. When browser storage is blocked, the choice lasts until reload.

Set the exact **Bandsintown Artist Name** for the tour widget; past events are hidden. The optional **Bandsintown Link** changes the fallback button, not the widget's artist. Keep `rest.bandsintown.com` allowed by both `script-src` and `connect-src` because the widget uses JSONP.

Contact submissions go to **Site Settings → Contact Email**, defaulting to `kontakt@endofallknown.de`. The visitor's email is used as **Reply-To**, never as the sender. Delivery requires a verified Resend sender domain. Honeypot and per-process rate limiting provide basic spam protection, not distributed enforcement.

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

The home page fetches the latest six posts server-side and caches responses for 15 minutes. Images and carousel covers are displayed as complete photos; videos use thumbnails linking to the post. Photos load from Meta's CDN only after consent. No scraping or Instagram embed script is used.

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
| Filter | `_type in ["siteSettings", "pressKit", "impressum", "release", "member"]` |

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
