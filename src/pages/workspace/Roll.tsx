import { useEffect, useRef, useState } from 'preact/hooks';
import { RollDirectory } from '../../components/RollDirectory';
import { WorkspaceLayout } from './WorkspaceLayout';
import type { RollEntry } from '../../lib/db/roll';
import { verifyRollEntry } from '../../lib/db/roll';
import { isDemoMode } from '../../lib/supabase/client';

function VerificationDialog({
  entry,
  onClose,
}: { entry: RollEntry; onClose: () => void }) {
  const [result, setResult] = useState<{
    valid: boolean;
    canonicalJson: string;
    computedHash: string;
    storedHash: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], summary, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setError(null);
    setVerifying(true);
    verifyRollEntry(entry)
      .then(verification => {
        if (!cancelled) setResult(verification);
      })
      .catch(verificationError => {
        if (cancelled) return;
        const message = verificationError instanceof Error
          ? verificationError.message
          : 'The hash could not be recomputed in this browser.';
        console.error('Roll hash verification failed:', verificationError);
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });
    return () => { cancelled = true; };
  }, [entry, attempt]);

  return (
    <div className="roll-modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="roll-modal roll-modal-wide"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="roll-verify-title"
        tabIndex={-1}
      >
        <header className="roll-modal-header">
          <div>
            <p className="roll-modal-eyebrow">ROLL / INTEGRITY CHECK</p>
            <h2 id="roll-verify-title">{entry.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="roll-modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close verification details"
          >
            ×
          </button>
        </header>
        <div className="roll-modal-body">
          {verifying && (
            <div className="roll-verifying" role="status" aria-live="polite">
              <svg className="roll-spinner" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              <p>Recomputing SHA-256 from the canonical fields…</p>
            </div>
          )}

          {error && (
            <div className="roll-verification-error" role="alert">
              <strong>Could not verify this record</strong>
              <p>{error}</p>
              <button className="roll-retry-button" onClick={() => setAttempt(value => value + 1)} type="button">
                Try again
              </button>
            </div>
          )}

          {result && (
            <>
              <div
                className={`roll-verification-result ${result.valid ? 'matches' : 'mismatch'}`}
                role="status"
                aria-live="polite"
              >
                <strong className="roll-verification-status">
                  {result.valid
                    ? 'Canonical fields match the stored SHA-256'
                    : 'Canonical fields do not match the stored SHA-256'}
                </strong>
                <p className="roll-verification-explanation">
                  {result.valid
                    ? 'The current canonical fields produce the stored digest. This confirms only a digest match for these fields; it does not verify the claims, identity, acceptance, or evidence.'
                    : 'The current canonical fields produce a different digest. Review the fields and stored anchor; this result does not establish when or why they diverged.'}
                </p>
              </div>

              <div className="roll-verification-comparison">
                <div className="roll-verification-field">
                  <span className="roll-verification-label">Stored hash anchor</span>
                  <code className="roll-hash-display">{result.storedHash || 'No stored hash'}</code>
                </div>
                <div className="roll-verification-field">
                  <span className="roll-verification-label">Computed SHA-256</span>
                  <code className="roll-hash-display">{result.computedHash}</code>
                </div>
              </div>

              <details className="roll-canonical-json">
                <summary>Inspect canonical JSON used for this comparison</summary>
                <pre className="roll-json-display"><code>{result.canonicalJson}</code></pre>
              </details>

              <p className="roll-verification-note">
                <strong>Committed fields:</strong> undertaking ID and type, title, scope, deliverables,
                commissioner, participants, and acceptance. <strong>Not committed:</strong> evidence
                objects/files, reusable designs, maintenance obligations, recording metadata, or version.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Roll() {
  const [verifyEntry, setVerifyEntry] = useState<RollEntry | null>(null);

  return (
    <WorkspaceLayout currentContext="records:roll">
      <section className="roll-page" aria-labelledby="roll-page-title">
        {isDemoMode && (
          <aside className="roll-demo-notice" aria-label="Demo data notice">
            <span className="roll-demo-label">Local demo</span>
            <p>Synthetic records stay in this browser; sample acceptance and visibility labels are not authoritative. This demo does not enforce access or verify evidence.</p>
          </aside>
        )}
        <header className="roll-page-header">
          <p className="roll-page-eyebrow">APT-LABS <span aria-hidden="true">/</span> ROLL</p>
          <h1 id="roll-page-title">Evidence ledger</h1>
          <p className="roll-page-intro">
            Review records and compare their canonical fields with the stored SHA-256 anchor.
          </p>
        </header>
        <RollDirectory
          onEntryAction={(entry, action) => {
            if (action === 'verify' || action === 'view') setVerifyEntry(entry);
          }}
        />
        {verifyEntry && (
          <VerificationDialog
            entry={verifyEntry}
            onClose={() => setVerifyEntry(null)}
          />
        )}
      </section>
    </WorkspaceLayout>
  );
}
