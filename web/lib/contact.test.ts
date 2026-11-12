import { describe, expect, it } from 'vitest';
import {
  getContactChannelByKey,
  getEnabledContactChannels,
  isValidContactChannelKey,
  isValidContactEmail,
} from './contact';

describe('contact channels', () => {
  it('keeps enabled, valid channels and sorts them by order', () => {
    const channels = getEnabledContactChannels([
      { key: 'press', label: 'Press', email: 'press@example.com', enabled: true, order: 20 },
      { key: 'booking', label: 'Booking', email: 'booking@example.com', enabled: true, order: 10 },
      { key: 'old', label: 'Old', email: 'old@example.com', enabled: false, order: 1 },
      { key: 'bad-key!', label: 'Bad', email: 'bad@example.com', enabled: true, order: 2 },
      { key: 'invalid', label: 'Invalid', email: 'not-an-email', enabled: true, order: 3 },
    ]);
    expect(channels.map((channel) => channel.key)).toEqual(['booking', 'press']);
  });

  it('finds only exact, validated keys', () => {
    const channels = getEnabledContactChannels([
      { key: 'booking', label: 'Booking', email: 'booking@example.com', enabled: true, order: 1 },
    ]);
    expect(getContactChannelByKey(channels, 'booking')?.email).toBe('booking@example.com');
    expect(getContactChannelByKey(channels, 'unknown')).toBeUndefined();
    expect(getContactChannelByKey(channels, ' BOOKING ')).toBeUndefined();
  });

  it('validates keys and email addresses', () => {
    expect(isValidContactChannelKey('press')).toBe(true);
    expect(isValidContactChannelKey('press-eu')).toBe(true);
    expect(isValidContactChannelKey('Press')).toBe(false);
    expect(isValidContactChannelKey('press_eu')).toBe(false);
    expect(isValidContactEmail('fan@example.com')).toBe(true);
    expect(isValidContactEmail('fan@example.com\r\nBcc: other@example.com')).toBe(false);
    expect(isValidContactEmail('')).toBe(false);
  });
});
