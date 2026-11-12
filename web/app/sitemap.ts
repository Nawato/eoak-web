import type { MetadataRoute } from 'next';
import { getNavigationContent, getReleaseSlugs, getSiteSettings } from '@/lib/sanity';
import { getImageUrl, hasImage } from '@/lib/sanity-image';
import { resolveFeatures } from '@/lib/features';
import { siteUrl } from '@/lib/site';

function lastModified(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [releases, navigation, settings] = await Promise.all([
    getReleaseSlugs(),
    getNavigationContent(),
    getSiteSettings(),
  ]);
  const features = resolveFeatures(settings?.features);
  const releasePaths = releases.flatMap((release) => {
    if (!release.slug) return [];
    const image = hasImage(release.cover) ? getImageUrl(release.cover, 1200, 630) : undefined;
    return [{
      url: `${siteUrl}/releases/${encodeURIComponent(release.slug)}`,
      lastModified: lastModified(release._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      images: image ? [image] : undefined,
    }];
  });
  const latestReleaseUpdate = releases
    .map((release) => lastModified(release._updatedAt))
    .filter((date): date is Date => date instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: latestReleaseUpdate,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  if (features.releasesArchive && releases.length > 0) {
    entries.push({
      url: `${siteUrl}/releases`,
      lastModified: latestReleaseUpdate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }
  if (features.tourArchive && navigation.hasShows) {
    entries.push({
      url: `${siteUrl}/tour`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }
  if (
    features.galleryPage &&
    ((features.photoGallery && navigation.hasPhotos) || (features.videoGallery && navigation.hasVideos))
  ) {
    entries.push({
      url: `${siteUrl}/gallery`,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  entries.push(
    {
      url: `${siteUrl}/impressum`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/datenschutz`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...releasePaths,
  );

  return entries;
}
