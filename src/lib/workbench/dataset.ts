import 'server-only';

import { z } from 'zod';

import { isLocalAuthEnabled } from '@/lib/auth-mode';
import { getCommonsActivity, getCommonsIdentityState, type CommonsPost } from '@/lib/commons';
import { getCommonsOpportunities, getVisibleOpportunityApplications } from '@/lib/opportunities';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { capitalAllocationState, type Tender, type TenderStatus } from '@/lib/tender';
import { getMarketTenders, getPublicRoll } from '@/lib/tender-repository';
import type { WorkspaceContextOption } from '@/lib/workspace';
import {
  type ApplicationRecord,
  type AssetRecord,
  type CapabilityBadgeRecord,
  type CapitalIntentRecord,
  type RoleRecord,
  type RollRecordEntry,
  type SourceResult,
  type SourceStatus,
  type StudioRecord,
} from './types';
import { recordKey } from './types';

const tenderStatuses = [
  'draft',
  'open',
  'capitalized_pending_settlement',
  'materials',
  'fabrication',
  'anchor_signed',
  'deployed',
  'cancelled',
] as const;

const minorUnitsSchema = z.coerce.number().int().safe().nonnegative();

const categorySchema = z.enum(['education', 'energy', 'media', 'agriculture', 'infrastructure', 'software']);

const contextTenderSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  slug: z.string(),
  asset_name: z.string(),
  summary: z.string(),
  description: z.string(),
  category: categorySchema,
  location: z.string(),
  currency: z.string(),
  funding_target_minor: minorUnitsSchema,
  target_amount_minor: minorUnitsSchema,
  status: z.enum(tenderStatuses),
  is_illustrative: z.boolean(),
  asset_build_cost_minor: minorUnitsSchema,
  current_signaled_amount_minor: minorUnitsSchema,
  current_settled_amount_minor: minorUnitsSchema,
  projected_annual_yield_minor: minorUnitsSchema.nullable(),
});

const blueprintRowSchema = z.object({
  id: z.string().uuid(),
  version: z.coerce.number(),
  content_hash: z.string(),
  is_active: z.boolean(),
});

const blueprintLineRowSchema = z.object({
  id: z.string().uuid(),
  item: z.string(),
  quantity: z.coerce.number(),
  unit: z.string(),
  unit_cost_minor: minorUnitsSchema,
});

const capitalIntentRowSchema = z.object({
  id: z.string().uuid(),
  tender_id: z.string().uuid(),
  amount_minor: minorUnitsSchema,
  currency: z.string(),
  status: z.enum(['SIGNALED', 'WITHDRAWN', 'SETTLED_OFFLINE']),
  created_at: z.string(),
});

const capabilityBadgeRowSchema = z.object({
  id: z.string().uuid(),
  tender_id: z.string().uuid(),
  roll_record_id: z.string().uuid(),
  crew_member_id: z.string().uuid(),
  role: z.enum(['anchor', 'builder', 'apprentice']),
  issued_at: z.string(),
});

export interface StudioPrincipal {
  userId: string | null;
  email: string | null;
  localMode: boolean;
  configured: boolean;
  publicNameConsent: boolean;
}

export interface StudioSources {
  assets: SourceResult<AssetRecord[]>;
  roll: SourceResult<RollRecordEntry[]>;
  roles: SourceResult<RoleRecord[]>;
  applications: SourceResult<ApplicationRecord[]>;
  capitalIntents: SourceResult<CapitalIntentRecord[]>;
  capabilityBadges: SourceResult<CapabilityBadgeRecord[]>;
  commonsPosts: SourceResult<CommonsPost[]>;
  contextAssets: SourceResult<AssetRecord[]>;
}

export interface StudioDataset {
  principal: StudioPrincipal;
  context: WorkspaceContextOption | null;
  invalidContext: boolean;
  sources: StudioSources;
  records: StudioRecord[];
}

function sourceErrorStatus(error: { code?: string } | null): SourceStatus {
  if (!error) return 'ok';
  if (error.code === '42501') return 'denied';
  return 'error';
}

function unavailable<T>(label: string, reason: string): SourceResult<T> {
  return { status: 'unavailable', data: [] as T, error: reason, label };
}

// A read that fails must not take the Studio down with it, and it must never
// be presented as an empty result.
async function readSource<T>(
  reader: () => Promise<T>,
  label: string,
  fallback: T,
): Promise<{ data: T; error: string | null }> {
  try {
    const data = await reader();
    return { data, error: null };
  } catch (error) {
    return {
      data: fallback,
      error: `${label} could not be loaded: ${error instanceof Error ? error.message : 'unknown error'}`,
    };
  }
}

function viewerRelationFor(
  context: WorkspaceContextOption | null,
  tenderId: string,
): AssetRecord['viewerRelation'] {
  if (!context) return 'none';
  if (context.tenderId !== tenderId) return 'member';
  if (context.kind === 'crew') return 'assigned_crew';
  if (context.kind === 'funder') return 'funder';
  if (context.kind === 'school') return 'issuer';
  return 'member';
}

function assetFromTender(
  tender: Tender,
  context: WorkspaceContextOption | null,
): AssetRecord {
  return {
    kind: 'asset',
    id: tender.id,
    title: tender.assetName,
    slug: tender.slug,
    status: tender.status,
    isIllustrative: tender.isIllustrative,
    summary: tender.summary,
    issuer: tender.issuer,
    location: tender.location,
    category: tender.category,
    currency: tender.currency,
    buildCostMinor: tender.assetBuildCostMinor,
    fundingTargetMinor: tender.fundingTargetMinor,
    signaledAmountMinor: tender.currentSignaledAmountMinor,
    settledAmountMinor: tender.currentSettledAmountMinor,
    capitalState: capitalAllocationState(tender),
    projectedAnnualYieldMinor: tender.projectedAnnualYieldMinor,
    crew: tender.crew,
    blueprint: {
      id: tender.blueprint.id,
      version: tender.blueprint.version,
      hash: tender.blueprint.hash,
      lines: tender.blueprint.lines,
    },
    anchorSignOff: tender.anchorSignOff ?? null,
    // The market view excludes deployed Tenders, so a deployed Asset has no
    // dossier route to link to.
    hasDossier: tender.status !== 'deployed',
    viewerRelation: viewerRelationFor(context, tender.id),
  };
}

function rollFromRecord(record: {
  id: string;
  tenderId: string;
  assetName: string;
  assetBuildCostMinor: number;
  currency: string;
  crew: RollRecordEntry['crew'];
  blueprintLines: RollRecordEntry['blueprintLines'];
  blueprintId: string;
  blueprintHash: string;
  anchorSignOff: { crewMemberId: string; signedAt: string };
  deployedAt: string;
}): RollRecordEntry {
  return {
    kind: 'roll',
    id: record.id,
    tenderId: record.tenderId,
    assetName: record.assetName,
    deployedAt: record.deployedAt,
    blueprintId: record.blueprintId,
    blueprintHash: record.blueprintHash,
    anchorCrewMemberId: record.anchorSignOff.crewMemberId,
    anchorSignedAt: record.anchorSignOff.signedAt,
    crew: record.crew,
    blueprintLines: record.blueprintLines,
    currency: record.currency,
    buildCostMinor: record.assetBuildCostMinor,
  };
}

// ---------------------------------------------------------------------------
// New read accessors. None of these writes, and none of them changes the
// schema or the mutation semantics.
// ---------------------------------------------------------------------------

/**
 * Capital intents the current principal may see.
 *
 * `capital_intents` row-level security lets the owner read their own rows and
 * lets an authorized issuer of the Asset's organization read them too. The
 * accessor therefore returns two relations and never selects `user_id`: the
 * identity of a third-party participant is not exposed by the application.
 */
async function getPrincipalCapitalIntents(
  userId: string,
): Promise<SourceResult<CapitalIntentRecord[]>> {
  const label = 'Capital intents';
  const supabase = await createSupabaseServerClient();
  const own = await supabase
    .from('capital_intents')
    .select('id,tender_id,amount_minor,currency,status,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (own.error) {
    return {
      status: sourceErrorStatus(own.error),
      data: [],
      error: `Your capital intents could not be loaded: ${own.error.message}`,
      label,
    };
  }
  const thirdParty = await supabase
    .from('capital_intents')
    .select('id,tender_id,amount_minor,currency,status,created_at')
    .neq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (thirdParty.error) {
    return {
      status: sourceErrorStatus(thirdParty.error),
      data: [],
      error: `Visible capital intents could not be loaded: ${thirdParty.error.message}`,
      label,
    };
  }

  const ownRows = z.array(capitalIntentRowSchema).parse(own.data ?? []);
  const issuerRows = z.array(capitalIntentRowSchema).parse(thirdParty.data ?? []);
  const records: CapitalIntentRecord[] = [
    ...ownRows.map(row => ({
      kind: 'capital_intent' as const,
      id: row.id,
      tenderId: row.tender_id,
      assetName: null,
      amountMinor: row.amount_minor,
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      relation: 'own' as const,
      counterpartyLabel: 'Your capital intent',
    })),
    ...issuerRows.map(row => ({
      kind: 'capital_intent' as const,
      id: row.id,
      tenderId: row.tender_id,
      assetName: null,
      amountMinor: row.amount_minor,
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      relation: 'issuer' as const,
      counterpartyLabel: "Another participant's intent (identity not exposed)",
    })),
  ];
  return {
    status: records.length ? 'ok' : 'empty',
    data: records,
    error: null,
    label,
  };
}

/**
 * The current principal's own capability proofs.
 *
 * `roll_capability_badges` is readable by the member alone, so a member
 * without public-name consent still sees their own proofs even though the
 * public Roll views return nothing for them.
 */
async function getOwnCapabilityBadges(
  userId: string,
  roll: RollRecordEntry[],
): Promise<SourceResult<CapabilityBadgeRecord[]>> {
  const label = 'Your capability proofs';
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from('roll_capability_badges')
    .select('id,tender_id,roll_record_id,crew_member_id,role,issued_at')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })
    .limit(200);
  if (result.error) {
    return {
      status: sourceErrorStatus(result.error),
      data: [],
      error: `Your capability proofs could not be loaded: ${result.error.message}`,
      label,
    };
  }
  const rows = z.array(capabilityBadgeRowSchema).parse(result.data ?? []);
  const rollById = new Map(roll.map(entry => [entry.id, entry]));
  const deploymentCount = new Set(rows.map(row => row.roll_record_id)).size;
  const records = rows.map(row => {
    const rollEntry = rollById.get(row.roll_record_id);
    return {
      kind: 'capability_badge' as const,
      id: row.id,
      tenderId: row.tender_id,
      rollRecordId: row.roll_record_id,
      assetName: rollEntry?.assetName ?? null,
      role: row.role,
      issuedAt: row.issued_at,
      blueprintHash: rollEntry?.blueprintHash ?? null,
      // The verifier of a proof is the Anchor sign-off carried by the Roll.
      verifiedByCrewMemberId: rollEntry?.anchorCrewMemberId ?? null,
      verifiedAt: rollEntry?.anchorSignedAt ?? null,
      deploymentCount,
    };
  });
  return {
    status: records.length ? 'ok' : 'empty',
    data: records,
    error: null,
    label,
  };
}

/**
 * A narrow read of one Tender by id.
 *
 * `public_market_tenders` excludes draft, cancelled and deployed Tenders, yet
 * a crew or funder context can point at a deployed Tender. The `tenders` table
 * is publicly selectable for published rows, so a narrow read resolves the
 * reference without opening the whole table to the client.
 */
async function getTenderById(
  tenderId: string,
): Promise<{ tender: z.infer<typeof contextTenderSchema> | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from('tenders')
    .select('id,organization_id,slug,asset_name,summary,description,category,location,currency,funding_target_minor,target_amount_minor,status,is_illustrative,asset_build_cost_minor,current_signaled_amount_minor,current_settled_amount_minor,projected_annual_yield_minor')
    .eq('id', tenderId)
    .maybeSingle();
  if (result.error) return { tender: null, error: `Tender ${tenderId} could not be read: ${result.error.message}` };
  if (!result.data) return { tender: null, error: null };
  const parsed = contextTenderSchema.safeParse(result.data);
  if (!parsed.success) return { tender: null, error: 'The referenced Tender returned an invalid shape.' };
  return { tender: parsed.data, error: null };
}

async function getTenderBlueprint(tenderId: string): Promise<AssetRecord['blueprint']> {
  const supabase = await createSupabaseServerClient();
  const blueprints = await supabase
    .from('blueprints')
    .select('id,version,content_hash,is_active')
    .eq('tender_id', tenderId)
    .eq('is_active', true)
    .maybeSingle();
  if (blueprints.error || !blueprints.data) return null;
  const blueprint = blueprintRowSchema.safeParse(blueprints.data);
  if (!blueprint.success) return null;
  const lines = await supabase
    .from('blueprint_lines')
    .select('id,item,quantity,unit,unit_cost_minor')
    .eq('blueprint_id', blueprint.data.id)
    .order('id');
  if (lines.error) return null;
  const parsedLines = z.array(blueprintLineRowSchema).safeParse(lines.data ?? []);
  if (!parsedLines.success) return null;
  return {
    id: blueprint.data.id,
    version: blueprint.data.version,
    hash: blueprint.data.content_hash,
    lines: parsedLines.data.map(line => ({
      id: line.id,
      item: line.item,
      quantity: line.quantity,
      unit: line.unit,
      unitCostMinor: line.unit_cost_minor,
    })),
  };
}

async function getOrganizationName(organizationId: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .maybeSingle();
  if (result.error || !result.data) return 'Organization not exposed';
  return typeof result.data.name === 'string' ? result.data.name : 'Organization not exposed';
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export interface AssembleDatasetInput {
  context: WorkspaceContextOption | null;
  invalidContext: boolean;
  email: string | null;
  localMode: boolean;
  configured: boolean;
}

export async function assembleStudioDataset(
  input: AssembleDatasetInput,
): Promise<StudioDataset> {
  const localMode = input.localMode || isLocalAuthEnabled();
  const configured = hasSupabaseConfiguration();
  const live = configured && !localMode;

  const [tendersResult, rollResult, opportunitiesResult, commonsResult, identityResult] = await Promise.all([
    readSource(getMarketTenders, 'Published Asset register', []),
    readSource(getPublicRoll, 'Public Roll', []),
    readSource(getCommonsOpportunities, 'Open roles', { configured: false, opportunities: [], error: null }),
    readSource(getCommonsActivity, 'Commons activity', { configured: false, data: [], error: null }),
    readSource(getCommonsIdentityState, 'Commons identity', {
      configured: false,
      authenticated: false,
      contributor: false,
      moderator: false,
      contributorRequestsOpen: false,
      requestStatus: null,
      email: null,
      displayName: '',
      publicNameConsent: false,
      error: null,
    }),
  ]);

  const assets: AssetRecord[] = tendersResult.data.map(tender => assetFromTender(tender, input.context));

  const roll: RollRecordEntry[] = rollResult.data.map(record => rollFromRecord(record));
  const rollByTender = new Map(roll.map(entry => [entry.tenderId, entry]));

  const opportunityData = opportunitiesResult.data;
  const roles: RoleRecord[] = opportunityData.opportunities.map(opportunity => ({
    kind: 'role',
    id: opportunity.id,
    title: opportunity.role_title,
    assetId: opportunity.tender_id,
    assetName: opportunity.asset_name,
    assetSlug: opportunity.asset_slug,
    description: opportunity.description,
    skillTags: opportunity.skill_tags,
    applicationCount: opportunity.application_count,
    createdAt: opportunity.created_at,
  }));

  const userId = live ? await resolveUserId() : null;

  const [applications, capitalIntents, capabilityBadges] = await Promise.all([
    loadApplications(roles, live),
    userId && live
      ? getPrincipalCapitalIntents(userId)
      : unavailable<CapitalIntentRecord[]>(
          'Capital intents',
          'Capital intents are shared records. The local identity has no server-verified account to read them with.',
        ),
    userId && live
      ? getOwnCapabilityBadges(userId, roll)
      : unavailable<CapabilityBadgeRecord[]>(
          'Your capability proofs',
          'Capability proofs are issued against the connected project. The local identity has none.',
        ),
  ]);

  // Capital intents carry no display name; the Asset name is resolved from
  // the records already in hand rather than from the participant.
  const assetNameById = new Map(assets.map(asset => [asset.id, asset.title]));
  for (const intent of capitalIntents.data) {
    intent.assetName = assetNameById.get(intent.tenderId) ?? rollByTender.get(intent.tenderId)?.assetName ?? null;
  }

  const contextAssets = await loadContextAssets({
    context: input.context,
    assets,
    live,
  });

  const commonsData = commonsResult.data;
  const sources: StudioSources = {
    assets: {
      status: tendersResult.error ? 'error' : 'ok',
      data: assets,
      error: tendersResult.error,
      label: live
        ? 'Published Asset register'
        : 'Illustrative Asset catalogue (no live register connected)',
    },
    roll: live
      ? {
          status: rollResult.error ? 'error' : roll.length ? 'ok' : 'empty',
          data: roll,
          error: rollResult.error,
          label: 'Public Roll',
        }
      : unavailable<RollRecordEntry[]>(
          'Public Roll',
          'The Roll is written to the connected project. The local identity has no Roll records.',
        ),
    roles: opportunityData.configured
      ? {
          status: opportunityData.error ? 'error' : roles.length ? 'ok' : 'empty',
          data: roles,
          error: opportunityData.error,
          label: 'Open roles',
        }
      : unavailable<RoleRecord[]>(
          'Open roles',
          'Open roles are published to the connected project. The local identity has none.',
        ),
    applications,
    capitalIntents,
    capabilityBadges,
    commonsPosts: commonsData.configured
      ? {
          status: commonsResult.error ? 'error' : commonsData.data?.length ? 'ok' : 'empty',
          data: commonsData.data ?? [],
          error: commonsData.error ?? commonsData.error,
          label: 'Commons activity',
        }
      : unavailable<CommonsPost[]>(
          'Commons activity',
          'Commons activity is read from the connected project. The local identity has none.',
        ),
    contextAssets,
  };

  const records: StudioRecord[] = [
    ...assets,
    ...contextAssets.data,
    ...roles,
    ...applications.data,
    ...capitalIntents.data,
    ...capabilityBadges.data,
    ...roll,
  ];

  return {
    principal: {
      userId,
      email: input.email,
      localMode,
      configured,
      publicNameConsent: identityResult.data.publicNameConsent,
    },
    context: input.context,
    invalidContext: input.invalidContext,
    sources,
    records,
  };
}

async function resolveUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

async function loadApplications(
  roles: RoleRecord[],
  live: boolean,
): Promise<SourceResult<ApplicationRecord[]>> {
  const label = 'Applications';
  if (!live) {
    return unavailable<ApplicationRecord[]>(
      label,
      'Applications are shared records. The local identity has no server-verified account to read them with.',
    );
  }
  if (!roles.length) {
    return { status: 'empty', data: [], error: null, label };
  }
  let visible: Awaited<ReturnType<typeof getVisibleOpportunityApplications>>;
  try {
    visible = await getVisibleOpportunityApplications(roles.map(role => role.id));
  } catch (error) {
    return {
      status: 'error',
      data: [],
      error: `Visible applications could not be loaded: ${error instanceof Error ? error.message : 'unknown error'}`,
      label,
    };
  }
  const roleById = new Map(roles.map(role => [role.id, role]));
  const records: ApplicationRecord[] = visible.map(application => {
    const role = roleById.get(application.opportunity_id);
    return {
      kind: 'application',
      id: application.id,
      roleId: application.opportunity_id,
      roleTitle: role?.title ?? 'Role',
      assetId: role?.assetId ?? null,
      assetName: role?.assetName ?? null,
      note: application.note,
      status: application.status,
      createdAt: application.created_at,
      // The applicant name is only shown when the applicant consented to share
      // their Roll profile with this Asset's issuer.
      applicantLabel: application.profileIsPublic ? application.applicantName : 'Applicant (profile shared privately)',
      applicantIdentityExposed: application.profileIsPublic,
      isOwn: application.isOwn,
      deploymentTier: application.rank,
      deployedAssetCount: application.deployedAssetCount,
      capabilityBadgeCount: application.capabilityBadgeCount,
      sharedBadges: application.capabilityBadges.map(badge => ({
        assetName: badge.asset_name,
        role: badge.role,
        issuedAt: badge.issued_at,
        blueprintHash: badge.blueprint_hash,
      })),
    };
  });
  return {
    status: records.length ? 'ok' : 'empty',
    data: records,
    error: null,
    label,
  };
}

async function loadContextAssets(input: {
  context: WorkspaceContextOption | null;
  assets: AssetRecord[];
  live: boolean;
}): Promise<SourceResult<AssetRecord[]>> {
  const label = 'Asset named by your context';
  const tenderId = input.context?.tenderId;
  if (!tenderId) {
    return { status: 'empty', data: [], error: null, label };
  }
  const known = input.assets.find(asset => asset.id === tenderId);
  if (known) {
    return { status: 'ok', data: [known], error: null, label };
  }
  if (!input.live) {
    return unavailable<AssetRecord[]>(
      label,
      'This context names an Asset that only exists in the connected project.',
    );
  }
  const { tender, error } = await getTenderById(tenderId);
  if (error) {
    return { status: 'error', data: [], error, label };
  }
  if (!tender) {
    return {
      status: 'empty',
      data: [],
      error: null,
      label,
    };
  }
  const [blueprint, issuer, roll] = await Promise.all([
    getTenderBlueprint(tender.id),
    getOrganizationName(tender.organization_id),
    readRollForTender(tender.id),
  ]);
  const fundingTarget = tender.target_amount_minor > 0
    ? tender.target_amount_minor
    : tender.funding_target_minor;
  const record: AssetRecord = {
    kind: 'asset',
    id: tender.id,
    title: tender.asset_name,
    slug: tender.slug,
    status: tender.status as TenderStatus,
    isIllustrative: tender.is_illustrative,
    summary: tender.summary,
    issuer,
    location: tender.location,
    category: tender.category,
    currency: tender.currency,
    buildCostMinor: tender.asset_build_cost_minor,
    fundingTargetMinor: fundingTarget,
    signaledAmountMinor: tender.current_signaled_amount_minor,
    settledAmountMinor: tender.current_settled_amount_minor,
    capitalState: capitalAllocationState({
      fundingTargetMinor: fundingTarget,
      currentSignaledAmountMinor: tender.current_signaled_amount_minor,
      currentSettledAmountMinor: tender.current_settled_amount_minor,
    }),
    projectedAnnualYieldMinor: tender.projected_annual_yield_minor,
    crew: roll?.crew ?? [],
    blueprint,
    anchorSignOff: roll
      ? {
          crewMemberId: roll.anchorCrewMemberId,
          blueprintId: roll.blueprintId,
          blueprintHash: roll.blueprintHash,
          signedAt: roll.anchorSignedAt,
        }
      : null,
    hasDossier: tender.status !== 'deployed',
    viewerRelation: viewerRelationFor(input.context, tender.id),
  };
  return { status: 'ok', data: [record], error: null, label };
}

const rollSnapshotRowSchema = z.object({
  id: z.string().uuid(),
  tender_id: z.string().uuid(),
  asset_name: z.string(),
  asset_build_cost_minor: minorUnitsSchema,
  currency: z.string(),
  crew_snapshot: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(['anchor', 'builder', 'apprentice']),
    organization: z.string(),
  })),
  blueprint_snapshot: z.array(z.object({
    id: z.string(),
    item: z.string(),
    quantity: z.coerce.number(),
    unit: z.string(),
    unit_cost_minor: minorUnitsSchema,
  })),
  blueprint_id: z.string(),
  blueprint_hash: z.string(),
  anchor_crew_member_id: z.string(),
  anchor_signed_at: z.string(),
  deployed_at: z.string(),
});

async function readRollForTender(tenderId: string): Promise<RollRecordEntry | null> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from('public_roll_records')
    .select('id,tender_id,asset_name,asset_build_cost_minor,currency,crew_snapshot,blueprint_snapshot,blueprint_id,blueprint_hash,anchor_crew_member_id,anchor_signed_at,deployed_at')
    .eq('tender_id', tenderId)
    .maybeSingle();
  if (result.error || !result.data) return null;
  const parsed = rollSnapshotRowSchema.safeParse(result.data);
  if (!parsed.success) return null;
  const row = parsed.data;
  return {
    kind: 'roll',
    id: row.id,
    tenderId: row.tender_id,
    assetName: row.asset_name,
    deployedAt: row.deployed_at,
    blueprintId: row.blueprint_id,
    blueprintHash: row.blueprint_hash,
    anchorCrewMemberId: row.anchor_crew_member_id,
    anchorSignedAt: row.anchor_signed_at,
    crew: row.crew_snapshot.map(member => ({
      id: member.id,
      displayName: member.name,
      role: member.role,
      organization: member.organization,
    })),
    blueprintLines: row.blueprint_snapshot.map(line => ({
      id: line.id,
      item: line.item,
      quantity: line.quantity,
      unit: line.unit,
      unitCostMinor: line.unit_cost_minor,
    })),
    currency: row.currency,
    buildCostMinor: row.asset_build_cost_minor,
  };
}

export function findRecord(dataset: StudioDataset, key: string): StudioRecord | undefined {
  return dataset.records.find(record => recordKey(record.kind, record.id) === key);
}
