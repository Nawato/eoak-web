import { describe, expect, it } from 'vitest';
import {
  formatReleaseDate,
  formatRelativeDate,
  latestReleaseHref,
  releaseStartTimestamp,
  releaseStatus,
  splitReleases,
} from './releases';
import type { Release } from './sanity';

const now = new Date('2026-10-31T15:00:00Z');
const r = (id: string, releaseDate: string): Release => ({ _id: id, title: id, releaseDate });

describe('releases', () => {
  it('splits upcoming and released, treating release day as released', () => {
    const { upcoming, released } = splitReleases(
      [r('old', '2025-01-01'), r('today', '2026-10-31'), r('later', '2027-03-01'), r('soon', '2026-11-05')],
      now,
    );
    expect(upcoming.map((x) => x._id)).toEqual(['soon', 'later']);
    expect(released.map((x) => x._id)).toEqual(['today', 'old']);
  });

  it('uses the Berlin calendar day', () => {
    const lateUtc = new Date('2026-10-31T23:30:00Z');
    expect(splitReleases([r('a', '2026-11-01')], lateUtc).released).toHaveLength(1);
  });

  it('uses Berlin summer time and handles DST without fractional days', () => {
    expect(formatRelativeDate('2026-07-01', new Date('2026-06-30T22:30:00Z'))).toBe('today');
    expect(formatRelativeDate('2026-10-26', new Date('2026-10-24T22:30:00Z'))).toBe('tomorrow');
  });

  it.each(['not-a-date', '2026-02-30', '2026-10-31T23:00:00Z', '2026-1-01'])('rejects invalid date-only values: %s', (date) => {
    expect(formatRelativeDate(date, now)).toBe('');
    expect(splitReleases([r('bad', date)], now)).toEqual({ upcoming: [], released: [] });
  });

  it('formats relative dates', () => {
    expect(formatRelativeDate('2026-10-31', now)).toBe('today');
    expect(formatRelativeDate('2026-11-01', now)).toBe('tomorrow');
    expect(formatRelativeDate('2026-11-12', now)).toBe('in 12 days');
    expect(formatRelativeDate('2027-01-31', now)).toBe('in 3 months');
    expect(formatRelativeDate('2026-10-01', now)).toBe('4 weeks ago');
  });

  it('reports upcoming, released and unknown states', () => {
    expect(releaseStatus(r('soon', '2026-11-13'), now)).toBe('upcoming');
    expect(releaseStatus(r('today', '2026-10-31'), now)).toBe('released');
    expect(releaseStatus(r('bad', 'not-a-date'), now)).toBe('unknown');
  });

  it('uses Berlin midnight for the countdown in winter and summer', () => {
    expect(new Date(releaseStartTimestamp('2026-01-15')).toISOString()).toBe('2026-01-14T23:00:00.000Z');
    expect(new Date(releaseStartTimestamp('2026-07-15')).toISOString()).toBe('2026-07-14T22:00:00.000Z');
    expect(Number.isNaN(releaseStartTimestamp('2026-02-30'))).toBe(true);
  });

  it('links to the newest released release, falling back to the next upcoming one', () => {
    const releases: Release[] = [
      { _id: 'old', title: 'Old', slug: 'old', releaseDate: '2025-01-01' },
      { _id: 'new', title: 'New', slug: 'new', releaseDate: '2026-10-01' },
      { _id: 'soon', title: 'Soon', slug: 'soon', releaseDate: '2027-01-01' },
      { _id: 'no-slug', title: 'No slug', releaseDate: '2026-12-01' },
    ];
    expect(latestReleaseHref(releases, now)).toBe('/releases/new');
    expect(latestReleaseHref([releases[2]], now)).toBe('/releases/soon');
    expect(latestReleaseHref([releases[3]], now)).toBeUndefined();
  });

  it('formats long release dates and rejects malformed values', () => {
    expect(formatReleaseDate('2026-11-12')).toBe('12 November 2026');
    expect(formatReleaseDate('2026-02-30')).toBe('');
  });
});
