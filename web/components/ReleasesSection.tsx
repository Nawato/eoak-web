import Image from 'next/image';
import { getImageUrl, hasImage } from '@/lib/sanity-image';
import { getHttpsLinks } from '@/lib/embeds';
import type { Release } from '@/lib/sanity';

const dateFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date);
}

export default function ReleasesSection({ releases }: { releases: Release[] }) {
  if (releases.length === 0) return null;

  return (
    <section id="releases" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">Releases</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => {
            const coverUrl = hasImage(release.cover) ? getImageUrl(release.cover, 800, 800) : undefined;
            const links = getHttpsLinks(release.links);
            return (
              <article key={release._id} className="overflow-hidden rounded-sm border border-white/10 bg-surface">
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
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {[release.releaseType, formatDate(release.releaseDate)].filter(Boolean).join(' · ')}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold uppercase text-white">{release.title}</h3>
                  {links.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
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
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
