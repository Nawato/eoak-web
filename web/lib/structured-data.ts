import type { Release, Show } from '@/lib/sanity';
import { getHttpsLinks, toHttpsUrl } from '@/lib/embeds';
import { formatShowLocation, showStartIso } from '@/lib/shows';
import { siteUrl } from '@/lib/env';

export interface JsonLd {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}

const ALBUM_RELEASE_TYPES: Record<string, string> = {
  album: 'AlbumRelease',
  ep: 'EPRelease',
  single: 'SingleRelease',
};

/** Convert a `m:ss` or `h:mm:ss` track length into an ISO 8601 duration. */
export function toIsoDuration(value?: string | null): string | undefined {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value?.trim() ?? '');
  if (!match) return undefined;

  const [hours, minutes, seconds] = match[3]
    ? [Number(match[1]), Number(match[2]), Number(match[3])]
    : [0, Number(match[1]), Number(match[2])];
  if (minutes > 59 || seconds > 59) return undefined;

  const iso = `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds ? `${seconds}S` : ''}`;
  return iso === 'PT' ? undefined : iso;
}

export function buildMusicGroupJsonLd(options: {
  bandName: string;
  description?: string | null;
  image?: string;
  logo?: string;
  genre?: string;
  sameAs?: (string | null | undefined)[];
  members?: { name: string }[];
  albums?: { title: string; url: string }[];
}): JsonLd {
  const sameAs = (options.sameAs ?? []).filter((link): link is string => Boolean(link));
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': `${siteUrl}/#musicgroup`,
    name: options.bandName,
    url: siteUrl,
    ...(options.description ? { description: options.description } : {}),
    ...(options.image ? { image: options.image } : {}),
    ...(options.logo ? { logo: options.logo } : {}),
    genre: options.genre ?? 'Metalcore',
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(options.members && options.members.length > 0
      ? { member: options.members.map((member) => ({ '@type': 'Person', name: member.name })) }
      : {}),
    ...(options.albums && options.albums.length > 0
      ? {
          album: options.albums.map((album) => ({
            '@type': 'MusicAlbum',
            name: album.title,
            url: new URL(album.url, siteUrl).toString(),
          })),
        }
      : {}),
  };
}

export function buildWebSiteJsonLd(bandName: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: bandName,
    url: siteUrl,
    inLanguage: 'en',
    publisher: { '@id': `${siteUrl}/#musicgroup` },
  };
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
  const releaseType = ALBUM_RELEASE_TYPES[release.releaseType?.trim().toLowerCase() ?? ''];
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: release.title,
    url: new URL(options.url, siteUrl).toString(),
    ...(options.imageUrl ? { image: options.imageUrl } : {}),
    datePublished: release.releaseDate,
    ...(releaseType ? { albumReleaseType: `https://schema.org/${releaseType}` } : {}),
    byArtist: { '@type': 'MusicGroup', name: options.bandName, url: siteUrl },
    ...(tracks.length > 0
      ? {
          numTracks: tracks.length,
          track: tracks.map((track) => {
            const duration = toIsoDuration(track.duration);
            return {
              '@type': 'MusicRecording',
              name: track.title,
              ...(duration ? { duration } : {}),
            };
          }),
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
