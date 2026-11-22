/**
 * APT-LABS — Asset Utilization Engine (Stage 2 — Network Effects)
 *
 * Reveals idle assets, bottlenecks, and underutilized capacity patterns.
 * Feeds Asset Yield Engine (Stage 3) and connects to verified work history.
 *
 * - Calculate utilization rates per asset, per organization, per asset type
 * - Identify idle assets (utilization < threshold for period)
 * - Identify bottlenecks (utilization > threshold, queued requests)
 * - Detect underutilized capacity patterns
 * - Generate utilization reports and alerts
 * - Integrates with Asset Passport, Capacity Exchange, and Commitment Graph
 */

import { getAssetPassport, listAssets, getRecord, type AssetPassport, type AssetStatus } from './asset-registry';
import { listCapacityListings, listCapacityBookings, listCapacityRequests, type CapacityBooking, type CapacityRequest, type CapacityListing } from './capacity-exchange';
import { getCommitmentsByOrganization } from './commitment-graph';
import { getOrganization, listOrganizations } from './actors';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UtilizationPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface UtilizationAlert {
  id: string;
  assetId: string;
  assetName: string;
  organizationId: string;
  alertType: 'idle' | 'bottleneck' | 'underutilized' | 'overutilized' | 'maintenance-due' | 'capacity-gap';
  severity: AlertSeverity;
  message: string;
  currentValue: number;
  threshold: number;
  period: { from: string; to: string };
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface AssetUtilizationSnapshot {
  assetId: string;
  assetName: string;
  assetType: string;
  organizationId: string;
  organizationName: string;
  period: { from: string; to: string };
  // Core utilization metrics
  currentUtilization: number;           // 0-1 from passport
  averageUtilization: number;           // 0-1 averaged over period
  peakUtilization: number;              // 0-1 peak in period
  bookedUtilization: number;            // 0-1 from capacity bookings
  actualUtilization: number;            // 0-1 from recorded usage
  // Capacity metrics
  designCapacity: number;
  currentCapacity: number;
  capacityUnit: string;
  // Time metrics
  totalHoursInPeriod: number;
  scheduledHours: number;
  actualHours: number;
  idleHours: number;
  downtimeHours: number;
  // Financial
  revenueGenerated: number;
  costIncurred: number;
  currency: string;
  // Status
  utilizationPattern: AssetPassport['utilization']['utilizationPattern'];
  status: 'idle' | 'underutilized' | 'healthy' | 'bottleneck' | 'overutilized' | 'maintenance';
  // Trend
  trend: 'improving' | 'stable' | 'declining';
  // Related data
  bookingCount: number;
  requestCount: number;
  commitmentCount: number;
}

export interface OrganizationUtilizationSummary {
  organizationId: string;
  organizationName: string;
  period: { from: string; to: string };
  totalAssets: number;
  assetsByStatus: Record<string, number>;
  aggregateUtilization: number;
  aggregateBookedUtilization: number;
  aggregateActualUtilization: number;
  idleAssetCount: number;
  bottleneckAssetCount: number;
  underutilizedAssetCount: number;
  totalRevenue: number;
  totalCost: number;
  currency: string;
  topUtilizedAssets: { assetId: string; assetName: string; utilization: number }[];
  bottomUtilizedAssets: { assetId: string; assetName: string; utilization: number }[];
  alerts: UtilizationAlert[];
}

export interface AssetTypeUtilizationBenchmark {
  assetType: string;
  assetCount: number;
  averageUtilization: number;
  medianUtilization: number;
  p25Utilization: number;
  p75Utilization: number;
  averageBookedUtilization: number;
  averageActualUtilization: number;
  idleRate: number;                     // % of assets idle
  bottleneckRate: number;               // % of assets bottlenecked
  topPerformers: { assetId: string; assetName: string; utilization: number }[];
  laggards: { assetId: string; assetName: string; utilization: number }[];
}

export interface CapacityGapAnalysis {
  organizationId: string;
  period: { from: string; to: string };
  capacityType: string;
  requestedCapacity: number;            // From capacity requests
  availableCapacity: number;            // From capacity listings
  bookedCapacity: number;               // From capacity bookings
  gap: number;                          // requested - available
  gapPercentage: number;
  unmetRequests: CapacityRequest[];
  underutilizedListings: { listingId: string; assetId: string; unusedCapacity: number }[];
  recommendedActions: string[];
}

export interface UtilizationReportOptions {
  organizationId?: string;
  assetType?: string;
  assetIds?: string[];
  periodFrom: string;
  periodTo: string;
  includeAlerts?: boolean;
  includeBenchmarks?: boolean;
  includeCapacityGaps?: boolean;
  includeFinancials?: boolean;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const ALERTS_KEY = 'aptlabs:utilization-alerts';
const SNAPSHOTS_KEY = 'aptlabs:utilization-snapshots';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readAlerts(): UtilizationAlert[] {
  return readJson<UtilizationAlert[]>(ALERTS_KEY, []);
}

function writeAlerts(alerts: UtilizationAlert[]): void {
  writeJson(ALERTS_KEY, alerts);
}

function readSnapshots(): AssetUtilizationSnapshot[] {
  return readJson<AssetUtilizationSnapshot[]>(SNAPSHOTS_KEY, []);
}

function writeSnapshots(snapshots: AssetUtilizationSnapshot[]): void {
  writeJson(SNAPSHOTS_KEY, snapshots);
}

// ---------------------------------------------------------------------------
// Core Utilization Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate utilization snapshot for a single asset over a period.
 */
export function calculateAssetUtilization(
  assetId: string,
  periodFrom: string,
  periodTo: string
): AssetUtilizationSnapshot | undefined {
  const asset = getRecord(assetId);
  if (!asset || asset.family !== 'RESOURCE') return undefined;

  const assetData = asset.data as { name?: string; type?: string; capacity?: string };
  const passport = getAssetPassport(assetId);
  if (!passport) return undefined;

  const org = asset.actorId ? getOrganization(asset.actorId) : undefined;

  // Get bookings and usage for period
  const bookings = listCapacityBookings({ assetId, bookedFrom: periodFrom, bookedTo: periodTo });
  const requests = listCapacityRequests({ neededFrom: periodFrom, neededTo: periodTo })
    .filter((r) => r.capacityType === (passport.capacity.currentCapacity.split(' ').pop()?.toLowerCase() ?? ''));

  // Get commitments related to this asset
  const commitments = org
    ? getCommitmentsByOrganization(org.id).filter((c) => c.data.resourceIds.includes(assetId))
    : [];

  // Time calculations
  const periodStart = new Date(periodFrom).getTime();
  const periodEnd = new Date(periodTo).getTime();
  const totalHoursInPeriod = (periodEnd - periodStart) / (1000 * 60 * 60);

  // Booked hours
  let scheduledHours = 0;
  let bookedUtilization = 0;
  let revenueGenerated = 0;
  for (const booking of bookings) {
    const bookingStart = Math.max(new Date(booking.bookedFrom).getTime(), periodStart);
    const bookingEnd = Math.min(new Date(booking.bookedTo).getTime(), periodEnd);
    if (bookingEnd > bookingStart) {
      scheduledHours += (bookingEnd - bookingStart) / (1000 * 60 * 60);
    }
    revenueGenerated += booking.totalPrice;
  }
  bookedUtilization = totalHoursInPeriod > 0 ? scheduledHours / totalHoursInPeriod : 0;

  // Actual usage hours
  let actualHours = 0;
  for (const booking of bookings) {
    const usage = require('./capacity-exchange').getUsageForBooking(booking.id);
    for (const u of usage) {
      const usageStart = Math.max(new Date(u.usedFrom).getTime(), periodStart);
      const usageEnd = Math.min(new Date(u.usedTo).getTime(), periodEnd);
      if (usageEnd > usageStart) {
        actualHours += (usageEnd - usageStart) / (1000 * 60 * 60);
      }
    }
  }
  const actualUtilization = totalHoursInPeriod > 0 ? actualHours / totalHoursInPeriod : 0;

  // Downtime from passport
  let downtimeHours = 0;
  for (const dt of passport.utilization.scheduledDowntime ?? []) {
    const dtStart = Math.max(new Date(dt.startAt).getTime(), periodStart);
    const dtEnd = Math.min(new Date(dt.endAt).getTime(), periodEnd);
    if (dtEnd > dtStart) downtimeHours += (dtEnd - dtStart) / (1000 * 60 * 60);
  }
  for (const dt of passport.utilization.unscheduledDowntime ?? []) {
    const dtStart = Math.max(new Date(dt.startAt).getTime(), periodStart);
    const dtEnd = dt.endAt ? Math.min(new Date(dt.endAt).getTime(), periodEnd) : periodEnd;
    if (dtEnd > dtStart) downtimeHours += (dtEnd - dtStart) / (1000 * 60 * 60);
  }

  const idleHours = totalHoursInPeriod - scheduledHours - downtimeHours;

  // Capacity values
  const designCapacityStr = passport.capacity.designCapacity;
  const currentCapacityStr = passport.capacity.currentCapacity;
  const designCapacity = parseFloat(designCapacityStr.split(' ')[0]) || 0;
  const currentCapacity = parseFloat(currentCapacityStr.split(' ')[0]) || 0;
  const capacityUnit = passport.capacity.capacityUnit || 'units';

  // Current utilization from passport
  const currentUtilization = passport.utilization.currentUtilization ?? 0;
  const averageUtilization = passport.utilization.averageUtilization30d ?? currentUtilization;
  const peakUtilization = passport.utilization.peakUtilization ?? currentUtilization;

  // Determine status
  let status: AssetUtilizationSnapshot['status'] = 'healthy';
  if (currentUtilization < 0.15 && bookedUtilization < 0.15) status = 'idle';
  else if (currentUtilization < 0.4 && bookedUtilization < 0.4) status = 'underutilized';
  else if (currentUtilization > 0.9 || bookedUtilization > 0.9) status = 'overutilized';
  else if (bookedUtilization > 0.85 && requests.length > 0) status = 'bottleneck';
  else if (passport.condition.status === 'offline' || passport.maintenance.nextMaintenanceDue) status = 'maintenance';

  // Trend
  let trend: AssetUtilizationSnapshot['trend'] = 'stable';
  if (currentUtilization > averageUtilization * 1.1) trend = 'improving';
  else if (currentUtilization < averageUtilization * 0.9) trend = 'declining';

  return {
    assetId,
    assetName: assetData.name ?? 'Unknown',
    assetType: assetData.type ?? 'Unknown',
    organizationId: asset.actorId ?? 'unknown',
    organizationName: org?.name ?? 'Unknown',
    period: { from: periodFrom, to: periodTo },
    currentUtilization,
    averageUtilization,
    peakUtilization,
    bookedUtilization,
    actualUtilization,
    designCapacity,
    currentCapacity,
    capacityUnit,
    totalHoursInPeriod,
    scheduledHours,
    actualHours,
    idleHours: Math.max(0, idleHours),
    downtimeHours,
    revenueGenerated,
    costIncurred: 0, // Would come from financial obligations
    currency: bookings[0]?.priceCurrency ?? 'USD',
    utilizationPattern: passport.utilization.utilizationPattern,
    status,
    trend,
    bookingCount: bookings.length,
    requestCount: requests.length,
    commitmentCount: commitments.length,
  };
}

/**
 * Calculate utilization snapshots for all assets (optionally filtered).
 */
export function calculateAllAssetUtilization(
  periodFrom: string,
  periodTo: string,
  filter?: { organizationId?: string; assetType?: string; status?: AssetStatus }
): AssetUtilizationSnapshot[] {
  const assets = listAssets({
    actorId: filter?.organizationId,
    type: filter?.assetType,
    status: filter?.status,
  });

  const snapshots: AssetUtilizationSnapshot[] = [];
  for (const asset of assets) {
    const snapshot = calculateAssetUtilization(asset.id, periodFrom, periodTo);
    if (snapshot) snapshots.push(snapshot);
  }

  return snapshots;
}

// ---------------------------------------------------------------------------
// Alerting Engine
// ---------------------------------------------------------------------------

export interface AlertThresholds {
  idleThreshold?: number;             // Default 0.15 (15%)
  underutilizedThreshold?: number;    // Default 0.4 (40%)
  overutilizedThreshold?: number;     // Default 0.9 (90%)
  bottleneckThreshold?: number;       // Default 0.85 (85%)
  bottleneckRequestThreshold?: number; // Default 3 queued requests
  maintenanceLookaheadDays?: number;  // Default 7 days
}

/**
 * Check all assets for utilization alerts.
 */
export function checkUtilizationAlerts(
  periodFrom: string,
  periodTo: string,
  thresholds: AlertThresholds = {}
): UtilizationAlert[] {
  const {
    idleThreshold = 0.15,
    underutilizedThreshold = 0.4,
    overutilizedThreshold = 0.9,
    bottleneckThreshold = 0.85,
    bottleneckRequestThreshold = 3,
    maintenanceLookaheadDays = 7,
  } = thresholds;

  const snapshots = calculateAllAssetUtilization(periodFrom, periodTo);
  const newAlerts: UtilizationAlert[] = [];
  const existingAlerts = readAlerts();
  const now = nowIso();

  for (const snapshot of snapshots) {
    // Check idle
    if (snapshot.currentUtilization < idleThreshold && snapshot.bookedUtilization < idleThreshold) {
      const existing = existingAlerts.find(
        (a) => a.assetId === snapshot.assetId && a.alertType === 'idle' && a.status === 'active'
      );
      if (!existing) {
        newAlerts.push({
          id: createId('alert'),
          assetId: snapshot.assetId,
          assetName: snapshot.assetName,
          organizationId: snapshot.organizationId,
          alertType: 'idle',
          severity: snapshot.currentUtilization < 0.05 ? 'critical' : 'warning',
          message: `Asset "${snapshot.assetName}" is idle (${Math.round(snapshot.currentUtilization * 100)}% utilization)`,
          currentValue: snapshot.currentUtilization,
          threshold: idleThreshold,
          period: snapshot.period,
          createdAt: now,
          status: 'active',
        });
      }
    }

    // Check underutilized
    if (snapshot.currentUtilization < underutilizedThreshold &&
        snapshot.currentUtilization >= idleThreshold &&
        snapshot.bookedUtilization < underutilizedThreshold) {
      const existing = existingAlerts.find(
        (a) => a.assetId === snapshot.assetId && a.alertType === 'underutilized' && a.status === 'active'
      );
      if (!existing) {
        newAlerts.push({
          id: createId('alert'),
          assetId: snapshot.assetId,
          assetName: snapshot.assetName,
          organizationId: snapshot.organizationId,
          alertType: 'underutilized',
          severity: 'warning',
          message: `Asset "${snapshot.assetName}" is underutilized (${Math.round(snapshot.currentUtilization * 100)}% utilization)`,
          currentValue: snapshot.currentUtilization,
          threshold: underutilizedThreshold,
          period: snapshot.period,
          createdAt: now,
          status: 'active',
        });
      }
    }

    // Check overutilized
    if (snapshot.currentUtilization > overutilizedThreshold || snapshot.bookedUtilization > overutilizedThreshold) {
      const existing = existingAlerts.find(
        (a) => a.assetId === snapshot.assetId && a.alertType === 'overutilized' && a.status === 'active'
      );
      if (!existing) {
        newAlerts.push({
          id: createId('alert'),
          assetId: snapshot.assetId,
          assetName: snapshot.assetName,
          organizationId: snapshot.organizationId,
          alertType: 'overutilized',
          severity: 'critical',
          message: `Asset "${snapshot.assetName}" is overutilized (${Math.round(Math.max(snapshot.currentUtilization, snapshot.bookedUtilization) * 100)}% utilization)`,
          currentValue: Math.max(snapshot.currentUtilization, snapshot.bookedUtilization),
          threshold: overutilizedThreshold,
          period: snapshot.period,
          createdAt: now,
          status: 'active',
        });
      }
    }

    // Check bottleneck (high booked utilization + queued requests)
    if (snapshot.bookedUtilization > bottleneckThreshold && snapshot.requestCount >= bottleneckRequestThreshold) {
      const existing = existingAlerts.find(
        (a) => a.assetId === snapshot.assetId && a.alertType === 'bottleneck' && a.status === 'active'
      );
      if (!existing) {
        newAlerts.push({
          id: createId('alert'),
          assetId: snapshot.assetId,
          assetName: snapshot.assetName,
          organizationId: snapshot.organizationId,
          alertType: 'bottleneck',
          severity: 'critical',
          message: `Asset "${snapshot.assetName}" is a bottleneck (${Math.round(snapshot.bookedUtilization * 100)}% booked, ${snapshot.requestCount} pending requests)`,
          currentValue: snapshot.bookedUtilization,
          threshold: bottleneckThreshold,
          period: snapshot.period,
          createdAt: now,
          status: 'active',
        });
      }
    }

    // Check maintenance due
    const passport = getAssetPassport(snapshot.assetId);
    if (passport?.maintenance.nextMaintenanceDue) {
      const dueDate = new Date(passport.maintenance.nextMaintenanceDue).getTime();
      const lookahead = Date.now() + maintenanceLookaheadDays * 24 * 60 * 60 * 1000;
      if (dueDate <= lookahead) {
        const existing = existingAlerts.find(
          (a) => a.assetId === snapshot.assetId && a.alertType === 'maintenance-due' && a.status === 'active'
        );
        if (!existing) {
          const daysUntil = Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
          newAlerts.push({
            id: createId('alert'),
            assetId: snapshot.assetId,
            assetName: snapshot.assetName,
            organizationId: snapshot.organizationId,
            alertType: 'maintenance-due',
            severity: daysUntil <= 1 ? 'critical' : 'warning',
            message: `Asset "${snapshot.assetName}" maintenance due in ${daysUntil} day(s)`,
            currentValue: daysUntil,
            threshold: maintenanceLookaheadDays,
            period: snapshot.period,
            createdAt: now,
            status: 'active',
          });
        }
      }
    }
  }

  // Save new alerts
  if (newAlerts.length > 0) {
    writeAlerts([...existingAlerts, ...newAlerts]);
  }

  return newAlerts;
}

/**
 * Get active alerts (optionally filtered).
 */
export function getUtilizationAlerts(filter?: {
  organizationId?: string;
  assetId?: string;
  alertType?: UtilizationAlert['alertType'];
  severity?: AlertSeverity;
  status?: UtilizationAlert['status'];
}): UtilizationAlert[] {
  return readAlerts().filter((a) => {
    if (filter?.organizationId && a.organizationId !== filter.organizationId) return false;
    if (filter?.assetId && a.assetId !== filter.assetId) return false;
    if (filter?.alertType && a.alertType !== filter.alertType) return false;
    if (filter?.severity && a.severity !== filter.severity) return false;
    if (filter?.status && a.status !== filter.status) return false;
    return true;
  });
}

/**
 * Acknowledge an alert.
 */
export function acknowledgeAlert(alertId: string, acknowledgedBy: string): UtilizationAlert | undefined {
  const alerts = readAlerts();
  const idx = alerts.findIndex((a) => a.id === alertId);
  if (idx === -1) return undefined;

  alerts[idx] = {
    ...alerts[idx],
    status: 'acknowledged',
    acknowledgedAt: nowIso(),
    acknowledgedBy,
  };
  writeAlerts(alerts);
  return alerts[idx];
}

/**
 * Resolve an alert.
 */
export function resolveAlert(alertId: string, resolvedBy: string): UtilizationAlert | undefined {
  const alerts = readAlerts();
  const idx = alerts.findIndex((a) => a.id === alertId);
  if (idx === -1) return undefined;

  alerts[idx] = {
    ...alerts[idx],
    status: 'resolved',
    acknowledgedAt: alerts[idx].acknowledgedAt ?? nowIso(),
    acknowledgedBy: alerts[idx].acknowledgedBy ?? resolvedBy,
  };
  writeAlerts(alerts);
  return alerts[idx];
}

// ---------------------------------------------------------------------------
// Organization & Asset Type Analytics
// ---------------------------------------------------------------------------

/**
 * Generate organization utilization summary.
 */
export function getOrganizationUtilizationSummary(
  organizationId: string,
  periodFrom: string,
  periodTo: string
): OrganizationUtilizationSummary {
  const org = getOrganization(organizationId);
  const snapshots = calculateAllAssetUtilization(periodFrom, periodTo, { organizationId });
  const alerts = getUtilizationAlerts({ organizationId, status: 'active' });

  const assetsByStatus: Record<string, number> = {};
  let aggregateUtilization = 0;
  let aggregateBookedUtilization = 0;
  let aggregateActualUtilization = 0;
  let idleAssetCount = 0;
  let bottleneckAssetCount = 0;
  let underutilizedAssetCount = 0;
  let totalRevenue = 0;
  let totalCost = 0;

  for (const s of snapshots) {
    assetsByStatus[s.status] = (assetsByStatus[s.status] || 0) + 1;
    aggregateUtilization += s.currentUtilization;
    aggregateBookedUtilization += s.bookedUtilization;
    aggregateActualUtilization += s.actualUtilization;
    totalRevenue += s.revenueGenerated;
    totalCost += s.costIncurred;

    if (s.status === 'idle') idleAssetCount++;
    if (s.status === 'bottleneck') bottleneckAssetCount++;
    if (s.status === 'underutilized') underutilizedAssetCount++;
  }

  const count = snapshots.length;
  const topUtilized = [...snapshots]
    .sort((a, b) => b.currentUtilization - a.currentUtilization)
    .slice(0, 5)
    .map((s) => ({ assetId: s.assetId, assetName: s.assetName, utilization: s.currentUtilization }));

  const bottomUtilized = [...snapshots]
    .sort((a, b) => a.currentUtilization - b.currentUtilization)
    .slice(0, 5)
    .map((s) => ({ assetId: s.assetId, assetName: s.assetName, utilization: s.currentUtilization }));

  return {
    organizationId,
    organizationName: org?.name ?? 'Unknown',
    period: { from: periodFrom, to: periodTo },
    totalAssets: count,
    assetsByStatus,
    aggregateUtilization: count > 0 ? aggregateUtilization / count : 0,
    aggregateBookedUtilization: count > 0 ? aggregateBookedUtilization / count : 0,
    aggregateActualUtilization: count > 0 ? aggregateActualUtilization / count : 0,
    idleAssetCount,
    bottleneckAssetCount,
    underutilizedAssetCount,
    totalRevenue,
    totalCost,
    currency: snapshots[0]?.currency ?? 'USD',
    topUtilizedAssets: topUtilized,
    bottomUtilizedAssets: bottomUtilized,
    alerts,
  };
}

/**
 * Generate asset type utilization benchmarks.
 */
export function getAssetTypeBenchmarks(
  periodFrom: string,
  periodTo: string
): AssetTypeUtilizationBenchmark[] {
  const snapshots = calculateAllAssetUtilization(periodFrom, periodTo);
  const byType = new Map<string, AssetUtilizationSnapshot[]>();

  for (const s of snapshots) {
    if (!byType.has(s.assetType)) byType.set(s.assetType, []);
    byType.get(s.assetType)!.push(s);
  }

  const benchmarks: AssetTypeUtilizationBenchmark[] = [];

  for (const [assetType, assets] of byType) {
    const utilizations = assets.map((a) => a.currentUtilization).sort((a, b) => a - b);
    const bookedUtilizations = assets.map((a) => a.bookedUtilization);
    const actualUtilizations = assets.map((a) => a.actualUtilization);

    const avg = utilizations.reduce((a, b) => a + b, 0) / utilizations.length;
    const median = utilizations[Math.floor(utilizations.length / 2)];
    const p25 = utilizations[Math.floor(utilizations.length * 0.25)];
    const p75 = utilizations[Math.floor(utilizations.length * 0.75)];
    const idleCount = assets.filter((a) => a.status === 'idle').length;
    const bottleneckCount = assets.filter((a) => a.status === 'bottleneck').length;

    const topPerformers = [...assets]
      .sort((a, b) => b.currentUtilization - a.currentUtilization)
      .slice(0, 3)
      .map((a) => ({ assetId: a.assetId, assetName: a.assetName, utilization: a.currentUtilization }));

    const laggards = [...assets]
      .sort((a, b) => a.currentUtilization - b.currentUtilization)
      .slice(0, 3)
      .map((a) => ({ assetId: a.assetId, assetName: a.assetName, utilization: a.currentUtilization }));

    benchmarks.push({
      assetType,
      assetCount: assets.length,
      averageUtilization: avg,
      medianUtilization: median,
      p25Utilization: p25,
      p75Utilization: p75,
      averageBookedUtilization: bookedUtilizations.reduce((a, b) => a + b, 0) / bookedUtilizations.length,
      averageActualUtilization: actualUtilizations.reduce((a, b) => a + b, 0) / actualUtilizations.length,
      idleRate: idleCount / assets.length,
      bottleneckRate: bottleneckCount / assets.length,
      topPerformers,
      laggards,
    });
  }

  return benchmarks.sort((a, b) => b.assetCount - a.assetCount);
}

/**
 * Analyze capacity gaps for an organization.
 */
export function analyzeCapacityGaps(
  organizationId: string,
  periodFrom: string,
  periodTo: string
): CapacityGapAnalysis[] {
  const requests = listCapacityRequests({
    requesterOrganizationId: organizationId,
    neededFrom: periodFrom,
    neededTo: periodTo,
  });

  const listings = listCapacityListings({
    providerOrganizationId: organizationId,
    availableFrom: periodFrom,
    availableTo: periodTo,
  });

  const bookings = listCapacityBookings({
    requesterOrganizationId: organizationId,
    bookedFrom: periodFrom,
    bookedTo: periodTo,
  });

  // Group by capacity type
  const byType = new Map<string, { requests: CapacityRequest[]; listings: CapacityListing[]; bookings: CapacityBooking[] }>();

  for (const r of requests) {
    if (!byType.has(r.capacityType)) byType.set(r.capacityType, { requests: [], listings: [], bookings: [] });
    byType.get(r.capacityType)!.requests.push(r);
  }
  for (const l of listings) {
    if (!byType.has(l.capacityType)) byType.set(l.capacityType, { requests: [], listings: [], bookings: [] });
    byType.get(l.capacityType)!.listings.push(l);
  }
  for (const b of bookings) {
    if (!byType.has(b.capacityType)) byType.set(b.capacityType, { requests: [], listings: [], bookings: [] });
    byType.get(b.capacityType)!.bookings.push(b);
  }

  const gaps: CapacityGapAnalysis[] = [];

  for (const [capacityType, data] of byType) {
    const requestedCapacity = data.requests.reduce((sum, r) => sum + r.quantityNeeded, 0);
    const availableCapacity = data.listings.reduce((sum, l) => sum + l.capacityAmount, 0);
    const bookedCapacity = data.bookings.reduce((sum, b) => sum + b.bookedAmount, 0);
    const gap = requestedCapacity - availableCapacity;
    const gapPercentage = availableCapacity > 0 ? (gap / availableCapacity) * 100 : (gap > 0 ? 100 : 0);

    // Find unmet requests (requests not matched to bookings)
    const unmetRequests = data.requests.filter((r) => r.status === 'open' || r.status === 'matched');

    // Find underutilized listings (listings with unused capacity)
    const underutilizedListings = data.listings
      .map((l) => {
        const listingBookings = data.bookings.filter((b) => b.listingId === l.id);
        const bookedAmount = listingBookings.reduce((sum, b) => sum + b.bookedAmount, 0);
        const unusedCapacity = l.capacityAmount - bookedAmount;
        return { listingId: l.id, assetId: l.assetId, unusedCapacity };
      })
      .filter((u) => u.unusedCapacity > 0)
      .sort((a, b) => b.unusedCapacity - a.unusedCapacity);

    const recommendedActions: string[] = [];
    if (gap > 0) {
      recommendedActions.push(`Acquire or partner for additional ${capacityType} capacity (gap: ${gap} units)`);
      recommendedActions.push('Post capacity requests to the exchange to find external providers');
    }
    if (underutilizedListings.length > 0) {
      recommendedActions.push(`List ${underutilizedListings.length} underutilized assets on the capacity exchange`);
      recommendedActions.push('Consider leasing out idle capacity to generate revenue');
    }
    if (data.requests.some((r) => r.urgency === 'critical' || r.urgency === 'high')) {
      recommendedActions.push('Prioritize critical/high-urgency requests in matching');
    }

    gaps.push({
      organizationId,
      period: { from: periodFrom, to: periodTo },
      capacityType,
      requestedCapacity,
      availableCapacity,
      bookedCapacity,
      gap,
      gapPercentage,
      unmetRequests,
      underutilizedListings,
      recommendedActions,
    });
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

export interface UtilizationReport {
  generatedAt: string;
  period: { from: string; to: string };
  organizationSummaries: OrganizationUtilizationSummary[];
  assetTypeBenchmarks: AssetTypeUtilizationBenchmark[];
  capacityGapAnalyses: CapacityGapAnalysis[];
  globalAlerts: UtilizationAlert[];
  executiveSummary: string;
}

/**
 * Generate comprehensive utilization report.
 */
export function generateUtilizationReport(options: UtilizationReportOptions): UtilizationReport {
  const { organizationId, assetType, assetIds, periodFrom, periodTo, includeAlerts = true, includeBenchmarks = true, includeCapacityGaps = true } = options;

  // Get organizations to report on
  const orgs = organizationId
    ? [getOrganization(organizationId)].filter((o): o is NonNullable<typeof o> => Boolean(o))
    : listOrganizations();

  const organizationSummaries: OrganizationUtilizationSummary[] = [];
  const allSnapshots: AssetUtilizationSnapshot[] = [];

  for (const org of orgs) {
    const snapshots = calculateAllAssetUtilization(periodFrom, periodTo, { organizationId: org.id, assetType });
    allSnapshots.push(...snapshots);
    organizationSummaries.push(getOrganizationUtilizationSummary(org.id, periodFrom, periodTo));
  }

  // Filter by specific asset IDs if provided
  const filteredSnapshots = assetIds?.length
    ? allSnapshots.filter((s) => assetIds.includes(s.assetId))
    : allSnapshots;

  const assetTypeBenchmarks = includeBenchmarks ? getAssetTypeBenchmarks(periodFrom, periodTo) : [];
  const capacityGapAnalyses = includeCapacityGaps
    ? orgs.flatMap((org) => analyzeCapacityGaps(org.id, periodFrom, periodTo))
    : [];
  const globalAlerts = includeAlerts ? getUtilizationAlerts({ status: 'active' }) : [];

  // Executive summary
  const totalAssets = filteredSnapshots.length;
  const avgUtilization = totalAssets > 0
    ? filteredSnapshots.reduce((sum, s) => sum + s.currentUtilization, 0) / totalAssets
    : 0;
  const idleCount = filteredSnapshots.filter((s) => s.status === 'idle').length;
  const bottleneckCount = filteredSnapshots.filter((s) => s.status === 'bottleneck').length;
  const totalRevenue = organizationSummaries.reduce((sum, o) => sum + o.totalRevenue, 0);

  let executiveSummary = `Utilization Report for ${periodFrom} to ${periodTo}.\n`;
  executiveSummary += `Total assets analyzed: ${totalAssets}. Average utilization: ${Math.round(avgUtilization * 100)}%.\n`;
  executiveSummary += `Idle assets: ${idleCount}. Bottlenecks: ${bottleneckCount}.\n`;
  executiveSummary += `Total revenue from capacity: ${totalRevenue.toLocaleString()} ${organizationSummaries[0]?.currency ?? 'USD'}.\n`;
  if (globalAlerts.length > 0) {
    executiveSummary += `Active alerts: ${globalAlerts.length} (${globalAlerts.filter((a) => a.severity === 'critical').length} critical).`;
  }

  return {
    generatedAt: nowIso(),
    period: { from: periodFrom, to: periodTo },
    organizationSummaries,
    assetTypeBenchmarks,
    capacityGapAnalyses,
    globalAlerts,
    executiveSummary,
  };
}

// ---------------------------------------------------------------------------
// Snapshot Persistence (for historical tracking)
// ---------------------------------------------------------------------------

/**
 * Save utilization snapshot for historical tracking.
 */
export function saveUtilizationSnapshot(snapshot: AssetUtilizationSnapshot): void {
  const snapshots = readSnapshots();
  snapshots.push(snapshot);
  writeSnapshots(snapshots);
}

/**
 * Get historical snapshots for an asset.
 */
export function getUtilizationHistory(assetId: string, limit = 100): AssetUtilizationSnapshot[] {
  return readSnapshots()
    .filter((s) => s.assetId === assetId)
    .sort((a, b) => new Date(b.period.to).getTime() - new Date(a.period.to).getTime())
    .slice(0, limit);
}

/**
 * Get utilization trend for an asset.
 */
export function getUtilizationTrend(
  assetId: string,
  periods: number = 12
): { period: string; utilization: number; bookedUtilization: number; actualUtilization: number }[] {
  const history = getUtilizationHistory(assetId, periods);
  return history
    .map((s) => ({
      period: s.period.to.slice(0, 7), // YYYY-MM
      utilization: s.currentUtilization,
      bookedUtilization: s.bookedUtilization,
      actualUtilization: s.actualUtilization,
    }))
    .reverse(); // Oldest first for charting
}

