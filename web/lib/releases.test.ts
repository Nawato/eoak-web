import { describe, expect, it } from 'vitest';
import { formatRelativeDate, splitReleases } from './releases';
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

  it('formats relative dates', () => {
    expect(formatRelativeDate('2026-10-31', now)).toBe('today');
    expect(formatRelativeDate('2026-11-01', now)).toBe('tomorrow');
    expect(formatRelativeDate('2026-11-12', now)).toBe('in 12 days');
    expect(formatRelativeDate('2027-01-31', now)).toBe('in 3 months');
    expect(formatRelativeDate('2026-10-01', now)).toBe('4 weeks ago');
  });
});
