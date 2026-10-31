import Image from 'next/image';
import type { ReactNode } from 'react';
import { getImageUrl, getObjectPosition, hasImage } from '@/lib/sanity-image';
import type { BackgroundSettings } from '@/sanity/types';

interface BackgroundSurfaceProps {
  background?: BackgroundSettings | null;
  children?: ReactNode;
}

export default function BackgroundSurface({ background, children }: BackgroundSurfaceProps) {
  const image = background?.image;
  const url = hasImage(image) ? getImageUrl(image, 2400) : undefined;
  if (!url) return <>{children}</>;

  const value = background?.overlayOpacity;
  const opacity = typeof value === 'number' && Number.isFinite(value) ? Math.min(85, Math.max(0, value)) / 100 : 0.65;

  return (
    <div className="relative">
      <Image
        src={url}
        alt={background?.alt ?? ''}
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: getObjectPosition(image) }}
      />
      <div className="pointer-events-none absolute inset-0 bg-zinc-950" style={{ opacity }} />
      <div className="background-edge-fade pointer-events-none absolute inset-x-0 top-0" />
      <div className="background-edge-fade pointer-events-none absolute inset-x-0 bottom-0 rotate-180" />
      <div className="relative [&>section]:bg-transparent">{children}</div>
    </div>
  );
}
