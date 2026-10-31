import type { MetadataRoute } from 'next';
import { getReleases } from '@/lib/sanity';
import { siteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const releases = await getReleases();
  const releasePaths = releases.flatMap((release) => (release.slug ? [`/releases/${encodeURIComponent(release.slug)}`] : []));
  return ['', '/impressum', '/datenschutz', ...releasePaths].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'yearly',
    priority: path === '' ? 1 : 0.3,
  }));
}
