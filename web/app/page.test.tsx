import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSiteSettings: vi.fn(),
  getPressKit: vi.fn(),
  getReleases: vi.fn(),
  getMembers: vi.fn(),
  getShows: vi.fn(),
}));

vi.mock('@/lib/sanity', () => mocks);
vi.mock('@/lib/instagram', () => ({
  hasInstagramConfiguration: () => false,
  getInstagramFeed: vi.fn(),
}));
vi.mock('@/lib/sanity-image', () => ({
  hasImage: () => false,
  getImageUrl: vi.fn(),
  getLogo: () => null,
  getObjectPosition: vi.fn(),
}));

import { generateMetadata } from './page';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSiteSettings.mockResolvedValue(null);
});

describe('homepage metadata', () => {
  it('uses the CMS band name and hero eyebrow in the title', async () => {
    mocks.getSiteSettings.mockResolvedValue({
      bandName: 'Test Band',
      heroEyebrow: 'Dark Metalcore',
      heroTagline: 'Heavy riffs from the void.',
    });

    const metadata = await generateMetadata();

    expect(metadata.title).toEqual({ absolute: 'Test Band — Dark Metalcore' });
    expect(metadata.description).toBe('Heavy riffs from the void.');
    expect(metadata.alternates).toEqual({ canonical: '/' });
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({ locale: 'en_US', siteName: 'Test Band', type: 'website' }),
    );
  });

  it('falls back to the default genre and site description', async () => {
    const metadata = await generateMetadata();

    expect(metadata.title).toEqual({ absolute: 'End Of All Known — Independent Metalcore' });
    expect(metadata.description).toContain('Official website of End Of All Known');
  });
});
