'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => () => {
    const bit = (window as BandsintownWindow).BIT;
    if (bit?.onReady === initialize) delete bit.onReady;
  });

  function initialize() {
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
        src="https://widget.bandsintown.com/main.min.js"
        strategy="afterInteractive"
        onReady={() => {
          // The vendor exposes its initializer after its document-ready callback.
          const bitWindow = window as BandsintownWindow;
          if (bitWindow.BIT?.widgetInitializer) initialize();
          else {
            bitWindow.BIT = bitWindow.BIT || {};
            bitWindow.BIT.onReady = initialize;
          }
        }}
        onError={() => {
          console.error('Bandsintown widget script failed to load.');
          setFailed(true);
        }}
      />
      <div ref={container} />
      {failed && <p role="status">Tour dates could not be loaded. Please use the Bandsintown link below.</p>}
    </>
  );
}
