import { cache } from 'react';
import { createClient } from 'next-sanity';
import type { PressKit, SocialLink, PhotoCredit } from '@/sanity/types';
import type { LabeledLink } from '@/lib/embeds';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_READ_TOKEN || undefined;

if (!projectId || !dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET. See web/.env.example.');
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: !token,
  token,
});

const REVALIDATE_SECONDS = 60;
export const SANITY_CACHE_TAG = 'sanity';

// Errors propagate on purpose: a failed fetch must not be cached as "no content".
function fetchContent<T>(query: string): Promise<T> {
  return sanityClient.fetch<T>(query, {}, { next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_CACHE_TAG] } });
}

export interface SiteSettings {
  bandName: string;
  socialLinks: SocialLink[];
  latestYoutubeUrl: string;
  featuredSpotifyUrl: string;
  bandsintownArtistName: string;
  contactEmail?: string;
  streamingLinks?: LabeledLink[];
  merchUrl?: string;
  logo?: unknown;
  heroBackground?: unknown;
  heroBackgroundAlt?: string;
  heroOverlayOpacity?: number | null;
  heroEyebrow?: string;
  heroTagline?: string;
  ogImage?: unknown;
  favicon?: unknown;
  creditsHeading?: string | null;
  photoCredits?: PhotoCredit[] | null;
}

export interface Impressum {
  legalNotice: string;
  operatorName: string;
  operatorAddress: string;
  email: string;
  phone: string;
  representedBy: string;
}

export const getSiteSettings = cache(() => fetchContent<SiteSettings | null>(`*[_id == "siteSettings"][0]`));

export const getPressKit = cache(() => fetchContent<PressKit | null>(`*[_id == "pressKit"][0]{..., pressKitPdf{..., asset->{url}}}`));

export const getImpressum = cache(() => fetchContent<Impressum | null>(`*[_id == "impressum"][0]`));

export interface Release {
  _id: string;
  title: string;
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

export const getReleases = cache(() =>
  fetchContent<Release[]>(`*[_type == "release" && !(_id in path("drafts.**"))] | order(releaseDate desc)[0...50]`),
);

export const getMembers = cache(() =>
  fetchContent<Member[]>(`*[_type == "member" && !(_id in path("drafts.**"))] | order(order asc, name asc)[0...30]`),
);
