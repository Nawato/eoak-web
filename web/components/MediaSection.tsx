import ConsentEmbed from '@/components/ConsentEmbed';
import { getSpotifyEmbedUrl, getYouTubeVideoId, getHttpsLinks, type LabeledLink } from '@/lib/embeds';

interface MediaSectionProps {
  latestYoutubeUrl: string;
  featuredSpotifyUrl: string;
  streamingLinks?: LabeledLink[];
}

export default function MediaSection({ latestYoutubeUrl, featuredSpotifyUrl, streamingLinks = [] }: MediaSectionProps) {
  const links = getHttpsLinks(streamingLinks);
  const videoId = getYouTubeVideoId(latestYoutubeUrl);
  const spotifyEmbedUrl = getSpotifyEmbedUrl(featuredSpotifyUrl);

  return (
    <section id="music" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">
          Music
        </h2>

        <div className="grid items-stretch gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <h3 className="text-center font-display text-2xl font-semibold uppercase text-white">
              Latest Video
            </h3>
            {videoId ? (
              <ConsentEmbed
                provider="YouTube"
                description="This video is hosted by YouTube."
                className="rounded-sm border border-white/10 bg-black [&>div]:lg:aspect-video"
              >
                <iframe
                  className="block aspect-video w-full"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                  title="Latest release video"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </ConsentEmbed>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-sm border border-white/10 bg-black p-6 text-center text-sm text-muted">
                No latest release video configured in Sanity yet.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-center font-display text-2xl font-semibold uppercase text-white">
              Featured Release
            </h3>
            {spotifyEmbedUrl ? (
              <ConsentEmbed
                provider="Spotify"
                description="This player is provided by Spotify."
                className="relative h-[400px] rounded-sm border border-white/10 lg:h-auto lg:flex-1 [&>div]:absolute [&>div]:inset-0 [&>div]:min-h-0 [&>div]:overflow-auto"
              >
                <iframe
                  className="absolute inset-0 block h-full w-full"
                  src={spotifyEmbedUrl}
                  title="Spotify featured release"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="encrypted-media"
                />
              </ConsentEmbed>
            ) : (
              <p className="text-center text-sm text-muted">No Spotify release configured yet.</p>
            )}
          </div>
        </div>

        {links.length > 0 && (
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {links.map((link) => (
              <a
                key={link.key ?? link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent-text"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
