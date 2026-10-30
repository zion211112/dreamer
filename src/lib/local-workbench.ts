import { createLocalId } from './local-workflows';

export type WorkDiscipline = 'Animation' | 'Software' | 'Fabrication';
export type ApplicationStatus = 'submitted' | 'under_review' | 'selected' | 'declined';
export type WorkStatus =
  | 'authorization_pending'
  | 'authorized'
  | 'in_progress'
  | 'submitted'
  | 'changes_requested'
  | 'accepted';

export interface WorkOpportunity {
  id: string;
  title: string;
  context: string;
  discipline: WorkDiscipline;
  summary: string;
  scope: string;
  deliverables: string[];
  capability: string[];
  terms: string;
  payment: string;
  acceptance: string;
}

export interface WorkEvent {
  id: string;
  action: string;
  actor: string;
  note: string;
  createdAt: string;
}

export interface LocalWorkApplication {
  id: string;
  opportunityId: string;
  applicant: string;
  note: string;
  shareEvidence: boolean;
  status: ApplicationStatus;
  workStatus: WorkStatus | null;
  deliveryEvidence: string;
  decisionNote: string;
  events: WorkEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface LocalWorkbenchRecord {
  applications: LocalWorkApplication[];
}

export const WORK_OPPORTUNITIES: WorkOpportunity[] = [
  {
    id: 'school-learning-animation',
    title: 'School learning animations',
    context: 'School Console · learning',
    discipline: 'Animation',
    summary: 'Turn a challenging classroom concept into a concise visual explanation educators can use.',
    scope: 'Develop a storyboard and short animation for a learning objective selected with educators. The publishing institution sets scope, rights, and engagement terms in its brief.',
    deliverables: ['Storyboard', 'Short animation', 'Source files and attribution note'],
    capability: ['Storyboarding', '2D or motion design', 'Learning-focused communication'],
    terms: 'The institution must disclose paid or unpaid status, fee, payment trigger, expenses, and rights before a real application is opened.',
    payment: 'Not specified in this local workflow',
    acceptance: 'The selected learning objective is addressed; the institution reviews the agreed format, accessibility, and attribution.',
  },
  {
    id: 'kemetos-agi1-software',
    title: 'Kemetos AGI1',
    context: 'Kemetos AGI1 · software',
    discipline: 'Software',
    summary: 'Contribute a bounded engineering or research task to the AGI1 workstream.',
    scope: 'The institution defines a specific issue, repository or research boundary, review method, and contribution rights before the work is authorized.',
    deliverables: ['Implementation or research note', 'Test or verification evidence', 'Contribution summary'],
    capability: ['Software development', 'Technical documentation', 'Research'],
    terms: 'The institution must disclose paid or unpaid status, fee, payment trigger, expenses, and rights before a real application is opened.',
    payment: 'Not specified in this local workflow',
    acceptance: 'The agreed change or research result is reviewed against the brief and its stated verification criteria.',
  },
  {
    id: 'thiba-hydro-fabrication',
    title: 'Thiba Hydro',
    context: 'Thiba Hydro · fabrication',
    discipline: 'Fabrication',
    summary: 'Prepare and deliver a fabrication task against a defined site, safety, and inspection scope.',
    scope: 'The institution defines the fabrication requirement, site access, safety controls, materials, inspection method, and engagement terms before authorization.',
    deliverables: ['Fabrication plan', 'Completed work evidence', 'Inspection and safety record'],
    capability: ['Fabrication', 'Site coordination', 'Safety and quality control'],
    terms: 'The institution must disclose paid or unpaid status, fee, payment trigger, expenses, and rights before a real application is opened.',
    payment: 'Not specified in this local workflow',
    acceptance: 'The institution inspects the delivery against the agreed dimensions, material requirements, safety controls, and evidence.',
  },
];

const storageKey = 'aptlabs:workbench-local-flow:v1';
const applicationStatuses: ApplicationStatus[] = ['submitted', 'under_review', 'selected', 'declined'];
const workStatuses: WorkStatus[] = [
  'authorization_pending',
  'authorized',
  'in_progress',
  'submitted',
  'changes_requested',
  'accepted',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWorkEvent(value: unknown): value is WorkEvent {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.action === 'string'
    && typeof value.actor === 'string'
    && typeof value.note === 'string'
    && typeof value.createdAt === 'string';
}

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && applicationStatuses.some(status => status === value);
}

function isWorkStatus(value: unknown): value is WorkStatus {
  return typeof value === 'string' && workStatuses.some(status => status === value);
}

function isLocalWorkApplication(value: unknown): value is LocalWorkApplication {
  return isRecord(value)
    && typeof value.id === 'string'
    && WORK_OPPORTUNITIES.some(opportunity => opportunity.id === value.opportunityId)
    && typeof value.applicant === 'string'
    && typeof value.note === 'string'
    && typeof value.shareEvidence === 'boolean'
    && isApplicationStatus(value.status)
    && (value.workStatus === null || isWorkStatus(value.workStatus))
    && typeof value.deliveryEvidence === 'string'
    && typeof value.decisionNote === 'string'
    && Array.isArray(value.events)
    && value.events.every(isWorkEvent)
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string';
}

function isLocalWorkbenchRecord(value: unknown): value is LocalWorkbenchRecord {
  return isRecord(value)
    && Array.isArray(value.applications)
    && value.applications.every(isLocalWorkApplication);
}

export function readLocalWorkbench(): LocalWorkbenchRecord {
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    throw new Error('This browser could not read local Workbench activity. Check storage settings and reload.');
  }
  if (raw === null) return { applications: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Saved Workbench activity is damaged. Export this browser data before resetting it.');
  }
  if (!isLocalWorkbenchRecord(parsed)) {
    throw new Error('Saved Workbench activity has an unsupported format.');
  }
  return parsed;
}

export function writeLocalWorkbench(record: LocalWorkbenchRecord): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(record));
  } catch {
    throw new Error('This browser could not save Workbench activity. Check storage settings and try again.');
  }
}

function event(action: string, actor: string, note: string): WorkEvent {
  return {
    id: createLocalId('work-event'),
    action,
    actor,
    note,
    createdAt: new Date().toISOString(),
  };
}

function updateApplication(
  record: LocalWorkbenchRecord,
  applicationId: string,
  change: (application: LocalWorkApplication) => LocalWorkApplication,
): LocalWorkbenchRecord {
  let found = false;
  const applications = record.applications.map(application => {
    if (application.id !== applicationId) return application;
    found = true;
    return change(application);
  });
  if (!found) throw new Error('This local application is no longer available.');
  return { applications };
}

function appendEvent(
  application: LocalWorkApplication,
  action: string,
  actor: string,
  note: string,
): Pick<LocalWorkApplication, 'events' | 'updatedAt'> {
  const createdAt = new Date().toISOString();
  return {
    events: [...application.events, {
      id: createLocalId('work-event'),
      action,
      actor,
      note,
      createdAt,
    }],
    updatedAt: createdAt,
  };
}

export function createLocalApplication(
  record: LocalWorkbenchRecord,
  opportunityId: string,
  applicant: string,
  note: string,
  shareEvidence: boolean,
): LocalWorkbenchRecord {
  if (!WORK_OPPORTUNITIES.some(opportunity => opportunity.id === opportunityId)) {
    throw new Error('Choose a listed work context before preparing an application.');
  }
  if (!applicant.trim()) throw new Error('A profile name is required.');
  if (!note.trim()) throw new Error('Add an application note before saving.');
  if (record.applications.some(application => (
    application.opportunityId === opportunityId
      && application.applicant === applicant
      && application.status !== 'declined'
  ))) {
    throw new Error('A local application for this work context already exists.');
  }

  const createdAt = new Date().toISOString();
  const application: LocalWorkApplication = {
    id: createLocalId('application'),
    opportunityId,
    applicant: applicant.trim(),
    note: note.trim(),
    shareEvidence,
    status: 'submitted',
    workStatus: null,
    deliveryEvidence: '',
    decisionNote: '',
    events: [event('application_saved', applicant.trim(), 'Saved in this browser; nothing was sent to an institution.')],
    createdAt,
    updatedAt: createdAt,
  };
  return { applications: [application, ...record.applications] };
}

export function beginLocalReview(
  record: LocalWorkbenchRecord,
  applicationId: string,
): LocalWorkbenchRecord {
  return updateApplication(record, applicationId, application => {
    if (application.status !== 'submitted') throw new Error('Only a submitted local application can enter review.');
    return {
      ...application,
      status: 'under_review',
      ...appendEvent(application, 'under_review', 'Institution reviewer · local', 'Review started in the local workflow.'),
    };
  });
}

export function decideLocalApplication(
  record: LocalWorkbenchRecord,
  applicationId: string,
  decision: 'selected' | 'declined',
  note: string,
): LocalWorkbenchRecord {
  if (!note.trim()) throw new Error('Record a decision note before choosing an outcome.');
  return updateApplication(record, applicationId, application => {
    if (application.status !== 'under_review') throw new Error('Only an application under review can receive a decision.');
    return {
      ...application,
      status: decision,
      workStatus: decision === 'selected' ? 'authorization_pending' : null,
      decisionNote: note.trim(),
      ...appendEvent(application, decision, 'Institution reviewer · local', note.trim()),
    };
  });
}

export function authorizeLocalWork(
  record: LocalWorkbenchRecord,
  applicationId: string,
): LocalWorkbenchRecord {
  return updateApplication(record, applicationId, application => {
    if (application.status !== 'selected' || application.workStatus !== 'authorization_pending') {
      throw new Error('Only selected work awaiting authorization can be authorized.');
    }
    return {
      ...application,
      workStatus: 'authorized',
      ...appendEvent(application, 'work_authorized', 'Institution authorizer · local', 'Authorization recorded in this browser only.'),
    };
  });
}

export function acceptLocalAuthorization(
  record: LocalWorkbenchRecord,
  applicationId: string,
): LocalWorkbenchRecord {
  return updateApplication(record, applicationId, application => {
    if (application.workStatus !== 'authorized') throw new Error('Work must be authorized before the contributor can accept it.');
    return {
      ...application,
      workStatus: 'in_progress',
      ...appendEvent(application, 'authorization_accepted', application.applicant, 'Contributor accepted the local work authorization.'),
    };
  });
}

export function submitLocalDelivery(
  record: LocalWorkbenchRecord,
  applicationId: string,
  evidence: string,
): LocalWorkbenchRecord {
  if (!evidence.trim()) throw new Error('Describe the delivery evidence before submitting it.');
  return updateApplication(record, applicationId, application => {
    if (application.workStatus !== 'in_progress' && application.workStatus !== 'changes_requested') {
      throw new Error('Only work in progress or work with requested changes can be submitted.');
    }
    return {
      ...application,
      workStatus: 'submitted',
      deliveryEvidence: evidence.trim(),
      ...appendEvent(application, 'delivery_submitted', application.applicant, 'Delivery evidence saved in this browser only.'),
    };
  });
}

export function reviewLocalDelivery(
  record: LocalWorkbenchRecord,
  applicationId: string,
  decision: 'changes_requested' | 'accepted',
  note: string,
): LocalWorkbenchRecord {
  if (!note.trim()) throw new Error('Record the review outcome before continuing.');
  return updateApplication(record, applicationId, application => {
    if (application.workStatus !== 'submitted') throw new Error('Only submitted local delivery evidence can be reviewed.');
    return {
      ...application,
      workStatus: decision,
      decisionNote: note.trim(),
      ...appendEvent(application, decision, 'Institution reviewer · local', note.trim()),
    };
  });
}
