'use client';

import { useSyncExternalStore } from 'react';
import {
  CONSENT_COOKIE_NAME,
  allowedMedia,
  deniedMedia,
  normalizeConsentMedia,
  parseConsentCookie,
  type ConsentMedia,
  type ConsentProvider,
  type ConsentState,
} from './cookie-consent';

export type BannerMode = 'hidden' | 'notice' | 'settings';

const LEGACY_STORAGE_PREFIX = 'eoak-consent:';
const LEGACY_PROVIDERS: Record<string, ConsentProvider> = {
  YouTube: 'youtube',
  Spotify: 'spotify',
  Instagram: 'instagram',
  Bandsintown: 'bandsintown',
};

const listeners = new Set<() => void>();
// "Einmal laden" is deliberately session-only: it never reaches the cookie.
const onceProviders = new Set<ConsentProvider>();
let current: ConsentState | null | undefined;
let settingsRequested = false;
let channel: BroadcastChannel | null = null;

function notify() {
  for (const listener of listeners) listener();
}

function readCookieValue(): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${CONSENT_COOKIE_NAME}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
  }
  return null;
}

function ensureCurrent(): ConsentState | null {
  if (current !== undefined) return current;
  current = parseConsentCookie(readCookieValue());
  return current;
}

function ensureChannel(): BroadcastChannel | null {
  if (channel) return channel;
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    channel = new BroadcastChannel('eoak-consent');
    channel.onmessage = () => {
      current = undefined;
      notify();
    };
  } catch {
    channel = null;
  }
  return channel;
}

export function subscribeConsent(callback: () => void) {
  listeners.add(callback);
  ensureChannel();
  const onVisibility = () => {
    if (document.visibilityState !== 'visible') return;
    // Cookies fire no storage event; re-read when the tab becomes visible.
    current = undefined;
    callback();
  };
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    listeners.delete(callback);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

export function isProviderAllowed(provider: ConsentProvider): boolean {
  if (onceProviders.has(provider)) return true;
  return ensureCurrent()?.media[provider] === true;
}

export function getConsentMedia(): ConsentMedia {
  return ensureCurrent()?.media ?? deniedMedia;
}

export function getBannerMode(): BannerMode {
  if (settingsRequested) return 'settings';
  return ensureCurrent() === null ? 'notice' : 'hidden';
}

async function persistConsent(media: ConsentMedia): Promise<void> {
  const response = await fetch('/api/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(media),
    credentials: 'same-origin',
  });
  if (!response.ok) {
    throw new Error(`Consent could not be saved (${response.status}).`);
  }
  const result = (await response.json()) as { media?: unknown; updatedAt?: unknown };
  const saved = normalizeConsentMedia(result.media);
  if (!saved || typeof result.updatedAt !== 'number') {
    throw new Error('Consent response was invalid.');
  }
  current = { version: 1, media: saved, updatedAt: result.updatedAt };
  settingsRequested = false;
  notify();
  ensureChannel()?.postMessage('change');
}

export async function saveConsent(media: ConsentMedia): Promise<void> {
  await persistConsent(media);
}

export async function acceptAllConsent(): Promise<void> {
  await persistConsent({ ...allowedMedia });
}

export async function rejectAllConsent(): Promise<void> {
  await persistConsent({ ...deniedMedia });
}

export async function revokeConsent(provider: ConsentProvider): Promise<void> {
  onceProviders.delete(provider);
  await persistConsent({ ...getConsentMedia(), [provider]: false });
}

export function loadConsentOnce(provider: ConsentProvider) {
  onceProviders.add(provider);
  notify();
}

export function openConsentSettings() {
  settingsRequested = true;
  notify();
}

export function closeConsentSettings() {
  settingsRequested = false;
  notify();
}

function removeLegacyStorage() {
  try {
    for (const legacyProvider of Object.keys(LEGACY_PROVIDERS)) {
      window.localStorage.removeItem(LEGACY_STORAGE_PREFIX + legacyProvider);
    }
  } catch {
    // The cookie is authoritative; stale legacy keys are only cleanup.
  }
}

/** Imports the previous localStorage choices once, then removes the old keys. */
export async function migrateLegacyConsent(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (readCookieValue() !== null) {
    removeLegacyStorage();
    return;
  }

  let imported: ConsentMedia | null = null;
  try {
    for (const [legacyProvider, provider] of Object.entries(LEGACY_PROVIDERS)) {
      if (window.localStorage.getItem(LEGACY_STORAGE_PREFIX + legacyProvider) === '1') {
        imported ??= { ...deniedMedia };
        imported[provider] = true;
      }
    }
  } catch {
    return;
  }
  if (!imported) return;

  await persistConsent(imported);
  removeLegacyStorage();
}

export function useConsentProvider(provider: ConsentProvider, initialAllowed: boolean): boolean {
  return useSyncExternalStore(
    subscribeConsent,
    () => isProviderAllowed(provider),
    () => initialAllowed,
  );
}

export function useConsentMedia(): ConsentMedia {
  return useSyncExternalStore(subscribeConsent, getConsentMedia, () => deniedMedia);
}

export function useBannerMode(): BannerMode {
  return useSyncExternalStore(subscribeConsent, getBannerMode, () => 'hidden');
}
