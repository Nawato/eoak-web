import { describe, expect, it } from 'vitest';
import { getNavLinks } from './nav';

describe('content-aware navigation', () => {
  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ])('matches visible releases (%s) and members (%s)', (hasReleases, hasMembers) => {
    const links = getNavLinks({ hasReleases, hasMembers });
    expect(links.some((link) => link.href === '/#releases')).toBe(hasReleases);
    expect(links.some((link) => link.href === '/#band')).toBe(hasMembers);
    expect(links.map((link) => link.href)).toEqual(expect.arrayContaining([
      '/#music', '/#shows', '/#bio', '/#contact',
    ]));
    expect(links.some((link) => link.href === '/#gallery')).toBe(false);
  });
});
