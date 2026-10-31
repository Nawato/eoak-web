import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getRelease: vi.fn(),
  getSiteSettings: vi.fn(),
  connection: vi.fn(),
}));
vi.mock('@/lib/sanity', () => mocks);
vi.mock('next/server', () => ({ connection: mocks.connection }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND'); } }));
vi.mock('@/lib/sanity-image', () => ({ hasImage: () => false, getImageUrl: vi.fn() }));
import ReleasePage, { generateMetadata } from './page';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getRelease.mockResolvedValue({
    _id: 'older-release', title: 'Older Release', slug: 'older-release', releaseDate: '2020-01-01',
    links: [{ _key: 'spotify', label: 'Spotify', url: 'https://music.example/track' }],
  });
  mocks.getSiteSettings.mockResolvedValue(null);
});

it('fetches a release directly by slug, without depending on the 50-item list', async () => {
  const html = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ slug: 'older-release' }) }));
  expect(mocks.getRelease).toHaveBeenCalledWith('older-release');
  expect(mocks.connection).toHaveBeenCalled();
  expect(html).toContain('/go/older-release/spotify');
  expect(html).toContain('Older Release');
  expect(html).not.toContain('Coming soon');
});

it('uses the direct release query for metadata', async () => {
  const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'older-release' }) });
  expect(metadata.alternates).toEqual({ canonical: '/releases/older-release' });
});

it('returns not-found for an absent release', async () => {
  mocks.getRelease.mockResolvedValue(null);
  await expect(ReleasePage({ params: Promise.resolve({ slug: 'missing' }) })).rejects.toThrow('NOT_FOUND');
});
