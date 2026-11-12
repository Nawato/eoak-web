import { describe, expect, it } from 'vitest';
import { defaultFeatures, resolveFeatures } from './features';

describe('feature flags', () => {
  it('enables existing sections by default', () => {
    expect(defaultFeatures.musicSection).toBe(true);
    expect(defaultFeatures.releasesSection).toBe(true);
    expect(defaultFeatures.tourSection).toBe(true);
    expect(defaultFeatures.contactSection).toBe(true);
    expect(defaultFeatures.galleryPage).toBe(true);
    expect(defaultFeatures.newsletterSection).toBe(false);
  });

  it('merges partial settings without treating missing values as disabled', () => {
    const features = resolveFeatures({ releasesSection: false, newsletterSection: true });
    expect(features.releasesSection).toBe(false);
    expect(features.newsletterSection).toBe(true);
    expect(features.musicSection).toBe(true);
    expect(features.releaseShare).toBe(true);
  });

  it('ignores null and invalid stored values', () => {
    const features = resolveFeatures({
      tourSection: null as unknown as boolean,
      galleryPage: 'yes' as unknown as boolean,
    });
    expect(features.tourSection).toBe(true);
    expect(features.galleryPage).toBe(true);
  });
});
