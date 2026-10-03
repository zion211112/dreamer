"use client";

// Renders in the root layout, outside the (site) group, so the site primitives
// are not otherwise loaded here.
import "./site.css";
// A runtime throw on a local-first product usually means device storage said
// no. Say that plainly instead of showing the framework's default screen.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="site-page bg-void text-ink">
      <div className="site-frame site-frame--narrow">
        <p className="site-kicker">Record interrupted</p>
        <h1 className="page-title">The write did not land.</h1>
        <p className="mt-4 max-w-[46ch] text-body leading-6 text-dust">
          Nothing was lost — this device holds its own copy of the record.
          Storage may be full or switched off. Try the write again.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="site-action">
            Try again
          </button>
          <a href="/" className="site-action-secondary">
            Back to the porch
          </a>
        </div>
      </div>
    </main>
  );
}