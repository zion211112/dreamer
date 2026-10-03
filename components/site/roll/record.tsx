import type { CrucibleQ, Member } from "@/lib/ledger";

/**
 * The shape this route writes, and the two pieces of arithmetic it owns.
 *
 * lib/ledger.ts owns the seal, the tier and the storage; it has nowhere to
 * keep a crucible reading beside a record, so the reading rides on the
 * record as one extra field and is named here instead of being smeared
 * through four components.
 *
 * The rules the shape obeys:
 *
 *   A record is written once, in this browser, by the person using it.
 *   A reading is derived — it is recomputed from answers every time an
 *     answer changes, and it is never promoted to a stored status.
 *   Nothing here is transmitted. There is no server to transmit it to.
 */

export type CrucibleResult = {
  /** Correct answers, out of CRUCIBLE_QS.length. */
  score: number;
  tier: string;
  pass: boolean;
  retryDays: number;
  /** Chosen option index per question, in CRUCIBLE_QS order. -1 is blank. */
  answers: number[];
  takenAt: number;
};

export type RollRecord = Member & { crucible: CrucibleResult | null };

export type SignUpInput = {
  username: string;
  name: string;
  occupation: string;
  location: string;
  skills: string[];
};

/** A record id. Local, minted here because the ledger mints none. */
export function makeRecordId(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RL-${Date.now().toString(36).toUpperCase().slice(-6)}-${rand}`;
}

export function blankAnswers(count: number): number[] {
  return Array.from({ length: count }, () => -1);
}

export function answeredCount(answers: number[]): number {
  return answers.reduce((n, a) => n + (a >= 0 ? 1 : 0), 0);
}

export function scoreCrucible(qs: CrucibleQ[], answers: number[]): number {
  return qs.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
}

/**
 * A record read back off this device is not trusted to have the shape it
 * was written with — storage is shared with older surfaces of the floor —
 * so every field is re-stated rather than assumed.
 */
export function asRollRecord(raw: Member): RollRecord {
  const m = raw as Member & { crucible?: CrucibleResult | null };
  return {
    ...m,
    id: m.id ?? "",
    name: m.name ?? "",
    username: m.username ?? "",
    occupation: m.occupation ?? "",
    location: m.location ?? "",
    skills: Array.isArray(m.skills) ? m.skills : [],
    verified: Boolean(m.verified),
    hash: m.hash ?? "",
    crucible: m.crucible ?? null
  };
}