export const tenderStatuses = [
  'draft',
  'open',
  'capitalized_pending_settlement',
  'materials',
  'fabrication',
  'anchor_signed',
  'deployed',
  'cancelled',
] as const;

export type TenderStatus = (typeof tenderStatuses)[number];

export function isTenderStatus(value: string): value is TenderStatus {
  return tenderStatuses.some(status => status === value);
}

export type TenderCategory =
  | 'education'
  | 'energy'
  | 'media'
  | 'agriculture'
  | 'infrastructure'
  | 'software';

export type CrewRole = 'anchor' | 'builder' | 'apprentice';

export interface CrewMember {
  id: string;
  displayName: string;
  role: CrewRole;
  organization: string;
}

export interface BlueprintLine {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  unitCostMinor: number;
}

export interface Blueprint {
  id: string;
  version: number;
  currency: string;
  lines: BlueprintLine[];
  hash: string;
}

export interface FundingAllocation {
  id: string;
  funder: string;
  amountMinor: number;
  currency: string;
  basis: 'illustrative' | 'verified';
}

export interface AnchorSignOff {
  crewMemberId: string;
  blueprintId: string;
  blueprintHash: string;
  signedAt: string;
}

export interface Tender {
  id: string;
  slug: string;
  assetName: string;
  summary: string;
  description: string;
  category: TenderCategory;
  location: string;
  issuer: string;
  currency: string;
  assetBuildCostMinor: number;
  fundingTargetMinor: number;
  currentSignaledAmountMinor: number;
  currentSettledAmountMinor: number;
  projectedAnnualYieldMinor: number | null;
  localSpendPercentage: number | null;
  crewWageAllocationMinor: Record<CrewRole, number> | null;
  economicModelNote: string | null;
  status: TenderStatus;
  isIllustrative: boolean;
  sourceTenderId?: string;
  crew: CrewMember[];
  blueprint: Blueprint;
  funders: FundingAllocation[];
  anchorSignOff?: AnchorSignOff;
}

export type CapitalAllocationState =
  | 'unfunded'
  | 'soft_committed'
  | 'awaiting_settlement'
  | 'partially_settled'
  | 'fully_capitalized';

export function capitalAllocationState(
  tender: Pick<Tender, 'fundingTargetMinor' | 'currentSignaledAmountMinor' | 'currentSettledAmountMinor'>,
): CapitalAllocationState {
  if (tender.fundingTargetMinor > 0 && tender.currentSettledAmountMinor >= tender.fundingTargetMinor) {
    return 'fully_capitalized';
  }
  if (tender.currentSettledAmountMinor > 0) return 'partially_settled';
  if (tender.fundingTargetMinor > 0 && tender.currentSignaledAmountMinor >= tender.fundingTargetMinor) {
    return 'awaiting_settlement';
  }
  if (tender.currentSignaledAmountMinor > 0) return 'soft_committed';
  return 'unfunded';
}

export interface RollRecord {
  id: string;
  tenderId: string;
  assetName: string;
  assetBuildCostMinor: number;
  currency: string;
  crew: CrewMember[];
  blueprintLines: BlueprintLine[];
  blueprintId: string;
  blueprintHash: string;
  anchorSignOff: AnchorSignOff;
  deployedAt: string;
}

export interface TenderCatalog {
  tenders: Tender[];
  roll: RollRecord[];
}

export class TenderInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenderInvariantError';
  }
}

const lineTotal = (line: BlueprintLine) => line.quantity * line.unitCostMinor;

export function validateCatalog(catalog: TenderCatalog): void {
  const tendersById = new Map<string, Tender>();
  const slugs = new Set<string>();
  const blueprintIds = new Set<string>();
  const lineIds = new Set<string>();
  const crewIds = new Set<string>();
  const allocationIds = new Set<string>();
  const rollIds = new Set<string>();

  for (const tender of catalog.tenders) {
    if (tendersById.has(tender.id)) {
      throw new TenderInvariantError(`Duplicate Tender id: ${tender.id}`);
    }
    if (slugs.has(tender.slug)) {
      throw new TenderInvariantError(`Duplicate Tender slug: ${tender.slug}`);
    }
    if (!/^[A-Z]{3}$/.test(tender.currency)) {
      throw new TenderInvariantError(`Invalid currency for ${tender.slug}`);
    }
    tendersById.set(tender.id, tender);
    slugs.add(tender.slug);

    if (!Number.isSafeInteger(tender.assetBuildCostMinor) || tender.assetBuildCostMinor <= 0) {
      throw new TenderInvariantError(`Invalid asset build cost for ${tender.slug}`);
    }
    if (!Number.isSafeInteger(tender.fundingTargetMinor) || tender.fundingTargetMinor < 0) {
      throw new TenderInvariantError(`Invalid funding target for ${tender.slug}`);
    }
    if (
      !Number.isSafeInteger(tender.currentSignaledAmountMinor) ||
      tender.currentSignaledAmountMinor < 0 ||
      !Number.isSafeInteger(tender.currentSettledAmountMinor) ||
      tender.currentSettledAmountMinor < 0 ||
      tender.currentSettledAmountMinor > tender.currentSignaledAmountMinor
    ) {
      throw new TenderInvariantError(`Invalid capital allocation totals for ${tender.slug}`);
    }
    if (tender.projectedAnnualYieldMinor !== null &&
      (!Number.isSafeInteger(tender.projectedAnnualYieldMinor) || tender.projectedAnnualYieldMinor < 0)) {
      throw new TenderInvariantError(`Invalid projected annual yield for ${tender.slug}`);
    }
    if (tender.localSpendPercentage !== null &&
      (!Number.isFinite(tender.localSpendPercentage) || tender.localSpendPercentage < 0 || tender.localSpendPercentage > 100)) {
      throw new TenderInvariantError(`Invalid local capital retention percentage for ${tender.slug}`);
    }
    if (tender.crewWageAllocationMinor !== null) {
      const allocation = tender.crewWageAllocationMinor;
      const total = allocation.anchor + allocation.builder + allocation.apprentice;
      if (
        !Number.isSafeInteger(allocation.anchor) || allocation.anchor < 0 ||
        !Number.isSafeInteger(allocation.builder) || allocation.builder < 0 ||
        !Number.isSafeInteger(allocation.apprentice) || allocation.apprentice < 0 ||
        !Number.isSafeInteger(total) || total > tender.assetBuildCostMinor
      ) {
        throw new TenderInvariantError(`Invalid crew wage allocation for ${tender.slug}`);
      }
    }
    if ((tender.projectedAnnualYieldMinor === null) !== (tender.economicModelNote === null)) {
      throw new TenderInvariantError(`Projected annual yield requires a model note for ${tender.slug}`);
    }
    if (blueprintIds.has(tender.blueprint.id)) {
      throw new TenderInvariantError(`Duplicate Blueprint id: ${tender.blueprint.id}`);
    }
    blueprintIds.add(tender.blueprint.id);
    if (tender.currency !== tender.blueprint.currency) {
      throw new TenderInvariantError(`Tender and Blueprint currencies differ for ${tender.slug}`);
    }
    const localLineIds = new Set<string>();
    const total = tender.blueprint.lines.reduce((sum, line) => {
      if (
        lineIds.has(line.id) ||
        localLineIds.has(line.id) ||
        !Number.isFinite(line.quantity) ||
        line.quantity <= 0 ||
        !Number.isSafeInteger(line.unitCostMinor) ||
        line.unitCostMinor < 0 ||
        !Number.isSafeInteger(lineTotal(line))
      ) {
        throw new TenderInvariantError(`Invalid Blueprint line for ${tender.slug}`);
      }
      lineIds.add(line.id);
      localLineIds.add(line.id);
      return sum + lineTotal(line);
    }, 0);
    if (total !== tender.assetBuildCostMinor) {
      throw new TenderInvariantError(`Blueprint total does not match asset build cost for ${tender.slug}`);
    }
    for (const role of ['anchor', 'builder', 'apprentice'] as const) {
      if (tender.crew.filter(member => member.role === role).length !== 1) {
        throw new TenderInvariantError(`Tender ${tender.slug} must have exactly one ${role}`);
      }
    }
    for (const member of tender.crew) {
      if (crewIds.has(member.id)) throw new TenderInvariantError(`Duplicate CrewMember id: ${member.id}`);
      crewIds.add(member.id);
    }
    for (const funder of tender.funders) {
      if (
        allocationIds.has(funder.id) ||
        funder.currency !== tender.currency ||
        !Number.isSafeInteger(funder.amountMinor) ||
        funder.amountMinor < 0 ||
        (funder.basis === 'verified' && tender.isIllustrative)
      ) {
        throw new TenderInvariantError(`Invalid funding data for ${tender.slug}`);
      }
      allocationIds.add(funder.id);
    }
  }

  for (const tender of catalog.tenders) {
    if (tender.sourceTenderId && (!tendersById.has(tender.sourceTenderId) || tender.sourceTenderId === tender.id)) {
      throw new TenderInvariantError(`Unknown source Tender for ${tender.slug}`);
    }
  }

  const rollTenderIds = new Set<string>();
  for (const record of catalog.roll) {
    if (rollIds.has(record.id) || rollTenderIds.has(record.tenderId)) {
      throw new TenderInvariantError(`Duplicate Roll record for Tender ${record.tenderId}`);
    }
    rollIds.add(record.id);
    rollTenderIds.add(record.tenderId);
    const tender = tendersById.get(record.tenderId);
    const blueprintMatches = tender !== undefined &&
      Array.isArray(record.blueprintLines) &&
      record.blueprintLines.length === tender.blueprint.lines.length &&
      record.blueprintLines.every((line, index) => {
        const expected = tender.blueprint.lines[index];
        return line.id === expected.id &&
          line.item === expected.item &&
          line.quantity === expected.quantity &&
          line.unit === expected.unit &&
          line.unitCostMinor === expected.unitCostMinor;
      });
    if (
      !tender ||
      tender.isIllustrative ||
      tender.status !== 'deployed' ||
      !blueprintMatches ||
      record.currency !== tender.currency ||
      record.blueprintId !== tender.blueprint.id ||
      record.blueprintHash !== tender.blueprint.hash ||
      record.assetBuildCostMinor !== tender.assetBuildCostMinor ||
      record.anchorSignOff.crewMemberId !== tender.crew.find(member => member.role === 'anchor')?.id ||
      record.anchorSignOff.blueprintId !== tender.blueprint.id ||
      record.anchorSignOff.blueprintHash !== tender.blueprint.hash
    ) {
      throw new TenderInvariantError(`Roll record must reference a real deployed Tender`);
    }
  }
}

export function fundedPercent(tender: Tender): number {
  const allocated = tender.funders.reduce((sum, funder) => sum + funder.amountMinor, 0);
  if (tender.fundingTargetMinor <= 0) return 0;
  return Math.min(100, Math.floor((allocated / tender.fundingTargetMinor) * 100));
}

export function capitalEfficiencyPercent(tender: Pick<Tender, 'assetBuildCostMinor' | 'projectedAnnualYieldMinor'>): number | null {
  if (tender.projectedAnnualYieldMinor === null || tender.assetBuildCostMinor <= 0) return null;
  return Math.round((tender.projectedAnnualYieldMinor / tender.assetBuildCostMinor) * 1000) / 10;
}

export interface TenderLifecycle {
  status: TenderStatus;
  permitted: TenderStatus[];
  gate: string | null;
  awaitingSettlement: boolean;
}

// The lifecycle is owned by the domain, not by any surface that renders it.
// `transitionTender` and the Studio read this one description so the interface
// can never advertise a transition the engine would refuse.
export function tenderLifecycle(
  tender: Pick<Tender, 'status' | 'currentSettledAmountMinor' | 'fundingTargetMinor'>,
): TenderLifecycle {
  const settlementReached = tender.fundingTargetMinor > 0
    && tender.currentSettledAmountMinor >= tender.fundingTargetMinor;
  switch (tender.status) {
    case 'open':
      return {
        status: tender.status,
        permitted: settlementReached ? ['materials'] : [],
        gate: settlementReached
          ? null
          : 'Settled capital must reach the funding target before materials are released.',
        awaitingSettlement: !settlementReached,
      };
    case 'materials':
      return { status: tender.status, permitted: ['fabrication'], gate: null, awaitingSettlement: false };
    case 'fabrication':
      return { status: tender.status, permitted: ['anchor_signed'], gate: null, awaitingSettlement: false };
    case 'anchor_signed':
      return { status: tender.status, permitted: ['deployed'], gate: null, awaitingSettlement: false };
    default:
      return { status: tender.status, permitted: [], gate: null, awaitingSettlement: false };
  }
}

export function transitionTender(
  tender: Tender,
  nextStatus: TenderStatus,
  actorCrewMemberId: string,
  now: string,
): { tender: Tender; rollRecord?: RollRecord } {
  const actor = tender.crew.find(member => member.id === actorCrewMemberId);
  if (!actor) throw new TenderInvariantError('Only assigned crew may advance an Assembly.');

  if (!tenderLifecycle(tender).permitted.includes(nextStatus)) {
    throw new TenderInvariantError(`Cannot transition Tender from ${tender.status} to ${nextStatus}.`);
  }
  if (nextStatus === 'anchor_signed') {
    if (actor.role !== 'anchor') {
      throw new TenderInvariantError('Only the assigned Anchor can sign off.');
    }
    return {
      tender: {
        ...tender,
        status: 'anchor_signed',
        anchorSignOff: {
          crewMemberId: actor.id,
          blueprintId: tender.blueprint.id,
          blueprintHash: tender.blueprint.hash,
          signedAt: now,
        },
      },
    };
  }
  if (nextStatus === 'deployed') {
    const signOff = tender.anchorSignOff;
    if (
      tender.isIllustrative ||
      actor.role !== 'anchor' ||
      !signOff ||
      signOff.crewMemberId !== actor.id ||
      signOff.blueprintId !== tender.blueprint.id ||
      signOff.blueprintHash !== tender.blueprint.hash
    ) {
      throw new TenderInvariantError('A valid assigned-Anchor sign-off on the active Blueprint is required.');
    }
    const deployedTender = { ...tender, status: 'deployed' as const };
    return {
      tender: deployedTender,
      rollRecord: {
        id: `roll:${tender.id}`,
        tenderId: tender.id,
        assetName: tender.assetName,
        assetBuildCostMinor: tender.assetBuildCostMinor,
        currency: tender.currency,
        crew: tender.crew.map(member => ({ ...member })),
        blueprintLines: tender.blueprint.lines.map(line => ({ ...line })),
        blueprintId: tender.blueprint.id,
        blueprintHash: tender.blueprint.hash,
        anchorSignOff: { ...signOff },
        deployedAt: now,
      },
    };
  }
  return { tender: { ...tender, status: nextStatus } };
}
