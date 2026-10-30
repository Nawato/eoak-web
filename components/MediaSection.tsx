interface MediaSectionProps {
  latestYoutubeUrl: string;
  featuredSpotifyUrl: string;
}

function getYouTubeVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{6,})/,
    /(?:youtu\.be\/)([\w-]{6,})/,
    /(?:youtube\.com\/embed\/)([\w-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return '';
}

function getSpotifyEmbedUrl(url: string): string {
  const parts = url.split('/').filter(Boolean);
  const id = parts[parts.length - 1] ?? '';
  if (!id) return '';
  const kind = url.includes('/album/') ? 'album' : url.includes('/track/') ? 'track' : 'artist';
  return `https://open.spotify.com/embed/${kind}/${id}`;
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
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                title="Latest release video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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
              <iframe
                className="h-[400px] w-full rounded-sm border border-white/10"
                src={spotifyEmbedUrl}
                title="Spotify featured release"
                allow="encrypted-media"
              />
            ) : (
              <p className="text-center text-sm text-muted">No Spotify release configured yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
