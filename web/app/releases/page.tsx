import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getArchiveReleases, getSiteSettings } from '@/lib/sanity';
import { resolveFeatures } from '@/lib/features';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { siteName } from '@/lib/site';
import BackgroundSurface from '@/components/BackgroundSurface';
import JsonLd from '@/components/JsonLd';
import ReleasesSection from '@/components/ReleasesSection';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  if (!resolveFeatures(settings?.features).releasesArchive) return {};

  const bandName = settings?.bandName ?? siteName;
  const description = `Complete discography of ${bandName} — albums, EPs and singles with artwork, tracklists, release dates and streaming links.`;
  return {
    title: 'Releases',
    description,
    alternates: { canonical: '/releases' },
    openGraph: {
      title: `Releases | ${bandName}`,
      description,
      url: '/releases',
      siteName: bandName,
      locale: 'en_US',
    },
    twitter: {
      title: `Releases | ${bandName}`,
      description,
    },
  };
}

export default async function ReleasesArchivePage() {
  await connection();
  const [releases, settings] = await Promise.all([getArchiveReleases(), getSiteSettings()]);
  const features = resolveFeatures(settings?.features);
  if (!features.releasesArchive) notFound();

  return (
    <BackgroundSurface background={settings?.pageBackgrounds?.releases}>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Releases', path: '/releases' },
        ])}
      />
      {releases.length > 0 ? (
        <ReleasesSection releases={releases} headingLevel={1} />
      ) : (
        <section className="mx-auto max-w-3xl px-4 py-32 text-center md:px-8">
          <h1 className="mb-6 font-display text-4xl font-bold uppercase text-white">Releases</h1>
          <p className="text-muted">No releases have been published yet.</p>
        </section>
      )}
    </BackgroundSurface>
  );
}
