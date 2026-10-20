import type { StudioDataset } from '@/lib/workbench/dataset';
import type {
  ApplicationRecord,
  AssetRecord,
  CapabilityBadgeRecord,
  CapitalIntentRecord,
  RoleRecord,
  RollRecordEntry,
  SourceResult,
  StudioRecord,
} from '@/lib/workbench/types';
import { recordKey } from '@/lib/workbench/types';
import type { WorkspaceContextOption } from '@/lib/workspace';

const crew = [
  { id: 'crew-1', displayName: 'Anchor (identity private)', role: 'anchor' as const, organization: 'Hub' },
  { id: 'crew-2', displayName: 'Builder (identity private)', role: 'builder' as const, organization: 'Hub' },
  { id: 'crew-3', displayName: 'Apprentice (identity private)', role: 'apprentice' as const, organization: 'Hub' },
];

export const openAsset: AssetRecord = {
  kind: 'asset',
  id: 'asset-open',
  title: 'Solar kitchen kit',
  slug: 'solar-kitchen',
  status: 'open',
  isIllustrative: false,
  summary: 'A repairable solar kitchen for a school.',
  issuer: 'Learning Hub',
  location: 'Machakos County, Kenya',
  category: 'energy',
  currency: 'KES',
  buildCostMinor: 1_000_00,
  fundingTargetMinor: 1_000_00,
  signaledAmountMinor: 0,
  settledAmountMinor: 0,
  capitalState: 'unfunded',
  projectedAnnualYieldMinor: null,
  crew,
  blueprint: {
    id: 'blueprint-1',
    version: 1,
    hash: 'hash:open',
    lines: [{ id: 'line-1', item: 'Cooker assembly', quantity: 1, unit: 'unit', unitCostMinor: 1_000_00 }],
  },
  anchorSignOff: null,
  hasDossier: true,
  viewerRelation: 'member',
};

export const deployedAsset: AssetRecord = {
  ...openAsset,
  id: 'asset-deployed',
  title: 'Community radio studio',
  slug: 'community-radio-studio',
  status: 'deployed',
  buildCostMinor: 2_000_00,
  fundingTargetMinor: 2_000_00,
  signaledAmountMinor: 2_000_00,
  settledAmountMinor: 2_000_00,
  capitalState: 'fully_capitalized',
  anchorSignOff: {
    crewMemberId: 'crew-1',
    blueprintId: 'blueprint-2',
    blueprintHash: 'hash:deployed',
    signedAt: '2026-10-01T00:00:00.000Z',
  },
  blueprint: {
    id: 'blueprint-2',
    version: 2,
    hash: 'hash:deployed',
    lines: [{ id: 'line-2', item: 'Booth frame', quantity: 1, unit: 'build', unitCostMinor: 2_000_00 }],
  },
  hasDossier: false,
};

export const illustrativeAsset: AssetRecord = {
  ...openAsset,
  id: 'asset-illustrative',
  title: 'School Console',
  slug: 'school-console',
  isIllustrative: true,
};

export const role: RoleRecord = {
  kind: 'role',
  id: 'role-1',
  title: 'Embedded systems builder',
  assetId: 'asset-open',
  assetName: 'Solar kitchen kit',
  assetSlug: 'solar-kitchen',
  description: 'Design a repairable temperature controller.',
  skillTags: ['Firmware'],
  applicationCount: 2,
  createdAt: '2026-10-02T00:00:00.000Z',
};

export const ownApplication: ApplicationRecord = {
  kind: 'application',
  id: 'application-own',
  roleId: 'role-1',
  roleTitle: 'Embedded systems builder',
  assetId: 'asset-open',
  assetName: 'Solar kitchen kit',
  note: 'I build repairable controllers and can document the test plan.',
  status: 'submitted',
  createdAt: '2026-10-03T00:00:00.000Z',
  applicantLabel: 'Your application',
  applicantIdentityExposed: false,
  isOwn: true,
  deploymentTier: 'New builder',
  deployedAssetCount: 0,
  capabilityBadgeCount: 0,
  sharedBadges: [],
};

export const reviewableApplication: ApplicationRecord = {
  kind: 'application',
  id: 'application-reviewable',
  roleId: 'role-1',
  roleTitle: 'Embedded systems builder',
  assetId: 'asset-open',
  assetName: 'Solar kitchen kit',
  note: 'I would like to help with the field testing plan.',
  status: 'submitted',
  createdAt: '2026-10-04T00:00:00.000Z',
  applicantLabel: 'Applicant (profile shared privately)',
  applicantIdentityExposed: false,
  isOwn: false,
  deploymentTier: 'Tier 1',
  deployedAssetCount: 1,
  capabilityBadgeCount: 1,
  sharedBadges: [
    { assetName: 'Community radio studio', role: 'builder', issuedAt: '2026-10-01T00:00:00.000Z', blueprintHash: 'hash:deployed' },
  ],
};

export const ownIntent: CapitalIntentRecord = {
  kind: 'capital_intent',
  id: 'intent-own',
  tenderId: 'asset-open',
  assetName: 'Solar kitchen kit',
  amountMinor: 25_000,
  currency: 'KES',
  status: 'SIGNALED',
  createdAt: '2026-10-05T00:00:00.000Z',
  relation: 'own',
  counterpartyLabel: 'Your capital intent',
};

export const thirdPartyIntent: CapitalIntentRecord = {
  kind: 'capital_intent',
  id: 'intent-issuer',
  tenderId: 'asset-open',
  assetName: 'Solar kitchen kit',
  amountMinor: 40_000,
  currency: 'KES',
  status: 'SIGNALED',
  createdAt: '2026-10-06T00:00:00.000Z',
  relation: 'issuer',
  counterpartyLabel: "Another participant's intent (identity not exposed)",
};

export const rollRecord: RollRecordEntry = {
  kind: 'roll',
  id: 'roll-1',
  tenderId: 'asset-deployed',
  assetName: 'Community radio studio',
  deployedAt: '2026-10-01T00:00:00.000Z',
  blueprintId: 'blueprint-2',
  blueprintHash: 'hash:deployed',
  anchorCrewMemberId: 'crew-1',
  anchorSignedAt: '2026-10-01T00:00:00.000Z',
  crew,
  blueprintLines: [{ id: 'line-2', item: 'Booth frame', quantity: 1, unit: 'build', unitCostMinor: 2_000_00 }],
  currency: 'KES',
  buildCostMinor: 2_000_00,
};

export const badge: CapabilityBadgeRecord = {
  kind: 'capability_badge',
  id: 'badge-1',
  tenderId: 'asset-deployed',
  rollRecordId: 'roll-1',
  assetName: 'Community radio studio',
  role: 'builder',
  issuedAt: '2026-10-01T00:00:00.000Z',
  blueprintHash: 'hash:deployed',
  verifiedByCrewMemberId: 'crew-1',
  verifiedAt: '2026-10-01T00:00:00.000Z',
  deploymentCount: 1,
};

export const crewContext: WorkspaceContextOption = {
  key: 'crew:asset-open:builder',
  kind: 'crew',
  label: 'Solar kitchen kit',
  role: 'builder',
  organizationId: 'org-1',
  tenderId: 'asset-open',
  tenderSlug: 'solar-kitchen',
  tenderStatus: 'open',
  assetName: 'Solar kitchen kit',
  isIllustrative: false,
};

export const networkContext: WorkspaceContextOption = {
  key: 'network',
  kind: 'network',
  label: 'APT-LABS Network',
  role: 'member',
  organizationId: null,
  tenderId: null,
  tenderSlug: null,
  tenderStatus: null,
  assetName: null,
  isIllustrative: false,
};

function ok<T>(data: T, label: string): SourceResult<T> {
  const length = Array.isArray(data) ? data.length : 0;
  return { status: length ? 'ok' : 'empty', data, error: null, label };
}

export interface FixtureOptions {
  records?: StudioRecord[];
  context?: WorkspaceContextOption | null;
  localMode?: boolean;
  sources?: Partial<StudioDataset['sources']>;
}

export function makeDataset(options: FixtureOptions = {}): StudioDataset {
  const records = options.records ?? [
    openAsset,
    deployedAsset,
    illustrativeAsset,
    role,
    ownApplication,
    reviewableApplication,
    ownIntent,
    thirdPartyIntent,
    rollRecord,
    badge,
  ];
  const base: StudioDataset['sources'] = {
    assets: ok(records.filter(record => record.kind === 'asset') as AssetRecord[], 'Published Asset register'),
    roll: ok(records.filter(record => record.kind === 'roll') as RollRecordEntry[], 'Public Roll'),
    roles: ok(records.filter(record => record.kind === 'role') as RoleRecord[], 'Open roles'),
    applications: ok(records.filter(record => record.kind === 'application') as ApplicationRecord[], 'Applications'),
    capitalIntents: ok(records.filter(record => record.kind === 'capital_intent') as CapitalIntentRecord[], 'Capital intents'),
    capabilityBadges: ok(records.filter(record => record.kind === 'capability_badge') as CapabilityBadgeRecord[], 'Your capability proofs'),
    commonsPosts: ok([], 'Commons activity'),
    contextAssets: ok([], 'Asset named by your context'),
  };
  return {
    principal: {
      userId: 'user-1',
      email: 'maker@example.test',
      localMode: options.localMode ?? false,
      configured: !options.localMode,
      publicNameConsent: false,
    },
    context: options.context === undefined ? crewContext : options.context,
    invalidContext: false,
    sources: { ...base, ...options.sources },
    records,
  };
}

export function keyOf(record: StudioRecord): string {
  return recordKey(record.kind, record.id);
}
