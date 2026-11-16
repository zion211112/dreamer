/**
 * Intelligence — bounded recommendation engine for APT-LABS.
 *
 * Position: Intelligence interprets Network capabilities, Workbench undertakings,
 * and Records outcomes to produce inspectable recommendations. It is advisory —
 * the authorized party decides. No universal score, no coin/wallet, no custody,
 * no unilateral decision.
 *
 * Five functions, each output must be inspectable: What? Why? Based on what?
 * How certain? What else? Who decides? What happened?
 */

import type { GateState, PilotKey } from '@/modules/workbench/data';
import { workItemsForPilot, PILOTS } from '@/modules/workbench/data';
import { readPeopleNetworkRecord } from '@/lib/people-network';
import { queryRollEntries } from '@/lib/db/roll';

export interface Recommendation {
  id: string;
  type: 'match' | 'forecast' | 'pattern' | 'learning' | 'decision-support';
  title: string;
  what: string;
  why: string;
  basedOn: string[];
  certainty: 'low' | 'medium' | 'high';
  alternatives: string[];
  counterEvidence: string[];
  whoDecides: string;
  outcome?: string;
  createdAt: string;
}

export interface MatchCandidate {
  entityId: string;
  name: string;
  role: string;
  type: string;
  capability: string;
  level: 'claimed' | 'qualified' | 'demonstrated' | 'accepted';
  basis: string;
  score: number;
  reason: string;
}

interface MatchInput {
  undertakingId: string;
  undertakingTitle: string;
  requiredCapability: string;
  pilot: PilotKey;
  actor: string;
}

export async function matchParticipants(input: MatchInput): Promise<MatchCandidate[]> {
  const record = readPeopleNetworkRecord();
  const entities = record.entities.filter((e) => e.type === 'person' || e.type === 'crew');
  const entries = await queryRollEntries();

  // Participants with accepted undertakings in the same capability get higher score.
  const acceptedByPerson = new Map<string, number>();
  for (const entry of entries) {
    for (const p of entry.participants) {
      if (p.capability_claims.includes(input.requiredCapability)) {
        const key = p.person_id;
        const current = acceptedByPerson.get(key) ?? 0;
        acceptedByPerson.set(key, current + 1);
      }
    }
  }

  const candidates: MatchCandidate[] = entities
    .filter((e) => e.capabilities.includes(input.requiredCapability))
    .map((e) => {
      const acceptedCount = acceptedByPerson.get(e.id) ?? 0;
      const level: MatchCandidate['level'] = acceptedCount > 0
        ? 'accepted'
        : e.capabilities.includes(input.requiredCapability)
          ? 'demonstrated'
          : 'claimed';
      const score = Math.min(100, 40 + acceptedCount * 20);
      return {
        entityId: e.id,
        name: e.name,
        role: e.role,
        type: e.type as MatchCandidate['type'],
        capability: input.requiredCapability,
        level,
        basis: acceptedCount > 0 ? 'outcome-accepted' : 'demonstrated',
        score,
        reason: acceptedCount > 0
          ? `${acceptedCount} accepted undertaking(s) recorded for ${input.requiredCapability}.`
          : `Capability declared in Network record; no accepted undertaking yet.`,
      };
    })
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, 5);
}

export interface Forecast {
  pilot: string;
  openCount: number;
  acceptedCount: number;
  totalCapital: number;
  estimatedNextGate: GateState | null;
  assumption: string;
  uncertainty: 'low' | 'medium' | 'high';
}

export async function forecastPilot(pilotKey: PilotKey): Promise<Forecast> {
  const items = workItemsForPilot(pilotKey);
  const pilot = PILOTS.find((p) => p.key === pilotKey);
  const openCount = items.filter((i) => i.gate !== 'accepted').length;
  const acceptedCount = items.filter((i) => i.gate === 'accepted').length;
  const totalCapital = items.reduce((sum, i) => sum + i.capital.financial, 0);
  const nextGate = openCount > 0 ? 'in_review' : null;
  return {
    pilot: pilot?.label ?? pilotKey,
    openCount,
    acceptedCount,
    totalCapital,
    estimatedNextGate: nextGate,
    assumption: 'Gates advance at the current historical rate; no external shocks assumed.',
    uncertainty: openCount > 5 ? 'high' : openCount > 0 ? 'medium' : 'low',
  };
}

export interface Pattern {
  id: string;
  title: string;
  description: string;
  evidence: string[];
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export async function detectPatterns(): Promise<Pattern[]> {
  const entries = await queryRollEntries();
  const outcomes = entries.map((e) => e.acceptance.accepted_by ? 'accepted' : 'not-recorded');
  const acceptedCount = outcomes.filter((o) => o === 'accepted').length;
  const total = outcomes.length;
  const patterns: Pattern[] = [];

  if (total > 0) {
    const acceptanceRate = acceptedCount / total;
    if (acceptanceRate < 0.5) {
      patterns.push({
        id: 'pattern-low-acceptance',
        title: 'Low acceptance rate',
        description: 'More than half of recorded undertakings lack a recorded acceptance.',
        evidence: [`${acceptedCount} of ${total} undertakings show a recorded acceptance.`],
        frequency: total - acceptedCount,
        severity: 'high',
        recommendation: 'Review steward sign-off criteria and acceptance criteria clarity before authorising new work.',
      });
    }
  }

  return patterns;
}

export interface LearningOutput {
  id: string;
  undertakingId: string;
  title: string;
  lesson: string;
  reusableDesignId: string | null;
  updatedCriteria: string[];
  appliesTo: string[];
  createdAt: string;
}

export async function generateLearningOutputs(): Promise<LearningOutput[]> {
  const entries = await queryRollEntries();
  const outputs: LearningOutput[] = [];
  for (const entry of entries) {
    if (!entry.acceptance.accepted_by) continue;
    outputs.push({
      id: `learn-${entry.id}`,
      undertakingId: entry.undertaking_id,
      title: entry.title,
      lesson: `Accepted outcome for ${entry.title}: scope delivered per call sheet; acceptance recorded by ${entry.acceptance.accepted_by}.`,
      reusableDesignId: entry.reusable_designs ? `design-${entry.id}` : null,
      updatedCriteria: [],
      appliesTo: [],
      createdAt: entry.recorded_at,
    });
  }
  return outputs.slice(0, 5);
}

export interface DecisionSupport {
  id: string;
  undertakingId: string;
  recommendation: string;
  rationale: string;
  basedOn: string[];
  certainty: 'low' | 'medium' | 'high';
  alternatives: string[];
  whoDecides: string;
}

export async function decisionSupportFor(undertakingId: string): Promise<DecisionSupport | undefined> {
  const entries = await queryRollEntries();
  const entry = entries.find((e) => e.undertaking_id === undertakingId || e.id === undertakingId);
  if (!entry) return undefined;
  return {
    id: `decision-${entry.id}`,
    undertakingId: entry.undertaking_id,
    recommendation: `Proceed with acceptance review for "${entry.title}".`,
    rationale: `Undertaking recorded with ${entry.participants.length} participant(s) and ${entry.evidence.length} evidence layer(s).`,
    basedOn: [`Roll entry ${entry.id}`, `Acceptance by ${entry.acceptance.accepted_by ?? 'not yet accepted'}`],
    certainty: entry.acceptance.accepted_by ? 'high' : 'medium',
    alternatives: ['Request changes before acceptance', 'Defer acceptance pending further evidence', 'Accept with conditions'],
    whoDecides: entry.acceptance.accepted_by ?? 'Authorized financing party',
  };
}

export async function buildRecommendations(): Promise<Recommendation[]> {
  const entries = await queryRollEntries();
  const recommendations: Recommendation[] = [];

  const pendingAcceptance = entries.filter((e) => e.acceptance.accepted_by && !e.hash_anchor);
  for (const entry of pendingAcceptance.slice(0, 3)) {
    recommendations.push({
      id: `rec-${entry.id}`,
      type: 'decision-support',
      title: `Finalise ${entry.title}`,
      what: 'Close this accepted undertaking into the Roll with a hash anchor.',
      why: 'Acceptance is recorded but the integrity anchor is missing — the record is not yet verifiable.',
      basedOn: [`Roll entry ${entry.id}`, `Acceptance by ${entry.acceptance.accepted_by}`],
      certainty: 'high',
      alternatives: ['Compute and store the hash anchor', 'Defer pending evidence review'],
      counterEvidence: [],
      whoDecides: 'Authorized financing party',
      createdAt: entry.recorded_at,
    });
  }

  return recommendations;
}