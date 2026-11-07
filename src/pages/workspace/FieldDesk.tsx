import { Link } from 'wouter';
import { isRollApplicable } from '../../lib/workbench-simulation';
import { WorkspaceLayout } from './WorkspaceLayout';
import { WorkbenchDossier } from './field-desk/WorkbenchDossier';
import { WorkbenchCaseView } from './field-desk/WorkbenchCaseView';
import { useWorkbench } from './field-desk/useWorkbench';
import { PageAgentPanel } from '../../components/workbench/PageAgentPanel';
import { ExistingLocalActivity } from '../../components/workbench/ExistingLocalActivity';
import { WorkbenchStageNav } from '../../components/workbench/WorkbenchStageNav';

export function Workbench() {
  const {
    sourceDrafts,
    selectedDraftId,
    chooseDraft,
    source,
    context,
    updateContext,
    eligibleSignals,
    institutions,
    assets,
    plan,
    setPlan,
    startSimulation,
    contextLabels,
    simulation,
    institutionsById,
    assetsById,
    signals,
    linkedSignalRecord,
    advance,
    discardSimulation,
    restartSimulation,
    simulations,
    openSimulation,
    legacy,
    briefs,
    error,
    loading,
    stage,
    status,
  } = useWorkbench();

  return (
    <WorkspaceLayout currentContext="workbench:field-desk">
      <div className="workbench-sim-page">
        <header className="workbench-sim-head">
          <div>
            <Link className="workbench-sim-back-link" href="/workspace/workbench">← Find capacity</Link>
            <p className="eyebrow">WORKBENCH / NEED TO PROOF</p>
            <h1>Compose the work</h1>
            <p>Start from a school need. Shape the packages, terms, and evidence before running the scenario.</p>
          </div>
          <div aria-label="Simulation mode" className="workbench-sim-mode">
            <strong>SIMULATION</strong>
            <span>Manual plan · isolated record</span>
          </div>
        </header>

        <WorkbenchStageNav
          rollApplicable={simulation ? isRollApplicable(simulation?.plan) : Boolean(plan && isRollApplicable(plan))}
          stage={stage}
          status={status}
        />

        {error && <p className="workbench-sim-error" role="alert">{error}</p>}

        {simulations.length > 0 && (
          <details className="workbench-sim-saved-runs">
            <summary>Saved simulation runs <span>{simulations.length}</span></summary>
            <div>
              {simulations.map(saved => (
                <button
                  aria-current={simulation?.id === saved.id ? 'true' : undefined}
                  key={saved.id}
                  onClick={() => openSimulation(saved)}
                  type="button"
                >
                  <strong>{saved.source.assetName}</strong>
                  <small>{saved.status.toUpperCase()} · {saved.stage.replaceAll('_', ' ')}</small>
                </button>
              ))}
            </div>
          </details>
        )}

        <div className="workbench-sim-columns">
          <div className="workbench-sim-dossier">
            {!simulation ? (
              <WorkbenchDossier
                sourceDrafts={sourceDrafts}
                selectedDraftId={selectedDraftId}
                chooseDraft={chooseDraft}
                source={source}
                context={context}
                updateContext={updateContext}
                eligibleSignals={eligibleSignals}
                institutions={institutions}
                assets={assets}
                plan={plan}
                setPlan={setPlan}
                startSimulation={startSimulation}
                contextLabels={contextLabels}
              />
            ) : (
              <WorkbenchCaseView
                simulation={simulation}
                institutionsById={institutionsById}
                assetsById={assetsById}
                signals={signals}
                linkedSignalRecord={linkedSignalRecord}
                advance={advance}
                discardSimulation={discardSimulation}
                restartSimulation={restartSimulation}
              />
            )}
          </div>

          <PageAgentPanel sourcePreview={source ?? simulation?.source ?? null} />
        </div>

        <ExistingLocalActivity applications={legacy.applications} briefs={briefs} />
        {!loading && sourceDrafts.length === 0 && !simulation && (
          <p className="workbench-sim-footnote">The School Console is the source of need drafts; this workspace does not create one on its behalf.</p>
        )}
      </div>
    </WorkspaceLayout>
  );
}

export const FieldDesk = Workbench;
