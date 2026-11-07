/* ============================================================================
   APT-LABS — Demo seed data (mock proto)
   Seeds realistic sample data for the three end-to-end demo scenarios:
     1. School workshop · Kibera Makerspace · physical-asset
     2. Kemetos AGI1 · software (digital)
     3. Thiba Hydro · fabrication (hybrid)
   Writes to School Console (IndexedDB), Commons (localStorage),
   and local Workbench (localStorage).
   Call `window.seedAPTLabsDemo()` from the browser console to populate.
   ============================================================================ */

import { saveConsoleSnapshot, initialConsoleSnapshot, type ConsoleSnapshot, type SchoolTenderDraft } from './school-console-storage';
import { writeFieldSignals, readFieldSignals, type FieldSignal } from './local-workflows';
import { readLocalWorkbench, writeLocalWorkbench, createLocalApplication } from './local-workbench';

const NOW = '2026-11-07T09:00:00.000Z';

/* ------------------------------------------------------------------ */
/* 1. School Console tender drafts                                    */
/* ------------------------------------------------------------------ */

const SCHOOL_DRAFTS: SchoolTenderDraft[] = [
  {
    id: 'draft-kibera-workshop-bench',
    assetName: 'Kibera workshop bench set',
    need: 'A set of sturdy, repairable workbenches for the community workshop at Kibera Makerspace, including vices, tool storage, and safety signage. Local fabrication, local crew.',
    assetBuildCost: '85000',
    projectedAnnualYield: '120000',
    localSpendPercentage: '78',
    crewWageAllocation: { anchor: '35000', builder: '30000', apprentice: '15000' },
    economicModelNote: 'Cost recovery through workshop access fees; materials sourced within 10 km.',
    blueprintLines: [
      { id: 'bp-1', item: 'Workbench top', quantity: '4', unit: 'unit', unitCost: '12000' },
      { id: 'bp-2', item: 'Bench vice', quantity: '4', unit: 'unit', unitCost: '3500' },
      { id: 'bp-3', item: 'Tool cabinet', quantity: '2', unit: 'unit', unitCost: '8500' },
      { id: 'bp-4', item: 'Safety signage', quantity: '1', unit: 'set', unitCost: '2000' },
    ],
    createdAt: NOW,
  },
  {
    id: 'draft-kemetos-agi-station',
    assetName: 'Kemetos AGI1 research station',
    need: 'A bounded software engineering environment for AGI1 contribution work: repository access, test harness, verification pipeline, and contributor onboarding notes. Digital work; no physical asset.',
    assetBuildCost: '0',
    projectedAnnualYield: '0',
    localSpendPercentage: '100',
    crewWageAllocation: { anchor: '0', builder: '0', apprentice: '0' },
    economicModelNote: 'Contribution-based; rights and review terms set by publishing institution.',
    blueprintLines: [
      { id: 'bp-1', item: 'Implementation note', quantity: '1', unit: 'document', unitCost: '0' },
      { id: 'bp-2', item: 'Test or verification evidence', quantity: '1', unit: 'report', unitCost: '0' },
      { id: 'bp-3', item: 'Contribution summary', quantity: '1', unit: 'document', unitCost: '0' },
    ],
    createdAt: NOW,
  },
  {
    id: 'draft-thiba-hydro-rig',
    assetName: 'Thiba Hydro fabrication rig',
    need: 'A fabrication rig for Thiba Hydro site works: frame assembly, materials, safety controls, inspection method, and site access plan. Hybrid physical-digital work.',
    assetBuildCost: '120000',
    projectedAnnualYield: '200000',
    localSpendPercentage: '85',
    crewWageAllocation: { anchor: '45000', builder: '40000', apprentice: '25000' },
    economicModelNote: 'Site-based fabrication; materials and safety controls per institution specification.',
    blueprintLines: [
      { id: 'bp-1', item: 'Fabrication plan', quantity: '1', unit: 'document', unitCost: '5000' },
      { id: 'bp-2', item: 'Completed work evidence', quantity: '1', unit: 'report', unitCost: '0' },
      { id: 'bp-3', item: 'Inspection and safety record', quantity: '1', unit: 'record', unitCost: '0' },
    ],
    createdAt: NOW,
  },
];

/* ------------------------------------------------------------------ */
/* 2. Commons field signals                                           */
/* ------------------------------------------------------------------ */

const COMMONS_SIGNALS: FieldSignal[] = [
  {
    id: 'signal-kibera-workshop',
    institutionId: 'institution-kibera-makerspace',
    institutionName: 'Kibera Makerspace',
    assetName: 'Kibera workshop bench set',
    sourceConsoleDraftId: 'draft-kibera-workshop-bench',
    location: 'Kibera, Nairobi',
    title: 'Community workshop bench capacity',
    details: 'Local making capacity at Kibera Makerspace needs repairable workbenches with vices and tool storage. Observed during community repair session; no formal record exists yet.',
    urgency: 'soon',
    suspectedCause: 'Workshop tools are shared informally; no dedicated fabrication stations.',
    evidenceOnHand: ['Photos of current shared workspace', 'Notes from repair circle meeting'],
    missingChecks: ['Formal cost estimate', 'Crew availability confirmation', 'Safety inspection schedule'],
    suggestedNextStep: 'Create a School Console tender draft and link it to a workbench simulation.',
    verifiedPriority: 'soon',
    authorizationStatus: 'not-authorized',
    recordBasis: 'illustrative',
    status: 'triaged',
    createdAt: NOW,
    updatedAt: NOW,
    updates: [{
      id: 'signal-kibera-workshop-update-1',
      text: 'Tender draft created in School Console; ready for workbench simulation.',
      createdAt: NOW,
    }],
    scenario: false,
  },
  {
    id: 'signal-kemetos-agi1',
    institutionId: 'inst-demo-commons',
    institutionName: 'APT-LABS Commons (demo)',
    assetName: 'Kemetos AGI1 research station',
    sourceConsoleDraftId: 'draft-kemetos-agi-station',
    location: 'Distributed',
    title: 'AGI1 contribution environment',
    details: 'Bounded engineering task for AGI1 workstream: repository access, test harness, verification pipeline. Digital work; no physical fabrication.',
    urgency: 'routine',
    suspectedCause: 'Contributors lack a shared verification environment for AGI1 research tasks.',
    evidenceOnHand: ['Repository access request', 'Proposed test criteria'],
    missingChecks: ['Institution review method', 'Contribution rights terms', 'Verification criteria sign-off'],
    suggestedNextStep: 'Create a workbench simulation for the digital AGI1 contribution.',
    verifiedPriority: 'routine',
    authorizationStatus: 'not-authorized',
    recordBasis: 'illustrative',
    status: 'new',
    createdAt: NOW,
    updatedAt: NOW,
    updates: [],
    scenario: false,
  },
  {
    id: 'signal-thiba-hydro',
    institutionId: 'inst-demo-commons',
    institutionName: 'APT-LABS Commons (demo)',
    assetName: 'Thiba Hydro fabrication rig',
    sourceConsoleDraftId: 'draft-thiba-hydro-rig',
    location: 'Thiba, Kenya',
    title: 'Thiba Hydro site fabrication',
    details: 'Hybrid fabrication task at Thiba Hydro site: frame assembly, materials, safety controls, and inspection. Requires site access and safety plan.',
    urgency: 'urgent',
    suspectedCause: 'Site works are scheduled but no fabrication rig or inspection record exists.',
    evidenceOnHand: ['Site access request', 'Safety plan outline'],
    missingChecks: ['Materials procurement', 'Inspector assignment', 'Acceptance criteria'],
    suggestedNextStep: 'Create a hybrid workbench simulation; roll preview applies to physical component.',
    verifiedPriority: 'urgent',
    authorizationStatus: 'not-authorized',
    recordBasis: 'illustrative',
    status: 'triaged',
    createdAt: NOW,
    updatedAt: NOW,
    updates: [{
      id: 'signal-thiba-hydro-update-1',
      text: 'Tender draft created in School Console; site safety review pending.',
      createdAt: NOW,
    }],
    scenario: false,
  },
];

/* ------------------------------------------------------------------ */
/* 3. Seed function                                                   */
/* ------------------------------------------------------------------ */

export async function seedDemoData(): Promise<{
  schoolDrafts: SchoolTenderDraft[];
  commonsSignals: FieldSignal[];
  workbenchApplications: string[];
}> {
  // Seed School Console tender drafts (IndexedDB)
  const snapshot: ConsoleSnapshot = {
    ...initialConsoleSnapshot,
    tenderDrafts: [...SCHOOL_DRAFTS],
  };
  await saveConsoleSnapshot(snapshot);

  // Seed Commons field signals (localStorage)
  const existingSignals = readFieldSignals() ?? [];
  // Filter out any existing signals with the same IDs to avoid duplicates
  const newSignalIds = new Set(COMMONS_SIGNALS.map(s => s.id));
  const filteredExisting = existingSignals.filter(s => !newSignalIds.has(s.id));
  writeFieldSignals([...filteredExisting, ...COMMONS_SIGNALS]);

  // Seed local workbench applications (localStorage)
  const record = readLocalWorkbench();
  let nextRecord = record;
  const createdAppIds: string[] = [];

  const appSeeds = [
    { opportunityId: 'school-learning-animation', applicant: 'Zuri Kamau', note: 'Storyboard and short animation for a classroom learning objective. Ready to proceed once terms are published.' },
    { opportunityId: 'kemetos-agi1-software', applicant: 'Horus the Young', note: 'Bounded engineering task for AGI1 workstream. Repository access and test harness needed.' },
    { opportunityId: 'thiba-hydro-fabrication', applicant: 'Kwame Mensah', note: 'Site fabrication task. Safety controls and inspection method required before authorization.' },
  ];

  for (const seed of appSeeds) {
    if (record.applications.some(a => a.opportunityId === seed.opportunityId && a.applicant === seed.applicant)) continue;
    nextRecord = createLocalApplication(nextRecord, seed.opportunityId, seed.applicant, seed.note, true);
    createdAppIds.push(seed.opportunityId);
  }
  if (createdAppIds.length > 0) {
    writeLocalWorkbench(nextRecord);
  }

  return {
    schoolDrafts: SCHOOL_DRAFTS,
    commonsSignals: COMMONS_SIGNALS,
    workbenchApplications: createdAppIds,
  };
}

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  (window as unknown as { seedAPTLabsDemo?: () => Promise<unknown> }).seedAPTLabsDemo = seedDemoData;
}

export { SCHOOL_DRAFTS, COMMONS_SIGNALS };
