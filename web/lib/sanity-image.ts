import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET. See web/.env.example.');
}

export const builder = createImageUrlBuilder({ projectId, dataset });

export type SanityImageSource = Parameters<typeof builder.image>[0];

export function getImageUrl(image: SanityImageSource, width: number, height?: number): string | undefined {
  try {
    let b = builder.image(image).width(width);
    if (height) b = b.height(height);
    return b.url() ?? undefined;
  } catch {
    return undefined;
  }
}
