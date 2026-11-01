import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, getLogo, getObjectPosition, hasImage } from '@/lib/sanity-image';

interface HeroProps {
  bandName: string;
  logo?: unknown;
  background?: unknown;
  backgroundAlt?: string;
  overlayOpacity?: number | null;
  eyebrow?: string;
  tagline?: string;
  merchUrl?: string | null;
}

export default function Hero({ bandName, logo, background, backgroundAlt, overlayOpacity, eyebrow, tagline, merchUrl }: HeroProps) {
  const logoSource = getLogo(logo, 1200);
  const backgroundUrl = hasImage(background) ? getImageUrl(background, 2400) : undefined;
  const darkening = typeof overlayOpacity === 'number' && Number.isFinite(overlayOpacity)
    ? Math.min(85, Math.max(0, overlayOpacity)) / 100
    : 0.55;
  return (
    <section id="top" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {backgroundUrl && (
        <Image
          src={backgroundUrl}
          alt={backgroundAlt || ''}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: getObjectPosition(background) }}
        />
      )}
      <div
        className="absolute inset-0 bg-zinc-950"
        style={{ opacity: backgroundUrl ? darkening : 1 }}
      />
      <div className="background-edge-fade pointer-events-none absolute inset-x-0 bottom-0 rotate-180" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-accent-text">
          {eyebrow ?? 'Independent Metalcore'}
        </p>
        {logoSource ? (
          <h1 className="mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG/PNG logo served as-is from the Sanity CDN */}
            <img
              src={logoSource.url}
              alt={bandName}
              width={logoSource.width}
              height={logoSource.height}
              className="mx-auto h-auto max-h-64 w-auto max-w-full md:max-h-80"
            />
          </h1>
        ) : (
          <h1 className="text-gradient mb-8 font-display text-5xl font-bold uppercase sm:text-7xl md:text-8xl">
            {bandName}
          </h1>
        )}
        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted">
          {tagline ?? 'Heavy riffs. Bleak atmospheres. Emotional breakdowns. The soundtrack of the void.'}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#music"
            className="rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
          >
            Latest Release
          </Link>
          <Link
            href="#shows"
            className="rounded-sm border border-white/15 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent-text"
          >
            Tour Dates
          </Link>
          {merchUrl && (
            <a
              href={merchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-white/15 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent-text"
            >
              Merch
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
