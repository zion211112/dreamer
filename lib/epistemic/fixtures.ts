/**
 * APT-LABS Epistemic Fixtures — Worked examples from ASIANCODER.MD
 */

import { parseClaim, parseAssumption, parseInference, parseSource, StatementId } from "./model";

const solarObservationProvenance = {
  author: "APT-LABS",
  timestamp: "2026-10-04T00:00:00.000Z",
  tool: "epistemic-check",
};

export const solarObservation = {
  provenance: solarObservationProvenance,
  createdAt: "2026-10-04T00:00:00.000Z",
};

// Population source - from ASIANCODER.MD worked example
export const populationSource = parseSource({
  id: StatementId.parse("src-population"),
  locator: "Kenya National Bureau of Statistics, 2019 Census",
  originator: "KNBS",
  publishedAt: "2019-11-01T00:00:00.000Z",
  opened: true,
  quality: "PRIMARY",
  independenceGroup: "kenya-census-2019",
  retrievedAt: "2026-10-04T00:00:00.000Z",
});

// Demand claim - "Demand increased because of migration" (should fire CAUSALITY_OVERREACH)
export const demandClaim = parseClaim({
  kind: "CLAIM",
  id: StatementId.parse("claim-demand"),
  text: "Electricity demand increased because of migration.",
  category: "FACT",
  chainStage: "OBSERVED",
  support: "SUPPORTED",
  provenance: solarObservationProvenance,
  confidence: {
    factors: [
      { factor: "DIRECT_MEASUREMENT", basis: "Meter readings show increase", because: "src-population" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  evidenceIds: ["ev-population"],
  sourceIds: [StatementId.parse("src-population")],
  independentSupports: 1,
  contradicting: [],
  createdAt: "2026-10-04T00:00:00.000Z",
});

// Solar source for clean claim
export const solarSource = parseSource({
  id: StatementId.parse("src-clean-1"),
  locator: "Inverter log export, site KRG-04",
  originator: "Telemetry pipeline",
  publishedAt: "2026-10-04T00:00:00.000Z",
  opened: true,
  quality: "PRIMARY",
  independenceGroup: "telemetry-krg04",
  retrievedAt: "2026-10-04T00:00:00.000Z",
});

// Clean claim - properly sourced, corroborated, direct measurement
export const cleanClaim = parseClaim({
  kind: "CLAIM",
  id: StatementId.parse("claim-clean-1"),
  text: "Measured solar output at site KRG-04 fell 18% over the last 30 days.",
  category: "FACT",
  chainStage: "OBSERVED",
  support: "SUPPORTED",
  provenance: solarObservationProvenance,
  confidence: {
    factors: [
      { factor: "DIRECT_MEASUREMENT", basis: "Direct telemetry", because: "src-clean-1" },
      { factor: "DIRECT_PRIMARY_SOURCE", basis: "The instrument is the source", because: "src-clean-1" },
      { factor: "INDEPENDENT_CORROBORATION", basis: "Second string agrees", because: "src-clean-2" },
      { factor: "RECENT", basis: "Inside the window", because: "src-clean-1" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  evidenceIds: ["ev-1"],
  sourceIds: [StatementId.parse("src-clean-1")],
  independentSupports: 2,
  contradicting: [],
  createdAt: "2026-10-04T00:00:00.000Z",
});