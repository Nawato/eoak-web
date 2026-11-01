import type { Metadata } from 'next';
import Link from 'next/link';
import { getImpressum, getSiteSettings } from '@/lib/sanity';
import BackgroundSurface from '@/components/BackgroundSurface';
import LegalContact from '@/components/LegalContact';

export const metadata: Metadata = {
  title: 'Impressum',
  alternates: { canonical: '/impressum' },
};

export default async function ImpressumPage() {
  const [impressum, settings] = await Promise.all([getImpressum(), getSiteSettings()]);

  return (
    <BackgroundSurface background={settings?.pageBackgrounds?.impressum}>
      <section lang="de" className="mx-auto max-w-3xl px-4 py-24">
        <h1 className="mb-8 text-4xl font-display text-white">Impressum</h1>
        <div className="space-y-6 text-zinc-400">
          <section>
            <h2 className="mb-3 text-2xl text-white">Angaben gemäß § 5 DDG</h2>
            <LegalContact operator={impressum} />
          </section>
          {impressum?.registerDetails && (
            <section>
              <h2 className="mb-3 text-2xl text-white">Registereintrag</h2>
              <p className="whitespace-pre-line">{impressum.registerDetails}</p>
            </section>
          )}
          {impressum?.vatId && <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {impressum.vatId}</p>}
          {impressum?.businessId && <p>Wirtschafts-Identifikationsnummer gemäß § 139c AO: {impressum.businessId}</p>}
          {impressum?.editorialResponsible && (
            <section>
              <h2 className="mb-3 text-2xl text-white">Verantwortlich nach § 18 Abs. 2 MStV</h2>
              <p className="whitespace-pre-line">{impressum.editorialResponsible}</p>
            </section>
          )}
          {impressum?.disputeResolution && (
            <section>
              <h2 className="mb-3 text-2xl text-white">Verbraucherstreitbeilegung</h2>
              <p className="whitespace-pre-line">{impressum.disputeResolution}</p>
            </section>
          )}
          {impressum?.additionalLegalDetails && (
            <p className="whitespace-pre-line">{impressum.additionalLegalDetails}</p>
          )}
          <p>
            <Link href="/datenschutz" className="text-accent-text underline">
              Datenschutzerklärung und Datenschutzeinstellungen
            </Link>
          </p>
          <p>
            <Link href="/" className="text-accent-text hover:text-rose-300">
              ← Zurück zur Startseite
            </Link>
          </p>
        </div>
      </section>
    </BackgroundSurface>
  );
}
