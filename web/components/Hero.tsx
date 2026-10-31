import Link from 'next/link';

interface HeroProps {
  bandName: string;
}

export default function Hero({ bandName }: HeroProps) {
  return (
    <section id="top" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background visual with atmospheric gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-accent">
          Independent Metalcore
        </p>
        <h1 className="text-gradient mb-8 font-display text-5xl font-bold uppercase sm:text-7xl md:text-8xl">
          {bandName}
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted">
          Heavy riffs. Bleak atmospheres. Emotional breakdowns. The soundtrack of the void.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#music"
            className="rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
          >
            Latest Release
          </Link>
          <Link
            href="#shows"
            className="rounded-sm border border-white/15 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Tour Dates
          </Link>
        </div>
      </div>
    </section>
  );
}
