/**
 * APT-LABS — Asset Registry (Gate 1 → Gate 2 bridge)
 *
 * A productive asset — a workshop, a machine, a facility, a tool, a capacity —
 * is a RESOURCE-family record persisted through the record envelope and owned
 * by an Actor via a first-class `HOLDS` relationship.
 *
 * This module is the *permission boundary* for assets. It does not pass
 * `AuthzContext` down to the envelope/relationship stores (which would
 * re-gate on `record:write`); instead it gates itself on the `resource:*`
 * family. That is what separates an asset from a generic record: assets are
 * governed by resource permissions, scoped to the owning actor.
 *
 * Every mutation is logged to the append-only audit trail under the
 * `resource.*` actions, so the asset lifecycle is queryable and trustworthy.
 */

import {
  createRecord,
  getRecord,
  listRecords,
  updateRecord,
  type RecordEnvelope,
} from './record-envelope';

export { getRecord } from './record-envelope';
import {
  createRelationship,
  getRelationshipsForEntity,
  type PersistedRelationship,
} from './relationship-store';
import { logAuditEvent } from './audit';
import { requirePermission, canPerform, type AuthzContext } from './authz';
import { registerCapacity, listCapacityListings, type CapacityListing, type RegisterCapacityInput } from './capacity-exchange';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssetStatus = 'active' | 'retired' | 'maintenance' | 'decommissioned';

// Asset Passport Dimensions (comprehensive asset profile)
export interface AssetPassport {
  /** Ownership dimension — who legally owns the asset. */
  ownership: {
    legalOwnerId: string;           // Actor ID of legal owner
    beneficialOwnerId?: string;     // Actor ID of beneficial owner (if different)
    ownershipType: 'full' | 'shared' | 'leased' | 'licensed' | 'managed';
    ownershipSince: string;         // ISO date
    titleReference?: string;        // Legal title document reference
    encumbrances?: string[];        // Liens, mortgages, restrictions
  };

  /** Custody dimension — who physically controls/holds the asset. */
  custody: {
    custodianId: string;            // Actor ID of current custodian
    custodyType: 'owner' | 'lessee' | 'bailee' | 'operator' | 'maintainer';
    custodySince: string;           // ISO date
    locationId?: string;            // PLACE ID where asset is located
    chainOfCustody: CustodyEvent[]; // History of custody transfers
  };

  /** Condition dimension — current state and health of the asset. */
  condition: {
    status: 'operational' | 'degraded' | 'critical' | 'offline' | 'unknown';
    lastInspectionAt?: string;      // ISO date
    nextInspectionDue?: string;     // ISO date
    conditionScore?: number;        // 0-100 standardized score
    defects: Defect[];              // Known defects/issues
    certifications: Certification[]; // Active certifications
  };

  /** Capacity dimension — what the asset can do/produce. */
  capacity: {
    designCapacity: string;         // Nameplate/rated capacity
    currentCapacity: string;        // Actual current capacity
    capacityUnit: string;           // Units (e.g., "units/day", "MW", "m³/hr")
    utilizationRate?: number;       // 0-1 current utilization
    throughputHistory: ThroughputPoint[]; // Historical throughput
  };

  /** Utilization dimension — how the asset is being used. */
  utilization: {
    currentUtilization: number;     // 0-1
    averageUtilization30d?: number; // 30-day average
    peakUtilization?: number;       // Peak in period
    utilizationPattern: 'continuous' | 'batch' | 'seasonal' | 'on-demand' | 'idle';
    scheduledDowntime?: DowntimeWindow[];
    unscheduledDowntime?: DowntimeEvent[];
  };

  /** Maintenance dimension — maintenance history and schedule. */
  maintenance: {
    strategy: 'reactive' | 'preventive' | 'predictive' | 'reliability-centered';
    lastMaintenanceAt?: string;     // ISO date
    nextMaintenanceDue?: string;    // ISO date
    maintenanceHistory: MaintenanceEvent[];
    plannedMaintenance: PlannedMaintenance[];
    mtbf?: number;                  // Mean time between failures (hours)
    mttr?: number;                  // Mean time to repair (hours)
  };

  /** Liabilities dimension — risks, obligations, and costs. */
  liabilities: {
    insurancePolicyId?: string;     // Insurance policy reference
    insuranceExpiry?: string;       // ISO date
    regulatoryCompliance: ComplianceItem[]; // Regulatory requirements
    environmentalLiabilities?: EnvironmentalLiability[];
    financialObligations: FinancialObligation[]; // Leases, loans, service contracts
    riskAssessment?: RiskAssessment;
  };

  /** Evidence dimension — supporting documents and verification. */
  evidence: {
    evidenceIds: string[];          // Links to EVIDENCE records
    passportVerified: boolean;      // Whether passport has been verified
    verifiedBy?: string;            // Actor ID of verifier
    verifiedAt?: string;            // ISO date
    verificationLevel: 'self-declared' | 'third-party' | 'certified' | 'audited';
  };

  /** Performance dimension — KPIs and outcomes. */
  performance: {
    kpis: AssetKPI[];
    benchmarks: BenchmarkComparison[];
    incidents: PerformanceIncident[];
    improvements: ImprovementRecord[];
  };
}

// Supporting types for passport dimensions
export interface CustodyEvent {
  id: string;
  fromCustodianId: string;
  toCustodianId: string;
  transferredAt: string;
  reason: string;
  evidenceIds?: string[];
}

export interface Defect {
  id: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  detectedAt: string;
  status: 'open' | 'in-progress' | 'resolved' | 'deferred';
  resolvedAt?: string;
  evidenceIds?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  standard?: string;
  evidenceIds?: string[];
}

export interface ThroughputPoint {
  timestamp: string;
  value: number;
  unit: string;
  context?: string;
}

export interface DowntimeWindow {
  id: string;
  startAt: string;
  endAt: string;
  reason: string;
  planned: boolean;
}

export interface DowntimeEvent {
  id: string;
  startAt: string;
  endAt?: string;
  cause: string;
  impact: 'partial' | 'full';
  evidenceIds?: string[];
}

export interface MaintenanceEvent {
  id: string;
  type: 'inspection' | 'repair' | 'replacement' | 'calibration' | 'upgrade';
  performedAt: string;
  performedBy: string;              // Actor ID
  description: string;
  cost?: number;
  currency?: string;
  evidenceIds?: string[];
  nextDueAt?: string;
}

export interface PlannedMaintenance {
  id: string;
  type: 'inspection' | 'repair' | 'replacement' | 'calibration' | 'upgrade';
  scheduledAt: string;
  assignedTo?: string;              // Actor ID
  description: string;
  estimatedCost?: number;
  currency?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface ComplianceItem {
  id: string;
  regulation: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'exempt';
  evidenceIds?: string[];
  nextReviewAt?: string;
}

export interface EnvironmentalLiability {
  id: string;
  type: 'contamination' | 'emissions' | 'waste' | 'permit' | 'other';
  description: string;
  status: 'active' | 'remediated' | 'monitored';
  estimatedCost?: number;
  currency?: string;
}

export interface FinancialObligation {
  id: string;
  type: 'lease' | 'loan' | 'service-contract' | 'warranty' | 'insurance' | 'other';
  counterpartyId: string;           // Actor ID
  amount?: number;
  currency?: string;
  startDate: string;
  endDate?: string;
  terms?: string;
}

export interface RiskAssessment {
  id: string;
  assessedAt: string;
  assessedBy: string;               // Actor ID
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  risks: RiskItem[];
  mitigationPlan?: string;
}

export interface RiskItem {
  id: string;
  category: 'operational' | 'financial' | 'regulatory' | 'environmental' | 'safety' | 'reputational';
  description: string;
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost-certain';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
  riskScore: number;                // 1-25
  mitigation?: string;
}

export interface AssetKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: 'improving' | 'stable' | 'declining';
  period: string;                   // e.g., "2026-Q3"
  evidenceIds?: string[];
}

export interface BenchmarkComparison {
  id: string;
  benchmarkName: string;
  benchmarkValue: number;
  assetValue: number;
  unit: string;
  variance: number;                 // Percentage difference
  period: string;
}

export interface PerformanceIncident {
  id: string;
  occurredAt: string;
  type: 'failure' | 'degradation' | 'safety' | 'environmental' | 'quality';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  rootCause?: string;
  correctiveAction?: string;
  evidenceIds?: string[];
}

export interface ImprovementRecord {
  id: string;
  implementedAt: string;
  description: string;
  expectedBenefit: string;
  actualBenefit?: string;
  cost?: number;
  currency?: string;
  evidenceIds?: string[];
}

// Extended RegisterAssetInput with passport
export interface RegisterAssetInput {
  name: string;
  /** RESOURCE type discriminator (e.g. 'Asset', 'Facility', 'Equipment'). */
  type: string;
  actorId: string;
  description?: string;
  /** Operational capacity, e.g. "50 units/day", "3 bays". */
  capacity?: string;
  /** Full Asset Passport (optional, can be added later). */
  passport?: Partial<AssetPassport>;
  evidenceIds?: string[];
  createdBy: string;
  /** When provided, the call is gated by `resource:write`. */
  authz?: AuthzContext;
}

export interface Asset {
  record: RecordEnvelope;
  /** Active `HOLDS` edges pointing at this asset (its owners/stewards). */
  holdings: PersistedRelationship[];
  /** Asset Passport if available. */
  passport?: AssetPassport;
}

// Typed reader for the asset payload (stored as Record<string, unknown>).
function assetData(rec: RecordEnvelope): {
  name?: string;
  description?: string;
  capacity?: string;
  status?: AssetStatus;
  passport?: AssetPassport;
} {
  return rec.data as unknown as {
    name?: string;
    description?: string;
    capacity?: string;
    status?: AssetStatus;
    passport?: AssetPassport;
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Register a productive asset. Gated by `resource:write` when an
 * `AuthzContext` is supplied. Creates the RESOURCE record and the `HOLDS`
 * ownership edge in one attributable step, and logs `resource.create`.
 */
export function registerAsset(input: RegisterAssetInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  // Build initial passport from input or create minimal one
  const initialPassport = buildInitialPassport(input);

  const record = createRecord({
    family: 'RESOURCE',
    type: input.type,
    data: {
      name: input.name,
      description: input.description,
      capacity: input.capacity,
      status: 'active' as AssetStatus,
      passport: initialPassport,
    },
    actorId: input.actorId,
    evidenceIds: input.evidenceIds,
    createdBy: input.createdBy,
  });

  // First-class ownership: the actor HOLDS this asset (never a bare FK).
  createRelationship({
    kind: 'HOLDS',
    sourceId: input.actorId,
    targetId: record.id,
    sourceRole: 'owner',
    targetRole: 'asset',
    actorId: input.actorId,
    createdBy: input.createdBy,
  });

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId,
    action: 'resource.create',
    resourceType: 'asset',
    resourceId: record.id,
    details: { name: input.name, type: input.type },
  });

  return record;
}

function buildInitialPassport(input: RegisterAssetInput): AssetPassport {
  const now = new Date().toISOString();
  return {
    ownership: {
      legalOwnerId: input.actorId,
      ownershipType: 'full',
      ownershipSince: now,
      encumbrances: [],
    },
    custody: {
      custodianId: input.actorId,
      custodyType: 'owner',
      custodySince: now,
      chainOfCustody: [],
    },
    condition: {
      status: 'operational',
      defects: [],
      certifications: [],
    },
    capacity: {
      designCapacity: input.capacity ?? 'unspecified',
      currentCapacity: input.capacity ?? 'unspecified',
      capacityUnit: 'units',
      throughputHistory: [],
    },
    utilization: {
      currentUtilization: 0,
      utilizationPattern: 'idle',
    },
    maintenance: {
      strategy: 'preventive',
      maintenanceHistory: [],
      plannedMaintenance: [],
    },
    liabilities: {
      regulatoryCompliance: [],
      financialObligations: [],
    },
    evidence: {
      evidenceIds: input.evidenceIds ?? [],
      passportVerified: false,
      verificationLevel: 'self-declared',
    },
    performance: {
      kpis: [],
      benchmarks: [],
      incidents: [],
      improvements: [],
    },
  };
}

/**
 * Update an asset in place (capacity, description). Gated by `resource:write`.
 * Ownership is not mutated here.
 */
export function updateAsset(
  id: string,
  input: { name?: string; description?: string; capacity?: string; updatedBy: string; authz?: AuthzContext },
): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const record = getRecord(id);
  if (!record || record.family !== 'RESOURCE') return undefined;

  const current = assetData(record);
  const updated = updateRecord(id, {
    data: {
      ...record.data,
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      capacity: input.capacity ?? current.capacity,
    },
    updatedBy: input.updatedBy,
  });

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: record.actorId,
    action: 'resource.update',
    resourceType: 'asset',
    resourceId: id,
    details: { name: input.name, capacity: input.capacity },
  });

  return updated;
}

/**
 * Retire an asset — a terminal, attributable transition. The record is kept
 * and marked `retired`; ownership is preserved (you can own a retired asset).
 * Gated by `resource:admin`.
 */
export function retireAsset(
  id: string,
  reason: string,
  retiredBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  if (authz) {
    requirePermission(authz, 'resource:admin');
  }

  const record = getRecord(id);
  if (!record || record.family !== 'RESOURCE') return undefined;

  if (assetData(record).status === 'retired') return record;

  const updated = updateRecord(id, {
    data: { ...record.data, status: 'retired' as AssetStatus },
    updatedBy: retiredBy,
  });

  logAuditEvent({
    accountId: retiredBy,
    actorId: record.actorId,
    action: 'resource.delete',
    resourceType: 'asset',
    resourceId: id,
    details: { reason },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Access checks
// ---------------------------------------------------------------------------

/**
 * Whether the context may *use* this asset. Requires `resource:read`, that the
 * record is a RESOURCE, and that it is not retired (a retired asset is usable
 * only by someone with `resource:admin`, e.g. to inspect or reactivate).
 */
export function canAccessAsset(ctx: AuthzContext, assetId: string): boolean {
  if (!canPerform(ctx, 'resource:read')) return false;

  const record = getRecord(assetId);
  if (!record || record.family !== 'RESOURCE') return false;

  if (assetData(record).status === 'retired' && !canPerform(ctx, 'resource:admin')) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The asset envelope plus its active `HOLDS` ownership edges. */
export function getAsset(id: string): Asset | undefined {
  const record = getRecord(id);
  if (!record || record.family !== 'RESOURCE') return undefined;
  const holdings = getRelationshipsForEntity(id).filter((r) => r.kind === 'HOLDS');
  return { record, holdings };
}

/**
 * List assets, filtered by actor / type / status. Retired assets are excluded
 * unless requested explicitly. Newest first.
 */
export function listAssets(filter?: {
  actorId?: string;
  type?: string;
  status?: AssetStatus;
}): RecordEnvelope[] {
  const explicitStatus = filter?.status !== undefined;
  return listRecords({ family: 'RESOURCE' }).filter((r) => {
    if (filter?.actorId && r.actorId !== filter.actorId) return false;
    if (filter?.type && r.type !== filter.type) return false;
    if (explicitStatus) {
      return assetData(r).status === filter.status;
    }
    // Default: active only (the envelope default for an unmarked asset is active).
    return (assetData(r).status ?? 'active') !== 'retired';
  });
}

// ---------------------------------------------------------------------------
// Asset Passport functions
// ---------------------------------------------------------------------------

/**
 * Update an asset's passport (one or more dimensions).
 * Gated by `resource:write`.
 */
export function updateAssetPassport(
  id: string,
  passportUpdate: Partial<AssetPassport>,
  updatedBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  if (authz) {
    requirePermission(authz, 'resource:write');
  }

  const record = getRecord(id);
  if (!record || record.family !== 'RESOURCE') return undefined;

  const current = assetData(record);
  const currentPassport = current.passport ?? buildInitialPassport({
    name: current.name ?? '',
    type: record.type,
    actorId: record.actorId ?? '',
    capacity: current.capacity,
    createdBy: updatedBy,
  });

  // Deep merge passport updates
  const mergedPassport = deepMergePassport(currentPassport, passportUpdate);

  const updated = updateRecord(id, {
    data: {
      ...record.data,
      passport: mergedPassport,
    },
    updatedBy,
  });

  logAuditEvent({
    accountId: updatedBy,
    actorId: record.actorId,
    action: 'resource.update',
    resourceType: 'asset',
    resourceId: id,
    details: { passportUpdated: Object.keys(passportUpdate) },
  });

  return updated;
}

/**
 * Get the asset passport for an asset.
 */
export function getAssetPassport(id: string): AssetPassport | undefined {
  const record = getRecord(id);
  if (!record || record.family !== 'RESOURCE') return undefined;
  return assetData(record).passport;
}

/**
 * Update a specific passport dimension.
 */
export function updatePassportDimension<D extends keyof AssetPassport>(
  id: string,
  dimension: D,
  value: AssetPassport[D],
  updatedBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  return updateAssetPassport(id, { [dimension]: value } as Partial<AssetPassport>, updatedBy, authz);
}

/**
 * Add a custody transfer event to the passport.
 */
export function addCustodyTransfer(
  id: string,
  transfer: Omit<CustodyEvent, 'id'>,
  updatedBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  const passport = getAssetPassport(id);
  if (!passport) return undefined;

  const event: CustodyEvent = {
    id: `custody-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    ...transfer,
  };

  return updateAssetPassport(
    id,
    {
      custody: {
        ...passport.custody,
        custodianId: transfer.toCustodianId,
        custodyType: 'operator', // Default, could be parameterized
        custodySince: transfer.transferredAt,
        chainOfCustody: [...passport.custody.chainOfCustody, event],
      },
    },
    updatedBy,
    authz,
  );
}

/**
 * Add a maintenance event to the passport.
 */
export function addMaintenanceEvent(
  id: string,
  event: Omit<MaintenanceEvent, 'id'>,
  updatedBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  const passport = getAssetPassport(id);
  if (!passport) return undefined;

  const maintenanceEvent: MaintenanceEvent = {
    id: `maint-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    ...event,
  };

  return updateAssetPassport(
    id,
    {
      maintenance: {
        ...passport.maintenance,
        lastMaintenanceAt: event.performedAt,
        maintenanceHistory: [...passport.maintenance.maintenanceHistory, maintenanceEvent],
      },
    },
    updatedBy,
    authz,
  );
}

/**
 * Add a performance KPI to the passport.
 */
export function addPerformanceKPI(
  id: string,
  kpi: Omit<AssetKPI, 'id'>,
  updatedBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  const passport = getAssetPassport(id);
  if (!passport) return undefined;

  const kpiEvent: AssetKPI = {
    id: `kpi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    ...kpi,
  };

  return updateAssetPassport(
    id,
    {
      performance: {
        ...passport.performance,
        kpis: [...passport.performance.kpis, kpiEvent],
      },
    },
    updatedBy,
    authz,
  );
}

/**
 * Deep merge two passports (utility for partial updates).
 */
function deepMergePassport(
  base: AssetPassport,
  update: Partial<AssetPassport>,
): AssetPassport {
  const result = { ...base };
  for (const key of Object.keys(update) as (keyof AssetPassport)[]) {
    const baseValue = base[key];
    const updateValue = update[key];
    if (baseValue && updateValue && typeof baseValue === 'object' && typeof updateValue === 'object') {
      // @ts-expect-error - deep merge for nested objects
      result[key] = { ...baseValue, ...updateValue };
    } else if (updateValue !== undefined) {
      // @ts-expect-error - assigning update value
      result[key] = updateValue;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Capacity Exchange Integration
// ---------------------------------------------------------------------------

export interface OfferAssetCapacityInput extends Omit<RegisterCapacityInput, 'assetId'> {
  assetId: string;
}

/**
 * Offer an asset's capacity on the Capacity Exchange.
 * Creates a capacity listing linked to the asset's passport.
 */
export function offerAssetCapacity(input: OfferAssetCapacityInput, authz?: AuthzContext): CapacityListing {
  return registerCapacity({ ...input, authz });
}

/**
 * Get all capacity listings for a specific asset.
 */
export function getAssetCapacityListings(assetId: string): CapacityListing[] {
  return listCapacityListings({ assetId, status: 'available' });
}

/**
 * Get all capacity listings for an asset (any status).
 */
export function getAllAssetCapacityListings(assetId: string): CapacityListing[] {
  return listCapacityListings({ assetId });
}

/**
 * Sync asset passport utilization with capacity exchange bookings.
 * Recalculates utilization based on actual bookings and usage.
 */
export function syncAssetUtilizationFromExchange(
  assetId: string,
  updatedBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  const passport = getAssetPassport(assetId);
  if (!passport) return undefined;

  const listings = listCapacityListings({ assetId });
  const bookings = listings.flatMap((l) =>
    require('./capacity-exchange').listCapacityBookings({ listingId: l.id })
  );

  if (bookings.length === 0) return undefined;

  // Calculate utilization from bookings
  let totalBookedHours = 0;
  let totalAvailableHours = 0;

  for (const listing of listings) {
    const listingStart = new Date(listing.availableFrom).getTime();
    const listingEnd = new Date(listing.availableTo).getTime();
    totalAvailableHours += (listingEnd - listingStart) / (1000 * 60 * 60);
  }

  for (const booking of bookings) {
    const bookingStart = new Date(booking.bookedFrom).getTime();
    const bookingEnd = new Date(booking.bookedTo).getTime();
    totalBookedHours += (bookingEnd - bookingStart) / (1000 * 60 * 60);
  }

  const bookedUtilization = totalAvailableHours > 0 ? totalBookedHours / totalAvailableHours : 0;

  // Update passport with exchange-derived utilization
  return updateAssetPassport(
    assetId,
    {
      utilization: {
        ...passport.utilization,
        currentUtilization: Math.max(passport.utilization.currentUtilization, bookedUtilization),
        utilizationPattern: bookings.length > 0 ? 'on-demand' : passport.utilization.utilizationPattern,
      },
      capacity: {
        ...passport.capacity,
        currentCapacity: `${listings.reduce((sum, l) => sum + l.capacityAmount, 0)} ${listings[0]?.capacityUnit ?? 'units'}`,
      },
    },
    updatedBy,
    authz,
  );
}

/**
 * Get asset's capacity exchange statistics.
 */
export function getAssetExchangeStats(assetId: string): {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalCapacityOffered: number;
  totalCapacityBooked: number;
  totalRevenue: number;
  currency: string;
  averageUtilization: number;
} | undefined {
  const passport = getAssetPassport(assetId);
  if (!passport) return undefined;

  const listings = listCapacityListings({ assetId });
  const bookings = listings.flatMap((l) =>
    require('./capacity-exchange').listCapacityBookings({ listingId: l.id })
  );

  let totalCapacityOffered = 0;
  let totalCapacityBooked = 0;
  let totalRevenue = 0;
  let utilizationSum = 0;
  let utilizationCount = 0;

  for (const l of listings) {
    totalCapacityOffered += l.capacityAmount;
  }

  for (const b of bookings) {
    totalCapacityBooked += b.bookedAmount;
    totalRevenue += b.totalPrice;
    utilizationSum += passport.utilization.currentUtilization;
    utilizationCount++;
  }

  return {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.status === 'available').length,
    totalBookings: bookings.length,
    activeBookings: bookings.filter((b) => b.status === 'active' || b.status === 'confirmed').length,
    completedBookings: bookings.filter((b) => b.status === 'completed').length,
    totalCapacityOffered,
    totalCapacityBooked,
    totalRevenue,
    currency: bookings[0]?.priceCurrency ?? 'USD',
    averageUtilization: utilizationCount > 0 ? utilizationSum / utilizationCount : 0,
  };
}
