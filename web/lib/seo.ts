const MAX_DESCRIPTION_LENGTH = 160;
const MIN_TRUNCATED_LENGTH = 80;

/**
 * Normalize a meta description: collapse whitespace, trim, and cut long text at
 * a word boundary so the result stays within search-result limits.
 */
export function metaDescription(text: string | null | undefined, fallback: string): string {
  const normalized = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return fallback;
  if (normalized.length <= MAX_DESCRIPTION_LENGTH) return normalized;

  const clipped = normalized.slice(0, MAX_DESCRIPTION_LENGTH - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  const body = lastSpace >= MIN_TRUNCATED_LENGTH ? clipped.slice(0, lastSpace) : clipped;
  return `${body.replace(/[\s,;:.–—-]+$/, '')}…`;
}
