import { describe, expect, it } from 'vitest';
import { getNavLinks, getReleasesBackHref, getReleasesIndexHref } from './nav';
import { resolveFeatures } from './features';

describe('content-aware navigation', () => {
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

describe('releases index links', () => {
  const enabled = resolveFeatures({});

  it('prefers the homepage section and falls back to the archive', () => {
    expect(getReleasesIndexHref(enabled)).toBe('/#releases');
    expect(getReleasesIndexHref(resolveFeatures({ releasesSection: false }))).toBe('/releases');
    expect(getReleasesIndexHref(resolveFeatures({ releasesSection: false, releasesArchive: false }))).toBeNull();
  });

  it('keeps the archive context only when the visitor came from the archive', () => {
    expect(getReleasesBackHref(enabled, 'https://example.com/releases')).toBe('/releases');
    expect(getReleasesBackHref(enabled, 'https://example.com/releases/')).toBe('/releases');
    expect(getReleasesBackHref(enabled, 'https://example.com/releases?page=2')).toBe('/releases');
    expect(getReleasesBackHref(enabled, 'https://example.com/')).toBe('/#releases');
    expect(getReleasesBackHref(enabled, undefined)).toBe('/#releases');
    expect(getReleasesBackHref(enabled, 'not a url')).toBe('/#releases');
  });

  it('never links back to a disabled archive', () => {
    const archiveOff = resolveFeatures({ releasesArchive: false });
    expect(getReleasesBackHref(archiveOff, 'https://example.com/releases')).toBe('/#releases');
  });

  it('falls back to the homepage when no releases index is enabled', () => {
    const bothOff = resolveFeatures({ releasesSection: false, releasesArchive: false });
    expect(getReleasesBackHref(bothOff, 'https://example.com/releases')).toBe('/');
  });
});
