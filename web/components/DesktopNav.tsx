'use client';

import Link from 'next/link';
import type { NavLink } from '@/lib/nav';
import { useActiveNav } from '@/components/useActiveNav';

export default function DesktopNav({ links }: { links: NavLink[] }) {
  const activeValue = useActiveNav();

  return (
    <nav aria-label="Main" className="hidden items-center gap-4 xl:flex">
      {links.map((link) => {
        const current = activeValue(link);
        const className = `text-xs font-medium uppercase tracking-widest transition-colors ${
          current ? 'text-accent-text' : 'text-muted hover:text-accent-text'
        }`;
        return link.external ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title}
            className={className}
          >
            {link.label}
          </a>
        ) : (
          <Link key={link.href} href={link.href} aria-current={current} className={className}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
