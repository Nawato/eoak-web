import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Datenschutz',
};

export default function DatenschutzPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24">
      <h1 className="mb-8 text-4xl font-display text-white">Datenschutz</h1>
      <div className="space-y-6 text-zinc-400">
        <p>
          Your data is handled in accordance with the German BDSG and the EU GDPR. When you submit the
          contact form we store and process your name, email address and message in order to answer
          your inquiry.
        </p>
        <p>
          You can request deletion of your data at any time by writing to our management via the
          contact form.
        </p>
        <p>
          <Link href="/" className="text-accent hover:text-accent-dark">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </section>
  );
}
