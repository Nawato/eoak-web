import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getRelease, getSiteSettings } from '@/lib/sanity';
import { getImageUrl, hasImage } from '@/lib/sanity-image';
import { getHttpsLinks, toHttpsUrl } from '@/lib/embeds';
import { formatRelativeDate, formatReleaseDate, isUpcoming, releaseStatus } from '@/lib/releases';
import { resolveFeatures } from '@/lib/features';
import { buildBreadcrumbJsonLd, buildMusicAlbumJsonLd } from '@/lib/structured-data';
import { siteName } from '@/lib/site';
import BackgroundSurface from '@/components/BackgroundSurface';
import JsonLd from '@/components/JsonLd';
import ReleaseCountdown from '@/components/ReleaseCountdown';
import { ReleaseCredits, ReleaseTracklist } from '@/components/ReleaseDetails';
import ShareButtons from '@/components/ShareButtons';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) return {};

  const image = hasImage(release.cover) ? getImageUrl(release.cover, 1200, 630) : undefined;
  const description = release.teaser?.trim() || `${release.title} by ${siteName}.`;
  return {
    title: release.title,
    description,
    alternates: { canonical: `/releases/${encodeURIComponent(slug)}` },
    openGraph: {
      type: 'music.album',
      title: release.title,
      description,
      url: `/releases/${encodeURIComponent(slug)}`,
      releaseDate: release.releaseDate,
      musicians: siteName,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: `${release.title} cover` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: release.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ReleasePage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const [release, settings] = await Promise.all([getRelease(slug), getSiteSettings()]);
  if (!release) notFound();

  const features = resolveFeatures(settings?.features);
  const now = new Date();
  const status = releaseStatus(release, now);
  const upcoming = isUpcoming(release, now);
  const coverUrl = hasImage(release.cover) ? getImageUrl(release.cover, 1000, 1000) : undefined;
  const shareImageUrl = hasImage(release.cover) ? getImageUrl(release.cover, 1200, 630) : undefined;
  const links = getHttpsLinks(release.links);
  const preSaveUrl = toHttpsUrl(release.preSaveUrl);
  const preOrderUrl = toHttpsUrl(release.preOrderUrl);
  const bandName = settings?.bandName ?? siteName;
  const backHref = features.releasesArchive ? '/releases' : '/#releases';

  const showCountdown = upcoming && features.releaseCountdown && release.countdownEnabled !== false;
  const showTracklist = features.releaseTracklist && release.tracklistEnabled !== false;
  const showCredits = features.releaseCredits && release.creditsEnabled !== false;
  const showShare = features.releaseShare && release.shareEnabled !== false;
  const tracks = (release.tracklist ?? []).filter((track) => track.title?.trim());

  const structuredData = [
    buildMusicAlbumJsonLd(release, {
      bandName,
      imageUrl: shareImageUrl,
      url: `/releases/${encodeURIComponent(slug)}`,
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Releases', path: backHref },
      { name: release.title, path: `/releases/${encodeURIComponent(slug)}` },
    ]),
  ];

  return (
    <BackgroundSurface background={settings?.pageBackgrounds?.releases}>
      <JsonLd data={structuredData} />
      <section className="mx-auto max-w-4xl px-4 py-24 md:px-8">
        <Link
          href={backHref}
          className="text-xs font-semibold uppercase tracking-widest text-zinc-400 transition-colors hover:text-accent-text"
        >
          ← All releases
        </Link>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="relative aspect-square bg-black">
            {coverUrl && (
              <Image
                src={coverUrl}
                alt={`${release.title} cover`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <span
              className={`inline-block rounded-sm px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                status === 'upcoming' ? 'bg-accent text-white' : 'border border-white/15 text-zinc-300'
              }`}
            >
              {status === 'upcoming' ? 'Coming soon' : 'Out now'}
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-accent-text">
              {[release.releaseType, formatRelativeDate(release.releaseDate, now)].filter(Boolean).join(' · ')}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase text-white">{release.title}</h1>
            <time dateTime={release.releaseDate} className="mt-2 block text-sm text-zinc-400">
              {formatReleaseDate(release.releaseDate) || release.releaseDate}
            </time>
            {release.teaser && <p className="mt-6 whitespace-pre-line text-zinc-300">{release.teaser}</p>}

            {upcoming && (preSaveUrl || preOrderUrl) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {preSaveUrl && (
                  <a
                    href={preSaveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
                  >
                    Pre-save
                  </a>
                )}
                {preOrderUrl && (
                  <a
                    href={preOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm border border-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent-text"
                  >
                    Pre-order
                  </a>
                )}
              </div>
            )}

            {showCountdown && <ReleaseCountdown releaseDate={release.releaseDate} />}

            {links.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={link.key ?? link.href}
                    href={link.key ? `/go/${encodeURIComponent(release._id)}/${encodeURIComponent(link.key)}` : link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent-text"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {showShare && <ShareButtons title={release.title} />}
          </div>
        </div>

        {showTracklist && tracks.length > 0 && <ReleaseTracklist tracks={tracks} />}
        {showCredits && <ReleaseCredits credits={release.credits} />}
      </section>
    </BackgroundSurface>
  );
}
