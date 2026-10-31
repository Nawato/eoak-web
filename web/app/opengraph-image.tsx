import { ImageResponse } from 'next/og';
import { getSiteSettings } from '@/lib/sanity';
import { builder, hasImage } from '@/lib/sanity-image';
import { siteName } from '@/lib/site';

export const alt = siteName;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const settings = await getSiteSettings();
  // ImageResponse only decodes PNG/JPEG, so convert WebP/SVG/AVIF uploads.
  const ogUrl = hasImage(settings?.ogImage)
    ? builder.image(settings.ogImage).width(1200).height(630).fit('crop').format('jpg').url()
    : undefined;
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
