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
 *   Money or token — an instrument through which an obligation/entitlement is represented or transferred.
 *
 * An accepted contribution does not automatically mean payment is owed. An SBT
 * is not money. A Passport is not a credit rating.
 *
 * This service models the economic records around actual undertakings only. It
 * issues no token, holds no balances, and performs no transfers. It is a record
 * of what was agreed, what was contributed, what was accepted, and what is owed
 * or disputed — so that if an instrument is ever defined, it has a real
 * economic foundation.
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

const STORAGE_KEY = 'aptlabs:economic-records:v1';

function readStore(): EconomicUndertakingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeStore(records: EconomicUndertakingRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    throw new Error('Economic records could not be saved.');
  }
}

function findRecord(undertakingId: string): EconomicUndertakingRecord | undefined {
  return readStore().find((r) => r.undertakingId === undertakingId);
}

export function readEconomicRecord(undertakingId: string): EconomicUndertakingRecord | undefined {
  return findRecord(undertakingId);
}

export function setRate(input: Rate): EconomicUndertakingRecord {
  const records = readStore();
  const existing = findRecord(input.undertakingId);
  const rate = { ...input };
  if (existing) {
    existing.rates = existing.rates.map((r) =>
      r.undertakingId === input.undertakingId && r.currency === input.currency ? rate : r,
    );
    writeStore(records);
    return existing;
  }
  const created: EconomicUndertakingRecord = {
    undertakingId: input.undertakingId,
    rates: [rate],
    contributions: [],
    funding: [],
    amountsOwed: [],
    reconciliation: null,
  };
  writeStore([created, ...readStore()]);
  return created;
}

export function addContribution(input: Omit<Contribution, 'id'>): EconomicUndertakingRecord {
  const records = readStore();
  const existing = findRecord(input.undertakingId);
  const contribution: Contribution = { ...input, id: `contrib-${crypto.randomUUID()}` };
  if (existing) {
    existing.contributions = [...existing.contributions, contribution];
    writeStore(records);
    return existing;
  }
  const created: EconomicUndertakingRecord = {
    undertakingId: input.undertakingId,
    rates: [],
    contributions: [contribution],
    funding: [],
    amountsOwed: [],
    reconciliation: null,
  };
  writeStore([created, ...readStore()]);
  return created;
}

export function addFundingCommitment(input: Omit<FundingCommitment, 'id'>): EconomicUndertakingRecord {
  const records = readStore();
  const existing = findRecord(input.undertakingId);
  const funding: FundingCommitment = { ...input, id: `funding-${crypto.randomUUID()}` };
  if (existing) {
    existing.funding = [...existing.funding, funding];
    writeStore(records);
    return existing;
  }
  const created: EconomicUndertakingRecord = {
    undertakingId: input.undertakingId,
    rates: [],
    contributions: [],
    funding: [funding],
    amountsOwed: [],
    reconciliation: null,
  };
  writeStore([created, ...readStore()]);
  return created;
}

export function recordAmountOwed(input: Omit<AmountOwed, 'undertakingId'> & { undertakingId: string }): EconomicUndertakingRecord {
  const records = readStore();
  const existing = findRecord(input.undertakingId);
  const amountOwed: AmountOwed = { ...input };
  if (existing) {
    existing.amountsOwed = existing.amountsOwed.map((a) =>
      a.personId === input.personId && a.undertakingId === input.undertakingId ? amountOwed : a,
    );
    writeStore(records);
    return existing;
  }
  const created: EconomicUndertakingRecord = {
    undertakingId: input.undertakingId,
    rates: [],
    contributions: [],
    funding: [],
    amountsOwed: [amountOwed],
    reconciliation: null,
  };
  writeStore([created, ...readStore()]);
  return created;
}

export function reconcileUndertaking(input: {
  undertakingId: string;
  reconciledBy: string;
  note: string;
}): EconomicUndertakingRecord | undefined {
  const records = readStore();
  const existing = findRecord(input.undertakingId);
  if (!existing) return undefined;
  const totalAgreed = existing.rates.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = existing.amountsOwed
    .filter((a) => a.status === 'paid')
    .reduce((sum, a) => sum + a.amount, 0);
  const totalWithheld = existing.amountsOwed
    .filter((a) => a.status === 'withheld')
    .reduce((sum, a) => sum + a.amount, 0);
  const totalDisputed = existing.amountsOwed
    .filter((a) => a.status === 'disputed')
    .reduce((sum, a) => sum + a.amount, 0);
  const reconciliation: Reconciliation = {
    undertakingId: input.undertakingId,
    reconciledBy: input.reconciledBy,
    reconciledAt: new Date().toISOString(),
    totalAgreed,
    totalPaid,
    totalWithheld,
    totalDisputed,
    note: input.note,
  };
  existing.reconciliation = reconciliation;
  writeStore(records);
  return existing;
}

export function listEconomicRecords(): EconomicUndertakingRecord[] {
  return readStore();
}