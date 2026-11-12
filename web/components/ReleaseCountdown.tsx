'use client';

import { useEffect, useState } from 'react';
import { releaseStartTimestamp } from '@/lib/releases';

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getRemaining(target: number): Remaining | null {
  const diff = target - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

export default function ReleaseCountdown({ releaseDate }: { releaseDate: string }) {
  const target = releaseStartTimestamp(releaseDate);
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    function update() {
      setRemaining(getRemaining(target));
      setMounted(true);
    }
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  if (!Number.isFinite(target)) return null;
  if (mounted && !remaining) {
    return <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-accent-text">Out now</p>;
  }

  const units = [
    ['Days', remaining?.days],
    ['Hours', remaining?.hours],
    ['Minutes', remaining?.minutes],
    ['Seconds', remaining?.seconds],
  ] as const;

  return (
    <div className="mt-6" role="timer" aria-label="Time until release">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Release countdown</p>
      <div className="flex gap-3" aria-hidden="true">
        {units.map(([label, value]) => (
          <div key={label} className="min-w-16 rounded-sm border border-white/10 bg-black/30 px-3 py-2 text-center">
            <span className="block font-display text-2xl font-semibold text-white">
              {value === undefined ? '--' : String(value).padStart(2, '0')}
            </span>
            <span className="text-[0.65rem] uppercase tracking-widest text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
