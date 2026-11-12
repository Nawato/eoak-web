import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPhotos: vi.fn(),
  getVideos: vi.fn(),
  getSiteSettings: vi.fn(),
  connection: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));

vi.mock('@/lib/sanity', () => mocks);
vi.mock('next/server', () => ({ connection: mocks.connection }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('@/lib/sanity-image', () => ({
  hasImage: () => false,
  getImageUrl: vi.fn(),
  getObjectPosition: vi.fn(),
}));

import GalleryPage from './page';

const photo = {
  _id: 'photo-1',
  image: null,
  alt: 'Band on stage',
  caption: 'A photo caption',
};
const video = {
  _id: 'video-1',
  title: 'A video title',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getPhotos.mockResolvedValue([photo]);
  mocks.getVideos.mockResolvedValue([video]);
  mocks.getSiteSettings.mockResolvedValue(null);
});

it('returns not-found when the gallery page is disabled', async () => {
  mocks.getSiteSettings.mockResolvedValue({ features: { galleryPage: false } });
  await expect(GalleryPage()).rejects.toThrow('NOT_FOUND');
  expect(mocks.notFound).toHaveBeenCalled();
});

it('renders both galleries by default', async () => {
  const html = renderToStaticMarkup(await GalleryPage());

  expect(html).toContain('A photo caption');
  expect(html).toContain('A video title');
  expect(html).toContain('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

it('toggles photo and video galleries independently', async () => {
  mocks.getSiteSettings.mockResolvedValue({ features: { photoGallery: false, videoGallery: true } });
  const videosOnly = renderToStaticMarkup(await GalleryPage());
  expect(videosOnly).not.toContain('A photo caption');
  expect(videosOnly).toContain('A video title');

  mocks.getSiteSettings.mockResolvedValue({ features: { photoGallery: true, videoGallery: false } });
  const photosOnly = renderToStaticMarkup(await GalleryPage());
  expect(photosOnly).toContain('A photo caption');
  expect(photosOnly).not.toContain('A video title');
});

it('shows an empty state when both gallery types are disabled', async () => {
  mocks.getSiteSettings.mockResolvedValue({ features: { photoGallery: false, videoGallery: false } });
  const html = renderToStaticMarkup(await GalleryPage());

  expect(html).toContain('No photos or videos have been published yet.');
  expect(html).not.toContain('A photo caption');
  expect(html).not.toContain('A video title');
});
