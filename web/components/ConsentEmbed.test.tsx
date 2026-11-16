// @vitest-environment happy-dom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { deniedMedia } from '@/lib/cookie-consent';
import { resetConsentEnvironment, stubConsentFetch } from '@/test/consent-dom';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function setup(media = deniedMedia) {
  vi.resetModules();
  resetConsentEnvironment(media);
  const fetch = stubConsentFetch();
  const { default: ConsentEmbed } = await import('./ConsentEmbed');
  return { user: userEvent.setup(), fetch, ConsentEmbed };
}

function renderEmbed(ConsentEmbed: typeof import('./ConsentEmbed').default) {
  return render(
    <ConsentEmbed
      provider="youtube"
      description="Video von YouTube."
      initialAllowed={false}
    >
      <div data-testid="player">External player</div>
    </ConsentEmbed>,
  );
}

describe('consent embed', () => {
  it('loads the third-party content only after an explicit once-only choice', async () => {
    const { user, ConsentEmbed } = await setup();
    renderEmbed(ConsentEmbed);

    expect(screen.queryByTestId('player')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Einmal laden' }));
    expect(screen.getByTestId('player')).toBeTruthy();
  });

  it('surfaces a failed revocation instead of pretending it succeeded', async () => {
    const { user, ConsentEmbed } = await setup({ ...deniedMedia, youtube: true });
    stubConsentFetch({ ok: false, media: { ...deniedMedia, youtube: true } });
    renderEmbed(ConsentEmbed);

    await user.click(screen.getByRole('button', { name: 'Einwilligung für YouTube widerrufen' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Widerruf fehlgeschlagen');
    expect(screen.getByTestId('player')).toBeTruthy();
  });

  it('removes the third-party content after a successful revocation', async () => {
    const { user, ConsentEmbed } = await setup({ ...deniedMedia, youtube: true });
    renderEmbed(ConsentEmbed);

    await user.click(screen.getByRole('button', { name: 'Einwilligung für YouTube widerrufen' }));

    await waitFor(() => expect(screen.queryByTestId('player')).toBeNull());
  });
});
