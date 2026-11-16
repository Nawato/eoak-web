'use client';

import { openConsentSettings } from '@/lib/consent';

export default function ConsentSettingsButton({ label = 'Datenschutzeinstellungen' }: { label?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className="text-muted transition-colors hover:text-accent-text">
      {label}
    </button>
  );
}
