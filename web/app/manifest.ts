import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/sanity';
import { siteDescription, siteName } from '@/lib/site';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  const bandName = settings?.bandName ?? siteName;

  return {
    name: bandName,
    short_name: bandName,
    description: siteDescription,
    start_url: '/',
    display: 'browser',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
