import { PEOPLE_NETWORK, type NetworkEntity } from './people-network';
import type { FieldSignal } from './local-workflows';

export type ExampleFieldSignal = FieldSignal & {
  assetId?: string;
  suspectedCause: string;
  evidenceOnHand: string[];
  missingChecks: string[];
  suggestedNextStep: string;
  verifiedPriority: 'not-assessed';
  authorizationStatus: 'not-authorized';
  recordBasis: 'illustrative';
};

export interface ExampleDecision {
  id: string;
  caseId: string;
  institutionId: string;
  outcome: 'approved' | 'returned' | 'declined';
  scope: string;
  reason: string;
  recordBasis: 'illustrative';
}

export interface ExampleApplication {
  id: string;
  caseId: string;
  opportunityId: string;
  applicantId: string;
  applicantName: string;
  institutionId: string;
  institutionName: string;
  summary: string;
  recordBasis: 'illustrative';
}

export interface ExampleWorkRecord {
  id: string;
  caseId: string;
  institutionId: string;
  assetId: string;
  title: string;
  summary: string;
  evidence: string[];
  recordBasis: 'illustrative';
}

export interface ExampleBrief {
  id: string;
  caseId: string;
  preparedById: string;
  preparedByName: string;
  institutionId: string;
  institutionName: string;
  assetId: string;
  assetName: string;
  title: string;
  scope: string;
  deliverables: string[];
  rightsNote: string;
  compensationNote: string;
  recordBasis: 'illustrative';
}

export interface ExampleAssetJourney {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  institutionId: string;
  institutionName: string;
  path: 'physical-build' | 'creative-work' | 'software-contribution';
  summary: string;
  recordBasis: 'illustrative';
}

const entityById = new Map(PEOPLE_NETWORK.map(entity => [entity.id, entity]));

function requireEntity(id: string, type: NetworkEntity['type']): NetworkEntity {
  const entity = entityById.get(id);
  if (!entity || entity.type !== type) {
    throw new Error(`Example fixture references missing ${type} entity "${id}".`);
  }
  return entity;
}

function exampleSignal(input: {
  id: string;
  institutionId: string;
  assetId?: string;
  title: string;
  observation: string;
  reporterUrgency: FieldSignal['urgency'];
  suggestedNextStep: string;
  missingChecks: string[];
}): ExampleFieldSignal {
  const institution = requireEntity(input.institutionId, 'institution');
  const asset = input.assetId ? requireEntity(input.assetId, 'asset') : null;
  const timestamp = '2026-10-31T00:00:00.000Z';

  return {
    id: input.id,
    institutionId: institution.id,
    institutionName: institution.name,
    ...(asset ? { assetId: asset.id, assetName: asset.name } : {}),
    location: 'Site not specified',
    title: input.title,
    details: input.observation,
    suspectedCause: 'Unknown; no cause has been assessed.',
    urgency: input.reporterUrgency,
    verifiedPriority: 'not-assessed',
    evidenceOnHand: ['Illustrative report text only; no source evidence is attached.'],
    missingChecks: input.missingChecks,
    suggestedNextStep: input.suggestedNextStep,
    authorizationStatus: 'not-authorized',
    status: 'new',
    createdAt: timestamp,
    updatedAt: timestamp,
    updates: [{
      id: `${input.id}-note`,
      text: 'Illustrative scenario only; no live report or field record exists.',
      createdAt: timestamp,
    }],
    scenario: true,
    recordBasis: 'illustrative',
  };
}

export const EXAMPLE_FIELD_SIGNALS: ExampleFieldSignal[] = [
  exampleSignal({
    id: 'scenario-pump-pressure',
    institutionId: 'mwea-water',
    assetId: 'asset-mwea-water-pump-02',
    title: 'Water pressure is intermittent',
    observation: 'A sample report describes intermittent water pressure. No measurements, visit log, or service impact evidence is attached.',
    reporterUrgency: 'soon',
    suggestedNextStep: 'Ask a qualified local maintainer to document the condition and safe inspection boundary.',
    missingChecks: ['On-site condition check', 'Pressure observations and measurement method', 'Safe access confirmation'],
  }),
  exampleSignal({
    id: 'scenario-school-power',
    institutionId: 'mwea-school',
    title: 'Classroom power drops during the afternoon',
    observation: 'A sample report describes a change in classroom power later in the day. No time-series or equipment inspection is attached.',
    reporterUrgency: 'routine',
    suggestedNextStep: 'Record when the issue is noticed and arrange a safe system inspection with the responsible institution.',
    missingChecks: ['Time-stamped observations', 'System and load inspection', 'Institution authority and access confirmation'],
  }),
  exampleSignal({
    id: 'scenario-cold-room',
    institutionId: 'lake-basin-cold-store',
    assetId: 'asset-lake-basin-cold-store-chamber-a',
    title: 'Temperature stability needs inspection',
    observation: 'A sample report requests an inspection of chamber stability. No readings, calibration record, or product-impact evidence is attached.',
    reporterUrgency: 'urgent',
    suggestedNextStep: 'Have an authorized operator document calibrated readings and the relevant handling procedure.',
    missingChecks: ['Calibrated readings and timestamps', 'Sensor and procedure checks', 'Operator-confirmed impact and safe next step'],
  }),
  exampleSignal({
    id: 'scenario-microgrid-load',
    institutionId: 'institution-solar-commons',
    assetId: 'asset-microgrid',
    title: 'Microgrid load behavior needs review',
    observation: 'A sample report describes a change in load behavior. No telemetry values, operating log, or cause assessment is included.',
    reporterUrgency: 'soon',
    suggestedNextStep: 'Compare a documented operating period with the agreed observation method before proposing any work.',
    missingChecks: ['Source and time range for observations', 'Meter and load context', 'Qualified review and safe access'],
  }),
  exampleSignal({
    id: 'scenario-tool-condition',
    institutionId: 'institution-open-design',
    assetId: 'asset-tool-library',
    title: 'Shared tool condition needs a check',
    observation: 'A sample report asks for a condition check of shared tools. No item-level inventory or maintenance log is attached.',
    reporterUrgency: 'routine',
    suggestedNextStep: 'Reconcile an item-level condition note with the library steward before suggesting repair or replacement.',
    missingChecks: ['Item identity and inventory entry', 'Condition evidence and inspection date', 'Steward-confirmed access and handling'],
  }),
];

export const EXAMPLE_DECISIONS: ExampleDecision[] = [
  {
    id: 'example-decision-pump-check',
    caseId: 'scenario-pump-pressure',
    institutionId: 'mwea-water',
    outcome: 'approved',
    scope: 'Approve only a documented condition check as an illustrative next investigative step; no repair, procurement, or work brief is authorized.',
    reason: 'A bounded observation could clarify what evidence is missing. This sample outcome grants no real-world authority.',
    recordBasis: 'illustrative',
  },
  {
    id: 'example-decision-school-returned',
    caseId: 'scenario-school-power',
    institutionId: 'mwea-school',
    outcome: 'returned',
    scope: 'Return the example for evidence and access details before considering any next step.',
    reason: 'The report has no time-stamped evidence or confirmed authority for an inspection.',
    recordBasis: 'illustrative',
  },
  {
    id: 'example-decision-cold-declined',
    caseId: 'scenario-cold-room',
    institutionId: 'lake-basin-cold-store',
    outcome: 'declined',
    scope: 'Decline this illustrative proposal to open a work process.',
    reason: 'The sample provides no calibrated readings, operator confirmation, or defined authority.',
    recordBasis: 'illustrative',
  },
];

export const EXAMPLE_APPLICATIONS: ExampleApplication[] = [
  {
    id: 'example-application-kemetos',
    caseId: 'scenario-kemetos-brief',
    opportunityId: 'kemetos-agi1-software',
    applicantId: 'person-kemoly-murage',
    applicantName: 'Kemoly Murage',
    institutionId: 'institution-apt-labs',
    institutionName: 'APT-LABS',
    summary: 'Example application for a bounded Kemetos1 software task. This is a read-only case file, not a saved application.',
    recordBasis: 'illustrative',
  },
  {
    id: 'example-application-animation',
    caseId: 'scenario-learning-animation',
    opportunityId: 'school-learning-animation',
    applicantId: 'person-kemoly-murage',
    applicantName: 'Kemoly Murage',
    institutionId: 'mwea-school',
    institutionName: 'Mwea Community School',
    summary: 'Example local draft proposal for a learning animation context. No submit action is implied.',
    recordBasis: 'illustrative',
  },
];

export const EXAMPLE_WORK_RECORDS: ExampleWorkRecord[] = [
  {
    id: 'example-work-microgrid',
    caseId: 'scenario-microgrid-load',
    institutionId: 'institution-solar-commons',
    assetId: 'asset-microgrid',
    title: 'Microgrid load behavior review',
    summary: 'Read-only review note for the shared solar microgrid. No deployment, settlement, or verified action is implied.',
    evidence: ['Documented issue narrative', 'Local review boundary', 'No live telemetry or settlement data'],
    recordBasis: 'illustrative',
  },
  {
    id: 'example-work-kemetos',
    caseId: 'scenario-kemetos-brief',
    institutionId: 'institution-apt-labs',
    assetId: 'asset-kemetos1',
    title: 'Kemetos1 contribution evidence',
    summary: 'Illustrative evidence trail for a software contribution, separate from a credential or accepted claim.',
    evidence: ['Scoped brief', 'Review note', 'Acceptance criteria not yet adopted'],
    recordBasis: 'illustrative',
  },
];

export const EXAMPLE_BRIEF: ExampleBrief = {
  id: 'example-brief-kemoly-local',
  caseId: 'scenario-kemetos-brief',
  preparedById: 'person-kemoly-murage',
  preparedByName: 'Kemoly Murage',
  institutionId: 'institution-apt-labs',
  institutionName: 'APT-LABS',
  assetId: 'asset-kemetos1',
  assetName: 'Kemetos1',
  title: 'Kemoly local example brief',
  scope: 'Frame a bounded Kemetos1 contribution with explicit review criteria, a defined output, and a local-only evidence trail. No production work, settlement, or credential is implied.',
  deliverables: ['Contribution plan', 'Evidence list', 'Review criteria'],
  rightsNote: 'Example draft only — no published rights, transfer, or credential claim is created.',
  compensationNote: 'Compensation and rights remain unspecified in this browser-local example and are not billed or issued.',
  recordBasis: 'illustrative',
};

export const EXAMPLE_ASSET_JOURNEYS: ExampleAssetJourney[] = [
  {
    id: 'journey-microgrid',
    title: 'Community Solar Microgrid',
    assetId: 'asset-microgrid',
    assetName: 'Community Solar Microgrid',
    institutionId: 'institution-solar-commons',
    institutionName: 'Solar Commons Cooperative',
    path: 'physical-build',
    summary: 'Observation → steward decision → local example path for a community asset case without live settlement or Roll proof.',
    recordBasis: 'illustrative',
  },
  {
    id: 'journey-school-animation',
    title: 'Learning animation',
    assetId: 'asset-school-management-console',
    assetName: 'School Management Console',
    institutionId: 'mwea-school',
    institutionName: 'Mwea Community School',
    path: 'creative-work',
    summary: 'Example learning brief and application path for a school animation contribution, with no institution submit event.',
    recordBasis: 'illustrative',
  },
  {
    id: 'journey-kemetos',
    title: 'Kemetos1 software contribution',
    assetId: 'asset-kemetos1',
    assetName: 'Kemetos1',
    institutionId: 'institution-apt-labs',
    institutionName: 'APT-LABS',
    path: 'software-contribution',
    summary: 'Example contribution flow for Kemetos1 with output evidence and credential-eligibility framing, not credential issuance.',
    recordBasis: 'illustrative',
  },
];
