'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { builder } from '@/lib/sanity-image';
import type { SanityImageSource } from '@/lib/sanity-image';

interface LightboxProps {
  image: SanityImageSource;
  caption?: string;
  onClose: () => void;
}

export default function Lightbox({ image, caption, onClose }: LightboxProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  const imageUrl = builder.image(image).width(1600).url();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-zinc-300 transition-colors hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={caption ?? 'Gallery image'} className="max-h-[80vh] w-auto rounded-sm" />
        ) : (
          <p className="text-zinc-400">Image unavailable.</p>
        )}
        {caption && <p className="mt-4 text-center text-sm text-zinc-400">{caption}</p>}
      </div>
    </div>
  );
}
