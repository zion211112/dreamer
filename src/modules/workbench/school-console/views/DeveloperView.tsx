// Developer tools: API hooks, tender webhooks, capability coordination,
// data export/import, storage inspection. Local-only, no external calls.
import { useState } from 'preact/hooks';
import type { ConsoleSnapshot } from '../../../../lib/school-console-storage';
import { createConsoleSignalLink, createWorkbenchSimulationLink } from '../../../../lib/local-workflows';

interface DeveloperViewProps {
  snapshot: ConsoleSnapshot;
  canWrite: boolean;
  persist: (snapshot: ConsoleSnapshot, confirmation: string) => Promise<boolean>;
}

export function DeveloperView({
  snapshot,
  canWrite,
  persist,
}: DeveloperViewProps) {
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [tenderHook, setTenderHook] = useState('');
  const [exportReady, setExportReady] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [importResult, setImportResult] = useState('');

  function exportSnapshot() {
    const json = JSON.stringify(snapshot, null, 2);
    setExportJson(json);
    setExportReady(true);
  }

  function downloadExport() {
    if (!exportJson) return;
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'school-console-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importSnapshot(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Invalid export file.');
      }
      if (await persist(parsed as ConsoleSnapshot, 'Developer import applied.')) {
        setImportResult('Import applied locally.');
      }
    } catch (error) {
      setImportResult(error instanceof Error ? error.message : 'Import failed.');
    }
  }

  return (
    <section className="sc-module" aria-labelledby="sc-dev-title">
      <div className="sc-module-head">
        <div>
          <h2 className="sc-title" id="sc-dev-title">Developer Tools</h2>
          <p className="sc-description">
            API hooks · tender webhooks · capability coordination · data export
          </p>
        </div>
      </div>

      <p className="sc-state-line">
        Local-only configuration · nothing is sent to an external service
      </p>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Integration hooks</h3>
          </div>
          <span className="sc-data-note">Configure endpoints</span>
        </div>

        <div className="sc-form">
          <label className="sc-field sc-field-wide" htmlFor="sc-api-endpoint">
            API endpoint
            <input
              id="sc-api-endpoint"
              value={apiEndpoint}
              onChange={(event) => setApiEndpoint((event.target as HTMLInputElement).value)}
              disabled={!canWrite}
              placeholder="https://api.example.edu/console"
            />
            <small className="sc-field-note">Endpoint for Console → Commons signal link.</small>
          </label>

          <label className="sc-field sc-field-wide" htmlFor="sc-webhook-url">
            Tender webhook URL
            <input
              id="sc-webhook-url"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl((event.target as HTMLInputElement).value)}
              disabled={!canWrite}
              placeholder="https://hooks.example.edu/tenders"
            />
            <small className="sc-field-note">Receives tender draft events from this Console.</small>
          </label>

          <label className="sc-field sc-field-wide" htmlFor="sc-tender-hook">
            Tender hook name
            <input
              id="sc-tender-hook"
              value={tenderHook}
              onChange={(event) => setTenderHook((event.target as HTMLInputElement).value)}
              disabled={!canWrite}
              placeholder="e.g. school-tender-v1"
            />
            <small className="sc-field-note">Identifier for Workbench simulation handoff.</small>
          </label>

          <div className="sc-actions">
            <button
              className="sc-button sc-button-primary"
              disabled={!canWrite}
              onClick={() => {
                // Hook configuration is stored in memory for this session only.
              }}
              type="button"
            >
              Save hook config
            </button>
            <span className="sc-form-disclosure">Session only · not persisted</span>
          </div>
        </div>
      </div>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Data export</h3>
          </div>
          <span className="sc-data-note">Console snapshot only</span>
        </div>

        <div className="sc-form">
          <div className="sc-actions">
            <button className="sc-button sc-button-primary" onClick={exportSnapshot} type="button">
              Export snapshot
            </button>
            {exportReady && (
              <button
                className="sc-button"
                disabled={!exportJson}
                onClick={downloadExport}
                type="button"
              >
                Download JSON
              </button>
            )}
          </div>
          <label className="sc-field sc-field-wide">
            Import snapshot
            <input
              accept=".json,application/json"
              onChange={importSnapshot}
              type="file"
            />
          </label>
        </div>
      </div>

      {importResult && (
        <p className={`sc-state-line${importResult.startsWith('Import') ? '' : ' is-error'}`} role="status">
          {importResult}
        </p>
      )}

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Storage</h3>
          </div>
          <span className="sc-data-note">Browser-local IndexedDB</span>
        </div>

        <div className="sc-form">
          <div className="sc-meta-list">
            <div className="sc-meta-row">
              <span className="sc-meta-key">Database</span>
              <span className="sc-meta-value">apt-labs-school-console</span>
            </div>
            <div className="sc-meta-row">
              <span className="sc-meta-key">Store</span>
              <span className="sc-meta-value">local-work</span>
            </div>
            <div className="sc-meta-row">
              <span className="sc-meta-key">Key</span>
              <span className="sc-meta-value">school-console-v1</span>
            </div>
            <div className="sc-meta-row">
              <span className="sc-meta-key">Marked papers</span>
              <span className="sc-meta-value">{snapshot.markedPapers.length}</span>
            </div>
            <div className="sc-meta-row">
              <span className="sc-meta-key">Tender drafts</span>
              <span className="sc-meta-value">{snapshot.tenderDrafts.length}</span>
            </div>
            <div className="sc-meta-row">
              <span className="sc-meta-key">Fee notes</span>
              <span className="sc-meta-value">{snapshot.feeNotes.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Cross-use links</h3>
          </div>
          <span className="sc-data-note">Handoff to Commons and Workbench</span>
        </div>

        <div className="sc-link-list">
          {snapshot.tenderDrafts.map((draft) => (
            <div className="sc-link-row" key={draft.id}>
              <div>
                <strong>{draft.assetName}</strong>
                <small>{new Date(draft.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="sc-link-actions">
                <a
                  className="sc-review-commons"
                  href={createConsoleSignalLink(draft.id)}
                  target="_blank"
                  rel="noopener"
                >
                  Commons signal
                </a>
                <a
                  className="sc-review-commons"
                  href={createWorkbenchSimulationLink(draft.id)}
                  target="_blank"
                  rel="noopener"
                >
                  Workbench simulation
                </a>
              </div>
            </div>
          ))}
          {snapshot.tenderDrafts.length === 0 && (
            <p className="sc-empty-state">No tender drafts to link.</p>
          )}
        </div>
      </div>
    </section>
  );
}
