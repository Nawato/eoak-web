import type { Release, Show } from '@/lib/sanity';
import { getHttpsLinks, toHttpsUrl } from '@/lib/embeds';
import { formatShowLocation, showStartIso } from '@/lib/shows';
import { siteUrl } from '@/lib/env';

export interface JsonLd {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}

export function buildMusicEventJsonLd(shows: Show[], bandName: string): JsonLd[] {
  return shows.flatMap((show) => {
    const startDate = showStartIso(show);
    if (!startDate) return [];
    const location = formatShowLocation(show);
    if (!location) return [];
    const ticket = toHttpsUrl(show.ticketUrl);
    return [{
      '@context': 'https://schema.org' as const,
      '@type': 'MusicEvent',
      name: `${bandName} at ${show.venue}`,
      startDate,
      eventStatus: show.soldOut
        ? 'https://schema.org/EventSoldOut'
        : 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: show.venue,
        address: {
          '@type': 'PostalAddress',
          addressLocality: show.city,
          addressRegion: show.region || undefined,
          addressCountry: show.country || undefined,
        },
      },
      performer: { '@type': 'MusicGroup', name: bandName },
      ...(ticket ? { offers: { '@type': 'Offer', url: ticket, availability: show.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' } } : {}),
    }];
  });
}

export function buildMusicAlbumJsonLd(
  release: Release,
  options: { bandName: string; imageUrl?: string; url: string },
): JsonLd {
  const tracks = (release.tracklist ?? []).filter((track) => track.title?.trim());
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: release.title,
    url: new URL(options.url, siteUrl).toString(),
    ...(options.imageUrl ? { image: options.imageUrl } : {}),
    datePublished: release.releaseDate,
    ...(release.releaseType ? { albumReleaseType: `https://schema.org/${release.releaseType}Release` } : {}),
    byArtist: { '@type': 'MusicGroup', name: options.bandName, url: siteUrl },
    ...(tracks.length > 0
      ? {
          numTracks: tracks.length,
          track: tracks.map((track) => ({
            '@type': 'MusicRecording',
            name: track.title,
            ...(track.duration ? { duration: track.duration } : {}),
          })),
        }
      : {}),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).toString(),
    })),
  };
}

export function buildReleaseLinks(release: Release) {
  return getHttpsLinks(release.links);
}
