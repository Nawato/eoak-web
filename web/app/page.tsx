import { getSiteSettings, getPressKit, getReleases, getMembers, getShows } from '@/lib/sanity';
import { connection } from 'next/server';
import Hero from '@/components/Hero';
import InstagramSection from '@/components/InstagramSection';
import BackgroundSurface from '@/components/BackgroundSurface';
import MediaSection from '@/components/MediaSection';
import TourDates from '@/components/TourDates';
import BioSection from '@/components/BioSection';
import ReleasesSection from '@/components/ReleasesSection';
import MembersSection from '@/components/MembersSection';
import ContactSection from '@/components/ContactSection';
import NewsletterSection from '@/components/NewsletterSection';
import JsonLd from '@/components/JsonLd';
import { defaultContactEmail, siteUrl } from '@/lib/site';
import { getHttpsLinks, getSpotifyEmbedUrl, getYouTubeVideoId, toHttpsUrl } from '@/lib/embeds';
import { hasInstagramConfiguration, getInstagramFeed } from '@/lib/instagram';
import { resolveFeatures } from '@/lib/features';
import { latestReleaseHref } from '@/lib/releases';
import { hasNativeNewsletterConfiguration } from '@/lib/newsletter';

export default async function HomePage() {
  await connection();
  const settings = await getSiteSettings();
  const instagramConfigured = hasInstagramConfiguration();
  const [pressKit, releases, members, shows, instagramFeed] = await Promise.all([
    getPressKit(),
    getReleases(),
    getMembers(),
    getShows(),
    instagramConfigured ? getInstagramFeed() : Promise.resolve({ status: 'unconfigured' as const, posts: [] }),
  ]);

  const features = resolveFeatures(settings?.features);
  const bandName = settings?.bandName ?? 'End Of All Known';
  const now = new Date();
  const latestHref = latestReleaseHref(releases, now) ?? '#releases';

  const musicLinks = getHttpsLinks(settings?.streamingLinks);
  const hasMusicContent = Boolean(
    getYouTubeVideoId(settings?.latestYoutubeUrl ?? '') ||
    getSpotifyEmbedUrl(settings?.featuredSpotifyUrl ?? '') ||
    musicLinks.length > 0,
  );

  const pressKitPdfUrl = toHttpsUrl(pressKit?.pressKitPdf?.asset?.url);
  const pressKitUrl = toHttpsUrl(pressKit?.pressKitUrl);
  const hasBioContent = Boolean(
    (pressKit?.biography?.length ?? 0) > 0 ||
    (pressKit?.pressRelease?.length ?? 0) > 0 ||
    pressKitPdfUrl ||
    pressKitUrl,
  );

  const nativeNewsletter = hasNativeNewsletterConfiguration();
  const showNewsletter = features.newsletterSection && (nativeNewsletter || Boolean(toHttpsUrl(settings?.newsletterSignupUrl)));
  const showContact = features.contactSection && (features.contactForm || features.contactChannels);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: bandName,
    url: siteUrl,
    genre: 'Metalcore',
    sameAs: (settings?.socialLinks ?? []).map((link) => toHttpsUrl(link.url)).filter(Boolean),
    ...(members.length > 0
      ? { member: members.map((member) => ({ '@type': 'Person', name: member.name })) }
      : {}),
    ...(releases.length > 0
      ? {
          album: releases
            .filter((release) => release.slug)
            .slice(0, 10)
            .map((release) => ({
              '@type': 'MusicAlbum',
              name: release.title,
              url: `${siteUrl}/releases/${encodeURIComponent(release.slug ?? '')}`,
            })),
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero
        bandName={bandName}
        logo={settings?.logo}
        background={settings?.heroBackground}
        backgroundAlt={settings?.heroBackgroundAlt ?? undefined}
        overlayOpacity={settings?.heroOverlayOpacity}
        eyebrow={settings?.heroEyebrow ?? undefined}
        tagline={settings?.heroTagline ?? undefined}
        merchUrl={toHttpsUrl(settings?.merchUrl)}
        latestReleaseHref={latestHref}
        showTourCta={features.tourSection}
      />

      {features.musicSection && hasMusicContent && (
        <BackgroundSurface background={settings?.pageBackgrounds?.music}>
          <MediaSection
            latestYoutubeUrl={settings?.latestYoutubeUrl ?? ''}
            featuredSpotifyUrl={settings?.featuredSpotifyUrl ?? ''}
            streamingLinks={settings?.streamingLinks}
          />
        </BackgroundSurface>
      )}

      {features.releasesSection && releases.length > 0 && (
        <BackgroundSurface background={settings?.pageBackgrounds?.releases}>
          <ReleasesSection releases={releases} archiveHref={features.releasesArchive ? '/releases' : undefined} />
        </BackgroundSurface>
      )}

      {features.tourSection && (
        <BackgroundSurface background={settings?.pageBackgrounds?.shows}>
          <TourDates
            artistName={settings?.bandsintownArtistName ?? bandName}
            bandsintownUrl={settings?.bandsintownUrl}
            mode={settings?.tourMode ?? 'auto'}
            shows={shows}
            heading={settings?.tourHeading}
            noShowsText={settings?.tourNoShowsText}
            ticketLabel={settings?.tourTicketLabel}
            soldOutLabel={settings?.tourSoldOutLabel}
            archiveHref={features.tourArchive && shows.length > 0 ? '/tour' : undefined}
          />
        </BackgroundSurface>
      )}

      {features.bioSection && hasBioContent && (
        <BackgroundSurface background={settings?.pageBackgrounds?.bio}>
          <BioSection
            biography={pressKit?.biography}
            pressRelease={pressKit?.pressRelease ?? undefined}
            pressKitPdfUrl={pressKitPdfUrl ?? undefined}
            pressKitUrl={pressKitUrl}
            pressKitLinkLabel={pressKit?.pressKitLinkLabel}
          />
        </BackgroundSurface>
      )}

      {features.bandSection && members.length > 0 && (
        <BackgroundSurface background={settings?.pageBackgrounds?.band}>
          <MembersSection members={members} />
        </BackgroundSurface>
      )}

      {features.instagramSection && instagramConfigured && instagramFeed.status !== 'unconfigured' && (
        <BackgroundSurface background={settings?.pageBackgrounds?.instagram}>
          <InstagramSection
            feed={instagramFeed}
            heading={settings?.instagramHeading}
            followLabel={settings?.instagramFollowLabel}
            profileUrl={settings?.socialLinks?.find((link) => link.platform === 'instagram')?.url}
          />
        </BackgroundSurface>
      )}

      {showNewsletter && (
        <NewsletterSection
          native={nativeNewsletter}
          signupUrl={settings?.newsletterSignupUrl}
          heading={settings?.newsletterHeading}
          description={settings?.newsletterDescription}
          buttonLabel={settings?.newsletterButtonLabel}
          successMessage={settings?.newsletterSuccessMessage}
          privacyNote={settings?.newsletterPrivacyNote}
        />
      )}

      {showContact && (
        <BackgroundSurface background={settings?.pageBackgrounds?.contact}>
          <ContactSection
            contactEmail={settings?.contactEmail ?? defaultContactEmail}
            channels={settings?.contactChannels}
            showForm={features.contactForm}
            showChannels={features.contactChannels}
          />
        </BackgroundSurface>
      )}
    </>
  );
}
