export const socialPlatforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
] as const;

export type SocialPlatform = (typeof socialPlatforms)[number]['value'];

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
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
