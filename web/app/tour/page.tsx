import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getShows, getSiteSettings } from '@/lib/sanity';
import { resolveFeatures } from '@/lib/features';
import { splitShows } from '@/lib/shows';
import { buildMusicEventJsonLd } from '@/lib/structured-data';
import BackgroundSurface from '@/components/BackgroundSurface';
import JsonLd from '@/components/JsonLd';
import TourShowList from '@/components/TourShowList';

export const metadata: Metadata = {
  title: 'Tour Dates',
  description: 'Upcoming and past live shows.',
  alternates: { canonical: '/tour' },
  openGraph: {
    title: 'Tour Dates',
    description: 'Upcoming and past live shows.',
    url: '/tour',
  },
};

export default async function TourPage() {
  await connection();
  const [settings, shows] = await Promise.all([getSiteSettings(), getShows()]);
  const features = resolveFeatures(settings?.features);
  if (!features.tourArchive) notFound();

  const { upcoming, past } = splitShows(shows, new Date());
  const bandName = settings?.bandName ?? 'End Of All Known';
  const ticketLabel = settings?.tourTicketLabel?.trim() || 'Tickets';
  const soldOutLabel = settings?.tourSoldOutLabel?.trim() || 'Sold out';
  const noShowsText = settings?.tourNoShowsText?.trim() || 'No upcoming shows announced.';

  return (
    <BackgroundSurface background={settings?.pageBackgrounds?.shows}>
      <JsonLd data={buildMusicEventJsonLd(upcoming, bandName)} />
      <section className="mx-auto max-w-4xl px-4 py-24 md:px-8">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-widest text-zinc-400 transition-colors hover:text-accent-text"
        >
          ← Back to homepage
        </Link>
        <h1 className="mt-8 mb-4 text-center font-display text-4xl font-bold uppercase text-white md:text-5xl">
          {settings?.tourHeading?.trim() || 'Tour Dates'}
        </h1>
        <p className="mb-12 text-center text-zinc-400">Upcoming and past live shows.</p>

        <section aria-labelledby="upcoming-shows-heading">
          <h2 id="upcoming-shows-heading" className="mb-6 font-display text-2xl font-semibold uppercase text-white">
            Upcoming shows
          </h2>
          {upcoming.length > 0 ? (
            <TourShowList shows={upcoming} ticketLabel={ticketLabel} soldOutLabel={soldOutLabel} />
          ) : (
            <p role="status" className="text-muted">{noShowsText}</p>
          )}
        </section>

        {past.length > 0 && (
          <section aria-labelledby="past-shows-heading" className="mt-16">
            <h2 id="past-shows-heading" className="mb-6 font-display text-2xl font-semibold uppercase text-white">
              Past shows
            </h2>
            <TourShowList shows={past} ticketLabel={ticketLabel} soldOutLabel={soldOutLabel} past />
          </section>
        )}
      </section>
    </BackgroundSurface>
  );
}
