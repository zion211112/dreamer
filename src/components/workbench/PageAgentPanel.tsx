import { useEffect, useState } from 'preact/hooks';
import type { SimulationSource } from '../../lib/workbench-simulation';
import { agentHost, type AgentProposal } from '../../lib/agent-host';

export function PageAgentPanel({ sourcePreview }: { sourcePreview: SimulationSource | null }) {
  const [proposals, setProposals] = useState<AgentProposal[]>([]);
  const [drafting, setDrafting] = useState<{ stage: string } | null>(null);

  useEffect(() => {
    setProposals(agentHost.getProposals());
  }, []);

  function draftForStage(stage: string) {
    setDrafting({ stage });
    const proposal = agentHost.draftProposalForStage(
      { id: '', schemaVersion: 1, source: sourcePreview ?? { consoleDraftId: '', assetName: '', need: '', assetBuildCost: null }, plan: { workKind: 'physical-asset', institutionLabel: 'Demo', scope: 'Demo', packages: [], costAssumptions: null, compensationTerms: '', rightsTerms: '', safetyRequirements: '', acceptanceCriteria: [], unresolvedFacts: [] }, planSource: 'manual', status: 'active', stage: stage as any, events: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), rollPreview: null },
      null,
    );
    setProposals(agentHost.getProposals());
    setDrafting(null);
    return proposal;
  }

  return (
    <details className="workbench-sim-agent" open>
      <summary>
        <span className="workbench-sim-kicker">ASSISTANCE</span>
        <strong id="page-agent-title">Page Agent · connected</strong>
      </summary>
      <div aria-labelledby="page-agent-title" className="workbench-sim-agent-body">
        <p className="workbench-sim-agent-status">Local agent host connected — proposes, never executes.</p>
        <p>Review each draft below. A human must execute every action through the UI.</p>
        {sourcePreview && (
          <dl>
            <div><dt>Selected need</dt><dd>{sourcePreview.assetName}</dd></div>
            <div><dt>Need statement</dt><dd>{sourcePreview.need}</dd></div>
            <div><dt>Console estimate</dt><dd>{sourcePreview.assetBuildCost === null ? 'Not supplied' : `KES ${sourcePreview.assetBuildCost}`}</dd></div>
          </dl>
        )}
        <section className="workbench-sim-proposals">
          <h3>Agent proposals</h3>
          {proposals.length === 0 ? (
            <p className="workbench-sim-empty">No proposals yet. Select a stage to draft one.</p>
          ) : (
            <ul className="workbench-sim-proposal-list">
              {proposals.map(proposal => (
                <li key={proposal.id} className="workbench-sim-proposal">
                  <div className="workbench-sim-proposal-head">
                    <span className={`workbench-sim-proposal-type ${proposal.type}`}>{proposal.type}</span>
                    <span className="workbench-sim-proposal-confidence">{(proposal.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="workbench-sim-proposal-content">{proposal.content}</p>
                  <footer className="workbench-sim-proposal-foot">
                    <span className="workbench-sim-proposal-status">{proposal.status}</span>
                    <button
                      className="workbench-sim-proposal-draft"
                      disabled={proposal.status !== 'draft' || drafting?.stage === proposal.targetStage}
                      onClick={() => draftForStage(proposal.targetStage)}
                      type="button"
                    >
                      {drafting?.stage === proposal.targetStage ? 'Drafting…' : 'Draft for this stage'}
                    </button>
                  </footer>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="workbench-sim-footnote">Proposals are stored locally and never sent to an external model.</p>
      </div>
    </details>
  );
}
