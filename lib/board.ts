// THE BOARD — the commitment machine of the BenBen floor.
//
// State is never written; signals are. Votes, claims, progress and
// attestations are appended; the life-state is derived from them. The record
// is append-only; the state is math. That is what makes the board portable:
// these functions move, unchanged, to a shared store when one arrives.
//
// Design points, deliberately few:
//  · Entry is open, exit is gated. A builder claim seats a member; a reviewer
//    seat is hall; an attestation must come from a hand that did not build.
//    No reputation gate at the door (the cold-start trap), hard gate at the
//    door out (the "no outsourcing" rule, enforced where it matters).
//  · No auto-abandonment. Stillness is a rest, not a death: 90 days with no
//    signal and no seated builder, and the floor lets the build rest.
//  · Risk is an axis of the build, not of the community: the bar, the window
//    and the closing quorum move with the risk class.
//  · Only counts are shown while the window is open. A live percentage is
//    gamed by abstention; a count cannot be moved by not showing up.

import type {
  Build,
  FloorTier,
  BoardRole,
  BoardClaim,
  BoardProgress,
  BoardAttest
} from "./benben";

export type LifeState =
  | "proposed"
  | "ratified"
  | "claimed"
  | "active"
  | "done"
  | "parked"
  | "lapsed";

export type Risk = "low" | "medium" | "high";
export const RISKS: Risk[] = ["low", "medium", "high"];

// Controlled slug yard. Free-text skills fragment reputation; slugs do not.
export const SKILLS = [
  "civil", "logistics", "funds", "llm", "swahili", "law",
  "security", "ops", "video", "research"
] as const;
export type Skill = (typeof SKILLS)[number];

export function parseSkills(raw: string): { skills: Skill[]; err: string | null } {
  const out: Skill[] = [];
  for (const token of raw.split(",")) {
    const s = token.trim().toLowerCase().replace(/\s+/g, "-");
    if (!s) continue;
    if (!(SKILLS as readonly string[]).includes(s))
      return { skills: out, err: `“${s}” is not on the yard list. The yard: ${SKILLS.join(", ")}.` };
    if (!out.includes(s as Skill)) out.push(s as Skill);
  }
  return { skills: out, err: null };
}

const H = 3600000;

// Ratification per risk class. High work moves at its own cadence: a longer
// window, a taller bar, and a close that a hall hand must join.
export const RATIFY: Record<
  Risk,
  { minVoters: number; upShare: number; windowH: number; quorum: number; hallQuorum: number }
> = {
  low: { minVoters: 2, upShare: 0.5, windowH: 72, quorum: 1, hallQuorum: 0 },
  medium: { minVoters: 3, upShare: 0.6, windowH: 72, quorum: 2, hallQuorum: 0 },
  high: { minVoters: 5, upShare: 0.7, windowH: 96, quorum: 2, hallQuorum: 1 }
};
export const STALE_MS = 90 * 24 * H;

function riskOf(b: Build): Risk {
  return b.risk === "medium" || b.risk === "high" ? b.risk : "low";
}

export function upDown(b: Build): { up: number; down: number; voters: number } {
  let up = 0;
  let down = 0;
  for (const v of Object.values(b.votedBy ?? {})) {
    if (v.value === 1) up++;
    else if (v.value === -1) down++;
  }
  return { up, down, voters: up + down };
}

// Closed form for "how many more upvotes". The only number the floor shows
// while the window is open.
export function upNeeded(b: Build): number {
  const r = RATIFY[riskOf(b)];
  const { up, down } = upDown(b);
  const shareGap = Math.ceil(r.upShare * (up + down) - up);
  const headGap = Math.max(0, r.minVoters - (up + down));
  return Math.max(0, shareGap, headGap);
}

export function windowClosesAt(b: Build): number {
  return b.createdTs + RATIFY[riskOf(b)].windowH * H;
}

// Ratification does not wait out the window: when the bar is met, the build
// is ratified at once. The window is a deadline, not a delay.
export function ratifyMet(b: Build): boolean {
  return upNeeded(b) === 0;
}

export function activeBuilders(b: Build): string[] {
  const s = new Set<string>();
  for (const c of b.claims ?? []) if (c.role === "builder" && c.status === "active") s.add(c.by);
  return [...s];
}

export function openClaims(b: Build): BoardClaim[] {
  return (b.claims ?? []).filter((c) => c.status !== "withdrawn");
}

// An attestation counts once, per hand, never from a building hand, and only
// with evidence attached.
export function validAttestations(b: Build): BoardAttest[] {
  const builders = activeBuilders(b);
  const seen = new Set<string>();
  const out: BoardAttest[] = [];
  for (const a of b.attestations ?? []) {
    if (!a.evidence.trim()) continue;
    if (builders.some((x) => x.toLowerCase() === a.by.toLowerCase())) continue;
    const key = a.by.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

export function attestationState(b: Build): { have: number; need: number; ok: boolean } {
  const r = RATIFY[riskOf(b)];
  const valid = validAttestations(b);
  const hall = valid.filter((a) => a.hall).length;
  return { have: valid.length, need: r.quorum, ok: valid.length >= r.quorum && hall >= r.hallQuorum };
}

export function deriveState(b: Build, now: number): LifeState {
  if (b.parkedAt) return "parked";
  if (attestationState(b).ok) return "done";
  // Stillness: nothing has moved in 90 days and no hand is raised, seated or
  // pending. A pending claim is a raised hand — it counts as motion.
  const claims = openClaims(b);
  const progress = b.progress ?? [];
  if (progress.length === 0 && activeBuilders(b).length === 0) {
    const last = Math.max(b.createdTs, ...claims.map((c) => c.ts), ...progress.map((p) => p.ts));
    if (now - last > STALE_MS) return "parked";
  }
  if (progress.some((p) => activeBuilders(b).some((x) => x.toLowerCase() === p.by.toLowerCase())))
    return "active";
  if (activeBuilders(b).length > 0) return "claimed";
  if (ratifyMet(b)) return "ratified";
  if (now >= windowClosesAt(b)) return "lapsed";
  return "proposed";
}

// Monogram, name, tone and board order — the display layer of the machine.
export const STATE: Record<LifeState, { glyph: string; name: string; tone: string; rank: number }> = {
  proposed: { glyph: "○", name: "open", tone: "text-dim", rank: 0 },
  ratified: { glyph: "◐", name: "ratified", tone: "text-amber", rank: 1 },
  claimed: { glyph: "▣", name: "in hand", tone: "text-teal", rank: 2 },
  active: { glyph: "◉", name: "in motion", tone: "text-ivory", rank: 3 },
  done: { glyph: "∎", name: "closed", tone: "text-teal", rank: 4 },
  parked: { glyph: "‖", name: "parked", tone: "text-dim", rank: 5 },
  lapsed: { glyph: "⊘", name: "lapsed", tone: "text-dim", rank: 6 }
};

export function boardStatus(b: Build, now: number): string {
  const s = deriveState(b, now);
  const r = RATIFY[riskOf(b)];
  switch (s) {
    case "proposed": {
      const { up } = upDown(b);
      const need = upNeeded(b);
      const closeH = Math.max(0, Math.ceil((windowClosesAt(b) - now) / H));
      return `${up} of ${r.minVoters} votes · ${need} more up · window ${closeH}h`;
    }
    case "ratified":
      return "ratified — open for claims";
    case "claimed":
      return `${activeBuilders(b).length} builder seated · awaiting first progress`;
    case "active": {
      const a = attestationState(b);
      const hall = validAttestations(b).filter((x) => x.hall).length;
      return `in motion · ${a.have} of ${a.need} attestations${r.hallQuorum ? ` (${hall} hall)` : ""} to close`;
    }
    case "done":
      return `closed ∎ · ${validAttestations(b).length} attestation${validAttestations(b).length === 1 ? "" : "s"}`;
    case "parked":
      return b.parkedAt ? `parked by @${b.parkedBy ?? "the floor"}` : "stillness — the floor let it rest";
    case "lapsed":
      return "window closed unmet · to change this, fork it";
  }
}

// Open states lead, by rank; within a rank, more votes first, then newer.
export function boardOrder(list: Build[], now: number): Build[] {
  return [...list].sort((x, y) => {
    const sx = STATE[deriveState(x, now)].rank;
    const sy = STATE[deriveState(y, now)].rank;
    if (sx !== sy) return sx - sy;
    const vx = upDown(x).up;
    const vy = upDown(y).up;
    if (vx !== vy) return vy - vx;
    return y.createdTs - x.createdTs;
  });
}

// ---- mutations: every one pure, every signal appended ----

export type OpResult = { b: Build; err: string | null };
const fail = (b: Build, err: string): OpResult => ({ b, err });

export function submitClaim(
  b: Build,
  by: string,
  tier: FloorTier,
  role: BoardRole,
  reason: string,
  now: number
): OpResult {
  if (!by) return fail(b, "Sign the roll — claims carry a name.");
  const who = by.toLowerCase();
  if ((b.claims ?? []).some((c) => c.by.toLowerCase() === who && c.status !== "withdrawn" && c.role === role))
    return fail(b, "You already hold that seat.");
  if (role === "builder" && tier === "visitor")
    return fail(b, "The builder seat takes a member. The roll is open at the door.");
  if (role === "reviewer" && tier !== "hall")
    return fail(b, "The reviewer seat is a hall seat.");
  const r = reason.trim();
  if (r.length < 3) return fail(b, "Say in one line why you take the seat.");
  if (r.length > 80) return fail(b, "One line, 80 max. The floor is text.");
  const claim: BoardClaim = { by, role, reason: r, status: "pending", ts: now };
  return { b: { ...b, claims: [...(b.claims ?? []), claim] }, err: null };
}

export function acceptClaim(
  b: Build,
  by: string,
  target: string,
  role: BoardRole,
  tier: FloorTier,
  now: number
): OpResult {
  const claim = (b.claims ?? []).find((c) => c.by === target && c.role === role && c.status === "pending");
  if (!claim) return fail(b, "No open claim to accept.");
  if (by !== b.by && tier !== "hall")
    return fail(b, "The author or a hall member accepts the seat.");
  const settled: BoardClaim = { ...claim, status: "active" };
  return {
    b: {
      ...b,
      claims: (b.claims ?? []).map((c) =>
        c.by === claim.by && c.role === claim.role && c.ts === claim.ts ? settled : c
      )
    },
    err: null
  };
}

export function withdrawClaim(b: Build, by: string, target: string, role: BoardRole, now: number): OpResult {
  if (!by || by.toLowerCase() !== target.toLowerCase())
    return fail(b, "Withdraw your own seat.");
  const claim = (b.claims ?? []).find((c) => c.by === target && c.role === role && c.status !== "withdrawn");
  if (!claim) return fail(b, "No such seat to withdraw.");
  const gone: BoardClaim = { ...claim, status: "withdrawn" };
  return {
    b: {
      ...b,
      claims: (b.claims ?? []).map((c) =>
        c.by === claim.by && c.role === claim.role && c.ts === claim.ts ? gone : c
      )
    },
    err: null
  };
}

export function logProgress(b: Build, by: string, text: string, now: number): OpResult {
  if (!by) return fail(b, "Progress carries a name.");
  if (!activeBuilders(b).some((x) => x.toLowerCase() === by.toLowerCase()))
    return fail(b, "Only a seated builder logs progress.");
  const t = text.trim();
  if (t.length < 3) return fail(b, "Progress is one real line.");
  if (t.length > 200) return fail(b, "200 max. One line at a time.");
  const entry: BoardProgress = { by, text: t, ts: now };
  return { b: { ...b, progress: [...(b.progress ?? []), entry] }, err: null };
}

export function attest(b: Build, by: string, evidence: string, tier: FloorTier, now: number): OpResult {
  if (!by) return fail(b, "An attestation carries a name.");
  const who = by.toLowerCase();
  if (activeBuilders(b).some((x) => x.toLowerCase() === who))
    return fail(b, "The hand that built does not close the door.");
  if ((b.attestations ?? []).some((a) => a.by.toLowerCase() === who))
    return fail(b, "You have already attested this build.");
  const holdsReviewer = (b.claims ?? []).some(
    (c) => c.by.toLowerCase() === who && c.role === "reviewer" && c.status === "active"
  );
  if (tier !== "hall" && !holdsReviewer)
    return fail(b, "Closing a build is a hall act — or a seated reviewer's.");
  const r = evidence.trim();
  if (r.length < 3) return fail(b, "An attestation is proof, not a nod. One line.");
  if (r.length > 200) return fail(b, "200 max. Name the proof.");
  const entry: BoardAttest = { by, evidence: r, hall: tier === "hall", ts: now };
  return { b: { ...b, attestations: [...(b.attestations ?? []), entry] }, err: null };
}

export function park(b: Build, by: string, tier: FloorTier, now: number): OpResult {
  const s = deriveState(b, now);
  if (s === "done" || s === "lapsed") return fail(b, "Closed stays closed. Fork it if you disagree.");
  if (s === "parked") return fail(b, "It is already resting.");
  if (by !== b.by && tier !== "hall")
    return fail(b, "The author or a hall member lets it rest.");
  return { b: { ...b, parkedBy: by || null, parkedAt: now }, err: null };
}

// ---- lineage: the fork family. A fork records its parent as a flagged
// "Fork of <id>" comment; walk that to draw the tree. Pure, like the rest —
// it moves to the shared store unchanged. -----------------------------------

export function forkParentId(b: Build): string | null {
  for (const c of b.comments) {
    if (c.fork) {
      const m = (c.text || "").match(/Fork of (\S+)/);
      if (m) return m[1];
    }
  }
  return null;
}

export type Lineage = {
  // root-first: the oldest ancestor is ancestors[0], the parent is last.
  ancestors: Build[];
  // every build that forked from this one (newest signal wins the branch).
  children: Build[];
  hasFork: boolean;
};

export function lineageOf(b: Build, all: Build[], now: number): Lineage {
  const byId = new Map(all.map((x) => [x.id, x]));
  const ancestors: Build[] = [];
  let cur = b;
  for (let guard = 0; guard < 24; guard++) {
    const pid = forkParentId(cur);
    const parent = pid ? byId.get(pid) : undefined;
    if (!parent) break;
    ancestors.unshift(parent);
    cur = parent;
  }
  const children = all.filter((x) => x.id !== b.id && forkParentId(x) === b.id);
  return { ancestors, children, hasFork: ancestors.length > 0 || children.length > 0 };
}