import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import {
  createWorkBrief,
  readFieldSignals,
  readWorkBriefDrafts,
  writeWorkBriefDrafts,
  type FieldSignal,
  type WorkBriefDraft,
} from '../../lib/local-workflows';

type WorkbenchFile = 'brief' | 'materials' | 'notes';

const fileNames: Record<WorkbenchFile, string> = {
  brief: 'brief.md',
  materials: 'materials.csv',
  notes: 'field-notes.md',
};

function getSignalId(location: string): string | null {
  return new URLSearchParams(location.split('?')[1] ?? '').get('signal');
}

export function Workbench() {
  const [location, navigate] = useLocation();
  const [draft, setDraft] = useState<WorkBriefDraft>(() => createWorkBrief(null));
  const [drafts, setDrafts] = useState<WorkBriefDraft[]>([]);
  const [signals, setSignals] = useState<FieldSignal[]>([]);
  const [sourceSignal, setSourceSignal] = useState<FieldSignal | null>(null);
  const [activeFile, setActiveFile] = useState<WorkbenchFile>('brief');
  const [storageError, setStorageError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const localSignals = readFieldSignals();
      const localDrafts = readWorkBriefDrafts();
      const requestedSignalId = getSignalId(location);
      const source = localSignals.find(signal => signal.id === requestedSignalId) ?? null;
      const existing = source
        ? localDrafts.find(item => item.sourceSignalId === source.id)
        : localDrafts[0];
      setSignals(localSignals);
      setDrafts(localDrafts);
      setSourceSignal(source);
      setDraft(existing ?? createWorkBrief(source));
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Local work briefs could not be loaded.');
    }
  }, []);

  function updateDraft(field: keyof Omit<WorkBriefDraft, 'id' | 'sourceSignalId' | 'updatedAt'>, value: string) {
    setDraft(current => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveDraft() {
    if (!draft.title.trim()) {
      setStorageError('Add a work brief title before saving.');
      return;
    }
    const updated = { ...draft, updatedAt: new Date().toISOString() };
    const nextDrafts = [updated, ...drafts.filter(item => item.id !== updated.id)];
    try {
      writeWorkBriefDrafts(nextDrafts);
      setDraft(updated);
      setDrafts(nextDrafts);
      setSaved(true);
      setStorageError('');
    } catch (error) {
      setSaved(false);
      setStorageError(error instanceof Error ? error.message : 'The local work brief could not be saved.');
    }
  }

  function startNewDraft() {
    setSourceSignal(null);
    setDraft(createWorkBrief(null));
    setActiveFile('brief');
    setSaved(false);
    setStorageError('');
    navigate('/workspace/workbench');
  }

  function selectDraft(item: WorkBriefDraft) {
    setDraft(item);
    setSourceSignal(signals.find(signal => signal.id === item.sourceSignalId) ?? null);
    setActiveFile('brief');
    setSaved(true);
    setStorageError('');
  }

  return (
    <WorkspaceLayout currentContext="workbench">
      <main className="workbench-page">
        <header className="workbench-page-head">
          <div>
            <p className="eyebrow">WORKBENCH / FIELD SYSTEMS</p>
            <h1>Make the work legible.</h1>
          </div>
          <div className="workbench-page-actions">
            <span className="local-only-stamp">LOCAL DRAFT</span>
            <button className="workbench-new-button" onClick={startNewDraft} type="button">＋ New brief</button>
          </div>
        </header>

        <section aria-label="Local workbench editor" className="workbench-shell">
          <aside aria-label="Workbench files" className="workbench-explorer">
            <div className="workbench-explorer-head"><span>EXPLORER</span><span>⌄</span></div>
            <div className="workbench-project-name"><span aria-hidden="true">⌄</span> FIELD WORK</div>
            <button
              aria-current={activeFile === 'brief' ? 'page' : undefined}
              className={`workbench-file${activeFile === 'brief' ? ' is-active' : ''}`}
              onClick={() => setActiveFile('brief')}
              type="button"
            ><span className="workbench-file-mark">¶</span>{fileNames.brief}</button>
            <button
              aria-current={activeFile === 'materials' ? 'page' : undefined}
              className={`workbench-file${activeFile === 'materials' ? ' is-active' : ''}`}
              onClick={() => setActiveFile('materials')}
              type="button"
            ><span className="workbench-file-mark">≡</span>{fileNames.materials}</button>
            <button
              aria-current={activeFile === 'notes' ? 'page' : undefined}
              className={`workbench-file${activeFile === 'notes' ? ' is-active' : ''}`}
              onClick={() => setActiveFile('notes')}
              type="button"
            ><span className="workbench-file-mark">∷</span>{fileNames.notes}</button>
            <div className="workbench-explorer-divider" />
            <div className="workbench-explorer-head"><span>LOCAL BRIEFS</span><span>{drafts.length.toString().padStart(2, '0')}</span></div>
            {drafts.map(item => (
              <button
                aria-current={draft.id === item.id ? 'true' : undefined}
                className={`workbench-saved-file${draft.id === item.id ? ' is-active' : ''}`}
                key={item.id}
                onClick={() => selectDraft(item)}
                type="button"
              >
                <span aria-hidden="true">◌</span>
                <span>{item.title || 'Untitled brief'}</span>
              </button>
            ))}
            {drafts.length === 0 && <p className="workbench-no-files">Saved briefs appear here.</p>}
            <a className="workbench-back-link" href="/workspace/commons">← Signal Desk</a>
          </aside>

          <section aria-label="Work brief editor" className="workbench-editor">
            <div className="workbench-tabs">
              {(Object.keys(fileNames) as WorkbenchFile[]).map(file => (
                <button
                  aria-pressed={activeFile === file}
                  className={activeFile === file ? 'is-active' : ''}
                  key={file}
                  onClick={() => setActiveFile(file)}
                  type="button"
                >
                  <span className="workbench-file-mark">{file === 'brief' ? '¶' : file === 'materials' ? '≡' : '∷'}</span>
                  {fileNames[file]}
                </button>
              ))}
              <span className="workbench-tab-status">{saved ? 'SAVED LOCALLY' : 'UNSAVED'}</span>
            </div>
            <div className="workbench-editor-breadcrumb"><span>field-work</span><span>/</span><strong>{fileNames[activeFile]}</strong></div>

            {activeFile === 'brief' && (
              <div className="workbench-document">
                <p className="workbench-document-index">WORK BRIEF / LOCAL DRAFT</p>
                <label className="workbench-title-field">
                  <span className="visually-hidden">Brief title</span>
                  <input
                    aria-label="Brief title"
                    onInput={event => updateDraft('title', (event.currentTarget as HTMLInputElement).value)}
                    placeholder="Untitled work brief"
                    value={draft.title}
                  />
                </label>
                <p className="workbench-document-intro">Define the work in observable terms. Nothing here is an approved tender or a funded call sheet.</p>
                <div className="workbench-fields">
                  <label>Institution
                    <input onInput={event => updateDraft('institutionName', (event.currentTarget as HTMLInputElement).value)} placeholder="Institution or steward" value={draft.institutionName} />
                  </label>
                  <label>Asset
                    <input onInput={event => updateDraft('assetName', (event.currentTarget as HTMLInputElement).value)} placeholder="Equipment, site, or system" value={draft.assetName} />
                  </label>
                  <label>Place
                    <input onInput={event => updateDraft('location', (event.currentTarget as HTMLInputElement).value)} placeholder="Location" value={draft.location} />
                  </label>
                </div>
                <label className="workbench-section-field">Scope to investigate
                  <textarea
                    onInput={event => updateDraft('scope', (event.currentTarget as HTMLTextAreaElement).value)}
                    placeholder="What should a qualified person inspect, measure, or repair?"
                    rows={6}
                    value={draft.scope}
                  />
                </label>
              </div>
            )}

            {activeFile === 'materials' && (
              <div className="workbench-document">
                <p className="workbench-document-index">MATERIALS / NOTES ONLY</p>
                <h2>List what may be needed.</h2>
                <p className="workbench-document-intro">A planning aid, not a quote, verified supplier, procurement, or locked budget.</p>
                <label className="workbench-section-field">Item · quantity · unit · source to confirm
                  <textarea
                    onInput={event => updateDraft('materials', (event.currentTarget as HTMLTextAreaElement).value)}
                    placeholder={'Example format:\nFilter element · 1 · unit · source to confirm'}
                    rows={12}
                    value={draft.materials}
                  />
                </label>
              </div>
            )}

            {activeFile === 'notes' && (
              <div className="workbench-document">
                <p className="workbench-document-index">FIELD NOTES / UNVERIFIED</p>
                <h2>What still needs checking?</h2>
                <p className="workbench-document-intro">No evidence upload or sensor connection in this demo. Record questions for a future site visit.</p>
                <label className="workbench-section-field">Questions and observations
                  <textarea
                    onInput={event => updateDraft('fieldNotes', (event.currentTarget as HTMLTextAreaElement).value)}
                    placeholder="What was observed? What remains uncertain? Who needs to review?"
                    rows={12}
                    value={draft.fieldNotes}
                  />
                </label>
              </div>
            )}

            <div className="workbench-statusbar">
              <span><i /> BROWSER-LOCAL</span>
              <span>{sourceSignal ? 'SOURCE: COMMONS SIGNAL' : 'NO SOURCE SIGNAL'}</span>
              <span>NOT VERIFIED</span>
            </div>
          </section>

          <aside aria-label="Work brief context" className="workbench-inspector">
            <div className="workbench-inspector-head"><span>CONTEXT</span><span>⌄</span></div>
            <section className="workbench-context-block">
              <p className="eyebrow">SOURCE SIGNAL</p>
              {sourceSignal ? (
                <>
                  <strong>{sourceSignal.title}</strong>
                  <span>{sourceSignal.institutionName}</span>
                  <span>{sourceSignal.assetName} · {sourceSignal.location}</span>
                  <span className="workbench-context-state">LOCAL · {sourceSignal.status.toUpperCase()}</span>
                </>
              ) : (
                <p className="workbench-no-source">No signal linked. Start from the Commons Signal Desk to bring an observation into a brief.</p>
              )}
              <button className="workbench-context-link" onClick={() => navigate('/workspace/commons')} type="button">Open Signal Desk ↗</button>
            </section>
            <section className="workbench-context-block">
              <p className="eyebrow">BOUNDARY</p>
              <p>Draft notes only. No assignment, quotation, tender publication, settlement, or proof of work is created here.</p>
            </section>
            <div className="workbench-save-area">
              <button className="workbench-save-button" onClick={saveDraft} type="button">Save local brief</button>
              {saved && <span role="status">Saved on this device.</span>}
              {storageError && <p role="alert">{storageError}</p>}
            </div>
          </aside>
        </section>
        <p className="local-data-note">Workbench is a browser-local prototype. Drafts remain on this device and are not shared with an institution or crew.</p>
      </main>
    </WorkspaceLayout>
  );
}

export const FieldDesk = Workbench;
