/**
 * APT-LABS — Ontology Event Envelope
 *
 * Append-only event ledger. Every meaningful activity and transition is
 * recorded as an event with `occurredAt` (when it happened in reality) and
 * `recordedAt` (when it was entered into APT-LABS). Corrections create
 * corrective/superseding events — never silent rewrites.
 *
 * Event envelope:
 *   eventId, eventType, schemaVersion, subjectId, actorId, organizationId?,
 *   occurredAt, recordedAt, placeId?, correlationId?, causationId?,
 *   source{system,method}, evidenceIds[], payload
 */

import type { Family } from './types';

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export const EVENT_TYPE = {
  // Entity lifecycle
  ENTITY_CREATED: 'ENTITY_CREATED',
  ENTITY_UPDATED: 'ENTITY_UPDATED',
  ENTITY_CORRECTED: 'ENTITY_CORRECTED',
  ENTITY_RETIRED: 'ENTITY_RETIRED',

  // Relationship lifecycle
  RELATIONSHIP_CREATED: 'RELATIONSHIP_CREATED',
  RELATIONSHIP_UPDATED: 'RELATIONSHIP_UPDATED',
  RELATIONSHIP_TERMINATED: 'RELATIONSHIP_TERMINATED',

  // Workflow / kinetic actions
  COMMIT_CREATED: 'COMMIT_CREATED',
  ASSIGN_CREATED: 'ASSIGN_CREATED',
  VERIFY_CREATED: 'VERIFY_CREATED',
  SETTLE_CREATED: 'SETTLE_CREATED',
  PRODUCE_CREATED: 'PRODUCE_CREATED',

  // Commitment lifecycle (first-class infrastructure)
  COMMITMENT_PROPOSED: 'COMMITMENT_PROPOSED',
  COMMITMENT_ACCEPTED: 'COMMITMENT_ACCEPTED',
  COMMITMENT_ACTIVATED: 'COMMITMENT_ACTIVATED',
  COMMITMENT_FULFILLED: 'COMMITMENT_FULFILLED',
  COMMITMENT_DISCHARGED: 'COMMITMENT_DISCHARGED',
  COMMITMENT_EXPIRED: 'COMMITMENT_EXPIRED',

  // Value
  VALUE_REALIZED: 'VALUE_REALIZED',

  // Gate transitions (Workbench)
  GATE_ADVANCED: 'GATE_ADVANCED',

  // Evidence
  EVIDENCE_ADDED: 'EVIDENCE_ADDED',
  EVIDENCE_VERIFIED: 'EVIDENCE_VERIFIED',

  // Governance
  PROPOSAL_CREATED: 'PROPOSAL_CREATED',
  PROPOSAL_DECIDED: 'PROPOSAL_DECIDED',

  // System
  SYSTEM_AUDIT: 'SYSTEM_AUDIT',
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

// ---------------------------------------------------------------------------
// Event source
// ---------------------------------------------------------------------------

export interface EventSource {
  /** System that originated the event (e.g. 'aptlabs-web', 'n8n', 'mobile-app'). */
  system: string;
  /** Method within the system (e.g. 'ui.commit', 'n8n.workflow.w1'). */
  method: string;
}

// ---------------------------------------------------------------------------
// Event envelope
// ---------------------------------------------------------------------------

export interface AptEvent {
  /** Globally unique event id. */
  eventId: string;
  /** Type of event. */
  eventType: EventType;
  /** Schema version of the event envelope. */
  schemaVersion: string;
  /** Entity id this event is about (subject). */
  subjectId: string;
  /** Subject family (for type-safe lookup). */
  subjectFamily?: Family;
  /** Actor who caused the event. */
  actorId: string;
  /** Organization context (optional). */
  organizationId?: string;
  /** When the event occurred in reality (ISO string). */
  occurredAt: string;
  /** When the event was recorded in APT-LABS (ISO string). */
  recordedAt: string;
  /** Place where the event occurred (optional). */
  placeId?: string;
  /** Correlation id for tracing a business process across events. */
  correlationId?: string;
  /** Causation id — the prior event that caused this one (optional). */
  causationId?: string;
  /** Source system and method. */
  source: EventSource;
  /** Evidence ids supporting this event (optional). */
  evidenceIds?: string[];
  /** Event-specific payload (typed per eventType). */
  payload: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Correction / superseding event
// ---------------------------------------------------------------------------

export interface CorrectiveEvent extends AptEvent {
  /** The event id being corrected or superseded. */
  correctsEventId: string;
  /** Reason for the correction. */
  correctionReason: string;
}

// ---------------------------------------------------------------------------
// Event factory helpers
// ---------------------------------------------------------------------------

export function createEventId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createEvent(
  params: {
    eventType: EventType;
    subjectId: string;
    actorId: string;
    occurredAt: string;
    source: EventSource;
    payload: Record<string, unknown>;
    subjectFamily?: Family;
    organizationId?: string;
    placeId?: string;
    correlationId?: string;
    causationId?: string;
    evidenceIds?: string[];
    schemaVersion?: string;
    recordedAt?: string;
  },
): AptEvent {
  const now = new Date().toISOString();
  return {
    eventId: createEventId(),
    eventType: params.eventType,
    schemaVersion: params.schemaVersion ?? '1.0.0',
    subjectId: params.subjectId,
    subjectFamily: params.subjectFamily,
    actorId: params.actorId,
    organizationId: params.organizationId,
    occurredAt: params.occurredAt,
    recordedAt: params.recordedAt ?? now,
    placeId: params.placeId,
    correlationId: params.correlationId,
    causationId: params.causationId,
    source: params.source,
    evidenceIds: params.evidenceIds,
    payload: params.payload,
  };
}

export function createCorrectiveEvent(
  params: {
    correctsEventId: string;
    correctionReason: string;
    eventType: EventType;
    subjectId: string;
    actorId: string;
    occurredAt: string;
    source: EventSource;
    payload: Record<string, unknown>;
    subjectFamily?: Family;
    organizationId?: string;
    placeId?: string;
    correlationId?: string;
    causationId?: string;
    evidenceIds?: string[];
    schemaVersion?: string;
    recordedAt?: string;
  },
): CorrectiveEvent {
  const event = createEvent({
    eventType: params.eventType,
    subjectId: params.subjectId,
    actorId: params.actorId,
    occurredAt: params.occurredAt,
    source: params.source,
    payload: params.payload,
    subjectFamily: params.subjectFamily,
    organizationId: params.organizationId,
    placeId: params.placeId,
    correlationId: params.correlationId,
    causationId: params.causationId,
    evidenceIds: params.evidenceIds,
    schemaVersion: params.schemaVersion,
    recordedAt: params.recordedAt,
  });
  return {
    ...event,
    correctsEventId: params.correctsEventId,
    correctionReason: params.correctionReason,
  };
}

// ---------------------------------------------------------------------------
// Runtime guard
// ---------------------------------------------------------------------------

export function isAptEvent(value: unknown): value is AptEvent {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<AptEvent>;
  return (
    typeof e.eventId === 'string'
    && typeof e.eventType === 'string'
    && typeof e.schemaVersion === 'string'
    && typeof e.subjectId === 'string'
    && typeof e.actorId === 'string'
    && typeof e.occurredAt === 'string'
    && typeof e.recordedAt === 'string'
    && typeof e.source === 'object'
    && e.source !== null
    && typeof (e.source as Partial<EventSource>).system === 'string'
    && typeof (e.source as Partial<EventSource>).method === 'string'
    && typeof e.payload === 'object'
    && e.payload !== null
  );
}
