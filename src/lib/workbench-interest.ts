import { createLocalId } from './local-workflows';

export interface LocalWorkInterest {
  id: string;
  opportunityId: string;
  createdAt: string;
}

const interestStorageKey = 'aptlabs:workbench-interests:v1';
const interestFields = ['createdAt', 'id', 'opportunityId'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const timestamp = new Date(value);
  return Number.isFinite(timestamp.getTime()) && timestamp.toISOString() === value;
}

function isLocalWorkInterest(value: unknown): value is LocalWorkInterest {
  if (!isRecord(value) || Object.keys(value).sort().join(',') !== interestFields.join(',')) return false;
  return typeof value.id === 'string'
    && Boolean(value.id.trim())
    && typeof value.opportunityId === 'string'
    && Boolean(value.opportunityId.trim())
    && isIsoTimestamp(value.createdAt);
}

function isLocalWorkInterestList(value: unknown): value is LocalWorkInterest[] {
  return Array.isArray(value)
    && value.every(isLocalWorkInterest)
    && new Set(value.map(interest => interest.id)).size === value.length
    && new Set(value.map(interest => interest.opportunityId)).size === value.length;
}

export function readLocalWorkInterests(): LocalWorkInterest[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(interestStorageKey);
  } catch {
    throw new Error('This browser could not read local Workbench interest. Check storage settings and reload.');
  }
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Saved Workbench interests are damaged. Existing records were not changed.');
  }
  if (!isLocalWorkInterestList(parsed)) {
    throw new Error('Saved Workbench interests have an unsupported or invalid format.');
  }
  return parsed;
}

function writeLocalWorkInterests(interests: LocalWorkInterest[]): void {
  if (!isLocalWorkInterestList(interests)) {
    throw new Error('Local Workbench interest data is invalid and was not saved.');
  }
  try {
    localStorage.setItem(interestStorageKey, JSON.stringify(interests));
  } catch {
    throw new Error('This browser could not save local Workbench interest. Check storage settings and try again.');
  }
}

export function expressLocalWorkInterest(opportunityId: string): LocalWorkInterest[] {
  if (!opportunityId.trim()) throw new Error('Choose a listed work context before expressing interest.');
  const saved = readLocalWorkInterests();
  if (saved.some(interest => interest.opportunityId === opportunityId)) return saved;

  const next = [{
    id: createLocalId('work-interest'),
    opportunityId,
    createdAt: new Date().toISOString(),
  }, ...saved];
  writeLocalWorkInterests(next);
  return next;
}

export function removeLocalWorkInterest(opportunityId: string): LocalWorkInterest[] {
  const saved = readLocalWorkInterests();
  const remaining = saved.filter(interest => interest.opportunityId !== opportunityId);
  if (remaining.length === saved.length) return saved;
  writeLocalWorkInterests(remaining);
  return remaining;
}
