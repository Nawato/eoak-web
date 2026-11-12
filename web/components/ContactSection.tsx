import ContactForm from '@/components/ContactForm';
import { getEnabledContactChannels } from '@/lib/contact';
import type { ContactChannel } from '@/sanity/types';

interface ContactSectionProps {
  contactEmail: string;
  channels?: ContactChannel[] | null;
  showForm?: boolean;
  showChannels?: boolean;
}

export default function ContactSection({
  contactEmail,
  channels,
  showForm = true,
  showChannels = true,
}: ContactSectionProps) {
  if (!showForm && !showChannels) return null;
  const enabledChannels = getEnabledContactChannels(channels);

  return (
    <section id="contact" className="scroll-mt-20 border-t border-white/5 bg-black/40 py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <h2 className="mb-6 text-center font-display text-4xl font-bold uppercase text-white">
          Contact
        </h2>
        <p className="mb-12 text-center text-zinc-400">
          Booking inquiries, press requests and management matters.
        </p>

        {showChannels && enabledChannels.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {enabledChannels.map((channel) => (
              <li key={channel._key ?? channel.key}>
                <a
                  href={`mailto:${channel.email}`}
                  className="block h-full rounded-sm border border-white/10 bg-surface p-6 transition-colors hover:border-accent"
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-text">
                    {channel.label}
                  </p>
                  <p className="break-all text-sm text-muted">{channel.email}</p>
                  {channel.description && <p className="mt-3 text-sm text-zinc-400">{channel.description}</p>}
                </a>
              </li>
            ))}
          </ul>
        )}

        {showChannels && enabledChannels.length === 0 && (
          <a
            href={`mailto:${contactEmail}`}
            className="block rounded-sm border border-white/10 bg-surface p-6 text-center transition-colors hover:border-accent"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-text">
              Booking &amp; Management
            </p>
            <p className="break-all text-sm text-muted">{contactEmail}</p>
          </a>
        )}

        {showForm && (
          <ContactForm
            channels={
              showChannels
                ? enabledChannels.map((channel) => ({ key: channel.key, label: channel.label }))
                : []
            }
          />
        )}
      </div>
    </section>
  );
}
