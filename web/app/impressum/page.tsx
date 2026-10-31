import type { Metadata } from 'next';
import Link from 'next/link';
import { getImpressum } from '@/lib/sanity';

export const metadata: Metadata = {
  title: 'Impressum',
};

export default async function ImpressumPage() {
  const impressum = await getImpressum();

  return (
    <section lang="de" className="mx-auto max-w-3xl px-4 py-24">
      <h1 className="mb-8 text-4xl font-display text-white">Impressum</h1>
      <div className="space-y-6 text-zinc-400">
        {impressum ? (
          <>
            <p>
              {impressum.legalNotice || 'Angaben gemäß § 5 DDG'}
              <br />
              {impressum.operatorName}
              <br />
              {impressum.operatorAddress}
            </p>
            <p>
              {impressum.representedBy && (
                <>
                  Vertreten durch: {impressum.representedBy}
                  <br />
                </>
              )}
              E-Mail:{' '}
              <a href={`mailto:${impressum.email}`} className="text-accent hover:text-rose-300">
                {impressum.email}
              </a>
            </p>
            {impressum.phone && <p>Telefon: {impressum.phone}</p>}
          </>
        ) : (
          <p>Das Impressum ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.</p>
        )}
        <p>
          <Link href="/" className="text-accent hover:text-rose-300">
            ← Zurück zur Startseite
          </Link>
        </p>
      </div>
    </section>
  );
}
