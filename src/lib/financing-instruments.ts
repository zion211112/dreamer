/**
 * APT-LABS — Financing Instrument Registry (Stage 3 — Economic Intelligence)
 *
 * Registers and manages financing instruments: grants, equipment leasing,
 * asset financing, PO financing, working capital, cooperative shares, debt,
 * revenue-sharing, equity, asset-backed, project finance.
 *
 * Each instrument has explicit rights, obligations, risk disclosures,
 * eligibility, approvals, payment arrangements, settlement records,
 * exit/maturity conditions.
 */

import { getActor } from './actors';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FinancingInstrumentType =
  | 'grant'
  | 'equipment-leasing'
  | 'asset-financing'
  | 'po-financing'
  | 'working-capital'
  | 'cooperative-shares'
  | 'debt'
  | 'revenue-sharing'
  | 'equity'
  | 'asset-backed'
  | 'project-finance';

export type InstrumentStatus =
  | 'draft'
  | 'proposed'
  | 'approved'
  | 'active'
  | 'completed'
  | 'closed'
  | 'cancelled'
  | 'defaulted'
  | 'disputed';

export type InstrumentPartyRole =
  | 'lender'
  | 'borrower'
  | 'investor'
  | 'investee'
  | 'lessor'
  | 'lessee'
  | 'grantor'
  | 'grantee'
  | 'guarantor'
  | 'beneficiary';

export interface FinancingInstrumentParty {
  actorId: string;
  actorName: string;
  organizationId?: string;
  role: InstrumentPartyRole;
  responsibilities: string[];
  rights: string[];
}

export interface FinancingInstrumentTerms {
  principalAmount: number;
  currency: string;
  interestRate?: number;
  interestType?: 'fixed' | 'variable' | 'none';
  repaymentSchedule?: RepaymentScheduleItem[];
  collateral?: CollateralItem[];
  riskDisclosures: string[];
  eligibilityCriteria: string[];
  requiredApprovals: string[];
  paymentArrangements: PaymentArrangement[];
  settlementRecords: SettlementRecord[];
  exitConditions: ExitCondition[];
  maturityDate?: string;
  gracePeriodDays?: number;
  lateFeeRate?: number;
}

export interface RepaymentScheduleItem {
  id: string;
  dueDate: string;
  amount: number;
  currency: string;
  type: 'principal' | 'interest' | 'fee' | 'penalty';
  status: 'pending' | 'paid' | 'overdue' | 'waived' | 'restructured';
  paidAt?: string;
  paidAmount?: number;
  evidenceIds: string[];
}

export interface CollateralItem {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  valuation: number;
  valuationDate: string;
  valuationMethod: string;
  valuationCurrency: string;
  evidenceIds: string[];
  lienRegistered: boolean;
  lienRegistrationNumber?: string;
}

export interface PaymentArrangement {
  id: string;
  fromActorId: string;
  fromActorName: string;
  toActorId: string;
  toActorName: string;
  amount: number;
  currency: string;
  schedule: string; // cron-like or descriptive
  method: 'bank-transfer' | 'mobile-money' | 'cash' | 'in-kind' | 'offset' | 'other';
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'suspended';
  lastPaymentAt?: string;
  nextPaymentDue?: string;
  evidenceIds: string[];
}

export interface SettlementRecord {
  id: string;
  instrumentId: string;
  amount: number;
  currency: string;
  settledAt: string;
  settledBy: string;
  settledByName: string;
  type: 'disbursement' | 'repayment' | 'interest' | 'fee' | 'dividend' | 'return' | 'penalty';
  evidenceIds: string[];
  status: 'pending' | 'settled' | 'disputed' | 'reversed' | 'failed';
}

export interface ExitCondition {
  id: string;
  type: 'maturity' | 'early-repayment' | 'default' | 'conversion' | 'buyback' | 'force-majeure' | 'acquisition' | 'liquidation';
  triggerConditions: string[];
  consequences: string[];
  noticePeriodDays: number;
  effectiveDate?: string;
  executed: boolean;
}

export interface FinancingInstrument {
  id: string;
  instrumentType: FinancingInstrumentType;
  status: InstrumentStatus;
  title: string;
  description: string;
  parties: FinancingInstrumentParty[];
  terms: FinancingInstrumentTerms;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  dossierId?: string; // links to economic dossier if applicable
  dossierSummary?: string;
  relatedCommitmentIds: string[];
  relatedAssetIds: string[];
  tags: string[];
  approvals: InstrumentApproval[];
  auditTrail: InstrumentAuditEntry[];
}

export interface InstrumentApproval {
  id: string;
  approverActorId: string;
  approverActorName: string;
  approverRole: string;
  approvedAt: string;
  decision: 'approved' | 'rejected' | 'abstained';
  conditions: string[];
  evidenceIds: string[];
}

export interface InstrumentAuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  timestamp: string;
  changes: Record<string, { before: unknown; after: unknown }>;
  reason: string;
}

export interface InstrumentLifecycleState {
  instrumentId: string;
  instrumentType: FinancingInstrumentType;
  status: InstrumentStatus;
  principalAmount: number;
  currency: string;
  totalDisbursed: number;
  totalRepaid: number;
  totalOutstanding: number;
  totalInterest: number;
  totalFees: number;
  daysToMaturity?: number;
  isOverdue: boolean;
  overdueAmount: number;
  nextPaymentDue?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastActivityAt?: string;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const INSTRUMENTS_KEY = 'aptlabs:financing-instruments';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Instrument Registration
// ---------------------------------------------------------------------------

export interface RegisterInstrumentInput {
  instrumentType: FinancingInstrumentType;
  title: string;
  description: string;
  parties: FinancingInstrumentParty[];
  terms: FinancingInstrumentTerms;
  createdBy: string;
  dossierId?: string;
  dossierSummary?: string;
  relatedCommitmentIds?: string[];
  relatedAssetIds?: string[];
  tags?: string[];
  authz?: AuthzContext;
}

export function registerInstrument(input: RegisterInstrumentInput): FinancingInstrument {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const instrument: FinancingInstrument = {
    id: createId('fin-inst'),
    instrumentType: input.instrumentType,
    status: 'draft',
    title: input.title,
    description: input.description,
    parties: input.parties,
    terms: input.terms,
    createdAt: nowIso(),
    createdBy: input.createdBy,
    updatedAt: nowIso(),
    updatedBy: input.createdBy,
    version: 1,
    dossierId: input.dossierId,
    dossierSummary: input.dossierSummary,
    relatedCommitmentIds: input.relatedCommitmentIds ?? [],
    relatedAssetIds: input.relatedAssetIds ?? [],
    tags: input.tags ?? [],
    approvals: [],
    auditTrail: [],
  };

  // Add initial audit entry
  instrument.auditTrail.push({
    id: createId('audit'),
    actorId: input.createdBy,
    actorName: input.createdBy,
    action: 'instrument.registered',
    timestamp: nowIso(),
    changes: {},
    reason: 'Initial instrument registration',
  });

  const instruments = readJson<FinancingInstrument[]>(INSTRUMENTS_KEY, []);
  instruments.push(instrument);
  writeJson(INSTRUMENTS_KEY, instruments);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.createdBy,
    action: 'record.create',
    resourceType: 'financing-instrument',
    resourceId: instrument.id,
    details: { instrumentType: input.instrumentType, title: input.title, amount: input.terms.principalAmount },
  });

  return instrument;
}

export function getInstrument(instrumentId: string): FinancingInstrument | undefined {
  return readJson<FinancingInstrument[]>(INSTRUMENTS_KEY, []).find((i) => i.id === instrumentId);
}

export function listInstruments(filter?: {
  instrumentType?: FinancingInstrumentType;
  status?: InstrumentStatus;
  actorId?: string;
  organizationId?: string;
  dossierId?: string;
}): FinancingInstrument[] {
  return readJson<FinancingInstrument[]>(INSTRUMENTS_KEY, []).filter((i) => {
    if (filter?.instrumentType && i.instrumentType !== filter.instrumentType) return false;
    if (filter?.status && i.status !== filter.status) return false;
    if (filter?.dossierId && i.dossierId !== filter.dossierId) return false;
    if (filter?.actorId) {
      const hasParty = i.parties.some((p) => p.actorId === filter.actorId || p.organizationId === filter.actorId);
      if (!hasParty) return false;
    }
    if (filter?.organizationId) {
      const hasOrgParty = i.parties.some((p) => p.organizationId === filter.organizationId);
      if (!hasOrgParty) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Instrument Execution
// ---------------------------------------------------------------------------

export interface ExecuteInstrumentInput {
  instrumentId: string;
  executedBy: string;
  executionType: 'disbursement' | 'repayment' | 'interest-payment' | 'fee-payment' | 'dividend' | 'return' | 'collateral-update' | 'status-change';
  amount?: number;
  currency?: string;
  description?: string;
  evidenceIds?: string[];
  newStatus?: InstrumentStatus;
  authz?: AuthzContext;
}

export function executeInstrument(input: ExecuteInstrumentInput): FinancingInstrument {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const instruments = readJson<FinancingInstrument[]>(INSTRUMENTS_KEY, []);
  const idx = instruments.findIndex((i) => i.id === input.instrumentId);
  if (idx === -1) throw new Error(`Instrument ${input.instrumentId} not found`);

  const instrument = instruments[idx];
  const actor = getActor(input.executedBy);
  if (!actor) throw new Error(`Actor ${input.executedBy} not found`);

  // Handle status changes
  if (input.newStatus) {
    instrument.status = input.newStatus;
  }

  // Add settlement record if amount provided
  if (input.amount && input.currency) {
    const settlement: SettlementRecord = {
      id: createId('settle'),
      instrumentId: input.instrumentId,
      amount: input.amount,
      currency: input.currency,
      settledAt: nowIso(),
      settledBy: input.executedBy,
      settledByName: actor.name,
      type: input.executionType as SettlementRecord['type'],
      evidenceIds: input.evidenceIds ?? [],
      status: 'settled',
    };
    instrument.terms.settlementRecords.push(settlement);
  }

  // Add audit entry
  const changes: Record<string, { before: unknown; after: unknown }> = {};
  if (input.newStatus && instrument.status !== input.newStatus) {
    changes.status = { before: instrument.status, after: input.newStatus };
  }

  instrument.auditTrail.push({
    id: createId('audit'),
    actorId: input.executedBy,
    actorName: actor.name,
    action: `instrument.${input.executionType}`,
    timestamp: nowIso(),
    changes,
    reason: input.description ?? 'Instrument execution',
  });

  instrument.updatedAt = nowIso();
  instrument.updatedBy = input.executedBy;
  instrument.version += 1;

  instruments[idx] = instrument;
  writeJson(INSTRUMENTS_KEY, instruments);

  logAuditEvent({
    accountId: input.executedBy,
    actorId: input.executedBy,
    action: 'record.update',
    resourceType: 'financing-instrument',
    resourceId: input.instrumentId,
    details: { executionType: input.executionType, amount: input.amount, newStatus: input.newStatus },
  });

  return instrument;
}

// ---------------------------------------------------------------------------
// Approval Workflow
// ---------------------------------------------------------------------------

export interface ApproveInstrumentInput {
  instrumentId: string;
  approverActorId: string;
  approverActorName: string;
  approverRole: string;
  decision: 'approved' | 'rejected' | 'abstained';
  conditions: string[];
  evidenceIds?: string[];
  authz?: AuthzContext;
}

export function approveInstrument(input: ApproveInstrumentInput): FinancingInstrument {
  if (input.authz) {
    requirePermission(input.authz, 'economic:admin');
  }

  const instruments = readJson<FinancingInstrument[]>(INSTRUMENTS_KEY, []);
  const idx = instruments.findIndex((i) => i.id === input.instrumentId);
  if (idx === -1) throw new Error(`Instrument ${input.instrumentId} not found`);

  const instrument = instruments[idx];

  const approval: InstrumentApproval = {
    id: createId('approval'),
    approverActorId: input.approverActorId,
    approverActorName: input.approverActorName,
    approverRole: input.approverRole,
    approvedAt: nowIso(),
    decision: input.decision,
    conditions: input.conditions,
    evidenceIds: input.evidenceIds ?? [],
  };

  instrument.approvals.push(approval);

  // If all required approvals are given, update status
  const requiredApprovals = instrument.terms.requiredApprovals.length;
  const approvedCount = instrument.approvals.filter((a) => a.decision === 'approved').length;
  if (approvedCount >= requiredApprovals && instrument.status === 'draft') {
    instrument.status = 'approved';
  } else if (input.decision === 'rejected') {
    instrument.status = 'cancelled';
  }

  instrument.auditTrail.push({
    id: createId('audit'),
    actorId: input.approverActorId,
    actorName: input.approverActorName,
    action: `instrument.approval.${input.decision}`,
    timestamp: nowIso(),
    changes: {},
    reason: `Approval ${input.decision} with ${input.conditions.length} conditions`,
  });

  instrument.updatedAt = nowIso();
  instrument.updatedBy = input.approverActorId;
  instrument.version += 1;

  instruments[idx] = instrument;
  writeJson(INSTRUMENTS_KEY, instruments);

  logAuditEvent({
    accountId: input.approverActorId,
    actorId: input.approverActorId,
    action: 'record.update',
    resourceType: 'financing-instrument',
    resourceId: input.instrumentId,
    details: { decision: input.decision, conditions: input.conditions.length },
  });

  return instrument;
}

// ---------------------------------------------------------------------------
// Instrument Lifecycle Management
// ---------------------------------------------------------------------------

export interface UpdateInstrumentInput {
  instrumentId: string;
  title?: string;
  description?: string;
  parties?: FinancingInstrumentParty[];
  terms?: Partial<FinancingInstrumentTerms>;
  status?: InstrumentStatus;
  relatedCommitmentIds?: string[];
  relatedAssetIds?: string[];
  tags?: string[];
  updatedBy: string;
  authz?: AuthzContext;
}

export function updateInstrument(input: UpdateInstrumentInput): FinancingInstrument | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const instruments = readJson<FinancingInstrument[]>(INSTRUMENTS_KEY, []);
  const idx = instruments.findIndex((i) => i.id === input.instrumentId);
  if (idx === -1) return undefined;

  const instrument = instruments[idx];
  const actor = getActor(input.updatedBy);
  if (!actor) throw new Error(`Actor ${input.updatedBy} not found`);

  const changes: Record<string, { before: unknown; after: unknown }> = {};

  if (input.title && input.title !== instrument.title) {
    changes.title = { before: instrument.title, after: input.title };
    instrument.title = input.title;
  }
  if (input.description && input.description !== instrument.description) {
    changes.description = { before: instrument.description, after: input.description };
    instrument.description = input.description;
  }
  if (input.parties) {
    changes.parties = { before: instrument.parties, after: input.parties };
    instrument.parties = input.parties;
  }
  if (input.terms) {
    changes.terms = { before: instrument.terms, after: input.terms };
    instrument.terms = { ...instrument.terms, ...input.terms };
  }
  if (input.status && input.status !== instrument.status) {
    changes.status = { before: instrument.status, after: input.status };
    instrument.status = input.status;
  }
  if (input.relatedCommitmentIds) {
    changes.relatedCommitmentIds = { before: instrument.relatedCommitmentIds, after: input.relatedCommitmentIds };
    instrument.relatedCommitmentIds = input.relatedCommitmentIds;
  }
  if (input.relatedAssetIds) {
    changes.relatedAssetIds = { before: instrument.relatedAssetIds, after: input.relatedAssetIds };
    instrument.relatedAssetIds = input.relatedAssetIds;
  }
  if (input.tags) {
    changes.tags = { before: instrument.tags, after: input.tags };
    instrument.tags = input.tags;
  }

  instrument.auditTrail.push({
    id: createId('audit'),
    actorId: input.updatedBy,
    actorName: actor.name,
    action: 'instrument.updated',
    timestamp: nowIso(),
    changes,
    reason: 'Instrument update',
  });

  instrument.updatedAt = nowIso();
  instrument.updatedBy = input.updatedBy;
  instrument.version += 1;

  instruments[idx] = instrument;
  writeJson(INSTRUMENTS_KEY, instruments);

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: input.updatedBy,
    action: 'record.update',
    resourceType: 'financing-instrument',
    resourceId: input.instrumentId,
    details: { changes: Object.keys(changes) },
  });

  return instrument;
}

export function closeInstrument(instrumentId: string, closedBy: string, reason: string, authz?: AuthzContext): FinancingInstrument | undefined {
  if (authz) {
    requirePermission(authz, 'economic:admin');
  }

  const instruments = readJson<FinancingInstrument[]>(INSTRUMENTS_KEY, []);
  const idx = instruments.findIndex((i) => i.id === instrumentId);
  if (idx === -1) return undefined;

  const instrument = instruments[idx];
  instrument.status = 'closed';

  instrument.auditTrail.push({
    id: createId('audit'),
    actorId: closedBy,
    actorName: closedBy,
    action: 'instrument.closed',
    timestamp: nowIso(),
    changes: {},
    reason,
  });

  instrument.updatedAt = nowIso();
  instrument.updatedBy = closedBy;
  instrument.version += 1;

  instruments[idx] = instrument;
  writeJson(INSTRUMENTS_KEY, instruments);

  logAuditEvent({
    accountId: closedBy,
    actorId: closedBy,
    action: 'record.update',
    resourceType: 'financing-instrument',
    resourceId: instrumentId,
    details: { status: 'closed', reason },
  });

  return instrument;
}

// ---------------------------------------------------------------------------
// Lifecycle Tracking
// ---------------------------------------------------------------------------

export function getInstrumentLifecycle(instrumentId: string): InstrumentLifecycleState | undefined {
  const instrument = getInstrument(instrumentId);
  if (!instrument) return undefined;

  const disbursements = instrument.terms.settlementRecords.filter((s) => s.type === 'disbursement' && s.status === 'settled');
  const repayments = instrument.terms.settlementRecords.filter((s) => s.type === 'repayment' && s.status === 'settled');
  const interestPayments = instrument.terms.settlementRecords.filter((s) => s.type === 'interest' && s.status === 'settled');
  const feePayments = instrument.terms.settlementRecords.filter((s) => s.type === 'fee' && s.status === 'settled');

  const totalDisbursed = disbursements.reduce((sum, s) => sum + s.amount, 0);
  const totalRepaid = repayments.reduce((sum, s) => sum + s.amount, 0);
  const totalInterest = interestPayments.reduce((sum, s) => sum + s.amount, 0);
  const totalFees = feePayments.reduce((sum, s) => sum + s.amount, 0);
  const totalOutstanding = Math.max(0, totalDisbursed - totalRepaid);

  const overdueRepayments = instrument.terms.repaymentSchedule?.filter((r) => r.status === 'overdue') ?? [];
  const isOverdue = overdueRepayments.length > 0;
  const overdueAmount = overdueRepayments.reduce((sum, r) => sum + r.amount, 0);

  const maturityDate = instrument.terms.maturityDate;
  const daysToMaturity = maturityDate ? Math.ceil((new Date(maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : undefined;

  const lastActivity = instrument.auditTrail.length > 0
    ? instrument.auditTrail[instrument.auditTrail.length - 1].timestamp
    : instrument.createdAt;

  const riskLevel = isOverdue ? 'critical' :
    totalOutstanding > instrument.terms.principalAmount * 0.8 ? 'high' :
    totalOutstanding > instrument.terms.principalAmount * 0.5 ? 'medium' : 'low';

  return {
    instrumentId,
    instrumentType: instrument.instrumentType,
    status: instrument.status,
    principalAmount: instrument.terms.principalAmount,
    currency: instrument.terms.currency,
    totalDisbursed,
    totalRepaid,
    totalOutstanding,
    totalInterest,
    totalFees,
    daysToMaturity,
    isOverdue,
    overdueAmount,
    nextPaymentDue: instrument.terms.repaymentSchedule
      ? instrument.terms.repaymentSchedule
        .filter((r) => r.status === 'pending')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate
      : undefined,
    riskLevel,
    lastActivityAt: lastActivity,
  };
}
