import { getSiteSettings, getPressKit, getReleases, getMembers } from '@/lib/sanity';
import type { SanityImageSource } from '@/lib/sanity-image';
import Hero from '@/components/Hero';
import MediaSection from '@/components/MediaSection';
import TourDates from '@/components/TourDates';
import BioSection from '@/components/BioSection';
import GallerySection from '@/components/GallerySection';
import ReleasesSection from '@/components/ReleasesSection';
import MembersSection from '@/components/MembersSection';
import ContactSection from '@/components/ContactSection';
import { defaultContactEmail, siteUrl } from '@/lib/site';
import { toHttpsUrl } from '@/lib/embeds';

export default async function HomePage() {
  const settings = await getSiteSettings();
  const [pressKit, releases, members] = await Promise.all([getPressKit(), getReleases(), getMembers()]);

  const bandName = settings?.bandName ?? 'End Of All Known';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: bandName,
    url: siteUrl,
    genre: 'Metalcore',
    sameAs: (settings?.socialLinks ?? []).map((link) => toHttpsUrl(link.url)).filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Hero
        bandName={bandName}
        logo={settings?.logo}
        background={settings?.heroBackground}
        backgroundAlt={settings?.heroBackgroundAlt}
        eyebrow={settings?.heroEyebrow}
        tagline={settings?.heroTagline}
        merchUrl={toHttpsUrl(settings?.merchUrl)}
      />

      <MediaSection
        latestYoutubeUrl={settings?.latestYoutubeUrl ?? ''}
        featuredSpotifyUrl={settings?.featuredSpotifyUrl ?? ''}
        streamingLinks={settings?.streamingLinks}
      />

      <ReleasesSection releases={releases} />

      <TourDates artistName={settings?.bandsintownArtistName ?? bandName} />

      <BioSection
        biography={pressKit?.biography}
        pressRelease={pressKit?.pressRelease ?? undefined}
        pressKitPdfUrl={pressKit?.pressKitPdf?.asset?.url}
      />

      <MembersSection members={members} />

      <GallerySection
        gallery={
          (pressKit?.gallery ?? [])
            .filter((item) => (item.image as { asset?: unknown } | null | undefined)?.asset)
            .map((item) => ({
            ...item,
            image: item.image as SanityImageSource,
          }))
        }
      />

      <ContactSection
        contactEmail={settings?.contactEmail ?? defaultContactEmail}
      />
    </>
  );
}
