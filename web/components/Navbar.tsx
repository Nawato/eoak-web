import Link from 'next/link';
import { Camera, Video, AtSign, Users, Music2, type LucideIcon } from 'lucide-react';
import type { SocialLink } from '@/sanity/types';

const platformIcons: Record<string, LucideIcon> = {
  instagram: Camera,
  youtube: Video,
  twitter: AtSign,
  facebook: Users,
  tiktok: Music2,
};

const navLinks = [
  { href: '/#music', label: 'Music' },
  { href: '/#shows', label: 'Shows' },
  { href: '/#bio', label: 'Bio' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#contact', label: 'Contact' },
];

interface NavbarProps {
  bandName: string;
  socialLinks?: SocialLink[];
}

export default function Navbar({ bandName, socialLinks = [] }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="font-display text-lg font-bold uppercase tracking-[0.2em] text-white">
          {bandName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
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
          {socialLinks.map((link) => {
            const Icon = platformIcons[link.platform];
            if (!Icon) return null;
            return (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="text-muted transition-colors hover:text-accent"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
}
