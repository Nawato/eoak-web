import { getSiteSettings, getPressKit, getReleases, getMembers } from '@/lib/sanity';
import Hero from '@/components/Hero';
import BackgroundSurface from '@/components/BackgroundSurface';
import MediaSection from '@/components/MediaSection';
import TourDates from '@/components/TourDates';
import BioSection from '@/components/BioSection';
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
        overlayOpacity={settings?.heroOverlayOpacity}
        eyebrow={settings?.heroEyebrow}
        tagline={settings?.heroTagline}
        merchUrl={toHttpsUrl(settings?.merchUrl)}
      />

      <BackgroundSurface background={settings?.pageBackgrounds?.music}>
        <MediaSection
          latestYoutubeUrl={settings?.latestYoutubeUrl ?? ''}
          featuredSpotifyUrl={settings?.featuredSpotifyUrl ?? ''}
          streamingLinks={settings?.streamingLinks}
        />
      </BackgroundSurface>

      {releases.length > 0 && (
        <BackgroundSurface background={settings?.pageBackgrounds?.releases}>
          <ReleasesSection releases={releases} />
        </BackgroundSurface>
      )}

      <BackgroundSurface background={settings?.pageBackgrounds?.shows}>
        <TourDates artistName={settings?.bandsintownArtistName ?? bandName} />
      </BackgroundSurface>

      <BackgroundSurface background={settings?.pageBackgrounds?.bio}>
        <BioSection
          biography={pressKit?.biography}
          pressRelease={pressKit?.pressRelease ?? undefined}
          pressKitPdfUrl={pressKit?.pressKitPdf?.asset?.url}
          pressKitUrl={pressKit?.pressKitUrl}
          pressKitLinkLabel={pressKit?.pressKitLinkLabel}
        />
      </BackgroundSurface>

      {members.length > 0 && (
        <BackgroundSurface background={settings?.pageBackgrounds?.band}>
          <MembersSection members={members} />
        </BackgroundSurface>
      )}

      <BackgroundSurface background={settings?.pageBackgrounds?.contact}>
        <ContactSection contactEmail={settings?.contactEmail ?? defaultContactEmail} />
      </BackgroundSurface>
    </>
  );
}
