'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import { readConsent, writeConsent, subscribeConsent } from '@/lib/consent';
import { cn } from '@/lib/utils';

interface ConsentEmbedProps {
  provider: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export default function ConsentEmbed({ provider, description, children, className }: ConsentEmbedProps) {
  const consented = useSyncExternalStore(
    subscribeConsent,
    () => readConsent(provider),
    () => false,
  );

  if (consented) {
    return (
      <div className={cn('relative', className)}>
        {children}
        <button
          type="button"
          aria-label={`Revoke ${provider} consent`}
          onClick={() => writeConsent(provider, false)}
          className="absolute right-2 top-2 z-10 rounded-sm border border-white/15 bg-black/80 px-2 py-1.5 text-xs text-zinc-300 shadow-sm transition-colors hover:bg-black hover:text-white"
        >
          Revoke consent
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex h-full min-h-48 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-md text-sm text-zinc-400">
          {description} Loading this content transfers your IP address to {provider} and may set cookies or
          similar identifiers. See our{' '}
          <Link href="/datenschutz" className="text-accent underline underline-offset-2 hover:text-rose-300">
            privacy policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={() => writeConsent(provider, true)}
          className="rounded-sm bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
        >
          Load {provider} content
        </button>
      </div>
    </div>
  );
}
