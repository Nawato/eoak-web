import { ImageResponse } from 'next/og';
import { getSiteSettings } from '@/lib/sanity';
import { siteName } from '@/lib/site';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export default async function AppleIcon() {
  const settings = await getSiteSettings();
  const bandName = settings?.bandName ?? siteName;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#ffffff',
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        {initials(bandName)}
      </div>
    ),
    size,
  );
}
