import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Footer from './Footer';
import type { PhotoCredit } from '@/sanity/types';

function renderCredits(photoCredits?: PhotoCredit[] | null, creditsHeading?: string) {
  return renderToStaticMarkup(createElement(Footer, {
    bandName: 'End Of All Known',
    photoCredits,
    creditsHeading,
  }));
}

describe('photographer credits', () => {
  it.each([undefined, null, []])('hides the section without credits: %j', (credits) => {
    const html = renderCredits(credits);
    expect(html).not.toContain('photo-credits-heading');
    expect(html).toContain('End Of All Known');
    expect(html).toContain('href="/impressum"');
    expect(html).toContain('href="/datenschutz"');
  });

  it('renders the editable heading, names, descriptions and ordering', () => {
    const html = renderCredits([
      { _key: 'live', name: 'Live Photographer', description: 'Live photos, Berlin 2026', url: 'https://example.com/photos' },
      { _key: 'portraits', name: 'Portrait Photographer', description: 'Band portraits' },
    ], 'Photography & Credits');
    expect(html).toContain('Photography &amp; Credits');
    expect(html).toContain('Live photos, Berlin 2026');
    expect(html).toContain('Band portraits');
    expect(html.indexOf('Live Photographer')).toBeLessThan(html.indexOf('Portrait Photographer'));
    expect(html).toContain('href="https://example.com/photos"');
    expect(html).toContain('target="_blank" rel="noopener noreferrer"');
    expect(html).toContain('<span class="text-foreground">Portrait Photographer</span>');
  });

  it('keeps credits as plain text when their links are unsafe', () => {
    const html = renderCredits([{ _key: 'one', name: '<Photographer>', url: 'javascript:alert(1)' }]);
    expect(html).toContain('Photo Credits');
    expect(html).toContain('&lt;Photographer&gt;');
    expect(html).not.toContain('javascript:');
  });

  it('does not render a section for blank names', () => {
    expect(renderCredits([{ _key: 'blank', name: '  ' }])).not.toContain('photo-credits-heading');
  });
});
