export const socialPlatforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'applemusic', label: 'Apple Music' },
  { value: 'bandcamp', label: 'Bandcamp' },
  { value: 'soundcloud', label: 'SoundCloud' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'threads', label: 'Threads' },
  { value: 'discord', label: 'Discord' },
  { value: 'patreon', label: 'Patreon' },
  { value: 'twitch', label: 'Twitch' },
] as const;

export type SocialPlatform = (typeof socialPlatforms)[number]['value'];

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

/**
 * Global CMS switches for optional sections, pages and release features.
 * Every field defaults to a safe value when an older document has no
 * `features` object at all. See lib/features.ts.
 */
export interface SiteFeatures {
  musicSection: boolean;
  releasesSection: boolean;
  tourSection: boolean;
  bioSection: boolean;
  bandSection: boolean;
  instagramSection: boolean;
  contactSection: boolean;
  newsletterSection: boolean;
  pressLink: boolean;
  contactForm: boolean;
  contactChannels: boolean;
  releasesArchive: boolean;
  tourArchive: boolean;
  galleryPage: boolean;
  photoGallery: boolean;
  videoGallery: boolean;
  releaseCountdown: boolean;
  releaseTracklist: boolean;
  releaseCredits: boolean;
  releaseShare: boolean;
  privacySettingsLink: boolean;
}

export type TourMode = 'auto' | 'manual' | 'bandsintown';

export interface ContactChannel {
  _key?: string;
  key: string;
  label: string;
  email: string;
  description?: string | null;
  enabled?: boolean | null;
  order?: number | null;
}

export interface PhotoCredit {
  _key: string;
  name: string;
  description?: string | null;
  url?: string | null;
}

export interface BackgroundSettings {
  image?: unknown;
  alt?: string | null;
  overlayOpacity?: number | null;
}

export type BackgroundArea =
  | 'music' | 'releases' | 'shows' | 'bio' | 'band'
  | 'instagram' | 'contact' | 'impressum' | 'privacy';

export interface PortableTextSpan {
  _key?: string;
  _type?: string;
  text?: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _key?: string;
  _type: 'block';
  style?: string;
  listItem?: 'bullet' | 'number' | string;
  level?: number;
  children?: PortableTextSpan[];
  markDefs?: { _key: string; _type: string; href?: string }[];
}

export type PortableTextValue = PortableTextBlock[];

export interface PressKit {
  biography: PortableTextValue;
  pressRelease: PortableTextValue;
  pressKitPdf?: { asset?: { url?: string } } | null;
  pressKitUrl?: string | null;
  pressKitLinkLabel?: string | null;
}

export type SanityDocument<T> = T & {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
};
