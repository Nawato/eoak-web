import { siInstagram, siYoutube, siX, siFacebook, siTiktok } from 'simple-icons';
import type { SocialPlatform } from '@/sanity/types';

const icons = {
  instagram: siInstagram,
  youtube: siYoutube,
  twitter: siX,
  facebook: siFacebook,
  tiktok: siTiktok,
} satisfies Record<SocialPlatform, { path: string }>;

export default function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  const icon = icons[platform];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d={icon.path} />
    </svg>
  );
}
