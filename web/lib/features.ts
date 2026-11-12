import type { SiteFeatures } from '@/sanity/types';

/**
 * Sensible defaults for documents created before the feature object existed.
 * Existing sections stay visible; optional/new sections default to enabled but
 * still hide themselves when no content or credentials are configured.
 */
export const defaultFeatures: SiteFeatures = {
  musicSection: true,
  releasesSection: true,
  tourSection: true,
  bioSection: true,
  bandSection: true,
  instagramSection: true,
  contactSection: true,
  newsletterSection: false,
  pressLink: true,
  contactForm: true,
  contactChannels: true,
  releasesArchive: true,
  tourArchive: true,
  galleryPage: true,
  photoGallery: true,
  videoGallery: true,
  releaseCountdown: true,
  releaseTracklist: true,
  releaseCredits: true,
  releaseShare: true,
  privacySettingsLink: true,
};

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/** Merge a partially filled Sanity object with the defaults, ignoring null/invalid values. */
export function resolveFeatures(value?: Partial<SiteFeatures> | null): SiteFeatures {
  const resolved = { ...defaultFeatures };
  if (!value) return resolved;
  for (const key of Object.keys(defaultFeatures) as (keyof SiteFeatures)[]) {
    const candidate = value[key];
    if (isBoolean(candidate)) resolved[key] = candidate;
  }
  return resolved;
}
