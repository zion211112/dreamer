import { useEffect, useMemo, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { WORK_OPPORTUNITIES } from '../../lib/local-workbench';
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
import {
  expressLocalWorkInterest,
  readLocalWorkInterests,
  removeLocalWorkInterest,
  type LocalWorkInterest,
} from '../../lib/workbench-interest';
import { WorkbenchOpportunityBrowser, type WorkbenchFinderView } from '../../components/workbench/WorkbenchOpportunityBrowser';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';

interface ProposalWorkBrief {
  proposal: CommonsProposal;
  signal: FieldSignal;
  draft: WorkBriefDraft;
  saved: boolean;
}

export function WorkbenchFinder() {
  const [view, setView] = useState<WorkbenchFinderView>('find');
  const [interests, setInterests] = useState<LocalWorkInterest[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(
    WORK_OPPORTUNITIES[0]?.id ?? null,
  );
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [proposalBrief, setProposalBrief] = useState<ProposalWorkBrief | null>(null);
  const [proposalError, setProposalError] = useState('');
  const proposalId = new URLSearchParams(window.location.search).get('proposal');

  useEffect(() => {
    try {
      setInterests(readLocalWorkInterests());
    } catch (loadError) {
      setError(loadError instanceof Error
        ? loadError.message
        : 'Saved local interest could not be read. Check browser storage and reload.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!proposalId) return;
    try {
      const proposal = readCommonsGovernance().proposals.find(item => item.id === proposalId);
      if (!proposal || proposal.status !== 'approved' || !proposal.sourceSignalId) {
        throw new Error('This approved proposal is no longer available. Return to Commons and review its current status.');
      }
      const signal = readFieldSignals().find(item => item.id === proposal.sourceSignalId);
      if (!signal || signal.institutionId !== proposal.institutionId) {
        throw new Error('The proposal source could not be matched to its institution. No work brief was opened.');
      }
      const savedDraft = readWorkBriefDrafts().find(item => item.sourceProposalId === proposal.id);
      if (savedDraft && savedDraft.sourceSignalId !== signal.id) {
        throw new Error('The saved work brief points to a different signal. Review the records before continuing.');
      }
      const draft = savedDraft ?? {
        ...createWorkBrief(signal),
        sourceProposalId: proposal.id,
        title: proposal.title,
        fieldNotes: `Proposal rationale: ${proposal.rationale}\nRule or mandate: ${proposal.rule}`,
      };
      setProposalBrief({ proposal, signal, draft, saved: !!savedDraft });
    } catch (loadError) {
      setProposalError(loadError instanceof Error
        ? loadError.message
        : 'The approved proposal could not be opened from this browser.');
    }
  }, [proposalId]);

  const matchingOpportunities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return WORK_OPPORTUNITIES;
    return WORK_OPPORTUNITIES.filter(opportunity => (
      `${opportunity.title} ${opportunity.context} ${opportunity.discipline}`
        .toLocaleLowerCase()
        .includes(normalized)
    ));
  }, [query]);

  function changeView(nextView: WorkbenchFinderView) {
    setView(nextView);
    setMobileDetailOpen(false);
    setError('');
    setNotice('');
    if (nextView === 'interest') {
      setSelectedOpportunityId(interests[0]?.opportunityId ?? null);
    } else {
      setSelectedOpportunityId(matchingOpportunities[0]?.id ?? null);
    }
  }

  function search(queryValue: string) {
    setQuery(queryValue);
    const normalized = queryValue.trim().toLocaleLowerCase();
    const matching = WORK_OPPORTUNITIES.filter(opportunity => (
      !normalized
      || `${opportunity.title} ${opportunity.context} ${opportunity.discipline}`
        .toLocaleLowerCase()
        .includes(normalized)
    ));
    setSelectedOpportunityId(matching[0]?.id ?? null);
    setMobileDetailOpen(false);
  }

  function selectOpportunity(opportunityId: string) {
    setSelectedOpportunityId(opportunityId);
    setMobileDetailOpen(true);
  }

  function expressInterest(opportunityId: string) {
    setError('');
    setNotice('');
    try {
      const saved = expressLocalWorkInterest(opportunityId);
      setInterests(saved);
      setNotice('Interest saved.');
    } catch (saveError) {
      setError(saveError instanceof Error
        ? saveError.message
        : 'Local interest could not be saved. Check browser storage and try again.');
    }
  }

  function removeInterest(opportunityId: string) {
    setError('');
    setNotice('');
    try {
      const remaining = removeLocalWorkInterest(opportunityId);
      setInterests(remaining);
      if (view === 'interest' && selectedOpportunityId === opportunityId) {
        setSelectedOpportunityId(remaining[0]?.opportunityId ?? null);
        setMobileDetailOpen(false);
      }
      setNotice('Interest removed.');
    } catch (removeError) {
      setError(removeError instanceof Error
        ? removeError.message
        : 'Local interest could not be removed. Check browser storage and try again.');
    }
  }

  function saveProposalBrief(event: Event) {
    event.preventDefault();
    if (!proposalBrief) return;
    const form = event.currentTarget as HTMLFormElement;
    const values = new FormData(form);
    const title = String(values.get('brief-title') ?? '').trim();
    const scope = String(values.get('brief-scope') ?? '').trim();
    const compensationType = String(values.get('compensation-type') ?? '') as WorkBriefDraft['compensationType'];
    const draft: WorkBriefDraft = {
      ...proposalBrief.draft,
      title,
      scope,
      acceptanceCriteria: String(values.get('acceptance-criteria') ?? '').trim(),
      compensationType,
      compensationAmount: String(values.get('compensation-amount') ?? '').trim(),
      compensationCurrency: String(values.get('compensation-currency') ?? '').trim().toUpperCase(),
      paymentTrigger: String(values.get('payment-trigger') ?? '').trim(),
      rightsTerms: String(values.get('rights-terms') ?? '').trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const existing = readWorkBriefDrafts();
      writeWorkBriefDrafts([
        draft,
        ...existing.filter(item => item.id !== draft.id && item.sourceProposalId !== proposalBrief.proposal.id),
      ]);
      setProposalBrief({ ...proposalBrief, draft, saved: true });
      setError('');
      setNotice('Work brief saved in this browser.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The work brief could not be saved.');
    }
  }

  return (
    <WorkspaceLayout currentContext="workbench">
      <div className="workbench-finder-page">
        <PageHead
          eyebrow="WORKBENCH / BROWSER-LOCAL EXAMPLES"
          title={proposalId ? 'Prepare the work' : 'Find work'}
          subtitle={proposalId
            ? 'Turn an approved proposal into a scoped local draft.'
            : 'Explore work contexts and signal interest without committing to work.'}
        />
        {loading && <p className="workbench-finder-loading" role="status">Loading local interest…</p>}
        {!loading && (
          proposalId ? (
            proposalBrief ? (
              <section aria-labelledby="proposal-brief-title" className="workbench-proposal-brief">
                <Link
                  className="workbench-proposal-back"
                  href={`/workspace/commons?institution=${encodeURIComponent(proposalBrief.signal.institutionId)}&signal=${encodeURIComponent(proposalBrief.signal.id)}`}
                >
                  Back to source signal
                </Link>
                <div className="workbench-proposal-source">
                  <div>
                    <p className="eyebrow">APPROVED PROPOSAL · {proposalBrief.proposal.institutionName}</p>
                    <h2 id="proposal-brief-title">{proposalBrief.proposal.title}</h2>
                    <p>{proposalBrief.signal.title} · {proposalBrief.signal.location || 'Location not specified'}</p>
                  </div>
                  <span className="workbench-proposal-state">Drafting</span>
                </div>
                <p className="workbench-proposal-boundary">
                  Local draft only. Proposal approval does not authorize, fund, or start work.
                </p>
                {error && <p className="workbench-finder-feedback is-error" role="alert">{error}</p>}
                {notice && <p className="workbench-finder-feedback" role="status">{notice}</p>}
                <form className="workbench-proposal-form" onSubmit={saveProposalBrief}>
                  <label className="workbench-proposal-wide">Brief title
                    <input defaultValue={proposalBrief.draft.title} maxLength={120} minLength={5} name="brief-title" required />
                  </label>
                  <label className="workbench-proposal-wide">Scope and intended deliverables
                    <textarea defaultValue={proposalBrief.draft.scope} maxLength={2400} minLength={12} name="brief-scope" required rows={4} />
                  </label>
                  <label>Acceptance criteria
                    <textarea defaultValue={proposalBrief.draft.acceptanceCriteria ?? ''} maxLength={1200} name="acceptance-criteria" placeholder="What will the institution inspect?" rows={3} />
                  </label>
                  <label>Compensation status
                    <select defaultValue={proposalBrief.draft.compensationType ?? ''} name="compensation-type">
                      <option value="">Not agreed</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </label>
                  <label>Amount
                    <input defaultValue={proposalBrief.draft.compensationAmount ?? ''} inputMode="decimal" name="compensation-amount" placeholder="Not set" />
                  </label>
                  <label>Currency
                    <input autoCapitalize="characters" defaultValue={proposalBrief.draft.compensationCurrency ?? ''} maxLength={3} name="compensation-currency" placeholder="KES" />
                  </label>
                  <label>Payment trigger
                    <input defaultValue={proposalBrief.draft.paymentTrigger ?? ''} name="payment-trigger" placeholder="For example, after accepted delivery" />
                  </label>
                  <label className="workbench-proposal-wide">Rights and reuse
                    <textarea defaultValue={proposalBrief.draft.rightsTerms ?? ''} maxLength={1200} name="rights-terms" placeholder="Who may use or maintain the deliverables?" rows={2} />
                  </label>
                  <div className="workbench-proposal-actions workbench-proposal-wide">
                    <button className="workbench-proposal-save" type="submit">
                      {proposalBrief.saved ? 'Update work brief' : 'Save work brief'}
                    </button>
                    {proposalBrief.saved && proposalBrief.signal.sourceConsoleDraftId && (
                      <Link
                        className="workbench-finder-simulation-link"
                        href={`/workspace/workbench/simulate?sourceConsoleDraftId=${encodeURIComponent(proposalBrief.signal.sourceConsoleDraftId)}&signal=${encodeURIComponent(proposalBrief.signal.id)}`}
                      >
                        Continue to school simulation
                      </Link>
                    )}
                  </div>
                </form>
                {proposalBrief.saved && !proposalBrief.signal.sourceConsoleDraftId && (
                  <p className="workbench-proposal-note" role="status">
                    This signal has no linked School Console draft, so it cannot enter the school-specific simulation.
                  </p>
                )}
              </section>
            ) : (
              <p className="workbench-finder-feedback is-error" role={proposalError ? 'alert' : 'status'}>
                {proposalError || 'Opening the approved proposal…'}
              </p>
            )
          ) : (
            <WorkbenchOpportunityBrowser
              error={error}
              interests={interests}
              mobileDetailOpen={mobileDetailOpen}
              notice={notice}
              onBackToList={() => setMobileDetailOpen(false)}
              onExpressInterest={expressInterest}
              onRemoveInterest={removeInterest}
              onSearchChange={search}
              onSelectOpportunity={selectOpportunity}
              onViewChange={changeView}
              opportunities={WORK_OPPORTUNITIES}
              query={query}
              selectedOpportunityId={selectedOpportunityId}
              view={view}
            />
          )
        )}
      </div>
    </WorkspaceLayout>
  );
}
