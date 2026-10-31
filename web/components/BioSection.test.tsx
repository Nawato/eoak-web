import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import BioSection from './BioSection';

const driveUrl = 'https://drive.google.com/drive/folders/example';
const pdfUrl = 'https://cdn.sanity.io/files/example/production/press-kit.pdf';

describe('press kit link', () => {
  it('shows the biography placeholder and no empty press heading for empty rich text', () => {
    const html = renderToStaticMarkup(createElement(BioSection, { biography: [], pressRelease: [] }));
    expect(html).toContain('Biography coming soon.');
    expect(html).not.toContain('Press Release');
  });
  it('prefers the external folder and uses the editable label', () => {
    const html = renderToStaticMarkup(createElement(BioSection, {
      pressKitUrl: driveUrl,
      pressKitPdfUrl: pdfUrl,
      pressKitLinkLabel: 'Photos, logos & riders',
    }));
    expect(html).toContain(`href="${driveUrl}"`);
    expect(html).toContain('Photos, logos &amp; riders');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain(pdfUrl);
    expect(html).not.toContain('<iframe');
  });

  it('uses the default label when none is set', () => {
    const html = renderToStaticMarkup(createElement(BioSection, { pressKitUrl: driveUrl }));
    expect(html).toContain('Open Press Kit');
  });

  it.each([undefined, 'javascript:alert(1)', 'http://drive.google.com/drive/folders/example'])(
    'falls back to the PDF for a missing or invalid link: %s',
    (pressKitUrl) => {
      const html = renderToStaticMarkup(createElement(BioSection, { pressKitUrl, pressKitPdfUrl: pdfUrl }));
      expect(html).toContain(`href="${pdfUrl}"`);
      expect(html).toContain('Download Press Kit (PDF)');
      expect(html).not.toContain('javascript:');
    },
  );

  it('does not render a button without a valid folder or PDF link', () => {
    const html = renderToStaticMarkup(createElement(BioSection, { pressKitUrl: 'javascript:alert(1)' }));
    expect(html).not.toContain('<a ');
  });
});
