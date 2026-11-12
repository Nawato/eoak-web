'use client';

import { useState } from 'react';

export default function ShareButtons({ title }: { title: string }) {
  const [status, setStatus] = useState('');

  async function share() {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        setStatus('Shared.');
        return;
      } catch (error) {
        // AbortError means the visitor closed the share sheet; do not report a failure.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    await copy(url);
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('Link copied to the clipboard.');
    } catch {
      setStatus('Could not copy the link. Please copy it from the address bar.');
    }
  }

  return (
    <div className="mt-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Share this release</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={share}
          className="rounded-sm border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent-text"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => copy(window.location.href)}
          className="rounded-sm border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent-text"
        >
          Copy link
        </button>
      </div>
      {status && <p role="status" className="mt-2 text-sm text-muted">{status}</p>}
    </div>
  );
}
