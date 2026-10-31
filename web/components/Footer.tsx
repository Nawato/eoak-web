import Link from 'next/link';
import { toHttpsUrl } from '@/lib/embeds';
import type { SocialLink, PhotoCredit } from '@/sanity/types';

interface FooterProps {
  bandName: string;
  socialLinks?: SocialLink[];
  creditsHeading?: string | null;
  photoCredits?: PhotoCredit[] | null;
}

export default function Footer({ bandName, socialLinks = [], creditsHeading, photoCredits }: FooterProps) {
  const year = new Date().getFullYear();
  const credits = (photoCredits ?? []).filter((credit) => credit.name?.trim());

  return (
    <footer className="border-t border-white/5 bg-black/40">
      {credits.length > 0 && (
        <section aria-labelledby="photo-credits-heading" className="mx-auto max-w-6xl px-4 pt-10 md:px-8">
          <h2 id="photo-credits-heading" className="mb-5 font-display text-xl font-semibold uppercase text-white">
            {creditsHeading?.trim() || 'Photo Credits'}
          </h2>
          <ul className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {credits.map((credit) => {
              const href = toHttpsUrl(credit.url);
              return (
                <li key={credit._key} className="min-w-0 break-words">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-4 transition-colors hover:text-accent"
                    >
                      {credit.name}
                    </a>
                  ) : (
                    <span className="text-foreground">{credit.name}</span>
                  )}
                  {credit.description && <p className="mt-1 text-muted">{credit.description}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-8">
        <p className="text-xs text-muted">
          © {year} {bandName}. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {socialLinks.map((link, index) => {
            const href = toHttpsUrl(link.url);
            if (!href) return null;
            return (
              <a
                key={`${link.platform}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted capitalize transition-colors hover:text-accent"
              >
                {link.platform}
              </a>
            );
          })}
        </div>

        <nav aria-label="Legal" className="flex items-center gap-6 text-xs">
          <Link href="/impressum" className="text-muted transition-colors hover:text-accent">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-muted transition-colors hover:text-accent">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
