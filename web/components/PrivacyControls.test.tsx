import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PrivacyControls from './PrivacyControls';

describe('privacy controls', () => {
  it('renders granular provider checkboxes and equally weighted actions', () => {
    const html = renderToStaticMarkup(createElement(PrivacyControls));

    for (const label of ['YouTube', 'Spotify', 'Bandsintown']) {
      expect(html).toContain(label);
    }
    expect(html.match(/type="checkbox"/g)).toHaveLength(3);
    expect(html).toContain('Externe Medien (optional)');
    expect(html).toContain('Alle akzeptieren');
    expect(html).toContain('Nur notwendige');
    expect(html).toContain('Auswahl speichern');
  });

  it('does not preset any provider checkbox', () => {
    const html = renderToStaticMarkup(createElement(PrivacyControls));
    expect(html).not.toContain('checked=""');
  });
});
