import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSiteSettings: vi.fn(),
  connection: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));

vi.mock('@/lib/sanity', () => ({ getSiteSettings: mocks.getSiteSettings }));
vi.mock('next/server', () => ({ connection: mocks.connection }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));

import PressPage from './page';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('press redirect', () => {
  it('redirects to the configured HTTPS press folder', async () => {
    mocks.getSiteSettings.mockResolvedValue({
      pressUrl: 'https://drive.example.com/press-kit',
      features: { pressLink: true },
    });

    await expect(PressPage()).rejects.toThrow('REDIRECT:https://drive.example.com/press-kit');
    expect(mocks.connection).toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith('https://drive.example.com/press-kit');
    expect(mocks.notFound).not.toHaveBeenCalled();
  });

  it('defaults to enabled when the feature object is missing', async () => {
    mocks.getSiteSettings.mockResolvedValue({ pressUrl: 'https://example.com/press' });

    await expect(PressPage()).rejects.toThrow('REDIRECT:https://example.com/press');
  });

  it.each([
    ['the feature is disabled', { features: { pressLink: false } }, 'https://example.com/press'],
    ['the URL is missing', { features: { pressLink: true } }, undefined],
    ['the URL is not HTTPS', { features: { pressLink: true } }, 'http://example.com/press'],
    ['the URL is unsafe', { features: { pressLink: true } }, 'javascript:alert(1)'],
    ['settings do not exist', null, undefined],
  ])('returns not-found when %s', async (_label, settings, pressUrl) => {
    mocks.getSiteSettings.mockResolvedValue(settings ? { ...settings, pressUrl } : null);

    await expect(PressPage()).rejects.toThrow('NOT_FOUND');
    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(mocks.notFound).toHaveBeenCalled();
  });
});
