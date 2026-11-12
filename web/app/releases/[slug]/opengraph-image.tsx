import { ImageResponse } from 'next/og';
import { getRelease } from '@/lib/sanity';
import { builder, hasImage } from '@/lib/sanity-image';
import { siteName } from '@/lib/site';

export const alt = `${siteName} release`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

export default async function ReleaseOpengraphImage({ params }: Props) {
  const { slug } = await params;
  const release = await getRelease(slug);
  // ImageResponse only decodes PNG/JPEG, so convert WebP/SVG/AVIF uploads.
  const coverUrl = hasImage(release?.cover)
    ? builder.image(release.cover).width(1200).height(630).fit('crop').format('jpg').url()
    : undefined;

  if (coverUrl) {
    return new ImageResponse(
      (
        <img src={coverUrl} alt={release?.title ?? alt} width={1200} height={630} style={{ objectFit: 'cover' }} />
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
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: 'uppercase',
        }}
      >
        <div style={{ color: '#e11d48', fontSize: 26, letterSpacing: 10, marginBottom: 24 }}>{siteName}</div>
        {release?.title ?? 'Release'}
      </div>
    ),
    size,
  );
}
