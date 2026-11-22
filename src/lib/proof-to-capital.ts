/**
 * APT-LABS — Proof-to-Capital Pipeline (Stage 3 — Economic Intelligence)
 *
 * Turns verified work history into financing-ready economic dossiers.
 *
 * Pipeline: productive entity registration → asset/capacity documentation →
 * work history accumulation → evidence verification → economic dossier generation
 * → financing opportunity preparation → capital deployment monitoring
 */

import { getActor } from './actors';
import { getAssetPassport, type AssetPassport } from './asset-registry';
import { listCapacityBookings } from './capacity-exchange';
import { getCommitmentsByOrganization, getCommitmentsByActor } from './commitment-graph';
import { getDisputesForEvidence, getVerificationEventsForEvidence } from './evidence-provenance';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductiveEntityType = 'individual' | 'crew' | 'enterprise' | 'cooperative' | 'institution';
export type EntityStatus = 'active' | 'inactive' | 'suspended';

export interface ProductiveEntity {
  id: string;
  actorId: string;
  organizationId?: string;
  name: string;
  type: ProductiveEntityType;
  registeredAt: string;
  registeredBy: string;
  status: EntityStatus;
  version: number;
}

export interface EntityAssetLink {
  entityId: string;
  assetId: string;
  role: 'owner' | 'custodian' | 'operator' | 'lessee';
  linkedAt: string;
  linkedBy: string;
}

export interface WorkHistoryEntry {
  commitmentId: string;
  commitmentTitle: string;
  status: string;
  needId?: string;
  outcomeId?: string;
  evidenceIds: string[];
  completedAt?: string;
  valueKes?: number;
  role: 'provider' | 'requester' | 'coordinator';
}

export interface EconomicDossier {
  id: string;
  entityId: string;
  entityName: string;
  entityType: ProductiveEntityType;
  period: { from: string; to: string };
  operations: {
    totalCommitments: number;
    fulfilledCommitments: number;
    activeCommitments: number;
    totalOutcomes: number;
    totalEvidenceItems: number;
    verifiedEvidenceItems: number;
  };
  assets: {
    totalAssets: number;
    totalCapacity: number;
    averageUtilization: number;
    totalBookedCapacity: number;
    totalRevenue: number;
    currency: string;
  };
  performance: {
    completionRate: number;
    onTimeDeliveryRate: number;
    qualityScore: number;
    disputeRate: number;
  };
  cashFlow: {
    totalInflows: number;
    totalOutflows: number;
    netCashFlow: number;
    evidenceCount: number;
  };
  risk: {
    openDisputes: number;
    regulatoryFlags: number;
    overdueMaintenance: number;
    insuranceCoverage: boolean;
  };
  generatedAt: string;
  generatedBy: string;
  version: number;
}

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

export type FinancingOpportunityStatus = 'draft' | 'published' | 'under-review' | 'approved' | 'rejected' | 'disbursed' | 'closed';

export interface FinancingTerms {
  interestRate?: number;
  repaymentSchedule?: RepaymentScheduleItem[];
  collateral?: CollateralItem[];
  riskDisclosures: string[];
  eligibilityCriteria: string[];
  requiredApprovals: string[];
  paymentArrangements: PaymentArrangement[];
  settlementRecords: SettlementRecord[];
  exitConditions: ExitCondition[];
}

export interface RepaymentScheduleItem {
  dueDate: string;
  amount: number;
  currency: string;
  type: 'principal' | 'interest' | 'fee';
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paidAt?: string;
  evidenceIds?: string[];
}

export interface CollateralItem {
  assetId: string;
  assetName: string;
  valuation: number;
  valuationDate: string;
  valuationMethod: string;
  evidenceIds: string[];
}

export interface PaymentArrangement {
  id: string;
  fromActorId: string;
  toActorId: string;
  amount: number;
  currency: string;
  schedule: string;
  method: 'bank-transfer' | 'mobile-money' | 'cash' | 'in-kind' | 'offset';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export interface SettlementRecord {
  id: string;
  instrumentId: string;
  amount: number;
  currency: string;
  settledAt: string;
  settledBy: string;
  evidenceIds: string[];
  status: 'pending' | 'settled' | 'disputed' | 'reversed';
}

export interface ExitCondition {
  id: string;
  type: 'maturity' | 'early-repayment' | 'default' | 'conversion' | 'buyback' | 'force-majeure';
  triggerConditions: string[];
  consequences: string[];
  noticePeriodDays: number;
}

export interface FinancingOpportunity {
  id: string;
  dossierId: string;
  entityId: string;
  title: string;
  description: string;
  instrumentType: FinancingInstrumentType;
  amount: number;
  currency: string;
  terms: FinancingTerms;
  status: FinancingOpportunityStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export interface CapitalDeploymentMonitoring {
  opportunityId: string;
  period: { from: string; to: string };
  disbursements: DisbursementRecord[];
  obligations: ObligationRecord[];
  milestones: MilestoneRecord[];
  distributions: DistributionRecord[];
  closeout?: CloseoutRecord;
}

export interface DisbursementRecord {
  id: string;
  amount: number;
  currency: string;
  disbursedAt: string;
  disbursedBy: string;
  recipientActorId: string;
  purpose: string;
  evidenceIds: string[];
  status: 'pending' | 'completed' | 'failed' | 'reversed';
}

export interface ObligationRecord {
  id: string;
  description: string;
  dueDate: string;
  amount: number;
  currency: string;
  responsibleActorId: string;
  status: 'pending' | 'met' | 'overdue' | 'waived' | 'disputed';
  evidenceIds: string[];
}

export interface MilestoneRecord {
  id: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'achieved' | 'missed' | 'at-risk';
  evidenceIds: string[];
  responsibleActorId: string;
}

export interface DistributionRecord {
  id: string;
  amount: number;
  currency: string;
  distributedAt: string;
  recipientActorId: string;
  type: 'return' | 'interest' | 'dividend' | 'principal' | 'fee';
  evidenceIds: string[];
}

export interface CloseoutRecord {
  closedAt: string;
  closedBy: string;
  finalAudit: string;
  lessonsLearned: string[];
  outstandingObligations: string[];
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const ENTITIES_KEY = 'aptlabs:productive-entities';
const ENTITY_ASSETS_KEY = 'aptlabs:entity-assets';
const DOSSIERS_KEY = 'aptlabs:economic-dossiers';
const OPPORTUNITIES_KEY = 'aptlabs:financing-opportunities';
const MONITORING_KEY = 'aptlabs:capital-deployment-monitoring';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// 1. Productive Entity Registration
// ---------------------------------------------------------------------------

export interface RegisterProductiveEntityInput {
  actorId: string;
  organizationId?: string;
  name: string;
  type: ProductiveEntityType;
  createdBy: string;
  authz?: AuthzContext;
}

export function registerProductiveEntity(input: RegisterProductiveEntityInput): ProductiveEntity {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const actor = getActor(input.actorId);
  if (!actor) throw new Error(`Actor ${input.actorId} not found`);

  const entity: ProductiveEntity = {
    id: createId('entity'),
    actorId: input.actorId,
    organizationId: input.organizationId,
    name: input.name,
    type: input.type,
    registeredAt: nowIso(),
    registeredBy: input.createdBy,
    status: 'active',
    version: 1,
  };

  const entities = readJson<ProductiveEntity[]>(ENTITIES_KEY, []);
  entities.push(entity);
  writeJson(ENTITIES_KEY, entities);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId,
    action: 'record.create',
    resourceType: 'productive-entity',
    resourceId: entity.id,
    details: { name: input.name, type: input.type, organizationId: input.organizationId },
  });

  return entity;
}

export function getProductiveEntity(entityId: string): ProductiveEntity | undefined {
  return readJson<ProductiveEntity[]>(ENTITIES_KEY, []).find((e) => e.id === entityId);
}

export function listProductiveEntities(filter?: {
  actorId?: string;
  organizationId?: string;
  type?: ProductiveEntityType;
  status?: EntityStatus;
}): ProductiveEntity[] {
  return readJson<ProductiveEntity[]>(ENTITIES_KEY, []).filter((e) => {
    if (filter?.actorId && e.actorId !== filter.actorId) return false;
    if (filter?.organizationId && e.organizationId !== filter.organizationId) return false;
    if (filter?.type && e.type !== filter.type) return false;
    if (filter?.status && e.status !== filter.status) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// 2. Asset & Capacity Documentation
// ---------------------------------------------------------------------------

export interface LinkEntityAssetInput {
  entityId: string;
  assetId: string;
  role: EntityAssetLink['role'];
  linkedBy: string;
  authz?: AuthzContext;
}

export function linkEntityAsset(input: LinkEntityAssetInput): EntityAssetLink {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const entity = getProductiveEntity(input.entityId);
  if (!entity) throw new Error(`Entity ${input.entityId} not found`);

  const passport = getAssetPassport(input.assetId);
  if (!passport) throw new Error(`Asset ${input.assetId} has no passport`);

  const link: EntityAssetLink = {
    entityId: input.entityId,
    assetId: input.assetId,
    role: input.role,
    linkedAt: nowIso(),
    linkedBy: input.linkedBy,
  };

  const links = readJson<EntityAssetLink[]>(ENTITY_ASSETS_KEY, []);
  links.push(link);
  writeJson(ENTITY_ASSETS_KEY, links);

  logAuditEvent({
    accountId: input.linkedBy,
    actorId: entity.actorId,
    action: 'record.update',
    resourceType: 'entity-asset-link',
    resourceId: `${entity.id}:${input.assetId}`,
    details: { entityId: input.entityId, assetId: input.assetId, role: input.role },
  });

  return link;
}

export function getEntityAssets(entityId: string): (EntityAssetLink & { passport: ReturnType<typeof getAssetPassport> })[] {
  const links = readJson<EntityAssetLink[]>(ENTITY_ASSETS_KEY, []).filter((l) => l.entityId === entityId);
  return links.map((l) => ({
    ...l,
    passport: getAssetPassport(l.assetId)!,
  }));
}

// ---------------------------------------------------------------------------
// 3. Work History Accumulation
// ---------------------------------------------------------------------------

export interface AccumulateWorkHistoryInput {
  entityId: string;
  periodFrom: string;
  periodTo: string;
  accumulatedBy: string;
  authz?: AuthzContext;
}

export function accumulateWorkHistory(input: AccumulateWorkHistoryInput): WorkHistoryEntry[] {
  if (input.authz) {
    requirePermission(input.authz, 'economic:read');
  }

  const entity = getProductiveEntity(input.entityId);
  if (!entity) throw new Error(`Entity ${input.entityId} not found`);

  const commitments = entity.organizationId
    ? getCommitmentsByOrganization(entity.organizationId)
    : getCommitmentsByActor(entity.actorId);

  const workHistory: WorkHistoryEntry[] = [];

  for (const node of commitments) {
    const data = node.commitment.data as Record<string, unknown>;
    const providerActorIds = (data.providerActorIds ?? []) as string[];
    const responsibleActorIds = (data.responsibleActorIds ?? []) as string[];
    const isProvider = providerActorIds.includes(entity.actorId) ||
      responsibleActorIds.includes(entity.actorId);
    const isRequester = !isProvider && ((data.needId ?? '') as string).startsWith(entity.id);

    if (!isProvider && !isRequester) continue;

    const evidenceIds = (data.evidenceIds ?? []) as string[];
    const outcome = (data.outcomeId ?? undefined) as string | undefined;

    workHistory.push({
      commitmentId: node.commitment.id,
      commitmentTitle: (data.title ?? '') as string,
      status: (data.status ?? 'proposed') as string,
      needId: data.needId as string | undefined,
      outcomeId: outcome,
      evidenceIds,
      completedAt: data.status === 'fulfilled' ? node.commitment.updatedAt : undefined,
      valueKes: undefined,
      role: isProvider ? 'provider' : 'requester',
    });
  }

  return workHistory.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
}

// ---------------------------------------------------------------------------
// 4. Evidence Verification
// ---------------------------------------------------------------------------

export interface VerifyEvidenceChainInput {
  entityId: string;
  verifiedBy: string;
  authz?: AuthzContext;
}

export interface EvidenceChainResult {
  verified: number;
  disputed: number;
  unresolved: number;
  details: Array<{
    evidenceId: string;
    commitmentId: string;
    status: 'verified' | 'disputed' | 'unresolved';
    latestAction?: string;
    openDisputes: number;
  }>;
}

export function verifyEvidenceChain(input: VerifyEvidenceChainInput): EvidenceChainResult {
  if (input.authz) {
    requirePermission(input.authz, 'evidence:admin');
  }

  const entity = getProductiveEntity(input.entityId);
  if (!entity) throw new Error(`Entity ${input.entityId} not found`);

  const workHistory = accumulateWorkHistory({
    entityId: input.entityId,
    periodFrom: '1970-01-01',
    periodTo: nowIso(),
    accumulatedBy: input.verifiedBy,
  });

  let verified = 0;
  let disputed = 0;
  let unresolved = 0;
  const details: EvidenceChainResult['details'] = [];

  for (const entry of workHistory) {
    for (const evidenceId of entry.evidenceIds) {
      const events = getVerificationEventsForEvidence(evidenceId);
      const latestEvent = events[events.length - 1];
      const disputes = getDisputesForEvidence(evidenceId);
      const openDisputes = disputes.filter((d) => d.status === 'open');

      let status: 'verified' | 'disputed' | 'unresolved';
      if (latestEvent?.action === 'verified') status = 'verified';
      else if (openDisputes.length > 0) status = 'disputed';
      else status = 'unresolved';

      if (status === 'verified') verified++;
      else if (status === 'disputed') disputed++;
      else unresolved++;

      details.push({
        evidenceId,
        commitmentId: entry.commitmentId,
        status,
        latestAction: latestEvent?.action,
        openDisputes: openDisputes.length,
      });
    }
  }

  logAuditEvent({
    accountId: input.verifiedBy,
    actorId: entity.actorId,
    action: 'evidence.verify',
    resourceType: 'evidence-chain',
    resourceId: input.entityId,
    details: { verified, disputed, unresolved, total: details.length },
  });

  return { verified, disputed, unresolved, details };
}

// ---------------------------------------------------------------------------
// 5. Economic Dossier Generation
// ---------------------------------------------------------------------------

export interface GenerateEconomicDossierInput {
  entityId: string;
  periodFrom: string;
  periodTo: string;
  generatedBy: string;
  authz?: AuthzContext;
}

export function generateEconomicDossier(input: GenerateEconomicDossierInput): EconomicDossier {
  if (input.authz) {
    requirePermission(input.authz, 'economic:read');
  }

  const entity = getProductiveEntity(input.entityId);
  if (!entity) throw new Error(`Entity ${input.entityId} not found`);

  const workHistory = accumulateWorkHistory({
    entityId: input.entityId,
    periodFrom: input.periodFrom,
    periodTo: input.periodTo,
    accumulatedBy: input.generatedBy,
  });

  const entityAssets = getEntityAssets(input.entityId);
  const passports = entityAssets.map((a) => a.passport).filter((p): p is AssetPassport => Boolean(p));

  const assetIds = entityAssets.map((a) => a.assetId);
  let totalRevenue = 0;
  let currency = 'KES';

  for (const assetId of assetIds) {
    const bookings = listCapacityBookings({ assetId, bookedFrom: input.periodFrom, bookedTo: input.periodTo });
    for (const b of bookings) {
      totalRevenue += b.totalPrice;
      currency = b.priceCurrency;
    }
  }

  const fulfilledCommitments = workHistory.filter((w) => w.status === 'fulfilled').length;
  const activeCommitments = workHistory.filter((w) => w.status === 'accepted' || w.status === 'in_progress').length;
  const totalEvidenceItems = workHistory.reduce((sum, w) => sum + w.evidenceIds.length, 0);

  let verifiedEvidenceItems = 0;
  for (const eid of workHistory.flatMap((w) => w.evidenceIds)) {
    const events = getVerificationEventsForEvidence(eid);
    if (events.some((e) => e.action === 'verified')) verifiedEvidenceItems++;
  }

  let totalCapacity = 0;
  let averageUtilization = 0;
  if (passports.length > 0) {
    totalCapacity = passports.reduce((sum, p) => sum + (parseFloat(p.capacity.currentCapacity.split(' ')[0]) || 0), 0);
    averageUtilization = passports.reduce((sum, p) => sum + (p.utilization.currentUtilization || 0), 0) / passports.length;
  }

  const allEvidenceIds = workHistory.flatMap((w) => w.evidenceIds);
  const openDisputes = allEvidenceIds.flatMap((eid) => getDisputesForEvidence(eid)).filter((d) => d.status === 'open').length;

  const dossier: EconomicDossier = {
    id: createId('dossier'),
    entityId: input.entityId,
    entityName: entity.name,
    entityType: entity.type,
    period: { from: input.periodFrom, to: input.periodTo },
    operations: {
      totalCommitments: workHistory.length,
      fulfilledCommitments,
      activeCommitments,
      totalOutcomes: workHistory.filter((w) => Boolean(w.outcomeId)).length,
      totalEvidenceItems: allEvidenceIds.length,
      verifiedEvidenceItems,
    },
    assets: {
      totalAssets: passports.length,
      totalCapacity,
      averageUtilization,
      totalBookedCapacity: 0,
      totalRevenue,
      currency,
    },
    performance: {
      completionRate: workHistory.length > 0 ? fulfilledCommitments / workHistory.length : 0,
      onTimeDeliveryRate: 0,
      qualityScore: totalEvidenceItems > 0 ? verifiedEvidenceItems / totalEvidenceItems : 0,
      disputeRate: totalEvidenceItems > 0 ? openDisputes / totalEvidenceItems : 0,
    },
    cashFlow: {
      totalInflows: totalRevenue,
      totalOutflows: 0,
      netCashFlow: totalRevenue,
      evidenceCount: allEvidenceIds.length,
    },
    risk: {
      openDisputes,
      regulatoryFlags: 0,
      overdueMaintenance: passports.filter((p) => p.maintenance.nextMaintenanceDue && new Date(p.maintenance.nextMaintenanceDue) < new Date()).length,
      insuranceCoverage: passports.every((p) => p.liabilities.insurancePolicyId && p.liabilities.insuranceExpiry && new Date(p.liabilities.insuranceExpiry) > new Date()),
    },
    generatedAt: nowIso(),
    generatedBy: input.generatedBy,
    version: 1,
  };

  const dossiers = readJson<EconomicDossier[]>(DOSSIERS_KEY, []);
  dossiers.push(dossier);
  writeJson(DOSSIERS_KEY, dossiers);

  logAuditEvent({
    accountId: input.generatedBy,
    actorId: entity.actorId,
    action: 'record.create',
    resourceType: 'economic-dossier',
    resourceId: dossier.id,
    details: { entityId: input.entityId, period: { from: input.periodFrom, to: input.periodTo } },
  });

  return dossier;
}

export function getEconomicDossier(dossierId: string): EconomicDossier | undefined {
  return readJson<EconomicDossier[]>(DOSSIERS_KEY, []).find((d) => d.id === dossierId);
}

export function listEconomicDossiers(filter?: { entityId?: string; periodFrom?: string; periodTo?: string }): EconomicDossier[] {
  return readJson<EconomicDossier[]>(DOSSIERS_KEY, []).filter((d) => {
    if (filter?.entityId && d.entityId !== filter.entityId) return false;
    if (filter?.periodFrom && d.period.to < filter.periodFrom) return false;
    if (filter?.periodTo && d.period.from > filter.periodTo) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// 6. Financing Opportunity Preparation
// ---------------------------------------------------------------------------

export interface PrepareFinancingOpportunityInput {
  dossierId: string;
  instrumentType: FinancingInstrumentType;
  title: string;
  description: string;
  amount: number;
  currency: string;
  terms: FinancingTerms;
  createdBy: string;
  authz?: AuthzContext;
}

export function prepareFinancingOpportunity(input: PrepareFinancingOpportunityInput): FinancingOpportunity {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const dossier = getEconomicDossier(input.dossierId);
  if (!dossier) throw new Error(`Dossier ${input.dossierId} not found`);

  const opportunity: FinancingOpportunity = {
    id: createId('fin-opp'),
    dossierId: input.dossierId,
    entityId: dossier.entityId,
    title: input.title,
    description: input.description,
    instrumentType: input.instrumentType,
    amount: input.amount,
    currency: input.currency,
    terms: input.terms,
    status: 'draft',
    createdAt: nowIso(),
    createdBy: input.createdBy,
    updatedAt: nowIso(),
    updatedBy: input.createdBy,
    version: 1,
  };

  const opportunities = readJson<FinancingOpportunity[]>(OPPORTUNITIES_KEY, []);
  opportunities.push(opportunity);
  writeJson(OPPORTUNITIES_KEY, opportunities);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: dossier.entityId,
    action: 'record.create',
    resourceType: 'financing-opportunity',
    resourceId: opportunity.id,
    details: { dossierId: input.dossierId, instrumentType: input.instrumentType, amount: input.amount },
  });

  return opportunity;
}

export function getFinancingOpportunity(opportunityId: string): FinancingOpportunity | undefined {
  return readJson<FinancingOpportunity[]>(OPPORTUNITIES_KEY, []).find((o) => o.id === opportunityId);
}

export function listFinancingOpportunities(filter?: {
  entityId?: string;
  status?: FinancingOpportunityStatus;
  instrumentType?: FinancingInstrumentType;
}): FinancingOpportunity[] {
  return readJson<FinancingOpportunity[]>(OPPORTUNITIES_KEY, []).filter((o) => {
    if (filter?.entityId && o.entityId !== filter.entityId) return false;
    if (filter?.status && o.status !== filter.status) return false;
    if (filter?.instrumentType && o.instrumentType !== filter.instrumentType) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// 7. Capital Deployment Monitoring
// ---------------------------------------------------------------------------

export interface MonitorCapitalDeploymentInput {
  opportunityId: string;
  periodFrom: string;
  periodTo: string;
  monitoredBy: string;
  authz?: AuthzContext;
}

export function monitorCapitalDeployment(input: MonitorCapitalDeploymentInput): CapitalDeploymentMonitoring {
  if (input.authz) {
    requirePermission(input.authz, 'economic:read');
  }

  const opportunity = getFinancingOpportunity(input.opportunityId);
  if (!opportunity) throw new Error(`Opportunity ${input.opportunityId} not found`);

  const monitoring: CapitalDeploymentMonitoring = {
    opportunityId: input.opportunityId,
    period: { from: input.periodFrom, to: input.periodTo },
    disbursements: [],
    obligations: [],
    milestones: [],
    distributions: [],
  };

  const monitoringRecords = readJson<CapitalDeploymentMonitoring[]>(MONITORING_KEY, []);
  monitoringRecords.push(monitoring);
  writeJson(MONITORING_KEY, monitoringRecords);

  logAuditEvent({
    accountId: input.monitoredBy,
    actorId: opportunity.entityId,
    action: 'record.update',
    resourceType: 'capital-deployment-monitoring',
    resourceId: monitoring.opportunityId,
    details: { opportunityId: input.opportunityId },
  });

  return monitoring;
}

export function getDeploymentMonitoring(opportunityId: string): CapitalDeploymentMonitoring[] {
  return readJson<CapitalDeploymentMonitoring[]>(MONITORING_KEY, []).filter((m) => m.opportunityId === opportunityId);
}

export function updateDeploymentMonitoring(opportunityId: string, patch: Partial<CapitalDeploymentMonitoring>): CapitalDeploymentMonitoring | undefined {
  const records = readJson<CapitalDeploymentMonitoring[]>(MONITORING_KEY, []);
  const idx = records.findIndex((m) => m.opportunityId === opportunityId);
  if (idx === -1) return undefined;

  records[idx] = { ...records[idx], ...patch };
  writeJson(MONITORING_KEY, records);
  return records[idx];
}

export function closeDeploymentMonitoring(opportunityId: string, closedBy: string, reason: string): CapitalDeploymentMonitoring | undefined {
  const records = readJson<CapitalDeploymentMonitoring[]>(MONITORING_KEY, []);
  const idx = records.findIndex((m) => m.opportunityId === opportunityId);
  if (idx === -1) return undefined;

  records[idx] = {
    ...records[idx],
    closeout: {
      closedAt: nowIso(),
      closedBy,
      finalAudit: reason,
      lessonsLearned: [],
      outstandingObligations: records[idx].obligations.filter((o) => o.status !== 'met').map((o) => o.description),
    },
  };
  writeJson(MONITORING_KEY, records);
  return records[idx];
}
