import { describe, expect, it } from 'vitest';
import {
  buildBreadcrumbJsonLd,
  buildMusicAlbumJsonLd,
  buildMusicEventJsonLd,
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
    expect(event.startDate).toBe('2026-11-14T20:00:00');
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

  it('builds a MusicAlbum with tracks and an absolute URL', () => {
    const release: Release = {
      _id: 'release-1',
      title: 'Album',
      slug: 'album',
      releaseDate: '2026-11-14',
      releaseType: 'Album',
      tracklist: [{ title: 'One', duration: '4:12' }, { title: 'Two' }],
    };
    const album = buildMusicAlbumJsonLd(release, {
      bandName: 'End Of All Known',
      url: '/releases/album',
    });
    expect(album['@type']).toBe('MusicAlbum');
    expect(album.url).toBe('http://localhost:3000/releases/album');
    expect(album.numTracks).toBe(2);
    expect(album.track).toEqual([
      expect.objectContaining({ name: 'One', duration: '4:12' }),
      expect.objectContaining({ name: 'Two' }),
    ]);
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
