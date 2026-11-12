import 'server-only';
import { cache } from 'react';
import { createClient, defineQuery } from 'next-sanity';
import type {
  PressKit,
  SocialLink,
  PhotoCredit,
  BackgroundArea,
  BackgroundSettings,
  SiteFeatures,
  TourMode,
  ContactChannel,
} from '@/sanity/types';
import type { LabeledLink } from '@/lib/embeds';
import { SANITY_CACHE_TAG } from '@/lib/cache';

export { SANITY_CACHE_TAG };

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
  latestYoutubeUrl?: string | null;
  featuredSpotifyUrl?: string | null;
  bandsintownArtistName?: string | null;
  bandsintownUrl?: string | null;
  contactEmail?: string | null;
  streamingLinks?: LabeledLink[];
  merchUrl?: string | null;
  logo?: unknown;
  headerLogo?: unknown;
  heroBackground?: unknown;
  heroBackgroundAlt?: string | null;
  heroOverlayOpacity?: number | null;
  heroEyebrow?: string | null;
  heroTagline?: string | null;
  ogImage?: unknown;
  favicon?: unknown;
  creditsHeading?: string | null;
  photoCredits?: PhotoCredit[] | null;
  pageBackgrounds?: Partial<Record<BackgroundArea, BackgroundSettings | null>> | null;
  features?: Partial<SiteFeatures> | null;

  pressUrl?: string | null;
  pressLabel?: string | null;
  pressDescription?: string | null;

  newsletterHeading?: string | null;
  newsletterDescription?: string | null;
  newsletterButtonLabel?: string | null;
  newsletterSuccessMessage?: string | null;
  newsletterPrivacyNote?: string | null;
  newsletterSignupUrl?: string | null;

  tourHeading?: string | null;
  tourNoShowsText?: string | null;
  tourTicketLabel?: string | null;
  tourSoldOutLabel?: string | null;
  tourMode?: TourMode | null;

  contactChannels?: ContactChannel[] | null;
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
  creditsHeading, "photoCredits": coalesce(photoCredits, []), pageBackgrounds,
  "features": coalesce(features, {}),
  pressUrl, pressLabel, pressDescription,
  newsletterHeading, newsletterDescription, newsletterButtonLabel, newsletterSuccessMessage, newsletterPrivacyNote,
  newsletterSignupUrl,
  tourHeading, tourNoShowsText, tourTicketLabel, tourSoldOutLabel, tourMode,
  "contactChannels": coalesce(contactChannels[]{_key, key, label, email, description, enabled, order}, [])
}`);

const PRESS_KIT_QUERY = defineQuery(`*[_id == "pressKit"][0]{
  biography, pressRelease, "pressKitPdf": pressKitPdf{ "asset": asset->{ url } }, pressKitUrl, pressKitLinkLabel
}`);

const IMPRESSUM_QUERY = defineQuery(`*[_id == "impressum"][0]{
  legalNotice, operatorName, operatorAddress, email, phone, representedBy, legalForm, registerDetails, vatId,
  businessId, editorialResponsible, disputeResolution, additionalLegalDetails, hostingDetails,
  emailProcessingDetails, internationalTransfers, supervisoryAuthority, dataProtectionOfficer, additionalPrivacyDetails
}`);

const RELEASE_PROJECTION = `{
  _id, title, "slug": slug.current, teaser, releaseType, releaseDate, cover,
  "links": coalesce(links[]{_key, label, url}, []),
  preSaveUrl, preOrderUrl,
  "tracklist": coalesce(tracklist[]{_key, title, duration, lyrics}, []),
  "credits": credits{
    producer, mixing, mastering, artwork, label, catalogNumber,
    "additional": coalesce(additional[]{_key, role, name}, [])
  },
  countdownEnabled, tracklistEnabled, creditsEnabled, shareEnabled
}`;

const RELEASES_QUERY = defineQuery(
  `*[_type == "release" && enabled != false && !(_id in path("drafts.**"))] | order(releaseDate desc)[0...50]${RELEASE_PROJECTION}`,
);

const RELEASE_ARCHIVE_QUERY = defineQuery(
  `*[_type == "release" && enabled != false && !(_id in path("drafts.**"))] | order(releaseDate desc)[0...500]${RELEASE_PROJECTION}`,
);

const RELEASE_QUERY = defineQuery(
  `*[_type == "release" && enabled != false && slug.current == $slug][0]${RELEASE_PROJECTION}`,
);

const RELEASE_SLUGS_QUERY = defineQuery(
  `*[_type == "release" && enabled != false && defined(slug.current)] | order(releaseDate desc){
    "slug": slug.current, _updatedAt, releaseDate, cover
  }`,
);

const MEMBERS_QUERY = defineQuery(
  `*[_type == "member" && enabled != false && !(_id in path("drafts.**"))] | order(order asc, name asc)[0...30]{
    _id, name, role, photo, instrument, bio, yearsActive,
    "socialLinks": coalesce(socialLinks[]{platform, url}, [])
  }`,
);

const SHOWS_QUERY = defineQuery(
  `*[_type == "show" && enabled != false && !(_id in path("drafts.**"))] | order(date asc)[0...300]{
    _id, date, startTime, venue, city, region, country, ticketUrl, soldOut, support, notes
  }`,
);

const PHOTOS_QUERY = defineQuery(
  `*[_type == "photo" && enabled != false && !(_id in path("drafts.**"))]
    | order(coalesce(order, 999) asc, date desc, _createdAt desc)[0...300]{
    _id, order, image, alt, caption, credit, date
  }`,
);

const VIDEOS_QUERY = defineQuery(
  `*[_type == "video" && enabled != false && !(_id in path("drafts.**"))]
    | order(coalesce(order, 999) asc, date desc, _createdAt desc)[0...300]{
    _id, order, title, description, youtubeUrl, thumbnail, date
  }`,
);

const NAVIGATION_QUERY = defineQuery(`{
  "hasReleases": defined(*[_type == "release" && enabled != false][0]._id),
  "hasMembers": defined(*[_type == "member" && enabled != false][0]._id),
  "hasShows": defined(*[_type == "show" && enabled != false][0]._id),
  "hasPhotos": defined(*[_type == "photo" && enabled != false][0]._id),
  "hasVideos": defined(*[_type == "video" && enabled != false][0]._id)
}`);

export interface NavigationContent {
  hasReleases: boolean;
  hasMembers: boolean;
  hasShows: boolean;
  hasPhotos: boolean;
  hasVideos: boolean;
}

export const getNavigationContent = cache(() => fetchContent<NavigationContent>(NAVIGATION_QUERY));

export const getSiteSettings = cache(() => fetchContent<SiteSettings | null>(SITE_SETTINGS_QUERY));

export const getPressKit = cache(() => fetchContent<PressKit | null>(PRESS_KIT_QUERY));

export const getImpressum = cache(() => fetchContent<Impressum | null>(IMPRESSUM_QUERY));

export interface ReleaseTrack {
  _key?: string;
  title: string;
  duration?: string | null;
  lyrics?: string | null;
}

export interface ReleaseCredits {
  producer?: string | null;
  mixing?: string | null;
  mastering?: string | null;
  artwork?: string | null;
  label?: string | null;
  catalogNumber?: string | null;
  additional?: { _key?: string; role?: string | null; name?: string | null }[] | null;
}

export interface Release {
  _id: string;
  title: string;
  slug?: string | null;
  teaser?: string | null;
  releaseType?: string | null;
  releaseDate: string;
  cover?: unknown;
  links?: LabeledLink[];
  enabled?: boolean | null;
  preSaveUrl?: string | null;
  preOrderUrl?: string | null;
  tracklist?: ReleaseTrack[] | null;
  credits?: ReleaseCredits | null;
  countdownEnabled?: boolean | null;
  tracklistEnabled?: boolean | null;
  creditsEnabled?: boolean | null;
  shareEnabled?: boolean | null;
}

export interface Member {
  _id: string;
  name: string;
  role?: string | null;
  photo?: unknown;
  instrument?: string | null;
  bio?: string | null;
  yearsActive?: string | null;
  socialLinks?: SocialLink[] | null;
}

export interface Show {
  _id: string;
  date: string;
  startTime?: string | null;
  venue: string;
  city: string;
  region?: string | null;
  country?: string | null;
  ticketUrl?: string | null;
  soldOut?: boolean | null;
  support?: string | null;
  notes?: string | null;
}

export interface Photo {
  _id: string;
  order?: number | null;
  image: unknown;
  alt: string;
  caption?: string | null;
  credit?: string | null;
  date?: string | null;
}

export interface Video {
  _id: string;
  order?: number | null;
  title: string;
  description?: string | null;
  youtubeUrl: string;
  thumbnail?: unknown;
  date?: string | null;
}

export interface ReleaseSlug {
  slug: string;
  _updatedAt?: string;
  releaseDate?: string;
  cover?: unknown;
}

export const getReleases = cache(() => fetchContent<Release[]>(RELEASES_QUERY));

export const getArchiveReleases = cache(() => fetchContent<Release[]>(RELEASE_ARCHIVE_QUERY));

export const getRelease = cache((slug: string) => fetchContent<Release | null>(RELEASE_QUERY, { slug }));

export const getReleaseSlugs = cache(() => fetchContent<ReleaseSlug[]>(RELEASE_SLUGS_QUERY));

export const getMembers = cache(() => fetchContent<Member[]>(MEMBERS_QUERY));

export const getShows = cache(() => fetchContent<Show[]>(SHOWS_QUERY));

export const getPhotos = cache(() => fetchContent<Photo[]>(PHOTOS_QUERY));

export const getVideos = cache(() => fetchContent<Video[]>(VIDEOS_QUERY));
