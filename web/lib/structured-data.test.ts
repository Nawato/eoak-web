import { describe, expect, it } from 'vitest';
import {
  buildBreadcrumbJsonLd,
  buildMusicAlbumJsonLd,
  buildMusicEventJsonLd,
  buildMusicGroupJsonLd,
  buildWebSiteJsonLd,
  toIsoDuration,
} from './structured-data';
import type { Release, Show } from './sanity';

const show: Show = {
  _id: 'show-1',
  date: '2026-11-14',
  startTime: '20:00',
  venue: 'Arena',
  city: 'Berlin',
  region: 'Berlin',
  country: 'Germany',
  ticketUrl: 'https://tickets.example/show',
};

describe('structured data', () => {
  it('builds MusicEvent entries with location and ticket offers', () => {
    const [event] = buildMusicEventJsonLd([show], 'End Of All Known');
    expect(event['@type']).toBe('MusicEvent');
    expect(event.startDate).toBe('2026-11-14T20:00:00+01:00');
    expect(event.location).toEqual(expect.objectContaining({ name: 'Arena' }));
    expect(event.offers).toEqual(expect.objectContaining({ url: 'https://tickets.example/show' }));
  });

  it('marks sold-out shows and skips invalid dates', () => {
    const [event] = buildMusicEventJsonLd(
      [{ ...show, soldOut: true }, { ...show, _id: 'bad', date: '2026-02-30' }],
      'End Of All Known',
    );
    expect(event.eventStatus).toBe('https://schema.org/EventSoldOut');
    expect(buildMusicEventJsonLd([{ ...show, date: 'bad' }], 'Band')).toEqual([]);
  });

  it('builds a MusicAlbum with ISO durations and an absolute URL', () => {
    const release: Release = {
      _id: 'release-1',
      title: 'Album',
      slug: 'album',
      releaseDate: '2026-11-14',
      releaseType: 'Album',
      tracklist: [
        { title: 'One', duration: '4:12' },
        { title: 'Two', duration: '1:02:03' },
        { title: 'Three', duration: 'not-a-duration' },
      ],
    };
    const album = buildMusicAlbumJsonLd(release, {
      bandName: 'End Of All Known',
      url: '/releases/album',
    });
    expect(album['@type']).toBe('MusicAlbum');
    expect(album.url).toBe('http://localhost:3000/releases/album');
    expect(album.numTracks).toBe(3);
    expect(album.albumReleaseType).toBe('https://schema.org/AlbumRelease');
    expect(album.track).toEqual([
      expect.objectContaining({ name: 'One', duration: 'PT4M12S' }),
      expect.objectContaining({ name: 'Two', duration: 'PT1H2M3S' }),
      expect.objectContaining({ name: 'Three' }),
    ]);
  });

  it('only emits known album release types', () => {
    const album = (releaseType: string | null) =>
      buildMusicAlbumJsonLd(
        { _id: 'release-1', title: 'Album', releaseDate: '2026-11-14', releaseType },
        { bandName: 'Band', url: '/releases/album' },
      );
    expect(album('EP').albumReleaseType).toBe('https://schema.org/EPRelease');
    expect(album('single').albumReleaseType).toBe('https://schema.org/SingleRelease');
    expect(album('Live album')).not.toHaveProperty('albumReleaseType');
    expect(album(null)).not.toHaveProperty('albumReleaseType');
  });

  it('converts track lengths to ISO 8601 and rejects invalid values', () => {
    expect(toIsoDuration('4:12')).toBe('PT4M12S');
    expect(toIsoDuration('0:45')).toBe('PT45S');
    expect(toIsoDuration('1:02:03')).toBe('PT1H2M3S');
    expect(toIsoDuration('0:00')).toBeUndefined();
    expect(toIsoDuration('75:00')).toBeUndefined();
    expect(toIsoDuration('')).toBeUndefined();
    expect(toIsoDuration(null)).toBeUndefined();
  });

  it('builds a MusicGroup with filtered social links and albums', () => {
    const group = buildMusicGroupJsonLd({
      bandName: 'End Of All Known',
      description: 'Dark metalcore.',
      image: 'https://cdn.example/band.jpg',
      logo: 'https://cdn.example/logo.png',
      sameAs: ['https://instagram.com/band', null, undefined],
      members: [{ name: 'Alex' }],
      albums: [{ title: 'Album', url: '/releases/album' }],
    });
    expect(group['@type']).toBe('MusicGroup');
    expect(group['@id']).toBe('http://localhost:3000/#musicgroup');
    expect(group.logo).toBe('https://cdn.example/logo.png');
    expect(group.sameAs).toEqual(['https://instagram.com/band']);
    expect(group.member).toEqual([{ '@type': 'Person', name: 'Alex' }]);
    expect(group.album).toEqual([
      { '@type': 'MusicAlbum', name: 'Album', url: 'http://localhost:3000/releases/album' },
    ]);
  });

  it('builds a WebSite that references the band entity', () => {
    const site = buildWebSiteJsonLd('End Of All Known');
    expect(site['@type']).toBe('WebSite');
    expect(site.publisher).toEqual({ '@id': 'http://localhost:3000/#musicgroup' });
    expect(site.inLanguage).toBe('en');
  });

  it('builds an ordered BreadcrumbList with absolute URLs', () => {
    const breadcrumb = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Releases', path: '/releases' },
    ]);
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toEqual([
      expect.objectContaining({ position: 1, name: 'Home', item: 'http://localhost:3000/' }),
      expect.objectContaining({ position: 2, name: 'Releases', item: 'http://localhost:3000/releases' }),
    ]);
  });
});
