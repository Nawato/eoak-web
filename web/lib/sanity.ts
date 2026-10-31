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

function fetchDocument<T>(query: string): Promise<T | null> {
  return sanityClient.fetch<T | null>(query, {}, { next: { revalidate: REVALIDATE_SECONDS } });
}

export interface SiteSettings {
  bandName: string;
  socialLinks: SocialLink[];
  latestYoutubeUrl: string;
  featuredSpotifyUrl: string;
  bandsintownArtistName: string;
  bookingEmail: string;
  managementEmail: string;
}

export interface Impressum {
  legalNotice: string;
  operatorName: string;
  operatorAddress: string;
  email: string;
  phone: string;
  representedBy: string;
}

async function safeFetch<T>(label: string, query: string): Promise<T | null> {
  try {
    return await fetchDocument<T>(query);
  } catch (error) {
    console.error(`Failed to fetch ${label} from Sanity:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export const getSiteSettings = cache(() => safeFetch<SiteSettings>('site settings', `*[_id == "siteSettings"][0]`));

export const getPressKit = cache(() => safeFetch<PressKit>('press kit', `*[_id == "pressKit"][0]{..., pressKitPdf{..., asset->{url}}}`));

export const getImpressum = cache(() => safeFetch<Impressum>('impressum', `*[_id == "impressum"][0]`));
