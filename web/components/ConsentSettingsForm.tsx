'use client';

import { useState } from 'react';
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
  instagram: 'Fotos von Instagram (Meta Platforms Ireland Limited).',
  bandsintown: 'Konzerttermine von Bandsintown (Bandsintown, Inc.).',
};

const primaryButton =
  'rounded-sm bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60';
const secondaryButton =
  'rounded-sm bg-zinc-700 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60';
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

  return (
    <div className="mt-4">
      {expanded && (
        <>
          <p id="consent-media-hint" className="mb-3 text-sm text-zinc-400">
            Externe Medien werden erst nach Ihrer Einwilligung geladen. Ohne Einwilligung bleibt die
            übrige Website nutzbar.
          </p>
          <fieldset aria-describedby="consent-media-hint">
            <legend className="mb-3 font-display text-lg font-semibold uppercase text-white">
              Externe Medien (optional)
            </legend>
            <ul className="space-y-3">
              {consentProviders.map((provider) => {
                const label = consentProviderLabels[provider];
                const descriptionId = `consent-${provider}-description`;
                return (
                  <li key={provider} className="flex items-start gap-3">
                    <input
                      id={`consent-${provider}`}
                      type="checkbox"
                      role="switch"
                      checked={draft[provider]}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setOverrides((previous) => ({ ...previous, [provider]: checked }));
                      }}
                      aria-describedby={descriptionId}
                      className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-accent)]"
                    />
                    <div>
                      <label htmlFor={`consent-${provider}`} className="cursor-pointer font-medium text-white">
                        {label}
                      </label>
                      <p id={descriptionId} className="text-sm text-zinc-400">
                        {providerDescriptions[provider]}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </>
      )}

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
        {expanded ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => void apply(() => saveConsent(draft), 'Ihre Auswahl wurde gespeichert.')}
              className={primaryButton}
            >
              Auswahl speichern
            </button>
            {variant === 'banner' && (
              <button type="button" disabled={pending} onClick={closeConsentSettings} className={subtleButton}>
                Schließen
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={openConsentSettings} className={subtleButton}>
            Anpassen
          </button>
        )}
      </div>

      {message && (
        <p
          role={failed ? 'alert' : 'status'}
          className={cn('mt-3 text-sm', failed ? 'text-rose-300' : 'text-zinc-300')}
        >
          {message}
        </p>
      )}
    </div>
  );
}
