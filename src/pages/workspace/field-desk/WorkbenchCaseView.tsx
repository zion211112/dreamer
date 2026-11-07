import { Link } from 'wouter';
import { PackageComposition } from './PackageComposition';
import { SimulationRunControls } from '../../../components/workbench/SimulationRunControls';
import { SimulationTrace } from '../../../components/workbench/SimulationTrace';
import type { FieldSignal } from '../../../lib/local-workflows';
import type { NetworkEntity } from '../../../lib/people-network';
import type { SimulationAction } from '../../../lib/workbench-simulation';
import type { WorkbenchSimulation } from '../../../lib/workbench-simulation';

function contextLabel(
  id: string | null | undefined,
  registry: Map<string, NetworkEntity>,
  typeLabel: string,
): string {
  if (!id) return 'Not linked';
  const record = registry.get(id);
  return record ? `${record.name} · reference only` : `Unresolved ${typeLabel} reference · ${id}`;
}

function signalContextLabel(id: string | undefined, signals: readonly FieldSignal[]): string {
  if (!id) return 'Not linked';
  const record = signals.find(signal => signal.id === id);
  return record ? `${record.title} · reference only` : `Unresolved observation reference · ${id}`;
}

interface WorkbenchCaseViewProps {
  simulation: WorkbenchSimulation;
  institutionsById: Map<string, NetworkEntity>;
  assetsById: Map<string, NetworkEntity>;
  signals: FieldSignal[];
  linkedSignalRecord: FieldSignal | null;
  advance: (action: SimulationAction) => void;
  discardSimulation: () => void;
  restartSimulation: () => void;
}

export function WorkbenchCaseView({
  simulation,
  institutionsById,
  assetsById,
  signals,
  linkedSignalRecord,
  advance,
  discardSimulation,
  restartSimulation,
}: WorkbenchCaseViewProps) {
  return (
    <>
      <section aria-labelledby="workbench-sim-case-title" className="workbench-sim-case">
        <div className="workbench-sim-case-head">
          <div><p className="workbench-sim-kicker">SOURCE / CONSOLE DRAFT {simulation.source.consoleDraftId}</p><h2 id="workbench-sim-case-title">{simulation.source.assetName}</h2></div>
          <span className="workbench-sim-status">{simulation.status.replace('_', ' ')}</span>
        </div>
        <p>{simulation.source.need}</p>
        <dl>
          <div><dt>Institution</dt><dd>
            {contextLabel(simulation.source.institutionId, institutionsById, 'institution')}
            {simulation.source.institutionId && institutionsById.has(simulation.source.institutionId) && (
              <Link href={`/workspace/network/institutions?record=${encodeURIComponent(simulation.source.institutionId)}#institution-record-${encodeURIComponent(simulation.source.institutionId)}`}>Open record</Link>
            )}
          </dd></div>
          <div><dt>Commons</dt><dd>
            {signalContextLabel(simulation.source.commonsSignalId, signals)}
            {linkedSignalRecord && simulation.source.commonsSignalId === linkedSignalRecord.id && (
              <Link href={`/workspace/commons?institution=${encodeURIComponent(linkedSignalRecord.institutionId)}&signal=${encodeURIComponent(linkedSignalRecord.id)}`}>Open record</Link>
            )}
          </dd></div>
          <div><dt>Asset</dt><dd>
            {contextLabel(simulation.source.assetRecordId, assetsById, 'asset')}
            {simulation.source.assetRecordId && assetsById.has(simulation.source.assetRecordId) && (
              <Link href={`/workspace/network/institutions?record=${encodeURIComponent(simulation.source.assetRecordId)}#institution-record-${encodeURIComponent(simulation.source.assetRecordId)}`}>Open record</Link>
            )}
          </dd></div>
          <div><dt>Source estimate</dt><dd>{simulation.source.assetBuildCost === null ? 'Not supplied' : `KES ${simulation.source.assetBuildCost}`}</dd></div>
        </dl>
      </section>

      {simulation.stage === 'assembly_simulated' && <PackageComposition plan={simulation.plan} />}
      {simulation.stage !== 'candidate_drafted' && (
        <section className="workbench-sim-scope">
          <p className="workbench-sim-kicker">TENDER CANDIDATE / MANUAL</p>
          <h2>{simulation.plan.scope}</h2>
          <p>{simulation.plan.workKind === 'physical-asset' ? 'Physical asset work · Roll preview may apply after acceptance.' : 'Non-physical work · ends at accepted-work evidence.'}</p>
        </section>
      )}
      {simulation.rollPreview && (
        <section aria-labelledby="workbench-sim-roll-title" className="workbench-sim-roll">
          <p className="workbench-sim-kicker">ROLL PREVIEW / SIMULATED ONLY</p>
          <h2 id="workbench-sim-roll-title">{simulation.rollPreview.assetName}</h2>
          <p>{simulation.rollPreview.scope}</p>
          <dl>
            <div><dt>Scenario roles</dt><dd>{simulation.rollPreview.simulatedRoles.join(' · ') || 'None specified'}</dd></div>
            <div><dt>Scenario evidence</dt><dd>{simulation.rollPreview.evidence.join(' · ') || 'No evidence'}</dd></div>
            <div><dt>Recorded</dt><dd>{new Date(simulation.rollPreview.simulatedAt).toLocaleString()}</dd></div>
          </dl>
        </section>
      )}
      <SimulationRunControls
        onAdvance={advance}
        onCancel={note => advance({ type: 'cancel', note })}
        onDiscard={discardSimulation}
        onPause={() => advance({ type: 'pause' })}
        onRestart={restartSimulation}
        onResume={() => advance({ type: 'resume' })}
        simulation={simulation}
      />
      <SimulationTrace events={simulation.events} planSource={simulation.planSource} />
    </>
  );
}
