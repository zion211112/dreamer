import { useEffect, useMemo, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { ExistingLocalActivity } from '../../components/workbench/ExistingLocalActivity';
import { PageAgentPanel } from '../../components/workbench/PageAgentPanel';
import { SchoolNeedSourcePicker } from '../../components/workbench/SchoolNeedSourcePicker';
import { SimulationRunControls } from '../../components/workbench/SimulationRunControls';
import { SimulationTrace } from '../../components/workbench/SimulationTrace';
import { TenderCandidateForm } from '../../components/workbench/TenderCandidateForm';
import { WorkbenchStageNav } from '../../components/workbench/WorkbenchStageNav';
import { WorkspaceLayout } from './WorkspaceLayout';
import { readLocalWorkbench, type LocalWorkbenchRecord } from '../../lib/local-workbench';
import {
  readFieldSignals,
  readWorkBriefDrafts,
  type FieldSignal,
  type WorkBriefDraft,
} from '../../lib/local-workflows';
import { loadConsoleSnapshot } from '../../lib/school-console-storage';
import { PEOPLE_NETWORK, type NetworkEntity } from '../../lib/people-network';
import {
  advanceWorkbenchSimulation,
  createWorkbenchSimulation,
  isRollApplicable,
  selectSchoolNeedSource,
  type SimulationAction,
  type SimulationContext,
  type SimulationPlan,
  type SimulationSource,
  type SchoolNeedDraft,
  type WorkbenchSimulation,
} from '../../lib/workbench-simulation';
import {
  deleteWorkbenchSimulation,
  readWorkbenchSimulations,
  saveWorkbenchSimulation,
} from '../../lib/workbench-simulation-store';

const institutions = PEOPLE_NETWORK.filter(entity => entity.type === 'institution');
const assets = PEOPLE_NETWORK.filter(entity => entity.type === 'asset');
const institutionsById = new Map(institutions.map(entity => [entity.id, entity]));
const assetsById = new Map(assets.map(entity => [entity.id, entity]));

function starterPlan(source: SimulationSource, institutionLabel: string): SimulationPlan {
  return {
    workKind: 'non-physical',
    institutionLabel,
    scope: source.need,
    packages: [{ id: 'package-1', title: '', deliverables: [], roleType: '', dependsOn: [] }],
    costAssumptions: source.assetBuildCost
      ? { amount: source.assetBuildCost, currency: 'KES', basis: 'Console estimate; verify against the proposed scope.' }
      : null,
    compensationTerms: '',
    rightsTerms: '',
    safetyRequirements: '',
    acceptanceCriteria: [],
    unresolvedFacts: [],
  };
}

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

function PackageComposition({ plan }: { plan: SimulationPlan }) {
  const [view, setView] = useState<'packages' | 'composition'>('packages');

  return (
    <section aria-labelledby="workbench-sim-package-title" className="workbench-sim-package-view">
      <header className="workbench-sim-section-head">
        <div><p className="workbench-sim-kicker">ASSEMBLY / SIMULATED</p><h2 id="workbench-sim-package-title">Work packages</h2></div>
        <div aria-label="Package view" className="workbench-sim-toggle" role="group">
          <button aria-pressed={view === 'packages'} onClick={() => setView('packages')} type="button">List</button>
          <button aria-pressed={view === 'composition'} onClick={() => setView('composition')} type="button">Composition</button>
        </div>
      </header>
      {view === 'packages' ? (
        <ol className="workbench-sim-package-list">
          {plan.packages.map((item, index) => (
            <li key={item.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{item.title}</strong><small>{item.roleType} · {item.deliverables.join(' / ')}</small></div>
            </li>
          ))}
        </ol>
      ) : (
        <ol aria-label="Package dependency composition" className="workbench-sim-composition">
          {plan.packages.map(item => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.roleType}</span>
              <small>{item.dependsOn.length
                ? `Depends on ${item.dependsOn.map(id => plan.packages.find(candidate => candidate.id === id)?.title ?? `Unresolved package ${id}`).join(', ')}`
                : 'No package dependency recorded'}</small>
            </li>
          ))}
        </ol>
      )}
      <p className="workbench-sim-muted">Package roles are scenario roles, not assigned providers.</p>
    </section>
  );
}

export function Workbench() {
  const [sourceDrafts, setSourceDrafts] = useState<SchoolNeedDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState('');
  const [context, setContext] = useState<SimulationContext>({});
  const [source, setSource] = useState<SimulationSource | null>(null);
  const [plan, setPlan] = useState<SimulationPlan | null>(null);
  const [signals, setSignals] = useState<FieldSignal[]>([]);
  const [briefs, setBriefs] = useState<WorkBriefDraft[]>([]);
  const [legacy, setLegacy] = useState<LocalWorkbenchRecord>({ applications: [] });
  const [simulations, setSimulations] = useState<WorkbenchSimulation[]>([]);
  const [simulation, setSimulation] = useState<WorkbenchSimulation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const snapshot = await loadConsoleSnapshot();
        const projections = snapshot.tenderDrafts.map(draft => ({
          id: draft.id,
          assetName: draft.assetName,
          need: draft.need,
          assetBuildCost: draft.assetBuildCost,
        }));
        if (active) setSourceDrafts(projections);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error
          ? loadError.message
          : 'School Console need drafts could not be read.');
      }

      try {
        if (active) setSignals(readFieldSignals());
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Commons observations could not be read.');
      }
      try {
        if (active) setBriefs(readWorkBriefDrafts());
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Saved work briefs could not be read.');
      }
      try {
        if (active) setLegacy(readLocalWorkbench());
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Saved Workbench activity could not be read.');
      }
      try {
        const saved = readWorkbenchSimulations();
        if (active) {
          setSimulations(saved);
          if (saved[0]) {
            setSimulation(saved[0]);
            setSource(saved[0].source);
            setPlan(saved[0].plan);
            setSelectedDraftId(saved[0].source.consoleDraftId);
            setContext({
              commonsSignalId: saved[0].source.commonsSignalId,
              institutionId: saved[0].source.institutionId,
              assetRecordId: saved[0].source.assetRecordId,
            });
          }
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Saved simulations could not be read.');
      }
      if (active) setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const selectedDraft = sourceDrafts.find(draft => draft.id === selectedDraftId) ?? null;
  const eligibleSignals = useMemo(() => signals.filter(signal =>
    !signal.scenario && signal.recordBasis !== 'illustrative'
  ), [signals]);
  const selectedSignal = eligibleSignals.find(signal => signal.id === context.commonsSignalId) ?? null;
  const linkedSignalRecord = signals.find(signal => signal.id === context.commonsSignalId) ?? null;
  const contextLabels = {
    commonsLabel: selectedSignal
      ? `${selectedSignal.title} · ${selectedSignal.id}`
      : context.commonsSignalId ? `Unresolved reference · ${context.commonsSignalId}` : 'No observation linked',
    assetLabel: contextLabel(context.assetRecordId, assetsById, 'asset'),
    institutionHref: context.institutionId && institutionsById.has(context.institutionId)
      ? `/workspace/institutions?record=${encodeURIComponent(context.institutionId)}#institution-record-${encodeURIComponent(context.institutionId)}`
      : undefined,
    commonsHref: selectedSignal
      ? `/workspace/commons?institution=${encodeURIComponent(selectedSignal.institutionId)}&signal=${encodeURIComponent(selectedSignal.id)}`
      : undefined,
    assetHref: context.assetRecordId && assetsById.has(context.assetRecordId)
      ? `/workspace/institutions?record=${encodeURIComponent(context.assetRecordId)}#institution-record-${encodeURIComponent(context.assetRecordId)}`
      : undefined,
  };

  function chooseDraft(draft: SchoolNeedDraft) {
    try {
      const emptyContext: SimulationContext = {};
      const selected = selectSchoolNeedSource({ tenderDrafts: [draft] }, draft.id, emptyContext);
      setSelectedDraftId(draft.id);
      setContext(emptyContext);
      setSource(selected);
      setPlan(starterPlan(selected, ''));
      setSimulation(null);
      setError('');
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : 'This Console need cannot be selected.');
    }
  }

  function updateContext(field: keyof SimulationContext, value: string) {
    const nextContext = { ...context, [field]: value || undefined };
    setContext(nextContext);
    if (selectedDraft) {
      try {
        const selected = selectSchoolNeedSource({ tenderDrafts: [selectedDraft] }, selectedDraft.id, nextContext);
        setSource(selected);
        if (field === 'institutionId') {
          setPlan(current => current ? { ...current, institutionLabel: institutionsById.get(value)?.name ?? '' } : current);
        }
      } catch (selectionError) {
        setError(selectionError instanceof Error ? selectionError.message : 'The selected context could not be resolved.');
      }
    }
  }

  function refreshSimulations(selected: WorkbenchSimulation) {
    const saved = readWorkbenchSimulations();
    setSimulations(saved);
    setSimulation(selected);
    setError('');
  }

  function startSimulation() {
    if (!source || !plan) return;
    try {
      const created = createWorkbenchSimulation(source, plan);
      saveWorkbenchSimulation(created);
      refreshSimulations(created);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The simulation could not be saved.');
    }
  }

  function advance(action: SimulationAction) {
    if (!simulation) return;
    try {
      const next = advanceWorkbenchSimulation(simulation, action);
      saveWorkbenchSimulation(next);
      refreshSimulations(next);
    } catch (advanceError) {
      setError(advanceError instanceof Error ? advanceError.message : 'The simulation step could not be recorded.');
    }
  }

  function restartSimulation() {
    if (!simulation) return;
    try {
      const next = createWorkbenchSimulation(simulation.source, simulation.plan);
      saveWorkbenchSimulation(next);
      refreshSimulations(next);
      setSource(next.source);
      setPlan(next.plan);
    } catch (restartError) {
      setError(restartError instanceof Error ? restartError.message : 'A new simulation could not be started.');
    }
  }

  function discardSimulation() {
    if (!simulation) return;
    try {
      deleteWorkbenchSimulation(simulation.id);
      setSimulations(readWorkbenchSimulations());
      setSimulation(null);
      setSource(null);
      setPlan(null);
      setSelectedDraftId('');
      setContext({});
      setError('');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'The simulation could not be discarded.');
    }
  }

  function openSimulation(saved: WorkbenchSimulation) {
    setSimulation(saved);
    setSource(saved.source);
    setPlan(saved.plan);
    setSelectedDraftId(saved.source.consoleDraftId);
    setContext({
      commonsSignalId: saved.source.commonsSignalId,
      institutionId: saved.source.institutionId,
      assetRecordId: saved.source.assetRecordId,
    });
    setError('');
  }

  const stage = simulation?.stage ?? 'need';
  const status = simulation?.status ?? null;

  return (
    <WorkspaceLayout currentContext="workbench">
      <main className="workbench-sim-page">
        <header className="workbench-sim-head">
          <div>
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
          rollApplicable={simulation ? isRollApplicable(simulation.plan) : Boolean(plan && isRollApplicable(plan))}
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
              <>
                <SchoolNeedSourcePicker
                  drafts={sourceDrafts}
                  onSelect={chooseDraft}
                  selectedId={selectedDraftId}
                />
                {source && (
                  <>
                    <section aria-labelledby="workbench-sim-context-title" className="workbench-sim-context">
                      <p className="workbench-sim-kicker">LINKED CONTEXT / SELECT BY RECORD</p>
                      <h2 id="workbench-sim-context-title">Institution, observation, asset</h2>
                      <div className="workbench-sim-form-grid">
                        <label>Institution <span>(context, not authority)</span>
                          <select onChange={event => updateContext('institutionId', (event.currentTarget as HTMLSelectElement).value)} value={context.institutionId ?? ''}>
                            <option value="">Select a registered institution</option>
                            {institutions.map(entity => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
                          </select>
                        </label>
                        <label>Commons observation <span>(optional · select by record)</span>
                          <select onChange={event => updateContext('commonsSignalId', (event.currentTarget as HTMLSelectElement).value)} value={context.commonsSignalId ?? ''}>
                            <option value="">No Commons observation</option>
                            {eligibleSignals.map(signal => <option key={signal.id} value={signal.id}>{signal.title}</option>)}
                          </select>
                        </label>
                        <label className="workbench-sim-field-wide">Registered asset <span>(optional · no inference)</span>
                          <select onChange={event => updateContext('assetRecordId', (event.currentTarget as HTMLSelectElement).value)} value={context.assetRecordId ?? ''}>
                            <option value="">Asset not identified</option>
                            {assets.map(entity => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
                          </select>
                        </label>
                      </div>
                    </section>
                    {plan && (
                      <TenderCandidateForm
                        context={contextLabels}
                        onChange={setPlan}
                        onStart={startSimulation}
                        plan={plan}
                        source={source}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
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
                        <Link href={`/workspace/institutions?record=${encodeURIComponent(simulation.source.institutionId)}#institution-record-${encodeURIComponent(simulation.source.institutionId)}`}>Open record</Link>
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
                        <Link href={`/workspace/institutions?record=${encodeURIComponent(simulation.source.assetRecordId)}#institution-record-${encodeURIComponent(simulation.source.assetRecordId)}`}>Open record</Link>
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
            )}
          </div>

          <PageAgentPanel sourcePreview={source ?? simulation?.source ?? null} />
        </div>

        <ExistingLocalActivity applications={legacy.applications} briefs={briefs} />
        {!loading && sourceDrafts.length === 0 && !simulation && (
          <p className="workbench-sim-footnote">The School Console is the source of need drafts; this workspace does not create one on its behalf.</p>
        )}
      </main>
    </WorkspaceLayout>
  );
}

export const FieldDesk = Workbench;
