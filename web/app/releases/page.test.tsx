import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getArchiveReleases: vi.fn(),
  getSiteSettings: vi.fn(),
  connection: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));

vi.mock('@/lib/sanity', () => mocks);
vi.mock('next/server', () => ({ connection: mocks.connection }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('@/lib/sanity-image', () => ({ hasImage: () => false, getImageUrl: vi.fn() }));

import ReleasesArchivePage from './page';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getArchiveReleases.mockResolvedValue([]);
  mocks.getSiteSettings.mockResolvedValue(null);
});

it('returns not-found when the release archive is disabled', async () => {
  mocks.getSiteSettings.mockResolvedValue({ features: { releasesArchive: false } });
  await expect(ReleasesArchivePage()).rejects.toThrow('NOT_FOUND');
  expect(mocks.notFound).toHaveBeenCalled();
});

it('renders every release returned by the archive query', async () => {
  mocks.getArchiveReleases.mockResolvedValue([
    { _id: 'one', title: 'First Release', slug: 'first-release', releaseDate: '2026-01-01' },
    { _id: 'two', title: 'Second Release', slug: 'second-release', releaseDate: '2026-02-01' },
  ]);

  const html = renderToStaticMarkup(await ReleasesArchivePage());

  expect(html).toContain('First Release');
  expect(html).toContain('Second Release');
  expect(html).toContain('href="/releases/first-release"');
  expect(html).not.toContain('No releases have been published yet.');
});

it('renders an empty state when no releases are published', async () => {
  const html = renderToStaticMarkup(await ReleasesArchivePage());

  expect(html).toContain('Releases');
  expect(html).toContain('No releases have been published yet.');
});
