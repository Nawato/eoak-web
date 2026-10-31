import ContactForm from '@/components/ContactForm';

interface ContactSectionProps {
  contactEmail: string;
}

export default function ContactSection({ contactEmail }: ContactSectionProps) {
  return (
    <section id="contact" className="scroll-mt-20 border-t border-white/5 bg-black/40 py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <h2 className="mb-6 text-center font-display text-4xl font-bold uppercase text-white">
          Contact
        </h2>
        <p className="mb-12 text-center text-zinc-400">
          Booking inquiries, press requests and management matters.
        </p>

        <a
          href={`mailto:${contactEmail}`}
          className="block rounded-sm border border-white/10 bg-surface p-6 text-center transition-colors hover:border-accent"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            Booking &amp; Management
          </p>
          <p className="break-all text-sm text-muted">{contactEmail}</p>
        </a>

        <ContactForm />
      </div>
    </section>
  );
}
