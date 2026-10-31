import BandsintownWidget from '@/components/BandsintownWidget';
import ConsentEmbed from '@/components/ConsentEmbed';
import { toHttpsUrl } from '@/lib/embeds';

interface TourDatesProps {
  artistName: string;
  bandsintownUrl?: string | null;
}

export default function TourDates({ artistName, bandsintownUrl }: TourDatesProps) {
  const showsUrl = toHttpsUrl(bandsintownUrl) ??
    `https://www.bandsintown.com/search?searchTerm=${encodeURIComponent(artistName)}`;
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
      </div>
    </section>
  );
}
