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

function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Whole days from today (in the band's time zone) to the release date; negative once released. NaN for invalid dates. */
export function daysUntil(releaseDate: string, now: Date): number {
  if (!isDateOnly(releaseDate) || Number.isNaN(now.getTime())) return Number.NaN;
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

export type ReleaseStatus = 'upcoming' | 'released' | 'unknown';

export function releaseStatus(release: Pick<Release, 'releaseDate'>, now: Date): ReleaseStatus {
  const days = daysUntil(release.releaseDate, now);
  if (Number.isNaN(days)) return 'unknown';
  return days > 0 ? 'upcoming' : 'released';
}

/** Link to the newest released release, or the next upcoming one when nothing has been released yet. */
export function latestReleaseHref(releases: Release[], now: Date): string | undefined {
  const withSlug = releases.filter((release) => release.slug && !Number.isNaN(daysUntil(release.releaseDate, now)));
  const { upcoming, released } = splitReleases(withSlug, now);
  const latest = released[0] ?? upcoming[0];
  return latest?.slug ? `/releases/${encodeURIComponent(latest.slug)}` : undefined;
}

const longDateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
});

/** Human-readable release date. Returns an empty string for malformed values. */
export function formatReleaseDate(value: string): string {
  if (!isDateOnly(value)) return '';
  return longDateFormat.format(new Date(`${value}T00:00:00Z`));
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((entry) => entry.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - date.getTime();
}

/**
 * Timestamp at which the release day starts in Europe/Berlin. Used for the live
 * countdown and for the "Out now" state. NaN for invalid date-only values.
 */
export function releaseStartTimestamp(releaseDate: string): number {
  if (!isDateOnly(releaseDate)) return Number.NaN;
  const utcMidnight = Date.parse(`${releaseDate}T00:00:00Z`);
  const offset = timeZoneOffsetMs(new Date(utcMidnight), SITE_TIME_ZONE);
  const localMidnight = utcMidnight - offset;
  const correctedOffset = timeZoneOffsetMs(new Date(localMidnight), SITE_TIME_ZONE);
  return correctedOffset === offset ? localMidnight : utcMidnight - correctedOffset;
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
