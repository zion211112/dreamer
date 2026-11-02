import { useState, useEffect } from 'preact/hooks';
import { RollDirectory } from '../../components/RollDirectory';
import { WorkspaceLayout } from './WorkspaceLayout';
import type { RollEntry } from '../../lib/db/roll';
import { verifyRollEntry } from '../../lib/db/roll';

function VerifyModal({
  entry,
  onClose,
}: { entry: RollEntry; onClose: () => void }) {
  const [result, setResult] = useState<{
    valid: boolean;
    canonicalJson: string;
    computedHash: string;
    storedHash: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setVerifying(true);
    verifyRollEntry(entry)
      .then(verification => {
        if (!cancelled) {
          setResult(verification);
          setVerifying(false);
        }
      })
      .catch(error => {
        if (!cancelled) {
          console.error('Verification failed:', error);
          setVerifying(false);
        }
      });
    return () => { cancelled = true; };
  }, [entry]);

  if (verifying && !result) {
    return (
      <div className="roll-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="verify-modal-title">
        <div className="roll-modal" onClick={(e) => e.stopPropagation()}>
          <header className="roll-modal-header">
            <h2 id="verify-modal-title">Verifying Hash Anchor</h2>
            <button className="roll-modal-close" onClick={onClose} type="button" aria-label="Close">×</button>
          </header>
          <div className="roll-modal-body">
            <div className="roll-verifying">
              <svg className="roll-spinner" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              <p>Recomputing hash from canonical JSON…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="roll-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="verify-modal-title">
      <div className="roll-modal roll-modal-wide" onClick={(e) => e.stopPropagation()}>
        <header className="roll-modal-header">
          <h2 id="verify-modal-title">Hash Verification: {entry.title}</h2>
          <button className="roll-modal-close" onClick={onClose} type="button" aria-label="Close">×</button>
        </header>
        <div className="roll-modal-body">
          <div className="roll-verification-result" style={{ borderLeftColor: result.valid ? 'var(--roll-sealed)' : 'var(--roll-draft)' }}>
            <div className="roll-verification-status" style={{ color: result.valid ? 'var(--roll-sealed)' : 'var(--roll-draft)' }}>
              {result.valid ? '✓ Hash Matches — Entry is Valid' : '✗ Hash Mismatch — Entry Has Been Altered'}
            </div>
            <p className="roll-verification-explanation" style={{ color: 'var(--net-ink-faint)', fontSize: 'var(--roll-text-sm)', marginTop: 'var(--roll-space-2)' }}>
              {result.valid
                ? 'The stored hash anchor matches the recomputed SHA-256 of the canonical Roll JSON. This entry has not been tampered with since recording.'
                : 'The stored hash anchor does NOT match the recomputed hash. This indicates the entry data has been modified after recording — the Roll integrity is compromised.'}
            </p>
          </div>

          <div className="roll-verification-comparison">
            <div className="roll-verification-field">
              <label>Stored Hash Anchor</label>
              <code className="roll-hash-display">{result.storedHash}</code>
            </div>
            <div className="roll-verification-field">
              <label>Computed Hash</label>
              <code className="roll-hash-display">{result.computedHash}</code>
            </div>
          </div>

          <details className="roll-canonical-json">
            <summary>Show Canonical JSON (used for hashing)</summary>
            <pre className="roll-json-display"><code>{result.canonicalJson}</code></pre>
          </details>

          <div className="roll-verification-note" style={{ fontSize: 'var(--roll-text-xs)', color: 'var(--net-ink-faint)', marginTop: 'var(--roll-space-3)' }}>
            <strong>Verification Method:</strong> SHA-256 of canonical Roll JSON via Web Crypto API.
            The canonical JSON includes: undertaking_id, undertaking_type, title, scope, deliverables,
            commissioned_by, participants, and acceptance — excluding recorded_at, recorded_by, hash_anchor, and version.
            This ensures only the immutable undertaking data is anchored.
          </div>

          <footer className="roll-modal-footer">
            <button className="secondary" onClick={onClose} type="button">Close</button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function Roll() {
  const [verifyEntry, setVerifyEntry] = useState<RollEntry | null>(null);

  return (
    <WorkspaceLayout currentContext="roll">
      <main className="roll-page" role="main">
        <header className="roll-page-header">
          <div className="roll-page-heading">
            <p className="roll-page-eyebrow">APT—LABS <span aria-hidden="true">/</span> ROLL</p>
            <h1>Immutable Evidence Ledger</h1>
            <p className="roll-page-intro">
              Every completed undertaking generates a verified Roll entry — hash-anchored,
              evidence-layered, and blueprint-ready. This is the trusted substrate that
              compounds into capability upgrades, capital legibility, and repeatable delivery.
            </p>
          </div>
        </header>
        <RollDirectory
          onEntryAction={(entry, action) => {
            console.log(`Roll entry action: ${action}`, entry);
            if (action === 'verify') {
              setVerifyEntry(entry);
            } else if (action === 'export') {
              alert(`Exporting Roll entry: ${entry.title}\n\nThis would generate a PDF/JSON export with all evidence layers.`);
            } else if (action === 'blueprint') {
              alert(`Generating blueprint from: ${entry.title}\n\nThis would create a reusable capability blueprint from the completed undertaking.`);
            }
          }}
        />
        {verifyEntry && (
          <VerifyModal entry={verifyEntry} onClose={() => setVerifyEntry(null)} />
        )}
      </main>
    </WorkspaceLayout>
  );
}