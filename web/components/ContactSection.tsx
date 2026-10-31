import ContactForm from '@/components/ContactForm';

interface ContactSectionProps {
  bookingEmail?: string | null;
  managementEmail?: string | null;
}

export default function ContactSection({ bookingEmail, managementEmail }: ContactSectionProps) {
  return (
    <section id="contact" className="scroll-mt-20 border-t border-white/5 bg-black/40 py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <h2 className="mb-6 text-center font-display text-4xl font-bold uppercase text-white">
          Contact
        </h2>
        <p className="mb-12 text-center text-zinc-400">
          Booking inquiries, press requests and management matters.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {bookingEmail && (
            <a
              href={`mailto:${bookingEmail}`}
              className="rounded-sm border border-white/10 bg-surface p-6 text-center transition-colors hover:border-accent"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                Booking
              </p>
              <p className="text-sm text-muted">{bookingEmail}</p>
            </a>
          )}
          {managementEmail && (
            <a
              href={`mailto:${managementEmail}`}
              className="rounded-sm border border-white/10 bg-surface p-6 text-center transition-colors hover:border-accent"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                Management
              </p>
              <p className="text-sm text-muted">{managementEmail}</p>
            </a>
          )}
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
