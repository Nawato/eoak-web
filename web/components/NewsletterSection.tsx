import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
import { toHttpsUrl } from '@/lib/embeds';

interface NewsletterSectionProps {
  native: boolean;
  signupUrl?: string | null;
  heading?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
  successMessage?: string | null;
  privacyNote?: string | null;
}

export default function NewsletterSection({
  native,
  signupUrl,
  heading,
  description,
  buttonLabel,
  successMessage,
  privacyNote,
}: NewsletterSectionProps) {
  const externalUrl = native ? null : toHttpsUrl(signupUrl);
  if (!native && !externalUrl) return null;

  const label = buttonLabel?.trim() || 'Sign up';
  const privacy = privacyNote?.trim() || 'We use your email address only to send the newsletter.';

  return (
    <section id="newsletter" className="scroll-mt-20 border-t border-white/5 py-24">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
        <h2 className="mb-4 font-display text-4xl font-bold uppercase text-white">
          {heading?.trim() || 'Newsletter'}
        </h2>
        <p className="text-zinc-400">
          {description?.trim() || 'Get release news, tour dates and updates straight to your inbox.'}
        </p>

        {native ? (
          <>
            <NewsletterForm
              buttonLabel={label}
              successMessage={successMessage?.trim() || 'Please check your inbox to confirm your subscription.'}
            />
            <p className="mx-auto mt-6 max-w-xl text-xs text-muted">
              {privacy}{' '}
              <Link href="/datenschutz" className="text-accent-text underline underline-offset-2 hover:text-rose-300">
                Privacy policy
              </Link>
            </p>
          </>
        ) : (
          <div className="mt-8">
            <a
              href={externalUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
            >
              {label}
            </a>
            <p className="mx-auto mt-6 max-w-xl text-xs text-muted">
              {privacy}{' '}
              <Link href="/datenschutz" className="text-accent-text underline underline-offset-2 hover:text-rose-300">
                Privacy policy
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
