import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TourDates from './TourDates';
import type { Show } from '@/lib/sanity';

const now = new Date('2026-11-12T12:00:00Z');
const show = (id: string, date: string, overrides: Partial<Show> = {}): Show => ({
  _id: id,
  date,
  venue: `Venue ${id}`,
  city: 'Berlin',
  country: 'Germany',
  ...overrides,
});

const renderTour = (props: Omit<Parameters<typeof TourDates>[0], 'artistName'>) =>
  renderToStaticMarkup(createElement(TourDates, { artistName: 'End Of All Known', now, ...props }));

describe('Bandsintown link', () => {
  it('uses the published custom link', () => {
    const html = renderToStaticMarkup(createElement(TourDates, {
      artistName: 'End Of All Known',
      bandsintownUrl: 'https://www.bandsintown.com/a/15547297',
    }));
    expect(html).toContain('href="https://www.bandsintown.com/a/15547297"');
  });

  it.each([undefined, null, '', 'javascript:alert(1)', 'http://example.com'])(
    'keeps the existing search fallback for absent or unsafe links (%s)',
    (bandsintownUrl) => {
      const html = renderToStaticMarkup(createElement(TourDates, {
        artistName: 'Band & Friends',
        bandsintownUrl,
      }));
      expect(html).toContain('href="https://www.bandsintown.com/search?searchTerm=Band%20%26%20Friends"');
    },
  );
});

describe('manual tour dates', () => {
  it('renders only upcoming shows with ticket and sold-out states', () => {
    const html = renderTour({
      mode: 'manual',
      shows: [
        show('past', '2026-10-01', { ticketUrl: 'https://tickets.example/past' }),
        show('sold-out', '2026-12-01', { soldOut: true }),
        show('tickets', '2026-11-20', {
          ticketUrl: 'https://tickets.example/tickets',
          support: 'Support Act',
        }),
      ],
    });

    expect(html).toContain('Venue tickets');
    expect(html).not.toContain('Venue past');
    expect(html).toContain('href="https://tickets.example/tickets"');
    expect(html).toContain('Sold out');
    expect(html).not.toContain('href="https://tickets.example/past"');
    expect(html).toContain('With Support Act');
    expect(html).toContain('application/ld+json');
    expect(html).not.toContain('Load Bandsintown content');
  });

  it('prefers published shows over Bandsintown in auto mode', () => {
    const html = renderTour({
      mode: 'auto',
      shows: [show('future', '2027-01-15')],
    });
    expect(html).toContain('Venue future');
    expect(html).not.toContain('Load Bandsintown content');
  });

  it('falls back to the consent-gated Bandsintown widget without upcoming shows', () => {
    const html = renderTour({
      mode: 'auto',
      shows: [show('past', '2026-10-01')],
    });
    expect(html).toContain('Load Bandsintown content');
    expect(html).not.toContain('Venue past');
  });

  it('shows custom labels, an empty state and the archive link', () => {
    const html = renderTour({
      mode: 'manual',
      shows: [show('past', '2026-10-01')],
      heading: 'Live',
      noShowsText: 'Nothing booked yet.',
      archiveHref: '/tour',
    });
    expect(html).toContain('Live');
    expect(html).toContain('Nothing booked yet.');
    expect(html).toContain('href="/tour"');
    expect(html).toContain('All tour dates');
  });

  it('uses custom ticket labels and hides unsafe ticket URLs', () => {
    const html = renderTour({
      mode: 'manual',
      shows: [
        show('safe', '2026-12-01', { ticketUrl: 'https://tickets.example/safe' }),
        show('unsafe', '2026-12-02', { ticketUrl: 'javascript:alert(1)' }),
      ],
      ticketLabel: 'Get tickets',
      soldOutLabel: 'Ausverkauft',
    });
    expect(html).toContain('Get tickets');
    expect(html).not.toContain('javascript:alert(1)');
    expect(html).not.toContain('Ausverkauft');
  });
});
