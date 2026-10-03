/**
 * What this floor is allowed to say.
 *
 * Two jobs, and both of them are honesty jobs rather than display jobs.
 *
 *   1. DERIVED FACTS, NOT STORED ONES. The tier a reader is standing at, the
 *      life state of a build, how far it is from closing — every one of those
 *      is math over the records this browser holds. It is computed in one place
 *      so that every card on the floor reads the same way, and so that no card
 *      can quietly disagree with its neighbour.
 *
 *   2. THE REFUSALS, QUOTED. Three controls on this floor cannot succeed on
 *      this site, and the reason is a fact about the code rather than about the
 *      reader: `submitClaim` takes the reviewer seat only at the hall tier,
 *      `attest` closes a build only from the hall or from a seated reviewer,
 *      and nothing on this site can reach the hall tier at all. Those reasons
 *      are quoted from lib/board.ts so a visitor meets the rule before pressing
 *      anything. The strings the functions themselves return are a separate
 *      matter: those are surfaced unedited, in the .err the action produces.
 */

import { SEED_BUILDS, type Build, type FloorTier } from "@/lib/benben";
import {
  STATE,
  attestationState,
  ratifyTerms,
  validAttestations,
  type LifeState,
  type Risk,
} from "@/lib/board";

/**
 * A record whose id is in SEED_BUILDS is a fixture, whether or not this
 * browser has since stored signals against it. Origin is a property of the
 * id, not of where the record happens to live — `addBuild` writes the merged
 * list, seeds included, so "is it in storage" would answer the wrong question.
 */
export function isFixture(b: Build): boolean {
  return SEED_BUILDS.some((s) => s.id === b.id);
}

export function originWord(b: Build): string {
  return isFixture(b) ? "day-one fixture" : "posted on this device";
}

/**
 * The tier, read from the only thing this site actually keeps.
 *
 * `tierOf` wants a member record carrying `paid` / `hallPaid` / `verified`.
 * lib/ledger.ts's `Member` has no such fields and no route on this site writes
 * any of them, so a faithful call could only ever return "visitor" — which
 * would close the builder seat for everyone, including the person who did the
 * work. What the site does keep is a roll record on this device, and holding
 * one is what the roll route asks for, so the tier is read from that.
 *
 * There is no third state here. "hall" is unreachable on this site, and both
 * the reviewer seat and every attestation hang off it — which is why those two
 * controls are rendered closed, with the reason, instead of as buttons that
 * fail.
 */
export function tierOnDevice(username: string | null): FloorTier {
  return username ? "member" : "visitor";
}

/** The life state as a mark plus its word — never colour alone. */
export function lifeMark(state: LifeState): string {
  return `${STATE[state].glyph} ${STATE[state].name}`;
}

export function riskOf(b: Build): Risk {
  return b.risk === "medium" || b.risk === "high" ? b.risk : "low";
}

/** Votes counted out of `votedBy`, which is this device's record and no one's else. */
export function deviceTally(b: Build): { up: number; down: number; voters: number } {
  let up = 0;
  let down = 0;
  for (const v of Object.values(b.votedBy ?? {})) {
    if (v.value === 1) up++;
    else if (v.value === -1) down++;
  }
  return { up, down, voters: up + down };
}

export type CloseReadout = {
  have: number;
  need: number;
  hall: number;
  hallNeed: number;
  ok: boolean;
  /** ratifyTerms' sentence: "closes at 2 attestations, 1 from the hall". */
  closeLabel: string;
  /** What is still standing between this build and `done`. */
  missing: string;
};

/**
 * How close a build is to closing, from the attestations that actually count
 * (`validAttestations` drops evidence-free, duplicate and self-signed hands)
 * against the bar its risk class sets. A build with no attestations is not
 * "one away from done"; it is at zero, and the gap is the whole quorum.
 */
export function closeReadout(b: Build): CloseReadout {
  const a = attestationState(b);
  const valid = validAttestations(b);
  const hall = valid.filter((x) => x.hall).length;
  const terms = ratifyTerms(riskOf(b));
  if (a.ok) {
    return {
      have: a.have,
      need: a.need,
      hall,
      hallNeed: terms.hall,
      ok: true,
      closeLabel: terms.closeLabel,
      missing: "nothing — deriveState reads this as proved",
    };
  }
  const gaps: string[] = [];
  if (a.have < a.need) {
    gaps.push(`${a.need - a.have} more attestation${a.need - a.have === 1 ? "" : "s"}`);
  }
  if (hall < terms.hall) {
    gaps.push(`${terms.hall - hall} from the hall tier`);
  }
  gaps.push("evidence text on each, and never from a hand that is building");
  return {
    have: a.have,
    need: a.need,
    hall,
    hallNeed: terms.hall,
    ok: false,
    closeLabel: terms.closeLabel,
    missing: gaps.join("; "),
  };
}

/**
 * Quoted from lib/board.ts, word for word, and deliberately not reworded into
 * something friendlier than the logic decided. These are what the reader is
 * told before pressing a control the site knows will refuse; the runtime
 * version of each message is rendered separately, exactly as returned.
 */
export const QUOTED = {
  unnamed: "Sign the roll — claims carry a name.",
  visitorSeat: "The builder seat takes a member. The roll is open at the door.",
  reviewerSeat: "The reviewer seat is a hall seat.",
  authorSeats: "The author or a hall member accepts the seat.",
  seatedBuilder: "Only a seated builder logs progress.",
  builderCannotClose: "The hand that built does not close the door.",
  closingIsHall: "Closing a build is a hall act — or a seated reviewer's.",
  voteLock: "Vote locked for 60 seconds. The floor is patient.",
  voteForgotten: "Gone. The floor moved on.",
  lineShort: "Say in one line why you take the seat.",
  lineLong: "One line, 80 max. The floor is text.",
} as const;