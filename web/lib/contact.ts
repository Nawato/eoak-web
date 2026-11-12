import type { ContactChannel } from '@/sanity/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidContactEmail(value: string): boolean {
  return value.length > 0 && value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isValidContactChannelKey(value: string): boolean {
  return KEY_PATTERN.test(value);
}

export interface EnabledContactChannel extends ContactChannel {
  key: string;
  label: string;
  email: string;
}

/**
 * Returns only channels an editor explicitly enabled and that have a usable
 * key, label and validated destination email. Sorted by the numeric order field.
 */
export function getEnabledContactChannels(channels?: ContactChannel[] | null): EnabledContactChannel[] {
  return (channels ?? [])
    .filter((channel) => channel.enabled !== false)
    .map((channel) => ({
      ...channel,
      key: channel.key?.trim() ?? '',
      label: channel.label?.trim() ?? '',
      email: channel.email?.trim() ?? '',
    }))
    .filter(
      (channel) =>
        isValidContactChannelKey(channel.key) &&
        channel.label.length > 0 &&
        isValidContactEmail(channel.email),
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getContactChannelByKey(
  channels: EnabledContactChannel[],
  key: string | null | undefined,
): EnabledContactChannel | undefined {
  const normalized = key?.trim();
  if (!normalized) return undefined;
  return channels.find((channel) => channel.key === normalized);
}
