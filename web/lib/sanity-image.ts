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

interface SanityImageField {
  asset?: { _ref?: string } | null;
  hotspot?: { x: number; y: number } | null;
}

export function hasImage(image: unknown): image is SanityImageField & { asset: { _ref: string } } {
  return typeof (image as SanityImageField | null | undefined)?.asset?._ref === 'string';
}

// Asset refs look like "image-<id>-<width>x<height>-<format>".
function parseRef(ref: string) {
  const match = /^image-[a-zA-Z0-9]+-(\d+)x(\d+)-([a-z]+)$/.exec(ref);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]), format: match[3] };
}

export interface LogoSource {
  url: string;
  width: number;
  height: number;
}

// SVGs are served untouched (they are vectors); rasters are capped in size.
export function getLogo(image: unknown, maxWidth = 800): LogoSource | null {
  if (!hasImage(image)) return null;
  const meta = parseRef(image.asset._ref);
  if (!meta) return null;
  try {
    if (meta.format === 'svg') {
      return { url: builder.image(image).url(), width: meta.width, height: meta.height };
    }
    const width = Math.min(meta.width, maxWidth);
    const height = Math.round((meta.height * width) / meta.width);
    return { url: builder.image(image).width(width).auto('format').url(), width, height };
  } catch {
    return null;
  }
}

export function getObjectPosition(image: unknown): string | undefined {
  if (!hasImage(image) || !image.hotspot) return undefined;
  const clamp = (n: number) => Math.min(1, Math.max(0, Number(n) || 0));
  return `${clamp(image.hotspot.x) * 100}% ${clamp(image.hotspot.y) * 100}%`;
}
