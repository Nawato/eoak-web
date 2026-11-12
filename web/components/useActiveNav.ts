'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import type { NavLink } from '@/lib/nav';

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback);
  window.addEventListener('popstate', callback);
  return () => {
    window.removeEventListener('hashchange', callback);
    window.removeEventListener('popstate', callback);
  };
}

function getHashSnapshot(): string {
  return window.location.hash;
}

function getServerHashSnapshot(): string {
  return '';
}

export type ActiveNavValue = 'page' | 'location' | undefined;

/** Pure helper so active-link logic can be tested without a DOM. */
export function getActiveNavValue(
  href: string,
  pathname: string,
  hash: string,
  external = false,
): ActiveNavValue {
  if (external) return undefined;
  if (href.startsWith('/#')) {
    return pathname === '/' && hash === href.slice(1) ? 'location' : undefined;
  }
  if (href === '/') return pathname === '/' ? 'page' : undefined;
  return pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined;
}

export function useActiveNav() {
  const pathname = usePathname();
  const hash = useSyncExternalStore(subscribe, getHashSnapshot, getServerHashSnapshot);
  return (link: NavLink) => getActiveNavValue(link.href, pathname ?? '/', hash, link.external);
}
