import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/actions/sendEmail', () => ({ sendContactEmail: vi.fn() }));

import ContactSection from './ContactSection';

const channels = [
  {
    _key: 'booking',
    key: 'booking',
    label: 'Booking',
    email: 'booking@example.com',
    description: 'Live and tour requests',
    enabled: true,
    order: 1,
  },
  {
    _key: 'old',
    key: 'old',
    label: 'Old inbox',
    email: 'old@example.com',
    enabled: false,
    order: 2,
  },
];

describe('contact section feature flags', () => {
  it('shows channel cards without the form when only channels are enabled', () => {
    const html = renderToStaticMarkup(createElement(ContactSection, {
      contactEmail: 'fallback@example.com',
      channels,
      showForm: false,
      showChannels: true,
    }));

    expect(html).toContain('Booking');
    expect(html).toContain('href="mailto:booking@example.com"');
    expect(html).not.toContain('Send Message');
    expect(html).not.toContain('Old inbox');
  });

  it('shows the form without topic routing when channel cards are disabled', () => {
    const html = renderToStaticMarkup(createElement(ContactSection, {
      contactEmail: 'fallback@example.com',
      channels,
      showForm: true,
      showChannels: false,
    }));

    expect(html).toContain('Send Message');
    expect(html).not.toContain('name="channel"');
    expect(html).not.toContain('mailto:booking@example.com');
  });

  it('falls back to the main contact inbox when no valid channels exist', () => {
    const html = renderToStaticMarkup(createElement(ContactSection, {
      contactEmail: 'fallback@example.com',
      channels: [channels[1]],
    }));

    expect(html).toContain('href="mailto:fallback@example.com"');
    expect(html).not.toContain('name="channel"');
  });
});
