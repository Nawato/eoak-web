'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { sendContactEmail } from '@/app/actions/sendEmail';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className }: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Not using <form action>, because React would reset the fields even when sending fails.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const res = await sendContactEmail(formData);
      setResult(res);
      if (res.success) formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={cn('mt-12 space-y-6', className)}>
      <div>
        <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          className="w-full rounded-sm border border-white/10 bg-zinc-800 px-4 py-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          className="w-full rounded-sm border border-white/10 bg-zinc-800 px-4 py-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          rows={6}
          className="w-full rounded-sm border border-white/10 bg-zinc-800 px-4 py-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors focus:border-accent"
        />
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Sending…' : 'Send Message'}
      </button>

      {result && !result.success && (
        <p role="alert" className="rounded-sm border border-accent/50 bg-accent/10 p-4 text-center text-sm text-accent">
          {result.error}
        </p>
      )}

      {result?.success && (
        <p role="status" className="rounded-sm border border-emerald-500/50 bg-emerald-500/10 p-4 text-center text-sm text-emerald-400">
          Your message has been sent. We will get back to you soon.
        </p>
      )}
    </form>
  );
}
