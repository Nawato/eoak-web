'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import { readConsent, writeConsent, subscribeConsent } from '@/lib/consent';

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
      <div className={className}>
        {children}
        <button
          type="button"
          onClick={() => writeConsent(provider, false)}
          className="mt-3 text-xs text-muted underline underline-offset-2 hover:text-rose-300"
        >
          Revoke {provider} consent
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
