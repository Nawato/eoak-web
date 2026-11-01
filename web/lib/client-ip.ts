import { isIP } from 'node:net';

/**
 * Returns the client IP from a header that a trusted proxy is configured to overwrite.
 * Never read a hard-coded forwarded header: clients can spoof it on most hosts.
 * Returns undefined when the header is unconfigured, absent, or not a valid IP, so
 * callers can skip per-client limits instead of throttling every visitor together.
 */
export function getTrustedClientIp(headers: Headers, headerName: string | undefined): string | undefined {
  const name = headerName?.trim();
  if (!name) return undefined;
  const raw = headers.get(name)?.split(',')[0]?.trim();
  if (!raw || !isIP(raw) || raw.includes('%')) return undefined;
  // Canonical form so equivalent IPv6 spellings share one identity.
  return isIP(raw) === 6 ? new URL(`http://[${raw}]/`).hostname : raw;
}
