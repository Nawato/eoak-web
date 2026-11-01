import { describe, expect, it } from 'vitest';
import { getTrustedClientIp } from './client-ip';

describe('getTrustedClientIp', () => {
  it('returns undefined when no trusted header is configured', () => {
    const headers = new Headers({ 'x-real-ip': '192.0.2.1' });
    expect(getTrustedClientIp(headers, undefined)).toBeUndefined();
    expect(getTrustedClientIp(headers, '')).toBeUndefined();
    expect(getTrustedClientIp(headers, '   ')).toBeUndefined();
  });

  it('ignores forwarded headers that are not explicitly configured', () => {
    const headers = new Headers({ 'x-forwarded-for': '198.51.100.9, 10.0.0.1' });
    expect(getTrustedClientIp(headers, 'x-real-ip')).toBeUndefined();
  });

  it('uses the configured header and the first address in a list', () => {
    const headers = new Headers({ 'x-real-ip': ' 198.51.100.9 , 10.0.0.1' });
    expect(getTrustedClientIp(headers, 'x-real-ip')).toBe('198.51.100.9');
  });

  it('canonicalizes equivalent IPv6 spellings to one identity', () => {
    const short = new Headers({ 'x-real-ip': '2001:db8::1' });
    const long = new Headers({ 'x-real-ip': '2001:0db8:0:0:0:0:0:1' });
    expect(getTrustedClientIp(short, 'x-real-ip')).toBe(getTrustedClientIp(long, 'x-real-ip'));
  });

  it.each(['not-an-ip', '999.1.1.1', '192.0.2.1%eth0', ''])('rejects invalid addresses: %j', (value) => {
    expect(getTrustedClientIp(new Headers({ 'x-real-ip': value }), 'x-real-ip')).toBeUndefined();
  });
});
