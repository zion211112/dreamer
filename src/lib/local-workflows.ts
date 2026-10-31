import { EXAMPLE_FIELD_SIGNALS } from './ecosystem-examples';

export type SignalStatus = 'new' | 'triaged' | 'brief' | 'resolved';

export interface SignalUpdate {
  id: string;
  text: string;
  createdAt: string;
}

export interface FieldSignal {
  id: string;
  institutionId: string;
  institutionName: string;
  assetName?: string;
  assetId?: string;
  sourceConsoleDraftId?: string;
  location: string;
  title: string;
  details: string;
  urgency: 'routine' | 'soon' | 'urgent';
  suspectedCause?: string;
  evidenceOnHand?: string[];
  missingChecks?: string[];
  suggestedNextStep?: string;
  verifiedPriority?: 'not-assessed' | 'routine' | 'soon' | 'urgent';
  authorizationStatus?: 'not-authorized' | 'authorized';
  recordBasis?: 'illustrative';
  status: SignalStatus;
  createdAt: string;
  updatedAt: string;
  updates: SignalUpdate[];
  scenario: boolean;
}

export interface WorkBriefDraft {
  id: string;
  sourceSignalId: string | null;
  sourceProposalId?: string | null;
  title: string;
  institutionName: string;
  assetName: string;
  location: string;
  scope: string;
  materials: string;
  fieldNotes: string;
  acceptanceCriteria?: string;
  compensationType?: '' | 'paid' | 'unpaid';
  compensationAmount?: string;
  compensationCurrency?: string;
  paymentTrigger?: string;
  expenseTerms?: string;
  rightsTerms?: string;
  updatedAt: string;
}

export type ProposalStatus = 'proposed' | 'approved' | 'rejected' | 'returned';

export interface GovernanceSteward {
  institutionId: string;
  email: string;
  assignedBy: string | null;
  assignedAt: string;
  initial: boolean;
}

export interface GovernanceEvent {
  id: string;
  status: ProposalStatus;
  actor: string;
  note: string;
  createdAt: string;
}

export interface CommonsProposal {
  id: string;
  institutionId: string;
  institutionName: string;
  sourceSignalId: string | null;
  title: string;
  rationale: string;
  rule: string;
  status: ProposalStatus;
  createdBy: string;
  createdAt: string;
  events: GovernanceEvent[];
}

export interface CommonsGovernanceRecord {
  stewards: GovernanceSteward[];
  proposals: CommonsProposal[];
}

const signalStorageKey = 'aptlabs:commons-signals:v1';
const briefStorageKey = 'aptlabs:workbench-drafts:v1';
const governanceStorageKey = 'aptlabs:commons-governance:v1';

const exampleSignalIds = new Set(EXAMPLE_FIELD_SIGNALS.map(signal => signal.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFieldSignal(value: unknown): value is FieldSignal {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.institutionId === 'string'
    && typeof value.institutionName === 'string'
    && (value.assetName === undefined || typeof value.assetName === 'string')
    && (value.assetId === undefined || typeof value.assetId === 'string')
    && (value.sourceConsoleDraftId === undefined
      || typeof value.sourceConsoleDraftId === 'string' && value.sourceConsoleDraftId.trim().length > 0)
    && typeof value.location === 'string'
    && typeof value.title === 'string'
    && typeof value.details === 'string'
    && (value.urgency === 'routine' || value.urgency === 'soon' || value.urgency === 'urgent')
    && (value.suspectedCause === undefined || typeof value.suspectedCause === 'string')
    && (value.evidenceOnHand === undefined || Array.isArray(value.evidenceOnHand) && value.evidenceOnHand.every(item => typeof item === 'string'))
    && (value.missingChecks === undefined || Array.isArray(value.missingChecks) && value.missingChecks.every(item => typeof item === 'string'))
    && (value.suggestedNextStep === undefined || typeof value.suggestedNextStep === 'string')
    && (value.verifiedPriority === undefined || value.verifiedPriority === 'not-assessed'
      || value.verifiedPriority === 'routine' || value.verifiedPriority === 'soon' || value.verifiedPriority === 'urgent')
    && (value.authorizationStatus === undefined || value.authorizationStatus === 'not-authorized' || value.authorizationStatus === 'authorized')
    && (value.recordBasis === undefined || value.recordBasis === 'illustrative')
    && (value.status === 'new' || value.status === 'triaged' || value.status === 'brief' || value.status === 'resolved')
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string'
    && Array.isArray(value.updates)
    && value.updates.every(update => isRecord(update)
      && typeof update.id === 'string'
      && typeof update.text === 'string'
      && typeof update.createdAt === 'string')
    && typeof value.scenario === 'boolean';
}

function isWorkBriefDraft(value: unknown): value is WorkBriefDraft {
  return isRecord(value)
    && typeof value.id === 'string'
    && (typeof value.sourceSignalId === 'string' || value.sourceSignalId === null)
    && (value.sourceProposalId === undefined || typeof value.sourceProposalId === 'string' || value.sourceProposalId === null)
    && typeof value.title === 'string'
    && typeof value.institutionName === 'string'
    && typeof value.assetName === 'string'
    && typeof value.location === 'string'
    && typeof value.scope === 'string'
    && typeof value.materials === 'string'
    && typeof value.fieldNotes === 'string'
    && (value.acceptanceCriteria === undefined || typeof value.acceptanceCriteria === 'string')
    && (value.compensationType === undefined || value.compensationType === '' || value.compensationType === 'paid' || value.compensationType === 'unpaid')
    && (value.compensationAmount === undefined || typeof value.compensationAmount === 'string')
    && (value.compensationCurrency === undefined || typeof value.compensationCurrency === 'string')
    && (value.paymentTrigger === undefined || typeof value.paymentTrigger === 'string')
    && (value.expenseTerms === undefined || typeof value.expenseTerms === 'string')
    && (value.rightsTerms === undefined || typeof value.rightsTerms === 'string')
    && typeof value.updatedAt === 'string';
}

function isProposalStatus(value: unknown): value is ProposalStatus {
  return value === 'proposed' || value === 'approved' || value === 'rejected' || value === 'returned';
}

function isGovernanceEvent(value: unknown): value is GovernanceEvent {
  return isRecord(value)
    && typeof value.id === 'string'
    && isProposalStatus(value.status)
    && typeof value.actor === 'string'
    && typeof value.note === 'string'
    && typeof value.createdAt === 'string';
}

function isCommonsProposal(value: unknown): value is CommonsProposal {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.institutionId === 'string'
    && typeof value.institutionName === 'string'
    && (typeof value.sourceSignalId === 'string' || value.sourceSignalId === null)
    && typeof value.title === 'string'
    && typeof value.rationale === 'string'
    && typeof value.rule === 'string'
    && isProposalStatus(value.status)
    && typeof value.createdBy === 'string'
    && typeof value.createdAt === 'string'
    && Array.isArray(value.events)
    && value.events.every(isGovernanceEvent);
}

function isGovernanceSteward(value: unknown): value is GovernanceSteward {
  return isRecord(value)
    && typeof value.institutionId === 'string'
    && typeof value.email === 'string'
    && (typeof value.assignedBy === 'string' || value.assignedBy === null)
    && typeof value.assignedAt === 'string'
    && typeof value.initial === 'boolean';
}

export function readCommonsGovernance(): CommonsGovernanceRecord {
  let raw: string | null;
  try {
    raw = localStorage.getItem(governanceStorageKey);
  } catch {
    throw new Error('This browser could not read local governance records.');
  }
  if (!raw) return { stewards: [], proposals: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Saved governance records are damaged. Export this browser data before resetting it.');
  }
  if (!isRecord(parsed)
    || !Array.isArray(parsed.stewards)
    || !parsed.stewards.every(isGovernanceSteward)
    || !Array.isArray(parsed.proposals)
    || !parsed.proposals.every(isCommonsProposal)) {
    throw new Error('Saved governance records have an unsupported format.');
  }
  return { stewards: parsed.stewards, proposals: parsed.proposals };
}

function writeCommonsGovernance(record: CommonsGovernanceRecord): void {
  try {
    localStorage.setItem(governanceStorageKey, JSON.stringify(record));
  } catch {
    throw new Error('This browser could not save the governance record.');
  }
}

export function hasLocalStewardRole(record: CommonsGovernanceRecord, institutionId: string, email: string): boolean {
  const identity = email.trim().toLocaleLowerCase();
  return Boolean(identity) && record.stewards.some(steward => (
    steward.institutionId === institutionId && steward.email === identity
  ));
}

export function assignLocalSteward(institutionId: string, email: string, assignedBy = ''): CommonsGovernanceRecord {
  const identity = email.trim().toLocaleLowerCase();
  if (!institutionId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity)) {
    throw new Error('Enter an institution and a valid steward email.');
  }
  const record = readCommonsGovernance();
  const institutionStewards = record.stewards.filter(steward => steward.institutionId === institutionId);
  const actor = assignedBy.trim().toLocaleLowerCase();
  const initial = institutionStewards.length === 0;
  if (!initial && !hasLocalStewardRole(record, institutionId, actor)) {
    throw new Error('Only a designated steward for this institution can assign another steward.');
  }
  if (institutionStewards.some(steward => steward.email === identity)) return record;

  const steward: GovernanceSteward = {
    institutionId,
    email: identity,
    assignedBy: initial ? null : actor,
    assignedAt: new Date().toISOString(),
    initial,
  };
  const updated = { ...record, stewards: [...record.stewards, steward] };
  writeCommonsGovernance(updated);
  return updated;
}

export function createCommonsProposal(
  input: Omit<CommonsProposal, 'id' | 'status' | 'createdAt' | 'events' | 'createdBy'>,
  actorEmail: string,
): CommonsGovernanceRecord {
  const actor = actorEmail.trim().toLocaleLowerCase();
  const record = readCommonsGovernance();
  if (!hasLocalStewardRole(record, input.institutionId, actor)) {
    throw new Error('Only a designated steward can create a proposal for this institution.');
  }
  const createdAt = new Date().toISOString();
  const proposal: CommonsProposal = {
    ...input,
    id: createLocalId('proposal'),
    status: 'proposed',
    createdBy: actor,
    createdAt,
    events: [{
      id: createLocalId('decision-event'),
      status: 'proposed',
      actor,
      note: 'Proposal recorded for steward decision.',
      createdAt,
    }],
  };
  const updated = { ...record, proposals: [proposal, ...record.proposals] };
  writeCommonsGovernance(updated);
  return updated;
}

export function decideCommonsProposal(
  proposalId: string,
  status: Exclude<ProposalStatus, 'proposed'>,
  note: string,
  actorEmail: string,
): CommonsGovernanceRecord {
  const actor = actorEmail.trim().toLocaleLowerCase();
  const record = readCommonsGovernance();
  const proposal = record.proposals.find(item => item.id === proposalId);
  if (!proposal) throw new Error('This proposal is no longer available.');
  if (!hasLocalStewardRole(record, proposal.institutionId, actor)) {
    throw new Error('Only a designated steward for this institution can record a decision.');
  }
  if (proposal.status !== 'proposed') throw new Error('This proposal already has a steward decision.');

  const createdAt = new Date().toISOString();
  const updated = {
    ...record,
    proposals: record.proposals.map(item => item.id === proposalId
      ? {
        ...item,
        status,
        events: [...item.events, {
          id: createLocalId('decision-event'),
          status,
          actor,
          note: note.trim(),
          createdAt,
        }],
      }
      : item),
  };
  writeCommonsGovernance(updated);
  return updated;
}

function readArray<T>(
  key: string,
  validate: (value: unknown) => value is T,
  label: string,
  emptyValue: T[],
): T[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    throw new Error(`This browser could not read local ${label}. Check storage settings and reload.`);
  }
  if (raw === null) return emptyValue;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Saved local ${label} are damaged. Clear this browser's site data to reset the demo.`);
  }
  if (!Array.isArray(parsed) || !parsed.every(validate)) {
    throw new Error(`Saved local ${label} have an invalid format. Clear this browser's site data to reset the demo.`);
  }
  return parsed;
}

export function readFieldSignals(): FieldSignal[] {
  return readArray(signalStorageKey, isFieldSignal, 'field signals', EXAMPLE_FIELD_SIGNALS);
}

export function createConsoleSignalLink(draftId: string): string {
  const normalizedId = draftId.trim();
  if (!normalizedId) throw new Error('A Console draft ID is required.');
  return `/workspace/commons?sourceConsoleDraftId=${encodeURIComponent(normalizedId)}`;
}

export function parseConsoleDraftId(search: string): string | null {
  const draftId = new URLSearchParams(search).get('sourceConsoleDraftId')?.trim() ?? '';
  return draftId || null;
}

export function hasRegisteredInstitution(institutionId: string, registeredIds: readonly string[]): boolean {
  return institutionId.trim().length > 0 && registeredIds.includes(institutionId);
}

export function writeFieldSignals(signals: FieldSignal[]): void {
  try {
    localStorage.setItem(signalStorageKey, JSON.stringify(signals.filter(signal => !exampleSignalIds.has(signal.id))));
  } catch {
    throw new Error('This browser could not save the field signal. Check storage settings and try again.');
  }
}

export function readWorkBriefDrafts(): WorkBriefDraft[] {
  return readArray(briefStorageKey, isWorkBriefDraft, 'work briefs', []);
}

export function writeWorkBriefDrafts(drafts: WorkBriefDraft[]): void {
  try {
    localStorage.setItem(briefStorageKey, JSON.stringify(drafts));
  } catch {
    throw new Error('This browser could not save the work brief. Check storage settings and try again.');
  }
}

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createWorkBrief(signal: FieldSignal | null): WorkBriefDraft {
  return {
    id: createLocalId('brief'),
    sourceSignalId: signal?.id ?? null,
    title: signal ? `Work brief: ${signal.title}` : '',
    institutionName: signal?.institutionName ?? '',
    assetName: signal?.assetName ?? '',
    location: signal?.location ?? '',
    scope: signal?.details ?? '',
    materials: '',
    fieldNotes: '',
    compensationType: '',
    compensationAmount: '',
    compensationCurrency: '',
    paymentTrigger: '',
    expenseTerms: '',
    rightsTerms: '',
    updatedAt: new Date().toISOString(),
  };
}
