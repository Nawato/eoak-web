import 'server-only';
import { cache } from 'react';
import { createClient, defineQuery } from 'next-sanity';
import type { PressKit, SocialLink, PhotoCredit, BackgroundArea, BackgroundSettings } from '@/sanity/types';
import type { LabeledLink } from '@/lib/embeds';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_READ_TOKEN || undefined;
const isDevelopment = process.env.NODE_ENV === 'development';

if (!projectId || !dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET. See web/.env.example.');
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  // Next.js caches responses already; the API CDN could hand stale data to a webhook-triggered revalidation.
  useCdn: false,
  // Never serve drafts, even if a read token is configured.
  perspective: 'published',
  token,
});

const REVALIDATE_SECONDS = 60;
export const SANITY_CACHE_TAG = 'sanity';

// Errors propagate on purpose: a failed fetch must not be cached as "no content".
function fetchContent<T>(query: string, params: Record<string, string> = {}): Promise<T> {
  return sanityClient.fetch<T>(
    query,
    params,
    isDevelopment
      ? { cache: 'no-store' }
      : { next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_CACHE_TAG] } },
  );
}

export interface SiteSettings {
  bandName: string;
  instagramHeading?: string | null;
  instagramFollowLabel?: string | null;
  socialLinks: SocialLink[];
  latestYoutubeUrl: string;
  featuredSpotifyUrl: string;
  bandsintownArtistName: string;
  bandsintownUrl?: string | null;
  contactEmail?: string;
  streamingLinks?: LabeledLink[];
  merchUrl?: string;
  logo?: unknown;
  headerLogo?: unknown;
  heroBackground?: unknown;
  heroBackgroundAlt?: string;
  heroOverlayOpacity?: number | null;
  heroEyebrow?: string;
  heroTagline?: string;
  ogImage?: unknown;
  favicon?: unknown;
  creditsHeading?: string | null;
  photoCredits?: PhotoCredit[] | null;
  pageBackgrounds?: Partial<Record<BackgroundArea, BackgroundSettings | null>> | null;
}

export interface Impressum {
  legalNotice: string;
  operatorName: string;
  operatorAddress: string;
  email: string;
  phone: string;
  representedBy: string;
  legalForm?: string | null;
  registerDetails?: string | null;
  vatId?: string | null;
  businessId?: string | null;
  editorialResponsible?: string | null;
  disputeResolution?: string | null;
  additionalLegalDetails?: string | null;
  hostingDetails?: string | null;
  emailProcessingDetails?: string | null;
  internationalTransfers?: string | null;
  supervisoryAuthority?: string | null;
  dataProtectionOfficer?: string | null;
  additionalPrivacyDetails?: string | null;
}

// Missing fields are returned as null (not omitted), so arrays are coalesced.
// Explicit projections keep responses small and avoid leaking unused fields to the renderer.
const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  bandName, instagramHeading, instagramFollowLabel, "socialLinks": coalesce(socialLinks, []), latestYoutubeUrl, featuredSpotifyUrl,
  bandsintownArtistName, bandsintownUrl, contactEmail, "streamingLinks": coalesce(streamingLinks, []), merchUrl, logo, headerLogo,
  heroBackground, heroBackgroundAlt, heroOverlayOpacity, heroEyebrow, heroTagline, ogImage, favicon,
  creditsHeading, "photoCredits": coalesce(photoCredits, []), pageBackgrounds
}`);

const PRESS_KIT_QUERY = defineQuery(`*[_id == "pressKit"][0]{
  biography, pressRelease, "pressKitPdf": pressKitPdf{ "asset": asset->{ url } }, pressKitUrl, pressKitLinkLabel
}`);

const IMPRESSUM_QUERY = defineQuery(`*[_id == "impressum"][0]{
  legalNotice, operatorName, operatorAddress, email, phone, representedBy, legalForm, registerDetails, vatId,
  businessId, editorialResponsible, disputeResolution, additionalLegalDetails, hostingDetails,
  emailProcessingDetails, internationalTransfers, supervisoryAuthority, dataProtectionOfficer, additionalPrivacyDetails
}`);

const RELEASES_QUERY = defineQuery(
  `*[_type == "release" && !(_id in path("drafts.**"))] | order(releaseDate desc)[0...50]{ _id, title, "slug": slug.current, teaser, releaseType, releaseDate, cover, "links": coalesce(links[]{_key, label, url}, []) }`,
);

const RELEASE_QUERY = defineQuery(
  `*[_type == "release" && slug.current == $slug][0]{ _id, title, "slug": slug.current, teaser, releaseType, releaseDate, cover, "links": coalesce(links[]{_key, label, url}, []) }`,
);

const RELEASE_SLUGS_QUERY = defineQuery(
  `*[_type == "release" && defined(slug.current)]{"slug": slug.current}`,
);
const MEMBERS_QUERY = defineQuery(
  `*[_type == "member" && !(_id in path("drafts.**"))] | order(order asc, name asc)[0...30]{ _id, name, role, photo }`,
);

const NAVIGATION_QUERY = defineQuery(`{
  "hasReleases": defined(*[_type == "release"][0]._id),
  "hasMembers": defined(*[_type == "member"][0]._id)
}`);

export const getNavigationContent = cache(() =>
  fetchContent<{ hasReleases: boolean; hasMembers: boolean }>(NAVIGATION_QUERY),
);

export const getSiteSettings = cache(() => fetchContent<SiteSettings | null>(SITE_SETTINGS_QUERY));

export const getPressKit = cache(() => fetchContent<PressKit | null>(PRESS_KIT_QUERY));

export const getImpressum = cache(() => fetchContent<Impressum | null>(IMPRESSUM_QUERY));

export interface Release {
  _id: string;
  title: string;
  slug?: string | null;
  teaser?: string | null;
  releaseType?: string;
  releaseDate: string;
  cover?: unknown;
  links?: LabeledLink[];
}

export interface Member {
  _id: string;
  name: string;
  role?: string;
  photo?: unknown;
}

export const getReleases = cache(() => fetchContent<Release[]>(RELEASES_QUERY));

export const getRelease = cache((slug: string) => fetchContent<Release | null>(RELEASE_QUERY, { slug }));

export const getReleaseSlugs = cache(() => fetchContent<{ slug: string }[]>(RELEASE_SLUGS_QUERY));

export const getMembers = cache(() => fetchContent<Member[]>(MEMBERS_QUERY));
