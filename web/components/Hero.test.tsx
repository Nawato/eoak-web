import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/sanity-image', () => ({
  getLogo: () => null,
  hasImage: (image: unknown) => !!image,
  getImageUrl: () => 'https://cdn.sanity.io/images/example/production/photo.jpg',
  getObjectPosition: () => '50% 50%',
}));

import Hero from './Hero';

describe('hero photo overlay', () => {
  it.each([
    [undefined, '0.55'],
    [null, '0.55'],
    [0, '0'],
    [85, '0.85'],
    [100, '0.85'],
    [-10, '0'],
    [NaN, '0.55'],
  ])('renders safe opacity for CMS value %s', (overlayOpacity, expected) => {
    const html = renderToStaticMarkup(createElement(Hero, {
      bandName: 'End Of All Known',
      background: { asset: {} },
      overlayOpacity,
    }));
    expect(html).toContain(`style="opacity:${expected}"`);
    expect(html).not.toContain('via-zinc-950');
  });

  it('keeps the dark fallback without a background photo', () => {
    const html = renderToStaticMarkup(createElement(Hero, {
      bandName: 'End Of All Known',
      overlayOpacity: 0,
    }));
    expect(html).toContain('style="opacity:1"');
  });

  it('links the primary CTA to the latest release with a section fallback', () => {
    const latest = renderToStaticMarkup(createElement(Hero, {
      bandName: 'End Of All Known',
      latestReleaseHref: '/releases/new-album',
    }));
    expect(latest).toContain('href="/releases/new-album"');
    expect(latest).toContain('Latest Release');

    const fallback = renderToStaticMarkup(createElement(Hero, { bandName: 'End Of All Known' }));
    expect(fallback).toContain('href="#releases"');
  });

  it('hides the tour CTA when the section is disabled', () => {
    const html = renderToStaticMarkup(createElement(Hero, {
      bandName: 'End Of All Known',
      showTourCta: false,
    }));
    expect(html).not.toContain('href="#shows"');
  });
});
