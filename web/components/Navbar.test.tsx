import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const { getLogo } = vi.hoisted(() => ({ getLogo: vi.fn() }));
vi.mock('@/lib/sanity-image', () => ({ getLogo }));

import Navbar from './Navbar';

describe('header logo', () => {
  it('renders the supplied compact logo', () => {
    const logo = { asset: { _ref: 'header-logo' } };
    getLogo.mockReturnValue({ url: 'https://cdn.sanity.io/header.png', width: 400, height: 100 });
    const html = renderToStaticMarkup(createElement(Navbar, {
      bandName: 'End Of All Known', logo, links: [],
    }));
    expect(getLogo).toHaveBeenLastCalledWith(logo, 400);
    expect(html).toContain('src="https://cdn.sanity.io/header.png"');
    expect(html).toContain('alt="End Of All Known"');
  });

  it('shows the band name when no header logo is configured', () => {
    getLogo.mockReturnValue(null);
    const html = renderToStaticMarkup(createElement(Navbar, {
      bandName: 'End Of All Known', links: [],
    }));
    expect(html).toContain('End Of All Known');
    expect(html).not.toContain('<img');
  });
});
