import type { Release } from '@/lib/sanity';

const DAY_MS = 86_400_000;

const SITE_TIME_ZONE = 'Europe/Berlin';
const dayFormat = new Intl.DateTimeFormat('en', {
  timeZone: SITE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});

function toDayNumber(value: string): number {
  const date = new Date(`${value}T00:00:00Z`);
  return date.getTime() / DAY_MS;
}

/** Whole days from today (in the band's time zone) to the release date; negative once released. NaN for invalid dates. */
export function daysUntil(releaseDate: string, now: Date): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate) || Number.isNaN(now.getTime())) return Number.NaN;
  const date = new Date(`${releaseDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== releaseDate) return Number.NaN;
  const parts = dayFormat.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  return Math.round(toDayNumber(releaseDate) - toDayNumber(today));
}

export function isUpcoming(release: Pick<Release, 'releaseDate'>, now: Date): boolean {
  return daysUntil(release.releaseDate, now) > 0;
}

/** Upcoming releases (soonest first) and released ones (newest first). The split happens at render time, so nothing needs to be moved manually. */
export function splitReleases(releases: Release[], now: Date): { upcoming: Release[]; released: Release[] } {
  const dated = releases.filter((release) => !Number.isNaN(daysUntil(release.releaseDate, now)));
  return {
    upcoming: dated
      .filter((release) => isUpcoming(release, now))
      .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate)),
    released: dated
      .filter((release) => !isUpcoming(release, now))
      .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)),
  };
}

const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "today", "tomorrow", "in 12 days", "in 3 months", "2 weeks ago", ... */
export function formatRelativeDate(releaseDate: string, now: Date): string {
  const days = daysUntil(releaseDate, now);
  if (Number.isNaN(days)) return '';
  const abs = Math.abs(days);
  const sign = Math.sign(days);
  if (abs < 14) return relativeFormat.format(days, 'day');
  if (abs < 60) return relativeFormat.format(sign * Math.round(abs / 7), 'week');
  if (abs < 730) return relativeFormat.format(sign * Math.round(abs / 30.44), 'month');
  return relativeFormat.format(sign * Math.round(abs / 365.25), 'year');
}
