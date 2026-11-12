import { describe, expect, it } from 'vitest';
import { formatShowDate, formatShowLocation, showStartIso, splitShows } from './shows';
import type { Show } from './sanity';

const now = new Date('2026-11-12T12:00:00Z');
const show = (id: string, date: string, overrides: Partial<Show> = {}): Show => ({
  _id: id,
  date,
  venue: `Venue ${id}`,
  city: 'Berlin',
  ...overrides,
});

describe('shows', () => {
  it('includes today in upcoming shows and splits past shows newest first', () => {
    const { upcoming, past } = splitShows(
      [
        show('past-old', '2025-01-01'),
        show('today', '2026-11-12'),
        show('future', '2027-03-01'),
        show('past-new', '2026-10-01'),
      ],
      now,
    );
    expect(upcoming.map((entry) => entry._id)).toEqual(['today', 'future']);
    expect(past.map((entry) => entry._id)).toEqual(['past-new', 'past-old']);
  });

  it('uses the Berlin calendar day around midnight UTC', () => {
    const lateUtc = new Date('2026-11-12T23:30:00Z');
    // 00:30 on 13 November in Berlin, so a show on the 12th is already past.
    expect(splitShows([show('today', '2026-11-12')], lateUtc).upcoming).toHaveLength(0);
    expect(splitShows([show('tomorrow', '2026-11-13')], lateUtc).upcoming).toHaveLength(1);
  });

  it('ignores invalid dates', () => {
    expect(splitShows([show('bad', '2026-02-30'), show('bad2', 'not-a-date')], now)).toEqual({
      upcoming: [],
      past: [],
    });
  });

  it('formats dates, locations and schema.org start values', () => {
    const entry = show('one', '2026-11-14', {
      startTime: '20:00',
      venue: 'Arena',
      city: 'Berlin',
      region: 'Berlin',
      country: 'Germany',
    });
    expect(formatShowDate(entry)).toBe('Sat, 14 November 2026 · 20:00');
    expect(formatShowLocation(entry)).toBe('Berlin, Germany');
    expect(showStartIso(entry)).toBe('2026-11-14T20:00:00');
    expect(showStartIso(show('two', '2026-11-14'))).toBe('2026-11-14T20:00:00');
    expect(showStartIso(show('bad', '2026-02-30'))).toBe('');
  });
});
