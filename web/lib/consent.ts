const STORAGE_PREFIX = 'eoak-consent:';
const CHANGE_EVENT = 'eoak-consent-change';
const sessionConsent = new Map<string, boolean>();

export function subscribeConsent(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === null) sessionConsent.clear();
    else if (event.key.startsWith(STORAGE_PREFIX)) {
      sessionConsent.delete(event.key.slice(STORAGE_PREFIX.length));
    } else return;
    callback();
  }
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function readConsent(provider: string): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionConsent.has(provider)) return sessionConsent.get(provider) === true;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + provider) === '1';
  } catch {
    return false;
  }
}

export function writeConsent(provider: string, value: boolean) {
  // Keep the explicit choice usable even when browser storage is blocked or full.
  sessionConsent.set(provider, value);
  try {
    if (value) window.localStorage.setItem(STORAGE_PREFIX + provider, '1');
    else window.localStorage.removeItem(STORAGE_PREFIX + provider);
  } catch {
    // In-memory consent lasts only until the page is reloaded.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
