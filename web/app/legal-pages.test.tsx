import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Impressum } from '@/lib/sanity';

const mocks = vi.hoisted(() => ({ getImpressum: vi.fn(), getSiteSettings: vi.fn() }));
vi.mock('@/lib/sanity', () => mocks);
vi.mock('@/components/BackgroundSurface', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
import ImpressumPage from './impressum/page';
import DatenschutzPage from './datenschutz/page';
import LegalContact from '@/components/LegalContact';

const operator: Impressum = {
  legalNotice: 'Angaben gemäß § 5 TMG',
  operatorName: 'Testperson Beispiel',
  operatorAddress: 'Testweg 20\n40000 Testort\nDeutschland',
  email: 'legal@example.com',
  phone: '+49 123 456789',
  representedBy: '',
};

beforeEach(() => {
  mocks.getImpressum.mockResolvedValue(operator);
  mocks.getSiteSettings.mockResolvedValue(null);
});

describe('German legal pages', () => {
  it('uses DDG even when saved content still references the repealed TMG', async () => {
    const html = renderToStaticMarkup(await ImpressumPage());
    expect(html).toContain('§ 5 DDG');
    expect(html).not.toContain('§ 5 TMG');
    expect(html).toContain('Testperson Beispiel');
    expect(html).toContain('Testweg 20\n40000 Testort');
    expect(html).toContain('mailto:legal@example.com');
    expect(html).not.toContain('Registereintrag');
  });

  it('renders applicable company, editorial and dispute-resolution information', async () => {
    mocks.getImpressum.mockResolvedValue({
      ...operator,
      legalForm: 'GbR',
      registerDetails: 'Registergericht Testort, Nr. 123',
      vatId: 'DE123456789',
      businessId: 'DE123456789-00001',
      editorialResponsible: 'Redaktion Testort',
      disputeResolution: 'Individuelle Erklärung zur Schlichtung',
    });
    const html = renderToStaticMarkup(await ImpressumPage());
    for (const text of [
      'GbR',
      'Registergericht Testort',
      'DE123456789',
      '§ 18 Abs. 2 MStV',
      'Individuelle Erklärung',
    ]) {
      expect(html).toContain(text);
    }
  });

  it('flags missing deployment disclosures rather than claiming guarantees', async () => {
    const html = renderToStaticMarkup(await DatenschutzPage());
    expect(html).toContain('noch unvollständig');
    expect(html).toContain('Hosting-Anbieter, Verarbeitungsorte und Log-Speicherfristen: noch nicht hinterlegt.');
    expect(html).toContain('Art. 21 DSGVO');
    expect(html).toContain('Art. 77 DSGVO');
    expect(html).toContain('§ 25 Abs. 1 TDDDG');
    expect(html).toContain('Alle Medien-Einwilligungen widerrufen');
    expect(html).not.toContain('<iframe');
  });

  it('renders configured provider and transfer disclosures', async () => {
    mocks.getImpressum.mockResolvedValue({
      ...operator,
      hostingDetails: 'Tatsächlicher Hoster; Logs 7 Tage',
      emailProcessingDetails: 'Postfachanbieter; Nachrichten nach Bearbeitung löschen',
      internationalTransfers: 'Vertraglich geprüfte Empfänger und Garantien',
      supervisoryAuthority: 'Zuständige Landesbehörde',
      dataProtectionOfficer: 'Datenschutzkontakt DSB',
    });
    const html = renderToStaticMarkup(await DatenschutzPage());
    expect(html).not.toContain('noch unvollständig');
    for (const text of [
      'Tatsächlicher Hoster',
      'Postfachanbieter',
      'Vertraglich geprüfte',
      'Zuständige Landesbehörde',
      'Datenschutzkontakt DSB',
    ]) {
      expect(html).toContain(text);
    }
  });

  it('handles a missing legal document explicitly on both pages', async () => {
    mocks.getImpressum.mockResolvedValue(null);
    expect(renderToStaticMarkup(await ImpressumPage())).toContain(
      'Angaben zum Verantwortlichen sind noch nicht hinterlegt',
    );
    expect(renderToStaticMarkup(await DatenschutzPage())).toContain('noch unvollständig');
  });

  it('flags saved legacy placeholder addresses', () => {
    const html = renderToStaticMarkup(
      createElement(LegalContact, {
        operator: { ...operator, operatorAddress: 'Musterstraße 1, 12345 Berlin, Germany' },
      }),
    );
    expect(html).toContain('enthalten Musterangaben');
  });
});
