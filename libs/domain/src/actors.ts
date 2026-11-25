/**
 * APT-LABS — Multi-Actor model (Gate 1 — Foundations)
 *
 * One authenticated account may participate in multiple Actors. Actors are the
 * organisational containers (Person, Company, Institution, Crew, etc.) through
 * which productive capacity is registered, discovered, and coordinated.
 *
 * Pure domain types only. The Vue monolith's localStorage-backed actor,
 * organization, membership and mandate services were stripped; this module keeps
 * the data contracts so the Angular domain layer can model the same entities
 * without any browser-storage or reactivity dependency.
 */

import type { ActorType } from '@apt-labs/ontology';
import { ACTOR_TYPE_LABELS } from '@apt-labs/ontology';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { ActorType };
export { ACTOR_TYPE_LABELS };

export type ActorRole =
  | 'owner'
  | 'administrator'
  | 'manager'
  | 'member'
  | 'contributor'
  | 'viewer'
  | 'authorizedRepresentative';

export const ACTOR_ROLE_LABELS: Record<ActorRole, string> = {
  owner: 'Owner / Founder',
  administrator: 'Administrator',
  manager: 'Manager',
  member: 'Member',
  contributor: 'Contributor',
  viewer: 'Viewer',
  authorizedRepresentative: 'Authorised Representative',
};

export interface Actor {
  id: string;
  type: ActorType;
  name: string;
  description?: string;
  /** Account id that created the Actor. */
  ownerId: string;
  visibility: 'public' | 'shared' | 'restricted';
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ActorMembership {
  id: string;
  accountId: string;
  actorId: string;
  role: ActorRole;
  joinedAt: string;
  invitedBy: string | null;
  isPrimary: boolean;
  /** Organization context for this membership. */
  organizationId?: string;
}

export interface CreateActorInput {
  type: ActorType;
  name: string;
  description?: string;
  visibility?: 'public' | 'shared' | 'restricted';
}

export interface AddMemberInput {
  actorId: string;
  accountId: string;
  role: ActorRole;
  invitedBy: string | null;
  organizationId?: string;
}

// ---------------------------------------------------------------------------
// Organization entity (multi-tenant workspace context)
// ---------------------------------------------------------------------------

export type OrganizationType =
  | 'cooperative'
  | 'institution'
  | 'enterprise'
  | 'government'
  | 'consortium'
  | 'other';

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  cooperative: 'Cooperative',
  institution: 'Institution',
  enterprise: 'Enterprise',
  government: 'Government',
  consortium: 'Consortium',
  other: 'Other',
};

export interface Organization {
  id: string;
  type: OrganizationType;
  name: string;
  description?: string;
  /** Parent organization (for hierarchies). */
  parentId?: string;
  /** Legal jurisdiction. */
  jurisdiction?: string;
  /** Registration number / identifier. */
  registrationId?: string;
  /** Account id that created the Organization. */
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export interface CreateOrganizationInput {
  type: OrganizationType;
  name: string;
  description?: string;
  parentId?: string;
  jurisdiction?: string;
  registrationId?: string;
}

// ---------------------------------------------------------------------------
// Multi-tenant Workspace Context
// ---------------------------------------------------------------------------

export interface WorkspaceContext {
  /** The organization this workspace belongs to. */
  organizationId: string;
  /** The actor operating within this workspace. */
  actorId: string;
  /** Effective permissions in this workspace (derived from membership + mandates). */
  effectivePermissions: string[];
  /** Active mandates for the actor in this workspace. */
  activeMandates: Mandate[];
}

// ---------------------------------------------------------------------------
// Mandate Delegation — authority to act within scope + period
// ---------------------------------------------------------------------------

export type MandateScope =
  | 'full'
  | 'resource:manage'
  | 'commitment:sign'
  | 'work:authorize'
  | 'evidence:verify'
  | 'financial:approve'
  | 'member:invite'
  | 'custom';

export const MANDATE_SCOPE_LABELS: Record<MandateScope, string> = {
  full: 'Full Authority',
  'resource:manage': 'Resource Management',
  'commitment:sign': 'Commitment Signing',
  'work:authorize': 'Work Authorization',
  'evidence:verify': 'Evidence Verification',
  'financial:approve': 'Financial Approval',
  'member:invite': 'Member Invitation',
  custom: 'Custom Scope',
};

export interface Mandate {
  id: string;
  /** The organization granting the mandate. */
  organizationId: string;
  /** The actor receiving the mandate (must be a member). */
  actorId: string;
  /** The account acting under this mandate. */
  accountId: string;
  /** Scope of authority granted. */
  scope: MandateScope | string;
  /** Custom scope properties when scope is 'custom'. */
  customScope?: Record<string, unknown>;
  /** When the mandate takes effect. */
  effectiveAt: string;
  /** When the mandate expires (optional). */
  expiresAt?: string;
  /** Who granted the mandate. */
  grantedBy: string;
  /** Whether the mandate is currently active. */
  active: boolean;
  /** Reason / description for the mandate. */
  reason?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export interface CreateMandateInput {
  organizationId: string;
  actorId: string;
  accountId: string;
  scope: MandateScope | string;
  customScope?: Record<string, unknown>;
  effectiveAt: string;
  expiresAt?: string;
  grantedBy: string;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Extended Membership with Organization Context
// ---------------------------------------------------------------------------

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  actorId: string;
  /** Role within the organization (owner, administrator, manager, member, viewer). */
  role: ActorRole;
  joinedAt: string;
  invitedBy: string | null;
  /** Active mandates for this actor in this organization. */
  mandateIds?: string[];
}
