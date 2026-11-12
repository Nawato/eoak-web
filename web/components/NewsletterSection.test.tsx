import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/actions/newsletter', () => ({ subscribeToNewsletter: vi.fn() }));

import NewsletterSection from './NewsletterSection';

describe('newsletter section', () => {
  it('renders the native form with consent and privacy link', () => {
    const html = renderToStaticMarkup(createElement(NewsletterSection, {
      native: true,
      signupUrl: 'https://example.com/external',
      heading: 'Newsletter',
      buttonLabel: 'Join the list',
    }));

    expect(html).toContain('name="email"');
    expect(html).toContain('name="privacyConsent"');
    expect(html).toContain('name="website"');
    expect(html).toContain('Join the list');
    expect(html).toContain('href="/datenschutz"');
    expect(html).not.toContain('https://example.com/external');
  });

  it('uses an HTTPS external signup URL when native delivery is unavailable', () => {
    const html = renderToStaticMarkup(createElement(NewsletterSection, {
      native: false,
      signupUrl: 'https://example.com/external',
      buttonLabel: 'Subscribe externally',
    }));

    expect(html).toContain('href="https://example.com/external"');
    expect(html).toContain('Subscribe externally');
    expect(html).not.toContain('name="email"');
    expect(html).toContain('href="/datenschutz"');
  });

  it('stays hidden without native configuration or a safe external URL', () => {
    expect(renderToStaticMarkup(createElement(NewsletterSection, { native: false }))).toBe('');
    expect(renderToStaticMarkup(createElement(NewsletterSection, {
      native: false,
      signupUrl: 'http://example.com/insecure',
    }))).toBe('');
  });
});
