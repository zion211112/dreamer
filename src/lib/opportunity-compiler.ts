/**
 * APT-LABS — Opportunity Compiler (Stage 2 — Network Effects)
 *
 * Converts unstructured needs into actionable briefs and searches the
 * productive reality graph for possible matches.
 */

import { listCapacityListings, listCapacityRequests, listCapacityBookings, type CapacityType } from './capacity-exchange';
import { getCredentialsByFamily } from './credential-fabric';
import { listAssets, getAssetPassport } from './asset-registry';
import { listActors, listOrganizations } from './actors';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnstructuredNeed {
  text: string;
  submittedBy: string;
  submittedAt: string;
  context?: Record<string, unknown>;
}

export interface ParsedNeed {
  id: string;
  originalText: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  locationId?: string;
  requiredCapabilities: RequiredCapability[];
  requiredResources: RequiredResource[];
  budget?: BudgetRange;
  timeline?: TimelineRange;
  risks: RiskItem[];
  verificationCriteria: VerificationCriterion[];
  counterpartyPreferences: CounterpartyPreference[];
  urgency: 'low' | 'normal' | 'high' | 'critical';
  submittedBy: string;
  submittedAt: string;
  parsedAt: string;
}

export interface RequiredCapability {
  type: string;
  description: string;
  evidenceTypes: string[];
  minEvidenceStanding: string;
  mandatory: boolean;
  weight: number;
}

export interface RequiredResource {
  type: string;
  description: string;
  quantity?: number;
  unit?: string;
  locationId?: string;
  mandatory: boolean;
}

export interface BudgetRange {
  min?: number;
  max?: number;
  currency: string;
  flexibility: 'fixed' | 'negotiable' | 'open';
}

export interface TimelineRange {
  earliestStart?: string;
  latestStart?: string;
  latestCompletion?: string;
  durationWeeks?: number;
}

export interface RiskItem {
  id: string;
  category: 'technical' | 'financial' | 'regulatory' | 'operational' | 'reputational' | 'safety';
  description: string;
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost-certain';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
  mitigation?: string;
}

export interface VerificationCriterion {
  id: string;
  description: string;
  evidenceType: string;
  minEvidenceStanding: string;
  responsibleParty: 'requester' | 'provider' | 'third-party';
}

export interface CounterpartyPreference {
  actorTypes?: string[];
  organizationTypes?: string[];
  requiredCredentials?: string[];
  preferredLocations?: string[];
  excludedActorIds?: string[];
  excludedOrganizationIds?: string[];
}

export interface OpportunityBrief {
  id: string;
  parsedNeed: ParsedNeed;
  matches: MatchResult[];
  summary: BriefSummary;
  generatedAt: string;
  generatedBy: string;
}

export interface MatchResult {
  matchId: string;
  matchType: 'capacity-listing' | 'actor' | 'asset' | 'organization' | 'credential-holder' | 'commitment';
  targetId: string;
  targetType: string;
  targetName: string;
  score: number;
  rationale: MatchRationale[];
  conflicts: string[];
  availableFrom?: string;
  availableTo?: string;
  estimatedCost?: number;
  currency?: string;
  contactPath: ContactStep[];
}

export interface MatchRationale {
  factor: string;
  score: number;
  explanation: string;
  evidence?: string[];
}

export interface ContactStep {
  step: number;
  action: 'request-intro' | 'send-proposal' | 'schedule-meeting' | 'verify-credentials' | 'create-commitment';
  description: string;
  responsibleParty: 'requester' | 'provider' | 'system';
  estimatedTimeHours: number;
}

export interface BriefSummary {
  totalMatches: number;
  highConfidenceMatches: number;
  capacityListingsMatched: number;
  actorsMatched: number;
  assetsMatched: number;
  organizationsMatched: number;
  estimatedTimelineWeeks: number;
  estimatedBudgetRange?: BudgetRange;
  topRisks: RiskItem[];
  recommendedNextSteps: string[];
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const PARSED_NEEDS_KEY = 'aptlabs:parsed-needs';
const OPPORTUNITY_BRIEFS_KEY = 'aptlabs:opportunity-briefs';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readParsedNeeds(): ParsedNeed[] {
  return readJson<ParsedNeed[]>(PARSED_NEEDS_KEY, []);
}

function writeParsedNeeds(needs: ParsedNeed[]): void {
  writeJson(PARSED_NEEDS_KEY, needs);
}

function readOpportunityBriefs(): OpportunityBrief[] {
  return readJson<OpportunityBrief[]>(OPPORTUNITY_BRIEFS_KEY, []);
}

function writeOpportunityBriefs(briefs: OpportunityBrief[]): void {
  writeJson(OPPORTUNITY_BRIEFS_KEY, briefs);
}

// ---------------------------------------------------------------------------
// Need Parsing
// ---------------------------------------------------------------------------

export interface ParseNeedInput {
  text: string;
  submittedBy: string;
  submittedAt?: string;
  context?: Record<string, unknown>;
  authz?: AuthzContext;
}

/**
 * Parse unstructured need text into structured brief.
 */
export function parseNeed(input: ParseNeedInput): ParsedNeed {
  if (input.authz) {
    requirePermission(input.authz, 'intention:write');
  }

  const text = input.text.toLowerCase();
  const now = nowIso();

  const category = extractCategory(text);
  const { location, locationId } = extractLocation(text);
  const requiredCapabilities = extractCapabilities(text);
  const requiredResources = extractResources(text);
  const budget = extractBudget(text);
  const timeline = extractTimeline(text);
  const risks = extractRisks(text);
  const verificationCriteria = extractVerificationCriteria();
  const counterpartyPreferences = extractCounterpartyPreferences();
  const urgency = extractUrgency(text);
  const title = generateTitle(input.text);

  const parsed: ParsedNeed = {
    id: createId('need'),
    originalText: input.text,
    title,
    description: input.text,
    category,
    location,
    locationId,
    requiredCapabilities,
    requiredResources,
    budget,
    timeline,
    risks,
    verificationCriteria,
    counterpartyPreferences: [counterpartyPreferences],
    urgency,
    submittedBy: input.submittedBy,
    submittedAt: input.submittedAt ?? now,
    parsedAt: now,
  };

  const needs = readParsedNeeds();
  needs.push(parsed);
  writeParsedNeeds(needs);

  logAuditEvent({
    accountId: input.submittedBy,
    actorId: null,
    action: 'intention.create',
    resourceType: 'parsed-need',
    resourceId: parsed.id,
    details: { category, urgency, capabilitiesCount: requiredCapabilities.length },
  });

  return parsed;
}

function extractCategory(text: string): string {
  const categories = [
    { keywords: ['repair', 'fix', 'maintain', 'service', 'restore'], label: 'Repair & Maintenance' },
    { keywords: ['build', 'construct', 'fabricate', 'assemble', 'install'], label: 'Construction & Fabrication' },
    { keywords: ['teach', 'train', 'educate', 'mentor', 'workshop', 'course'], label: 'Education & Training' },
    { keywords: ['design', 'architect', 'plan', 'engineer', 'model'], label: 'Design & Engineering' },
    { keywords: ['research', 'analyze', 'study', 'investigate', 'survey'], label: 'Research & Analysis' },
    { keywords: ['transport', 'deliver', 'ship', 'move', 'logistics'], label: 'Transport & Logistics' },
    { keywords: ['grow', 'farm', 'cultivate', 'harvest', 'agriculture'], label: 'Agriculture & Food' },
    { keywords: ['energy', 'power', 'electricity', 'solar', 'wind', 'hydro'], label: 'Energy & Power' },
    { keywords: ['health', 'medical', 'clinic', 'hospital', 'care'], label: 'Health & Medical' },
    { keywords: ['digital', 'software', 'app', 'platform', 'data', 'ai'], label: 'Digital & Technology' },
  ];

  for (const cat of categories) {
    if (cat.keywords.some((k) => text.includes(k))) {
      return cat.label;
    }
  }
  return 'General';
}

function extractLocation(text: string): { location?: string; locationId?: string } {
  const locationKeywords = ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'thika', 'kitale', 'malindi', 'garissa', 'kakamega', 'nyeri', 'meru', 'machakos', 'kericho', 'kitui', 'bomet', 'vihiga', 'bungoma', 'siaya', 'homabay', 'migori', 'kisii', 'nyamira', 'trans nzoia', 'uashin gishu', 'elgeyo', 'nandi', 'baringo', 'laikipia', 'narok', 'kajiado'];
  
  for (const loc of locationKeywords) {
    if (text.includes(loc)) {
      return { location: loc.charAt(0).toUpperCase() + loc.slice(1), locationId: `place-${loc}` };
    }
  }
  return {};
}

function extractCapabilities(text: string): RequiredCapability[] {
  const capabilityPatterns = [
    { keywords: ['weld', 'welding', 'fabricat'], type: 'Welding & Fabrication', evidence: ['certification', 'portfolio', 'work-record'] },
    { keywords: ['carpent', 'woodwork', 'joinery'], type: 'Carpentry & Woodwork', evidence: ['certification', 'portfolio', 'work-record'] },
    { keywords: ['plumb', 'pipefit', 'piping'], type: 'Plumbing & Pipefitting', evidence: ['certification', 'license', 'work-record'] },
    { keywords: ['electr', 'wiring', 'electrical'], type: 'Electrical Work', evidence: ['certification', 'license', 'work-record'] },
    { keywords: ['mason', 'bricklay', 'blocklay', 'concrete'], type: 'Masonry & Concrete', evidence: ['certification', 'portfolio', 'work-record'] },
    { keywords: ['teach', 'train', 'instruct', 'educate'], type: 'Teaching & Training', evidence: ['certification', 'credentials', 'references'] },
    { keywords: ['mechanic', 'repair', 'mainten', 'service'], type: 'Mechanical Repair & Maintenance', evidence: ['certification', 'work-record', 'references'] },
    { keywords: ['driv', 'transport', 'logistics', 'delivery'], type: 'Driving & Transport', evidence: ['license', 'work-record', 'references'] },
    { keywords: ['farm', 'agricultur', 'cultivat', 'harvest', 'irrigat'], type: 'Agriculture & Farming', evidence: ['certification', 'work-record', 'references'] },
    { keywords: ['solar', 'renewable', 'energy', 'electrical install'], type: 'Solar & Renewable Energy Installation', evidence: ['certification', 'license', 'portfolio'] },
    { keywords: ['code', 'program', 'software', 'develop', 'web', 'app'], type: 'Software Development', evidence: ['portfolio', 'github', 'references'] },
    { keywords: ['design', 'architect', 'cad', 'model', 'draft'], type: 'Design & Architecture', evidence: ['portfolio', 'certification', 'references'] },
    { keywords: ['account', 'financ', 'bookkeep', 'audit', 'tax'], type: 'Accounting & Finance', evidence: ['certification', 'license', 'references'] },
    { keywords: ['legal', 'law', 'contract', 'compliance', 'regulator'], type: 'Legal & Compliance', evidence: ['license', 'bar-membership', 'references'] },
    { keywords: ['medic', 'nurs', 'health', 'clinical', 'patient'], type: 'Medical & Clinical', evidence: ['license', 'certification', 'references'] },
    { keywords: ['project manag', 'coordinat', 'supervis', 'lead'], type: 'Project Management & Coordination', evidence: ['certification', 'work-record', 'references'] },
  ];

  const capabilities: RequiredCapability[] = [];
  for (const pattern of capabilityPatterns) {
    if (pattern.keywords.some((k) => text.includes(k))) {
      capabilities.push({
        type: pattern.type,
        description: `Capability in ${pattern.type}`,
        evidenceTypes: pattern.evidence,
        minEvidenceStanding: 'supported',
        mandatory: true,
        weight: 1.0,
      });
    }
  }
  return capabilities;
}

function extractResources(text: string): RequiredResource[] {
  const resources: RequiredResource[] = [];
  const resourcePatterns = [
    { keywords: ['excavator', 'digger', 'backhoe'], type: 'Excavator', unit: 'hours' },
    { keywords: ['crane', 'lifting'], type: 'Crane', unit: 'hours' },
    { keywords: ['truck', 'lorry', 'tipper', 'transport'], type: 'Transport Truck', unit: 'km' },
    { keywords: ['generator', 'power supply', 'electricity'], type: 'Generator', unit: 'hours' },
    { keywords: ['compressor', 'air compressor'], type: 'Air Compressor', unit: 'hours' },
    { keywords: ['welder', 'welding machine'], type: 'Welding Machine', unit: 'hours' },
    { keywords: ['scaffold', 'scaffolding'], type: 'Scaffolding', unit: 'days' },
    { keywords: ['concrete mixer', 'mixer'], type: 'Concrete Mixer', unit: 'hours' },
    { keywords: ['survey equipment', 'total station', 'gps'], type: 'Survey Equipment', unit: 'days' },
    { keywords: ['laboratory', 'lab equipment', 'testing'], type: 'Laboratory Equipment', unit: 'hours' },
    { keywords: ['cold storage', 'refrigerat', 'freezer'], type: 'Cold Storage', unit: 'days' },
    { keywords: ['warehouse', 'storage', 'godown'], type: 'Warehouse Space', unit: 'm2' },
    { keywords: ['office space', 'office', 'workspace'], type: 'Office Space', unit: 'm2' },
    { keywords: ['land', 'plot', 'acre', 'hectare'], type: 'Land', unit: 'hectares' },
    { keywords: ['water', 'water supply', 'borehole', 'well'], type: 'Water Supply', unit: 'liters' },
    { keywords: ['fuel', 'diesel', 'petrol', 'gas'], type: 'Fuel', unit: 'liters' },
  ];

  for (const pattern of resourcePatterns) {
    if (pattern.keywords.some((k) => text.includes(k))) {
      resources.push({
        type: pattern.type,
        description: `Need ${pattern.type.toLowerCase()}`,
        unit: pattern.unit,
        mandatory: true,
      });
    }
  }
  return resources;
}

function extractBudget(text: string): BudgetRange | undefined {
  const budgetPatterns = [
    /(?:budget|cost|price|spend|pay)\s*(?:of|is|:)?\s*(?:kes|ksh|kshs|shs|sh)\s*([\d,]+)/gi,
    /(?:kes|ksh|kshs|shs|sh)\s*([\d,]+)/gi,
    /\$([\d,]+)/gi,
    /(?:budget|cost|price)\s*(?:of|is|:)?\s*([\d,]+)/gi,
  ];

  const amounts: number[] = [];
  for (const pattern of budgetPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const amount = parseInt(match[1]?.replace(/,/g, '') || '0');
      if (amount > 0) amounts.push(amount);
    }
  }

  if (amounts.length === 0) return undefined;

  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const currency = text.includes('$') ? 'USD' : 'KES';

  return {
    min: min !== max ? min : undefined,
    max: max !== min ? max : undefined,
    currency,
    flexibility: 'negotiable',
  };
}

function extractTimeline(text: string): { earliestStart?: string; latestStart?: string; latestCompletion?: string; durationWeeks?: number } | undefined {
  const timeline: { earliestStart?: string; latestStart?: string; latestCompletion?: string; durationWeeks?: number } = {};

  const durationMatch = text.match(/(\d+)\s*(?:week|wk|month|yr|year|day)s?/i);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[0].toLowerCase();
    if (unit.includes('week') || unit.includes('wk')) timeline.durationWeeks = value;
    else if (unit.includes('month')) timeline.durationWeeks = value * 4;
    else if (unit.includes('year') || unit.includes('yr')) timeline.durationWeeks = value * 52;
    else if (unit.includes('day')) timeline.durationWeeks = Math.ceil(value / 7);
  }

  const startMatch = text.match(/(?:start|begin|from)\s+(?:on\s+)?(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2})/i);
  if (startMatch) timeline.earliestStart = startMatch[1];

  const deadlineMatch = text.match(/(?:by|deadline|complete|finish|end)\s+(?:on\s+)?(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2})/i);
  if (deadlineMatch) timeline.latestCompletion = deadlineMatch[1];

  return Object.keys(timeline).length > 0 ? timeline : undefined;
}

function extractRisks(text: string): RiskItem[] {
  const risks: RiskItem[] = [];
  const riskPatterns = [
    { keywords: ['weather', 'rain', 'flood', 'storm'], category: 'technical' as const, description: 'Weather-related delays', likelihood: 'possible' as const, impact: 'moderate' as const },
    { keywords: ['permit', 'license', 'approval', 'regulation', 'compliance'], category: 'regulatory' as const, description: 'Regulatory approval delays', likelihood: 'likely' as const, impact: 'major' as const },
    { keywords: ['budget', 'cost', 'overrun', 'expensive', 'funding'], category: 'financial' as const, description: 'Budget overrun risk', likelihood: 'possible' as const, impact: 'major' as const },
    { keywords: ['skill', 'expertise', 'qualified', 'experienced', 'competent'], category: 'technical' as const, description: 'Skill gap or shortage', likelihood: 'possible' as const, impact: 'moderate' as const },
    { keywords: ['delay', 'schedule', 'timeline', 'deadline'], category: 'operational' as const, description: 'Schedule delay risk', likelihood: 'likely' as const, impact: 'moderate' as const },
    { keywords: ['safety', 'accident', 'injury', 'hazard', 'danger'], category: 'safety' as const, description: 'Safety incident risk', likelihood: 'unlikely' as const, impact: 'severe' as const },
    { keywords: ['reputation', 'public', 'community', 'stakeholder'], category: 'reputational' as const, description: 'Reputational risk', likelihood: 'possible' as const, impact: 'moderate' as const },
    { keywords: ['supplier', 'vendor', 'material', 'equipment', 'delivery'], category: 'operational' as const, description: 'Supply chain disruption', likelihood: 'possible' as const, impact: 'major' as const },
  ];

  for (const pattern of riskPatterns) {
    if (pattern.keywords.some((k) => text.includes(k))) {
      risks.push({
        id: createId('risk'),
        category: pattern.category,
        description: pattern.description,
        likelihood: pattern.likelihood,
        impact: pattern.impact,
        mitigation: `Mitigate ${pattern.description.toLowerCase()} through proactive planning`,
      });
    }
  }
  return risks;
}

function extractVerificationCriteria(): VerificationCriterion[] {
  const criteria: VerificationCriterion[] = [
    { id: createId('vc'), description: 'Work completed to specification', evidenceType: 'work-record', minEvidenceStanding: 'verified', responsibleParty: 'provider' },
    { id: createId('vc'), description: 'Quality standards met', evidenceType: 'test-result', minEvidenceStanding: 'supported', responsibleParty: 'third-party' },
    { id: createId('vc'), description: 'Safety compliance verified', evidenceType: 'certification', minEvidenceStanding: 'verified', responsibleParty: 'third-party' },
  ];
  return criteria;
}

function extractCounterpartyPreferences(): CounterpartyPreference {
  return {
    actorTypes: ['individual', 'crew', 'enterprise', 'cooperative'],
    requiredCredentials: ['relevant-certification'],
    excludedActorIds: [],
    excludedOrganizationIds: [],
  };
}

function extractUrgency(text: string): 'low' | 'normal' | 'high' | 'critical' {
  if (text.includes('urgent') || text.includes('critical') || text.includes('emergency') || text.includes('asap')) return 'critical';
  if (text.includes('soon') || text.includes('quick') || text.includes('fast') || text.includes('priority')) return 'high';
  if (text.includes('when possible') || text.includes('flexible') || text.includes('no rush')) return 'low';
  return 'normal';
}

function generateTitle(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length > 0) {
    const first = sentences[0].trim();
    return first.length > 80 ? first.substring(0, 77) + '...' : first;
  }
  return text.substring(0, 80) + (text.length > 80 ? '...' : '');
}

// ---------------------------------------------------------------------------
// Opportunity Compiler
// ---------------------------------------------------------------------------

export interface CompileOpportunityInput {
  parsedNeedId: string;
  compiledBy: string;
  authz?: AuthzContext;
}

/**
 * Compile an opportunity brief from a parsed need by searching
 * the productive reality graph for matches.
 */
export function compileOpportunity(input: CompileOpportunityInput): OpportunityBrief {
  if (input.authz) {
    requirePermission(input.authz, 'intention:write');
  }

  const needs = readParsedNeeds();
  const parsedNeed = needs.find((n) => n.id === input.parsedNeedId);
  if (!parsedNeed) throw new Error(`Parsed need ${input.parsedNeedId} not found`);

  const matches = searchRealityGraph(parsedNeed);
  matches.sort((a, b) => b.score - a.score);

  const highConfidence = matches.filter((m) => m.score >= 70);

  const brief: OpportunityBrief = {
    id: createId('brief'),
    parsedNeed,
    matches,
    summary: {
      totalMatches: matches.length,
      highConfidenceMatches: highConfidence.length,
      capacityListingsMatched: matches.filter((m) => m.matchType === 'capacity-listing').length,
      actorsMatched: matches.filter((m) => m.matchType === 'actor').length,
      assetsMatched: matches.filter((m) => m.matchType === 'asset').length,
      organizationsMatched: matches.filter((m) => m.matchType === 'organization').length,
      estimatedTimelineWeeks: parsedNeed.timeline?.durationWeeks ?? 4,
      estimatedBudgetRange: parsedNeed.budget,
      topRisks: parsedNeed.risks.slice(0, 3),
      recommendedNextSteps: generateNextSteps(parsedNeed, highConfidence),
    },
    generatedAt: nowIso(),
    generatedBy: input.compiledBy,
  };

  const briefs = readOpportunityBriefs();
  briefs.push(brief);
  writeOpportunityBriefs(briefs);

  logAuditEvent({
    accountId: input.compiledBy,
    actorId: null,
    action: 'intention.create',
    resourceType: 'opportunity-brief',
    resourceId: brief.id,
    details: { parsedNeedId: input.parsedNeedId, matchesCount: matches.length },
  });

  return brief;
}

function searchRealityGraph(need: ParsedNeed): MatchResult[] {
  const matches: MatchResult[] = [];

  matches.push(...matchCapacityListings(need));
  matches.push(...matchActors());
  matches.push(...matchAssets(need));
  matches.push(...matchOrganizations());
  matches.push(...matchCredentialHolders(need));
  matches.push(...matchCommitments());

  return matches;
}

function matchCapacityListings(need: ParsedNeed): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const capability of need.requiredCapabilities) {
    const capacityType = mapCapabilityToType(capability.type) as CapacityType | undefined;
    const listings = listCapacityListings({
      capacityType,
      status: 'available',
    });

    for (const listing of listings) {
      let score = 50;
      const rationale: MatchRationale[] = [];
      const conflicts: string[] = [];

      if (listing.capacitySubtype?.toLowerCase().includes(capability.type.toLowerCase()) ||
          capability.type.toLowerCase().includes(listing.capacitySubtype?.toLowerCase() || '')) {
        score += 25;
        rationale.push({ factor: 'Capability match', score: 25, explanation: `Listing offers ${listing.capacitySubtype || listing.capacityType}` });
      }

      if (need.budget?.max && listing.pricePerUnit <= need.budget.max) {
        score += 15;
        rationale.push({ factor: 'Price within budget', score: 15, explanation: `${listing.pricePerUnit}/${listing.priceCurrency} per ${listing.capacityUnit}` });
      }

      const match: MatchResult = {
        matchId: createId('match'),
        matchType: 'capacity-listing',
        targetId: listing.id,
        targetType: 'CapacityListing',
        targetName: listing.title,
        score: Math.min(100, score),
        rationale,
        conflicts,
        availableFrom: listing.availableFrom,
        availableTo: listing.availableTo,
        estimatedCost: listing.pricePerUnit * (listing.capacityAmount || 1),
        currency: listing.priceCurrency,
        contactPath: [
          { step: 1, action: 'request-intro', description: 'Request introduction to provider', responsibleParty: 'requester', estimatedTimeHours: 1 },
          { step: 2, action: 'send-proposal', description: 'Send detailed proposal with requirements', responsibleParty: 'requester', estimatedTimeHours: 2 },
          { step: 3, action: 'verify-credentials', description: 'Verify provider credentials and capacity', responsibleParty: 'requester', estimatedTimeHours: 4 },
          { step: 4, action: 'create-commitment', description: 'Create commitment with acceptance criteria', responsibleParty: 'system', estimatedTimeHours: 2 },
        ],
      };
      matches.push(match);
    }
  }
  return matches;
}

function matchActors(): MatchResult[] {
  const matches: MatchResult[] = [];

  const actors = listActors().filter((actor) => actor.type === 'individual' || actor.type === 'crew');

  for (const actor of actors.slice(0, 10)) {
    const score = 40;
    const rationale: MatchRationale[] = [
      { factor: 'Actor capability', score: 20, explanation: `Actor ${actor.name} may have relevant skills` },
      { factor: 'Availability', score: 20, explanation: 'Actor is available for new work' },
    ];

    matches.push({
      matchId: createId('match'),
      matchType: 'actor',
      targetId: actor.id,
      targetType: 'Actor',
      targetName: actor.name,
      score,
      rationale,
      conflicts: ['Capabilities not verified - requires credential check'],
      contactPath: [
        { step: 1, action: 'verify-credentials', description: 'Verify actor credentials for required capabilities', responsibleParty: 'requester', estimatedTimeHours: 4 },
        { step: 2, action: 'request-intro', description: 'Request introduction to actor', responsibleParty: 'requester', estimatedTimeHours: 1 },
        { step: 3, action: 'send-proposal', description: 'Send detailed proposal', responsibleParty: 'requester', estimatedTimeHours: 2 },
      ],
    });
  }
  return matches;
}

function matchAssets(need: ParsedNeed): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const resource of need.requiredResources) {
    const assets = listAssets({ status: 'active' }).filter((asset) => {
      const passport = getAssetPassport(asset.id);
      if (!passport) return false;
      const assetType = typeof asset.data.type === 'string' ? asset.data.type : '';
      return passport.capacity.currentCapacity.toLowerCase().includes(resource.type.toLowerCase()) ||
             assetType.toLowerCase().includes(resource.type.toLowerCase());
    });

    for (const asset of assets.slice(0, 5)) {
      const passport = getAssetPassport(asset.id);
      if (!passport) continue;

      const assetName = typeof asset.data.name === 'string' ? asset.data.name : 'Unnamed Asset';

      const score = 35;
      const rationale: MatchRationale[] = [
        { factor: 'Asset capacity match', score: 20, explanation: `Asset ${assetName} has relevant capacity` },
        { factor: 'Availability', score: 15, explanation: passport.utilization.currentUtilization < 0.7 ? 'Asset has available capacity' : 'Asset may have limited availability' },
      ];

      matches.push({
        matchId: createId('match'),
        matchType: 'asset',
        targetId: asset.id,
        targetType: 'Asset',
        targetName: assetName,
        score,
        rationale,
        conflicts: ['Asset custodian may not be the owner - verify authority'],
        availableFrom: new Date().toISOString(),
        availableTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        contactPath: [
          { step: 1, action: 'verify-credentials', description: 'Verify asset custodian authority', responsibleParty: 'requester', estimatedTimeHours: 2 },
          { step: 2, action: 'request-intro', description: 'Request introduction to asset custodian', responsibleParty: 'requester', estimatedTimeHours: 1 },
        ],
      });
    }
  }
  return matches;
}

function matchOrganizations(): MatchResult[] {
  const matches: MatchResult[] = [];
  const orgs = listOrganizations().slice(0, 20);

  for (const org of orgs) {
    const score = 30;
    const rationale: MatchRationale[] = [
      { factor: 'Organization capability', score: 20, explanation: `Organization ${org.name} may coordinate relevant work` },
      { factor: 'Authority', score: 10, explanation: 'Organization has mandate to engage providers' },
    ];

    matches.push({
      matchId: createId('match'),
      matchType: 'organization',
      targetId: org.id,
      targetType: 'Organization',
      targetName: org.name,
      score,
      rationale,
      conflicts: ['Organization may not be the direct provider - may need to coordinate'],
      contactPath: [
        { step: 1, action: 'request-intro', description: 'Request introduction to organization', responsibleParty: 'requester', estimatedTimeHours: 1 },
        { step: 2, action: 'schedule-meeting', description: 'Schedule coordination meeting', responsibleParty: 'system', estimatedTimeHours: 2 },
      ],
    });
  }
  return matches;
}

function matchCredentialHolders(need: ParsedNeed): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const capability of need.requiredCapabilities) {
    const credentials = getCredentialsByFamily('Capability' as any).filter((cred) =>
      cred.claims.some((c) => c.type.toLowerCase().includes(capability.type.toLowerCase()))
    );

    for (const cred of credentials.slice(0, 5)) {
      const score = 45;
      const rationale: MatchRationale[] = [
        { factor: 'Verified capability', score: 30, explanation: `Holder has verified ${cred.type} credential` },
        { factor: 'Credential standing', score: 15, explanation: `Credential status: ${cred.status}` },
      ];

      matches.push({
        matchId: createId('match'),
        matchType: 'credential-holder',
        targetId: cred.subject.actorId,
        targetType: 'Actor',
        targetName: cred.subject.actorName,
        score,
        rationale,
        conflicts: ['Credential holder may not be available - check availability'],
        contactPath: [
          { step: 1, action: 'verify-credentials', description: 'Verify credential is current and valid', responsibleParty: 'requester', estimatedTimeHours: 2 },
          { step: 2, action: 'request-intro', description: 'Request introduction to credential holder', responsibleParty: 'requester', estimatedTimeHours: 1 },
        ],
      });
    }
  }
  return matches;
}

function matchCommitments(): MatchResult[] {
  return [];
}

function mapCapabilityToType(capability: string): string {
  const mapping: Record<string, string> = {
    'Welding & Fabrication': 'machinery',
    'Carpentry & Woodwork': 'machinery',
    'Plumbing & Pipefitting': 'machinery',
    'Electrical Work': 'machinery',
    'Masonry & Concrete': 'machinery',
    'Teaching & Training': 'specialist',
    'Mechanical Repair & Maintenance': 'machinery',
    'Driving & Transport': 'transport',
    'Agriculture & Farming': 'machinery',
    'Solar & Renewable Energy Installation': 'energy',
    'Software Development': 'compute',
    'Design & Architecture': 'specialist',
    'Accounting & Finance': 'specialist',
    'Legal & Compliance': 'specialist',
    'Medical & Clinical': 'specialist',
    'Project Management & Coordination': 'specialist',
  };
  return mapping[capability] || 'specialist';
}

function generateNextSteps(need: ParsedNeed, matches: MatchResult[]): string[] {
  const steps: string[] = [];

  if (matches.length === 0) {
    steps.push('No matches found - consider broadening requirements or posting as open inquiry');
    steps.push('Post the need to Commons to attract providers');
    return steps;
  }

  const topMatch = matches[0];
  steps.push(`Review top match: ${topMatch.targetName} (score: ${topMatch.score})`);
  steps.push(`Initiate contact: ${topMatch.contactPath[0]?.description || 'Request introduction'}`);

  if (need.budget) {
    steps.push('Confirm budget alignment with matched providers');
  }

  if (need.verificationCriteria.length > 0) {
    steps.push('Define verification criteria for acceptance');
  }

  if (need.risks.some((r) => r.likelihood === 'likely' || r.likelihood === 'almost-certain')) {
    steps.push('Address high-likelihood risks in proposal');
  }

  return steps;
}

// ---------------------------------------------------------------------------
// Decision Intelligence
// ---------------------------------------------------------------------------

export interface DecisionRecommendation {
  id: string;
  type: 'capacity-acquisition' | 'capacity-monetization' | 'partnership' | 'risk-mitigation' | 'investment' | 'skill-development';
  title: string;
  description: string;
  rationale: string[];
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetActorId?: string;
  targetOrganizationId?: string;
  estimatedImpact: { metric: string; value: number; unit: string };
  estimatedCost?: number;
  estimatedTimelineWeeks: number;
  prerequisites: string[];
  createdAt: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'implemented';
}

export interface ForecastResult {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeHorizonWeeks: number;
  confidenceInterval: [number, number];
  factors: { name: string; impact: number; direction: 'positive' | 'negative' }[];
  scenario: 'conservative' | 'expected' | 'optimistic';
}

export interface GenerateRecommendationsInput {
  organizationId?: string;
  actorId?: string;
  periodFrom: string;
  periodTo: string;
  generatedBy: string;
  authz?: AuthzContext;
}

/**
 * Generate decision recommendations based on current state and forecasts.
 */
export function generateRecommendations(input: GenerateRecommendationsInput): DecisionRecommendation[] {
  if (input.authz) {
    requirePermission(input.authz, 'intelligence:read');
  }

  const recommendations: DecisionRecommendation[] = [];
  const now = nowIso();

  if (input.organizationId) {
    const gaps = analyzeCapacityGaps(input.organizationId, input.periodFrom, input.periodTo);
    for (const gap of gaps) {
      if (gap.gap < 0 && gap.underutilizedListings.length > 0) {
        recommendations.push({
          id: createId('rec'),
          type: 'capacity-monetization',
          title: `Monetize idle ${gap.capacityType} capacity`,
          description: `${gap.underutilizedListings.length} assets with ${Math.abs(gap.gap)} units of unused capacity`,
          rationale: [
            `Gap analysis shows ${Math.abs(gap.gap)} units of unmet demand`,
            `${gap.underutilizedListings.length} assets could be listed on Capacity Exchange`,
            `Potential revenue: ${gap.underutilizedListings.reduce((sum, l) => sum + l.unusedCapacity * 1000, 0).toLocaleString()} KES/month`,
          ],
          confidence: 0.8,
          priority: 'high',
          targetOrganizationId: input.organizationId,
          estimatedImpact: { metric: 'Monthly Revenue', value: Math.abs(gap.gap) * 1000, unit: 'KES' },
          estimatedCost: 50000,
          estimatedTimelineWeeks: 2,
          prerequisites: ['List assets on Capacity Exchange', 'Set competitive pricing', 'Define terms and conditions'],
          createdAt: now,
          status: 'proposed',
        });
      }
    }
  }

  if (input.organizationId) {
    const gaps = analyzeCapacityGaps(input.organizationId, input.periodFrom, input.periodTo);
    for (const gap of gaps) {
      if (gap.gap > 0 && gap.gapPercentage > 20) {
        recommendations.push({
          id: createId('rec'),
          type: 'capacity-acquisition',
          title: `Acquire ${gap.capacityType} capacity to meet demand`,
          description: `Gap of ${gap.gap} units (${gap.gapPercentage.toFixed(1)}% shortfall)`,
          rationale: [
            `${gap.unmetRequests.length} unmet requests for ${gap.capacityType}`,
            `Current available capacity: ${gap.availableCapacity}`,
            `Requested capacity: ${gap.requestedCapacity}`,
          ],
          confidence: 0.75,
          priority: gap.unmetRequests.some((r) => r.urgency === 'critical') ? 'critical' : 'high',
          targetOrganizationId: input.organizationId,
          estimatedImpact: { metric: 'Unmet Demand Reduction', value: gap.gap, unit: 'units' },
          estimatedCost: gap.gap * 5000,
          estimatedTimelineWeeks: 4,
          prerequisites: ['Post capacity requests', 'Evaluate provider proposals', 'Negotiate terms'],
          createdAt: now,
          status: 'proposed',
        });
      }
    }
  }

  return recommendations;
}

function analyzeCapacityGaps(organizationId: string, periodFrom: string, periodTo: string) {
  const requests = listCapacityRequests({ requesterOrganizationId: organizationId, neededFrom: periodFrom, neededTo: periodTo });
  const listings = listCapacityListings({ providerOrganizationId: organizationId, availableFrom: periodFrom, availableTo: periodTo });
  const bookings = listCapacityBookings({ requesterOrganizationId: organizationId, bookedFrom: periodFrom, bookedTo: periodTo });

  const byType = new Map<string, { requests: typeof requests; listings: typeof listings; bookings: typeof bookings }>();

  for (const r of requests) {
    if (!byType.has(r.capacityType)) byType.set(r.capacityType, { requests: [], listings: [], bookings: [] });
    byType.get(r.capacityType)!.requests.push(r);
  }
  for (const l of listings) {
    if (!byType.has(l.capacityType)) byType.set(l.capacityType, { requests: [], listings: [], bookings: [] });
    byType.get(l.capacityType)!.listings.push(l);
  }
  for (const b of bookings) {
    if (!byType.has(b.capacityType)) byType.set(b.capacityType, { requests: [], listings: [], bookings: [] });
    byType.get(b.capacityType)!.bookings.push(b);
  }

  const gaps: { organizationId: string; period: { from: string; to: string }; capacityType: string; requestedCapacity: number; availableCapacity: number; bookedCapacity: number; gap: number; gapPercentage: number; unmetRequests: typeof requests; underutilizedListings: { listingId: string; assetId: string; unusedCapacity: number }[]; recommendedActions: string[] }[] = [];

  for (const [capacityType, data] of byType) {
    const requestedCapacity = data.requests.reduce((sum, r) => sum + r.quantityNeeded, 0);
    const availableCapacity = data.listings.reduce((sum, l) => sum + l.capacityAmount, 0);
    const bookedCapacity = data.bookings.reduce((sum, b) => sum + b.bookedAmount, 0);
    const gap = requestedCapacity - availableCapacity;
    const gapPercentage = availableCapacity > 0 ? (gap / availableCapacity) * 100 : (gap > 0 ? 100 : 0);

    const unmetRequests = data.requests.filter((r) => r.status === 'open' || r.status === 'matched');

    const underutilizedListings = data.listings
      .map((l) => {
        const listingBookings = data.bookings.filter((b) => b.listingId === l.id);
        const bookedAmount = listingBookings.reduce((sum, b) => sum + b.bookedAmount, 0);
        const unusedCapacity = l.capacityAmount - bookedAmount;
        return { listingId: l.id, assetId: l.assetId, unusedCapacity };
      })
      .filter((u) => u.unusedCapacity > 0)
      .sort((a, b) => b.unusedCapacity - a.unusedCapacity);

    const recommendedActions: string[] = [];
    if (gap > 0) {
      recommendedActions.push(`Acquire or partner for additional ${capacityType} capacity (gap: ${gap} units)`);
      recommendedActions.push('Post capacity requests to the exchange to find external providers');
    }
    if (underutilizedListings.length > 0) {
      recommendedActions.push(`List ${underutilizedListings.length} underutilized assets on the capacity exchange`);
      recommendedActions.push('Consider leasing out idle capacity to generate revenue');
    }
    if (data.requests.some((r) => r.urgency === 'critical' || r.urgency === 'high')) {
      recommendedActions.push('Prioritize critical/high-urgency requests in matching');
    }

    gaps.push({
      organizationId,
      period: { from: periodFrom, to: periodTo },
      capacityType,
      requestedCapacity,
      availableCapacity,
      bookedCapacity,
      gap,
      gapPercentage,
      unmetRequests,
      underutilizedListings,
      recommendedActions,
    });
  }

  return gaps;
}