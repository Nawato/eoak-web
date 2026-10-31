import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import SocialIcon from '@/components/SocialIcon';
import type { NavLink } from '@/lib/nav';
import { toHttpsUrl } from '@/lib/embeds';
import { getLogo } from '@/lib/sanity-image';
import { socialPlatforms, type SocialLink } from '@/sanity/types';

interface NavbarProps {
  bandName: string;
  socialLinks?: SocialLink[];
  logo?: unknown;
  links: NavLink[];
}

export default function Navbar({ bandName, socialLinks = [], logo, links }: NavbarProps) {
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
              className="h-auto max-h-8 w-auto max-w-36 lg:max-w-44"
            />
          ) : (
            bandName
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-4 xl:flex">
          {links.map((link) => (
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
            const platform = socialPlatforms.find((platform) => platform.value === link.platform);
            const href = toHttpsUrl(link.url);
            if (!platform || !href) return null;
            return (
              <a
                key={`${link.platform}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.label}
                className="text-muted transition-colors hover:text-accent"
              >
                <SocialIcon platform={platform.value} className="h-5 w-5" />
              </a>
            );
          })}
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
