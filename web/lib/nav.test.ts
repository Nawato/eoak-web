import { describe, expect, it } from 'vitest';
import { getNavLinks } from './nav';

describe('content-aware navigation', () => {
  it.each([
    [' Band updates ', 'Band updates'],
    ['', 'From Instagram'],
    ['   ', 'From Instagram'],
    [null, 'From Instagram'],
    [undefined, 'From Instagram'],
  ])('uses the Instagram section heading (%s) as its navigation label', (instagramHeading, label) => {
    const links = getNavLinks({ hasReleases: false, hasMembers: false, hasInstagram: true, instagramHeading });
    expect(links.find((link) => link.href === '/#instagram')?.label).toBe(label);
  });
  it('shows Instagram only when the feed is configured', () => {
    expect(
      getNavLinks({ hasReleases: false, hasMembers: false, hasInstagram: true }).some(
        (link) => link.href === '/#instagram',
      ),
    ).toBe(true);
    expect(getNavLinks({ hasReleases: false, hasMembers: false }).some((link) => link.href === '/#instagram')).toBe(
      false,
    );
  });
  it('adds tour, gallery and press links only when enabled and configured', () => {
    const links = getNavLinks({
      hasReleases: false,
      hasMembers: false,
      hasShows: true,
      hasPhotos: true,
      features: { galleryPage: true, photoGallery: true, tourArchive: true, pressLink: true },
      pressUrl: 'https://drive.google.com/drive/folders/example',
      pressLabel: 'Press folder',
      pressDescription: 'Logos, photos and riders',
    });
    expect(links.find((link) => link.href === '/tour')).toBeTruthy();
    expect(links.find((link) => link.href === '/gallery')).toBeTruthy();
    expect(links.find((link) => link.label === 'Press folder')).toEqual(
      expect.objectContaining({
        href: 'https://drive.google.com/drive/folders/example',
        title: 'Logos, photos and riders',
        external: true,
      }),
    );
  });

  it('never links to disabled, unsafe or empty sections', () => {
    const links = getNavLinks({
      hasReleases: true,
      hasMembers: true,
      hasShows: false,
      hasPhotos: false,
      hasVideos: false,
      hasInstagram: false,
      features: {
        musicSection: false,
        releasesSection: false,
        releasesArchive: false,
        tourSection: false,
        bioSection: false,
        bandSection: false,
        galleryPage: false,
        contactSection: false,
        pressLink: true,
      },
      pressUrl: 'javascript:alert(1)',
    });
    expect(links).toEqual([]);
  });

  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ])('matches visible releases (%s) and members (%s)', (hasReleases, hasMembers) => {
    const links = getNavLinks({ hasReleases, hasMembers });
    expect(links.some((link) => link.href === '/#releases')).toBe(hasReleases);
    expect(links.some((link) => link.href === '/#band')).toBe(hasMembers);
    expect(links.map((link) => link.href)).toEqual(
      expect.arrayContaining(['/#music', '/#shows', '/#bio', '/#contact']),
    );
    expect(links.some((link) => link.href === '/#gallery')).toBe(false);
  });
});
