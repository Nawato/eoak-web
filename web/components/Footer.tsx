import Link from 'next/link';
import type { SocialLink } from '@/sanity/types';

interface FooterProps {
  bandName: string;
  socialLinks?: SocialLink[];
}

export default function Footer({ bandName, socialLinks = [] }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-8">
        <p className="text-xs text-muted">
          © {year} {bandName}. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
              aria-label={link.platform}
            >
              {link.platform}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6 text-xs">
          <Link href="/impressum" className="text-muted transition-colors hover:text-accent">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-muted transition-colors hover:text-accent">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}
