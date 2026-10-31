'use client';

import { useState } from 'react';
import { writeConsent } from '@/lib/consent';

export default function PrivacyControls() {
  const [revoked, setRevoked] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => {
          for (const provider of ['YouTube', 'Spotify', 'Instagram', 'Bandsintown']) writeConsent(provider, false);
          setRevoked(true);
        }}
        className="rounded-sm border border-white/30 px-4 py-3 text-sm text-white hover:border-accent"
      >
        Alle Medien-Einwilligungen widerrufen
      </button>
      {revoked && (
        <p role="status" className="mt-3">
          Ihre Medien-Einwilligungen wurden widerrufen.
        </p>
      )}
    </div>
  );
}
