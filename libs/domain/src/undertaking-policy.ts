/**
 * @apt-labs/domain — workbench authority and lifecycle
 *
 * One canonical answer to "what may this person do with this undertaking?".
 * The server authorizes with it; the workbench renders from it, so the two can
 * never tell different stories about the same record.
 */

export type OrganizationRole = 'owner' | 'administrator' | 'manager' | 'member' | 'viewer';
export type UndertakingStatus = 'open' | 'active' | 'closed';
export type OfferStatus = 'pending' | 'accepted' | 'declined';
export type ReviewDecision = 'accepted' | 'disputed' | 'needs_revision';

export const MANAGING_ROLES: readonly OrganizationRole[] = ['owner', 'administrator', 'manager'];

/** Anyone who may publish, triage, close or review for the owning organization. */
export function isManagingRole(role: string | null | undefined): boolean {
  return typeof role === 'string' && (MANAGING_ROLES as readonly string[]).includes(role);
}

export interface WorkPosition {
  /** The signed-in person's role in the owning organization, or null when not a member. */
  role: OrganizationRole | null;
  status: UndertakingStatus;
  isParticipant: boolean;
  hasInterest: boolean;
  /** A pending offer addressed to this person, if any. */
  pendingOfferId: string | null;
}

export interface WorkActions {
  canPostWork: boolean;
  canTriageInterests: boolean;
  canIssueOffer: boolean;
  canClose: boolean;
  canRegisterInterest: boolean;
  canAcceptPendingOffer: boolean;
  canReport: boolean;
  canReflect: boolean;
}

/**
 * Actions are derived, never stored. A closed undertaking accepts no new
 * interest, offer, report or review; history stays readable.
 */
export function workActions(position: WorkPosition): WorkActions {
  const managing = isManagingRole(position.role);
  const open = position.status === 'open';
  const live = position.status !== 'closed';
  return {
    canPostWork: managing,
    canTriageInterests: managing && live,
    canIssueOffer: managing && live,
    canClose: managing && live,
    canRegisterInterest: !managing && open && !position.hasInterest && !position.isParticipant,
    canAcceptPendingOffer: !managing && live && Boolean(position.pendingOfferId) && !position.isParticipant,
    canReport: position.isParticipant && live,
    canReflect: position.isParticipant && position.status === 'closed',
  };
}

export function canReviewReport(input: {
  reviewerPersonId: string;
  authorPersonId: string;
  reviewerRole: OrganizationRole | null;
  alreadyReviewed: boolean;
}): boolean {
  return isManagingRole(input.reviewerRole)
    && input.reviewerPersonId !== input.authorPersonId
    && !input.alreadyReviewed;
}

/** Acceptance moves an open undertaking into delivery; a closed one stays closed. */
export function statusAfterAcceptance(status: UndertakingStatus): UndertakingStatus {
  return status === 'closed' ? 'closed' : 'active';
}

/** Manual close is the only reversible-looking transition, and it is one-way. */
export function statusAfterClose(status: UndertakingStatus): UndertakingStatus | null {
  return status === 'closed' ? null : 'closed';
}

/** A person may take part in an undertaking only through an accepted offer. */
export function isParticipant(participants: readonly string[], personId: string): boolean {
  return participants.includes(personId);
}
