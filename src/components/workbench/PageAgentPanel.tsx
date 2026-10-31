import type { SimulationSource } from '../../lib/workbench-simulation';

export function PageAgentPanel({ sourcePreview }: { sourcePreview: SimulationSource | null }) {
  return (
    <details className="workbench-sim-agent">
      <summary>
        <span className="workbench-sim-kicker">ASSISTANCE</span>
        <strong id="page-agent-title">Page Agent · unavailable</strong>
      </summary>
      <div aria-labelledby="page-agent-title" className="workbench-sim-agent-body">
        <p className="workbench-sim-agent-status">Protected model access is not configured.</p>
        <p>Continue with the manual plan in this dossier. No source data is sent to a model.</p>
        {sourcePreview && (
          <dl>
            <div><dt>Selected need</dt><dd>{sourcePreview.assetName}</dd></div>
            <div><dt>Need statement</dt><dd>{sourcePreview.need}</dd></div>
            <div><dt>Console estimate</dt><dd>{sourcePreview.assetBuildCost === null ? 'Not supplied' : `KES ${sourcePreview.assetBuildCost}`}</dd></div>
          </dl>
        )}
      </div>
    </details>
  );
}
