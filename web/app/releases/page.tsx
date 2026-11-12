import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getArchiveReleases, getSiteSettings } from '@/lib/sanity';
import { resolveFeatures } from '@/lib/features';
import BackgroundSurface from '@/components/BackgroundSurface';
import ReleasesSection from '@/components/ReleasesSection';

export const metadata: Metadata = {
  title: 'Releases',
  description: 'Complete discography: albums, EPs and singles.',
  alternates: { canonical: '/releases' },
  openGraph: {
    title: 'Releases',
    description: 'Complete discography: albums, EPs and singles.',
    url: '/releases',
  },
};

export default async function ReleasesArchivePage() {
  await connection();
  const [releases, settings] = await Promise.all([getArchiveReleases(), getSiteSettings()]);
  const features = resolveFeatures(settings?.features);
  if (!features.releasesArchive) notFound();

  return (
    <BackgroundSurface background={settings?.pageBackgrounds?.releases}>
      {releases.length > 0 ? (
        <ReleasesSection releases={releases} />
      ) : (
        <section className="mx-auto max-w-3xl px-4 py-32 text-center md:px-8">
          <h1 className="mb-6 font-display text-4xl font-bold uppercase text-white">Releases</h1>
          <p className="text-muted">No releases have been published yet.</p>
        </section>
      )}
    </BackgroundSurface>
  );
}
