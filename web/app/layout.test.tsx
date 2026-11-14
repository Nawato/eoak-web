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
import RootLayout, { generateMetadata, viewport } from './layout';

it('publishes crawl, social and theme defaults', async () => {
  mocks.getSiteSettings.mockResolvedValue(null);

  const metadata = await generateMetadata();

  expect(metadata.metadataBase?.toString()).toBe('http://localhost:3000/');
  expect(metadata.title).toEqual({ default: 'End Of All Known', template: '%s | End Of All Known' });
  expect(metadata.robots).toEqual(
    expect.objectContaining({
      index: true,
      follow: true,
      googleBot: expect.objectContaining({ 'max-image-preview': 'large' }),
    }),
  );
  expect(metadata.openGraph).toEqual(
    expect.objectContaining({ locale: 'en_US', siteName: 'End Of All Known' }),
  );
  expect(metadata.twitter).toEqual(expect.objectContaining({ card: 'summary_large_image' }));
  expect(viewport).toEqual(expect.objectContaining({ themeColor: '#09090b', colorScheme: 'dark' }));
});

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
