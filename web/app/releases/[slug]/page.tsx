import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getReleases, getSiteSettings } from '@/lib/sanity';
import { getImageUrl, hasImage } from '@/lib/sanity-image';
import { getHttpsLinks } from '@/lib/embeds';
import { formatRelativeDate, isUpcoming } from '@/lib/releases';
import BackgroundSurface from '@/components/BackgroundSurface';

type Props = { params: Promise<{ slug: string }> };

async function findRelease(slug: string) {
  const releases = await getReleases();
  return releases.find((release) => release.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await findRelease(slug);
  if (!release) return {};
  return {
    title: release.title,
    description: release.teaser ?? undefined,
    alternates: { canonical: `/releases/${encodeURIComponent(slug)}` },
  };
}

export default async function ReleasePage({ params }: Props) {
  const { slug } = await params;
  const [release, settings] = await Promise.all([findRelease(slug), getSiteSettings()]);
  if (!release) notFound();

  const now = new Date();
  const upcoming = isUpcoming(release, now);
  const coverUrl = hasImage(release.cover) ? getImageUrl(release.cover, 1000, 1000) : undefined;
  const links = getHttpsLinks(release.links);

  return (
    <BackgroundSurface background={settings?.pageBackgrounds?.releases}>
      <section className="mx-auto max-w-4xl px-4 py-24 md:px-8">
        <Link
          href="/#releases"
          className="text-xs font-semibold uppercase tracking-widest text-zinc-400 transition-colors hover:text-accent"
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
            {upcoming && (
              <span className="inline-block rounded-sm bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
                Coming soon
              </span>
            )}
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-accent">
              {[release.releaseType, formatRelativeDate(release.releaseDate, now)].filter(Boolean).join(' · ')}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase text-white">{release.title}</h1>
            {release.teaser && <p className="mt-6 whitespace-pre-line text-zinc-300">{release.teaser}</p>}
            {links.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={link.key ?? link.href}
                    href={link.key ? `/go/${encodeURIComponent(release._id)}/${encodeURIComponent(link.key)}` : link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </BackgroundSurface>
  );
}
