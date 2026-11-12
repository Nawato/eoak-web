import type { ReleaseCredits as Credits, ReleaseTrack } from '@/lib/sanity';

export function ReleaseTracklist({ tracks }: { tracks: ReleaseTrack[] }) {
  const visible = tracks.filter((track) => track.title?.trim());
  if (visible.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-2xl font-semibold uppercase text-white">Tracklist</h2>
      <ol className="divide-y divide-white/10 border-y border-white/10">
        {visible.map((track, index) => (
          <li key={track._key ?? `${index}-${track.title}`} className="py-4">
            <div className="flex items-baseline gap-3">
              <span className="w-6 shrink-0 text-xs text-muted">{index + 1}</span>
              <span className="flex-1 text-foreground">{track.title}</span>
              {track.duration && <span className="text-sm text-muted">{track.duration}</span>}
            </div>
            {track.lyrics && (
              <details className="ml-9 mt-2 text-sm text-zinc-400">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-accent-text">
                  Lyrics
                </summary>
                <p className="mt-2 whitespace-pre-line">{track.lyrics}</p>
              </details>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ReleaseCredits({ credits }: { credits?: Credits | null }) {
  if (!credits) return null;
  const entries: { label: string; value: string }[] = [
    { label: 'Produced by', value: credits.producer ?? '' },
    { label: 'Mixed by', value: credits.mixing ?? '' },
    { label: 'Mastered by', value: credits.mastering ?? '' },
    { label: 'Artwork', value: credits.artwork ?? '' },
    { label: 'Label', value: credits.label ?? '' },
    { label: 'Catalog no.', value: credits.catalogNumber ?? '' },
    ...(credits.additional ?? []).map((entry) => ({
      label: entry.role ?? '',
      value: entry.name ?? '',
    })),
  ].filter((entry) => entry.label.trim() && entry.value.trim());

  if (entries.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-2xl font-semibold uppercase text-white">Credits</h2>
      <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        {entries.map((entry, index) => (
          <div key={`${entry.label}-${index}`} className="flex gap-2">
            <dt className="text-muted">{entry.label}</dt>
            <dd className="text-foreground">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
