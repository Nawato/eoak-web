import type { Metadata } from 'next';
import Link from 'next/link';
import { getImpressum } from '@/lib/sanity';

export const metadata: Metadata = {
  title: 'Impressum',
};

export default async function ImpressumPage() {
  const impressum = await getImpressum();

  const legalNotice = impressum?.legalNotice ?? 'Angaben gemäß § 5 TMG';
  const operatorName = impressum?.operatorName ?? 'End Of All Known';
  const operatorAddress = impressum?.operatorAddress ?? 'Musterstraße 1, 12345 Berlin, Germany';
  const email = impressum?.email ?? 'booking@endofallknown.de';
  const phone = impressum?.phone ?? '+49 (0) 30 000000';
  const representedBy = impressum?.representedBy ?? 'Booking & Management';

  return (
    <section className="mx-auto max-w-3xl px-4 py-24">
      <h1 className="mb-8 text-4xl font-display text-white">Impressum</h1>
      <div className="space-y-6 text-zinc-400">
        <p>
          {legalNotice}
          <br />
          {operatorName}
          <br />
          {operatorAddress}
        </p>
        <p>
          Vertreten durch: {representedBy}
          <br />
          E-Mail:{' '}
          <a href={`mailto:${email}`} className="text-accent hover:text-accent-dark">
            {email}
          </a>
        </p>
        <p>Telefon: {phone}</p>
        <p>
          <Link href="/" className="text-accent hover:text-accent-dark">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </section>
  );
}
