import { describe, expect, it } from 'vitest';
import { getActiveNavValue } from './useActiveNav';

describe('active navigation state', () => {
  it('marks the current hash section only on the home page', () => {
    expect(getActiveNavValue('/#music', '/', '#music')).toBe('location');
    expect(getActiveNavValue('/#music', '/', '#shows')).toBeUndefined();
    expect(getActiveNavValue('/#music', '/releases', '#music')).toBeUndefined();
  });

  it('marks current pages and their detail routes', () => {
    expect(getActiveNavValue('/', '/', '')).toBe('page');
    expect(getActiveNavValue('/releases', '/releases', '')).toBe('page');
    expect(getActiveNavValue('/releases', '/releases/album', '')).toBe('page');
    expect(getActiveNavValue('/releases', '/releases-archive', '')).toBeUndefined();
    expect(getActiveNavValue('/tour', '/gallery', '')).toBeUndefined();
  });

  it('never marks external links as current', () => {
    expect(getActiveNavValue('https://example.com/press', '/', '', true)).toBeUndefined();
  });
});
