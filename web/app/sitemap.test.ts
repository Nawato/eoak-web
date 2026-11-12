import { expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getReleaseSlugs: vi.fn(),
  getNavigationContent: vi.fn(),
  getSiteSettings: vi.fn(),
}));
vi.mock('@/lib/sanity', () => mocks);
vi.mock('@/lib/sanity-image', () => ({ hasImage: () => false, getImageUrl: vi.fn() }));
import sitemap from './sitemap';

it('includes release URLs beyond the homepage list limit', async () => {
  mocks.getReleaseSlugs.mockResolvedValue(Array.from({ length: 60 }, (_, index) => ({ slug: `release-${index}` })));
  mocks.getNavigationContent.mockResolvedValue({
    hasReleases: true,
    hasMembers: false,
    hasShows: false,
    hasPhotos: false,
    hasVideos: false,
  });
  mocks.getSiteSettings.mockResolvedValue(null);
  const entries = await sitemap();
  expect(entries).toHaveLength(64);
  expect(entries[63].url).toContain('/releases/release-59');
  expect(entries.some((entry) => entry.url.endsWith('/releases'))).toBe(true);
});

it('adds enabled tour and gallery pages only when they have content', async () => {
  mocks.getReleaseSlugs.mockResolvedValue([]);
  mocks.getNavigationContent.mockResolvedValue({
    hasReleases: false,
    hasMembers: false,
    hasShows: true,
    hasPhotos: true,
    hasVideos: false,
  });
  mocks.getSiteSettings.mockResolvedValue({
    features: { tourArchive: true, galleryPage: true, photoGallery: true, videoGallery: false },
  });
  const entries = await sitemap();
  expect(entries.some((entry) => entry.url.endsWith('/tour'))).toBe(true);
  expect(entries.some((entry) => entry.url.endsWith('/gallery'))).toBe(true);
  expect(entries.some((entry) => entry.url.endsWith('/releases'))).toBe(false);
});

it('respects disabled gallery and tour features', async () => {
  mocks.getReleaseSlugs.mockResolvedValue([]);
  mocks.getNavigationContent.mockResolvedValue({
    hasReleases: false,
    hasMembers: false,
    hasShows: true,
    hasPhotos: true,
    hasVideos: true,
  });
  mocks.getSiteSettings.mockResolvedValue({
    features: { tourArchive: false, galleryPage: false },
  });
  const entries = await sitemap();
  expect(entries.some((entry) => entry.url.endsWith('/tour'))).toBe(false);
  expect(entries.some((entry) => entry.url.endsWith('/gallery'))).toBe(false);
});
