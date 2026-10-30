'use client';

import Script from 'next/script';

interface TourDatesProps {
  artistName: string;
}

export default function TourDates({ artistName }: TourDatesProps) {
  return (
    <section id="shows" className="scroll-mt-20 border-y border-white/5 bg-surface py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">
          Tour Dates
        </h2>

        {/* Bandsintown Tour Dates Widget */}
        <Script src="https://widget.bandsintown.com/main.min.js" strategy="afterInteractive" />
        <div id="bandintown-tour-dates" className="mx-auto max-w-xl rounded-sm border border-white/10 bg-zinc-800 p-6" />

        <p className="mt-8 text-center text-sm text-muted">
          See all upcoming shows via Bandsintown for{' '}
          <a
            href={`https://www.bandsintown.com/${artistName}?utm_source=eoak-web`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-dark"
          >
            {artistName}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
