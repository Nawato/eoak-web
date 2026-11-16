'use client';

import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';
import { migrateLegacyConsent, useBannerMode } from '@/lib/consent';
import ConsentSettingsForm from './ConsentSettingsForm';

const subscribeToNothing = () => () => {};

export default function CookieBanner() {
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const mode = useBannerMode();

  useEffect(() => {
    // Import the previous per-provider localStorage choices once.
    void migrateLegacyConsent().catch(() => {});
  }, []);

  // Render only after hydration so consented visitors never see a banner flash.
  if (!mounted || mode === 'hidden') return null;

  return (
    <section
      lang="de"
      aria-labelledby="consent-banner-title"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-background/95 shadow-[0_-10px_30px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <div className="max-h-[70dvh] overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="consent-banner-title" className="font-display text-xl font-semibold uppercase text-white">
            Datenschutz-Einstellungen
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Wir laden externe Medien von YouTube, Spotify, Instagram und Bandsintown nur mit Ihrer
            Einwilligung. Die übrige Website bleibt ohne Einwilligung nutzbar. Details in der{' '}
            <Link href="/datenschutz" className="text-accent-text underline underline-offset-2 hover:text-rose-300">
              Datenschutzerklärung
            </Link>
            .
          </p>
          <ConsentSettingsForm variant="banner" expanded={mode === 'settings'} />
        </div>
      </div>
    </section>
  );
}
