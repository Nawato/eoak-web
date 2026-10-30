import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { PressKit, SocialLink } from '@/sanity/types';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '8a1b2c3d4e5';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

export const builder = createImageUrlBuilder({ projectId, dataset });

export type SanityImageSource = Parameters<typeof builder.image>[0];

export async function getSiteSettings(): Promise<{
  bandName: string;
  socialLinks: SocialLink[];
  latestYoutubeUrl: string;
  featuredSpotifyUrl: string;
  bandsintownArtistName: string;
  bookingEmail: string;
  managementEmail: string;
} | null> {
  try {
    const result = await sanityClient.fetch(`*[_id == "siteSettings"][0]`);
    return result;
  } catch (error) {
    console.error('Failed to fetch site settings from Sanity:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getPressKit(): Promise<PressKit | null> {
  try {
    return await sanityClient.fetch(`*[_id == "pressKit"][0]`);
  } catch (error) {
    console.error('Failed to fetch press kit from Sanity:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getImpressum() {
  try {
    return await sanityClient.fetch<{
      legalNotice: string;
      operatorName: string;
      operatorAddress: string;
      email: string;
      phone: string;
      representedBy: string;
    } | null>(`*[_id == "impressum"][0]`);
  } catch (error) {
    console.error('Failed to fetch impressum from Sanity:', error instanceof Error ? error.message : error);
    return null;
  }
}
