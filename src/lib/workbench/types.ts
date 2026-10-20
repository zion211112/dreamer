import type {
  AnchorSignOff,
  BlueprintLine,
  CapitalAllocationState,
  CrewMember,
  CrewRole,
  TenderStatus,
} from '@/lib/tender';

// ---------------------------------------------------------------------------
// Per-source status
// ---------------------------------------------------------------------------

// A source that failed must never look like a source that is simply empty.
// `unavailable` means the data plane is not reachable for this principal
// (local development identity, no configured project). `denied` means the
// server refused the read. `empty` means the read succeeded and there is
// genuinely nothing.
export type SourceStatus = 'ok' | 'empty' | 'unavailable' | 'denied' | 'error';

export interface SourceResult<T> {
  status: SourceStatus;
  data: T;
  error: string | null;
  label: string;
}

export function sourceStatusText(status: SourceStatus): string {
  switch (status) {
    case 'ok':
      return 'Loaded';
    case 'empty':
      return 'Loaded · no records';
    case 'unavailable':
      return 'Not available to this session';
    case 'denied':
      return 'Not permitted for this account';
    case 'error':
      return 'Could not be loaded';
  }
}

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

export type StudioRecordKind =
  | 'asset'
  | 'role'
  | 'application'
  | 'roll'
  | 'capital_intent'
  | 'capability_badge';

export const studioRecordKinds: readonly StudioRecordKind[] = [
  'asset',
  'role',
  'application',
  'roll',
  'capital_intent',
  'capability_badge',
];

export function isStudioRecordKind(value: string): value is StudioRecordKind {
  return (studioRecordKinds as readonly string[]).includes(value);
}

export type StudioRecordKey = string;

export function recordKey(kind: StudioRecordKind, id: string): StudioRecordKey {
  return `${kind}:${id}`;
}

export function parseRecordKey(value: string): { kind: StudioRecordKind; id: string } | null {
  const separator = value.indexOf(':');
  if (separator <= 0) return null;
  const kind = value.slice(0, separator);
  const id = value.slice(separator + 1);
  if (!id) return null;
  if (!isStudioRecordKind(kind)) return null;
  return { kind, id };
}
// How the current principal stands in relation to a record. It is a view of
// the relationship, never a grant of permission.
export type ViewerRelation = 'assigned_crew' | 'funder' | 'issuer' | 'member' | 'none';

export interface AssetBlueprint {
  id: string;
  version: number;
  hash: string;
  lines: BlueprintLine[];
}

export interface AssetRecord {
  kind: 'asset';
  id: string;
  title: string;
  slug: string | null;
  status: TenderStatus;
  isIllustrative: boolean;
  summary: string;
  issuer: string;
  location: string;
  category: string;
  currency: string;
  buildCostMinor: number;
  fundingTargetMinor: number;
  signaledAmountMinor: number;
  settledAmountMinor: number;
  capitalState: CapitalAllocationState;
  projectedAnnualYieldMinor: number | null;
  crew: CrewMember[];
  blueprint: AssetBlueprint | null;
  anchorSignOff: AnchorSignOff | null;
  // A deployed Asset has no dossier route: `/tenders/[slug]` reads the market
  // view, which excludes deployed Tenders. The Roll is its destination.
  hasDossier: boolean;
  viewerRelation: ViewerRelation;
}

export interface RoleRecord {
  kind: 'role';
  id: string;
  title: string;
  assetId: string | null;
  assetName: string | null;
  assetSlug: string | null;
  description: string;
  skillTags: string[];
  applicationCount: number;
  createdAt: string;
}

export interface SharedBadgeSummary {
  assetName: string;
  role: CrewRole;
  issuedAt: string;
  blueprintHash: string;
}

export interface ApplicationRecord {
  kind: 'application';
  id: string;
  roleId: string;
  roleTitle: string;
  assetId: string | null;
  assetName: string | null;
  note: string;
  status: 'submitted' | 'reviewed' | 'declined';
  createdAt: string;
  applicantLabel: string;
  applicantIdentityExposed: boolean;
  isOwn: boolean;
  deploymentTier: string | null;
  deployedAssetCount: number;
  capabilityBadgeCount: number;
  sharedBadges: SharedBadgeSummary[];
}

export interface RollRecordEntry {
  kind: 'roll';
  id: string;
  tenderId: string;
  assetName: string;
  deployedAt: string;
  blueprintId: string;
  blueprintHash: string;
  anchorCrewMemberId: string;
  anchorSignedAt: string;
  crew: CrewMember[];
  blueprintLines: BlueprintLine[];
  currency: string;
  buildCostMinor: number;
}

export type IntentRelation = 'own' | 'issuer';

export interface CapitalIntentRecord {
  kind: 'capital_intent';
  id: string;
  tenderId: string;
  assetName: string | null;
  amountMinor: number;
  currency: string;
  status: 'SIGNALED' | 'WITHDRAWN' | 'SETTLED_OFFLINE';
  createdAt: string;
  relation: IntentRelation;
  counterpartyLabel: string;
}

export interface CapabilityBadgeRecord {
  kind: 'capability_badge';
  id: string;
  tenderId: string;
  rollRecordId: string;
  assetName: string | null;
  role: CrewRole;
  issuedAt: string;
  blueprintHash: string | null;
  // The verifier of a capability proof is the Anchor sign-off on the Roll
  // record, never a self-declared skill score.
  verifiedByCrewMemberId: string | null;
  verifiedAt: string | null;
  deploymentCount: number;
}

export type StudioRecord =
  | AssetRecord
  | RoleRecord
  | ApplicationRecord
  | RollRecordEntry
  | CapitalIntentRecord
  | CapabilityBadgeRecord;

export function isAssetRecord(record: StudioRecord): record is AssetRecord {
  return record.kind === 'asset';
}

export function isRoleRecord(record: StudioRecord): record is RoleRecord {
  return record.kind === 'role';
}

export function isApplicationRecord(record: StudioRecord): record is ApplicationRecord {
  return record.kind === 'application';
}

export function isRollRecord(record: StudioRecord): record is RollRecordEntry {
  return record.kind === 'roll';
}

export function isCapitalIntentRecord(record: StudioRecord): record is CapitalIntentRecord {
  return record.kind === 'capital_intent';
}

export function isCapabilityBadgeRecord(record: StudioRecord): record is CapabilityBadgeRecord {
  return record.kind === 'capability_badge';
}

export function recordTitle(record: StudioRecord): string {
  switch (record.kind) {
    case 'asset':
      return record.title;
    case 'role':
      return record.title;
    case 'application':
      return `Application · ${record.roleTitle}`;
    case 'roll':
      return record.assetName;
    case 'capital_intent':
      return record.assetName ?? 'Capital intent';
    case 'capability_badge':
      return record.assetName ?? 'Capability proof';
  }
}

export function recordSubtitle(record: StudioRecord): string {
  switch (record.kind) {
    case 'asset':
      return record.issuer;
    case 'role':
      return record.assetName ?? 'Asset not resolved';
    case 'application':
      return record.isOwn ? 'Your application' : record.applicantLabel;
    case 'roll':
      return 'Anchor-verified deployment';
    case 'capital_intent':
      return record.counterpartyLabel;
    case 'capability_badge':
      return `${record.role} · verified deployment`;
  }
}

// The status a record actually carries. An illustrative record never shows a
// lifecycle status as if it were live work.
export function recordStatusLabel(record: StudioRecord): string {
  switch (record.kind) {
    case 'asset':
      return record.isIllustrative ? 'ILLUSTRATIVE' : record.status.replace('_', ' ');
    case 'role':
      return 'open role';
    case 'application':
      return record.status;
    case 'roll':
      return 'deployed';
    case 'capital_intent':
      return record.status === 'SIGNALED'
        ? 'signalled'
        : record.status === 'SETTLED_OFFLINE'
          ? 'settled offline'
          : 'withdrawn';
    case 'capability_badge':
      return 'proof issued';
  }
}

// ---------------------------------------------------------------------------
// Relationship taxonomy
// ---------------------------------------------------------------------------

// `persisted` is backed by a stored relationship or an authoritative data
// contract. `derived`, `suggested` and `navigation` are modelled so the
// taxonomy is explicit, but iteration 1 ships persisted edges only.
export type RelationCategory = 'persisted' | 'derived' | 'suggested' | 'navigation';

// A relation node is either a dataset record or a persisted sub-record of one
// (the active Blueprint, the assigned crew). Sub-records are never
// selectable records: they are reached through their parent.
export type RelationNodeKind = StudioRecordKind | 'blueprint' | 'crew';

export type RelationNodeKey = string;

export interface RelationEdge {
  id: string;
  from: RelationNodeKey;
  to: RelationNodeKey;
  category: RelationCategory;
  label: string;
  basis: string;
}

export interface RelationNode {
  key: RelationNodeKey;
  kind: RelationNodeKind;
  title: string;
  subtitle: string;
  status: string | null;
  isIllustrative: boolean;
  emphasis: 'focus' | 'related';
}

// The list rendering of the relations. It is the accessible equivalent of the
// graph and always carries the same information.
export interface RelationLink {
  edge: RelationEdge;
  node: RelationNode;
}

export interface StudioRelations {
  nodes: RelationNode[];
  edges: RelationEdge[];
  links: RelationLink[];
}

// ---------------------------------------------------------------------------
// Queues and actions
// ---------------------------------------------------------------------------

export interface StudioQueue {
  id: string;
  title: string;
  hint: string;
  recordKeys: StudioRecordKey[];
  emptyTitle: string;
  emptyReason: string;
}

export type StudioActionKind = 'server' | 'navigation' | 'focus';

export type StudioServerAction = 'apply' | 'review' | 'publish' | 'signal';

export interface StudioAction {
  id: string;
  label: string;
  kind: StudioActionKind;
  href: string | null;
  serverAction: StudioServerAction | null;
  payload: Record<string, string>;
  available: boolean;
  blockedReason: string | null;
  disclosure: string | null;
}

export type StudioFocusKind = StudioRecordKind | 'queue' | 'chooser';

export interface StudioFocus {
  kind: StudioFocusKind;
  key: string | null;
  requested: string | null;
  invalid: boolean;
  reason: string;
}
