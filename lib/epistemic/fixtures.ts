/**
 * lib/epistemic/fixtures.ts — THE CONTRACT'S OWN EXAMPLES, AS TEST DATA.
 *
 * ASIANCODER.MD gives two worked examples. They are transcribed here
 * verbatim, because a contract with examples is a contract with test cases
 * and throwing them away to save a file is how a contract quietly stops
 * being true.
 *
 * `SOLAR` is the epistemic example:
 *
 *   Observation:        "Solar output fell 18%."
 *   Inference:          "Panel degradation may explain the decline."
 *   Hypothesis:         "The primary cause is dust accumulation."
 *   Value judgment:     "Reliability should take priority over minimum cost."
 *   Decision:           "Schedule maintenance this week."
 *
 * `DEMAND` is the epistemic differential example:
 *
 *   MODEL:    "Demand increased because of migration."
 *   EVIDENCE: "Population increased."
 *   VERIFIED: "Population increase occurred."
 *   UNKNOWN:  "Causal contribution of migration."
 *
 * These two fixtures are the acceptance test for the firewall. A guard that
 * does not fire on DEMAND is not a guard; it is decoration.
 */

import {
  Claim,
  Hypothesis,
  Inference,
  Observation,
  Source,
  ValueJudgment,
  type ClaimT,
  type HypothesisT,
  type InferenceT,
  type ObservationT,
  type Source as SourceT,
  type ValueJudgmentT,
} from "./model";
import { StatementId, SourceId } from "./model";

const NOW = "2026-10-04T00:00:00.000Z";

const systemProvenance = {
  entries: [
    { at: NOW, actor: { type: "SYSTEM" as const, component: "FIXTURE" }, action: "GENERATED" as const },
  ],
};

const emptyConfidence = { factors: [] };

/* ── SOLAR ─────────────────────────────────────────────────────── */

export const solarObservation = Observation.parse({
  kind: "OBSERVATION",
  id: StatementId.parse("solar-obs-1"),
  text: "Solar output fell 18%.",
  category: "OBSERVATION",
  chainStage: "OBSERVED",
  support: "SUPPORTED",
  method: "Inverter telemetry, daily aggregate, site KRG-04",
  capturedBy: { type: "TOOL", toolId: "telemetry" as never },
  provenance: systemProvenance,
  confidence: {
    factors: [
      { factor: "DIRECT_MEASUREMENT", basis: "Inverter telemetry, not a report", because: "solar-obs-1" },
      { factor: "DIRECT_PRIMARY_SOURCE", basis: "The instrument itself is the source", because: "solar-obs-1" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  createdAt: NOW,
}) satisfies ObservationT;

export const solarInference = Inference.parse({
  kind: "INFERENCE",
  id: StatementId.parse("solar-inf-1"),
  text: "Panel degradation may explain the decline.",
  category: "INFERENCE",
  chainStage: "INFERRED",
  support: "WEAKLY_SUPPORTED",
  premises: [StatementId.parse("solar-obs-1")],
  rule: "abductive: an unexplained decline in a known-good system invites a degradation hypothesis",
  warrant: "ABDUCTIVE",
  provenance: systemProvenance,
  confidence: {
    factors: [
      { factor: "INDIRECT_EVIDENCE", basis: "The mechanism was not measured, only posited", because: "solar-inf-1" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [StatementId.parse("solar-obs-1")],
  createdAt: NOW,
}) satisfies InferenceT;

export const solarHypothesis = Hypothesis.parse({
  kind: "HYPOTHESIS",
  id: StatementId.parse("solar-hyp-1"),
  text: "The primary cause is dust accumulation.",
  category: "HYPOTHESIS",
  chainStage: "HYPOTHESIZED",
  support: "UNTESTED",
  mechanism: "Dust on the glass raises cell temperature and lowers conversion efficiency.",
  wouldBeSupportedBy: "A measured temperature rise on the affected strings, correlated with the dust level.",
  wouldBeRefutedBy: "Cleaning the glass with no change in output.",
  provenance: systemProvenance,
  confidence: emptyConfidence,
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [StatementId.parse("solar-inf-1")],
  createdAt: NOW,
}) satisfies HypothesisT;

export const solarValueJudgment = ValueJudgment.parse({
  kind: "VALUE_JUDGMENT",
  id: StatementId.parse("solar-val-1"),
  text: "Reliability should take priority over minimum cost.",
  category: "NORMATIVE_JUDGMENT",
  chainStage: "UNKNOWN",
  support: "UNKNOWN",
  heldBy: "human:facilities-owner",
  prioritises: "uptime of the generation asset",
  over: "lowest-installation-cost",
  provenance: {
    entries: [
      { at: NOW, actor: { type: "HUMAN", actorId: "facilities-owner" }, action: "GENERATED" },
    ],
  },
  confidence: emptyConfidence,
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  createdAt: NOW,
}) satisfies ValueJudgmentT;

/**
 * DEMAND — the differential fixture, and the one that must trip the guard.
 *
 * The claim says "because of migration". The only evidence is that
 * population increased. Those are different claims and the difference is the
 * entire subject of this system.
 */
export const demandClaim = Claim.parse({
  kind: "CLAIM",
  id: StatementId.parse("demand-claim-1"),
  text: "Demand increased because of migration.",
  category: "INFERENCE",
  chainStage: "INFERRED",
  support: "CONTESTED",
  provenance: systemProvenance,
  confidence: {
    factors: [
      { factor: "INDIRECT_EVIDENCE", basis: "Migration was never measured as a driver", because: "demand-claim-1" },
      { factor: "SINGLE_SOURCE", basis: "One bulletin, one origin", because: "src-bulletin-1" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  evidenceIds: ["ev-pop-1"],
  sourceIds: [SourceId.parse("src-bulletin-1")],
  independentSupports: 1,
  contradicting: [],
  createdAt: NOW,
}) satisfies ClaimT;

export const populationSource = Source.parse({
  id: SourceId.parse("src-bulletin-1"),
  locator: "District statistical bulletin 2026-Q3",
  originator: "District Statistics Office",
  publishedAt: NOW,
  opened: true,
  quality: "PRIMARY",
  independenceGroup: "district-statistics-office",
  retrievedAt: NOW,
}) satisfies SourceT;

/** The four lines the epistemic differential renders. */
export const demandDifferential = {
  model: demandClaim.text,
  evidence: "Population increased.",
  verified: "Population increase occurred.",
  unknown: "Causal contribution of migration.",
} as const;

export const SOLAR_CHAIN = [
  solarObservation,
  solarInference,
  solarHypothesis,
  solarValueJudgment,
] as const;

export const ALL_FIXTURES = [
  ...SOLAR_CHAIN,
  demandClaim,
] as const;