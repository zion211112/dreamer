import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import {
  createWorkBrief,
  readCommonsGovernance,
  readFieldSignals,
  readWorkBriefDrafts,
  writeWorkBriefDrafts,
  type CommonsProposal,
  type FieldSignal,
  type WorkBriefDraft,
} from '../../lib/local-workflows';

function getWorkbenchQuery(): { signalId: string | null; proposalId: string | null; assetName: string | null } {
  const params = new URLSearchParams(window.location.search);
  return { signalId: params.get('signal'), proposalId: params.get('proposal'), assetName: params.get('asset') };
}

function getApprovedProposalForDraft(draft: WorkBriefDraft, proposals: CommonsProposal[]): CommonsProposal | null {
  return proposals.find(proposal => proposal.status === 'approved'
    && (proposal.id === draft.sourceProposalId
      ? !draft.sourceSignalId || proposal.sourceSignalId === draft.sourceSignalId
      : !draft.sourceProposalId && Boolean(draft.sourceSignalId) && proposal.sourceSignalId === draft.sourceSignalId)) ?? null;
}

export function Workbench() {
  const [, navigate] = useLocation();
  const [draft, setDraft] = useState<WorkBriefDraft>(() => createWorkBrief(null));
  const [drafts, setDrafts] = useState<WorkBriefDraft[]>([]);
  const [signals, setSignals] = useState<FieldSignal[]>([]);
  const [sourceSignal, setSourceSignal] = useState<FieldSignal | null>(null);
  const [approvedProposal, setApprovedProposal] = useState<CommonsProposal | null>(null);
  const [storageError, setStorageError] = useState('');
  const [saved, setSaved] = useState(false);
  const [accessBlocked, setAccessBlocked] = useState(false);

  useEffect(() => {
    try {
      const localSignals = readFieldSignals();
      const localDrafts = readWorkBriefDrafts();
      const { signalId, proposalId, assetName } = getWorkbenchQuery();
      const localProposals = readCommonsGovernance().proposals;
      const requestedProposal = localProposals.find(item => item.id === proposalId) ?? null;
      const requestedApproval = proposalId
        ? requestedProposal?.status === 'approved' ? requestedProposal : null
        : signalId
          ? localProposals.find(item => item.sourceSignalId === signalId && item.status === 'approved') ?? null
          : null;
      const blockedLink = Boolean((proposalId || signalId)
        && (!requestedApproval || Boolean(signalId && requestedApproval.sourceSignalId !== signalId)));
      const proposal = blockedLink ? null : requestedApproval;
      const source = proposal
        ? localSignals.find(signal => signal.id === proposal.sourceSignalId) ?? null
        : null;
      const latestEligibleDraft = localDrafts.find(item => (
        !item.sourceSignalId && !item.sourceProposalId
      ) || Boolean(getApprovedProposalForDraft(item, localProposals))) ?? null;
      const existing = proposal
        ? localDrafts.find(item => item.sourceProposalId === proposal.id
          || Boolean(source && item.sourceSignalId === source.id))
        : blockedLink
          ? null
          : assetName
            ? localDrafts.find(item => item.assetName === assetName && !item.sourceSignalId && !item.sourceProposalId)
            : latestEligibleDraft;
      const proposalDraft = proposal ? {
        ...createWorkBrief(source),
        sourceProposalId: proposal.id,
        title: proposal.title,
        institutionName: proposal.institutionName,
        scope: `${proposal.rationale}\n\nRule: ${proposal.rule}`,
        acceptanceCriteria: '',
      } : null;
      const assetDraft = !proposal && assetName ? {
        ...createWorkBrief(null),
        title: `Work brief: ${assetName}`,
        assetName,
      } : null;
      setSignals(localSignals);
      setDrafts(localDrafts);
      setSourceSignal(source);
      setApprovedProposal(proposal);
      setDraft(blockedLink ? createWorkBrief(null) : existing ?? proposalDraft ?? assetDraft ?? createWorkBrief(null));
      setAccessBlocked(blockedLink);
      setSaved(Boolean(existing));
      setStorageError(blockedLink
        ? proposalId
          ? requestedProposal
            ? 'This proposal has no steward approval. It cannot seed a linked work brief.'
            : 'This proposal is not available in the local governance record.'
          : 'An approved steward decision is required before a signal can seed a work brief.'
        : '');
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Local work briefs could not be loaded.');
    }
  }, []);

  function updateDraft(field: keyof Omit<WorkBriefDraft, 'id' | 'sourceSignalId' | 'sourceProposalId' | 'updatedAt'>, value: string) {
    if (accessBlocked) return;
    setDraft(current => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveDraft() {
    if (accessBlocked) return;
    if ((draft.sourceSignalId || draft.sourceProposalId) && !approvedProposal) {
      setStorageError('An approved steward decision is required before saving a linked work brief.');
      return;
    }
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
    setApprovedProposal(null);
    setDraft(createWorkBrief(null));
    setSaved(false);
    setAccessBlocked(false);
    setStorageError('');
    navigate('/workspace/workbench');
  }

  function selectDraft(item: WorkBriefDraft) {
    try {
      const proposal = getApprovedProposalForDraft(item, readCommonsGovernance().proposals);
      if ((item.sourceSignalId || item.sourceProposalId) && !proposal) {
        setAccessBlocked(true);
        setStorageError('This saved linked draft has no approved steward decision. It remains stored but cannot be opened as work.');
        return;
      }
      setAccessBlocked(false);
      setDraft(item);
      setSourceSignal(signals.find(signal => signal.id === (item.sourceSignalId ?? proposal?.sourceSignalId)) ?? null);
      setApprovedProposal(proposal);
      setSaved(true);
      setStorageError('');
    } catch (error) {
      setAccessBlocked(false);
      setStorageError(error instanceof Error ? error.message : 'The saved brief could not be opened.');
    }
  }

  return (
    <WorkspaceLayout currentContext="workbench">
      <main className="workbench-page">
        <header className="workbench-page-head">
          <div>
            <p className="eyebrow">WORKBENCH / FIELD BRIEF</p>
            <h1>Work brief</h1>
            <p>Scope the response. Leave authorization to the institution.</p>
          </div>
          <div className="workbench-page-actions">
            <details className="workbench-draft-picker">
              <summary>Saved drafts <span>{drafts.length.toString().padStart(2, '0')}</span></summary>
              <div className="workbench-draft-list">
                {drafts.length ? drafts.map(item => (
                  <button
                    aria-current={draft.id === item.id ? 'true' : undefined}
                    key={item.id}
                    onClick={() => selectDraft(item)}
                    type="button"
                  >
                    <span>{item.title || 'Untitled brief'}</span>
                    <small>{item.sourceSignalId || item.sourceProposalId ? 'LINKED' : 'LOCAL'}</small>
                  </button>
                )) : <p>No saved briefs yet.</p>}
              </div>
            </details>
            <span className="local-only-stamp">{approvedProposal ? 'APPROVED SOURCE · DRAFT' : 'DRAFT · LOCAL'}</span>
            <button className="workbench-save-button" disabled={accessBlocked} onClick={saveDraft} type="button">Save draft</button>
            <button className="workbench-new-button" onClick={startNewDraft} type="button">＋ New brief</button>
          </div>
        </header>

        {storageError && !accessBlocked && <p className="local-data-warning" role="alert">{storageError}</p>}

        {accessBlocked ? (
          <section className="workbench-blocked" role="status">
            <p className="eyebrow">STEWARDSHIP REQUIRED</p>
            <h2>This signal is not approved for a work brief.</h2>
            <p>{storageError}</p>
            <button className="signal-secondary-action" onClick={() => navigate('/workspace/commons')} type="button">Return to Commons</button>
          </section>
        ) : (
          <section aria-label="Work brief editor" className="workbench-layout">
            <article className="workbench-document">
              <div className="workbench-document-topline">
                <p className="eyebrow">WORK BRIEF / LOCAL DRAFT</p>
                <span>DRAFT</span>
              </div>
              <label className="workbench-title-field">
                <span className="visually-hidden">Brief title</span>
                <input
                  aria-label="Brief title"
                  onInput={event => updateDraft('title', (event.currentTarget as HTMLInputElement).value)}
                  placeholder="Untitled work brief"
                  value={draft.title}
                />
              </label>
              <p className="workbench-document-intro">
                {approvedProposal
                  ? `Seeded by an approved steward decision: ${approvedProposal.title}. This remains a draft for institutional review.`
                  : 'Define the proposed response. This draft does not assign work or commit funds.'}
              </p>

              <div className="workbench-fields">
                <label>Institution
                  <input onInput={event => updateDraft('institutionName', (event.currentTarget as HTMLInputElement).value)} placeholder="Institution" value={draft.institutionName} />
                </label>
                <label>Asset
                  <input onInput={event => updateDraft('assetName', (event.currentTarget as HTMLInputElement).value)} placeholder="Equipment, site, or system" value={draft.assetName} />
                </label>
                <label>Place
                  <input onInput={event => updateDraft('location', (event.currentTarget as HTMLInputElement).value)} placeholder="Location" value={draft.location} />
                </label>
              </div>

              <label className="workbench-section-field">Problem and scope
                <textarea
                  onInput={event => updateDraft('scope', (event.currentTarget as HTMLTextAreaElement).value)}
                  placeholder="What should a qualified person inspect, measure, or repair?"
                  rows={5}
                  value={draft.scope}
                />
              </label>
              <label className="workbench-section-field">Materials and BOM candidates
                <textarea
                  onInput={event => updateDraft('materials', (event.currentTarget as HTMLTextAreaElement).value)}
                  placeholder="Item · quantity · unit · source to confirm"
                  rows={3}
                  value={draft.materials}
                />
                <small>Planning candidates only. Not a quote or procurement.</small>
              </label>
              <label className="workbench-section-field">Unknowns and risks
                <textarea
                  onInput={event => updateDraft('fieldNotes', (event.currentTarget as HTMLTextAreaElement).value)}
                  placeholder="Site facts, diagnostics, safety questions, and assumptions still to check."
                  rows={4}
                  value={draft.fieldNotes}
                />
              </label>
              <label className="workbench-section-field workbench-acceptance">Acceptance criteria
                <textarea
                  onInput={event => updateDraft('acceptanceCriteria', (event.currentTarget as HTMLTextAreaElement).value)}
                  placeholder="What observable evidence would demonstrate completion?"
                  rows={3}
                  value={draft.acceptanceCriteria ?? ''}
                />
                <small>Criteria describe evidence to review; they are not proof of completed work.</small>
              </label>
              <div className="workbench-document-footer">
                <span>{saved ? 'SAVED ON THIS DEVICE' : 'UNSAVED CHANGES'}</span>
                <span>NO WORK ORDER CREATED</span>
              </div>
            </article>

            <aside aria-label="Brief context" className="workbench-context-rail">
              <section className="workbench-context-block">
                <p className="eyebrow">COMMONS SIGNAL</p>
                {sourceSignal ? (
                  <>
                    <strong>{sourceSignal.title}</strong>
                    <span>{sourceSignal.institutionName}</span>
                    <span>{sourceSignal.assetName} · {sourceSignal.location}</span>
                    <span className="workbench-context-state">SOURCE · {sourceSignal.status.toUpperCase()}</span>
                    <button className="workbench-context-link" onClick={() => navigate(`/workspace/commons?signal=${encodeURIComponent(sourceSignal.id)}`)} type="button">Open signal ↗</button>
                  </>
                ) : (
                  <p>No Commons signal linked. This is an independent planning draft.</p>
                )}
              </section>
              <section className="workbench-context-block">
                <p className="eyebrow">STEWARD DECISION</p>
                {approvedProposal ? (
                  <>
                    <strong>{approvedProposal.title}</strong>
                    <span>{approvedProposal.rule}</span>
                    <span>Recorded by {approvedProposal.events.at(-1)?.actor ?? 'institution steward'}</span>
                    <span className="workbench-context-state">APPROVED · LOCAL RECORD</span>
                  </>
                ) : <p>No approved decision linked.</p>}
              </section>
              <section className="workbench-context-block">
                <p className="eyebrow">INSTITUTION / ASSET</p>
                <strong>{draft.assetName || 'No asset selected'}</strong>
                <span>{draft.institutionName || 'No institution selected'}</span>
                {(draft.assetName || draft.institutionName) && (
                  <button
                    className="workbench-context-link"
                    onClick={() => navigate(`/workspace/institutions?q=${encodeURIComponent(draft.assetName || draft.institutionName)}`)}
                    type="button"
                  >
                    Open record ↗
                  </button>
                )}
              </section>
              <section className="workbench-context-boundary">
                <p className="eyebrow">DRAFT BOUNDARY</p>
                <p>Saving keeps this brief local. It does not publish a call sheet, recruit a crew, or lock capital.</p>
              </section>
            </aside>
          </section>
        )}
        <p className="local-data-note">Workbench is a browser-local prototype. Drafts remain on this device and are not shared with an institution or crew.</p>
      </main>
    </WorkspaceLayout>
  );
}

export const FieldDesk = Workbench;
