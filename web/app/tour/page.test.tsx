import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getShows: vi.fn(),
  getSiteSettings: vi.fn(),
  connection: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));

vi.mock('@/lib/sanity', () => mocks);
vi.mock('next/server', () => ({ connection: mocks.connection }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('@/lib/sanity-image', () => ({
  hasImage: () => false,
  getImageUrl: vi.fn(),
  getObjectPosition: vi.fn(),
}));

import TourPage from './page';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getShows.mockResolvedValue([]);
  mocks.getSiteSettings.mockResolvedValue(null);
});

it('returns not-found when the tour archive is disabled', async () => {
  mocks.getSiteSettings.mockResolvedValue({ features: { tourArchive: false } });
  await expect(TourPage()).rejects.toThrow('NOT_FOUND');
  expect(mocks.notFound).toHaveBeenCalled();
});

it('renders upcoming and past shows with configured labels', async () => {
  mocks.getShows.mockResolvedValue([
    {
      _id: 'upcoming',
      date: '2099-12-01',
      venue: 'Future Hall',
      city: 'Berlin',
      country: 'Germany',
      ticketUrl: 'https://tickets.example/future',
    },
    {
      _id: 'past',
      date: '2020-01-01',
      venue: 'Old Club',
      city: 'Hamburg',
      country: 'Germany',
      ticketUrl: 'https://tickets.example/old',
    },
  ]);
  mocks.getSiteSettings.mockResolvedValue({
    bandName: 'End Of All Known',
    tourHeading: 'Live Dates',
    tourTicketLabel: 'Tickets now',
    tourSoldOutLabel: 'Ausverkauft',
  });

  const html = renderToStaticMarkup(await TourPage());

  expect(html).toContain('Live Dates');
  expect(html).toContain('Future Hall');
  expect(html).toContain('Old Club');
  expect(html).toContain('Tickets now');
  expect(html).not.toContain('Ausverkauft');
  // Past shows never show purchase links.
  expect(html).not.toContain('href="https://tickets.example/old"');
  expect(html).toContain('href="https://tickets.example/future"');
  expect(html).toContain('"@type":"MusicEvent"');
});

it('renders the configured empty state when no shows are upcoming', async () => {
  mocks.getSiteSettings.mockResolvedValue({ tourNoShowsText: 'Nothing announced yet.' });

  const html = renderToStaticMarkup(await TourPage());

  expect(html).toContain('Nothing announced yet.');
  expect(html).not.toContain('Past shows');
  expect(html).not.toContain('"@type":"MusicEvent"');
});
