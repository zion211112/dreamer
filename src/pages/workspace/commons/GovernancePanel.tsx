import { hasLocalStewardRole } from '../../../lib/local-workflows';
import type { CommonsGovernanceRecord, ProposalStatus } from '../../../lib/local-workflows';

interface CommonsGovernanceProps {
  governance: CommonsGovernanceRecord;
  isSteward: boolean;
  actorEmail: string;
  activeStewards: Array<{ email: string; institutionId: string }>;
  activeInstitutionId: string;
  activeInstitutionName: string;
  selected: { id: string; title: string; institutionId: string; institutionName: string; scenario: boolean } | null;
  showProposalForm: boolean;
  setShowProposalForm: (value: boolean) => void;
  newStewardEmail: string;
  setNewStewardEmail: (value: string) => void;
  registerInitialSteward: () => void;
  addSteward: (event: Event) => void;
  submitProposal: (event: Event) => void;
  recordDecision: (proposalId: string, status: Exclude<ProposalStatus, 'proposed'>) => void;
  decisionNotes: Record<string, string>;
  setDecisionNotes: (value: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
}

export function CommonsGovernance({
  governance,
  isSteward,
  actorEmail,
  activeStewards,
  activeInstitutionId,
  activeInstitutionName,
  selected,
  showProposalForm,
  setShowProposalForm,
  newStewardEmail,
  setNewStewardEmail,
  registerInitialSteward,
  addSteward,
  submitProposal,
  recordDecision,
  decisionNotes,
  setDecisionNotes,
}: CommonsGovernanceProps) {
  const institutionProposals = governance.proposals.filter(proposal => !activeInstitutionId || proposal.institutionId === activeInstitutionId);

  return (
    <section className="commons-governance" aria-labelledby="commons-governance-title">
      <div className="commons-governance-head">
        <div>
          <p className="eyebrow">Governance · {activeInstitutionName}</p>
          <h2 id="commons-governance-title">Decision register</h2>
        </div>
        {isSteward && selected && !selected.scenario && (
          <button
            className="signal-secondary-action"
            onClick={() => setShowProposalForm(!showProposalForm)}
            type="button"
          >
            {showProposalForm ? 'Close proposal' : 'Make proposal'}
          </button>
        )}
      </div>

      <div className="commons-authority">
        <div>
          <span className="commons-authority-label">Steward authority</span>
          <strong>{isSteward ? actorEmail : activeStewards.length ? 'Steward decision required' : 'No steward recorded'}</strong>
          {activeStewards.length > 0 && (
            <ul className="commons-steward-list">
              {activeStewards.map(steward => <li key={steward.email}>{steward.email}</li>)}
            </ul>
          )}
          <small>Authority is local to the working record and should be confirmed by the responsible institution.</small>
        </div>
        {!activeStewards.length && actorEmail && activeInstitutionId && (
          <button className="signal-secondary-action" onClick={registerInitialSteward} type="button">
            Register first steward
          </button>
        )}
        {!actorEmail && <span className="commons-authority-prompt">Sign in to record a steward role.</span>}
      </div>

      {isSteward && (
        <form className="commons-steward-form" onSubmit={addSteward}>
          <label>
            Add institution steward
            <input
              autoComplete="email"
              onInput={event => setNewStewardEmail((event.currentTarget as HTMLInputElement).value)}
              placeholder="steward@institution.org"
              required
              type="email"
              value={newStewardEmail}
            />
          </label>
          <button className="signal-quiet-action" disabled={!newStewardEmail.trim()} type="submit">Add steward</button>
        </form>
      )}

      {showProposalForm && isSteward && selected && (
        <form className="commons-proposal-form" onSubmit={submitProposal}>
          <p className="eyebrow">Proposal · linked observation</p>
          <label>Proposed action
            <input defaultValue={`Respond to: ${selected.title}`} maxLength={120} minLength={5} name="proposal-title" required />
          </label>
          <label>Rule or mandate
            <input maxLength={160} minLength={3} name="proposal-rule" placeholder="Reference the institution's authority or rule" required />
          </label>
          <label>Reason and expected outcome
            <textarea maxLength={1200} minLength={12} name="proposal-rationale" placeholder="What should happen, and how will it help?" required rows={3} />
          </label>
          <div className="commons-proposal-footer">
            <span>Only an authorized decision can open a work brief.</span>
            <button className="signal-primary-action" type="submit">Record proposal</button>
          </div>
        </form>
      )}

      <div className="commons-proposal-list">
        {institutionProposals.map(proposal => (
          <article className="commons-proposal" key={proposal.id}>
            <div className="commons-proposal-topline">
              <span className={`commons-proposal-status commons-proposal-status--${proposal.status}`}>{proposal.status}</span>
              <time dateTime={proposal.createdAt}>{proposal.createdAt}</time>
            </div>
            <h3>{proposal.title}</h3>
            <div className="commons-proposal-context">{proposal.institutionName}</div>
            <p>{proposal.rationale}</p>
            <div className="commons-proposal-rule"><span>Rule</span><strong>{proposal.rule}</strong></div>
            <ol className="commons-decision-history">
              {proposal.events.map(event => (
                <li key={event.id}>
                  <span>{event.status}</span>
                  <span>{event.actor}</span>
                  <small>{event.note}</small>
                </li>
              ))}
            </ol>
            {proposal.status === 'proposed' && hasLocalStewardRole(governance, proposal.institutionId, actorEmail) && (
              <div className="commons-decision-controls">
                <label className="visually-hidden" htmlFor={`decision-note-${proposal.id}`}>Decision reason</label>
                <input
                  id={`decision-note-${proposal.id}`}
                  maxLength={280}
                  onInput={event => setDecisionNotes(current => ({ ...current, [proposal.id]: (event.currentTarget as HTMLInputElement).value }))}
                  placeholder="Reason for the decision"
                  value={decisionNotes[proposal.id] ?? ''}
                />
                <button className="signal-primary-action" onClick={() => recordDecision(proposal.id, 'approved')} type="button">Approve</button>
                <button className="signal-secondary-action" onClick={() => recordDecision(proposal.id, 'returned')} type="button">Return</button>
                <button className="signal-quiet-action" onClick={() => recordDecision(proposal.id, 'rejected')} type="button">Reject</button>
              </div>
            )}
            {proposal.status === 'approved' && (
              <button className="signal-primary-action" type="button">
                Open approved work brief
              </button>
            )}
          </article>
        ))}
        {institutionProposals.length === 0 && (
          <p className="commons-no-proposals">No proposals for this institution. Observations stay separate until a steward proposes an action.</p>
        )}
      </div>
    </section>
  );
}
