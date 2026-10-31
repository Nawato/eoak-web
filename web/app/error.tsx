'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center">
      <h1 className="mb-6 text-4xl font-bold uppercase text-white">Something went wrong</h1>
      <p className="mb-10 text-zinc-400">The page could not be loaded. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
      >
        Try again
      </button>
    </section>
  );
}
