'use client';

import Image from 'next/image';
import { useState } from 'react';
import { builder } from '@/lib/sanity';
import type { SanityImageSource } from '@/lib/sanity';
import Lightbox from '@/components/Lightbox';

export interface GalleryImage {
  image: SanityImageSource;
  caption: string;
  isHighRes: boolean;
}

interface GallerySectionProps {
  gallery?: GalleryImage[];
}

function getImageUrl(image: SanityImageSource, width: number, height: number): string | undefined {
  const url = builder.image(image).width(width).height(height).url();
  return url ?? undefined;
}

export default function GallerySection({ gallery = [] }: GallerySectionProps) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  if (gallery.length === 0) {
    return (
      <section id="gallery" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">
            Gallery
          </h2>
          <p className="text-center text-zinc-400">No gallery images yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">
          Gallery
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item, index) => {
            const imageUrl = getImageUrl(item.image, 800, 600);

            return (
              <button
                key={index}
                onClick={() => setSelected(item)}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-white/10"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.caption ?? `Gallery image ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-muted">
                    Unavailable
                  </div>
                )}

                {item.isHighRes && (
                  <span className="absolute left-2 top-2 rounded-sm bg-accent px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    High Res
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <Lightbox image={selected.image} caption={selected.caption} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
