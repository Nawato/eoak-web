'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: '#09090b', color: '#f4f4f5', fontFamily: 'sans-serif', textAlign: 'center', padding: '8rem 1rem' }}>
        <h1>Something went wrong</h1>
        <p>The site could not be loaded. Please try again.</p>
        <button type="button" onClick={reset} style={{ padding: '0.75rem 1.5rem', background: '#e11d48', color: '#fff', border: 0 }}>
          Try again
        </button>
      </body>
    </html>
  );
}
