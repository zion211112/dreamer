import type { SchoolTenderDraft } from './school-console-storage';

export type SimulationStage =
  | 'candidate_drafted'
  | 'tender_review_simulated'
  | 'assembly_simulated'
  | 'delivery_simulated'
  | 'acceptance_simulated'
  | 'roll_preview';

export type WorkbenchViewStage = 'need' | SimulationStage;
export type SimulationPlanSource = 'manual' | 'page-agent';
export type SimulationStatus = 'active' | 'paused' | 'blocked' | 'completed' | 'cancelled';
export type SimulationWorkKind = 'physical-asset' | 'non-physical';

export interface SimulationSource {
  consoleDraftId: string;
  assetName: string;
  need: string;
  assetBuildCost: string | null;
  commonsSignalId?: string;
  institutionId?: string;
  assetRecordId?: string;
}

export interface SimulationContext {
  commonsSignalId?: string | null;
  institutionId?: string | null;
  assetRecordId?: string | null;
}

export type SchoolNeedDraft = Pick<SchoolTenderDraft, 'id' | 'assetName' | 'need' | 'assetBuildCost'>;

export interface SimulationPackage {
  id: string;
  title: string;
  deliverables: string[];
  roleType: string;
  dependsOn: string[];
}

export interface SimulationPlan {
  workKind: SimulationWorkKind;
  institutionLabel: string;
  scope: string;
  proposedOutputAssetName?: string;
  packages: SimulationPackage[];
  costAssumptions: { amount: string; currency: string; basis: string } | null;
  compensationTerms: string;
  rightsTerms: string;
  safetyRequirements: string;
  acceptanceCriteria: string[];
  unresolvedFacts: string[];
}

export type SimulationAction =
  | { type: 'tender-review'; outcome: 'proceed' | 'blocked'; note: string }
  | { type: 'assembly'; outcome: 'proceed' | 'blocked'; note: string }
  | { type: 'delivery'; evidence: string[] }
  | { type: 'acceptance'; outcome: 'accepted' | 'returned' | 'rejected'; note: string }
  | { type: 'deployment'; note: string }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'cancel'; note: string };

export interface SimulationEvent {
  id: string;
  action: SimulationAction['type'];
  stage: SimulationStage;
  actorRole: 'user' | 'simulated-role';
  note: string;
  outcome?: string;
  evidence?: string[];
  createdAt: string;
}

export interface RollPreview {
  assetName: string;
  scope: string;
  simulatedRoles: string[];
  evidence: string[];
  simulatedAt: string;
}

export interface WorkbenchSimulation {
  id: string;
  schemaVersion: 1;
  source: SimulationSource;
  plan: SimulationPlan;
  planSource: SimulationPlanSource;
  status: SimulationStatus;
  stage: SimulationStage;
  events: SimulationEvent[];
  createdAt: string;
  updatedAt: string;
  rollPreview: RollPreview | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(record: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(record).every(key => allowed.includes(key));
}

function optionalReference(value: unknown, name: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`The selected ${name} reference is invalid.`);
  }
  return value.trim();
}

function isValidCost(value: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value)) && Number(value) >= 0;
}

function isSimulationPackage(value: unknown): value is SimulationPackage {
  return isRecord(value)
    && typeof value.id === 'string'
    && value.id.trim().length > 0
    && typeof value.title === 'string'
    && value.title.trim().length > 0
    && typeof value.roleType === 'string'
    && value.roleType.trim().length > 0
    && Array.isArray(value.deliverables)
    && value.deliverables.length > 0
    && value.deliverables.every(item => typeof item === 'string' && item.trim().length > 0)
    && Array.isArray(value.dependsOn)
    && value.dependsOn.every(item => typeof item === 'string');
}

function requireSource(source: unknown): asserts source is SimulationSource {
  if (!isRecord(source)
    || typeof source.consoleDraftId !== 'string'
    || typeof source.assetName !== 'string'
    || typeof source.need !== 'string'
    || (source.assetBuildCost !== null && typeof source.assetBuildCost !== 'string')
    || !source.consoleDraftId.trim() || !source.assetName.trim() || !source.need.trim()) {
    throw new Error('A source draft with a title and need is required.');
  }
  if (source.assetBuildCost !== null && !isValidCost(source.assetBuildCost)) {
    throw new Error('The source draft cost must be a non-negative decimal amount.');
  }
  optionalReference(source.commonsSignalId, 'Commons signal');
  optionalReference(source.institutionId, 'institution');
  optionalReference(source.assetRecordId, 'asset');
}

function requirePlan(plan: unknown): asserts plan is SimulationPlan {
  if (!isRecord(plan)
    || (plan.workKind !== 'physical-asset' && plan.workKind !== 'non-physical')
    || typeof plan.institutionLabel !== 'string'
    || !plan.institutionLabel.trim()
    || typeof plan.scope !== 'string'
    || !plan.scope.trim()
    || (plan.proposedOutputAssetName !== undefined && typeof plan.proposedOutputAssetName !== 'string')
    || !Array.isArray(plan.packages)
    || plan.packages.length === 0
    || !plan.packages.every(isSimulationPackage)
    || (plan.costAssumptions !== null && (!isRecord(plan.costAssumptions)
      || typeof plan.costAssumptions.amount !== 'string'
      || !isValidCost(plan.costAssumptions.amount)
      || typeof plan.costAssumptions.currency !== 'string'
      || !/^[A-Z]{3}$/.test(plan.costAssumptions.currency)
      || typeof plan.costAssumptions.basis !== 'string'
      || !plan.costAssumptions.basis.trim()))
    || typeof plan.compensationTerms !== 'string' || !plan.compensationTerms.trim()
    || typeof plan.rightsTerms !== 'string' || !plan.rightsTerms.trim()
    || typeof plan.safetyRequirements !== 'string' || !plan.safetyRequirements.trim()
    || !Array.isArray(plan.acceptanceCriteria)
    || plan.acceptanceCriteria.length === 0
    || !plan.acceptanceCriteria.every(item => typeof item === 'string' && item.trim().length > 0)
    || !Array.isArray(plan.unresolvedFacts)
    || !plan.unresolvedFacts.every(item => typeof item === 'string' && item.trim().length > 0)) {
    throw new Error('The simulation plan has an invalid format.');
  }
  const packageIds = new Set(plan.packages.map(item => item.id));
  if (packageIds.size !== plan.packages.length
    || plan.packages.some(item => item.dependsOn.some(dependency => dependency === item.id || !packageIds.has(dependency)))) {
    throw new Error('Work package IDs and dependencies must resolve without self-links.');
  }
  if (hasPackageDependencyCycle(plan.packages)) {
    throw new Error('Work package dependencies cannot contain a cycle.');
  }
}

export function hasPackageDependencyCycle(packages: readonly SimulationPackage[]): boolean {
  const packagesById = new Map(packages.map(item => [item.id, item]));
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dependency of packagesById.get(id)?.dependsOn ?? []) {
      if (packagesById.has(dependency) && visit(dependency)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  return [...packagesById.keys()].some(visit);
}

export function selectSchoolNeedSource(
  snapshot: { tenderDrafts: readonly SchoolNeedDraft[] },
  draftId: string,
  context?: SimulationContext,
): SimulationSource {
  if (!isRecord(snapshot) || !Array.isArray(snapshot.tenderDrafts)) {
    throw new Error('School Console need drafts could not be read.');
  }
  const selectedId = draftId.trim();
  const draft = snapshot.tenderDrafts.find(item => isRecord(item) && item.id === selectedId);
  if (!draft) throw new Error('The selected School Console draft was not found.');

  const assetName = typeof draft.assetName === 'string' ? draft.assetName.trim() : '';
  const need = typeof draft.need === 'string' ? draft.need.trim() : '';
  if (!selectedId || !assetName || !need) {
    throw new Error('The selected Console draft needs a title and need description.');
  }
  const rawCost = draft.assetBuildCost;
  if (rawCost !== undefined && rawCost !== null && typeof rawCost !== 'string') {
    throw new Error('The selected Console draft has an invalid build cost.');
  }
  const cost = typeof rawCost === 'string' ? rawCost.trim() : '';
  if (cost && !isValidCost(cost)) {
    throw new Error('The selected Console draft has an invalid build cost.');
  }

  if (context !== undefined && (!isRecord(context) || Array.isArray(context))) {
    throw new Error('The selected linked context is invalid.');
  }
  const references = {
    commonsSignalId: optionalReference(context?.commonsSignalId, 'Commons signal'),
    institutionId: optionalReference(context?.institutionId, 'institution'),
    assetRecordId: optionalReference(context?.assetRecordId, 'asset'),
  };
  return {
    consoleDraftId: selectedId,
    assetName,
    need,
    assetBuildCost: cost || null,
    ...(references.commonsSignalId ? { commonsSignalId: references.commonsSignalId } : {}),
    ...(references.institutionId ? { institutionId: references.institutionId } : {}),
    ...(references.assetRecordId ? { assetRecordId: references.assetRecordId } : {}),
  };
}

function newId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `${prefix}-${uuid}` : `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function clonePlan(plan: SimulationPlan): SimulationPlan {
  return {
    workKind: plan.workKind,
    institutionLabel: plan.institutionLabel,
    scope: plan.scope,
    ...(plan.proposedOutputAssetName === undefined ? {} : { proposedOutputAssetName: plan.proposedOutputAssetName }),
    packages: plan.packages.map(item => ({
      id: item.id,
      title: item.title,
      deliverables: [...item.deliverables],
      roleType: item.roleType,
      dependsOn: [...item.dependsOn],
    })),
    costAssumptions: plan.costAssumptions ? { ...plan.costAssumptions } : null,
    compensationTerms: plan.compensationTerms,
    rightsTerms: plan.rightsTerms,
    safetyRequirements: plan.safetyRequirements,
    acceptanceCriteria: [...plan.acceptanceCriteria],
    unresolvedFacts: [...plan.unresolvedFacts],
  };
}

export function createWorkbenchSimulation(source: SimulationSource, plan: SimulationPlan): WorkbenchSimulation {
  requireSource(source);
  requirePlan(plan);
  if (plan.workKind === 'physical-asset') {
    if (!plan.proposedOutputAssetName?.trim()) {
      throw new Error('Name the proposed physical output before starting its Tender simulation.');
    }
    if (plan.unresolvedFacts.length === 0
      || plan.unresolvedFacts.some(fact => fact.trim().toLocaleLowerCase() !== 'none identified')) {
      throw new Error('Resolve physical-work facts and explicitly record “None identified” before starting its Tender simulation.');
    }
  }
  const now = new Date().toISOString();
  const selectedSource: SimulationSource = {
    consoleDraftId: source.consoleDraftId,
    assetName: source.assetName,
    need: source.need,
    assetBuildCost: source.assetBuildCost,
    ...(source.commonsSignalId ? { commonsSignalId: source.commonsSignalId } : {}),
    ...(source.institutionId ? { institutionId: source.institutionId } : {}),
    ...(source.assetRecordId ? { assetRecordId: source.assetRecordId } : {}),
  };
  return {
    id: newId('simulation'),
    schemaVersion: 1,
    source: selectedSource,
    plan: clonePlan(plan),
    planSource: 'manual',
    status: 'active',
    stage: 'candidate_drafted',
    events: [],
    createdAt: now,
    updatedAt: now,
    rollPreview: null,
  };
}

function requiredNote(note: string, label: string): string {
  const normalized = note.trim();
  if (!normalized) throw new Error(`Add a note before recording ${label}.`);
  return normalized;
}

function copySimulation(simulation: WorkbenchSimulation): WorkbenchSimulation {
  return {
    ...simulation,
    source: {
      consoleDraftId: simulation.source.consoleDraftId,
      assetName: simulation.source.assetName,
      need: simulation.source.need,
      assetBuildCost: simulation.source.assetBuildCost,
      ...(simulation.source.commonsSignalId ? { commonsSignalId: simulation.source.commonsSignalId } : {}),
      ...(simulation.source.institutionId ? { institutionId: simulation.source.institutionId } : {}),
      ...(simulation.source.assetRecordId ? { assetRecordId: simulation.source.assetRecordId } : {}),
    },
    plan: clonePlan(simulation.plan),
    events: simulation.events.map(event => ({ ...event, evidence: event.evidence ? [...event.evidence] : undefined })),
    rollPreview: simulation.rollPreview ? {
      ...simulation.rollPreview,
      simulatedRoles: [...simulation.rollPreview.simulatedRoles],
      evidence: [...simulation.rollPreview.evidence],
    } : null,
  };
}

export function advanceWorkbenchSimulation(
  simulation: WorkbenchSimulation,
  action: SimulationAction,
): WorkbenchSimulation {
  if (simulation.status === 'paused') {
    if (action.type !== 'resume' && action.type !== 'cancel') {
      throw new Error('Resume or cancel the paused simulation before continuing.');
    }
  } else if (simulation.status !== 'active') {
    throw new Error('This simulation is no longer active.');
  }

  const next = copySimulation(simulation);
  const timestamp = new Date().toISOString();
  let eventStage = simulation.stage;
  let actorRole: SimulationEvent['actorRole'] = 'simulated-role';
  let note = '';
  let outcome: string | undefined;
  let evidence: string[] | undefined;

  switch (action.type) {
    case 'pause':
      if (simulation.status !== 'active') throw new Error('Only an active simulation can be paused.');
      next.status = 'paused';
      actorRole = 'user';
      note = 'Simulation paused by user.';
      break;
    case 'resume':
      if (simulation.status !== 'paused') throw new Error('Only a paused simulation can be resumed.');
      next.status = 'active';
      actorRole = 'user';
      note = 'Simulation resumed by user.';
      break;
    case 'cancel':
      next.status = 'cancelled';
      actorRole = 'user';
      note = requiredNote(action.note, 'cancellation');
      break;
    case 'tender-review':
      if (simulation.stage !== 'candidate_drafted') throw new Error('Tender review is not available at this stage.');
      next.stage = 'tender_review_simulated';
      next.status = action.outcome === 'proceed' ? 'active' : 'blocked';
      outcome = action.outcome;
      note = requiredNote(action.note, 'the Tender review');
      break;
    case 'assembly':
      if (simulation.stage !== 'tender_review_simulated') throw new Error('Assembly is not available at this stage.');
      next.stage = 'assembly_simulated';
      next.status = action.outcome === 'proceed' ? 'active' : 'blocked';
      outcome = action.outcome;
      note = requiredNote(action.note, 'the Assembly step');
      break;
    case 'delivery':
      if (simulation.stage !== 'assembly_simulated') throw new Error('Delivery is not available at this stage.');
      evidence = action.evidence.map(item => item.trim()).filter(Boolean);
      if (evidence.length === 0) throw new Error('Add scenario evidence before recording delivery.');
      next.stage = 'delivery_simulated';
      note = 'Scenario delivery evidence recorded.';
      break;
    case 'acceptance':
      if (simulation.stage !== 'delivery_simulated') throw new Error('Acceptance is not available at this stage.');
      next.stage = 'acceptance_simulated';
      next.status = action.outcome === 'accepted' ? 'active' : 'blocked';
      outcome = action.outcome;
      note = requiredNote(action.note, 'the Acceptance review');
      break;
    case 'deployment': {
      const accepted = simulation.events.some(event => event.action === 'acceptance' && event.outcome === 'accepted');
      if (simulation.stage !== 'acceptance_simulated' || !isRollApplicable(simulation.plan) || !accepted) {
        throw new Error('A Roll preview requires accepted physical-work evidence.');
      }
      eventStage = 'roll_preview';
      next.stage = 'roll_preview';
      next.status = 'completed';
      note = requiredNote(action.note, 'the simulated deployment');
      const delivery = [...simulation.events].reverse().find(event => event.action === 'delivery');
      next.rollPreview = {
        assetName: simulation.plan.proposedOutputAssetName?.trim() || simulation.source.assetName,
        scope: simulation.plan.scope,
        simulatedRoles: [...new Set(simulation.plan.packages.map(item => item.roleType.trim()).filter(Boolean))],
        evidence: delivery?.evidence ? [...delivery.evidence] : [],
        simulatedAt: timestamp,
      };
      break;
    }
  }

  next.updatedAt = timestamp;
  next.events.push({
    id: newId('event'),
    action: action.type,
    stage: eventStage,
    actorRole,
    note,
    ...(outcome ? { outcome } : {}),
    ...(evidence ? { evidence } : {}),
    createdAt: timestamp,
  });
  if (action.type === 'acceptance' && action.outcome === 'accepted' && !isRollApplicable(next.plan)) {
    next.status = 'completed';
  }
  return next;
}

export function isRollApplicable(plan: SimulationPlan): boolean {
  return plan.workKind === 'physical-asset';
}

export function isWorkbenchSimulation(value: unknown): value is WorkbenchSimulation {
  if (!isRecord(value) || value.schemaVersion !== 1 || typeof value.id !== 'string'
    || !value.id.trim()
    || !hasOnlyKeys(value, ['id', 'schemaVersion', 'source', 'plan', 'planSource', 'status', 'stage', 'events', 'createdAt', 'updatedAt', 'rollPreview'])
    || !['active', 'paused', 'blocked', 'completed', 'cancelled'].includes(String(value.status))
    || !['candidate_drafted', 'tender_review_simulated', 'assembly_simulated', 'delivery_simulated', 'acceptance_simulated', 'roll_preview'].includes(String(value.stage))
    || (value.planSource !== 'manual' && value.planSource !== 'page-agent')
    || typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt))
    || typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))
    || !Array.isArray(value.events)) return false;
  const source = value.source;
  const plan = value.plan;
  try {
    requireSource(source);
    requirePlan(plan);
  } catch {
    return false;
  }
  if (!isRecord(source)
    || !hasOnlyKeys(source, ['consoleDraftId', 'assetName', 'need', 'assetBuildCost', 'commonsSignalId', 'institutionId', 'assetRecordId'])
    || !isRecord(plan)
    || !hasOnlyKeys(plan, ['workKind', 'institutionLabel', 'scope', 'proposedOutputAssetName', 'packages', 'costAssumptions', 'compensationTerms', 'rightsTerms', 'safetyRequirements', 'acceptanceCriteria', 'unresolvedFacts'])
    || !plan.packages.every(item => isRecord(item)
      && hasOnlyKeys(item, ['id', 'title', 'deliverables', 'roleType', 'dependsOn']))
    || (plan.costAssumptions !== null && (!isRecord(plan.costAssumptions)
      || !hasOnlyKeys(plan.costAssumptions, ['amount', 'currency', 'basis'])))) {
    return false;
  }
  const validEvents = value.events.every(event => isRecord(event)
    && hasOnlyKeys(event, ['id', 'action', 'stage', 'actorRole', 'note', 'outcome', 'evidence', 'createdAt'])
    && typeof event.id === 'string'
    && ['tender-review', 'assembly', 'delivery', 'acceptance', 'deployment', 'pause', 'resume', 'cancel'].includes(String(event.action))
    && ['candidate_drafted', 'tender_review_simulated', 'assembly_simulated', 'delivery_simulated', 'acceptance_simulated', 'roll_preview'].includes(String(event.stage))
    && (event.actorRole === 'user' || event.actorRole === 'simulated-role')
    && typeof event.note === 'string'
    && (event.action === 'tender-review' || event.action === 'assembly'
      ? event.outcome === 'proceed' || event.outcome === 'blocked'
      : event.action === 'acceptance'
        ? event.outcome === 'accepted' || event.outcome === 'returned' || event.outcome === 'rejected'
        : event.outcome === undefined)
    && (event.action === 'delivery'
      ? Array.isArray(event.evidence) && event.evidence.length > 0 && event.evidence.every(item => typeof item === 'string' && item.trim())
      : event.evidence === undefined)
    && typeof event.createdAt === 'string' && Number.isFinite(Date.parse(event.createdAt)));
  const validRoll = value.rollPreview === null || isRecord(value.rollPreview)
    && hasOnlyKeys(value.rollPreview, ['assetName', 'scope', 'simulatedRoles', 'evidence', 'simulatedAt'])
    && typeof value.rollPreview.assetName === 'string'
    && Boolean(value.rollPreview.assetName.trim())
    && typeof value.rollPreview.scope === 'string'
    && Array.isArray(value.rollPreview.simulatedRoles)
    && value.rollPreview.simulatedRoles.every(role => typeof role === 'string')
    && Array.isArray(value.rollPreview.evidence)
    && value.rollPreview.evidence.every(item => typeof item === 'string')
    && typeof value.rollPreview.simulatedAt === 'string';
  if (!validEvents || !validRoll) return false;

  const stageActions: Record<SimulationStage, SimulationAction['type'][]> = {
    candidate_drafted: [],
    tender_review_simulated: ['tender-review'],
    assembly_simulated: ['tender-review', 'assembly'],
    delivery_simulated: ['tender-review', 'assembly', 'delivery'],
    acceptance_simulated: ['tender-review', 'assembly', 'delivery', 'acceptance'],
    roll_preview: ['tender-review', 'assembly', 'delivery', 'acceptance', 'deployment'],
  };
  const advancingEvents = value.events
    .map(event => isRecord(event) ? event.action : undefined)
    .filter((action): action is SimulationAction['type'] => ['tender-review', 'assembly', 'delivery', 'acceptance', 'deployment'].includes(String(action)));
  if (advancingEvents.join('|') !== stageActions[value.stage as SimulationStage].join('|')) return false;
  const lastEvent = value.events.at(-1);
  const lastAction = isRecord(lastEvent) ? lastEvent.action : undefined;

  if (value.status === 'completed'
    && !(plan.workKind === 'non-physical' && value.stage === 'acceptance_simulated' && value.rollPreview === null)
    && !(plan.workKind === 'physical-asset' && value.stage === 'roll_preview' && value.rollPreview !== null)) return false;
  if (value.status === 'blocked') {
    const lastAction = value.events.at(-1);
    if (!isRecord(lastAction)
      || !((lastAction.action === 'tender-review' || lastAction.action === 'assembly') && lastAction.outcome === 'blocked')
        && !(lastAction.action === 'acceptance' && ['returned', 'rejected'].includes(String(lastAction.outcome)))) return false;
  }
  if (value.status === 'paused' && lastAction !== 'pause') return false;
  if (value.status === 'active' && lastAction === 'pause') return false;
  if (value.status === 'cancelled' && lastAction !== 'cancel') return false;
  return value.stage !== 'roll_preview' || value.status === 'completed'
    && plan.workKind === 'physical-asset' && value.rollPreview !== null;
}
