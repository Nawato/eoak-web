import Link from 'next/link';
import { Camera, Video, AtSign, Users, Music2, type LucideIcon } from 'lucide-react';
import MobileNav from '@/components/MobileNav';
import { navLinks } from '@/lib/nav';
import { toHttpsUrl } from '@/lib/embeds';
import { getLogo } from '@/lib/sanity-image';
import type { SocialLink } from '@/sanity/types';

const platformIcons: Record<string, LucideIcon> = {
  instagram: Camera,
  youtube: Video,
  twitter: AtSign,
  facebook: Users,
  tiktok: Music2,
};

interface NavbarProps {
  bandName: string;
  socialLinks?: SocialLink[];
  logo?: unknown;
}

export default function Navbar({ bandName, socialLinks = [], logo }: NavbarProps) {
  const logoSource = getLogo(logo, 400);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="font-display text-lg font-bold uppercase tracking-[0.2em] text-white">
          {logoSource ? (
            // eslint-disable-next-line @next/next/no-img-element -- SVG/PNG logo served as-is from the Sanity CDN
            <img
              src={logoSource.url}
              alt={bandName}
              width={logoSource.width}
              height={logoSource.height}
              className="h-8 w-auto"
            />
          ) : (
            bandName
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {socialLinks.map((link, index) => {
            const Icon = platformIcons[link.platform];
            const href = toHttpsUrl(link.url);
            if (!Icon || !href) return null;
            return (
              <a
                key={`${link.platform}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="text-muted transition-colors hover:text-accent"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
