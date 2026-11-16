// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetConsentEnvironment, stubConsentFetch } from '@/test/consent-dom';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function setup() {
  vi.resetModules();
  resetConsentEnvironment();
  stubConsentFetch();
  const { default: CookieBanner } = await import('./CookieBanner');
  return { user: userEvent.setup(), CookieBanner };
}

describe('cookie banner', () => {
  it('announces itself and moves focus to its heading after hydration', async () => {
    const { CookieBanner } = await setup();
    render(<CookieBanner />);

    expect(screen.getByRole('status').textContent).toContain('Externe Medien werden nur mit Ihrer Einwilligung geladen');
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: 'Datenschutz-Einstellungen' }),
    );
  });

  it('keeps the disclosure trigger focused when expanding and collapsing', async () => {
    const { user, CookieBanner } = await setup();
    render(<CookieBanner />);

    const trigger = screen.getByRole('button', { name: 'Anpassen' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await user.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(document.activeElement).toBe(trigger);

    await user.click(screen.getByRole('button', { name: 'Schließen' }));

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
  });

  it('reserves space for the fixed banner so it cannot cover the footer', async () => {
    const { CookieBanner } = await setup();
    render(<CookieBanner />);

    expect(document.documentElement.style.getPropertyValue('--consent-banner-height')).not.toBe('');
  });
});
