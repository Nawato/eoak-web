import { describe, expect, it } from 'vitest';
import { metaDescription } from './seo';

const fallback = 'Fallback description.';

describe('meta description', () => {
  it('collapses whitespace and trims surrounding spaces', () => {
    expect(metaDescription('  Dark   metalcore\nfrom Berlin.  ', fallback)).toBe('Dark metalcore from Berlin.');
  });

  it('falls back when the value is missing or blank', () => {
    expect(metaDescription(undefined, fallback)).toBe(fallback);
    expect(metaDescription(null, fallback)).toBe(fallback);
    expect(metaDescription('   ', fallback)).toBe(fallback);
  });

  it('keeps descriptions within the 160 character limit', () => {
    const long = 'word '.repeat(80);
    const result = metaDescription(long, fallback);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toContain('  ');
  });

  it('cuts at a word boundary and drops trailing punctuation', () => {
    const value = `${'a'.repeat(155)} break;`;
    expect(metaDescription(value, fallback)).toBe(`${'a'.repeat(155)}…`);

    const noSpace = `${'c'.repeat(158)}; x`;
    expect(metaDescription(noSpace, fallback)).toBe(`${'c'.repeat(158)}…`);

    const unbroken = 'd'.repeat(200);
    expect(metaDescription(unbroken, fallback)).toBe(`${'d'.repeat(159)}…`);
  });

  it('returns short text unchanged', () => {
    expect(metaDescription('Short.', fallback)).toBe('Short.');
  });
});
