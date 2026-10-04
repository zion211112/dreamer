/**
 * lib/epistemic/confidence.ts — CONFIDENCE, DERIVED.
 *
 * ASIANCODER.MD: "Confidence is not a free text property. Derive it from
 * explicit factors where possible." And: "Do not let 'high confidence'
 * exist without a visible reason."
 *
 * So this file contains a pure function from a factor list to a number,
 * and the domain model has no place to store a number. The UI never renders
 * a confidence it did not get from here, which means the reasons are always
 * available — they are the input, and the input is what gets displayed.
 *
 * The arithmetic is deliberately dull. There is no learning here, no
 * calibration curve fitted to historical outcomes, nothing clever. That is
 * not a limitation to apologise for; it is the point. A derived confidence
 * whose derivation you can read in one screen is auditable. A calibrated
 * model is more accurate and unexplainable, and an epistemic system that
 * trades explanation for accuracy has misunderstood its own thesis.
 *
 * Two properties worth stating because they are easy to get wrong:
 *
 *   · The score is CLAMPED, never wrapped. Ten strongly supporting factors
 *     produce 1.00, not 2.4. A confidence above 1 is meaningless, and
 *     letting the arithmetic escape its range would put an out-of-range
 *     number on screen.
 *
 *   · UNDERMINING factors dominate. The base is 0.5, so a claim with only
 *     supporting factors lands around 0.6-0.7 — already doubtful — while a
 *     claim with both lands below its supporting factors alone. This
 *     encodes the actual asymmetry: confirming a weak story is easy and
 *     should not read as high confidence.
 */

import {
  CONFIDENCE_FACTOR_RULES,
  type ConfidenceFactor,
} from "./taxonomy";
import type { Confidence, ConfidenceFactorEntry, Statement } from "./model";

/** Where an unexamined claim starts. Neutral, and that is deliberate. */
const PRIOR = 0.5;

export interface DerivedConfidence {
  /** 0..1, clamped. */
  score: number;
  /** Exactly the factors that produced it, in rule order. */
  factors: ConfidenceFactor[];
  /** Per-factor contribution, so the arithmetic is visible line by line. */
  ledger: {
    factor: ConfidenceFactor;
    sign: "SUPPORTS" | "UNDERMINES";
    weight: number;
    basis: string;
    because: string;
  }[];
  /** True when the same factor appears twice. Counting it twice would be
      double-counting the same evidence, which is CONSENSUS_AMPLIFICATION
      in numeric form. */
  duplicated: ConfidenceFactor[];
}

/**
 * Compute confidence from its factors.
 *
 * Pure: no clock, no randomness, no I/O. Same factors in, same number out,
 * always. That is what lets it be tested, and what lets the UI show the
 * derivation rather than assert a result.
 */
export function deriveConfidence(confidence: Confidence): DerivedConfidence {
  const seen = new Map<ConfidenceFactor, number>();
  for (const entry of confidence.factors) {
    seen.set(entry.factor, (seen.get(entry.factor) ?? 0) + 1);
  }

  const duplicated = [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([factor]) => factor);

  /* Only the first occurrence of each factor counts. The duplicate is
     reported so the caller can raise CONSENSUS_AMPLIFICATION, rather than
     silently raising the score — the whole failure this guards against is
     one unsupported claim arriving by many routes and being counted as
     many supports. */
  const deduped: ConfidenceFactorEntry[] = [];
  const claimed = new Set<ConfidenceFactor>();
  for (const entry of confidence.factors) {
    if (claimed.has(entry.factor)) continue;
    claimed.add(entry.factor);
    deduped.push(entry);
  }

  const ledger = deduped.map((entry) => {
    const rule = CONFIDENCE_FACTOR_RULES[entry.factor];
    return {
      factor: entry.factor,
      sign: rule.sign,
      weight: rule.weight,
      basis: entry.basis,
      because: entry.because,
    };
  });

  const delta = ledger.reduce((sum, l) => sum + l.weight, 0);
  const score = clamp01(PRIOR + delta);

  return {
    score,
    factors: ledger.map((l) => l.factor),
    ledger,
    duplicated,
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return PRIOR;
  return Math.min(1, Math.max(0, n));
}

/**
 * Confidence for a whole statement, derived rather than stored.
 *
 * `categoryPenalty` is the important asymmetry. A claim in a weak category
 * is not merely less confident — it is a different KIND of thing, and this
 * adds UNESTABLISHED_CATEGORY when the category has not earned its
 * statement. A HYPOTHESIS carrying hypothesis-grade confidence at 0.9 would
 * read as a fact on a fast glance, and this is the check that stops it.
 */
export function statementConfidence(s: Statement): DerivedConfidence {
  const derived = deriveConfidence(s.confidence);

  /* FACT and OBSERVATION are the two categories that can be directly
     backed. Anything at rank 3 or below is reasoning, and reasoning is
     never directly evidenced — it is evidenced through its premises. */
  const CATALOGUE_RANK_CEILING: Record<string, number> = {
    FACT: 1,
    OBSERVATION: 1,
    SOURCE_CLAIM: 0.72,
    INFERENCE: 0.72,
    HYPOTHESIS: 0.6,
    PREDICTION: 0.55,
    SPECULATION: 0.4,
    ASSUMPTION: 0.4,
    NORMATIVE_JUDGMENT: 0.3,
    DESIGN_CHOICE: 0.3,
    UNKNOWN: 0.3,
  };

  const ceiling = CATALOGUE_RANK_CEILING[s.category] ?? 0.5;
  const capped = Math.min(derived.score, ceiling);

  if (capped === derived.score) return derived;

  /* Re-derive with the category penalty made explicit rather than applied
     silently, so the ledger the user reads explains the lower number. */
  return {
    ...derived,
    score: capped,
    ledger: [
      ...derived.ledger,
      {
        factor: "UNESTABLISHED_CATEGORY" as ConfidenceFactor,
        sign: "UNDERMINES" as const,
        weight: 0,
        basis: `${s.category} cannot exceed ${ceiling.toFixed(2)} without direct backing`,
        because: "CATEGORY_RULES",
      },
    ],
  };
}

/** The rendering contract: confidence is always shown with its reasons. */
export interface ConfidenceDisplay {
  value: string;
  basis: { sign: "+" | "−"; label: string; detail: string }[];
  warning: string | null;
}

export function displayConfidence(d: DerivedConfidence): ConfidenceDisplay {
  const basis = d.ledger.map((l) => ({
    sign: l.sign === "SUPPORTS" ? ("+" as const) : ("−" as const),
    label: l.factor.replace(/_/g, " ").toLowerCase(),
    detail: `${l.basis} (${l.because}, weight ${l.weight > 0 ? "+" : ""}${l.weight})`,
  }));

  const warning =
    d.duplicated.length > 0
      ? `${d.duplicated.length} factor(s) supplied more than once and were counted once: ${d.duplicated
          .map((f) => f.replace(/_/g, " ").toLowerCase())
          .join(", ")}. Repetition is not corroboration.`
      : null;

  return { value: d.score.toFixed(2), basis, warning };
}