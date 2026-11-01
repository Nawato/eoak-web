import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-accent-text">404</p>
      <h1 className="mb-6 text-4xl font-bold uppercase text-white">Page not found</h1>
      <p className="mb-10 text-zinc-400">The page you are looking for does not exist.</p>
      <Link href="/" className="rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark">
        Back to homepage
      </Link>
    </section>
  );
}
