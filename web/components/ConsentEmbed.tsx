'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { consentProviderLabels, type ConsentProvider } from '@/lib/cookie-consent';
import { loadConsentOnce, openConsentSettings, revokeConsent, useConsentProvider } from '@/lib/consent';
import { cn } from '@/lib/utils';

interface ConsentEmbedProps {
  provider: ConsentProvider;
  description: string;
  initialAllowed: boolean;
  children: ReactNode;
  className?: string;
  placeholderClassName?: string;
  /** In-flow skeleton that reserves the same space as the loaded content. */
  placeholderBackdrop?: ReactNode;
}

function PlaceholderContent({ provider, description }: { provider: ConsentProvider; description: string }) {
  const label = consentProviderLabels[provider];
  return (
    <>
      <p className="max-w-md text-sm text-zinc-400">
        {description} Beim Laden werden Ihre IP-Adresse und Browserdaten an {label} übertragen; der
        Anbieter kann Cookies oder ähnliche Kennungen setzen. Siehe{' '}
        <Link href="/datenschutz" className="text-accent-text underline underline-offset-2 hover:text-rose-300">
          Datenschutzerklärung
        </Link>
        .
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => loadConsentOnce(provider)}
          className="rounded-sm bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
        >
          Einmal laden
        </button>
        <button
          type="button"
          onClick={openConsentSettings}
          className="rounded-sm border border-white/30 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:border-accent"
        >
          Einstellungen öffnen
        </button>
      </div>
    </>
  );
}

export default function ConsentEmbed({
  provider,
  description,
  initialAllowed,
  children,
  className,
  placeholderClassName,
  placeholderBackdrop,
}: ConsentEmbedProps) {
  const allowed = useConsentProvider(provider, initialAllowed);
  const label = consentProviderLabels[provider];

  if (allowed) {
    return (
      <div className={cn('relative', className)}>
        {children}
        <button
          type="button"
          lang="de"
          aria-label={`Einwilligung für ${label} widerrufen`}
          onClick={() => {
            void revokeConsent(provider).catch(() => {});
          }}
          className="absolute right-2 top-2 z-10 inline-flex min-h-11 items-center rounded-sm border border-white/15 bg-black/80 px-3 py-2 text-xs text-zinc-200 shadow-sm transition-colors hover:bg-black hover:text-white"
        >
          Einwilligung widerrufen
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {placeholderBackdrop ? (
        <div className="relative">
          {placeholderBackdrop}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/85 p-6 text-center" lang="de">
            <PlaceholderContent provider={provider} description={description} />
          </div>
        </div>
      ) : (
        <div
          lang="de"
          className={cn(
            'flex h-full min-h-48 flex-col items-center justify-center gap-4 p-6 text-center',
            placeholderClassName,
          )}
        >
          <PlaceholderContent provider={provider} description={description} />
        </div>
      )}
    </div>
  );
}
