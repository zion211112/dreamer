import type { OfferStatus, ReviewDecision, UndertakingStatus } from '@apt-labs/shared/state';

export const UNDERTAKING_STATUS_LABEL: Record<UndertakingStatus, string> = {
  open: 'Open for interest',
  active: 'Active',
  closed: 'Closed',
};

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  pending: 'Pending decision',
  accepted: 'Accepted',
  declined: 'Declined',
};

export const REVIEW_DECISION_LABEL: Record<ReviewDecision, string> = {
  accepted: 'Review accepted',
  needs_revision: 'Review asks for revision',
  disputed: 'Review disputed',
};

/** Turns an audit action such as `undertaking.created` into readable words. */
export function formatAction(action: string): string {
  const text = action.replaceAll('.', ' ').replaceAll('_', ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
