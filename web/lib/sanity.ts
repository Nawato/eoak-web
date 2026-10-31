import { cache } from 'react';
import { createClient } from 'next-sanity';
import type { PressKit, SocialLink } from '@/sanity/types';

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
function fetchDocument<T>(query: string): Promise<T | null> {
  return sanityClient.fetch<T | null>(query, {}, { next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_CACHE_TAG] } });
}

export interface SiteSettings {
  bandName: string;
  socialLinks: SocialLink[];
  latestYoutubeUrl: string;
  featuredSpotifyUrl: string;
  bandsintownArtistName: string;
  contactEmail?: string;
  streamingLinks?: { label?: string; url?: string }[];
  merchUrl?: string;
  logo?: unknown;
  heroBackground?: unknown;
  heroBackgroundAlt?: string;
  heroEyebrow?: string;
  heroTagline?: string;
  ogImage?: unknown;
  favicon?: unknown;
}

export interface Impressum {
  legalNotice: string;
  operatorName: string;
  operatorAddress: string;
  email: string;
  phone: string;
  representedBy: string;
}

export const getSiteSettings = cache(() => fetchDocument<SiteSettings>(`*[_id == "siteSettings"][0]`));

export const getPressKit = cache(() => fetchDocument<PressKit>(`*[_id == "pressKit"][0]{..., pressKitPdf{..., asset->{url}}}`));

export const getImpressum = cache(() => fetchDocument<Impressum>(`*[_id == "impressum"][0]`));

export interface Release {
  _id: string;
  title: string;
  releaseType?: string;
  releaseDate: string;
  cover?: unknown;
  links?: { label?: string; url?: string }[];
}

export interface Member {
  _id: string;
  name: string;
  role?: string;
  photo?: unknown;
}

function fetchList<T>(query: string): Promise<T[]> {
  return sanityClient.fetch<T[]>(query, {}, { next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_CACHE_TAG] } });
}

export const getReleases = cache(() =>
  fetchList<Release>(`*[_type == "release" && !(_id in path("drafts.**"))] | order(releaseDate desc)[0...50]`),
);

export const getMembers = cache(() =>
  fetchList<Member>(`*[_type == "member" && !(_id in path("drafts.**"))] | order(order asc, name asc)[0...30]`),
);
