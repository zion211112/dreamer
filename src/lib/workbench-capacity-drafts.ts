import { createLocalId } from './local-workflows';
import { KIRINYAGA_CAPACITY_SCENARIO } from './workbench-capacity';

export interface WorkbenchCapacityDraftInput {
  title: string;
  targetVolume: number;
  startDate: string;
  endDate: string;
  candidateIds: string[];
}

export interface WorkbenchCapacityDraft extends WorkbenchCapacityDraftInput {
  id: string;
  status: 'draft';
  createdAt: string;
  updatedAt: string;
}

export type WorkbenchCapacityDraftErrors = Partial<Record<
  'title' | 'targetVolume' | 'startDate' | 'endDate' | 'candidateIds',
  string
>>;

const capacityDraftStorageKey = 'aptlabs:workbench-capacity-drafts:v1';
const draftFields = ['candidateIds', 'createdAt', 'endDate', 'id', 'startDate', 'status', 'targetVolume', 'title', 'updatedAt'];
const storedFields = ['drafts', 'version'];
const knownCandidateIds = new Set(KIRINYAGA_CAPACITY_SCENARIO.candidates.map(candidate => candidate.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}

function isCandidateIdList(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length > 0
    && value.every(id => typeof id === 'string' && knownCandidateIds.has(id))
    && new Set(value).size === value.length;
}

export function validateWorkbenchCapacityDraft(
  input: WorkbenchCapacityDraftInput,
): WorkbenchCapacityDraftErrors {
  const errors: WorkbenchCapacityDraftErrors = {};
  const title = typeof input.title === 'string' ? input.title.trim() : '';

  if (!title) errors.title = 'Enter a work plan title.';
  if (!Number.isFinite(input.targetVolume) || input.targetVolume <= 0) {
    errors.targetVolume = 'Target volume must be a positive finite number.';
  }
  if (!isValidDate(input.startDate)) errors.startDate = 'Enter a real start date in YYYY-MM-DD format.';
  if (!isValidDate(input.endDate)) errors.endDate = 'Enter a real end date in YYYY-MM-DD format.';
  if (isValidDate(input.startDate) && isValidDate(input.endDate) && input.endDate < input.startDate) {
    errors.endDate = 'End date must be on or after the start date.';
  }
  if (!isCandidateIdList(input.candidateIds)) {
    errors.candidateIds = 'Choose one or more known, unique capacity candidates.';
  }

  return errors;
}

function isWorkbenchCapacityDraft(value: unknown): value is WorkbenchCapacityDraft {
  if (!isRecord(value) || Object.keys(value).sort().join(',') !== draftFields.join(',')) return false;
  if (
    typeof value.id !== 'string'
    || !value.id.trim()
    || value.status !== 'draft'
    || !isIsoTimestamp(value.createdAt)
    || !isIsoTimestamp(value.updatedAt)
    || typeof value.title !== 'string'
    || typeof value.targetVolume !== 'number'
    || typeof value.startDate !== 'string'
    || typeof value.endDate !== 'string'
    || !isCandidateIdList(value.candidateIds)
  ) return false;

  const input: WorkbenchCapacityDraftInput = {
    title: value.title,
    targetVolume: value.targetVolume,
    startDate: value.startDate,
    endDate: value.endDate,
    candidateIds: value.candidateIds,
  };
  return Object.keys(validateWorkbenchCapacityDraft(input)).length === 0;
}

function isStoredDrafts(value: unknown): value is { version: 1; drafts: WorkbenchCapacityDraft[] } {
  return isRecord(value)
    && Object.keys(value).sort().join(',') === storedFields.join(',')
    && value.version === 1
    && Array.isArray(value.drafts)
    && value.drafts.every(isWorkbenchCapacityDraft)
    && new Set(value.drafts.map(draft => draft.id)).size === value.drafts.length;
}

export function readWorkbenchCapacityDrafts(): WorkbenchCapacityDraft[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(capacityDraftStorageKey);
  } catch {
    throw new Error('This browser could not read local capacity drafts. Check storage settings and reload.');
  }
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Saved capacity drafts are damaged. Existing data was not changed.');
  }
  if (!isRecord(parsed)) {
    throw new Error('Saved capacity drafts have an invalid format.');
  }
  if (parsed.version !== 1) {
    throw new Error('Saved capacity drafts use an unsupported version. Existing data was not changed.');
  }
  if (!isStoredDrafts(parsed)) {
    throw new Error('Saved capacity drafts have an unsupported or invalid format.');
  }
  return parsed.drafts;
}

export function saveWorkbenchCapacityDraft(input: WorkbenchCapacityDraftInput): WorkbenchCapacityDraft {
  const errors = validateWorkbenchCapacityDraft(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(`Capacity draft is invalid: ${Object.values(errors).join(' ')}`);
  }

  const now = new Date().toISOString();
  const draft: WorkbenchCapacityDraft = {
    ...input,
    title: input.title.trim(),
    id: createLocalId('capacity-draft'),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  const drafts = readWorkbenchCapacityDrafts();
  const next = { version: 1, drafts: [draft, ...drafts] };

  try {
    localStorage.setItem(capacityDraftStorageKey, JSON.stringify(next));
  } catch {
    throw new Error('This browser could not save the capacity draft. Check storage settings and try again.');
  }
  return draft;
}
