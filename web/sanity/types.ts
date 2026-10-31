import { Camera, Video, AtSign, Users, Music2 } from 'lucide-react';

export const socialPlatforms = [
  { value: 'instagram', label: 'Instagram', icon: Camera },
  { value: 'youtube', label: 'YouTube', icon: Video },
  { value: 'twitter', label: 'Twitter / X', icon: AtSign },
  { value: 'facebook', label: 'Facebook', icon: Users },
  { value: 'tiktok', label: 'TikTok', icon: Music2 },
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
  | 'gallery' | 'contact' | 'impressum' | 'privacy';

export interface PortableTextSpan {
  _key?: string;
  _type?: string;
  text?: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _key?: string;
  _type?: string;
  style?: string;
  listItem?: 'bullet' | 'number' | string;
  level?: number;
  children?: PortableTextSpan[];
  markDefs?: { _key: string; _type: string; href?: string }[];
}

export type PortableTextValue = PortableTextBlock[];

export interface GalleryImage {
  image: unknown;
  caption: string;
  isHighRes: boolean;
}

export interface PressKit {
  biography: PortableTextValue;
  pressRelease: PortableTextValue;
  pressKitPdf?: { asset?: { url?: string } } | null;
  pressKitUrl?: string | null;
  pressKitLinkLabel?: string | null;
  gallery: GalleryImage[];
}

export type SanityDocument<T> = T & {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
};
