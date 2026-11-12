import { toHttpsUrl } from '@/lib/embeds';
import { formatShowDate, formatShowLocation } from '@/lib/shows';
import type { Show } from '@/lib/sanity';

interface TourShowListProps {
  shows: Show[];
  ticketLabel: string;
  soldOutLabel: string;
  past?: boolean;
}

export default function TourShowList({ shows, ticketLabel, soldOutLabel, past = false }: TourShowListProps) {
  return (
    <ul className="divide-y divide-white/10 border-y border-white/10">
      {shows.map((show) => {
        const ticketUrl = toHttpsUrl(show.ticketUrl);
        return (
          <li key={show._id} className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-text">
                {formatShowDate(show)}
              </p>
              <p className="mt-1 font-display text-xl font-semibold uppercase text-white">{show.venue}</p>
              <p className="text-sm text-zinc-400">{formatShowLocation(show)}</p>
              {show.support && <p className="mt-1 text-sm text-muted">With {show.support}</p>}
              {show.notes && <p className="mt-1 text-sm text-muted">{show.notes}</p>}
            </div>
            <div>
              {past ? null : show.soldOut ? (
                <span className="inline-block rounded-sm border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  {soldOutLabel}
                </span>
              ) : ticketUrl ? (
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-sm bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
                >
                  {ticketLabel}
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
