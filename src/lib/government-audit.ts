/**
 * APT-LABS — Government software audit data.
 *
 * Kenyans can audit existing government software systems and propose developers
 * who can outdo current providers — many of which are Western or offshore firms.
 * Each system can be registered as a RESOURCE asset; Kenyans post audit
 * intentions; developers match and propose replacements.
 */

import { postNeed } from './commitment-journey';
import { type RecordEnvelope } from './record-envelope';
import { matchNeeds, type Provider } from './matching';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';

export interface GovernmentSystem {
  id: string;
  name: string;
  purpose: string;
  provider: string;
  county: string;
  sector: string;
  annualBudgetKes?: number;
  knownIssues: string[];
  capabilityRequired: string[];
  replacementOpportunity: string;
}

export const GOVERNMENT_SYSTEMS: GovernmentSystem[] = [
  {
    id: 'gov-nhif-claims',
    name: 'NHIF e-Claims / portal',
    purpose: 'National Hospital Insurance Fund claims, membership, hospital reimbursement',
    provider: 'Local Kenyan IT firms + offshore vendors (historically Indian outsourcing)',
    county: 'Nairobi',
    sector: 'Health',
    annualBudgetKes: undefined,
    knownIssues: [
      'Claims processing speed',
      'Fraud detection gaps',
      'Hospital reimbursement delays',
      'Reimbursement transparency',
    ],
    capabilityRequired: ['claims-processing', 'fraud-detection', 'reimbursement-transparency'],
    replacementOpportunity: 'Faster claims adjudication with open audit trail',
  },
  {
    id: 'gov-kra-itax',
    name: 'KRA iTax',
    purpose: 'Tax filing, payment, and collection',
    provider: 'KRA IT + systems integrators (reported Oracle/Microsoft stack elements)',
    county: 'Nairobi',
    sector: 'Finance',
    knownIssues: ['Filing UX complexity', 'Payment reconciliation', 'Audit trail integrity', 'Downtime during filing periods'],
    capabilityRequired: ['tax-filing', 'payment-reconciliation', 'audit-trail'],
    replacementOpportunity: 'Simpler filing interface with real-time receipt verification',
  },
  {
    id: 'gov-ecitizen',
    name: 'eCitizen',
    purpose: 'Government services portal (passports, permits, business registration)',
    provider: 'ICT Authority + various vendors',
    county: 'Nairobi',
    sector: 'Public Administration',
    knownIssues: ['Service discoverability', 'Payment integration', 'Identity verification', 'Service downtime'],
    capabilityRequired: ['service-discovery', 'identity-verification', 'payment-integration'],
    replacementOpportunity: 'Community-built service directory with real-time status and user ratings',
  },
  {
    id: 'gov-ifmis',
    name: 'IFMIS',
    purpose: 'Integrated financial management — government accounting, budget execution, procurement',
    provider: 'ERP vendors (SAP/Oracle implementations) + local systems integrators',
    county: 'Nairobi',
    sector: 'Finance',
    knownIssues: ['Budget transparency', 'Procurement audit', 'Fund flow tracking', 'Payment delay visibility'],
    capabilityRequired: ['budget-transparency', 'procurement-audit', 'fund-flow-tracking'],
    replacementOpportunity: 'Open procurement ledger with verifiable bid evaluation and award records',
  },
  {
    id: 'gov-ardhisasa',
    name: 'Ardhisasa',
    purpose: 'Land registry digitization — title search, transfer, registration',
    provider: 'Ministry of Lands + ICT Authority + vendors',
    county: 'Nairobi',
    sector: 'Lands',
    knownIssues: ['Title search speed', 'Fraud prevention', 'Boundary verification', 'Record digitization backlog'],
    capabilityRequired: ['land-title-search', 'boundary-verification', 'fraud-prevention'],
    replacementOpportunity: 'Community land record verification with crowd-sourced boundary evidence',
  },
  {
    id: 'gov-nims',
    name: 'NIMS / Huduma Namba',
    purpose: 'National identity biometrics — enrolment, deduplication, verification',
    provider: 'Thales / Gemalto (historically) + local integrators',
    county: 'Nairobi',
    sector: 'Home Affairs',
    knownIssues: ['Biometric data security', 'Deduplication accuracy', 'Enrolment access in rural areas'],
    capabilityRequired: ['biometric-verification', 'deduplication', 'enrolment-access'],
    replacementOpportunity: 'Open identity verification API with local custody and audit',
  },
  {
    id: 'gov-helb',
    name: 'HELB portal',
    purpose: 'Higher education student loans — application, disbursement, repayment',
    provider: 'HELB IT + vendors',
    county: 'Nairobi',
    sector: 'Education',
    knownIssues: ['Loan disbursement tracking', 'Repayment transparency', 'Defaulter communication'],
    capabilityRequired: ['loan-disbursement-tracking', 'repayment-transparency'],
    replacementOpportunity: 'Student loan dashboard with verifiable disbursement proof and repayment schedule',
  },
  {
    id: 'gov-tveta',
    name: 'TVETA accreditation system',
    purpose: 'Technical/vocational institution accreditation and quality assurance',
    provider: 'TVETA + vendors',
    county: 'Nairobi',
    sector: 'Education',
    knownIssues: ['Provider quality data', 'Audit trails', 'Inspection records', 'Graduate outcomes'],
    capabilityRequired: ['provider-quality-tracking', 'inspection-records', 'graduate-outcomes'],
    replacementOpportunity: 'Public TVET provider scorecard with verified graduate placement data',
  },
  {
    id: 'gov-kncc',
    name: 'KNEC examination system',
    purpose: 'National exam management — registration, results, certificates',
    provider: 'KNEC IT + vendors',
    county: 'Nairobi',
    sector: 'Education',
    knownIssues: ['Result integrity', 'Exam leakage prevention', 'Certificate verification', 'Result release timing'],
    capabilityRequired: ['result-integrity', 'exam-leakage-prevention', 'certificate-verification'],
    replacementOpportunity: 'Open examination integrity log with verifiable result anchors',
  },
  {
    id: 'gov-eprocurement',
    name: 'e-Procurement (IFMIS module)',
    purpose: 'Government tender management — bid publication, evaluation, award',
    provider: 'National Treasury + ICT Authority + vendors',
    county: 'Nairobi',
    sector: 'Finance',
    knownIssues: ['Tender transparency', 'Bid evaluation audit', 'Award justification', 'Corruption risk'],
    capabilityRequired: ['tender-transparency', 'bid-evaluation-audit', 'award-justification'],
    replacementOpportunity: 'Public tender observatory with verifiable bid evaluation and conflict-of-interest flags',
  },
  {
    id: 'gov-epermit',
    name: 'e-Permit / immigration',
    purpose: 'Immigration services — work permits, visas, citizenship',
    provider: 'Department of Immigration + vendors',
    county: 'Nairobi',
    sector: 'Home Affairs',
    knownIssues: ['Permit processing times', 'Fee transparency', 'Application status visibility'],
    capabilityRequired: ['permit-processing', 'fee-transparency', 'status-visibility'],
    replacementOpportunity: 'Community permit tracking with verified processing time benchmarks',
  },
];

export interface AuditIntentionInput {
  systemId: string;
  failureMode: string;
  actorId: string;
  postedBy: string;
  requires?: string[];
  authz?: AuthzContext;
}

/**
 * Post an audit intention against a government system. Creates an INTENTION
 * record of type `Audit` via postNeed, gated by `intention:write`.
 */
export function postAuditIntention(input: AuditIntentionInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'intention:write');
  }

  const system = GOVERNMENT_SYSTEMS.find((s) => s.id === input.systemId);
  if (!system) throw new Error(`Government system not found: ${input.systemId}`);

  const record = postNeed({
    need: `Audit: ${system.name} — ${input.failureMode}`,
    actorId: input.actorId,
    postedBy: input.postedBy,
    requires: input.requires ?? system.capabilityRequired,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.postedBy,
    actorId: input.actorId,
    action: 'intention.create',
    resourceType: 'intention',
    resourceId: record.id,
    details: { systemId: input.systemId, failureMode: input.failureMode },
  });

  return record;
}

/**
 * List all government systems, optionally filtered by county or sector.
 */
export function listGovernmentSystems(filter?: { county?: string; sector?: string }): GovernmentSystem[] {
  return GOVERNMENT_SYSTEMS.filter((s) => {
    if (filter?.county && s.county !== filter.county) return false;
    if (filter?.sector && s.sector !== filter.sector) return false;
    return true;
  });
}

/**
 * Get a government system by id.
 */
export function getGovernmentSystem(id: string): GovernmentSystem | undefined {
  return GOVERNMENT_SYSTEMS.find((s) => s.id === id);
}

/**
 * Match providers (developers) who can audit or replace a government system.
 * Uses the declarative matching engine: a provider matches when it offers a
 * capability in one of the system's required categories.
 */
export function matchAuditProviders(intentionId: string, providers: Provider[]) {
  return matchNeeds([intentionId], providers);
}

/**
 * Find audit intentions with no matching provider (the concrete gaps).
 */
export function findMissingAuditProvisions(matchings: ReturnType<typeof matchNeeds>) {
  return matchings.filter((m) => m.isMissing);
}