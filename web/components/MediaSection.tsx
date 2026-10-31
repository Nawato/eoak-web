import ConsentEmbed from '@/components/ConsentEmbed';
import { getSpotifyEmbedUrl, getYouTubeVideoId } from '@/lib/embeds';

interface MediaSectionProps {
  latestYoutubeUrl: string;
  featuredSpotifyUrl: string;
}

export default function MediaSection({ latestYoutubeUrl, featuredSpotifyUrl }: MediaSectionProps) {
  const videoId = getYouTubeVideoId(latestYoutubeUrl);
  const spotifyEmbedUrl = getSpotifyEmbedUrl(featuredSpotifyUrl);

  return (
    <section id="music" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">
          Music
        </h2>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* YouTube Player */}
          <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-white/10 bg-black">
            {videoId ? (
              <ConsentEmbed
                provider="YouTube"
                description="This video is hosted by YouTube."
                className="absolute inset-0 h-full w-full overflow-auto"
              >
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                  title="Latest release video"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </ConsentEmbed>
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-muted">
                No latest release video configured in Sanity yet.
              </div>
            )}
          </div>

          {/* Spotify Embed */}
          <div className="flex flex-col gap-6">
            <h3 className="text-center font-display text-2xl font-semibold uppercase text-white">
              Featured Release
            </h3>
            {spotifyEmbedUrl ? (
              <ConsentEmbed
                provider="Spotify"
                description="This player is provided by Spotify."
                className="rounded-sm border border-white/10"
              >
                <iframe
                  className="h-[400px] w-full"
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
      </div>
    </section>
  );
}
