/**
 * APT-LABS — Asset Yield Engine (Stage 3 — Economic Intelligence)
 *
 * Connects physical assets, availability, utilization, demand, maintenance,
 * and financial opportunities. Produces opportunity briefs for asset owners.
 */

import { getAssetPassport, listAssets, type AssetPassport } from './asset-registry';
import { listCapacityBookings } from './capacity-exchange';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AssetYieldAnalysis {
  assetId: string;
  assetName: string;
  assetType: string;
  organizationId?: string;
  organizationName?: string;
  period: { from: string; to: string };
  currentUtilization: number;
  averageUtilization: number;
  peakUtilization: number;
  bookedUtilization: number;
  actualUtilization: number;
  designCapacity: number;
  currentCapacity: number;
  capacityUnit: string;
  availableCapacity: number;
  totalHoursInPeriod: number;
  scheduledHours: number;
  actualHours: number;
  idleHours: number;
  downtimeHours: number;
  revenueGenerated: number;
  revenuePotential: number;
  costIncurred: number;
  netYield: number;
  currency: string;
  yieldPercentage: number;
  roiPercentage: number;
  paybackPeriodMonths?: number;
  status: 'idle' | 'underutilized' | 'healthy' | 'bottleneck' | 'overutilized' | 'maintenance';
  trend: 'improving' | 'stable' | 'declining';
  bookingCount: number;
  requestCount: number;
  maintenanceDue?: string;
  recommendations: YieldRecommendation[];
}

export interface YieldRecommendation {
  id: string;
  type: 'rent-out' | 'lease-out' | 'sell' | 'maintain' | 'upgrade' | 'repurpose' | 'finance' | 'insure';
  title: string;
  description: string;
  rationale: string[];
  estimatedValue: number;
  currency: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  prerequisites: string[];
  estimatedTimelineDays: number;
}

export interface IdleAsset {
  assetId: string;
  assetName: string;
  organizationId: string;
  organizationName: string;
  assetType: string;
  currentUtilization: number;
  idleHours: number;
  lastUsedAt?: string;
  capacity: string;
  capacityUnit: string;
  location?: string;
  recommendations: YieldRecommendation[];
}

export interface YieldOpportunity {
  id: string;
  assetId: string;
  assetName: string;
  ownerActorId: string;
  ownerActorName: string;
  organizationId?: string;
  organizationName?: string;
  opportunityType: 'rental' | 'leasing' | 'service' | 'partnership' | 'financing';
  title: string;
  description: string;
  availableFrom: string;
  availableTo: string;
  availableCapacity: number;
  capacityUnit: string;
  askingPrice: number;
  currency: string;
  terms: string[];
  requirements: string[];
  riskFactors: string[];
  createdAt: string;
  createdBy: string;
  status: 'open' | 'matched' | 'booked' | 'closed' | 'expired';
  matchedCounterparties: string[];
}

export interface CounterpartyMatch {
  id: string;
  opportunityId: string;
  counterpartyActorId: string;
  counterpartyActorName: string;
  matchScore: number;
  matchReasons: string[];
  conflicts: string[];
  proposedTerms: {
    amount: number;
    currency: string;
    schedule: string;
    durationDays: number;
  };
  status: 'proposed' | 'accepted' | 'rejected' | 'pending';
}

export interface AssetYieldReport {
  generatedAt: string;
  period: { from: string; to: string };
  organizationId?: string;
  totalAssets: number;
  totalUtilizedAssets: number;
  totalIdleAssets: number;
  totalBottleneckAssets: number;
  averageUtilization: number;
  totalRevenueGenerated: number;
  totalYieldPotential: number;
  currency: string;
  assetAnalyses: AssetYieldAnalysis[];
  idleAssets: IdleAsset[];
  yieldOpportunities: YieldOpportunity[];
  recommendations: YieldRecommendation[];
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const YIELD_OPPORTUNITIES_KEY = 'aptlabs:yield-opportunities';
const COUNTERPARTY_MATCHES_KEY = 'aptlabs:counterparty-matches';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readYieldOpportunities(): YieldOpportunity[] {
  return readJson<YieldOpportunity[]>(YIELD_OPPORTUNITIES_KEY, []);
}

function writeYieldOpportunities(opps: YieldOpportunity[]): void {
  writeJson(YIELD_OPPORTUNITIES_KEY, opps);
}

function readCounterpartyMatches(): CounterpartyMatch[] {
  return readJson<CounterpartyMatch[]>(COUNTERPARTY_MATCHES_KEY, []);
}

function writeCounterpartyMatches(matches: CounterpartyMatch[]): void {
  writeJson(COUNTERPARTY_MATCHES_KEY, matches);
}

// ---------------------------------------------------------------------------
// Asset Yield Analysis
// ---------------------------------------------------------------------------

export interface AnalyzeAssetYieldInput {
  assetId: string;
  periodFrom: string;
  periodTo: string;
  analyzedBy: string;
  authz?: AuthzContext;
}

export function analyzeAssetYield(input: AnalyzeAssetYieldInput): AssetYieldAnalysis | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'economic:read');
  }

  const asset = listAssets({ status: 'active' }).find((a) => a.id === input.assetId);
  if (!asset) return undefined;

  const passport = getAssetPassport(input.assetId);
  if (!passport) return undefined;

  const periodStart = new Date(input.periodFrom).getTime();
  const periodEnd = new Date(input.periodTo).getTime();
  const totalHoursInPeriod = (periodEnd - periodStart) / (1000 * 60 * 60 * 24) * 24;

  const bookings = listCapacityBookings({ assetId: input.assetId, bookedFrom: input.periodFrom, bookedTo: input.periodTo });

  let scheduledHours = 0;
  let revenueGenerated = 0;
  let currency = 'KES';

  for (const booking of bookings) {
    const bookingStart = Math.max(new Date(booking.bookedFrom).getTime(), periodStart);
    const bookingEnd = Math.min(new Date(booking.bookedTo).getTime(), periodEnd);
    if (bookingEnd > bookingStart) {
      scheduledHours += (bookingEnd - bookingStart) / (1000 * 60 * 60);
    }
    revenueGenerated += booking.totalPrice;
    currency = booking.priceCurrency;
  }

  const bookedUtilization = totalHoursInPeriod > 0 ? scheduledHours / totalHoursInPeriod : 0;
  const currentUtilization = passport.utilization.currentUtilization ?? 0;
  const averageUtilization = passport.utilization.averageUtilization30d ?? currentUtilization;
  const peakUtilization = Math.max(currentUtilization, bookedUtilization);

  const actualHours = scheduledHours;
  const downtimeHours = 0;
  const idleHours = Math.max(0, totalHoursInPeriod - scheduledHours - downtimeHours);

  const designCapacity = parseFloat(passport.capacity.designCapacity.split(' ')[0]) || 0;
  const currentCapacity = parseFloat(passport.capacity.currentCapacity.split(' ')[0]) || 0;
  const capacityUnit = passport.capacity.capacityUnit || 'units';
  const availableCapacity = currentCapacity;

  const revenuePotential = designCapacity > 0 ? (designCapacity / 100) * 1000 : 0;
  const costIncurred = 0;
  const netYield = revenueGenerated - costIncurred;

  const yieldPercentage = designCapacity > 0 ? (revenueGenerated / designCapacity) * 100 : 0;
  const roiPercentage = designCapacity > 0 ? (netYield / designCapacity) * 100 : 0;

  let status: AssetYieldAnalysis['status'] = 'healthy';
  if (currentUtilization < 0.15 && bookedUtilization < 0.15) status = 'idle';
  else if (currentUtilization < 0.4 && bookedUtilization < 0.4) status = 'underutilized';
  else if (currentUtilization > 0.9 || bookedUtilization > 0.9) status = 'overutilized';
  else if (bookedUtilization > 0.85) status = 'bottleneck';
  else if (passport.condition.status === 'offline' || passport.maintenance.nextMaintenanceDue) status = 'maintenance';

  let trend: AssetYieldAnalysis['trend'] = 'stable';
  if (currentUtilization > averageUtilization * 1.1) trend = 'improving';
  else if (currentUtilization < averageUtilization * 0.9) trend = 'declining';

  const recommendations = generateYieldRecommendations(input.assetId, passport, currentUtilization, bookedUtilization, revenueGenerated);

  const analysis: AssetYieldAnalysis = {
    assetId: input.assetId,
    assetName: ((asset.data as Record<string, unknown>)?.name as string) || 'Unnamed Asset',
    assetType: ((asset.data as Record<string, unknown>)?.type as string) || 'Unknown',
    organizationId: asset.actorId ?? undefined,
    organizationName: undefined,
    period: { from: input.periodFrom, to: input.periodTo },
    currentUtilization,
    averageUtilization,
    peakUtilization,
    bookedUtilization,
    actualUtilization: currentUtilization,
    designCapacity,
    currentCapacity,
    capacityUnit,
    availableCapacity,
    totalHoursInPeriod,
    scheduledHours,
    actualHours,
    idleHours,
    downtimeHours,
    revenueGenerated,
    revenuePotential,
    costIncurred,
    netYield,
    currency,
    yieldPercentage,
    roiPercentage,
    status,
    trend,
    bookingCount: bookings.length,
    requestCount: 0,
    maintenanceDue: passport.maintenance.nextMaintenanceDue,
    recommendations,
  };

  logAuditEvent({
    accountId: input.analyzedBy,
    actorId: asset.actorId,
    action: 'record.create',
    resourceType: 'asset-yield-analysis',
    resourceId: input.assetId,
    details: { status, utilization: currentUtilization, revenueGenerated },
  });

  return analysis;
}

export function analyzeAssetYields(assetIds: string[], periodFrom: string, periodTo: string, analyzedBy: string, authz?: AuthzContext): AssetYieldAnalysis[] {
  const analyses: AssetYieldAnalysis[] = [];
  for (const assetId of assetIds) {
    const analysis = analyzeAssetYield({ assetId, periodFrom, periodTo, analyzedBy, authz });
    if (analysis) analyses.push(analysis);
  }
  return analyses.sort((a, b) => b.currentUtilization - a.currentUtilization);
}

// ---------------------------------------------------------------------------
// Idle Asset Detection
// ---------------------------------------------------------------------------

export interface FindIdleAssetsInput {
  organizationId?: string;
  utilizationThreshold?: number;
  periodFrom?: string;
  periodTo?: string;
}

export function findIdleAssets(input: FindIdleAssetsInput): IdleAsset[] {
  const { organizationId, utilizationThreshold = 0.15 } = input;
  const assets = listAssets({ status: 'active' });

  const idleAssets: IdleAsset[] = [];

  for (const asset of assets) {
    if (organizationId && asset.actorId !== organizationId) continue;

    const passport = getAssetPassport(asset.id);
    if (!passport) continue;

    const utilization = passport.utilization.currentUtilization ?? 0;
    if (utilization >= utilizationThreshold) continue;

    const bookings = listCapacityBookings({ assetId: asset.id });
    const lastBooking = bookings.length > 0
      ? bookings.sort((a, b) => new Date(b.bookedTo).getTime() - new Date(a.bookedTo).getTime())[0]
      : undefined;

    const recommendations = generateYieldRecommendations(asset.id, passport, utilization, 0, 0);

    idleAssets.push({
      assetId: asset.id,
      assetName: ((asset.data as Record<string, unknown>)?.name as string) || 'Unnamed Asset',
      organizationId: asset.actorId ?? 'unknown',
      organizationName: '',
      assetType: ((asset.data as Record<string, unknown>)?.type as string) || 'Unknown',
      currentUtilization: utilization,
      idleHours: 0,
      lastUsedAt: lastBooking?.bookedTo ?? undefined,
      capacity: passport.capacity.currentCapacity,
      capacityUnit: passport.capacity.capacityUnit,
      location: passport.custody.locationId ?? undefined,
      recommendations,
    });
  }

  return idleAssets.sort((a, b) => a.currentUtilization - b.currentUtilization);
}

// ---------------------------------------------------------------------------
// Yield Opportunity Generation
// ---------------------------------------------------------------------------

export interface GenerateYieldOpportunityInput {
  assetId: string;
  ownerActorId: string;
  organizationId?: string;
  opportunityType: YieldOpportunity['opportunityType'];
  title: string;
  description: string;
  availableFrom: string;
  availableTo: string;
  availableCapacity: number;
  capacityUnit: string;
  askingPrice: number;
  currency: string;
  terms?: string[];
  requirements?: string[];
  riskFactors?: string[];
  createdBy: string;
  authz?: AuthzContext;
}

export function generateYieldOpportunity(input: GenerateYieldOpportunityInput): YieldOpportunity {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const opportunity: YieldOpportunity = {
    id: createId('yield-opp'),
    assetId: input.assetId,
    assetName: '',
    ownerActorId: input.ownerActorId,
    ownerActorName: '',
    organizationId: input.organizationId,
    organizationName: undefined,
    opportunityType: input.opportunityType,
    title: input.title,
    description: input.description,
    availableFrom: input.availableFrom,
    availableTo: input.availableTo,
    availableCapacity: input.availableCapacity,
    capacityUnit: input.capacityUnit,
    askingPrice: input.askingPrice,
    currency: input.currency,
    terms: input.terms ?? [],
    requirements: input.requirements ?? [],
    riskFactors: input.riskFactors ?? [],
    createdAt: nowIso(),
    createdBy: input.createdBy,
    status: 'open',
    matchedCounterparties: [],
  };

  const opportunities = readYieldOpportunities();
  opportunities.push(opportunity);
  writeYieldOpportunities(opportunities);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.ownerActorId,
    action: 'record.create',
    resourceType: 'yield-opportunity',
    resourceId: opportunity.id,
    details: { opportunityType: input.opportunityType, askingPrice: input.askingPrice },
  });

  return opportunity;
}

export function getYieldOpportunity(opportunityId: string): YieldOpportunity | undefined {
  return readYieldOpportunities().find((o) => o.id === opportunityId);
}

export function listYieldOpportunities(filter?: {
  assetId?: string;
  ownerActorId?: string;
  organizationId?: string;
  opportunityType?: YieldOpportunity['opportunityType'];
  status?: YieldOpportunity['status'];
}): YieldOpportunity[] {
  return readYieldOpportunities().filter((o) => {
    if (filter?.assetId && o.assetId !== filter.assetId) return false;
    if (filter?.ownerActorId && o.ownerActorId !== filter.ownerActorId) return false;
    if (filter?.organizationId && o.organizationId !== filter.organizationId) return false;
    if (filter?.opportunityType && o.opportunityType !== filter.opportunityType) return false;
    if (filter?.status && o.status !== filter.status) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Counterparty Matching
// ---------------------------------------------------------------------------

export interface MatchCounterpartyInput {
  opportunityId: string;
  counterpartyActorId: string;
  matchScore: number;
  matchReasons: string[];
  conflicts: string[];
  proposedAmount: number;
  proposedCurrency: string;
  proposedSchedule: string;
  proposedDurationDays: number;
  matchedBy: string;
  authz?: AuthzContext;
}

export function matchCounterparty(input: MatchCounterpartyInput): CounterpartyMatch {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const match: CounterpartyMatch = {
    id: createId('match'),
    opportunityId: input.opportunityId,
    counterpartyActorId: input.counterpartyActorId,
    counterpartyActorName: '',
    matchScore: input.matchScore,
    matchReasons: input.matchReasons,
    conflicts: input.conflicts,
    proposedTerms: {
      amount: input.proposedAmount,
      currency: input.proposedCurrency,
      schedule: input.proposedSchedule,
      durationDays: input.proposedDurationDays,
    },
    status: 'proposed',
  };

  const matches = readCounterpartyMatches();
  matches.push(match);
  writeCounterpartyMatches(matches);

  if (input.matchScore >= 70) {
    const opportunities = readYieldOpportunities();
    const oppIdx = opportunities.findIndex((o) => o.id === input.opportunityId);
    if (oppIdx !== -1) {
      opportunities[oppIdx].matchedCounterparties.push(input.counterpartyActorId);
      if (input.matchScore >= 90) opportunities[oppIdx].status = 'matched';
      writeYieldOpportunities(opportunities);
    }
  }

  logAuditEvent({
    accountId: input.matchedBy,
    actorId: input.counterpartyActorId,
    action: 'record.create',
    resourceType: 'counterparty-match',
    resourceId: match.id,
    details: { opportunityId: input.opportunityId, matchScore: input.matchScore },
  });

  return match;
}

export function getCounterpartyMatches(opportunityId: string): CounterpartyMatch[] {
  return readCounterpartyMatches().filter((m) => m.opportunityId === opportunityId);
}

// ---------------------------------------------------------------------------
// Recommendations Generation
// ---------------------------------------------------------------------------

function generateYieldRecommendations(
  _assetId: string,
  passport: AssetPassport,
  currentUtilization: number,
  _bookedUtilization: number,
  revenueGenerated: number
): YieldRecommendation[] {
  const recommendations: YieldRecommendation[] = [];

  if (currentUtilization < 0.15) {
    recommendations.push({
      id: createId('rec'),
      type: 'rent-out',
      title: 'Rent out idle asset',
      description: `Asset utilization is only ${(currentUtilization * 100).toFixed(1)}%. Renting out can convert idle capacity into revenue.`,
      rationale: [
        `Asset utilization is only ${(currentUtilization * 100).toFixed(1)}%`,
        'Asset is sitting idle and not generating revenue',
        'Renting out can convert idle capacity into revenue',
      ],
      estimatedValue: passport.capacity.currentCapacity ? parseFloat(passport.capacity.currentCapacity.split(' ')[0]) * 100 : 50000,
      currency: 'KES',
      confidence: 0.8,
      priority: 'high',
      prerequisites: ['List on Capacity Exchange', 'Set competitive pricing', 'Verify insurance coverage'],
      estimatedTimelineDays: 14,
    });
  }

  if (currentUtilization > 0.85) {
    recommendations.push({
      id: createId('rec'),
      type: 'upgrade',
      title: 'Consider upgrading capacity',
      description: `Asset utilization is ${(currentUtilization * 100).toFixed(1)}% - near capacity. Upgrading could increase revenue.`,
      rationale: [
        `Asset utilization is ${(currentUtilization * 100).toFixed(1)}% - near capacity`,
        'High demand suggests upgrade could increase revenue',
        'Bottleneck risk if demand continues to grow',
      ],
      estimatedValue: passport.capacity.currentCapacity ? parseFloat(passport.capacity.currentCapacity.split(' ')[0]) * 500 : 500000,
      currency: 'KES',
      confidence: 0.7,
      priority: 'medium',
      prerequisites: ['Capital assessment', 'Financing options', 'Implementation timeline'],
      estimatedTimelineDays: 90,
    });
  }

  if (passport.maintenance.nextMaintenanceDue && new Date(passport.maintenance.nextMaintenanceDue) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
    recommendations.push({
      id: createId('rec'),
      type: 'maintain',
      title: 'Schedule maintenance',
      description: 'Maintenance is due soon. Preventive maintenance avoids costly breakdowns.',
      rationale: [
        'Maintenance is due soon',
        'Preventive maintenance avoids costly breakdowns',
        'Maintains asset value and safety',
      ],
      estimatedValue: 0,
      currency: 'KES',
      confidence: 0.9,
      priority: 'high',
      prerequisites: ['Maintenance budget', 'Qualified technician', 'Downtime scheduling'],
      estimatedTimelineDays: 7,
    });
  }

  if (revenueGenerated > 0 && currentUtilization > 0.5) {
    recommendations.push({
      id: createId('rec'),
      type: 'finance',
      title: 'Asset-backed financing',
      description: 'Asset has demonstrated revenue-generating capacity and can be used as collateral for financing.',
      rationale: [
        'Asset has demonstrated revenue-generating capacity',
        'Can use asset as collateral for financing',
        'Financing can fund expansion or upgrades',
      ],
      estimatedValue: revenueGenerated * 3,
      currency: 'KES',
      confidence: 0.6,
      priority: 'medium',
      prerequisites: ['Asset valuation', 'Credit assessment', 'Legal documentation'],
      estimatedTimelineDays: 30,
    });
  }

  return recommendations;
}

// ---------------------------------------------------------------------------
// Report Generation
// ---------------------------------------------------------------------------

export interface GenerateAssetYieldReportInput {
  organizationId?: string;
  periodFrom: string;
  periodTo: string;
  includeIdleAssets?: boolean;
  includeOpportunities?: boolean;
  generatedBy: string;
  authz?: AuthzContext;
}

export function generateAssetYieldReport(input: GenerateAssetYieldReportInput): AssetYieldReport {
  if (input.authz) {
    requirePermission(input.authz, 'economic:read');
  }

  const assets = listAssets({ status: 'active' }).filter((a) =>
    input.organizationId ? a.actorId === input.organizationId : true
  );

  const analyses: AssetYieldAnalysis[] = [];
  for (const asset of assets) {
    const analysis = analyzeAssetYield({
      assetId: asset.id,
      periodFrom: input.periodFrom,
      periodTo: input.periodTo,
      analyzedBy: input.generatedBy,
    });
    if (analysis) analyses.push(analysis);
  }

  const totalAssets = analyses.length;
  const totalUtilizedAssets = analyses.filter((a) => a.status === 'healthy' || a.status === 'bottleneck' || a.status === 'overutilized').length;
  const totalIdleAssets = analyses.filter((a) => a.status === 'idle' || a.status === 'underutilized').length;
  const totalBottleneckAssets = analyses.filter((a) => a.status === 'bottleneck').length;
  const averageUtilization = totalAssets > 0
    ? analyses.reduce((sum, a) => sum + a.currentUtilization, 0) / totalAssets
    : 0;
  const totalRevenueGenerated = analyses.reduce((sum, a) => sum + a.revenueGenerated, 0);
  const totalYieldPotential = analyses.reduce((sum, a) => sum + a.revenuePotential, 0);

  const idleAssets: IdleAsset[] = input.includeIdleAssets !== false
    ? findIdleAssets({ organizationId: input.organizationId })
    : [];

  const yieldOpportunities: YieldOpportunity[] = input.includeOpportunities !== false
    ? listYieldOpportunities({ organizationId: input.organizationId, status: 'open' })
    : [];

  const allRecommendations = analyses.flatMap((a) => a.recommendations);

  const report: AssetYieldReport = {
    generatedAt: nowIso(),
    period: { from: input.periodFrom, to: input.periodTo },
    organizationId: input.organizationId,
    totalAssets,
    totalUtilizedAssets,
    totalIdleAssets,
    totalBottleneckAssets,
    averageUtilization,
    totalRevenueGenerated,
    totalYieldPotential,
    currency: analyses[0]?.currency ?? 'KES',
    assetAnalyses: analyses,
    idleAssets,
    yieldOpportunities,
    recommendations: allRecommendations,
  };

  logAuditEvent({
    accountId: input.generatedBy,
    actorId: input.generatedBy,
    action: 'record.create',
    resourceType: 'asset-yield-report',
    resourceId: report.generatedAt,
    details: { totalAssets, averageUtilization, totalRevenueGenerated },
  });

  return report;
}
