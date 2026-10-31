import PortableText from '@/components/PortableText';
import { toHttpsUrl } from '@/lib/embeds';
import type { PortableTextValue } from '@/sanity/types';

interface BioSectionProps {
  biography?: PortableTextValue | null;
  pressRelease?: PortableTextValue | null;
  pressKitPdfUrl?: string;
  pressKitUrl?: string | null;
  pressKitLinkLabel?: string | null;
}

export default function BioSection({
  biography,
  pressRelease,
  pressKitPdfUrl,
  pressKitUrl,
  pressKitLinkLabel,
}: BioSectionProps) {
  const externalUrl = toHttpsUrl(pressKitUrl);
  const pressKitHref = externalUrl ?? toHttpsUrl(pressKitPdfUrl);
  const buttonLabel = externalUrl
    ? pressKitLinkLabel?.trim() || 'Open Press Kit'
    : 'Download Press Kit (PDF)';

  return (
    <section id="bio" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <h2 className="mb-10 text-center font-display text-4xl font-bold uppercase text-white">
          Bio
        </h2>

        {biography && biography.length > 0 ? (
          <PortableText value={biography} />
        ) : (
          <p className="text-lg text-muted">Biography coming soon.</p>
        )}

        {pressRelease && pressRelease.length > 0 && (
          <>
            <h3 className="mt-16 mb-6 font-display text-2xl font-semibold uppercase text-white">
              Press Release
            </h3>
            <PortableText value={pressRelease} />
          </>
        )}

        {pressKitHref && (
          <a
            href={pressKitHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-block rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
          >
            {buttonLabel}
          </a>
        )}
      </div>
    </section>
  );
}
