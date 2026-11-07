import { useEffect, useMemo, useState } from 'preact/hooks';
import { loadConsoleSnapshot } from '../../../lib/school-console-storage';
import {
  readFieldSignals,
  readWorkBriefDrafts,
  type FieldSignal,
  type WorkBriefDraft,
} from '../../../lib/local-workflows';
import { readLocalWorkbench, type LocalWorkbenchRecord } from '../../../lib/local-workbench';
import {
  advanceWorkbenchSimulation,
  createWorkbenchSimulation,
  selectSchoolNeedSource,
  type SimulationAction,
  type SimulationContext,
  type SimulationPlan,
  type SimulationSource,
  type SimulationStatus,
  type SchoolNeedDraft,
  type WorkbenchSimulation,
  type WorkbenchViewStage,
} from '../../../lib/workbench-simulation';
import { createRollFromSimulation } from '../../../lib/roll-sbt-bridge';
import {
  deleteWorkbenchSimulation,
  readWorkbenchSimulations,
  saveWorkbenchSimulation,
} from '../../../lib/workbench-simulation-store';
import { PEOPLE_NETWORK, type NetworkEntity } from '../../../lib/people-network';

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

export interface WorkbenchHook {
  sourceDrafts: SchoolNeedDraft[];
  setSourceDrafts: (drafts: SchoolNeedDraft[]) => void;
  selectedDraftId: string;
  setSelectedDraftId: (id: string) => void;
  context: SimulationContext;
  setContext: (ctx: SimulationContext) => void;
  source: SimulationSource | null;
  setSource: (src: SimulationSource | null) => void;
  plan: SimulationPlan | null;
  setPlan: (p: SimulationPlan | null) => void;
  signals: FieldSignal[];
  setSignals: (sigs: FieldSignal[]) => void;
  briefs: WorkBriefDraft[];
  setBriefs: (b: WorkBriefDraft[]) => void;
  legacy: LocalWorkbenchRecord;
  setLegacy: (r: LocalWorkbenchRecord) => void;
  simulations: WorkbenchSimulation[];
  setSimulations: (s: WorkbenchSimulation[]) => void;
  simulation: WorkbenchSimulation | null;
  setSimulation: (s: WorkbenchSimulation | null) => void;
  error: string;
  setError: (e: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  selectedDraft: SchoolNeedDraft | null;
  eligibleSignals: FieldSignal[];
  selectedSignal: FieldSignal | null;
  linkedSignalRecord: FieldSignal | null;
  contextLabels: {
    commonsLabel: string;
    assetLabel: string;
    institutionHref: string | undefined;
    commonsHref: string | undefined;
    assetHref: string | undefined;
  };
  stage: WorkbenchViewStage;
  status: SimulationStatus | null;
  institutions: NetworkEntity[];
  assets: NetworkEntity[];
  institutionsById: Map<string, NetworkEntity>;
  assetsById: Map<string, NetworkEntity>;
  chooseDraft: (draft: SchoolNeedDraft, initialContext?: SimulationContext) => void;
  updateContext: (field: keyof SimulationContext, value: string) => void;
  refreshSimulations: (selected: WorkbenchSimulation) => void;
  startSimulation: () => void;
  advance: (action: SimulationAction) => void;
  restartSimulation: () => void;
  discardSimulation: () => void;
  openSimulation: (saved: WorkbenchSimulation) => void;
}

export function useWorkbench(): WorkbenchHook {
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
    const searchParams = new URLSearchParams(window.location.search);
    const requestedDraftId = searchParams.get('sourceConsoleDraftId');
    const requestedSignalId = searchParams.get('signal');
    async function load() {
      let availableDrafts: SchoolNeedDraft[] = [];
      let availableSignals: FieldSignal[] = [];
      try {
        const snapshot = await loadConsoleSnapshot();
        availableDrafts = snapshot.tenderDrafts.map(draft => ({
          id: draft.id,
          assetName: draft.assetName,
          need: draft.need,
          assetBuildCost: draft.assetBuildCost,
        }));
        if (active) setSourceDrafts(availableDrafts);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error
          ? loadError.message
          : 'School Console need drafts could not be read.');
      }

      try {
        availableSignals = readFieldSignals();
        if (active) setSignals(availableSignals);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Commons observations could not be read.');
      }

      if (requestedDraftId && active) {
        const draft = availableDrafts.find(item => item.id === requestedDraftId);
        const signal = requestedSignalId
          ? availableSignals.find(item => item.id === requestedSignalId)
          : undefined;
        if (!draft) {
          setError('The linked School Console draft is not available in this browser. Choose a current draft to continue.');
        } else if (requestedSignalId && (!signal || signal.sourceConsoleDraftId !== requestedDraftId)) {
          setError('The linked Commons signal does not match this Console draft. Review the source records before continuing.');
        } else {
          const initialContext: SimulationContext = signal ? {
            commonsSignalId: signal.id,
            institutionId: signal.institutionId,
            ...(signal.assetId && assetsById.has(signal.assetId) ? { assetRecordId: signal.assetId } : {}),
          } : {};
          chooseDraft(draft, initialContext);
        }
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
          if (saved[0] && !requestedDraftId) {
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

  function chooseDraft(draft: SchoolNeedDraft, initialContext: SimulationContext = {}) {
    try {
      const selected = selectSchoolNeedSource({ tenderDrafts: [draft] }, draft.id, initialContext);
      setSelectedDraftId(draft.id);
      setContext(initialContext);
      setSource(selected);
      const institutionLabel = initialContext.institutionId
        ? institutionsById.get(initialContext.institutionId)?.name ?? ''
        : '';
      setPlan(starterPlan(selected, institutionLabel));
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

      // End-to-end: completed simulation with roll preview → Roll entry + SBT attestations
      if (next.status === 'completed' && next.rollPreview) {
        void createRollFromSimulation(next).then(result => {
          setError(prev => prev
            ? `${prev} · Roll entry created (${result.entry.id}) and ${result.sbtAttestations.length} SBT attestation${result.sbtAttestations.length === 1 ? '' : 's'} minted.`
            : `Roll entry created (${result.entry.id}) and ${result.sbtAttestations.length} SBT attestation${result.sbtAttestations.length === 1 ? '' : 's'} minted.`);
        }).catch(bridgeError => {
          setError(bridgeError instanceof Error
            ? `Simulation complete, but Roll/SBT bridge failed: ${bridgeError.message}`
            : 'Simulation complete, but Roll/SBT bridge failed.');
        });
      }
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

  return {
    sourceDrafts, setSourceDrafts,
    selectedDraftId, setSelectedDraftId,
    context, setContext,
    source, setSource,
    plan, setPlan,
    signals, setSignals,
    briefs, setBriefs,
    legacy, setLegacy,
    simulations, setSimulations,
    simulation, setSimulation,
    error, setError,
    loading, setLoading,
    selectedDraft,
    eligibleSignals,
    selectedSignal,
    linkedSignalRecord,
    contextLabels,
    stage, status,
    institutions, assets, institutionsById, assetsById,
    chooseDraft, updateContext, refreshSimulations, startSimulation, advance, restartSimulation, discardSimulation, openSimulation,
  };
}
