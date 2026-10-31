import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/site';

export const alt = siteName;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
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
