/**
 * APT-LABS — Capacity Exchange Engine (Stage 2 — Network Effects)
 *
 * Makes machinery, storage, transport, facilities, energy, and specialist
 * capacity discoverable and usable across organizations.
 *
 * - Register available capacity with pricing and terms
 * - Search/discover capacity by type, location, time window, price range
 * - Match capacity requests to available capacity
 * - Create capacity bookings/reservations linked to commitments
 * - Track utilization (actual vs booked vs available)
 * - Integrates with Asset Passport (utilization dimension) and Commitment Graph
 */

import { getRecord } from './record-envelope';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { createCommitment, type CreateCommitmentInput } from './commitment-graph';
import { getAssetPassport, updateAssetPassport } from './asset-registry';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CapacityType =
  | 'machinery'
  | 'storage'
  | 'transport'
  | 'facility'
  | 'energy'
  | 'specialist'
  | 'compute'
  | 'laboratory'
  | 'other';

export const CAPACITY_TYPE_LABELS: Record<CapacityType, string> = {
  machinery: 'Machinery & Equipment',
  storage: 'Storage & Warehousing',
  transport: 'Transport & Logistics',
  facility: 'Facility & Space',
  energy: 'Energy & Power',
  specialist: 'Specialist Services',
  compute: 'Compute & Data',
  laboratory: 'Laboratory & Testing',
  other: 'Other',
};

export type CapacityUnit =
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'units'
  | 'kg'
  | 'tonnes'
  | 'm3'
  | 'm2'
  | 'kWh'
  | 'MW'
  | 'GB'
  | 'TB'
  | 'cores'
  | 'sessions'
  | 'custom';

export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface CapacityListing {
  id: string;
  assetId: string;                    // Links to Asset Passport
  providerActorId: string;            // Actor offering capacity
  providerOrganizationId: string;     // Organization of provider
  capacityType: CapacityType;
  capacitySubtype?: string;           // e.g., "CNC milling", "cold storage", "flatbed truck"
  title: string;
  description?: string;
  locationId?: string;                // PLACE ID where capacity is available
  locationName?: string;              // Human-readable location
  availableFrom: string;              // ISO date
  availableTo: string;                // ISO date
  capacityAmount: number;             // Total amount available
  capacityUnit: CapacityUnit;
  pricePerUnit: number;
  priceCurrency: string;
  minimumBookingUnit?: number;        // Minimum bookable increment
  maximumBookingUnit?: number;        // Maximum bookable increment
  terms?: string;                     // Terms and conditions
  requirements?: string[];            // Prerequisites (certifications, insurance, etc.)
  tags?: string[];
  status: 'available' | 'booked' | 'maintenance' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export interface CapacityRequest {
  id: string;
  requesterActorId: string;
  requesterOrganizationId: string;
  capacityType: CapacityType;
  capacitySubtype?: string;
  title: string;
  description?: string;
  locationId?: string;
  locationName?: string;
  neededFrom: string;
  neededTo: string;
  quantityNeeded: number;
  unit: CapacityUnit;
  maxPricePerUnit?: number;
  maxPriceCurrency?: string;
  requirements?: string[];            // What the requester can provide
  urgency: 'low' | 'normal' | 'high' | 'critical';
  status: 'open' | 'matched' | 'booked' | 'cancelled' | 'expired';
  matchedListingIds?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export interface CapacityBooking {
  id: string;
  listingId: string;
  requestId?: string;                 // Optional: if booked via request
  assetId: string;
  providerActorId: string;
  providerOrganizationId: string;
  requesterActorId: string;
  requesterOrganizationId: string;
  capacityType: CapacityType;
  capacitySubtype?: string;
  bookedFrom: string;
  bookedTo: string;
  bookedAmount: number;
  bookedUnit: CapacityUnit;
  pricePerUnit: number;
  priceCurrency: string;
  totalPrice: number;
  status: BookingStatus;
  commitmentId?: string;              // Links to Commitment Graph
  terms?: string;
  actualUsage?: ActualUsageRecord[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export interface ActualUsageRecord {
  id: string;
  bookingId: string;
  usedFrom: string;
  usedTo: string;
  usedAmount: number;
  unit: CapacityUnit;
  recordedBy: string;
  recordedAt: string;
  evidenceIds?: string[];
  notes?: string;
}

export interface CapacityMatch {
  listingId: string;
  requestId: string;
  matchScore: number;                 // 0-100
  matchReasons: string[];
  conflicts?: string[];               // Any conflicts (schedule, price, requirements)
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const LISTINGS_KEY = 'aptlabs:capacity-listings';
const REQUESTS_KEY = 'aptlabs:capacity-requests';
const BOOKINGS_KEY = 'aptlabs:capacity-bookings';
const USAGE_KEY = 'aptlabs:capacity-usage';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readListings(): CapacityListing[] {
  return readJson<CapacityListing[]>(LISTINGS_KEY, []);
}

function writeListings(listings: CapacityListing[]): void {
  writeJson(LISTINGS_KEY, listings);
}

function readRequests(): CapacityRequest[] {
  return readJson<CapacityRequest[]>(REQUESTS_KEY, []);
}

function writeRequests(requests: CapacityRequest[]): void {
  writeJson(REQUESTS_KEY, requests);
}

function readBookings(): CapacityBooking[] {
  return readJson<CapacityBooking[]>(BOOKINGS_KEY, []);
}

function writeBookings(bookings: CapacityBooking[]): void {
  writeJson(BOOKINGS_KEY, bookings);
}

function readUsage(): ActualUsageRecord[] {
  return readJson<ActualUsageRecord[]>(USAGE_KEY, []);
}

function writeUsage(usage: ActualUsageRecord[]): void {
  writeJson(USAGE_KEY, usage);
}

// ---------------------------------------------------------------------------
// Capacity Listing CRUD
// ---------------------------------------------------------------------------

export interface RegisterCapacityInput {
  assetId: string;
  providerActorId: string;
  providerOrganizationId: string;
  capacityType: CapacityType;
  capacitySubtype?: string;
  title: string;
  description?: string;
  locationId?: string;
  locationName?: string;
  availableFrom: string;
  availableTo: string;
  capacityAmount: number;
  capacityUnit: CapacityUnit;
  pricePerUnit: number;
  priceCurrency: string;
  minimumBookingUnit?: number;
  maximumBookingUnit?: number;
  terms?: string;
  requirements?: string[];
  tags?: string[];
  createdBy: string;
  authz?: AuthzContext;
}

/**
 * Register available capacity for an asset.
 * Gated by `resource:write` when authz provided.
 * Updates Asset Passport utilization dimension.
 */
export function registerCapacity(input: RegisterCapacityInput): CapacityListing {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  // Verify asset exists and get passport
  const passport = getAssetPassport(input.assetId);
  if (!passport) {
    throw new Error(`Asset ${input.assetId} not found or has no passport`);
  }

  const now = nowIso();
  const listing: CapacityListing = {
    id: createId('cap-listing'),
    assetId: input.assetId,
    providerActorId: input.providerActorId,
    providerOrganizationId: input.providerOrganizationId,
    capacityType: input.capacityType,
    capacitySubtype: input.capacitySubtype,
    title: input.title,
    description: input.description,
    locationId: input.locationId,
    locationName: input.locationName,
    availableFrom: input.availableFrom,
    availableTo: input.availableTo,
    capacityAmount: input.capacityAmount,
    capacityUnit: input.capacityUnit,
    pricePerUnit: input.pricePerUnit,
    priceCurrency: input.priceCurrency,
    minimumBookingUnit: input.minimumBookingUnit ?? 1,
    maximumBookingUnit: input.maximumBookingUnit ?? input.capacityAmount,
    terms: input.terms,
    requirements: input.requirements ?? [],
    tags: input.tags ?? [],
    status: 'available',
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    version: 1,
  };

  const listings = readListings();
  listings.push(listing);
  writeListings(listings);

  // Update Asset Passport utilization dimension with new capacity offering
  updateAssetPassport(
    input.assetId,
    {
      utilization: {
        ...passport.utilization,
        currentUtilization: passport.utilization.currentUtilization,
        utilizationPattern: 'on-demand',
      },
      capacity: {
        ...passport.capacity,
        currentCapacity: `${input.capacityAmount} ${input.capacityUnit}`,
      },
    },
    input.createdBy,
    input.authz,
  );

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.providerActorId,
    action: 'resource.update',
    resourceType: 'capacity-listing',
    resourceId: listing.id,
    details: { assetId: input.assetId, capacityType: input.capacityType, amount: input.capacityAmount },
  });

  return listing;
}

export interface UpdateCapacityListingInput {
  id: string;
  title?: string;
  description?: string;
  availableFrom?: string;
  availableTo?: string;
  capacityAmount?: number;
  capacityUnit?: CapacityUnit;
  pricePerUnit?: number;
  priceCurrency?: string;
  minimumBookingUnit?: number;
  maximumBookingUnit?: number;
  terms?: string;
  requirements?: string[];
  tags?: string[];
  status?: CapacityListing['status'];
  updatedBy: string;
  authz?: AuthzContext;
}

/**
 * Update a capacity listing.
 */
export function updateCapacityListing(input: UpdateCapacityListingInput): CapacityListing | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const listings = readListings();
  const idx = listings.findIndex((l) => l.id === input.id);
  if (idx === -1) return undefined;

  const listing = listings[idx];
  const now = nowIso();

  const updated: CapacityListing = {
    ...listing,
    title: input.title ?? listing.title,
    description: input.description ?? listing.description,
    availableFrom: input.availableFrom ?? listing.availableFrom,
    availableTo: input.availableTo ?? listing.availableTo,
    capacityAmount: input.capacityAmount ?? listing.capacityAmount,
    capacityUnit: input.capacityUnit ?? listing.capacityUnit,
    pricePerUnit: input.pricePerUnit ?? listing.pricePerUnit,
    priceCurrency: input.priceCurrency ?? listing.priceCurrency,
    minimumBookingUnit: input.minimumBookingUnit ?? listing.minimumBookingUnit,
    maximumBookingUnit: input.maximumBookingUnit ?? listing.maximumBookingUnit,
    terms: input.terms ?? listing.terms,
    requirements: input.requirements ?? listing.requirements,
    tags: input.tags ?? listing.tags,
    status: (input.status ?? listing.status) as CapacityListing['status'],
    updatedAt: now,
    version: listing.version + 1,
  };

  listings[idx] = updated;
  writeListings(listings);

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: listing.providerActorId,
    action: 'resource.update',
    resourceType: 'capacity-listing',
    resourceId: listing.id,
    details: { changes: Object.keys(input).filter((k) => k !== 'id' && k !== 'updatedBy' && k !== 'authz') },
  });

  return updated;
}

export function getCapacityListing(id: string): CapacityListing | undefined {
  return readListings().find((l) => l.id === id);
}

export function listCapacityListings(filter?: {
  assetId?: string;
  providerActorId?: string;
  providerOrganizationId?: string;
  capacityType?: CapacityType;
  status?: CapacityListing['status'];
  availableFrom?: string;
  availableTo?: string;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}): CapacityListing[] {
  return readListings().filter((l) => {
    if (filter?.assetId && l.assetId !== filter.assetId) return false;
    if (filter?.providerActorId && l.providerActorId !== filter.providerActorId) return false;
    if (filter?.providerOrganizationId && l.providerOrganizationId !== filter.providerOrganizationId) return false;
    if (filter?.capacityType && l.capacityType !== filter.capacityType) return false;
    if (filter?.status && l.status !== filter.status) return false;
    if (filter?.availableFrom && l.availableTo < filter.availableFrom) return false;
    if (filter?.availableTo && l.availableFrom > filter.availableTo) return false;
    if (filter?.locationId && l.locationId !== filter.locationId) return false;
    if (filter?.minPrice !== undefined && l.pricePerUnit < filter.minPrice) return false;
    if (filter?.maxPrice !== undefined && l.pricePerUnit > filter.maxPrice) return false;
    if (filter?.tags && filter.tags.length > 0) {
      if (!l.tags || !filter.tags.some((t) => l.tags!.includes(t))) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Capacity Request CRUD
// ---------------------------------------------------------------------------

export interface CreateCapacityRequestInput {
  requesterActorId: string;
  requesterOrganizationId: string;
  capacityType: CapacityType;
  capacitySubtype?: string;
  title: string;
  description?: string;
  locationId?: string;
  locationName?: string;
  neededFrom: string;
  neededTo: string;
  quantityNeeded: number;
  unit: CapacityUnit;
  maxPricePerUnit?: number;
  maxPriceCurrency?: string;
  requirements?: string[];
  urgency?: 'low' | 'normal' | 'high' | 'critical';
  createdBy: string;
  authz?: AuthzContext;
}

/**
 * Create a capacity request (demand side).
 */
export function createCapacityRequest(input: CreateCapacityRequestInput): CapacityRequest {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const now = nowIso();
  const request: CapacityRequest = {
    id: createId('cap-request'),
    requesterActorId: input.requesterActorId,
    requesterOrganizationId: input.requesterOrganizationId,
    capacityType: input.capacityType,
    capacitySubtype: input.capacitySubtype,
    title: input.title,
    description: input.description,
    locationId: input.locationId,
    locationName: input.locationName,
    neededFrom: input.neededFrom,
    neededTo: input.neededTo,
    quantityNeeded: input.quantityNeeded,
    unit: input.unit,
    maxPricePerUnit: input.maxPricePerUnit,
    maxPriceCurrency: input.maxPriceCurrency,
    requirements: input.requirements ?? [],
    urgency: input.urgency ?? 'normal',
    status: 'open',
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    version: 1,
  };

  const requests = readRequests();
  requests.push(request);
  writeRequests(requests);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.requesterActorId,
    action: 'resource.create',
    resourceType: 'capacity-request',
    resourceId: request.id,
    details: { capacityType: input.capacityType, quantity: input.quantityNeeded, urgency: input.urgency },
  });

  return request;
}

export function getCapacityRequest(id: string): CapacityRequest | undefined {
  return readRequests().find((r) => r.id === id);
}

export function listCapacityRequests(filter?: {
  requesterActorId?: string;
  requesterOrganizationId?: string;
  capacityType?: CapacityType;
  status?: CapacityRequest['status'];
  neededFrom?: string;
  neededTo?: string;
  urgency?: CapacityRequest['urgency'];
}): CapacityRequest[] {
  return readRequests().filter((r) => {
    if (filter?.requesterActorId && r.requesterActorId !== filter.requesterActorId) return false;
    if (filter?.requesterOrganizationId && r.requesterOrganizationId !== filter.requesterOrganizationId) return false;
    if (filter?.capacityType && r.capacityType !== filter.capacityType) return false;
    if (filter?.status && r.status !== filter.status) return false;
    if (filter?.neededFrom && r.neededTo < filter.neededFrom) return false;
    if (filter?.neededTo && r.neededFrom > filter.neededTo) return false;
    if (filter?.urgency && r.urgency !== filter.urgency) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Matching Engine
// ---------------------------------------------------------------------------

export interface MatchCapacityInput {
  requestId: string;
  minScore?: number;                  // Default 50
  maxResults?: number;                // Default 10
  authz?: AuthzContext;
}

/**
 * Match a capacity request to available listings.
 * Returns ranked matches with scores and reasons.
 */
export function matchCapacity(input: MatchCapacityInput): CapacityMatch[] {
  if (input.authz) {
    requirePermission(input.authz, 'resource:read');
  }

  const request = getCapacityRequest(input.requestId);
  if (!request) throw new Error(`Request ${input.requestId} not found`);

  const listings = listCapacityListings({
    capacityType: request.capacityType,
    status: 'available',
    availableFrom: request.neededFrom,
    availableTo: request.neededTo,
    locationId: request.locationId,
    maxPrice: request.maxPricePerUnit,
  });

  const matches: CapacityMatch[] = [];

  for (const listing of listings) {
    let score = 0;
    const reasons: string[] = [];
    const conflicts: string[] = [];

    // Time window overlap (0-30 points)
    const overlapStart = new Date(Math.max(new Date(listing.availableFrom).getTime(), new Date(request.neededFrom).getTime()));
    const overlapEnd = new Date(Math.min(new Date(listing.availableTo).getTime(), new Date(request.neededTo).getTime()));
    const overlapHours = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
    const requestHours = (new Date(request.neededTo).getTime() - new Date(request.neededFrom).getTime()) / (1000 * 60 * 60);
    if (overlapHours > 0) {
      const timeScore = Math.min(30, Math.round((overlapHours / requestHours) * 30));
      score += timeScore;
      reasons.push(`Time overlap: ${Math.round(overlapHours)}h of ${Math.round(requestHours)}h needed`);
    } else {
      conflicts.push('No time window overlap');
      continue; // Skip if no time overlap
    }

    // Location match (0-20 points)
    if (request.locationId && listing.locationId === request.locationId) {
      score += 20;
      reasons.push('Exact location match');
    } else if (!request.locationId || !listing.locationId) {
      score += 10;
      reasons.push('Location flexible');
    } else {
      conflicts.push('Location mismatch');
    }

    // Price match (0-20 points)
    if (request.maxPricePerUnit !== undefined) {
      if (listing.pricePerUnit <= request.maxPricePerUnit) {
        const priceRatio = listing.pricePerUnit / request.maxPricePerUnit;
        const priceScore = Math.round(20 * (1 - priceRatio * 0.5)); // Better score for lower price
        score += priceScore;
        reasons.push(`Price within budget (${listing.pricePerUnit}/${request.maxPricePerUnit} ${request.maxPriceCurrency})`);
      } else {
        conflicts.push(`Price exceeds budget: ${listing.pricePerUnit} > ${request.maxPricePerUnit}`);
      }
    } else {
      score += 10;
      reasons.push('No price ceiling specified');
    }

    // Capacity amount match (0-15 points)
    if (listing.capacityAmount >= request.quantityNeeded) {
      score += 15;
      reasons.push(`Sufficient capacity (${listing.capacityAmount} >= ${request.quantityNeeded})`);
    } else {
      const ratio = listing.capacityAmount / request.quantityNeeded;
      score += Math.round(15 * ratio);
      reasons.push(`Partial capacity (${listing.capacityAmount} of ${request.quantityNeeded})`);
    }

    // Unit compatibility (0-10 points)
    if (listing.capacityUnit === request.unit) {
      score += 10;
      reasons.push('Unit matches');
    } else {
      conflicts.push(`Unit mismatch: ${listing.capacityUnit} vs ${request.unit}`);
    }

    // Requirements match (0-5 points)
    if (listing.requirements && listing.requirements.length > 0) {
      // In a real system, check if requester meets requirements
      score += 5;
      reasons.push('Requirements specified');
    } else {
      score += 5;
      reasons.push('No special requirements');
    }

    const minScore = input.minScore ?? 50;
    if (score >= minScore) {
      matches.push({
        listingId: listing.id,
        requestId: request.id,
        matchScore: Math.min(100, score),
        matchReasons: reasons,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches.slice(0, input.maxResults ?? 10);
}

// ---------------------------------------------------------------------------
// Booking Engine
// ---------------------------------------------------------------------------

export interface BookCapacityInput {
  listingId: string;
  requestId?: string;
  requesterActorId: string;
  requesterOrganizationId: string;
  bookedFrom: string;
  bookedTo: string;
  bookedAmount: number;
  bookedUnit: CapacityUnit;
  terms?: string;
  createCommitment?: boolean;         // Whether to create a Commitment Graph entry
  commitmentTitle?: string;
  commitmentDescription?: string;
  createdBy: string;
  authz?: AuthzContext;
}

/**
 * Book capacity from a listing.
 * Creates a booking record, optionally creates a commitment,
 * and updates the listing status and asset passport.
 */
export function bookCapacity(input: BookCapacityInput): CapacityBooking {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const listing = getCapacityListing(input.listingId);
  if (!listing) throw new Error(`Listing ${input.listingId} not found`);
  if (listing.status !== 'available') throw new Error(`Listing is not available (status: ${listing.status})`);

  // Validate booking within listing availability
  if (new Date(input.bookedFrom) < new Date(listing.availableFrom) ||
      new Date(input.bookedTo) > new Date(listing.availableTo)) {
    throw new Error('Booking period outside listing availability');
  }

  if (input.bookedAmount > listing.capacityAmount) {
    throw new Error(`Booking amount (${input.bookedAmount}) exceeds available capacity (${listing.capacityAmount})`);
  }

  if (input.bookedAmount < (listing.minimumBookingUnit ?? 1)) {
    throw new Error(`Booking amount below minimum (${listing.minimumBookingUnit})`);
  }

  if (input.bookedAmount > (listing.maximumBookingUnit ?? listing.capacityAmount)) {
    throw new Error(`Booking amount exceeds maximum (${listing.maximumBookingUnit})`);
  }

  const totalPrice = input.bookedAmount * listing.pricePerUnit;
  const now = nowIso();

  const booking: CapacityBooking = {
    id: createId('cap-booking'),
    listingId: input.listingId,
    requestId: input.requestId,
    assetId: listing.assetId,
    providerActorId: listing.providerActorId,
    providerOrganizationId: listing.providerOrganizationId,
    requesterActorId: input.requesterActorId,
    requesterOrganizationId: input.requesterOrganizationId,
    capacityType: listing.capacityType,
    capacitySubtype: listing.capacitySubtype,
    bookedFrom: input.bookedFrom,
    bookedTo: input.bookedTo,
    bookedAmount: input.bookedAmount,
    bookedUnit: input.bookedUnit,
    pricePerUnit: listing.pricePerUnit,
    priceCurrency: listing.priceCurrency,
    totalPrice,
    status: 'confirmed',
    terms: input.terms ?? listing.terms,
    actualUsage: [],
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    version: 1,
  };

  // Optionally create a commitment
  if (input.createCommitment) {
    const commitmentInput: CreateCommitmentInput = {
      title: input.commitmentTitle ?? `Capacity booking: ${listing.title}`,
      description: input.commitmentDescription ?? `Booking of ${input.bookedAmount} ${input.bookedUnit} of ${listing.capacityType} from ${input.bookedFrom} to ${input.bookedTo}`,
      organizationId: input.requesterOrganizationId,
      responsibleActorIds: [input.requesterActorId],
      assigneeActorIds: [input.requesterActorId],
      deadline: input.bookedTo,
      acceptanceCriteria: [
        {
          description: `Capacity delivered as booked: ${input.bookedAmount} ${input.bookedUnit}`,
          evidenceType: 'usage-record',
          minEvidenceStanding: 'verified',
        },
      ],
      resourceIds: [listing.assetId],
      createdBy: input.createdBy,
      authz: input.authz,
    };
    const commitment = createCommitment(commitmentInput);
    booking.commitmentId = commitment.id;
  }

  const bookings = readBookings();
  bookings.push(booking);
  writeBookings(bookings);

  // Update listing status and reduce available capacity
  const listings = readListings();
  const listingIdx = listings.findIndex((l) => l.id === input.listingId);
  if (listingIdx !== -1) {
    const newCapacityAmount = listings[listingIdx].capacityAmount - input.bookedAmount;
    const newStatus = newCapacityAmount <= 0 ? 'booked' : 'available';
    const updatedListing: CapacityListing = {
      ...listings[listingIdx],
      capacityAmount: newCapacityAmount,
      status: newStatus,
      updatedAt: now,
      version: listings[listingIdx].version + 1,
    };
    listings[listingIdx] = updatedListing;
    writeListings(listings);
  }

  // Update request status if linked
  if (input.requestId) {
    const requests = readRequests();
    const requestIdx = requests.findIndex((r) => r.id === input.requestId);
    if (requestIdx !== -1) {
      requests[requestIdx] = {
        ...requests[requestIdx],
        status: 'booked',
        matchedListingIds: [...(requests[requestIdx].matchedListingIds ?? []), input.listingId],
        updatedAt: now,
        version: requests[requestIdx].version + 1,
      };
      writeRequests(requests);
    }
  }

  // Update Asset Passport utilization dimension
  const passport = getAssetPassport(listing.assetId);
  if (passport) {
    const bookedHours = (new Date(input.bookedTo).getTime() - new Date(input.bookedFrom).getTime()) / (1000 * 60 * 60);
    const totalHours = (new Date(listing.availableTo).getTime() - new Date(listing.availableFrom).getTime()) / (1000 * 60 * 60);
    const newUtilization = Math.min(1, (passport.utilization.currentUtilization * totalHours + bookedHours) / totalHours);

    updateAssetPassport(
      listing.assetId,
      {
        utilization: {
          ...passport.utilization,
          currentUtilization: newUtilization,
          utilizationPattern: 'on-demand',
        },
      },
      input.createdBy,
      input.authz,
    );
  }

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.requesterActorId,
    action: 'resource.create',
    resourceType: 'capacity-booking',
    resourceId: booking.id,
    details: { listingId: input.listingId, amount: input.bookedAmount, totalPrice, commitmentId: booking.commitmentId },
  });

  return booking;
}

export function getCapacityBooking(id: string): CapacityBooking | undefined {
  return readBookings().find((b) => b.id === id);
}

export function listCapacityBookings(filter?: {
  assetId?: string;
  providerActorId?: string;
  requesterActorId?: string;
  providerOrganizationId?: string;
  requesterOrganizationId?: string;
  status?: BookingStatus;
  capacityType?: CapacityType;
  bookedFrom?: string;
  bookedTo?: string;
}): CapacityBooking[] {
  return readBookings().filter((b) => {
    if (filter?.assetId && b.assetId !== filter.assetId) return false;
    if (filter?.providerActorId && b.providerActorId !== filter.providerActorId) return false;
    if (filter?.requesterActorId && b.requesterActorId !== filter.requesterActorId) return false;
    if (filter?.providerOrganizationId && b.providerOrganizationId !== filter.providerOrganizationId) return false;
    if (filter?.requesterOrganizationId && b.requesterOrganizationId !== filter.requesterOrganizationId) return false;
    if (filter?.status && b.status !== filter.status) return false;
    if (filter?.capacityType && b.capacityType !== filter.capacityType) return false;
    if (filter?.bookedFrom && b.bookedTo < filter.bookedFrom) return false;
    if (filter?.bookedTo && b.bookedFrom > filter.bookedTo) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Usage Tracking
// ---------------------------------------------------------------------------

export interface RecordUsageInput {
  bookingId: string;
  usedFrom: string;
  usedTo: string;
  usedAmount: number;
  unit: CapacityUnit;
  recordedBy: string;
  evidenceIds?: string[];
  notes?: string;
  authz?: AuthzContext;
}

/**
 * Record actual usage against a booking.
 * Updates booking, asset passport, and commitment if linked.
 */
export function recordUsage(input: RecordUsageInput): ActualUsageRecord {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const booking = getCapacityBooking(input.bookingId);
  if (!booking) throw new Error(`Booking ${input.bookingId} not found`);
  if (booking.status === 'cancelled') throw new Error('Cannot record usage on cancelled booking');

  const usage: ActualUsageRecord = {
    id: createId('usage'),
    bookingId: input.bookingId,
    usedFrom: input.usedFrom,
    usedTo: input.usedTo,
    usedAmount: input.usedAmount,
    unit: input.unit,
    recordedBy: input.recordedBy,
    recordedAt: nowIso(),
    evidenceIds: input.evidenceIds,
    notes: input.notes,
  };

  const usageRecords = readUsage();
  usageRecords.push(usage);
  writeUsage(usageRecords);

  // Update booking with actual usage
  const bookings = readBookings();
  const bookingIdx = bookings.findIndex((b) => b.id === input.bookingId);
  if (bookingIdx !== -1) {
    const updatedBooking = {
      ...bookings[bookingIdx],
      actualUsage: [...(bookings[bookingIdx].actualUsage ?? []), usage],
      status: 'active' as BookingStatus,
      updatedAt: nowIso(),
      version: bookings[bookingIdx].version + 1,
    };
    bookings[bookingIdx] = updatedBooking;
    writeBookings(bookings);
  }

  const totalBookedHours = (new Date(booking.bookedTo).getTime() - new Date(booking.bookedFrom).getTime()) / (1000 * 60 * 60);
  const usedHours = (new Date(input.usedTo).getTime() - new Date(input.usedFrom).getTime()) / (1000 * 60 * 60);

  // Update Asset Passport with actual utilization
  const passport = getAssetPassport(booking.assetId);
  if (passport) {
    const actualUtilization = totalBookedHours > 0 ? usedHours / totalBookedHours : 0;

    updateAssetPassport(
      booking.assetId,
      {
        utilization: {
          ...passport.utilization,
          currentUtilization: actualUtilization,
          averageUtilization30d: actualUtilization, // Simplified; real impl would average
        },
        performance: {
          ...passport.performance,
          kpis: [
            ...passport.performance.kpis,
            {
              id: `kpi-util-${Date.now()}`,
              name: 'Capacity Utilization',
              value: actualUtilization * 100,
              unit: '%',
              target: 85,
              trend: actualUtilization > (passport.utilization.averageUtilization30d ?? 0) ? 'improving' : 'stable',
              period: new Date().toISOString().slice(0, 7),
              evidenceIds: input.evidenceIds,
            },
          ],
        },
      },
      input.recordedBy,
      input.authz,
    );
  }

  logAuditEvent({
    accountId: input.recordedBy,
    actorId: booking.requesterActorId,
    action: 'resource.update',
    resourceType: 'capacity-usage',
    resourceId: usage.id,
    details: { bookingId: input.bookingId, usedAmount: input.usedAmount, usedHours },
  });

  return usage;
}

export function getUsageForBooking(bookingId: string): ActualUsageRecord[] {
  return readUsage().filter((u) => u.bookingId === bookingId);
}

// ---------------------------------------------------------------------------
// Search & Discovery API
// ---------------------------------------------------------------------------

export interface SearchCapacityParams {
  capacityType?: CapacityType;
  capacitySubtype?: string;
  locationId?: string;
  locationName?: string;
  availableFrom?: string;
  availableTo?: string;
  minCapacityAmount?: number;
  maxCapacityAmount?: number;
  capacityUnit?: CapacityUnit;
  minPricePerUnit?: number;
  maxPricePerUnit?: number;
  priceCurrency?: string;
  tags?: string[];
  providerOrganizationId?: string;
  onlyAvailable?: boolean;
}

/**
 * Unified search across listings with rich filters.
 */
export function searchCapacity(params: SearchCapacityParams): CapacityListing[] {
  let listings = readListings();

  if (params.onlyAvailable !== false) {
    listings = listings.filter((l) => l.status === 'available');
  }

  if (params.capacityType) {
    listings = listings.filter((l) => l.capacityType === params.capacityType);
  }
  if (params.capacitySubtype) {
    listings = listings.filter((l) => l.capacitySubtype?.toLowerCase().includes(params.capacitySubtype!.toLowerCase()));
  }
  if (params.locationId) {
    listings = listings.filter((l) => l.locationId === params.locationId);
  }
  if (params.locationName) {
    listings = listings.filter((l) => l.locationName?.toLowerCase().includes(params.locationName!.toLowerCase()));
  }
  if (params.availableFrom) {
    listings = listings.filter((l) => l.availableTo >= params.availableFrom!);
  }
  if (params.availableTo) {
    listings = listings.filter((l) => l.availableFrom <= params.availableTo!);
  }
  if (params.minCapacityAmount !== undefined) {
    listings = listings.filter((l) => l.capacityAmount >= params.minCapacityAmount!);
  }
  if (params.maxCapacityAmount !== undefined) {
    listings = listings.filter((l) => l.capacityAmount <= params.maxCapacityAmount!);
  }
  if (params.capacityUnit) {
    listings = listings.filter((l) => l.capacityUnit === params.capacityUnit);
  }
  if (params.minPricePerUnit !== undefined) {
    listings = listings.filter((l) => l.pricePerUnit >= params.minPricePerUnit!);
  }
  if (params.maxPricePerUnit !== undefined) {
    listings = listings.filter((l) => l.pricePerUnit <= params.maxPricePerUnit!);
  }
  if (params.priceCurrency) {
    listings = listings.filter((l) => l.priceCurrency === params.priceCurrency);
  }
  if (params.tags && params.tags.length > 0) {
    listings = listings.filter((l) => l.tags && params.tags!.some((t) => l.tags!.includes(t)));
  }
  if (params.providerOrganizationId) {
    listings = listings.filter((l) => l.providerOrganizationId === params.providerOrganizationId);
  }

  return listings;
}

// ---------------------------------------------------------------------------
// Analytics & Reporting
// ---------------------------------------------------------------------------

export interface CapacityUtilizationStats {
  assetId: string;
  assetName: string;
  capacityType: CapacityType;
  totalCapacity: number;
  bookedCapacity: number;
  usedCapacity: number;
  utilizationRate: number;          // used / total
  bookingRate: number;              // booked / total
  averageBookingDurationHours: number;
  totalBookings: number;
  totalRevenue: number;
  currency: string;
  period: { from: string; to: string };
}

export function getCapacityUtilizationStats(
  assetId: string,
  periodFrom: string,
  periodTo: string
): CapacityUtilizationStats | undefined {
  const asset = getRecord(assetId);
  if (!asset || asset.family !== 'RESOURCE') return undefined;

  const assetData = asset.data as { name?: string; capacity?: string };
  const passport = getAssetPassport(assetId);
  if (!passport) return undefined;

  const bookings = listCapacityBookings({
    assetId,
    bookedFrom: periodFrom,
    bookedTo: periodTo,
  });

  const totalCapacity = passport.capacity.currentCapacity !== 'unspecified'
    ? parseFloat(passport.capacity.currentCapacity.split(' ')[0])
    : 0;

  let bookedCapacity = 0;
  let usedCapacity = 0;
  let totalBookingHours = 0;
  let totalRevenue = 0;

  for (const booking of bookings) {
    bookedCapacity += booking.bookedAmount;
    totalRevenue += booking.totalPrice;
    const bookingHours = (new Date(booking.bookedTo).getTime() - new Date(booking.bookedFrom).getTime()) / (1000 * 60 * 60);
    totalBookingHours += bookingHours;

    const usage = getUsageForBooking(booking.id);
    for (const u of usage) {
      usedCapacity += u.usedAmount;
    }
  }

  return {
    assetId,
    assetName: assetData.name ?? 'Unknown',
    capacityType: passport.capacity.currentCapacity !== 'unspecified' ? 'unknown' as CapacityType : 'unknown' as CapacityType,
    totalCapacity,
    bookedCapacity,
    usedCapacity,
    utilizationRate: totalCapacity > 0 ? usedCapacity / totalCapacity : 0,
    bookingRate: totalCapacity > 0 ? bookedCapacity / totalCapacity : 0,
    averageBookingDurationHours: bookings.length > 0 ? totalBookingHours / bookings.length : 0,
    totalBookings: bookings.length,
    totalRevenue,
    currency: bookings[0]?.priceCurrency ?? 'USD',
    period: { from: periodFrom, to: periodTo },
  };
}

export interface OrganizationCapacitySummary {
  organizationId: string;
  organizationName: string;
  totalListings: number;
  availableListings: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalCapacityOffered: number;
  totalCapacityBooked: number;
  totalRevenue: number;
  currency: string;
  averageUtilization: number;
  topCapacityTypes: { type: CapacityType; count: number }[];
}

export function getOrganizationCapacitySummary(
  organizationId: string,
  periodFrom: string,
  periodTo: string
): OrganizationCapacitySummary {
  const org = require('./actors').getOrganization(organizationId);
  const orgName = org?.name ?? 'Unknown';

  const listings = listCapacityListings({ providerOrganizationId: organizationId });
  const bookings = listCapacityBookings({
    providerOrganizationId: organizationId,
    bookedFrom: periodFrom,
    bookedTo: periodTo,
  });

  const capacityTypes = new Map<CapacityType, number>();
  for (const l of listings) {
    capacityTypes.set(l.capacityType, (capacityTypes.get(l.capacityType) ?? 0) + 1);
  }
  const topCapacityTypes = Array.from(capacityTypes.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
    const passport = getAssetPassport(b.assetId);
    if (passport) {
      utilizationSum += passport.utilization.currentUtilization;
      utilizationCount++;
    }
  }

  return {
    organizationId,
    organizationName: orgName,
    totalListings: listings.length,
    availableListings: listings.filter((l) => l.status === 'available').length,
    totalBookings: bookings.length,
    activeBookings: bookings.filter((b) => b.status === 'active').length,
    completedBookings: bookings.filter((b) => b.status === 'completed').length,
    totalCapacityOffered,
    totalCapacityBooked,
    totalRevenue,
    currency: bookings[0]?.priceCurrency ?? 'USD',
    averageUtilization: utilizationCount > 0 ? utilizationSum / utilizationCount : 0,
    topCapacityTypes,
  };
}

// ---------------------------------------------------------------------------
// Export all types and functions
// ---------------------------------------------------------------------------

