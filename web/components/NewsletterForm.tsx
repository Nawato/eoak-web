'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

interface NewsletterFormProps {
  buttonLabel: string;
  successMessage: string;
}

export default function NewsletterForm({ buttonLabel, successMessage }: NewsletterFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await subscribeToNewsletter(formData);
        setResult(res);
        if (res.success) formRef.current?.reset();
      } catch (error) {
        console.error('Newsletter request failed:', error instanceof Error ? error.name : 'unknown error');
        setResult({ success: false, error: 'The subscription could not be sent. Please try again later.' });
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl space-y-5">
      <div>
        <label htmlFor="newsletter-email" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="w-full rounded-sm border border-white/10 bg-zinc-800 px-4 py-3 text-foreground transition-colors focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </div>

      <div className="flex items-start gap-3 text-left text-sm text-zinc-400">
        <input
          id="newsletter-consent"
          name="privacyConsent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded-sm border-white/20 bg-zinc-800 accent-accent"
        />
        <label htmlFor="newsletter-consent">
          I agree that my email address may be used to send the newsletter. I can unsubscribe at any time.
        </label>
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="newsletter-website">Leave this field empty</label>
        <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Submitting…' : buttonLabel}
      </button>

      {result && !result.success && (
        <p role="alert" className="rounded-sm border border-accent/50 bg-accent/10 p-4 text-center text-sm text-accent-text">
          {result.error}
        </p>
      )}

      {result?.success && (
        <p role="status" className="rounded-sm border border-emerald-500/50 bg-emerald-500/10 p-4 text-center text-sm text-emerald-400">
          {successMessage}
        </p>
      )}
    </form>
  );
}
