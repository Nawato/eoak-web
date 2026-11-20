import type { Metadata } from 'next';
import { getSiteSettings, getPressKit, getReleases, getMembers, getShows } from '@/lib/sanity';
import { connection } from 'next/server';
import { readConsent } from '@/lib/consent-server';
import Hero from '@/components/Hero';
import BackgroundSurface from '@/components/BackgroundSurface';
import MediaSection from '@/components/MediaSection';
import TourDates from '@/components/TourDates';
import BioSection from '@/components/BioSection';
import ReleasesSection from '@/components/ReleasesSection';
import MembersSection from '@/components/MembersSection';
import ContactSection from '@/components/ContactSection';
import NewsletterSection from '@/components/NewsletterSection';
import JsonLd from '@/components/JsonLd';
import { defaultContactEmail, siteDescription, siteGenre, siteName } from '@/lib/site';
import { getHttpsLinks, getSpotifyEmbedUrl, getYouTubeVideoId, toHttpsUrl } from '@/lib/embeds';
import { resolveFeatures } from '@/lib/features';
import { latestReleaseHref } from '@/lib/releases';
import { hasNativeNewsletterConfiguration } from '@/lib/newsletter';
import { getImageUrl, hasImage } from '@/lib/sanity-image';
import { buildMusicGroupJsonLd, buildWebSiteJsonLd } from '@/lib/structured-data';
import { metaDescription } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const bandName = settings?.bandName ?? siteName;
  const genre = settings?.heroEyebrow?.trim() || siteGenre;
  const title = `${bandName} — ${genre}`;
  const description = metaDescription(settings?.heroTagline, siteDescription);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: bandName,
      locale: 'en_US',
      title,
      description,
      url: '/',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function HomePage() {
  await connection();
  const settings = await getSiteSettings();
  const [pressKit, releases, members, shows, consent] = await Promise.all([
    getPressKit(),
    getReleases(),
    getMembers(),
    getShows(),
    readConsent(),
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

  const socialLinks = (settings?.socialLinks ?? []).map((link) => toHttpsUrl(link.url));
  const groupImage = hasImage(settings?.ogImage)
    ? getImageUrl(settings.ogImage, 1200, 630)
    : hasImage(settings?.heroBackground)
      ? getImageUrl(settings.heroBackground, 1200, 630)
      : undefined;
  const groupLogo = hasImage(settings?.logo)
    ? getImageUrl(settings.logo, 600)
    : hasImage(settings?.headerLogo)
      ? getImageUrl(settings.headerLogo, 600)
      : undefined;

  const jsonLd = [
    buildMusicGroupJsonLd({
      bandName,
      description: settings?.heroTagline?.trim() || siteDescription,
      image: groupImage,
      logo: groupLogo,
      sameAs: socialLinks,
      members: members.map((member) => ({ name: member.name })),
      albums: releases
        .filter((release) => release.slug)
        .slice(0, 10)
        .map((release) => ({
          title: release.title,
          url: `/releases/${encodeURIComponent(release.slug ?? '')}`,
        })),
    }),
    buildWebSiteJsonLd(bandName),
  ];

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
        tourCtaLabel={settings?.tourHeading}
      />

      {features.musicSection && hasMusicContent && (
        <BackgroundSurface background={settings?.pageBackgrounds?.music}>
          <MediaSection
            latestYoutubeUrl={settings?.latestYoutubeUrl ?? ''}
            featuredSpotifyUrl={settings?.featuredSpotifyUrl ?? ''}
            streamingLinks={settings?.streamingLinks}
            initialMedia={consent?.media ?? null}
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
            initialMedia={consent?.media ?? null}
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
