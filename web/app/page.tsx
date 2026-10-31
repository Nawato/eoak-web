import { getSiteSettings, getPressKit } from '@/lib/sanity';
import type { SanityImageSource } from '@/lib/sanity-image';
import Hero from '@/components/Hero';
import MediaSection from '@/components/MediaSection';
import TourDates from '@/components/TourDates';
import BioSection from '@/components/BioSection';
import GallerySection from '@/components/GallerySection';
import ContactSection from '@/components/ContactSection';

export default async function HomePage() {
  const settings = await getSiteSettings();
  const pressKit = await getPressKit();

  const bandName = settings?.bandName ?? 'End Of All Known';

  return (
    <>
      <Hero bandName={bandName} />

      <MediaSection
        latestYoutubeUrl={settings?.latestYoutubeUrl ?? ''}
        featuredSpotifyUrl={settings?.featuredSpotifyUrl ?? ''}
      />

      <TourDates artistName={settings?.bandsintownArtistName ?? bandName} />

      <BioSection
        biography={pressKit?.biography}
        pressRelease={pressKit?.pressRelease ?? undefined}
        pressKitPdfUrl={pressKit?.pressKitPdf?.asset?.url}
      />

      <GallerySection
        gallery={
          (pressKit?.gallery ?? []).map((item) => ({
            ...item,
            image: item.image as SanityImageSource,
          }))
        }
      />

      <ContactSection
        bookingEmail={settings?.bookingEmail ?? null}
        managementEmail={settings?.managementEmail ?? null}
      />
    </>
  );
}
