/**
 * lib/epistemic/health.ts — THE INSTRUMENTS.
 *
 * Three readings, and one refusal.
 *
 *   FLUENCY / EPISTEMIC GAP   is a danger signal, not a quality score.
 *   THE HEALTH VECTOR          is nine axes and no aggregate.
 *   THE DIFFERENTIAL           is model-said against evidence against
 *                              verifiable against unknown.
 *
 * The refusal matters more than the three instruments. ASIANCODER.MD
 * forbids "a simplistic overall AI quality score", and the tempting
 * implementation is to compute nine axes and average them. That is not a
 * shortcut, it is the same error: an average is a claim that a deficit in
 * evidence and an excess in novelty are commensurable, and they are not.
 * An artifact with no evidence and a great deal of novelty is not half as
 * good as a well-evidenced average one — it is a different kind of thing,
 * and the number is what hides that. So there is no aggregate function in
 * this file and none should be added.
 *
 * ── On measuring fluency at all ──────────────────────────────────────
 *
 * Fluency is the one quantity here that is genuinely hard, because "this
 * reads well" is not a property of a string that can be extracted without
 * a model, and ASIANCODER.MD requires that we not fabricate APIs or
 * pretend to capabilities we do not have.
 *
 * So this file computes a PROXY and names it a proxy. The proxy is
 * deliberately shallow: sentence length distribution, lexical variety,
 * connective density, and the ratio of content words to hedges. It
 * measures the surface properties of polished prose and nothing else. It
 * cannot tell a good sentence from a confident-sounding wrong one, which
 * is exactly why the GAP between it and the evidence axes is the signal
 * that matters — a large gap means the prose is doing more work than the
 * evidence is, whether or not the prose is any good.
 *
 * A real implementation would swap this for a trained judge with a
 * documented rubric. The interface below is written so that substitution
 * changes one function and nothing else.
 */

import type { DiversityReading } from "./branches";
import type {
  Artifact,
  Evaluation,
  GuardRecord,
  MemoryItem,
  Statement,
} from "./model";
import { HEALTH_AXES, HEALTH_AXIS_RULES, type HealthAxis } from "./taxonomy";
import { deriveConfidence, statementConfidence } from "./confidence";

/* ═══════════════════════════════════════════════════════════════════
   FLUENCY — a declared proxy
   ═══════════════════════════════════════════════════════════════════ */

export interface FluencyReading {
  /** 0..1. A PROXY. See the module note. */
  value: number;
  /** What the proxy actually measured, so nobody reads it as judgement. */
  method: string;
  signals: { name: string; value: number; what: string }[];
}

/** Connectives that mark prose as organised rather than merely long. */
const CONNECTIVES = [
  "therefore", "however", "moreover", "consequently", "furthermore",
  "accordingly", "nevertheless", "in addition", "as a result",
  "by contrast", "in summary", "notably", "crucially", "significantly",
];

/** Hedges: the words that mark a writer as aware of their own uncertainty. */
const HEDGES = [
  "may", "might", "could", "possibly", "suggest", "appears", "likely",
  "uncertain", "unclear", "approximately", "roughly", "potentially",
  "seems", "indicates",
];

/**
 * The fluency proxy. Surface statistics only, and labelled as such.
 *
 * Deliberately does NOT attempt to judge whether the prose is good. A
 * fluency measure that scored quality would be doing the thing the whole
 * system opposes: producing a confident number about something it cannot
 * check.
 */
export function measureFluency(text: string): FluencyReading {
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z0-9'-]+/g) ?? [];
  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim().length > 0);
  const n = Math.max(1, words.length);

  const meanSentenceLength =
    sentences.length === 0 ? 0 : n / sentences.length;

  /* Type-token ratio, corrected for length so a long document does not
     score high purely by containing more distinct words. */
  const distinct = new Set(words).size;
  const lexicalVariety = Math.min(1, distinct / Math.sqrt(n) / 1.6);

  const connectives = CONNECTIVES.reduce(
    (acc, w) => acc + (lower.includes(w) ? 1 : 0),
    0
  );
  const connectiveDensity = Math.min(1, connectives / Math.max(1, sentences.length / 4));

  const hedges = HEDGES.reduce(
    (acc, w) => acc + (lower.split(w).length - 1),
    0
  );
  const hedgeRate = Math.min(1, hedges / Math.max(1, n / 60));

  const signals = [
    {
      name: "sentence length",
      value: Math.min(1, meanSentenceLength / 28),
      what: `mean ${meanSentenceLength.toFixed(1)} words per sentence`,
    },
    { name: "lexical variety", value: lexicalVariety, what: `${distinct} distinct of ${n} words` },
    {
      name: "connective density",
      value: connectiveDensity,
      what: `${connectives} connectives across ${sentences.length} sentences`,
    },
    { name: "hedge rate", value: hedgeRate, what: `${hedges} hedges` },
  ];

  /* Weighted toward lexical variety and connectives, because those are the
     properties that distinguish written prose from an enumerated list. A
     short technical sentence can be excellent and score low; the weight
     matters less than the fact that this is labelled a proxy everywhere
     it surfaces. */
  const value =
    signals[1].value * 0.35 +
    signals[2].value * 0.3 +
    signals[0].value * 0.2 +
    signals[3].value * 0.15;

  return {
    value: clamp01(value),
    method:
      "surface proxy: sentence length, type-token ratio, connective density, hedge rate. Not a judgement of quality and not a model-based score.",
    signals,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   THE GAP — fluency against support
   ═══════════════════════════════════════════════════════════════════ */

export interface GapReading {
  fluency: number;
  /** The best available measure of epistemic support, 0..1. */
  support: number;
  /** fluency minus support. Positive is the danger case. */
  gap: number;
  /** The contract's own name for the condition. */
  status: "FLUENCY_BELOW_SUPPORT" | "BALANCED" | "FLUENCY_ABOVE_SUPPORT";
  /** Why support has the value it has, axis by axis. Never a bare number. */
  supportBasis: { axis: HealthAxis; value: number; why: string }[];
}

export interface GapInput {
  text: string;
  statements: readonly Statement[];
  guards: readonly GuardRecord[];
}

/**
 * The FLUENCY / EPISTEMIC GAP.
 *
 * Support here is NOT the average of the health axes. It is the two axes
 * that a gap in prose most directly outruns: EVIDENCE and CALIBRATION.
 * Averaging nine axes in would dilute the signal this instrument exists to
 * raise, and would reintroduce exactly the commensurability the module
 * note refuses.
 */
export function measureGap(input: GapInput): GapReading {
  const fluency = measureFluency(input.text).value;

  const evidence = evidenceSupport(input.statements);
  const calibration = calibrationSupport(input.statements, input.guards);

  const support = clamp01(Math.min(evidence, calibration));

  const gap = fluency - support;
  const status =
    gap > 0.18
      ? "FLUENCY_ABOVE_SUPPORT"
      : gap < -0.18
        ? "FLUENCY_BELOW_SUPPORT"
        : "BALANCED";

  return {
    fluency,
    support,
    gap,
    status,
    supportBasis: [
      {
        axis: "EVIDENCE",
        value: evidence,
        why: `${input.statements.length} statement(s); support is the mean derived confidence of the consequential ones.`,
      },
      {
        axis: "CALIBRATION",
        value: calibration,
        why: `${input.guards.length} guard record(s); inflated confidence and suppressed unknowns pull this down.`,
      },
    ],
  };
}

function evidenceSupport(statements: readonly Statement[]): number {
  const consequential = statements.filter((s) =>
    ["FACT", "OBSERVATION", "INFERENCE", "SOURCE_CLAIM"].includes(s.category)
  );
  if (consequential.length === 0) return 0;

  const scores = consequential.map((s) => statementConfidence(s).score);
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function calibrationSupport(
  statements: readonly Statement[],
  guards: readonly GuardRecord[]
): number {
  if (statements.length === 0) return 0;

  /* Confidence inflation and unknown suppression are the two calibration
     failures that make a document read as more certain than it is, so they
     are weighted hardest and capped so one class cannot zero the axis. */
  const inflation = guards.filter((g) => g.event === "CONFIDENCE_INFLATION").length;
  const suppression = guards.filter((g) => g.event === "UNKNOWN_SUPPRESSION").length;
  const critical = guards.filter((g) => g.severity === "CRITICAL").length;

  let calibration = 1;
  calibration -= Math.min(0.35, inflation * 0.12);
  calibration -= Math.min(0.35, suppression * 0.12);
  calibration -= Math.min(0.3, critical * 0.1);

  /* An UNKNOWN terminal is not a calibration failure. It is the correct
     output, so it is excluded from the penalty rather than counted as
     certainty — otherwise the system would reward documents that pretend. */
  const unknowns = statements.filter((s) => s.category === "UNKNOWN").length;
  calibration += Math.min(0.15, unknowns * 0.05);

  return clamp01(calibration);
}

/* ═══════════════════════════════════════════════════════════════════
   THE HEALTH VECTOR — nine axes, no aggregate
   ═══════════════════════════════════════════════════════════════════ */

export interface AxisReading {
  axis: HealthAxis;
  /** 0..1, or null when there is not enough to say. */
  value: number | null;
  /** Required. An axis with a number and no basis is the thing forbidden. */
  basis: string[];
  /** Always present, even when the value is null. */
  question: string;
  /** What would raise it. This is what makes the axis actionable. */
  raise: string;
}

/**
 * Compute the vector.
 *
 * An axis that cannot be computed returns `null` rather than a default.
 * That is the whole design of this function: a health vector that fills
 * every axis with a number is indistinguishable from one that measured
 * something, and ASIANCODER.MD forbids "Quality: 92%" without explanation.
 * An honest null is more useful than a fabricated zero, because it says
 * where the system has not looked.
 */
export function healthVector(input: {
  statements: readonly Statement[];
  guards: readonly GuardRecord[];
  branches?: number;
  protectedBranches?: number;
  traceEventCount?: number;
  memory?: readonly MemoryItem[];
  humanVerdicts?: number;
  /**
   * The DIVERSITY reading, measured. Required for that axis to be anything
   * but null — the axis must come from measureDiversity(), because the
   * branch count is not a diversity measurement.
   */
  diversity?: DiversityReading;
}): AxisReading[] {
  const { statements, guards } = input;
  const diversityScore = input.diversity?.score;
  const diversityFinding = input.diversity?.finding;

  const consequential = statements.filter((s) =>
    ["FACT", "OBSERVATION", "INFERENCE", "SOURCE_CLAIM"].includes(s.category)
  );
  const sourced = statements.filter((s) => s.kind === "CLAIM" && s.sourceIds.length > 0);
  const promotions = statements.flatMap((s) => s.transitions.filter((t) => t.promotion));
  const causal = statements.filter((s) =>
    guards.some((g) => g.event === "CAUSALITY_OVERREACH" && g.statementId === s.id)
  );

  return [
    {
      axis: "EVIDENCE",
      value:
        consequential.length === 0
          ? null
          : clamp01(
              sourced.length / Math.max(1, consequential.length) * 0.6 +
                (evidenceSupport(statements) * 0.4)
            ),
      basis: [
        `${sourced.length} of ${consequential.length} consequential statement(s) carry at least one source`,
        `mean derived confidence ${evidenceSupport(statements).toFixed(2)}`,
      ],
      question: HEALTH_AXIS_RULES.EVIDENCE.question,
      raise: "Attach an evidence path, or lower the category to match what the evidence supports.",
    },
    {
      axis: "CALIBRATION",
      value: statements.length === 0 ? null : calibrationSupport(statements, guards),
      basis: [
        `${guards.filter((g) => g.event === "CONFIDENCE_INFLATION").length} confidence-inflation finding(s)`,
        `${guards.filter((g) => g.event === "UNKNOWN_SUPPRESSION").length} unknown-suppression finding(s)`,
        `${statements.filter((s) => s.category === "UNKNOWN").length} statement(s) correctly terminated at UNKNOWN`,
      ],
      question: HEALTH_AXIS_RULES.CALIBRATION.question,
      raise: "Stop stating more certainty than the factors justify. Hedging everything is not the fix.",
    },
    {
      axis: "CATEGORY_INTEGRITY",
      value:
        statements.length === 0
          ? null
          : clamp01(1 - promotions.length / Math.max(1, statements.length)),
      basis: [
        `${promotions.length} recorded promotion(s) across ${statements.length} statement(s)`,
        `${promotions.filter((p) => p.guard).length} of them raised a guard`,
      ],
      question: HEALTH_AXIS_RULES.CATEGORY_INTEGRITY.question,
      raise: "Record the transition with its reason, or restore the prior category.",
    },
    {
      axis: "CAUSAL_INTEGRITY",
      value:
        statements.length === 0
          ? null
          : clamp01(1 - causal.length / Math.max(1, statements.length)),
      basis: [
        `${causal.length} statement(s) asserting cause without a supporting evidence path`,
      ],
      question: HEALTH_AXIS_RULES.CAUSAL_INTEGRITY.question,
      raise: "Restate as correlation, or find and record the mechanism.",
    },
    {
      axis: "ADVERSARIAL_ROBUSTNESS",
      value: null,
      basis: ["No attacks recorded for this artifact."],
      question: HEALTH_AXIS_RULES.ADVERSARIAL_ROBUSTNESS.question,
      raise: "Run the reviewers. This axis is null until something has tried to break the work.",
    },
    {
      axis: "NOVELTY",
      value: null,
      basis: ["Not measured. Novelty requires comparison against what already exists."],
      question: HEALTH_AXIS_RULES.NOVELTY.question,
      raise: "Generate a branch that differs in mechanism and compare it to the base.",
    },
    {
      axis: "DIVERSITY",
      /* Measured by measureDiversity, NOT by counting branches.
         The first version was `1 / max(2, branchCount)`, which is not a
         diversity measure at all — it says five branches score 0.20 and two
         identical branches score 0.50, so generating MORE distinct
         branches made the axis read WORSE. It also ignored
         measureDiversity(), which already computes exactly the right thing
         including collapse detection and per-strategy compliance. */
      value: (input.branches ?? 0) >= 2 ? (diversityScore ?? null) : null,
      basis:
        (input.branches ?? 0) >= 2
          ? [
              diversityScore === undefined
                ? "diversity not measured"
                : `mean mechanism distance ${diversityScore.toFixed(2)}`,
              diversityFinding ?? "diversity not measured",
            ]
          : ["Fewer than two branches, so there is nothing to be diverse from."],
      question: HEALTH_AXIS_RULES.DIVERSITY.question,
      raise: "Generate genuinely different branches, not lexical variants of one.",
    },
    {
      axis: "TRACEABILITY",
      value:
        input.traceEventCount === undefined
          ? null
          : clamp01(Math.min(1, input.traceEventCount / 12)),
      basis: [
        input.traceEventCount === undefined
          ? "No trace supplied."
          : `${input.traceEventCount} event(s) in the trace`,
      ],
      question: HEALTH_AXIS_RULES.TRACEABILITY.question,
      raise: "Record the derivation. Logging more is not the same as a derivation path.",
    },
    {
      axis: "HUMAN_OWNERSHIP",
      value:
        input.humanVerdicts === undefined
          ? null
          : clamp01(Math.min(1, input.humanVerdicts / 3)),
      basis: [
        input.humanVerdicts === undefined
          ? "No human decisions recorded."
          : `${input.humanVerdicts} human verdict(s)`,
        `${input.protectedBranches ?? 0} branch(es) protected from optimisation`,
      ],
      question: HEALTH_AXIS_RULES.HUMAN_OWNERSHIP.question,
      raise: "Record a human decision over the values and direction. Clicking approve is not ownership.",
    },
  ];
}

/**
 * There is deliberately no `overallHealth()`.
 *
 * ASIANCODER.MD: "Do NOT create a simplistic overall 'AI quality score.'"
 * An average of these nine axes is a number that will be quoted in a
 * status update, and once quoted it becomes the thing people look at. The
 * axes disagree — high novelty with no evidence is the interesting case —
 * and a single figure resolves that disagreement by hiding it. If an
 * aggregate is ever genuinely needed, it belongs in a specific report with
 * its weighting printed beside it, never in the vector itself.
 */

/* ═══════════════════════════════════════════════════════════════════
   THE EPISTEMIC DIFFERENTIAL
   ═══════════════════════════════════════════════════════════════════ */

export type DifferentialLane = "MODEL_SAID" | "EVIDENCE_SUPPORTS" | "VERIFIABLE" | "UNKNOWN";

export interface DifferentialRow {
  lane: DifferentialLane;
  text: string;
  /** The statement ids backing this lane. */
  refs: string[];
}

export interface Differential {
  rows: DifferentialRow[];
  /** The lines that exist in one lane but not another — the whole point. */
  divergences: {
    kind: "NARRATIVE_COMPLETION" | "UNSUPPORTED_CLAUSE" | "WITHHELD_UNKNOWN";
    detail: string;
  }[];
}

/**
 * Build the differential from the actual statements.
 *
 * ASIANCODER.MD calls this "one of the most important screens" and the
 * example is the demand claim: the model said "because of migration", the
 * evidence established "population increased", the system can verify
 * "population increase occurred", and the causal contribution is UNKNOWN.
 *
 * The four lanes are computed from categories rather than from prose, so
 * the separation is structural rather than editorial. The divergences are
 * derived by asking which model-asserted clauses have no counterpart in a
 * weaker lane — that comparison IS the instrument, and rendering only the
 * lanes would leave the reader to spot it themselves.
 */
export function buildDifferential(
  statement: Statement,
  all: readonly Statement[],
  guards: readonly GuardRecord[]
): Differential {
  const byId = new Map(all.map((s) => [s.id as string, s]));
  const related = all.filter(
    (s) => s.id === statement.id || statement.parentIds.includes(s.id)
  );

  const mine = guards.filter((g) => g.statementId === statement.id);

  const rows: DifferentialRow[] = [
    {
      lane: "MODEL_SAID",
      text: statement.text,
      refs: [statement.id],
    },
    {
      lane: "EVIDENCE_SUPPORTS",
      text:
        related
          .filter((s) => s.kind === "OBSERVATION" || s.category === "FACT")
          .map((s) => s.text)
          .join(" ") || "No observation or fact underlies this claim.",
      refs: related
        .filter((s) => s.kind === "OBSERVATION" || s.category === "FACT")
        .map((s) => s.id),
    },
    {
      lane: "VERIFIABLE",
      text:
        related
          .filter((s) => s.category === "FACT" && deriveConfidence(s.confidence).score >= 0.7)
          .map((s) => s.text)
          .join(" ") || "Nothing in this claim has been independently verified.",
      refs: related
        .filter((s) => s.category === "FACT" && deriveConfidence(s.confidence).score >= 0.7)
        .map((s) => s.id),
    },
    {
      lane: "UNKNOWN",
      text:
        statement.unknowns.length > 0
          ? statement.unknowns.join("; ")
          : "No unknown is recorded against this claim.",
      refs: [statement.id],
    },
  ];

  const divergences: Differential["divergences"] = [];

  /* Narrative completion: the model asserted something the evidence lanes
     do not contain, and a guard has already said which kind of thing it is. */
  const overreach = mine.filter((g) =>
    [
      "CAUSALITY_OVERREACH",
      "CONSENSUS_CLAIM_UNSUPPORTED",
      "SOURCE_CLAIM_FACT_COLLAPSE",
      "UNSUPPORTED_SPECIFICITY",
    ].includes(g.event)
  );
  for (const g of overreach) {
    divergences.push({
      kind: "NARRATIVE_COMPLETION",
      detail: `"${g.observed.trim()}" appears in the model's sentence and in no weaker lane. ${g.evidence}`,
    });
  }

  /* Unsupported clause: the claim has clauses and nothing under them. */
  if (related.filter((s) => s.kind === "OBSERVATION").length === 0) {
    divergences.push({
      kind: "UNSUPPORTED_CLAUSE",
      detail:
        "This claim has no observation beneath it. It is not necessarily wrong — it may be a reasonable prior — but nothing in this system supports it.",
    });
  }

  /* Withheld unknown: an UNKNOWN that exists in the record but is not
     attached here. Suppression is the failure ASIANCODER.MD cares most
     about, and it is invisible without this comparison. */
  const premiseUnknowns = statement.parentIds.flatMap((id) => byId.get(id)?.unknowns ?? []);
  const carried = statement.unknowns.join(" | ").toLowerCase();
  const dropped = premiseUnknowns.filter((u) => !carried.includes(u.toLowerCase()));
  if (dropped.length > 0) {
    divergences.push({
      kind: "WITHHELD_UNKNOWN",
      detail: `Known upstream, absent here: ${dropped.join("; ")}.`,
    });
  }

  return { rows, divergences };
}

/* ── shared ───────────────────────────────────────────────────── */

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Re-exported so the UI can show an evaluation's basis without a second import. */
export type { Evaluation, Artifact };