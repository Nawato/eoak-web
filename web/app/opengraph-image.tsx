import { ImageResponse } from 'next/og';
import { getSiteSettings } from '@/lib/sanity';
import { getImageUrl, hasImage } from '@/lib/sanity-image';
import { siteName } from '@/lib/site';

export const alt = siteName;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const settings = await getSiteSettings();
  const ogUrl = hasImage(settings?.ogImage) ? getImageUrl(settings.ogImage, 1200, 630) : undefined;
  if (ogUrl) {
    return new ImageResponse(
      (
        <img src={ogUrl} alt={siteName} width={1200} height={630} style={{ objectFit: 'cover' }} />
      ),
      size,
    );
  }
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#ffffff',
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: 8,
          textTransform: 'uppercase',
        }}
      >
        <div style={{ color: '#e11d48', fontSize: 28, letterSpacing: 12, marginBottom: 32 }}>Metalcore</div>
        {siteName}
      </div>
    ),
    size,
  );
}
