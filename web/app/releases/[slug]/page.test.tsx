import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getRelease: vi.fn(),
  getSiteSettings: vi.fn(),
  connection: vi.fn(),
  hasImage: vi.fn(() => false),
  getImageUrl: vi.fn(),
}));
vi.mock('@/lib/sanity', () => mocks);
vi.mock('next/server', () => ({ connection: mocks.connection }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND'); } }));
vi.mock('@/lib/sanity-image', () => ({ hasImage: mocks.hasImage, getImageUrl: mocks.getImageUrl }));
import ReleasePage, { generateMetadata } from './page';

const campaignRelease = {
  _id: 'campaign-release',
  title: 'Campaign Release',
  slug: 'campaign-release',
  releaseDate: '2099-06-01',
  releaseType: 'Album',
  teaser: 'The next chapter.',
  cover: { asset: { _ref: 'image-cover' } },
  links: [{ _key: 'spotify', label: 'Spotify', url: 'https://music.example/track' }],
  preSaveUrl: 'https://music.example/pre-save',
  preOrderUrl: 'https://shop.example/pre-order',
  tracklist: [{ _key: 'track-1', title: 'First Track', duration: '3:45', lyrics: 'First line' }],
  credits: { producer: 'Producer Name', mixing: 'Mixer Name' },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.hasImage.mockReturnValue(false);
  mocks.getImageUrl.mockReset();
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

describe('release campaign features', () => {
  it('renders pre-save, countdown, tracklist, credits and sharing for an upcoming release', async () => {
    mocks.getRelease.mockResolvedValue(campaignRelease);
    mocks.getSiteSettings.mockResolvedValue({ bandName: 'End Of All Known' });

    const html = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ slug: 'campaign-release' }) }));

    expect(html).toContain('Coming soon');
    expect(html).toContain('href="https://music.example/pre-save"');
    expect(html).toContain('href="https://shop.example/pre-order"');
    expect(html).toContain('Release countdown');
    expect(html).toContain('Tracklist');
    expect(html).toContain('First Track');
    expect(html).toContain('First line');
    expect(html).toContain('Credits');
    expect(html).toContain('Producer Name');
    expect(html).toContain('Share this release');
    expect(html).toContain('"@type":"MusicAlbum"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('href="/releases"');
  });

  it('respects the global kill switches even when a release enables a feature', async () => {
    mocks.getRelease.mockResolvedValue({
      ...campaignRelease,
      countdownEnabled: true,
      tracklistEnabled: true,
      creditsEnabled: true,
      shareEnabled: true,
    });
    mocks.getSiteSettings.mockResolvedValue({
      features: {
        releaseCountdown: false,
        releaseTracklist: false,
        releaseCredits: false,
        releaseShare: false,
        releasesArchive: false,
      },
    });

    const html = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ slug: 'campaign-release' }) }));

    expect(html).not.toContain('Release countdown');
    expect(html).not.toContain('Tracklist');
    expect(html).not.toContain('Credits');
    expect(html).not.toContain('Share this release');
    expect(html).toContain('href="/#releases"');
  });

  it('lets a release switch enabled campaign features off', async () => {
    mocks.getRelease.mockResolvedValue({
      ...campaignRelease,
      countdownEnabled: false,
      tracklistEnabled: false,
      creditsEnabled: false,
      shareEnabled: false,
    });
    mocks.getSiteSettings.mockResolvedValue({ features: {} });

    const html = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ slug: 'campaign-release' }) }));

    expect(html).not.toContain('Release countdown');
    expect(html).not.toContain('Tracklist');
    expect(html).not.toContain('Credits');
    expect(html).not.toContain('Share this release');
    // Pre-save is campaign metadata, not a toggleable campaign feature.
    expect(html).toContain('href="https://music.example/pre-save"');
  });

  it('hides pre-save links and shows Out now after release day', async () => {
    mocks.getRelease.mockResolvedValue({ ...campaignRelease, releaseDate: '2020-06-01' });

    const html = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ slug: 'campaign-release' }) }));

    expect(html).toContain('Out now');
    expect(html).not.toContain('Coming soon');
    expect(html).not.toContain('Pre-save');
    expect(html).not.toContain('Pre-order');
    expect(html).not.toContain('Release countdown');
  });

  it('ignores unsafe campaign links', async () => {
    mocks.getRelease.mockResolvedValue({
      ...campaignRelease,
      preSaveUrl: 'javascript:alert(1)',
      preOrderUrl: 'http://shop.example/pre-order',
      links: [{ _key: 'unsafe', label: 'Unsafe', url: 'javascript:alert(1)' }],
    });

    const html = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ slug: 'campaign-release' }) }));

    expect(html).not.toContain('javascript:alert(1)');
    expect(html).not.toContain('http://shop.example/pre-order');
    expect(html).not.toContain('Unsafe');
  });
});

describe('release metadata', () => {
  it('uses the teaser, release details and generated cover images', async () => {
    mocks.hasImage.mockReturnValue(true);
    mocks.getImageUrl.mockReturnValue('https://cdn.sanity.io/cover.jpg');
    mocks.getRelease.mockResolvedValue(campaignRelease);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'campaign-release' }) });

    expect(mocks.getImageUrl).toHaveBeenCalledWith(campaignRelease.cover, 1200, 630);
    expect(metadata.title).toBe('Campaign Release');
    expect(metadata.description).toBe('The next chapter.');
    expect(metadata.openGraph).toEqual(expect.objectContaining({
      type: 'music.album',
      releaseDate: '2099-06-01',
      images: [expect.objectContaining({ url: 'https://cdn.sanity.io/cover.jpg', width: 1200, height: 630 })],
    }));
    expect(metadata.twitter).toEqual(expect.objectContaining({
      card: 'summary_large_image',
      images: ['https://cdn.sanity.io/cover.jpg'],
    }));
  });

  it('falls back to a generated description and no images without a cover', async () => {
    mocks.getRelease.mockResolvedValue({ ...campaignRelease, teaser: '' });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'campaign-release' }) });

    expect(metadata.description).toBe('Campaign Release by End Of All Known.');
    expect(metadata.openGraph).toEqual(expect.objectContaining({ images: undefined }));
    expect(metadata.twitter).toEqual(expect.objectContaining({ images: undefined }));
  });
});
