import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getPhotos, getSiteSettings, getVideos } from '@/lib/sanity';
import { resolveFeatures } from '@/lib/features';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { siteName } from '@/lib/site';
import BackgroundSurface from '@/components/BackgroundSurface';
import JsonLd from '@/components/JsonLd';
import { PhotoGrid, VideoGrid } from '@/components/GallerySections';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  if (!resolveFeatures(settings?.features).galleryPage) return {};

  const bandName = settings?.bandName ?? siteName;
  const description = `Photo gallery and official videos from ${bandName}: live shots, promo photos and music videos.`;
  return {
    title: 'Gallery',
    description,
    alternates: { canonical: '/gallery' },
    openGraph: {
      title: `Gallery | ${bandName}`,
      description,
      url: '/gallery',
      siteName: bandName,
      locale: 'en_US',
    },
    twitter: {
      title: `Gallery | ${bandName}`,
      description,
    },
  };
}

export default async function GalleryPage() {
  await connection();
  const [settings, photos, videos] = await Promise.all([getSiteSettings(), getPhotos(), getVideos()]);
  const features = resolveFeatures(settings?.features);
  if (!features.galleryPage) notFound();

  const visiblePhotos = features.photoGallery ? photos : [];
  const visibleVideos = features.videoGallery ? videos : [];
  const hasContent = visiblePhotos.length > 0 || visibleVideos.length > 0;

  return (
    <BackgroundSurface>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Gallery', path: '/gallery' },
        ])}
      />
      <section className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <h1 className="mb-4 text-center font-display text-4xl font-bold uppercase text-white md:text-5xl">Gallery</h1>
        <p className="mb-12 text-center text-zinc-400">Photos and videos from the band.</p>

        {!hasContent ? (
          <p role="status" className="text-center text-muted">No photos or videos have been published yet.</p>
        ) : (
          <>
            {visiblePhotos.length > 0 && <PhotoGrid photos={visiblePhotos} />}
            {visibleVideos.length > 0 && <VideoGrid videos={visibleVideos} />}
          </>
        )}
      </section>
    </BackgroundSurface>
  );
}
