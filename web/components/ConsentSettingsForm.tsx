'use client';

import { useId, useState } from 'react';
import {
  consentProviderLabels,
  consentProviders,
  type ConsentMedia,
  type ConsentProvider,
} from '@/lib/cookie-consent';
import {
  acceptAllConsent,
  closeConsentSettings,
  openConsentSettings,
  rejectAllConsent,
  saveConsent,
  useConsentMedia,
} from '@/lib/consent';
import { cn } from '@/lib/utils';

const providerDescriptions: Record<ConsentProvider, string> = {
  youtube: 'Videos von YouTube (Google Ireland Limited).',
  spotify: 'Musikplayer von Spotify (Spotify AB).',
  bandsintown: 'Konzerttermine von Bandsintown (Bandsintown, Inc.).',
};

const primaryButton =
  'rounded-sm bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60';
const secondaryButton =
  'rounded-sm bg-control px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60';
const subtleButton =
  'rounded-sm border border-white/30 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-60';

interface ConsentSettingsFormProps {
  variant: 'banner' | 'inline';
  expanded?: boolean;
}

export default function ConsentSettingsForm({ variant, expanded = true }: ConsentSettingsFormProps) {
  const media = useConsentMedia();
  // Pending edits live as overrides; the store stays the source of truth.
  const [overrides, setOverrides] = useState<Partial<ConsentMedia>>({});
  const draft: ConsentMedia = { ...media, ...overrides };
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  // Scoped per instance so the banner form and the inline /datenschutz form
  // can coexist without duplicate ids.
  const idPrefix = useId().replace(/:/g, '');
  const formId = `${idPrefix}-form`;
  const hintId = `${idPrefix}-hint`;
  const panelExpanded = variant === 'inline' || expanded;

  async function apply(action: () => Promise<void>, success: string) {
    setPending(true);
    setMessage(null);
    setFailed(false);
    try {
      await action();
      setOverrides({});
      setMessage(success);
    } catch {
      setFailed(true);
      setMessage('Ihre Auswahl konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.');
    } finally {
      setPending(false);
    }
  }

  function save() {
    return apply(() => saveConsent(draft), 'Ihre Auswahl wurde gespeichert.');
  }

  return (
    <div className="mt-4">
      <div id={formId} hidden={!panelExpanded}>
        <p id={hintId} className="mb-3 text-sm text-muted">
          Externe Medien werden erst nach Ihrer Einwilligung geladen. Ohne Einwilligung bleibt die
          übrige Website nutzbar.
        </p>
        <fieldset aria-describedby={hintId}>
          <legend className="mb-3 font-display text-lg font-semibold uppercase text-white">
            Externe Medien (optional)
          </legend>
          <ul className="space-y-3">
            {consentProviders.map((provider) => {
              const label = consentProviderLabels[provider];
              const inputId = `${idPrefix}-${provider}`;
              const descriptionId = `${inputId}-description`;
              return (
                <li key={provider} className="flex items-start gap-3">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={draft[provider]}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setOverrides((previous) => ({ ...previous, [provider]: checked }));
                    }}
                    aria-describedby={descriptionId}
                    className="mt-1 h-6 w-6 shrink-0 cursor-pointer accent-accent"
                  />
                  <div>
                    <label htmlFor={inputId} className="cursor-pointer font-medium text-white">
                      {label}
                    </label>
                    <p id={descriptionId} className="text-sm text-muted">
                      {providerDescriptions[provider]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => void apply(acceptAllConsent, 'Alle externen Medien wurden erlaubt.')}
          className={primaryButton}
        >
          Alle akzeptieren
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void apply(rejectAllConsent, 'Nur notwendige Speicherung wurde erlaubt.')}
          className={secondaryButton}
        >
          Nur notwendige
        </button>
        {expanded && (
          <button type="button" disabled={pending} onClick={() => void save()} className={primaryButton}>
            Auswahl speichern
          </button>
        )}
        {variant === 'banner' && (
          <button
            type="button"
            disabled={pending}
            aria-expanded={expanded}
            aria-controls={formId}
            onClick={expanded ? closeConsentSettings : openConsentSettings}
            className={subtleButton}
          >
            {expanded ? 'Schließen' : 'Anpassen'}
          </button>
        )}
      </div>

      {message && (
        <p
          role={failed ? 'alert' : 'status'}
          className={cn('mt-3 text-sm', failed ? 'text-accent-text' : 'text-foreground')}
        >
          {message}
        </p>
      )}
    </div>
  );
}
