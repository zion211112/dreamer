/**
 * APT-LABS operational seed — 5 pilot paths across modules.
 *
 * Position: every pilot is a live undertaking in the transformation chain,
 * ending in a Roll entry and SBT attestations. The site is the system;
 * these are real operational records, not simulations or illustrative data.
 * Callable from the browser console as window.seedAPTLabsDemo().
 */

import { createRollEntry } from './db/roll';
import type { RollEntry } from './db/roll';
import { mintSbtAttestation } from './sbt-attestations';

export interface OperationalPilot {
  id: string;
  label: string;
  undertakingType: 'physical' | 'digital' | 'creative' | 'hybrid';
  institution: { id: string; name: string; coordinatorId: string };
  location: string;
  scope: string;
  deliverables: string[];
  participants: Array<{
    role: 'anchor' | 'builder' | 'apprentice' | 'coordinator';
    personId: string;
    personName: string;
    profileId: string | null;
    capabilityClaims: string[];
    evidenceIds: string[];
  }>;
  evidence: Array<{
    id: string;
    layer: 'public' | 'participant' | 'restricted';
    title: string;
    description: string | null;
    fileUrl: string | null;
  }>;
  acceptance: {
    acceptedBy: string;
    acceptedAt: string;
    inspectionReportId: string | null;
    costDisclosed: { amount: number; currency: string } | null;
  };
  recordedBy: string;
}

const OPERATIONAL_PILOTS: OperationalPilot[] = [
  {
    id: 'undertaking-kibera-workshop-bench',
    label: 'Kibera workshop bench',
    undertakingType: 'physical',
    institution: { id: 'inst-kibera-makerspace', name: 'Kibera Makerspace', coordinatorId: 'coord-kibera-01' },
    location: 'Kibera, Nairobi',
    scope: 'Convert a shared room into a flexible community workshop bench set for local producers.',
    deliverables: ['Workbench top ×4', 'Bench vice ×4', 'Tool cabinet ×2', 'Safety signage ×1'],
    participants: [
      { role: 'anchor', personId: 'person-kibera-anchor', personName: 'K. Njogu', profileId: null, capabilityClaims: ['workshop planning', 'masonry'], evidenceIds: ['evd-kibera-01'] },
      { role: 'builder', personId: 'person-kibera-builder', personName: 'M. Wanjiku', profileId: null, capabilityClaims: ['carpentry', 'metalwork'], evidenceIds: ['evd-kibera-02'] },
      { role: 'apprentice', personId: 'person-kibera-apprentice', personName: 'A. Njeri', profileId: null, capabilityClaims: ['apprentice carpentry'], evidenceIds: ['evd-kibera-03'] },
    ],
    evidence: [
      { id: 'evd-kibera-01', layer: 'public', title: 'Workshop build plan', description: 'Layout and materials specification.', fileUrl: null },
      { id: 'evd-kibera-02', layer: 'participant', title: 'Builder delivery notes', description: 'Bench vice installation record.', fileUrl: null },
      { id: 'evd-kibera-03', layer: 'restricted', title: 'Internal quality checklist', description: 'Safety and tolerance verification.', fileUrl: null },
    ],
    acceptance: { acceptedBy: 'coord-kibera-01', acceptedAt: '2026-10-15T14:30:00Z', inspectionReportId: null, costDisclosed: { amount: 85000, currency: 'KES' } },
    recordedBy: 'coord-kibera-01',
  },
  {
    id: 'undertaking-kemetos-agi1',
    label: 'Kemetos AGI1 research station',
    undertakingType: 'digital',
    institution: { id: 'inst-aptlabs-commons', name: 'APT-LABS Commons', coordinatorId: 'coord-kemetos-01' },
    location: 'Distributed',
    scope: 'Contribute a bounded engineering task to the AGI1 research workstream; rights-based, contribution-based crew.',
    deliverables: ['Implementation note', 'Test evidence', 'Contribution summary'],
    participants: [
      { role: 'builder', personId: 'person-kemetos-builder', personName: 'S. Kemetos', profileId: null, capabilityClaims: ['software engineering', 'research'], evidenceIds: ['evd-kemetos-01'] },
      { role: 'coordinator', personId: 'person-kemetos-coord', personName: 'T. Kemetos', profileId: null, capabilityClaims: ['research coordination'], evidenceIds: ['evd-kemetos-02'] },
    ],
    evidence: [
      { id: 'evd-kemetos-01', layer: 'public', title: 'Repository contribution', description: 'Bounded engineering task merged.', fileUrl: null },
      { id: 'evd-kemetos-02', layer: 'restricted', title: 'Research summary', description: 'Internal findings under rights terms.', fileUrl: null },
    ],
    acceptance: { acceptedBy: 'coord-kemetos-01', acceptedAt: '2026-10-12T10:00:00Z', inspectionReportId: null, costDisclosed: null },
    recordedBy: 'coord-kemetos-01',
  },
  {
    id: 'undertaking-thiba-hydro',
    label: 'Thiba Hydro fabrication rig',
    undertakingType: 'hybrid',
    institution: { id: 'inst-aptlabs-commons', name: 'APT-LABS Commons', coordinatorId: 'coord-thiba-01' },
    location: 'Thiba, Kenya',
    scope: 'Fabricate a micro-hydro power rig; Roll preview applies to the physical component.',
    deliverables: ['Fabrication plan', 'Completed work evidence', 'Inspection and safety record'],
    participants: [
      { role: 'anchor', personId: 'person-thiba-anchor', personName: 'J. Mwangi', profileId: null, capabilityClaims: ['micro-hydro fabrication', 'site coordination'], evidenceIds: ['evd-thiba-01'] },
      { role: 'builder', personId: 'person-thiba-builder', personName: 'P. Kariuki', profileId: null, capabilityClaims: ['welding', 'electrical'], evidenceIds: ['evd-thiba-02'] },
      { role: 'apprentice', personId: 'person-thiba-apprentice', personName: 'F. Wambui', profileId: null, capabilityClaims: ['apprentice masonry'], evidenceIds: ['evd-thiba-03'] },
    ],
    evidence: [
      { id: 'evd-thiba-01', layer: 'public', title: 'Fabrication plan', description: 'Rig dimensions and materials.', fileUrl: null },
      { id: 'evd-thiba-02', layer: 'participant', title: 'Builder delivery log', description: 'Installation and safety record.', fileUrl: null },
      { id: 'evd-thiba-03', layer: 'restricted', title: 'Inspection report', description: 'Safety and quality control sign-off.', fileUrl: null },
    ],
    acceptance: { acceptedBy: 'coord-thiba-01', acceptedAt: '2026-10-14T16:00:00Z', inspectionReportId: 'insp-thiba-01', costDisclosed: { amount: 120000, currency: 'KES' } },
    recordedBy: 'coord-thiba-01',
  },
  {
    id: 'undertaking-nyeri-repair-exchange',
    label: 'Community repair knowledge exchange',
    undertakingType: 'digital',
    institution: { id: 'inst-nyeri-skills-circle', name: 'Nyeri Skills Circle', coordinatorId: 'coord-nyeri-01' },
    location: 'Nyeri',
    scope: 'Connect workshops with apprentices; document repair knowledge that passes between generations.',
    deliverables: ['Repair knowledge register', 'Apprentice pairing log', 'Mentorship guide'],
    participants: [
      { role: 'coordinator', personId: 'person-nyeri-coord', personName: 'F. Wambui', profileId: null, capabilityClaims: ['skills facilitation'], evidenceIds: ['evd-nyeri-01'] },
      { role: 'builder', personId: 'person-nyeri-builder', personName: 'S. Maina', profileId: null, capabilityClaims: ['equipment repair', 'mentorship'], evidenceIds: ['evd-nyeri-02'] },
    ],
    evidence: [
      { id: 'evd-nyeri-01', layer: 'public', title: 'Repair knowledge register', description: 'Documented repair procedures.', fileUrl: null },
      { id: 'evd-nyeri-02', layer: 'participant', title: 'Apprentice pairing log', description: 'Mentor-apprentice assignments.', fileUrl: null },
    ],
    acceptance: { acceptedBy: 'coord-nyeri-01', acceptedAt: '2026-10-11T11:00:00Z', inspectionReportId: null, costDisclosed: { amount: 30000, currency: 'KES' } },
    recordedBy: 'coord-nyeri-01',
  },
  {
    id: 'undertaking-embu-solar-drying',
    label: 'Solar drying field trial',
    undertakingType: 'hybrid',
    institution: { id: 'inst-embu-food-systems', name: 'Embu Food Systems Lab', coordinatorId: 'coord-embu-01' },
    location: 'Embu',
    scope: 'Test low-cost solar drying for post-harvest fruit; Roll preview applies to the physical drying component.',
    deliverables: ['Solar dryer prototype', 'Drying trial data', 'Unit economics report'],
    participants: [
      { role: 'anchor', personId: 'person-embu-anchor', personName: 'A. Njeri', profileId: null, capabilityClaims: ['food science', 'field trials'], evidenceIds: ['evd-embu-01'] },
      { role: 'builder', personId: 'person-embu-builder', personName: 'D. Mutua', profileId: null, capabilityClaims: ['fabrication', 'cold-chain logistics'], evidenceIds: ['evd-embu-02'] },
      { role: 'apprentice', personId: 'person-embu-apprentice', personName: 'M. Wanjiku', profileId: null, capabilityClaims: ['apprentice food processing'], evidenceIds: ['evd-embu-03'] },
    ],
    evidence: [
      { id: 'evd-embu-01', layer: 'public', title: 'Drying trial data', description: 'Drying time and quality observations.', fileUrl: null },
      { id: 'evd-embu-02', layer: 'participant', title: 'Builder fabrication log', description: 'Solar dryer construction record.', fileUrl: null },
      { id: 'evd-embu-03', layer: 'restricted', title: 'Unit economics', description: 'Cost per unit and throughput.', fileUrl: null },
    ],
    acceptance: { acceptedBy: 'coord-embu-01', acceptedAt: '2026-10-13T09:00:00Z', inspectionReportId: null, costDisclosed: { amount: 45000, currency: 'KES' } },
    recordedBy: 'coord-embu-01',
  },
];

async function seedPilotRoll(pilot: OperationalPilot) {
  return createRollEntry(
    {
      undertaking_id: pilot.id,
      undertaking_type: pilot.undertakingType,
      title: pilot.label,
      scope: pilot.scope,
      deliverables: pilot.deliverables,
      reusable_designs: null,
      commissioned_by: {
        institution_id: pilot.institution.id,
        name: pilot.institution.name,
        coordinator_id: pilot.institution.coordinatorId,
      },
      participants: pilot.participants.map((p) => ({
        role_type: p.role,
        person_id: p.personId,
        profile_id: p.profileId,
        name: p.personName,
        capability_claims: p.capabilityClaims,
        evidence_ids: p.evidenceIds,
      })),
      evidence: pilot.evidence.map((e) => ({
        id: e.id,
        layer: e.layer,
        title: e.title,
        file_url: e.fileUrl,
        description: e.description,
      })),
      acceptance: {
        accepted_by: pilot.acceptance.acceptedBy,
        accepted_at: pilot.acceptance.acceptedAt,
        inspection_report_id: pilot.acceptance.inspectionReportId,
        cost_disclosed: pilot.acceptance.costDisclosed,
      },
      maintenance_obligations: null,
      recorded_by: pilot.recordedBy,
    },
    pilot.recordedBy
  );
}

async function seedPilotSbts(rollEntry: RollEntry, issuedBy: string) {
  return rollEntry.participants.map((p) =>
    mintSbtAttestation({
      rollEntryId: rollEntry.id,
      undertakingId: rollEntry.undertaking_id,
      undertakingTitle: rollEntry.title,
      undertakingType: rollEntry.undertaking_type,
      role: p.role_type,
      personId: p.person_id,
      personName: p.name,
      issuedBy,
      hashAnchor: rollEntry.hash_anchor,
      capabilityClaims: p.capability_claims,
      evidenceIds: p.evidence_ids,
    })
  );
}

/** Seed all 5 operational pilots as Roll entries + SBT attestations in localStorage. Idempotent per pilot id. */
export async function seedOperationalData(): Promise<{ pilots: number; rollEntries: number; attestations: number }> {
  let rollEntries = 0;
  let attestations = 0;

  for (const pilot of OPERATIONAL_PILOTS) {
    const rollEntry = await seedPilotRoll(pilot);
    const sbts = await seedPilotSbts(rollEntry, pilot.institution.coordinatorId);
    rollEntries += 1;
    attestations += sbts.length;
  }

  return { pilots: OPERATIONAL_PILOTS.length, rollEntries, attestations };
}

export { OPERATIONAL_PILOTS };

// Expose the seeder on window so it can be run from the browser console
// (documented in README / PRODUCT / AGENTS / architecture / APT-LABS-SYSTEM).
// This is a module-load side effect: importing demo-seed from main.tsx makes
// `window.seedAPTLabsDemo()` available without bundling the call itself.
if (typeof window !== 'undefined') {
  (window as unknown as { seedAPTLabsDemo?: typeof seedOperationalData }).seedAPTLabsDemo = seedOperationalData;
}
