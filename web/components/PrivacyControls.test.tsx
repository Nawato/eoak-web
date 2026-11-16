import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PrivacyControls from './PrivacyControls';

describe('privacy controls', () => {
  it('renders granular provider switches and equally weighted actions', () => {
    const html = renderToStaticMarkup(createElement(PrivacyControls));

    for (const label of ['YouTube', 'Spotify', 'Instagram', 'Bandsintown']) {
      expect(html).toContain(label);
    }
    expect(html.match(/role="switch"/g)).toHaveLength(4);
    expect(html).toContain('Externe Medien (optional)');
    expect(html).toContain('Alle akzeptieren');
    expect(html).toContain('Nur notwendige');
    expect(html).toContain('Auswahl speichern');
  });

  it('does not preset any provider switch', () => {
    const html = renderToStaticMarkup(createElement(PrivacyControls));
    expect(html).not.toContain('checked=""');
  });
});
