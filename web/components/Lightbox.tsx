'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { getImageUrl } from '@/lib/sanity-image';
import type { SanityImageSource } from '@/lib/sanity-image';

interface LightboxProps {
  image: SanityImageSource;
  caption?: string;
  onClose: () => void;
}

export default function Lightbox({ image, caption, onClose }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      // The close button is the only focusable element, so Tab stays on it.
      if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  if (!image) return null;

  const imageUrl = getImageUrl(image, 1600);
  const label = caption ? `Image: ${caption}` : 'Gallery image';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-zinc-300 transition-colors hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={caption ?? 'Gallery image'}
            width={1600}
            height={1200}
            sizes="(min-width: 896px) 896px, 100vw"
            className="h-auto max-h-[80vh] w-auto rounded-sm object-contain"
          />
        ) : (
          <p className="text-zinc-400">Image unavailable.</p>
        )}
        {caption && <p className="mt-4 text-center text-sm text-zinc-400">{caption}</p>}
      </div>
    </div>
  );
}
