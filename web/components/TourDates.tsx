import Script from 'next/script';
import ConsentEmbed from '@/components/ConsentEmbed';

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

        <ConsentEmbed
          provider="Bandsintown"
          description="Tour dates are provided by Bandsintown."
          className="mx-auto max-w-xl rounded-sm border border-white/10 bg-zinc-800 p-6"
        >
          <Script src="https://widget.bandsintown.com/main.min.js" strategy="afterInteractive" />
          <a
            className="bit-widget-initializer"
            data-artist-name={artistName}
            data-display-local-dates="false"
            data-display-past-dates="false"
            data-auto-style="false"
            data-text-color="#ffffff"
            data-link-color="#e11d48"
            data-background-color="rgba(0,0,0,0)"
            data-display-lineup="false"
            data-display-play-my-city="false"
            data-separator-color="rgba(255,255,255,0.1)"
            data-popup-background-color="#18181b"
          />
        </ConsentEmbed>
      </div>
    </section>
  );
}
