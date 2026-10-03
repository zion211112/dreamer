"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary.
 *
 * The copy makes one distinction that matters in this system: a fault
 * in the interface shell is not a statement about the record. Records
 * live in the browser's storage and are not erased by a render failure,
 * so the page says exactly that instead of a generic apology.
 *
 * `digest` is surfaced rather than hidden — a report that cannot cite
 * the failing instance is itself an unevidenced claim.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The console is where the operator can read it; nothing is sent
    // anywhere. Local-first applies to faults too.
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="plane-main"
      style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px 96px" }}
    >
      <Link href="/" className="plane-wordmark">
        APT-LABS
      </Link>

      <p className="label" style={{ marginTop: 44 }}>
        Runtime error · Surface not rendered
      </p>
      <h1 className="page-title">This surface failed to render.</h1>

      <div className="prose" style={{ marginTop: 18 }}>
        <p>
          The fault is in the interface shell, not in the record. Anything
          entered on this device stays in this browser — a failed render
          neither reads, alters nor transmits it. Retrying rebuilds the
          surface from the same local record.
        </p>
      </div>

      <div className="action-row" style={{ marginTop: 28 }}>
        <button type="button" onClick={reset} className="btn">
          Retry this surface
        </button>
        <Link href="/" className="btn-ghost">
          Back to the control plane
        </Link>
        <Link href="/evidence" className="btn-ghost">
          The evidence states
        </Link>
      </div>

      <p className="register-provenance" style={{ marginTop: 26 }}>
        {error.digest ? (
          <>
            Error digest <span className="figure">{error.digest}</span> — cite
            this reference when reporting the fault.
          </>
        ) : (
          "No digest was issued for this fault; the browser console holds the local trace."
        )}
      </p>
    </main>
  );
}
