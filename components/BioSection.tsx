import PortableText from '@/components/PortableText';
import type { PortableTextValue } from '@/sanity/types';

interface BioSectionProps {
  biography?: PortableTextValue | null;
  pressRelease?: PortableTextValue | null;
  pressKitPdfUrl?: string;
}

export default function BioSection({
  biography,
  pressRelease,
  pressKitPdfUrl,
}: BioSectionProps) {
  return (
    <section id="bio" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <h2 className="mb-10 text-center font-display text-4xl font-bold uppercase text-white">
          Bio
        </h2>

        {biography ? (
          <PortableText value={biography} />
        ) : (
          <p className="text-lg text-muted">Biography coming soon.</p>
        )}

        {pressRelease && (
          <>
            <h3 className="mt-16 mb-6 font-display text-2xl font-semibold uppercase text-white">
              Press Release
            </h3>
            <PortableText value={pressRelease} />
          </>
        )}

        {pressKitPdfUrl && (
          <a
            href={pressKitPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-block rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
          >
            Download Press Kit (PDF)
          </a>
        )}
      </div>
    </section>
  );
}
