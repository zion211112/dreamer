import { RollDirectory } from '../../components/RollDirectory';
import { WorkspaceLayout } from './WorkspaceLayout';

export function Roll() {
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
              alert(`Verifying hash anchor for: ${entry.title}\n\nHash: ${entry.hash_anchor}\n\nIn production, this would call verifyHashAnchor(canonicalJson, hash)`);
            } else if (action === 'export') {
              alert(`Exporting Roll entry: ${entry.title}\n\nThis would generate a PDF/JSON export with all evidence layers.`);
            } else if (action === 'blueprint') {
              alert(`Generating blueprint from: ${entry.title}\n\nThis would create a reusable capability blueprint from the completed undertaking.`);
            }
          }}
        />
      </main>
    </WorkspaceLayout>
  );
}