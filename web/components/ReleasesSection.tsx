import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, hasImage } from '@/lib/sanity-image';
import { getHttpsLinks } from '@/lib/embeds';
import { formatRelativeDate, splitReleases } from '@/lib/releases';
import type { Release } from '@/lib/sanity';

const dateFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date);
}

function ReleaseCard({ release, now, upcoming }: { release: Release; now: Date; upcoming: boolean }) {
  const coverUrl = hasImage(release.cover) ? getImageUrl(release.cover, 800, 800) : undefined;
  const links = getHttpsLinks(release.links);
  const relative = formatRelativeDate(release.releaseDate, now);
  const href = release.slug ? `/releases/${encodeURIComponent(release.slug)}` : undefined;
  const title = href ? (
    <Link href={href} className="transition-colors hover:text-accent-text">
      {release.title}
    </Link>
  ) : (
    release.title
  );

  return (
    <article
      className={`overflow-hidden rounded-sm border bg-surface ${upcoming ? 'border-accent/60' : 'border-white/10'}`}
    >
      <div className="relative aspect-square bg-black">
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={`${release.title} cover`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
        {upcoming && (
          <span className="absolute left-3 top-3 rounded-sm bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            Coming soon
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-text">
          {[release.releaseType, relative].filter(Boolean).join(' · ')}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold uppercase text-white">{title}</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-zinc-400">{formatDate(release.releaseDate)}</p>
        {links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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
      </div>
    </article>
  );
}

export default function ReleasesSection({ releases, now = new Date() }: { releases: Release[]; now?: Date }) {
  if (releases.length === 0) return null;
  const { upcoming, released } = splitReleases(releases, now);
  if (upcoming.length + released.length === 0) return null;

  return (
    <section id="releases" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">Releases</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((release) => (
            <ReleaseCard key={release._id} release={release} now={now} upcoming />
          ))}
          {released.map((release) => (
            <ReleaseCard key={release._id} release={release} now={now} upcoming={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
