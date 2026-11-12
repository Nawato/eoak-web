import Image from 'next/image';
import { getYouTubeVideoId } from '@/lib/embeds';
import { formatReleaseDate } from '@/lib/releases';
import { getImageUrl, getObjectPosition, hasImage } from '@/lib/sanity-image';
import type { Photo, Video } from '@/lib/sanity';

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) return null;
  return (
    <section aria-labelledby="photos-heading">
      <h2 id="photos-heading" className="mb-6 font-display text-2xl font-semibold uppercase text-white">
        Photos
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => {
          const url = hasImage(photo.image) ? getImageUrl(photo.image, 900, 900) : undefined;
          return (
            <li key={photo._id} className="overflow-hidden rounded-sm border border-white/10 bg-surface">
              <figure>
                <div className="relative aspect-square bg-black">
                  {url ? (
                    <Image
                      src={url}
                      alt={photo.alt?.trim() || photo.caption?.trim() || 'Band photo'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      style={{ objectPosition: getObjectPosition(photo.image) }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">
                      Image unavailable
                    </div>
                  )}
                </div>
                {(photo.caption || photo.credit || photo.date) && (
                  <figcaption className="space-y-1 p-4 text-sm text-zinc-400">
                    {photo.caption && <p>{photo.caption}</p>}
                    <p className="text-xs text-muted">
                      {[photo.credit ? `Photo: ${photo.credit}` : null, photo.date ? formatReleaseDate(photo.date) : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function VideoGrid({ videos }: { videos: Video[] }) {
  const playable = videos.flatMap((video) => {
    const id = getYouTubeVideoId(video.youtubeUrl ?? '');
    return id ? [{ video, id }] : [];
  });
  if (playable.length === 0) return null;

  return (
    <section aria-labelledby="videos-heading" className="mt-16">
      <h2 id="videos-heading" className="mb-6 font-display text-2xl font-semibold uppercase text-white">
        Videos
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {playable.map(({ video, id }) => {
          const thumbnail = hasImage(video.thumbnail) ? getImageUrl(video.thumbnail, 800, 450) : undefined;
          return (
            <li key={video._id}>
              <a
                href={`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-sm border border-white/10 bg-surface transition-colors hover:border-accent"
              >
                <div className="relative aspect-video bg-black">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-opacity group-hover:opacity-80"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted">
                      Watch on YouTube
                    </div>
                  )}
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white" aria-hidden="true">
                      ▶
                    </span>
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold uppercase text-white">{video.title}</h3>
                  {video.description && <p className="mt-1 text-sm text-zinc-400">{video.description}</p>}
                  {video.date && <p className="mt-2 text-xs text-muted">{formatReleaseDate(video.date)}</p>}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
