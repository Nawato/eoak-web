// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetConsentEnvironment, stubConsentFetch } from '@/test/consent-dom';
import { deniedMedia } from '@/lib/cookie-consent';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function setup() {
  vi.resetModules();
  resetConsentEnvironment();
  const fetch = stubConsentFetch();
  const { default: ConsentSettingsForm } = await import('./ConsentSettingsForm');
  return { user: userEvent.setup(), fetch, ConsentSettingsForm };
}

describe('consent settings form', () => {
  it('saves a granular selection and confirms it', async () => {
    const { user, fetch, ConsentSettingsForm } = await setup();
    render(<ConsentSettingsForm variant="inline" />);

    await user.click(screen.getByLabelText('YouTube'));
    await user.click(screen.getByRole('button', { name: 'Auswahl speichern' }));

    expect(fetch).toHaveBeenCalledWith('/api/consent', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ ...deniedMedia, youtube: true }),
    }));
    expect((await screen.findByRole('status')).textContent).toContain('Ihre Auswahl wurde gespeichert.');
  });

  it('announces a failed save instead of silently accepting it', async () => {
    const { user, ConsentSettingsForm } = await setup();
    stubConsentFetch({ ok: false });
    render(<ConsentSettingsForm variant="inline" />);

    await user.click(screen.getByRole('button', { name: 'Alle akzeptieren' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Ihre Auswahl konnte nicht gespeichert werden.',
    );
  });

  it('uses native checkboxes and unique ids for coexisting forms', async () => {
    const { ConsentSettingsForm } = await setup();
    render(
      <>
        <ConsentSettingsForm variant="banner" expanded />
        <ConsentSettingsForm variant="inline" />
      </>,
    );

    expect(screen.getAllByRole('checkbox')).toHaveLength(6);
    const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
