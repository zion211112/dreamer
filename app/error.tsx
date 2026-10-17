'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
      <div className="text-center p-8">
        <h1 className="text-6xl font-display font-semibold mb-4 text-[var(--danger)]">Error</h1>
        <p className="text-[var(--fg-muted)] text-lg mb-6">
          Something went wrong.
          {error.digest && <span className="font-mono text-sm ml-2">({error.digest})</span>}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}