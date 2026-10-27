import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { getWorkspaceContext } from '@/lib/workspace-access';

// Type definitions (fully inlined to avoid import/export issues)
interface PrincipalProfile {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  configured: boolean;
  localMode: boolean;
}

interface TaskQueue {
  id: string;
  title: string;
  hint: string;
  recordKeys: string[];
  emptyTitle: string;
  emptyReason: string;
}

// Properly typed record interfaces to avoid 'unknown' issues
interface AssetRecord {
  kind: 'asset';
  id: string;
  title: string;
  slug: string | null;
  status: string;
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
  capitalState: string;
  projectedAnnualYieldMinor: number | null;
  crew: Array<{ id: string; name: string; role: string; avatarUrl: string | null }>;
  blueprint: { id: string; version: number; hash: string; lines: Array<{ type: string; description: string; quantity: number; unit: string; estimatedCostMinor: number }> } | null;
  anchorSignOff: { crewMemberId: string; signedAt: string } | null;
  hasDossier: boolean;
  viewerRelation: string;
}

interface RoleRecord {
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

interface ApplicationRecord {
  kind: 'application';
  id: string;
  roleId: string;
  roleTitle: string;
  assetId: string | null;
  assetName: string | null;
  note: string;
  status: string;
  createdAt: string;
  applicantLabel: string;
  applicantIdentityExposed: boolean;
  isOwn: boolean;
  deploymentTier: string | null;
  deployedAssetCount: number;
  capabilityBadgeCount: number;
  sharedBadges: Array<{ assetName: string; role: string; issuedAt: string; blueprintHash: string }>;
}

interface RollRecord {
  kind: 'roll';
  id: string;
  tenderId: string;
  assetName: string;
  deployedAt: string;
  blueprintId: string;
  blueprintHash: string;
  anchorCrewMemberId: string;
  anchorSignedAt: string;
  crew: Array<{ id: string; name: string; role: string; avatarUrl: string | null }>;
  blueprintLines: Array<{ type: string; description: string; quantity: number; unit: string; estimatedCostMinor: number }>;
  currency: string;
  buildCostMinor: number;
}

interface CapitalIntentRecord {
  kind: 'capital_intent';
  id: string;
  tenderId: string;
  assetName: string | null;
  amountMinor: number;
  currency: string;
  status: string;
  createdAt: string;
  relation: string;
  counterpartyLabel: string;
}

interface CapabilityBadgeRecord {
  kind: 'capability_badge';
  id: string;
  tenderId: string;
  rollRecordId: string;
  assetName: string | null;
  role: string;
  issuedAt: string;
  blueprintHash: string | null;
  verifiedByCrewMemberId: string | null;
  verifiedAt: string | null;
  deploymentCount: number;
}

type StudioRecord = AssetRecord | RoleRecord | ApplicationRecord | RollRecord | CapitalIntentRecord | CapabilityBadgeRecord;

interface StudioDataset {
  principal: PrincipalProfile;
  invalidContext: boolean;
  records: StudioRecord[];
  queues: TaskQueue[];
}

interface StudioDerivation {
  contextKey: string;
  contextLabel: string;
  view: 'assets' | 'commons' | 'roll';
  focus: FocusState;
  focusedRecord: StudioRecord | null;
  focusedQueue: TaskQueue | null;
  chooser: ChooserEntry[];
  actions: StudioAction[];
  relations: RelationsView;
  nextStep: string | null;
}

type FocusKind = 'none' | 'record' | 'queue';

interface FocusState {
  kind: FocusKind;
  key: string | null;
  invalid: boolean;
  reason: string;
}

interface ChooserEntry {
  key: string;
  kind: 'record' | 'queue';
  title: string;
  subtitle: string;
}

interface StudioAction {
  key: string;
  label: string;
  href: string | null;
  available: boolean;
  reason: string | null;
}

interface RelationsView {
  links: RelationLink[];
}

interface RelationLink {
  type: string;
  targetKey: string;
  targetTitle: string;
}

// GET /api/workspace/studio?context=&view=&focus=
// Returns { dataset, derivation } for the Studio workspace.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const contextKey = searchParams.get('context') ?? '';
  const view = (searchParams.get('view') as 'assets' | 'commons' | 'roll') ?? 'assets';
  const focus = searchParams.get('focus');

  if (!hasSupabaseConfiguration()) {
    // Return a minimal demo dataset for local development
    const demoDataset = getDemoDataset();
    const demoDerivation = deriveStudioView(demoDataset, contextKey, view, focus);
    return NextResponse.json({ dataset: demoDataset, derivation: demoDerivation });
  }

  try {
    await getWorkspaceContext();
    
    const supabase = await createSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Auth error: ${authError.message}`);
    if (!auth.user) throw new Error('Not authenticated');

    const dataset = await buildStudioDataset(supabase, auth.user.id, contextKey);
    const derivation = deriveStudioView(dataset, contextKey, view, focus);

    return NextResponse.json({ dataset, derivation });
  } catch (error) {
    console.error('Studio API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load workspace' },
      { status: 500 }
    );
  }
}

// Inline the functions to avoid import issues
async function buildStudioDataset(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  _contextKey: string,
): Promise<StudioDataset> {
  // This is a simplified implementation - in reality this would fetch from Supabase
  // For now, return a minimal dataset structure
  return {
    principal: {
      userId,
      email: '',
      displayName: null,
      avatarUrl: null,
      configured: true,
      localMode: false,
    },
    invalidContext: false,
    records: [],
    queues: [],
  };
}

function deriveStudioView(
  dataset: StudioDataset,
  contextKey: string,
  view: 'assets' | 'commons' | 'roll',
  focusKey: string | null,
): StudioDerivation {
  const laneKinds: Record<'assets' | 'commons' | 'roll', string[]> = {
    assets: ['asset', 'capital_intent'],
    commons: ['role', 'application'],
    roll: ['roll', 'capability_badge'],
  };

  const kinds = laneKinds[view];
  const scopedRecords = dataset.records.filter(r => kinds.includes(r.kind));

  let focus: StudioDerivation['focus'] = { kind: 'none', key: null, invalid: false, reason: '' };
  let focusedRecord: StudioDerivation['focusedRecord'] = null;
  let focusedQueue: StudioDerivation['focusedQueue'] = null;

  if (focusKey) {
    if (focusKey.startsWith('queue:')) {
      const queueId = focusKey.slice(6);
      const queue = dataset.queues.find(q => q.id === queueId);
      if (queue) {
        focus = { kind: 'queue', key: focusKey, invalid: false, reason: '' };
        focusedQueue = queue;
      } else {
        focus = { kind: 'none', key: null, invalid: true, reason: `Queue not found: ${queueId}` };
      }
    } else {
      const record = dataset.records.find(r => `${r.kind}:${r.id}` === focusKey);
      if (record && kinds.includes(record.kind)) {
        focus = { kind: 'record', key: focusKey, invalid: false, reason: '' };
        focusedRecord = record;
      } else {
        focus = { kind: 'none', key: null, invalid: true, reason: 'Record not found or not in current scope' };
      }
    }
  }

  // Build chooser entries
  const chooser: ChooserEntry[] = [
    ...dataset.queues.map(q => ({
      key: `queue:${q.id}`,
      kind: 'queue' as const,
      title: q.title,
      subtitle: q.hint,
    })),
    ...scopedRecords.slice(0, 10).map(r => {
      let title: string;
      let subtitle: string;
      switch (r.kind) {
        case 'asset':
          title = r.title;
          subtitle = r.issuer;
          break;
        case 'role':
          title = r.title;
          subtitle = r.assetName ?? '';
          break;
        case 'application':
          title = r.roleTitle;
          subtitle = r.isOwn ? 'Your application' : r.applicantLabel;
          break;
        case 'roll':
          title = r.assetName;
          subtitle = 'Anchor-verified deployment';
          break;
        case 'capital_intent':
          title = r.assetName ?? 'Capital Intent';
          subtitle = r.counterpartyLabel;
          break;
        case 'capability_badge':
          title = r.assetName ?? 'Capability Badge';
          subtitle = `${r.role} · verified`;
          break;
      }
      return {
        key: `${r.kind}:${r.id}`,
        kind: 'record' as const,
        title,
        subtitle,
      };
    }),
  ];

  // Build actions for focused record
  const actions: StudioAction[] = focusedRecord ? buildActions(dataset, focusedRecord) : [];

  // Build relations
  const relations = buildRelations(dataset, focusedRecord);

  // Context label
  const contextLabel = contextKey || 'Public';

  // Next step hint
  let nextStep: string | null = null;
  if (focus.kind === 'none') {
    nextStep = 'Select a record from the radar or a queue to begin.';
  } else if (focus.invalid) {
    nextStep = focus.reason;
  } else if (focusedRecord) {
    const primaryAction = actions.find(a => a.available);
    nextStep = primaryAction ? primaryAction.label : 'No permitted actions for this record.';
  }

  return {
    contextKey,
    contextLabel,
    view,
    focus,
    focusedRecord,
    focusedQueue,
    chooser,
    actions,
    relations,
    nextStep,
  };
}

function buildActions(dataset: StudioDataset, record: StudioRecord): StudioAction[] {
  const actions: StudioAction[] = [];

  switch (record.kind) {
    case 'asset':
      if (!record.isIllustrative && record.hasDossier) {
        actions.push({ key: 'dossier', label: 'Open dossier', href: `/tenders/${record.slug}`, available: true, reason: null });
      }
      if (record.status === 'deployed') {
        actions.push({ key: 'roll', label: 'Open Roll record', href: `/roll/${record.id}`, available: true, reason: null });
      }
      if (record.viewerRelation === 'assigned_crew') {
        actions.push({ key: 'capital', label: 'Signal capital intent', href: `/capital/intent?asset=${record.id}`, available: true, reason: null });
      }
      break;
    case 'role':
      if (record.assetSlug) {
        actions.push({ key: 'apply', label: 'Apply for role', href: `/commons/apply?role=${record.id}`, available: true, reason: null });
      }
      break;
    case 'application':
      if (record.isOwn && record.status === 'submitted') {
        actions.push({ key: 'withdraw', label: 'Withdraw application', href: `#withdraw-${record.id}`, available: true, reason: null });
      }
      break;
    case 'capital_intent':
      if (record.relation === 'own' && record.status === 'SIGNALED') {
        actions.push({ key: 'withdraw', label: 'Withdraw intent', href: `#withdraw-intent-${record.id}`, available: true, reason: null });
      }
      break;
  }

  return actions;
}

function buildRelations(dataset: StudioDataset, record: StudioRecord | null): RelationsView {
  if (!record) return { links: [] };

  const links: RelationLink[] = [];

  switch (record.kind) {
    case 'asset':
      if (record.anchorSignOff) {
        links.push({ type: 'anchor', targetKey: `roll:${record.id}`, targetTitle: 'Roll record' });
      }
      record.crew.forEach(member => {
        links.push({ type: 'crew', targetKey: `capability_badge:${member.id}`, targetTitle: `${member.name} (${member.role})` });
      });
      break;
    case 'role':
      if (record.assetId) {
        links.push({ type: 'asset', targetKey: `asset:${record.assetId}`, targetTitle: record.assetName ?? 'Asset' });
      }
      break;
    case 'application':
      if (record.roleId) {
        links.push({ type: 'role', targetKey: `role:${record.roleId}`, targetTitle: record.roleTitle });
      }
      if (record.assetId) {
        links.push({ type: 'asset', targetKey: `asset:${record.assetId}`, targetTitle: record.assetName ?? 'Asset' });
      }
      record.sharedBadges.forEach(badge => {
        links.push({ type: 'badge', targetKey: `capability_badge:${badge.assetName}`, targetTitle: `${badge.assetName} · ${badge.role}` });
      });
      break;
    case 'roll':
      links.push({ type: 'asset', targetKey: `asset:${record.tenderId}`, targetTitle: record.assetName });
      record.crew.forEach(member => {
        links.push({ type: 'crew', targetKey: `capability_badge:${member.id}`, targetTitle: `${member.name} (${member.role})` });
      });
      break;
    case 'capital_intent':
      if (record.tenderId) {
        links.push({ type: 'asset', targetKey: `asset:${record.tenderId}`, targetTitle: record.assetName ?? 'Asset' });
      }
      break;
    case 'capability_badge':
      if (record.tenderId) {
        links.push({ type: 'roll', targetKey: `roll:${record.tenderId}`, targetTitle: record.assetName ?? 'Roll record' });
      }
      break;
  }

  return { links };
}

function getDemoDataset(): StudioDataset {
  return {
    principal: {
      userId: 'demo-user',
      email: 'demo@apt-labs.local',
      displayName: 'Demo User',
      avatarUrl: null,
      configured: false,
      localMode: true,
    },
    invalidContext: false,
    records: [
      {
        kind: 'asset',
        id: 'school-console',
        title: 'School Console',
        slug: 'school-console',
        status: 'deployed',
        isIllustrative: false,
        summary: 'A local-first school utility for student and lesson records.',
        issuer: 'APT-LABS',
        location: 'Local device',
        category: 'Education',
        currency: 'USD',
        buildCostMinor: 0,
        fundingTargetMinor: 0,
        signaledAmountMinor: 0,
        settledAmountMinor: 0,
        capitalState: 'fully_funded',
        projectedAnnualYieldMinor: null,
        crew: [
          { id: 'dev-1', name: 'Core Team', role: 'anchor', avatarUrl: null },
        ],
        blueprint: {
          id: 'bp-school',
          version: 1,
          hash: 'abc123',
          lines: [
            { type: 'feature', description: 'Student roster management', quantity: 1, unit: 'module', estimatedCostMinor: 0 },
            { type: 'feature', description: 'Lesson planner', quantity: 1, unit: 'module', estimatedCostMinor: 0 },
            { type: 'feature', description: 'Offline-first sync', quantity: 1, unit: 'module', estimatedCostMinor: 0 },
          ],
        },
        anchorSignOff: { crewMemberId: 'dev-1', signedAt: new Date().toISOString() },
        hasDossier: false,
        viewerRelation: 'assigned_crew',
      },
      {
        kind: 'asset',
        id: 'mwea-animation',
        title: 'Mwea Animation Studio',
        slug: 'mwea-animation',
        status: 'proposed',
        isIllustrative: true,
        summary: 'A proposed creative work engine for locally rooted storytelling.',
        issuer: 'Mwea Community',
        location: 'Mwea, Kenya',
        category: 'Culture',
        currency: 'KES',
        buildCostMinor: 5000000,
        fundingTargetMinor: 5000000,
        signaledAmountMinor: 0,
        settledAmountMinor: 0,
        capitalState: 'unfunded',
        projectedAnnualYieldMinor: null,
        crew: [],
        blueprint: null,
        anchorSignOff: null,
        hasDossier: true,
        viewerRelation: 'none',
      },
      {
        kind: 'role',
        id: 'role-animator',
        title: 'Animator',
        assetId: 'mwea-animation',
        assetName: 'Mwea Animation Studio',
        assetSlug: 'mwea-animation',
        description: 'Create frame-by-frame animation for local stories.',
        skillTags: ['animation', 'storyboarding', 'character-design'],
        applicationCount: 3,
        createdAt: new Date().toISOString(),
      },
      {
        kind: 'application',
        id: 'app-1',
        roleId: 'role-animator',
        roleTitle: 'Animator',
        assetId: 'mwea-animation',
        assetName: 'Mwea Animation Studio',
        note: 'I have 5 years of 2D animation experience.',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        applicantLabel: 'J. Mwangi',
        applicantIdentityExposed: true,
        isOwn: false,
        deploymentTier: 'tier-1',
        deployedAssetCount: 2,
        capabilityBadgeCount: 1,
        sharedBadges: [
          { assetName: 'Previous Project', role: 'animator', issuedAt: new Date().toISOString(), blueprintHash: 'xyz789' },
        ],
      },
      {
        kind: 'roll',
        id: 'roll-school',
        tenderId: 'school-console',
        assetName: 'School Console',
        deployedAt: new Date().toISOString(),
        blueprintId: 'bp-school',
        blueprintHash: 'abc123',
        anchorCrewMemberId: 'dev-1',
        anchorSignedAt: new Date().toISOString(),
        crew: [{ id: 'dev-1', name: 'Core Team', role: 'anchor', avatarUrl: null }],
        blueprintLines: [
          { type: 'feature', description: 'Student roster management', quantity: 1, unit: 'module', estimatedCostMinor: 0 },
          { type: 'feature', description: 'Lesson planner', quantity: 1, unit: 'module', estimatedCostMinor: 0 },
        ],
        currency: 'USD',
        buildCostMinor: 0,
      },
      {
        kind: 'capital_intent',
        id: 'intent-1',
        tenderId: 'mwea-animation',
        assetName: 'Mwea Animation Studio',
        amountMinor: 1000000,
        currency: 'KES',
        status: 'SIGNALED',
        createdAt: new Date().toISOString(),
        relation: 'own',
        counterpartyLabel: 'Demo User',
      },
      {
        kind: 'capability_badge',
        id: 'badge-1',
        tenderId: 'school-console',
        rollRecordId: 'roll-school',
        assetName: 'School Console',
        role: 'anchor',
        issuedAt: new Date().toISOString(),
        blueprintHash: 'abc123',
        verifiedByCrewMemberId: 'dev-1',
        verifiedAt: new Date().toISOString(),
        deploymentCount: 1,
      },
    ],
    queues: [
      { id: 'my-applications', title: 'My Applications', hint: 'Applications you have submitted', recordKeys: ['application:app-1'], emptyTitle: 'No Applications', emptyReason: 'You have not submitted any applications.' },
      { id: 'my-badges', title: 'My Capability Proofs', hint: 'Verified deployments attributed to you', recordKeys: ['capability_badge:badge-1'], emptyTitle: 'No Capability Proofs', emptyReason: 'No verified deployments attributed to you.' },
      { id: 'assigned-roles', title: 'Assigned Roles', hint: 'Roles where you are published crew', recordKeys: [], emptyTitle: 'No Assigned Roles', emptyReason: 'You are not published as crew on any asset.' },
    ],
  };
}
