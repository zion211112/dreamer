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
  title: string;
  institutionName: string;
  assetName: string;
  location: string;
  scope: string;
  materials: string;
  fieldNotes: string;
  updatedAt: string;
}

const signalStorageKey = 'aptlabs:commons-signals:v1';
const briefStorageKey = 'aptlabs:workbench-drafts:v1';

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
    && typeof value.title === 'string'
    && typeof value.institutionName === 'string'
    && typeof value.assetName === 'string'
    && typeof value.location === 'string'
    && typeof value.scope === 'string'
    && typeof value.materials === 'string'
    && typeof value.fieldNotes === 'string'
    && typeof value.updatedAt === 'string';
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
    updatedAt: new Date().toISOString(),
  };
}
