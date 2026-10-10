/**
 * APT-LABS Epistemic Guard — Firewall for epistemic violations
 * Implements the Category Guard from ASIANCODER.MD
 */

import type {
  Statement,
  Claim,
  Inference,
  Assumption,
  Source,
  GuardEvent,
  StatementId,
} from "./model";
import type { Category, ChainStage, Support } from "./taxonomy";

/* ═══════════════════════════════════════════════════════════════════
   Guard Context — State passed to all detectors
   ═══════════════════════════════════════════════════════════════════ */

export interface GuardContext {
  statement: Statement;
  all: Statement[];
  sources: Source[];
  at?: string;
}

/* ═══════════════════════════════════════════════════════════════════
   Guard Event Factory
   ═══════════════════════════════════════════════════════════════════ */

function makeGuard(
  event: GuardEvent["event"],
  severity: GuardEvent["severity"],
  message: string,
  evidence: string,
  observed?: string,
): GuardEvent {
  return { event, severity, message, evidence, observed };
}

/* ═══════════════════════════════════════════════════════════════════
   CAUSALITY_OVERREACH Detector

   Fires when a claim asserts causation ("because", "caused by", "due to")
   but evidence only establishes correlation or co-occurrence.
   ════════════════════════════════════════════════════════════════════ */

const CAUSAL_PATTERNS = [
  /\bbecause\s+of\b/i,
  /\bcaused\s+by\b/i,
  /\bdue\s+to\b/i,
  /\bresulted\s+from\b/i,
  /\battributable\s+to\b/i,
  /\bdriven\s+by\b/i,
];

function hasCausalLanguage(text: string): { match: string; index: number } | null {
  for (const pattern of CAUSAL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { match: match[0], index: match.index ?? 0 };
    }
  }
  return null;
}

function sourceSupportsCausation(source: Source, claimText: string): boolean {
  // A source supports causation if it's a controlled study, experiment,
  // or explicitly states causal mechanism
  const locator = source.locator.toLowerCase();
  return (
    locator.includes("controlled") ||
    locator.includes("experiment") ||
    locator.includes("randomized") ||
    locator.includes("causal") ||
    locator.includes("mechanism")
  );
}

function detectCausalityOverreach(ctx: GuardContext): GuardEvent | null {
  const { statement, sources } = ctx;

  // Only check claims and inferences
  if (statement.kind !== "CLAIM" && statement.kind !== "INFERENCE") {
    return null;
  }

  const causal = hasCausalLanguage(statement.text);
  if (!causal) return null;

  // Check if any source supports causation
  const hasCausalSource = sources.some((s) => sourceSupportsCausation(s, statement.text));
  if (hasCausalSource) return null;

  // No causal source found — fire
  const observed = statement.text.slice(
    Math.max(0, causal.index - 20),
    causal.index + causal.match.length + 20,
  );

  return makeGuard(
    "CAUSALITY_OVERREACH",
    "ERROR",
    `Claim asserts causation ("${causal.match}") but no source establishes causal mechanism`,
    `Statement "${statement.id}" uses causal language without causal evidence`,
    observed,
  );
}

/* ════════════════════════════════════════════════════════════════════
   ASSUMPTION_LEAKAGE Detector

   Fires when an inference depends on an assumption that is:
   - UNTESTED (not verified)
   - Not carried as UNKNOWN in the inference's unknowns
   ════════════════════════════════════════════════════════════════════ */

function detectAssumptionLeakage(ctx: GuardContext): GuardEvent | null {
  const { statement, all } = ctx;

  if (statement.kind !== "INFERENCE") return null;

  const inference = statement as Inference;

  // Check each premise
  for (const premiseId of inference.premises) {
    const premise = all.find((s) => s.id === premiseId);
    if (!premise) continue;

    if (premise.kind === "ASSUMPTION") {
      const assumption = premise as Assumption;

      // Fire if assumption is untested AND not carried in unknowns
      if (assumption.support === "UNTESTED" && !assumption.verified) {
        const carried = inference.unknowns.includes(premiseId);
        if (!carried) {
          return makeGuard(
            "ASSUMPTION_LEAKAGE",
            "ERROR",
            `Inference rests on untested assumption "${assumption.id}" that is not carried as UNKNOWN`,
            `Assumption "${assumption.text}" (${assumption.id}) is untested and unverified`,
            assumption.text,
          );
        }
      }
    }
  }

  return null;
}

/* ════════════════════════════════════════════════════════════════════
   SOURCE_DECAY Detector

   Fires when a source is older than the freshness window for its quality
   ════════════════════════════════════════════════════════════════════ */

const FRESHNESS_WINDOWS: Record<string, number> = {
  PRIMARY: 365 * 24 * 60 * 60 * 1000, // 1 year
  SECONDARY: 180 * 24 * 60 * 60 * 1000, // 6 months
  TERTIARY: 90 * 24 * 60 * 60 * 1000, // 3 months
};

function detectSourceDecay(ctx: GuardContext): GuardEvent | null {
  const { statement, at } = ctx;
  const now = at ? new Date(at).getTime() : Date.now();

  const sourceIds = "sourceIds" in statement ? (statement as Claim).sourceIds : [];
  const premiseIds = "premises" in statement ? (statement as Inference).premises : [];

  // Check direct sources
  for (const sourceId of sourceIds) {
    const source = ctx.sources.find((s) => s.id === sourceId);
    if (!source) continue;

    const published = new Date(source.publishedAt).getTime();
    const age = now - published;
    const window = FRESHNESS_WINDOWS[source.quality] ?? FRESHNESS_WINDOWS.TERTIARY;

    if (age > window) {
      return makeGuard(
        "SOURCE_DECAY",
        "WARNING",
        `Source ${sourceId} (${source.quality}) is ${Math.round(age / (24 * 60 * 60 * 1000))} days old, exceeds ${Math.round(window / (24 * 60 * 60 * 1000))}-day window`,
        `Source "${source.locator}" published ${source.publishedAt}`,
      );
    }
  }

  return null;
}

/* ════════════════════════════════════════════════════════════════════
   CORROBORATION_FAILURE Detector

   Fires when a claim needs independent corroboration but lacks it
   ════════════════════════════════════════════════════════════════════ */

function detectCorroborationFailure(ctx: GuardContext): GuardEvent | null {
  const { statement } = ctx;

  if (statement.kind !== "CLAIM") return null;
  const claim = statement as Claim;

  // High-stakes claims need independent corroboration
  const highStakes = claim.text.toLowerCase().includes("fraud") ||
    claim.text.toLowerCase().includes("violation") ||
    claim.text.toLowerCase().includes("non-compliance") ||
    claim.text.toLowerCase().includes("breach");

  if (highStakes && claim.independentSupports < 2) {
    return makeGuard(
      "CORROBORATION_FAILURE",
      "ERROR",
      `High-stakes claim has ${claim.independentSupports} independent support(s), needs ≥2`,
      `Claim "${claim.text}" lacks independent corroboration`,
    );
  }

  return null;
}

/* ════════════════════════════════════════════════════════════════════
   CONTRADICTION Detector

   Fires when a claim contradicts another claim in the same context
   ════════════════════════════════════════════════════════════════════ */

function detectContradiction(ctx: GuardContext): GuardEvent | null {
  const { statement, all } = ctx;

  if (statement.kind !== "CLAIM") return null;
  const claim = statement as Claim;

  for (const contradictingId of claim.contradicting) {
    const other = all.find((s) => s.id === contradictingId);
    if (other && (other.kind === "CLAIM" || other.kind === "INFERENCE")) {
      return makeGuard(
        "CONTRADICTION",
        "ERROR",
        `Claim contradicts "${other.id}" (${other.text.slice(0, 50)}...)`,
        `Contradiction with statement ${contradictingId}`,
      );
    }
  }

  return null;
}

/* ════════════════════════════════════════════════════════════════════
   CONSENSUS_CLAIM_UNSUPPORTED Detector

   Fires when a claim cites consensus without naming experts or process
   ════════════════════════════════════════════════════════════════════ */

const CONSENSUS_PATTERNS = [
  /\bconsensus\b/i,
  /\bexperts?\s+agree\b/i,
  /\bwidely\s+accepted\b/i,
  /\bgeneral\s+agreement\b/i,
  /\bmainstream\s+view\b/i,
];

function detectConsensusClaimUnsupported(ctx: GuardContext): GuardEvent | null {
  const { statement } = ctx;

  if (statement.kind !== "CLAIM") return null;
  const claim = statement as Claim;

  const hasConsensusLanguage = CONSENSUS_PATTERNS.some((p) => p.test(claim.text));
  if (!hasConsensusLanguage) return null;

  // Check if any source is an expert consensus source
  const hasExpertSource = claim.sourceIds.some((id) => {
    const source = ctx.sources.find((s) => s.id === id);
    return source?.originator.toLowerCase().includes("expert") ||
           source?.locator.toLowerCase().includes("consensus");
  });

  if (hasExpertSource) return null;

  return makeGuard(
    "CONSENSUS_CLAIM_UNSUPPORTED",
    "ERROR",
    "Claim invokes consensus without citing expert sources or consensus process",
    `Statement "${claim.id}" cites consensus without expert sources`,
  );
}

/* ═════════════════════════════════════════════════════════════════════
   SOURCE_CLAIM_FACT_COLLAPSE Detector

   Fires when a source doesn't support the claim's category
   ════════════════════════════════════════════════════════════════════ */

function detectSourceClaimFactCollapse(ctx: GuardContext): GuardEvent | null {
  const { statement, sources } = ctx;

  if (statement.kind !== "CLAIM") return null;
  const claim = statement as Claim;

  // Check if any source matches the claim's category
  const hasMatchingSource = claim.sourceIds.some((id) => {
    const source = sources.find((s) => s.id === id);
    if (!source) return false;
    // Simple check: PRIMARY source for FACT, etc.
    return source.quality === "PRIMARY" || source.quality === "SECONDARY";
  });

  if (hasMatchingSource) return null;

  return makeGuard(
    "SOURCE_CLAIM_FACT_COLLAPSE",
    "ERROR",
    "Claim category not supported by source quality",
    `Claim "${claim.id}" (${claim.category}) lacks supporting source`,
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CONSENSUS_AMPLIFICATION Detector

   Fires when repeated citations of the same source inflate confidence
   ════════════════════════════════════════════════════════════════════ */

function detectConsensusAmplification(ctx: GuardContext): GuardEvent | null {
  const { statement } = ctx;

  if (statement.kind !== "CLAIM") return null;
  const claim = statement as Claim;

  // Check for duplicate confidence factors with same 'because'
  const factors = claim.confidence.factors;
  const seen = new Set<string>();
  const duplicated: string[] = [];

  for (const factor of factors) {
    const key = `${factor.factor}:${factor.because}`;
    if (seen.has(key)) {
      duplicated.push(factor.factor);
    } else {
      seen.add(key);
    }
  }

  if (duplicated.length === 0) return null;

  return makeGuard(
    "CONSENSUS_AMPLIFICATION",
    "WARNING",
    `Repeated factor(s) ${duplicated.join(", ")} with same source inflate confidence`,
    `Claim "${claim.id}" has duplicated confidence factors`,
    duplicated.join(", "),
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CONSENSUS_AMPLIFICATION Cross-Agent Detector

   Fires when multiple agents restate the same unsupported claim
   ════════════════════════════════════════════════════════════════════ */

function detectConsensusAmplificationCrossAgent(ctx: GuardContext): GuardEvent | null {
  const { statement, all } = ctx;

  if (statement.kind !== "CLAIM") return null;
  const claim = statement as Claim;

  // Find other claims with the same text from different agents
  // We identify different agents by checking provenance author or tool
  const otherSameText = all.filter(
    (s) => s.id !== statement.id && s.kind === "CLAIM" && s.text === claim.text
  );

  if (otherSameText.length === 0) return null;

  // Check if they come from different agents (different provenance author/tool)
  const claimProvenance = claim.provenance;
  const differentAgents = otherSameText.some(
    (s) =>
      (s as Claim).provenance.author !== claimProvenance.author ||
      (s as Claim).provenance.tool !== claimProvenance.tool
  );

  if (!differentAgents) return null;

  return makeGuard(
    "CONSENSUS_AMPLIFICATION",
    "WARNING",
    `Multiple agents restate the same unsupported claim: "${claim.text.slice(0, 50)}..."`,
    `Claim "${claim.id}" has ${otherSameText.length} restatement(s) from different agents`,
    claim.text.slice(0, 50) + "...",
  );
}

/* ═════════════════════════════════════════════════════════════════════
   FLUENCY_EVIDENCE_GAP Detector

   Fires when fluent language masks missing evidence
   ════════════════════════════════════════════════════════════════════ */

const FLUENCY_PATTERNS = [
  /\bclearly\b/i,
  /\bobviously\b/i,
  /\bevidently\b/i,
  /\bundoubtedly\b/i,
  /\bcertainly\b/i,
  /\bwithout\s+doubt\b/i,
  /\bproves?\b/i,
  /\bdemonstrates?\b/i,
];

function detectFluencyEvidenceGap(ctx: GuardContext): GuardEvent | null {
  const { statement } = ctx;

  if (statement.kind !== "CLAIM" && statement.kind !== "INFERENCE") return null;

  const hasFluentLanguage = FLUENCY_PATTERNS.some((p) => p.test(statement.text));
  if (!hasFluentLanguage) return null;

  // Check if there are actual sources
  const hasSources = "sourceIds" in statement && (statement as Claim).sourceIds.length > 0;
  const hasPremises = "premises" in statement && (statement as Inference).premises.length > 0;

  if (hasSources || hasPremises) return null;

  return makeGuard(
    "FLUENCY_EVIDENCE_GAP",
    "WARNING",
    "Fluent certainty language without supporting evidence",
    `Statement "${statement.id}" uses certainty language without sources`,
  );
}

/* ════════════════════════════════════════════════════════════════════
   Main Guard Function
   ═══════════════════════════════════════════════════════════════════ */

const DETECTORS = [
  detectCausalityOverreach,
  detectAssumptionLeakage,
  detectSourceDecay,
  detectCorroborationFailure,
  detectContradiction,
  detectConsensusClaimUnsupported,
  detectSourceClaimFactCollapse,
  detectConsensusAmplification,
  detectConsensusAmplificationCrossAgent,
  detectFluencyEvidenceGap,
];

export function guardStatement(ctx: GuardContext): GuardEvent[] {
  const events: GuardEvent[] = [];

  if (!ctx.statement) {
    return events;
  }

  for (const detector of DETECTORS) {
    const event = detector(ctx);
    if (event) events.push(event);
  }

  return events;
}

/* ════════════════════════════════════════════════════════════════════
   Gate Promotion — Block chain-stage promotion if critical guards fire
   ════════════════════════════════════════════════════════════════════ */

export interface GateResult {
  allowed: boolean;
  blockers: GuardEvent[];
  reason?: string;
}

const CRITICAL_EVENTS: GuardEvent["event"][] = [
  "CAUSALITY_OVERREACH",
  "ASSUMPTION_LEAKAGE",
  "CORROBORATION_FAILURE",
  "CONTRADICTION",
];

export function gatePromotion(statement: Statement, guards: GuardEvent[]): GateResult {
  const blockers = guards.filter((g) => CRITICAL_EVENTS.includes(g.event));
  const allowed = blockers.length === 0;

  return {
    allowed,
    blockers,
    reason: allowed
      ? "No critical guards raised"
      : `Blocked by ${blockers.length} critical guard(s): ${blockers.map((b) => b.event).join(", ")}`,
  };
}

/* ════════════════════════════════════════════════════════════════════
   Guard All — Run all detectors on multiple statements with stable IDs
   ═══════════════════════════════════════════════════════════════════ */

let guardIdCounter = 0;

function makeGuardWithId(
  event: GuardEvent["event"],
  severity: GuardEvent["severity"],
  message: string,
  evidence: string,
  observed?: string,
): GuardEvent & { id: string } {
  guardIdCounter++;
  return {
    event,
    severity,
    message,
    evidence,
    observed,
    id: `guard-${guardIdCounter}-${event.toLowerCase()}`,
    acknowledged: false,
    acknowledgedBy: undefined,
  };
}

export interface GuardAllContext {
  statements: Statement[];
  sources: Source[];
  at?: string;
  acknowledgedGuards?: Array<{ id: string; acknowledged: boolean; acknowledgedBy: string }>;
}

export function guardAll(
  statements: Statement[],
  sources: Source[],
  at?: string,
  acknowledgedGuards?: Array<{ id: string; acknowledged: boolean; acknowledgedBy: string }>
): (GuardEvent & { id: string; acknowledged?: boolean; acknowledgedBy?: string })[] {
  const events: (GuardEvent & { id: string; acknowledged?: boolean; acknowledgedBy?: string })[] = [];
  const acknowledgedMap = new Map(acknowledgedGuards?.map((g) => [g.id, g]) ?? []);

  // Reset counter for deterministic IDs
  guardIdCounter = 0;

  for (const statement of statements) {
    const statementEvents = guardStatement({
      statement,
      all: statements,
      sources,
      at,
    });

    for (const event of statementEvents) {
      const guardId = `guard-${++guardIdCounter}-${event.event.toLowerCase()}`;
      const acknowledged = acknowledgedMap.get(guardId);
      events.push({
        ...event,
        id: guardId,
        acknowledged: acknowledged?.acknowledged ?? false,
        acknowledgedBy: acknowledged?.acknowledgedBy,
      });
    }
  }

  return events;
}