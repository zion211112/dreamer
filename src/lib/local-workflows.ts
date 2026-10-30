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
  assetName: string;
  location: string;
  title: string;
  details: string;
  urgency: 'routine' | 'soon' | 'urgent';
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

const exampleSignals: FieldSignal[] = [
  {
    id: 'scenario-pump-pressure',
    institutionId: 'mwea-water',
    institutionName: 'Mwea Water Cooperative',
    assetName: 'Borehole pump 02',
    location: 'Mwea',
    title: 'Water pressure is intermittent',
    details: 'Example report only. A maintenance visit would need to confirm the cause and safe next step.',
    urgency: 'soon',
    status: 'new',
    createdAt: '2026-10-28T08:30:00.000Z',
    updatedAt: '2026-10-28T08:30:00.000Z',
    updates: [{ id: 'scenario-pump-note', text: 'Illustrative scenario; not a live report.', createdAt: '2026-10-28T08:30:00.000Z' }],
    scenario: true,
  },
  {
    id: 'scenario-school-power',
    institutionId: 'mwea-school',
    institutionName: 'Mwea Community School',
    assetName: 'Solar classroom system',
    location: 'Mwea',
    title: 'Classroom power drops during the afternoon',
    details: 'Example report only. No sensor data is connected; the operating condition has not been verified.',
    urgency: 'routine',
    status: 'triaged',
    createdAt: '2026-10-27T13:10:00.000Z',
    updatedAt: '2026-10-28T09:00:00.000Z',
    updates: [{ id: 'scenario-school-note', text: 'Illustrative scenario; not a live report.', createdAt: '2026-10-27T13:10:00.000Z' }],
    scenario: true,
  },
  {
    id: 'scenario-cold-room',
    institutionId: 'lake-basin-cold-store',
    institutionName: 'Lake Basin Cold Store',
    assetName: 'Storage chamber A',
    location: 'Kisumu',
    title: 'Temperature stability needs inspection',
    details: 'Example report only. Any reading and repair scope would need to be recorded by a person on site.',
    urgency: 'urgent',
    status: 'brief',
    createdAt: '2026-10-26T16:45:00.000Z',
    updatedAt: '2026-10-28T11:15:00.000Z',
    updates: [{ id: 'scenario-cold-note', text: 'Illustrative scenario; no work order or measurement exists.', createdAt: '2026-10-26T16:45:00.000Z' }],
    scenario: true,
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFieldSignal(value: unknown): value is FieldSignal {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.institutionId === 'string'
    && typeof value.institutionName === 'string'
    && typeof value.assetName === 'string'
    && typeof value.location === 'string'
    && typeof value.title === 'string'
    && typeof value.details === 'string'
    && (value.urgency === 'routine' || value.urgency === 'soon' || value.urgency === 'urgent')
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
  return readArray(signalStorageKey, isFieldSignal, 'field signals', exampleSignals);
}

export function writeFieldSignals(signals: FieldSignal[]): void {
  try {
    localStorage.setItem(signalStorageKey, JSON.stringify(signals));
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
