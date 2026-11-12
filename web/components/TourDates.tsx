import BandsintownWidget from '@/components/BandsintownWidget';
import ConsentEmbed from '@/components/ConsentEmbed';
import JsonLd from '@/components/JsonLd';
import TourShowList from '@/components/TourShowList';
import { toHttpsUrl } from '@/lib/embeds';
import { splitShows } from '@/lib/shows';
import { buildMusicEventJsonLd } from '@/lib/structured-data';
import type { Show } from '@/lib/sanity';
import type { TourMode } from '@/sanity/types';
import Link from 'next/link';

interface TourDatesProps {
  artistName: string;
  bandsintownUrl?: string | null;
  mode?: TourMode | null;
  shows?: Show[];
  heading?: string | null;
  noShowsText?: string | null;
  ticketLabel?: string | null;
  soldOutLabel?: string | null;
  archiveHref?: string;
  now?: Date;
}

export default function TourDates({
  artistName,
  bandsintownUrl,
  mode = 'auto',
  shows = [],
  heading,
  noShowsText,
  ticketLabel,
  soldOutLabel,
  archiveHref,
  now = new Date(),
}: TourDatesProps) {
  const { upcoming } = splitShows(shows, now);
  const useManualShows = mode === 'manual' || (mode === 'auto' && upcoming.length > 0);
  const showsUrl = toHttpsUrl(bandsintownUrl) ??
    `https://www.bandsintown.com/search?searchTerm=${encodeURIComponent(artistName)}`;

  return (
    <section id="shows" className="scroll-mt-20 border-y border-white/5 bg-surface py-24">
      {useManualShows && <JsonLd data={buildMusicEventJsonLd(upcoming, artistName)} />}
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">
          {heading?.trim() || 'Tour Dates'}
        </h2>

        {useManualShows ? (
          <>
            {upcoming.length > 0 ? (
              <TourShowList
                shows={upcoming}
                ticketLabel={ticketLabel?.trim() || 'Tickets'}
                soldOutLabel={soldOutLabel?.trim() || 'Sold out'}
              />
            ) : (
              <p role="status" className="text-center text-muted">
                {noShowsText?.trim() || 'No upcoming shows announced.'}
              </p>
            )}
            {archiveHref && shows.length > 0 && (
              <p className="mt-8 text-center">
                <Link
                  href={archiveHref}
                  className="text-sm text-muted underline underline-offset-4 transition-colors hover:text-white"
                >
                  All tour dates
                </Link>
              </p>
            )}
          </>
        ) : (
          <>
            <ConsentEmbed
              provider="Bandsintown"
              description="Tour dates are provided by Bandsintown."
              className="mx-auto max-w-xl rounded-sm border border-white/10 bg-zinc-800 p-6"
            >
              <BandsintownWidget key={artistName} artistName={artistName} />
            </ConsentEmbed>
            <p className="mt-6 text-center">
              <a
                href={showsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted underline underline-offset-4 hover:text-white"
              >
                View shows on Bandsintown
              </a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
