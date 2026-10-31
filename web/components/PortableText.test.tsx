import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PortableText from './PortableText';
import type { PortableTextValue } from '@/sanity/types';

function renderLink(href: string) {
  const value: PortableTextValue = [{
    _type: 'block',
    _key: 'paragraph',
    style: 'normal',
    children: [{ _type: 'span', _key: 'text', text: 'Read more', marks: ['link'] }],
    markDefs: [{ _type: 'link', _key: 'link', href }],
  }];
  return renderToStaticMarkup(createElement(PortableText, { value }));
}

describe('Portable Text', () => {
  it('renders paragraphs without a type escape', () => {
    expect(renderLink('/releases/example')).toContain('Read more');
  });

  it.each(['javascript:alert(1)', 'data:text/html,test', ''])('does not render unsafe links: %s', (href) => {
    const html = renderLink(href);
    expect(html).toContain('Read more');
    expect(html).not.toContain('<a');
  });

  it.each(['https://example.com', '//example.com/path', '/\\example.com'])(
    'protects external links including protocol-relative URLs: %s',
    (href) => {
      const html = renderLink(href);
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    },
  );

  it('keeps internal links in the current tab', () => {
    const html = renderLink('/#bio');
    expect(html).toContain('href="/#bio"');
    expect(html).not.toContain('target=');
  });
});
