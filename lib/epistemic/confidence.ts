/**
 * APT-LABS Epistemic Confidence — Confidence factor computation
 */

import type { ConfidenceFactor, Confidence, Statement } from "./model";

/* ═══════════════════════════════════════════════════════════════════
   Factor weights — Each factor contributes to overall confidence
   ═══════════════════════════════════════════════════════════════════ */

export const FACTOR_WEIGHTS: Record<string, number> = {
  DIRECT_MEASUREMENT: 0.35,
  DIRECT_PRIMARY_SOURCE: 0.25,
  INDEPENDENT_CORROBORATION: 0.2,
  RECENT: 0.1,
  EXPERT_CONSENSUS: 0.05,
  HISTORICAL_CONSISTENCY: 0.05,
};

/* ═══════════════════════════════════════════════════════════════════
   Category caps — Maximum confidence by statement category
   ═══════════════════════════════════════════════════════════════════ */

export const CATEGORY_CAPS: Record<string, number> = {
  FACT: 1.0,
  INFERENCE: 0.72,
  ASSUMPTION: 0.3,
  COUNTERFACTUAL: 0.4,
};

/* ═══════════════════════════════════════════════════════════════════
   Confidence Computation
   ═══════════════════════════════════════════════════════════════════ */

export function computeConfidence(confidence: Confidence): number {
  let score = 0;
  for (const factor of confidence.factors) {
    const weight = FACTOR_WEIGHTS[factor.factor] ?? 0;
    score += weight;
  }
  return Math.min(score, 1);
}

export function confidenceLevel(confidence: Confidence): "HIGH" | "MEDIUM" | "LOW" {
  const score = computeConfidence(confidence);
  if (score >= 0.7) return "HIGH";
  if (score >= 0.4) return "MEDIUM";
  return "LOW";
}

/* ═══════════════════════════════════════════════════════════════════
   Support Classification
   ═══════════════════════════════════════════════════════════════════ */

export function classifySupport(confidence: Confidence): "SUPPORTED" | "WEAKLY_SUPPORTED" | "UNTESTED" {
  const level = confidenceLevel(confidence);
  if (level === "HIGH") return "SUPPORTED";
  if (level === "MEDIUM") return "WEAKLY_SUPPORTED";
  return "UNTESTED";
}

/* ═══════════════════════════════════════════════════════════════════
   Derive Confidence — Deduplicate factors and apply category cap
   ═══════════════════════════════════════════════════════════════════ */

export interface DerivedConfidence {
  score: number;
  duplicated: string[];
  ledger: Array<{ factor: string; weight: number; duplicated: boolean }>;
}

export function deriveConfidence(input: Confidence): DerivedConfidence {
  const seen = new Set<string>();
  const duplicated: string[] = [];
  const ledger: Array<{ factor: string; weight: number; duplicated: boolean }> = [];

  let score = 0;

  for (const factor of input.factors) {
    const key = `${factor.factor}:${factor.because}`;
    const weight = FACTOR_WEIGHTS[factor.factor] ?? 0;
    const isDup = seen.has(key);

    if (isDup) {
      duplicated.push(factor.factor);
    } else {
      seen.add(key);
      score += weight;
    }

    ledger.push({ factor: factor.factor, weight, duplicated: isDup });
  }

  return {
    score: Math.min(score, 1),
    duplicated,
    ledger,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   Statement Confidence — Apply category cap and return ledger
   ═══════════════════════════════════════════════════════════════════ */

export function statementConfidence(statement: Statement): DerivedConfidence {
  const derived = deriveConfidence(statement.confidence);
  const cap = CATEGORY_CAPS[statement.category] ?? 1.0;

  let score = derived.score;
  const ledger = [...derived.ledger];

  if (score > cap) {
    score = cap;
    ledger.push({
      factor: "UNESTABLISHED_CATEGORY",
      weight: 0,
      duplicated: false,
    });
  }

  return {
    score,
    duplicated: derived.duplicated,
    ledger,
  };
}