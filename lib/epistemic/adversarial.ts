/**
 * lib/epistemic/adversarial.ts — THE ADVERSARIAL LOOP AND HOSTILE REVIEW.
 *
 * ASIANCODER.MD: INTUIT → BOOTSTRAP → ATTACK → REPLACE → STEELMAN →
 * INTEGRATE → CONVERGE, capturing structured artifacts rather than hidden
 * reasoning. And ten reviewer types, each of which must be shown what it
 * found rather than asked whether the answer looks good.
 *
 * ── The reviewer-independence problem ────────────────────────────────
 *
 * Ten reviewers is the contract's number, and ten reviewers that all say
 * the same thing is a worse artefact than one reviewer: it manufactures
 * consensus. ASIANCODER.MD's own words are that CONSENSUS AMPLIFICATION
 * is a first-class failure, so shipping a reviewer panel that can produce
 * it would be incoherent.
 *
 * REVIEWER_PROFILES in taxonomy.ts declares each reviewer's declared blind
 * spot for exactly this reason, and `independenceWeight()` below uses it.
 * Two reviewers with the same blind spot are not two votes — they are one
 * argument made twice. So agreement across reviewers is reported as
 * agreement-within-a-blind-spot whenever that applies, which is a weaker
 * and more honest claim than agreement.
 *
 * ── CONVERGE is the stage that is allowed to report "nothing changed" ──
 *
 * ASIANCODER.MD calls CONVERGE a "material-change test". A loop that
 * always reports convergence is not measuring anything, so `runLoop()` can
 * complete with a synthesis identical to its bootstrap and that is
 * recorded as a result rather than treated as a failure to make progress.
 */

import type { Attack, Trace, TraceEvent } from "./model";
import { Attack as AttackSchema, StatementId } from "./model";
import {
  LOOP_STAGES,
  LOOP_STAGE_SPEC,
  REVIEWER_PROFILES,
  REVIEWER_TYPES,
  type GuardSeverity,
  type LoopStage,
  type ReviewerType,
} from "./taxonomy";

/* ═══════════════════════════════════════════════════════════════════
   STAGE ORDER
   ═══════════════════════════════════════════════════════════════════ */

export const LOOP_SEQUENCE: readonly LoopStage[] = LOOP_STAGES;

export function stageIndex(s: LoopStage): number {
  return LOOP_SEQUENCE.indexOf(s);
}

/**
 * What a stage may legitimately do next.
 *
 * CONVERGE may be followed by INTUIT, because a loop that converged and
 * then found the answer wrong should start again rather than being stuck.
 * That single edge is the whole difference between a cycle and a pipeline,
 * and without it a loop that converges is a dead end.
 */
export function nextStages(s: LoopStage): LoopStage[] {
  const i = stageIndex(s);
  if (i < 0) return [];
  const next = LOOP_SEQUENCE[i + 1];
  if (!next) return ["INTUIT"];
  return [next];
}

export function canTransition(from: LoopStage, to: LoopStage): boolean {
  return nextStages(from).includes(to);
}

/* ═══════════════════════════════════════════════════════════════════
   STAGE GATES
   ═══════════════════════════════════════════════════════════════════ */

export interface StageGate {
  satisfied: boolean;
  /** What is missing, in the contract's own terms. */
  unmet: string[];
  /** The rule that was not met, quoted from LOOP_STAGE_SPEC. */
  rule: string;
}

/**
 * Whether a stage may be left.
 *
 * ASIANCODER.MD's `mayProceedWhen` conditions are enforced, not decorated.
 * The one that matters most is ATTACK: "at least one reviewer has
 * produced at least one attack". Without it, ATTACK is a step a pipeline
 * can skip and INTEGRATE is reached having been attacked by nothing, which
 * is the shape of a system that has learned to look rigorous.
 */
export function gateStage(
  stage: LoopStage,
  ctx: {
    attacks: readonly Attack[];
    stagesEntered: readonly LoopStage[];
    droppedAttacks?: number;
    synthesisDroppedCount?: number;
  }
): StageGate {
  const rule = LOOP_STAGE_SPEC[stage].mayProceedWhen;
  const unmet: string[] = [];

  switch (stage) {
    case "ATTACK":
      if (ctx.attacks.length === 0) {
        unmet.push("No attack has been raised. ATTACK cannot be left empty.");
      }
      break;

    case "REPLACE": {
      const blocking = ctx.attacks.filter(
        (a) =>
          (a.severity === "CRITICAL" || a.severity === "MATERIAL") &&
          a.status === "OPEN"
      );
      if (blocking.length > 0) {
        unmet.push(
          `${blocking.length} MATERIAL or CRITICAL attack(s) are still OPEN. Every one needs a response before replacement.`
        );
      }
      break;
    }

    case "INTEGRATE": {
      /* PREMATURE_CONVERGENCE, enforced. */
      const branches = ctx.stagesEntered.filter((s) =>
        s === "INTUIT" || s === "BOOTSTRAP" || s === "ATTACK"
      );
      if (branches.length < 3) {
        unmet.push(
          `Synthesis began after ${branches.length} exploratory stage(s). ASIANCODER.MD requires genuinely different hypotheses BEFORE synthesis; generate branches first.`
        );
      }
      if (ctx.synthesisDroppedCount === undefined) {
        unmet.push("No record of what integration dropped. A synthesis with no stated losses is not inspectable.");
      }
      break;
    }

    case "CONVERGE":
      if (ctx.droppedAttacks === undefined) {
        unmet.push(
          "No material-change record. CONVERGE must state whether the loop changed anything."
        );
      }
      break;

    default:
      break;
  }

  return { satisfied: unmet.length === 0, unmet, rule };
}

/* ═══════════════════════════════════════════════════════════════════
   REVIEWER INDEPENDENCE
   ═══════════════════════════════════════════════════════════════════ */

export interface ReviewerAgreement {
  /** What the reviewers agreed on, if anything. */
  consensus: string | null;
  /** How many reviewers raised it. */
  count: number;
  /** The weight after blind-spot discounting. Never the raw count. */
  effectiveWeight: number;
  /** Set when the agreement is inside a shared blind spot. */
  caveat: string | null;
}

/**
 * Weight reviewer agreement by blind-spot independence.
 *
 * The rule: reviewers whose declared falsification modes OVERLAP are
 * discounted, because two reviewers reaching for the same kind of
 * objection are one argument, and counting them twice is precisely the
 * CONSENSUS AMPLIFICATION failure the system exists to catch.
 *
 * Discount is aggressive on purpose. Three reviewers sharing a blind spot
 * count as one. The alternative — reporting "3 of 10 reviewers" — is the
 * number a pipeline would print, and it is the number that makes a weak
 * argument look strong.
 */
export function reviewerAgreement(attacks: readonly Attack[]): ReviewerAgreement {
  const byTarget = new Map<string, Attack[]>();
  for (const a of attacks) {
    const list = byTarget.get(a.targetStatementId) ?? [];
    list.push(a);
    byTarget.set(a.targetStatementId, list);
  }

  let best: ReviewerAgreement = {
    consensus: null,
    count: 0,
    effectiveWeight: 0,
    caveat: null,
  };

  for (const [target, group] of byTarget) {
    const modes = group.map((a) => a.mode);
    const uniqueModes = new Set(modes);

    /* Independent to the extent the falsification modes differ. Two
       reviewers using different modes are genuinely looking from different
       places; three using the same mode are one place. */
    const effectiveWeight = Math.min(
      group.length,
      uniqueModes.size > 0 ? Math.max(1, uniqueModes.size) : 1
    );

    const sharedModes = REVIEWER_TYPES.filter((rt) =>
      group.some((a) => a.reviewerType === rt)
    )
      .flatMap((rt) => REVIEWER_PROFILES[rt].falsifiesVia)
      .filter((m, i, arr) => arr.indexOf(m) === i);

    let caveat: string | null = null;
    if (uniqueModes.size < group.length) {
      caveat = `${group.length} reviewers raised this using ${uniqueModes.size} distinct falsification mode(s). Treated as ${effectiveWeight} independent objection(s), not ${group.length}. The shared blind spot${group.length > uniqueModes.size ? "s" : ""} were: ${sharedModes.join(", ")}.`;
    }

    if (group.length > best.count || (group.length === best.count && effectiveWeight > best.effectiveWeight)) {
      best = {
        consensus: `${group.length} reviewer(s) attacked ${target}: ${group[0].body.slice(0, 120)}`,
        count: group.length,
        effectiveWeight,
        caveat,
      };
    }
  }

  return best;
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTRUCTING ATTACKS
   ═══════════════════════════════════════════════════════════════════ */

let seq = 0;

export function makeAttack(input: {
  reviewerType: ReviewerType;
  targetStatementId: string;
  targetQuote: string;
  body: string;
  severity: GuardSeverity;
  requiredChange: string;
  counterEvidence?: string;
}): Attack {
  seq += 1;
  return AttackSchema.parse({
    id: `atk-${seq}`,
    reviewerType: input.reviewerType,
    targetStatementId: input.targetStatementId,
    targetQuote: input.targetQuote,
    body: input.body,
    severity: input.severity,
    requiredChange: input.requiredChange,
    counterEvidence: input.counterEvidence,
    mode: REVIEWER_PROFILES[input.reviewerType].falsifiesVia[0],
    status: "OPEN",
    raisedAt: new Date().toISOString(),
  });
}

export function resolveAttack(
  attack: Attack,
  status: Attack["status"]
): Attack {
  return {
    ...attack,
    status,
    resolvedAt: status === "OPEN" ? undefined : new Date().toISOString(),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   THE LOOP RUNNER
   ═══════════════════════════════════════════════════════════════════ */

export interface LoopOutcome {
  converged: boolean;
  /** The material-change test. Null when it was not run. */
  changed: boolean | null;
  summary: string;
  /** Stages entered and, importantly, skipped. */
  entered: LoopStage[];
  skipped: LoopStage[];
  /** Gates that blocked at any point. */
  blockedAt: { stage: LoopStage; gate: StageGate }[];
}

/**
 * Drive the loop over a trace and report what happened.
 *
 * Reads the trace rather than mutating it — `appendEvent` is the only
 * writer — so this function can be run against any trace, including one
 * that was reconstructed from storage, and produce the same verdict.
 */
export function runLoop(trace: Trace): LoopOutcome {
  const entered = [
    ...new Set(
      trace.events
        .map((e) => e.stage)
        .filter((s): s is LoopStage => s !== undefined)
    ),
  ];
  const skipped = LOOP_SEQUENCE.filter((s) => !entered.includes(s));

  const attacks: Attack[] = [];
  for (const e of trace.events) {
    for (const ref of e.refs) {
      if (ref.startsWith("atk-")) {
        attacks.push({
          id: ref,
          reviewerType: "RED_TEAM",
          targetStatementId: StatementId.parse("reconstructed-from-trace"),
          targetQuote: "",
          body: e.summary,
          severity: "MATERIAL",
          requiredChange: "",
          mode: "FAILURE_REGIME",
          status: "ADDRESSED",
          raisedAt: e.at,
        });
      }
    }
  }

  const blockedAt: { stage: LoopStage; gate: StageGate }[] = [];
  for (const stage of entered) {
    const gate = gateStage(stage, {
      attacks,
      stagesEntered: entered,
    });
    if (!gate.satisfied) blockedAt.push({ stage, gate });
  }

  /* CONVERGE reports whether anything actually changed. Derived from
     whether the artifact at the end differs from the one at BOOTSTRAP. */
  const convergeEvents = trace.events.filter((e) => e.stage === "CONVERGE");
  const changed =
    convergeEvents.length === 0
      ? null
      : convergeEvents.some((e) => (e.metrics.changed === 1 || e.metrics.changedCount > 0));

  return {
    converged: entered.includes("CONVERGE"),
    changed,
    summary: summarise(entered, skipped, blockedAt, changed),
    entered,
    skipped,
    blockedAt,
  };
}

function summarise(
  entered: readonly LoopStage[],
  skipped: readonly LoopStage[],
  blockedAt: readonly { stage: LoopStage; gate: StageGate }[],
  changed: boolean | null
): string {
  const parts: string[] = [];

  if (skipped.length > 0) {
    parts.push(`skipped ${skipped.join(", ")}`);
  }
  if (blockedAt.length > 0) {
    parts.push(
      `blocked at ${blockedAt.map((b) => b.stage).join(", ")}`
    );
  }
  if (changed === false) {
    parts.push("the loop completed without materially changing the answer");
  }
  if (parts.length === 0) {
    return `all ${entered.length} stages entered and the answer changed`;
  }
  return parts.join("; ");
}

export type { TraceEvent };
