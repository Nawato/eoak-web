'use client';

import Script from 'next/script';
import { useEffect, useId, useRef, useState } from 'react';

interface BandsintownWindow extends Window {
  BIT?: {
    onReady?: () => void;
    widgetInitializer?: {
      append: (element: HTMLElement, options: Record<string, string | boolean>) => void;
    };
  };
}

export default function BandsintownWidget({ artistName }: { artistName: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const pendingReady = useRef<(() => void) | null>(null);
  // next/script caches loads by id. A fresh id per mount makes re-consenting
  // after a revoke (or a client-side navigation back) re-inject the vendor
  // script instead of firing onReady into a removed script's global state.
  const scriptId = `eoak-bandsintown-script-${useId().replace(/:/g, '')}`;

  // Drop a still-pending vendor callback and the injected script on unmount
  // (e.g. after consent is revoked). Vendor-side cookies are not deleted.
  useEffect(
    () => () => {
      const bit = (window as BandsintownWindow).BIT;
      if (bit && pendingReady.current && bit.onReady === pendingReady.current) delete bit.onReady;
      pendingReady.current = null;
      document.getElementById(scriptId)?.remove();
      delete (window as BandsintownWindow).BIT;
    },
    [scriptId],
  );

  function initialize() {
    pendingReady.current = null;
    const initializer = (window as BandsintownWindow).BIT?.widgetInitializer;
    if (!container.current || !initializer) {
      console.error('Bandsintown widget failed to initialize.');
      setFailed(true);
      return;
    }
    if (container.current.childElementCount > 0) return;
    initializer.append(container.current, {
      artistName,
      displayLocalDates: false,
      displayPastDates: false,
      autoStyle: false,
      textColor: '#ffffff',
      linkColor: '#e11d48',
      backgroundColor: 'rgba(0,0,0,0)',
      displayLineup: false,
      displayPlayMyCity: false,
      separatorColor: 'rgba(255,255,255,0.1)',
    });
  }

  return (
    <>
      <Script
        id={scriptId}
        src="https://widget.bandsintown.com/main.min.js"
        // The ConsentEmbed gate already defers loading until consent; an extra
        // idle-time deferral would only delay content after an explicit click.
        strategy="afterInteractive"
        onReady={() => {
          // The vendor exposes its initializer after its document-ready callback.
          const bitWindow = window as BandsintownWindow;
          if (bitWindow.BIT?.widgetInitializer) initialize();
          else {
            bitWindow.BIT = bitWindow.BIT || {};
            pendingReady.current = initialize;
            bitWindow.BIT.onReady = initialize;
          }
        }}
        onError={() => {
          console.error('Bandsintown widget script failed to load.');
          setFailed(true);
        }}
      />
      <div ref={container} className="min-h-64 md:min-h-[22rem]" />
      {failed && <p role="status">Tour dates could not be loaded. Please use the Bandsintown link below.</p>}
    </>
  );
}
