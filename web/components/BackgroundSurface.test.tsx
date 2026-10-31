import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/sanity-image', () => ({
  hasImage: (image: unknown) => !!image,
  getImageUrl: () => 'https://cdn.sanity.io/images/example/production/photo.jpg',
  getObjectPosition: () => '25% 60%',
}));

import BackgroundSurface from './BackgroundSurface';

describe('page and section backgrounds', () => {
  const content = createElement('section', { id: 'music' }, 'Music content');

  it('preserves the original markup when no image is configured', () => {
    expect(renderToStaticMarkup(createElement(BackgroundSurface, {}, content))).toBe(
      '<section id="music">Music content</section>',
    );
  });

  it('renders the chosen background behind readable content without trapping the lightbox', () => {
    const html = renderToStaticMarkup(
      createElement(
        BackgroundSurface,
        {
          background: { image: {}, alt: 'Live on stage', overlayOpacity: 70 },
        },
        content,
      ),
    );
    expect(html).toContain('alt="Live on stage"');
    expect(html).toContain('object-position:25% 60%');
    expect(html).toContain('style="opacity:0.7"');
    expect(html).toContain('Music content');
    expect(html).toContain('[&amp;&gt;section]:bg-transparent');
    expect(html).not.toContain('isolate');
    expect(html).not.toContain('overflow-hidden');
    expect(html).toContain('loading="lazy"');
  });

  it.each([
    [undefined, '0.65'],
    [null, '0.65'],
    [NaN, '0.65'],
    [0, '0'],
    [-10, '0'],
    [85, '0.85'],
    [100, '0.85'],
  ])('uses a bounded darkening value for %s', (overlayOpacity, expected) => {
    const html = renderToStaticMarkup(
      createElement(
        BackgroundSurface,
        {
          background: { image: {}, overlayOpacity },
        },
        content,
      ),
    );
    expect(html).toContain(`style="opacity:${expected}"`);
    expect(html).toContain('alt=""');
  });
});
