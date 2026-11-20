'use client';

import Link from 'next/link';
import { useEffect, useRef, useSyncExternalStore } from 'react';
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
  const visible = mounted && mode !== 'hidden';
  const banner = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const hasFocused = useRef(false);

  useEffect(() => {
    // Import the previous per-provider localStorage choices once.
    void migrateLegacyConsent().catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible) {
      hasFocused.current = false;
      return;
    }
    if (!hasFocused.current) {
      hasFocused.current = true;
      heading.current?.focus();
    }
  }, [visible]);

  // Reserve the space taken by the fixed banner so it never covers the footer.
  useEffect(() => {
    if (!visible || !banner.current) return;
    const element = banner.current;
    const sync = () => {
      document.documentElement.style.setProperty('--consent-banner-height', `${element.offsetHeight}px`);
    };
    sync();
    if (typeof ResizeObserver === 'undefined') return () => {
      document.documentElement.style.removeProperty('--consent-banner-height');
    };
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--consent-banner-height');
    };
  }, [visible]);

  return (
    <>
      {/* The live region exists from SSR onward, so the post-hydration banner is announced. */}
      <div role="status" aria-live="polite" className="sr-only">
        {visible ? 'Datenschutzeinstellungen: Externe Medien werden nur mit Ihrer Einwilligung geladen.' : ''}
      </div>
      {visible && (
        <section
          ref={banner}
          lang="de"
          aria-labelledby="consent-banner-title"
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-background/95 shadow-[0_-10px_30px_rgba(0,0,0,0.45)] backdrop-blur"
        >
          <div className="max-h-[70dvh] overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-8">
            <div className="mx-auto max-w-6xl">
              <h2
                ref={heading}
                id="consent-banner-title"
                tabIndex={-1}
                className="font-display text-xl font-semibold uppercase text-white focus:outline-none"
              >
                Datenschutz-Einstellungen
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted">
                Wir laden externe Medien von YouTube, Spotify und Bandsintown nur mit Ihrer
                Einwilligung. Die übrige Website bleibt ohne Einwilligung nutzbar. Details in der{' '}
                <Link href="/datenschutz" className="text-accent-text underline underline-offset-2 hover:text-white">
                  Datenschutzerklärung
                </Link>
                .
              </p>
              <ConsentSettingsForm variant="banner" expanded={mode === 'settings'} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
