import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSiteSettings: vi.fn(),
  getNavigationContent: vi.fn(),
  hasInstagramConfiguration: vi.fn(),
}));
vi.mock('@/lib/sanity', () => mocks);
vi.mock('@/lib/instagram', () => ({ hasInstagramConfiguration: mocks.hasInstagramConfiguration }));
vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'font-inter' }),
  Oswald: () => ({ variable: 'font-oswald' }),
}));
vi.mock('@/lib/sanity-image', () => ({ hasImage: () => false, getImageUrl: vi.fn() }));
vi.mock('@/components/Navbar', () => ({
  default: ({ links }: { links: { href: string; label: string }[] }) =>
    createElement('nav', {}, links.map((link) => createElement('a', { key: link.href, href: link.href }, link.label))),
}));
vi.mock('@/components/Footer', () => ({ default: () => null }));
import RootLayout from './layout';

it('builds navigation without loading full content lists or the Instagram feed', async () => {
  mocks.getSiteSettings.mockResolvedValue(null);
  mocks.getNavigationContent.mockResolvedValue({ hasReleases: true, hasMembers: false });
  mocks.hasInstagramConfiguration.mockReturnValue(true);
  const children: ReactNode = createElement('p', {}, 'Page content');
  const html = renderToStaticMarkup(await RootLayout({ children }));
  expect(mocks.getNavigationContent).toHaveBeenCalledOnce();
  expect(html).toContain('/#releases');
  expect(html).toContain('/#instagram');
  expect(html).not.toContain('/#band');
  expect(html).toContain('Page content');
});
