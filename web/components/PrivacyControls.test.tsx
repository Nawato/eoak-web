import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ writeConsent: vi.fn(), setRevoked: vi.fn() }));
vi.mock('@/lib/consent', () => ({ writeConsent: mocks.writeConsent }));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: () => [false, mocks.setRevoked],
}));
import PrivacyControls from './PrivacyControls';

describe('privacy controls', () => {
  it('revokes each provider choice and confirms withdrawal', () => {
    const element = PrivacyControls();
    element.props.children[0].props.onClick();
    expect(mocks.writeConsent.mock.calls).toEqual([
      ['YouTube', false],
      ['Spotify', false],
      ['Instagram', false],
      ['Bandsintown', false],
    ]);
    expect(mocks.setRevoked).toHaveBeenCalledWith(true);
  });
});
