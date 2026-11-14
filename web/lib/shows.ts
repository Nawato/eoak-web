import type { Show } from '@/lib/sanity';

const DAY_MS = 86_400_000;
const SITE_TIME_ZONE = 'Europe/Berlin';
const dayFormat = new Intl.DateTimeFormat('en', {
  timeZone: SITE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});

function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function todayInSiteTimeZone(now: Date): string {
  const parts = dayFormat.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

/** Whole days from today (Europe/Berlin) to the show date. NaN for invalid dates. */
export function daysUntilShow(date: string, now: Date): number {
  if (!isDateOnly(date) || Number.isNaN(now.getTime())) return Number.NaN;
  const showDay = new Date(`${date}T00:00:00Z`).getTime();
  const today = new Date(`${todayInSiteTimeZone(now)}T00:00:00Z`).getTime();
  return Math.round((showDay - today) / DAY_MS);
}

export function isUpcomingShow(show: Pick<Show, 'date'>, now: Date): boolean {
  const days = daysUntilShow(show.date, now);
  return !Number.isNaN(days) && days >= 0;
}

/** Upcoming shows (soonest first, including today) and past shows (newest first). */
export function splitShows(shows: Show[], now: Date): { upcoming: Show[]; past: Show[] } {
  const dated = shows.filter((show) => !Number.isNaN(daysUntilShow(show.date, now)));
  return {
    upcoming: dated
      .filter((show) => isUpcomingShow(show, now))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    past: dated
      .filter((show) => !isUpcomingShow(show, now))
      .sort((a, b) => b.date.localeCompare(a.date) || (b.startTime ?? '').localeCompare(a.startTime ?? '')),
  };
}

const showDateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
});

/** "Sat, 14 November 2026", optionally followed by " · 20:00". */
export function formatShowDate(show: Pick<Show, 'date' | 'startTime'>): string {
  if (!isDateOnly(show.date)) return '';
  const date = showDateFormat.format(new Date(`${show.date}T00:00:00Z`));
  const time = show.startTime?.trim();
  return time ? `${date} · ${time}` : date;
}

/** "Berlin, Germany"; region is included when it differs from the city. */
export function formatShowLocation(show: Pick<Show, 'city' | 'region' | 'country'>): string {
  const parts = [show.city, show.region && show.region !== show.city ? show.region : null, show.country]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.join(', ');
}

/** ISO date used by schema.org MusicEvent, including the Europe/Berlin UTC offset. */
export function showStartIso(show: Pick<Show, 'date' | 'startTime'>): string {
  if (!isDateOnly(show.date)) return '';
  const time = /^\d{2}:\d{2}$/.test(show.startTime?.trim() ?? '') ? show.startTime!.trim() : '20:00';
  return `${show.date}T${time}:00${siteOffset(show.date, time)}`;
}

const offsetFormat = new Intl.DateTimeFormat('en', {
  timeZone: SITE_TIME_ZONE,
  timeZoneName: 'longOffset',
});

function berlinOffsetMinutes(instant: number): number {
  const name = offsetFormat.formatToParts(new Date(instant)).find((part) => part.type === 'timeZoneName')?.value ?? '';
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(name);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === '-' ? -minutes : minutes;
}

/** Offset formatted as `+01:00`, accounting for daylight saving time. */
function siteOffset(date: string, time: string): string {
  const wallClock = Date.parse(`${date}T${time}:00Z`);
  // Treat the wall clock as UTC, then correct it by the zone offset of that instant.
  const instant = wallClock - berlinOffsetMinutes(wallClock) * 60_000;
  const offset = berlinOffsetMinutes(instant);
  const sign = offset < 0 ? '-' : '+';
  const absolute = Math.abs(offset);
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
}
