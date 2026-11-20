import { resolveFeatures } from '@/lib/features';
import { toHttpsUrl } from '@/lib/embeds';
import type { SiteFeatures } from '@/sanity/types';

export interface NavLink {
  href: string;
  label: string;
  /** Optional hover text, e.g. the press folder description. */
  title?: string;
  /** External links open in a new tab and can never become the active page. */
  external?: boolean;
}

export interface NavContent {
  hasReleases?: boolean;
  hasMembers?: boolean;
  hasShows?: boolean;
  hasPhotos?: boolean;
  hasVideos?: boolean;
}

/** Where the releases index lives: the homepage section first, the archive second. */
export function getReleasesIndexHref(enabled: SiteFeatures): string | null {
  if (enabled.releasesSection) return '/#releases';
  if (enabled.releasesArchive) return '/releases';
  return null;
}

/** Pathname of an HTTP referer, or null when it is missing or unparseable. */
function refererPath(referer?: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}

/**
 * Back link for a release page. Keep the visitor's context when they came from
 * the archive; otherwise point at the primary releases index.
 */
export function getReleasesBackHref(enabled: SiteFeatures, referer?: string | null): string {
  if (enabled.releasesArchive && refererPath(referer) === '/releases') return '/releases';
  return getReleasesIndexHref(enabled) ?? '/';
}

export function getNavLinks({
  features,
  hasReleases,
  hasMembers,
  hasShows = false,
  hasPhotos = false,
  hasVideos = false,
  pressUrl,
  pressLabel,
  pressDescription,
}: NavContent & {
  features?: Partial<SiteFeatures> | null;
  pressUrl?: string | null;
  pressLabel?: string | null;
  pressDescription?: string | null;
}): NavLink[] {
  const enabled = resolveFeatures(features);
  const links: NavLink[] = [];

  if (enabled.musicSection) links.push({ href: '/#music', label: 'Music' });

  if (hasReleases) {
    const releasesHref = getReleasesIndexHref(enabled);
    if (releasesHref) links.push({ href: releasesHref, label: 'Releases' });
  }

  if (hasShows && enabled.tourArchive) links.push({ href: '/tour', label: 'Tour' });
  else if (enabled.tourSection) links.push({ href: '/#shows', label: 'Shows' });

  if (enabled.bioSection) links.push({ href: '/#bio', label: 'Bio' });
  if (hasMembers && enabled.bandSection) links.push({ href: '/#band', label: 'Band' });

  if (enabled.galleryPage && ((enabled.photoGallery && hasPhotos) || (enabled.videoGallery && hasVideos))) {
    links.push({ href: '/gallery', label: 'Gallery' });
  }

  if (enabled.contactSection && (enabled.contactForm || enabled.contactChannels)) {
    links.push({ href: '/#contact', label: 'Contact' });
  }

  const pressHref = enabled.pressLink ? toHttpsUrl(pressUrl) : null;
  if (pressHref) {
    links.push({
      href: pressHref,
      label: pressLabel?.trim() || 'Press / EPK',
      title: pressDescription?.trim() || undefined,
      external: true,
    });
  }

  return links;
}
