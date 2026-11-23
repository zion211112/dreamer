/**
 * Economic records — prerequisite for any future APTCOIN instrument.
 *
 * Position: APTCOIN should not be a cryptocurrency feature beside an agent or
 * profile card. It represents a carefully defined economic mechanism, and the
 * economic logic must exist before any coin is issued. The four concepts that
 * must remain distinct:
 *
 *   Contribution — what a person or institution actually did.
 *   Attestation — evidence that the contribution/outcome was recognised (SBT after Roll).
 *   Value attribution — how economic value is allocated among participants.
 *   Money or token — an instrument through which an obligation/entitlement is
 *   represented or transferred.
 *
 * An accepted contribution does not automatically mean payment is owed. An SBT
 * is not money. A Passport is not a credit rating.
 *
 * This module models the economic records around actual undertakings only. It
 * issues no token, holds no balances, and performs no transfers. It is a
 * record of what was agreed, what was contributed, what was accepted, and what
 * is owed or disputed — so that if an instrument is ever defined, it has a
 * real economic foundation.
 *
 * Pure domain layer: the Vue monolith's localStorage-backed store
 * (readStore/writeStore and the mutation helpers over it) was stripped. The
 * record contracts and the pure reconciliation arithmetic are kept.
 */

export type EconomicRecordStatus =
  | 'agreed'
  | 'invoiced'
  | 'paid'
  | 'partial'
  | 'withheld'
  | 'disputed'
  | 'reconciled';

export interface Rate {
  undertakingId: string;
  currency: string; // e.g. 'KES'
  amount: number;
  basis: 'fixed' | 'per_trip' | 'per_task' | 'daily' | 'milestone';
  terms: string; // human-readable payment trigger and conditions
  agreedBy: string;
  agreedAt: string;
}

export interface Contribution {
  id: string;
  undertakingId: string;
  personId: string;
  personName: string;
  role: 'anchor' | 'builder' | 'apprentice' | 'coordinator';
  description: string;
  amount?: number;
  currency?: string;
  contributedAt: string;
  contributedBy: string;
}

export interface FundingCommitment {
  id: string;
  undertakingId: string;
  institutionId: string;
  institutionName: string;
  amount: number;
  currency: string;
  purpose: string;
  committedBy: string;
  committedAt: string;
  deployed: boolean;
}

export interface AmountOwed {
  undertakingId: string;
  personId: string;
  personName: string;
  amount: number;
  currency: string;
  status: EconomicRecordStatus;
  dueAt: string | null;
  paidAt: string | null;
  withheldReason: string | null;
  disputeNote: string | null;
}

export interface Reconciliation {
  undertakingId: string;
  reconciledBy: string;
  reconciledAt: string;
  totalAgreed: number;
  totalPaid: number;
  totalWithheld: number;
  totalDisputed: number;
  note: string;
}

export interface EconomicUndertakingRecord {
  undertakingId: string;
  rates: Rate[];
  contributions: Contribution[];
  funding: FundingCommitment[];
  amountsOwed: AmountOwed[];
  reconciliation: Reconciliation | null;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Compute the reconciliation totals for an undertaking record. Pure — the
 * caller attaches the result to `record.reconciliation` when persisting.
 */
export function computeReconciliation(
  record: EconomicUndertakingRecord,
  input: { reconciledBy: string; note: string; reconciledAt?: string },
): Reconciliation {
  const totalAgreed = record.rates.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = record.amountsOwed
    .filter((a) => a.status === 'paid')
    .reduce((sum, a) => sum + a.amount, 0);
  const totalWithheld = record.amountsOwed
    .filter((a) => a.status === 'withheld')
    .reduce((sum, a) => sum + a.amount, 0);
  const totalDisputed = record.amountsOwed
    .filter((a) => a.status === 'disputed')
    .reduce((sum, a) => sum + a.amount, 0);

  return {
    undertakingId: record.undertakingId,
    reconciledBy: input.reconciledBy,
    reconciledAt: input.reconciledAt ?? new Date().toISOString(),
    totalAgreed,
    totalPaid,
    totalWithheld,
    totalDisputed,
    note: input.note,
  };
}

/** Create a fresh, empty economic undertaking record for an undertaking. */
export function createEconomicUndertakingRecord(undertakingId: string): EconomicUndertakingRecord {
  return {
    undertakingId,
    rates: [],
    contributions: [],
    funding: [],
    amountsOwed: [],
    reconciliation: null,
  };
}
