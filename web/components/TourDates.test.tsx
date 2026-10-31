import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TourDates from './TourDates';

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
