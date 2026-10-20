import { capitalAllocationState, tenderLifecycle } from '@/lib/tender';
import { parseWorkspaceFocus } from '@/lib/workspace';

import type { StudioDataset } from './dataset';
import {
  isApplicationRecord,
  isAssetRecord,
  isCapabilityBadgeRecord,
  isCapitalIntentRecord,
  isRoleRecord,
  isRollRecord,
  parseRecordKey,
  recordKey,
  recordSubtitle,
  recordTitle,
  type AssetRecord,
  type RelationEdge,
  type RelationLink,
  type RelationNode,
  type RelationNodeKey,
  type StudioAction,
  type StudioFocus,
  type StudioQueue,
  type StudioRecord,
  type StudioRecordKey,
  type StudioRelations,
} from './types';

// The canvas keeps a bounded number of nodes so it stays usable. The value is
// reported with the implementation rather than treated as a constant of
// taste: the observed graph for a live Asset is a handful of nodes, and the
// cap only bites on a pathological fan-out.
export const RELATION_NODE_CAP = 40;

export interface StudioDerivation {
  focus: StudioFocus;
  focusedRecord: StudioRecord | null;
  focusedQueue: StudioQueue | null;
  relations: StudioRelations;
  queues: StudioQueue[];
  actions: StudioAction[];
  chooser: StudioChooserEntry[];
  nextStep: string | null;
  contextLabel: string;
}

export interface StudioChooserEntry {
  key: string;
  title: string;
  subtitle: string;
  kind: 'record' | 'queue';
}

export interface RelationPosition {
  key: StudioRecordKey;
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Focus
// ---------------------------------------------------------------------------

function findRecordByKey(dataset: StudioDataset, key: string): StudioRecord | undefined {
  return dataset.records.find(record => recordKey(record.kind, record.id) === key);
}

export function resolveFocus(
  dataset: StudioDataset,
  requested: string | null | undefined,
  queues: StudioQueue[],
): StudioFocus {
  const requestedKey = typeof requested === 'string' ? requested.trim() : '';
  if (requestedKey) {
    const parsedFocus = parseWorkspaceFocus(requestedKey);
    if (!parsedFocus) {
      return {
        kind: 'chooser',
        key: null,
        requested: requestedKey,
        invalid: true,
        reason: 'That address is not a record or a queue. Choose a record to work on.',
      };
    }
    if (parsedFocus.kind === 'queue') {
      const queue = queues.find(candidate => candidate.id === parsedFocus.queueId);
      if (queue) {
        return {
          kind: 'queue',
          key: requestedKey,
          requested: requestedKey,
          invalid: false,
          reason: `Showing the “${queue.title}” queue.`,
        };
      }
      return {
        kind: 'chooser',
        key: null,
        requested: requestedKey,
        invalid: true,
        reason: 'That queue is not available to this account. Choose a record to work on.',
      };
    }
    const parsed = parseRecordKey(requestedKey);
    if (parsed) {
      const record = findRecordByKey(dataset, requestedKey);
      if (record) {
        return {
          kind: record.kind,
          key: requestedKey,
          requested: requestedKey,
          invalid: false,
          reason: `Showing “${recordTitle(record)}”.`,
        };
      }
    }
    return {
      kind: 'chooser',
      key: null,
      requested: requestedKey,
      invalid: true,
      reason: 'That record is not visible to this account. Choose a record to work on.',
    };
  }

  // The context's own record, when it is unambiguous.
  const contextTenderId = dataset.context?.tenderId;
  if (contextTenderId) {
    const asset = dataset.records.find(
      (record): record is AssetRecord => record.kind === 'asset' && record.id === contextTenderId,
    );
    if (asset) {
      const key = recordKey(asset.kind, asset.id);
      return {
        kind: 'asset',
        key,
        requested: null,
        invalid: false,
        reason: 'Showing the Asset named by your current context.',
      };
    }
  }

  return {
    kind: 'chooser',
    key: null,
    requested: null,
    invalid: false,
    reason: 'Nothing in your current context points at a single record. Choose where to start.',
  };
}

// ---------------------------------------------------------------------------
// Queues
// ---------------------------------------------------------------------------

export function buildQueues(dataset: StudioDataset): StudioQueue[] {
  const assignments = dataset.records.filter(
    record => record.kind === 'asset' && record.viewerRelation === 'assigned_crew',
  );
  const toReview = dataset.records.filter(
    record => record.kind === 'application' && !record.isOwn,
  );
  const ownApplications = dataset.records.filter(
    record => record.kind === 'application' && record.isOwn,
  );
  const ownIntents = dataset.records.filter(
    record => record.kind === 'capital_intent' && record.relation === 'own',
  );
  const visibleIntents = dataset.records.filter(
    record => record.kind === 'capital_intent' && record.relation === 'issuer',
  );
  const evidence = dataset.records.filter(record => record.kind === 'capability_badge');

  const key = (record: StudioRecord) => recordKey(record.kind, record.id);

  return [
    {
      id: 'my-assignments',
      title: 'My assignments',
      hint: 'Assets where you hold a crew role',
      recordKeys: assignments.map(key),
      emptyTitle: 'No crew assignment',
      emptyReason:
        'A crew context appears only after a trusted administrator assigns you to a build.',
    },
    {
      id: 'applications-to-review',
      title: 'Applications to review',
      hint: 'Applications you are entitled to see',
      recordKeys: toReview.map(key),
      emptyTitle: 'Nothing to review',
      emptyReason:
        'You see an application here only when you are the applicant or an authorized issuer for that Asset.',
    },
    {
      id: 'my-applications',
      title: 'My applications',
      hint: 'Roles you have applied to',
      recordKeys: ownApplications.map(key),
      emptyTitle: 'No applications sent',
      emptyReason: 'Applying to a role sends your note and a private Roll profile to that issuer.',
    },
    {
      id: 'my-capital',
      title: 'My capital intents',
      hint: 'Non-binding intents you recorded',
      recordKeys: ownIntents.map(key),
      emptyTitle: 'No capital intent recorded',
      emptyReason: 'A capital intent is a signal, not a payment, escrow balance, or yield right.',
    },
    {
      id: 'visible-intents',
      title: 'Intents on my Assets',
      hint: "Third-party intents you may see as an issuer",
      recordKeys: visibleIntents.map(key),
      emptyTitle: 'No third-party intent visible',
      emptyReason:
        'An issuer sees the amount and status of a participant’s intent, never who recorded it.',
    },
    {
      id: 'my-evidence',
      title: 'My capability evidence',
      hint: 'Verified deployments you took part in',
      recordKeys: evidence.map(key),
      emptyTitle: 'No capability proof yet',
      emptyReason:
        'A proof is issued when an assigned Anchor signs off a deployment and the build is recorded on the Roll.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

function nodeFor(
  record: StudioRecord,
  emphasis: RelationNode['emphasis'],
): RelationNode {
  return {
    key: recordKey(record.kind, record.id),
    kind: record.kind,
    title: recordTitle(record),
    subtitle: recordSubtitle(record),
    status: recordStatus(record),
    isIllustrative: record.kind === 'asset' ? record.isIllustrative : false,
    emphasis,
  };
}

function recordStatus(record: StudioRecord): string | null {
  switch (record.kind) {
    case 'asset':
      return record.status;
    case 'role':
      return 'open role';
    case 'application':
      return record.status;
    case 'roll':
      return 'deployed';
    case 'capital_intent':
      return record.status;
    case 'capability_badge':
      return 'proof issued';
  }
}

export function buildRelations(
  dataset: StudioDataset,
  focusKey: string | null,
): StudioRelations {
  if (!focusKey) return { nodes: [], edges: [], links: [] };
  const focus = findRecordByKey(dataset, focusKey);
  if (!focus) return { nodes: [], edges: [], links: [] };

  const nodes = new Map<StudioRecordKey, RelationNode>();
  const edges: RelationEdge[] = [];
  const seenEdges = new Set<string>();

  const addEdge = (
    to: StudioRecordKey,
    label: string,
    basis: string,
  ) => {
    const id = `${focusKey}->${to}`;
    if (seenEdges.has(id)) return;
    seenEdges.add(id);
    edges.push({ id, from: focusKey, to, category: 'persisted', label, basis });
  };

  const addNode = (node: RelationNode) => {
    if (!nodes.has(node.key)) nodes.set(node.key, node);
  };

  addNode(nodeFor(focus, 'focus'));

  const assets = dataset.records.filter(isAssetRecord);
  const roles = dataset.records.filter(isRoleRecord);
  const applications = dataset.records.filter(isApplicationRecord);
  const intents = dataset.records.filter(isCapitalIntentRecord);
  const badges = dataset.records.filter(isCapabilityBadgeRecord);
  const rollRecords = dataset.records.filter(isRollRecord);

  if (focus.kind === 'asset') {
    for (const role of roles) {
      if (role.assetId !== focus.id) continue;
      addNode(nodeFor(role, 'related'));
      addEdge(recordKey(role.kind, role.id), 'open role', 'commons_opportunities.tender_id');
    }
    for (const intent of intents) {
      if (intent.tenderId !== focus.id) continue;
      addNode(nodeFor(intent, 'related'));
      addEdge(recordKey(intent.kind, intent.id), 'capital intent', 'capital_intents.tender_id');
    }
    for (const badge of badges) {
      if (badge.tenderId !== focus.id) continue;
      addNode(nodeFor(badge, 'related'));
      addEdge(recordKey(badge.kind, badge.id), 'capability proof', 'roll_capability_badges.tender_id');
    }
    for (const roll of rollRecords) {
      if (roll.tenderId !== focus.id) continue;
      addNode(nodeFor(roll, 'related'));
      addEdge(recordKey(roll.kind, roll.id), 'Roll proof', 'roll_records.tender_id');
    }
    if (focus.blueprint) {
      const blueprintKey = `blueprint:${focus.blueprint.id}` as RelationNodeKey;
      addNode({
        key: blueprintKey,
        kind: 'blueprint',
        title: `Blueprint v${focus.blueprint.version}`,
        subtitle: focus.blueprint.hash,
        status: 'active',
        isIllustrative: focus.isIllustrative,
        emphasis: 'related',
      });
      addEdge(blueprintKey, 'active blueprint', 'blueprints.tender_id');
    }
    for (const member of focus.crew) {
      const crewKey = `crew:${member.id}` as RelationNodeKey;
      addNode({
        key: crewKey,
        kind: 'crew',
        title: member.displayName,
        subtitle: `${member.role}${member.organization ? ` · ${member.organization}` : ''}`,
        status: member.role,
        isIllustrative: focus.isIllustrative,
        emphasis: 'related',
      });
      addEdge(crewKey, `${member.role} crew`, 'crew_members.tender_id');
    }
  }

  if (focus.kind === 'role') {
    const asset = assets.find(record => record.id === focus.assetId);
    if (asset) {
      addNode(nodeFor(asset, 'related'));
      addEdge(recordKey(asset.kind, asset.id), 'Asset', 'commons_opportunities.tender_id');
    }
    for (const application of applications) {
      if (application.roleId !== focus.id) continue;
      // Only the applications the server returned for this principal are in
      // the dataset, so every one of them is one this account may see.
      addNode(nodeFor(application, 'related'));
      addEdge(recordKey(application.kind, application.id), 'application', 'commons_applications.opportunity_id');
    }
  }

  if (focus.kind === 'application') {
    const role = roles.find(record => record.id === focus.roleId);
    if (role) {
      addNode(nodeFor(role, 'related'));
      addEdge(recordKey(role.kind, role.id), 'role', 'commons_applications.opportunity_id');
    }
    const asset = assets.find(record => record.id === focus.assetId);
    if (asset) {
      addNode(nodeFor(asset, 'related'));
      addEdge(recordKey(asset.kind, asset.id), 'Asset', 'commons_opportunities.tender_id');
    }
  }

  if (focus.kind === 'roll') {
    const asset = assets.find(record => record.id === focus.tenderId);
    if (asset) {
      addNode(nodeFor(asset, 'related'));
      addEdge(recordKey(asset.kind, asset.id), 'Asset', 'roll_records.tender_id');
    }
    for (const badge of badges) {
      if (badge.rollRecordId !== focus.id) continue;
      addNode(nodeFor(badge, 'related'));
      addEdge(recordKey(badge.kind, badge.id), 'your capability proof', 'roll_capability_badges.roll_record_id');
    }
  }

  if (focus.kind === 'capital_intent') {
    const asset = assets.find(record => record.id === focus.tenderId);
    if (asset) {
      addNode(nodeFor(asset, 'related'));
      addEdge(recordKey(asset.kind, asset.id), 'Asset', 'capital_intents.tender_id');
    }
  }

  if (focus.kind === 'capability_badge') {
    const roll = rollRecords.find(record => record.id === focus.rollRecordId);
    if (roll) {
      addNode(nodeFor(roll, 'related'));
      addEdge(recordKey(roll.kind, roll.id), 'Roll proof', 'roll_capability_badges.roll_record_id');
    }
    const asset = assets.find(record => record.id === focus.tenderId);
    if (asset) {
      addNode(nodeFor(asset, 'related'));
      addEdge(recordKey(asset.kind, asset.id), 'Asset', 'roll_capability_badges.tender_id');
    }
  }

  const capped = edges.slice(0, RELATION_NODE_CAP);
  const kept = new Set<RelationNodeKey>([focusKey as RelationNodeKey]);
  for (const edge of capped) kept.add(edge.to);

  const nodeList = [...nodes.values()].filter(node => kept.has(node.key));
  const links: RelationLink[] = capped.map(edge => ({
    edge,
    node: nodeList.find(node => node.key === edge.to) as RelationNode,
  }));

  return { nodes: nodeList, edges: capped, links };
}

/**
 * A deterministic arrangement computed from the model: the focus sits at the
 * origin, its relations fan out in reading order by level. No physics, no
 * random placement, so the same data always draws the same picture.
 */
export function layoutRelations(relations: StudioRelations): RelationPosition[] {
  const focus = relations.nodes.find(node => node.emphasis === 'focus');
  if (!focus) return [];
  const levels = new Map<RelationNodeKey, number>([[focus.key, 0]]);
  const adjacency = new Map<RelationNodeKey, RelationNodeKey[]>();
  for (const edge of relations.edges) {
    const list = adjacency.get(edge.from) ?? [];
    list.push(edge.to);
    adjacency.set(edge.from, list);
  }
  const queue: RelationNodeKey[] = [focus.key];
  while (queue.length) {
    const current = queue.shift() as RelationNodeKey;
    const depth = levels.get(current) ?? 0;
    for (const next of adjacency.get(current) ?? []) {
      if (levels.has(next)) continue;
      levels.set(next, depth + 1);
      queue.push(next);
    }
  }
  const byLevel = new Map<number, RelationNodeKey[]>();
  for (const node of relations.nodes) {
    const depth = levels.get(node.key);
    if (depth === undefined) continue;
    const list = byLevel.get(depth) ?? [];
    list.push(node.key);
    byLevel.set(depth, list);
  }
  const positions: RelationPosition[] = [];
  for (const [depth, keys] of [...byLevel.entries()].sort((a, b) => a[0] - b[0])) {
    const ordered = [...keys].sort();
    ordered.forEach((key, index) => {
      const offset = (index - (ordered.length - 1) / 2) * 220;
      positions.push({ key, x: depth * 260, y: offset });
    });
  }
  return positions;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const CAPITAL_DISCLOSURE =
  'A capital intent is non-binding. No funds are held or transferred by this platform, and settlement must be verified by an authorized issuer.';

export function capitalStateLabel(record: {
  fundingTargetMinor: number;
  capitalState: ReturnType<typeof capitalAllocationState>;
}): string {
  if (record.fundingTargetMinor <= 0) return 'No capital target recorded';
  switch (record.capitalState) {
    case 'unfunded':
      return 'No capital signalled yet';
    case 'soft_committed':
      return 'Capital signalled · nothing settled';
    case 'awaiting_settlement':
      return 'Target signalled · awaiting settlement';
    case 'partially_settled':
      return 'Partially settled';
    case 'fully_capitalized':
      return 'Capital settled';
  }
}

export function resolveActions(
  dataset: StudioDataset,
  record: StudioRecord | null,
): StudioAction[] {
  if (!record) return [];
  const localMode = dataset.principal.localMode;
  const localBlock = localMode
    ? 'This action writes a shared record. The local development identity is held in this browser and grants no publish, capital or assembly permission.'
    : null;

  if (record.kind === 'asset') {
    const actions: StudioAction[] = [];
    if (record.hasDossier && record.slug) {
      actions.push({
        id: 'open-dossier',
        label: 'Open the Asset dossier',
        kind: 'navigation',
        href: `/tenders/${record.slug}`,
        serverAction: null,
        payload: {},
        available: true,
        blockedReason: null,
        disclosure: null,
      });
    } else {
      actions.push({
        id: 'open-dossier',
        label: 'Open the Asset dossier',
        kind: 'navigation',
        href: null,
        serverAction: null,
        payload: {},
        available: false,
        blockedReason:
          'A deployed Asset has no dossier route: the public register only lists Assets that are still being built. Its proof is on the Roll.',
        disclosure: null,
      });
      actions.push({
        id: 'open-roll',
        label: 'Open the public Roll',
        kind: 'navigation',
        href: '/roll',
        serverAction: null,
        payload: {},
        available: true,
        blockedReason: null,
        disclosure: null,
      });
    }
    if (record.viewerRelation === 'assigned_crew') {
      actions.push({
        id: 'open-assembly',
        label: 'Open the assigned Assembly',
        kind: 'navigation',
        href: record.isIllustrative ? null : `/assembly/${record.id}`,
        serverAction: null,
        payload: {},
        available: !record.isIllustrative,
        blockedReason: record.isIllustrative
          ? 'Illustrative Assets are not assignable and cannot enter a real Assembly.'
          : null,
        disclosure:
          'Build transitions stay in the Assembly room, which checks your crew assignment on the server before it moves anything.',
      });
    }
    const acceptsSignals = record.status === 'open' || record.status === 'capitalized_pending_settlement';
    actions.push({
      id: 'signal-capital',
      label: 'Record a non-binding capital intent',
      kind: 'server',
      href: null,
      serverAction: 'signal',
      payload: { tenderId: record.id },
      available: !localBlock && !record.isIllustrative && acceptsSignals,
      blockedReason: localBlock
        ?? (record.isIllustrative
          ? 'An illustrative scenario cannot accept a live capital signal.'
          : acceptsSignals
            ? null
            : 'This Asset is past the point where capital can be signalled.'),
      disclosure: CAPITAL_DISCLOSURE,
    });
    actions.push({
      id: 'publish-role',
      label: 'Post an open role for this Asset',
      kind: 'server',
      href: null,
      serverAction: 'publish',
      payload: { tenderId: record.id },
      available: !localBlock && !record.isIllustrative,
      blockedReason: localBlock
        ?? (record.isIllustrative
          ? 'An illustrative scenario is not a published Asset, so it cannot carry an open role.'
          : null),
      disclosure:
        'Only an authorized issuer for the Asset may publish a role. The server checks that membership before it writes anything.',
    });
    return actions;
  }

  if (record.kind === 'role') {
    const ownApplication = dataset.records.find(
      candidate => candidate.kind === 'application' && candidate.roleId === record.id && candidate.isOwn,
    );
    const asset = dataset.records.find(
      candidate => candidate.kind === 'asset' && candidate.id === record.assetId,
    );
    const illustrative = asset?.kind === 'asset' ? asset.isIllustrative : false;
    const actions: StudioAction[] = [
      {
        id: 'apply',
        label: 'Apply with a Roll profile',
        kind: 'server',
        href: null,
        serverAction: 'apply',
        payload: { opportunityId: record.id },
        available: !localBlock && !ownApplication && !illustrative,
        blockedReason: localBlock
          ?? (ownApplication
            ? 'You have already applied to this role.'
            : illustrative
              ? 'This role belongs to an illustrative scenario and cannot receive applications.'
              : null),
        disclosure:
          'No previous badge is required. Your application stays private to you and the authorized issuer, and you must consent to share your Roll profile with them.',
      },
    ];
    if (asset?.kind === 'asset' && asset.slug && asset.hasDossier) {
      actions.push({
        id: 'open-dossier',
        label: 'Open the Asset dossier',
        kind: 'navigation',
        href: `/tenders/${asset.slug}`,
        serverAction: null,
        payload: {},
        available: true,
        blockedReason: null,
        disclosure: null,
      });
    }
    actions.push({
      id: 'open-opportunities',
      label: 'Open the public opportunities board',
      kind: 'navigation',
      href: '/commons/opportunities',
      serverAction: null,
      payload: {},
      available: true,
      blockedReason: null,
      disclosure: null,
    });
    return actions;
  }

  if (record.kind === 'application') {
    const canReview = !record.isOwn;
    return [
      {
        id: 'review-followup',
        label: 'Mark for follow-up',
        kind: 'server',
        href: null,
        serverAction: 'review',
        payload: { applicationId: record.id, status: 'reviewed' },
        available: canReview && !localBlock,
        blockedReason: localBlock
          ?? (canReview
            ? null
            : 'This is your own application. Only the Asset’s authorized issuer can review it.'),
        disclosure: null,
      },
      {
        id: 'review-decline',
        label: 'Decline the application',
        kind: 'server',
        href: null,
        serverAction: 'review',
        payload: { applicationId: record.id, status: 'declined' },
        available: canReview && !localBlock,
        blockedReason: localBlock
          ?? (canReview
            ? null
            : 'This is your own application. Only the Asset’s authorized issuer can review it.'),
        disclosure: null,
      },
    ];
  }

  if (record.kind === 'roll') {
    const asset = dataset.records.find(candidate => candidate.kind === 'asset' && candidate.id === record.tenderId);
    return [
      {
        id: 'open-roll',
        label: 'Open the public Roll',
        kind: 'navigation',
        href: '/roll',
        serverAction: null,
        payload: {},
        available: true,
        blockedReason: null,
        disclosure: null,
      },
      {
        id: 'open-asset',
        label: 'Open the Asset',
        kind: 'focus',
        href: null,
        serverAction: null,
        payload: asset ? { focus: recordKey(asset.kind, asset.id) } : {},
        available: Boolean(asset),
        blockedReason: asset ? null : 'The Asset behind this proof is not visible to this account.',
        disclosure: null,
      },
    ];
  }

  if (record.kind === 'capital_intent') {
    const asset = dataset.records.find(
      candidate => candidate.kind === 'asset' && candidate.id === record.tenderId,
    );
    return [
      {
        id: 'open-asset',
        label: 'Open the Asset',
        kind: 'focus',
        href: null,
        serverAction: null,
        payload: asset ? { focus: recordKey(asset.kind, asset.id) } : {},
        available: Boolean(asset),
        blockedReason: asset ? null : 'The Asset this intent refers to is not visible to this account.',
        disclosure: CAPITAL_DISCLOSURE,
      },
    ];
  }

  const badgeAsset = dataset.records.find(
    candidate => candidate.kind === 'asset' && candidate.id === record.tenderId,
  );
  const badgeRoll = dataset.records.find(
    candidate => candidate.kind === 'roll' && candidate.id === record.rollRecordId,
  );
  return [
    {
      id: 'open-roll',
      label: 'Open the proof record',
      kind: 'focus',
      href: null,
      serverAction: null,
      payload: badgeRoll ? { focus: recordKey(badgeRoll.kind, badgeRoll.id) } : {},
      available: Boolean(badgeRoll),
      blockedReason: badgeRoll ? null : 'The Roll record behind this proof is not visible to this account.',
      disclosure: null,
    },
    {
      id: 'open-asset',
      label: 'Open the Asset',
      kind: 'focus',
      href: null,
      serverAction: null,
      payload: badgeAsset ? { focus: recordKey(badgeAsset.kind, badgeAsset.id) } : {},
      available: Boolean(badgeAsset),
      blockedReason: badgeAsset ? null : 'The Asset this proof refers to is not visible to this account.',
      disclosure: null,
    },
  ];
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

function buildChooser(
  dataset: StudioDataset,
  queues: StudioQueue[],
): StudioChooserEntry[] {
  const entries: StudioChooserEntry[] = [];
  const contextTenderId = dataset.context?.tenderId;
  if (contextTenderId) {
    const asset = dataset.records.find(
      (record): record is AssetRecord => record.kind === 'asset' && record.id === contextTenderId,
    );
    if (asset) {
      entries.push({
        key: recordKey(asset.kind, asset.id),
        title: asset.title,
        subtitle: 'The Asset named by your current context',
        kind: 'record',
      });
    }  }
  for (const queue of queues) {
    if (!queue.recordKeys.length) continue;
    entries.push({
      key: `queue:${queue.id}`,
      title: queue.title,
      subtitle: `${queue.recordKeys.length} record${queue.recordKeys.length === 1 ? '' : 's'}`,
      kind: 'queue',
    });
  }
  const assetEntries = dataset.records
    .filter(isAssetRecord)
    .slice(0, 6)
    .map(record => ({
      key: recordKey(record.kind, record.id),
      title: record.title,
      subtitle: record.kind === 'asset' ? record.issuer : '',
      kind: 'record' as const,
    }));
  for (const entry of assetEntries) {
    if (entries.some(existing => existing.key === entry.key)) continue;
    entries.push(entry);
  }
  return entries;
}

function nextStepFor(dataset: StudioDataset, record: StudioRecord | null): string | null {
  if (!record) return null;
  if (record.kind === 'asset') {
    const lifecycle = tenderLifecycle({
      status: record.status,
      currentSettledAmountMinor: record.settledAmountMinor,
      fundingTargetMinor: record.fundingTargetMinor,
    });
    if (lifecycle.permitted.length) {
      return `The next permitted state is “${lifecycle.permitted[0].replace('_', ' ')}”. The crew-only Assembly room performs that transition.`;
    }
    if (lifecycle.gate) return lifecycle.gate;
    if (record.viewerRelation === 'assigned_crew') {
      return 'Open your assigned Assembly to see the build sequence and the transition reserved for your role.';
    }
    return 'Read the dossier for the build plan, the crew and the capital ladder.';
  }
  if (record.kind === 'role') {
    return 'Open the brief, then apply with a Roll profile. No previous badge is required.';
  }
  if (record.kind === 'application') {
    return record.isOwn
      ? 'The issuer reviews applications. You will see the outcome on this record.'
      : 'Read the note and the shared proof, then mark for follow-up or decline.';
  }
  if (record.kind === 'roll') {
    return 'This proof records a deployed, Anchor-signed build. It carries no cash-flow right.';
  }
  if (record.kind === 'capital_intent') {
    return 'A capital intent is a signal. Settlement is verified separately by an authorized issuer.';
  }
  return 'Your proof records a verified deployment, not a skill score.';
}

export function deriveStudio(
  dataset: StudioDataset,
  requestedFocus: string | null | undefined,
): StudioDerivation {
  const queues = buildQueues(dataset);
  const focus = resolveFocus(dataset, requestedFocus, queues);
  const focusedRecord = focus.key ? findRecordByKey(dataset, focus.key) ?? null : null;
  const focusedQueue = focus.key?.startsWith('queue:')
    ? queues.find(queue => `queue:${queue.id}` === focus.key) ?? null
    : null;
  const relations = buildRelations(dataset, focus.key);
  const actions = resolveActions(dataset, focusedRecord);
  return {
    focus,
    focusedRecord,
    focusedQueue,
    relations,
    queues,
    actions,
    chooser: buildChooser(dataset, queues),
    nextStep: nextStepFor(dataset, focusedRecord),
    contextLabel: contextLabel(dataset),
  };
}

export function contextLabel(dataset: StudioDataset): string {
  const context = dataset.context;
  if (!context) return 'Public preview';
  if (context.kind === 'network') return 'Network Member';
  if (context.kind === 'funder') return `Funder · ${context.assetName ?? context.label}`;
  if (context.kind === 'school') {
    const role = context.role === 'principal'
      ? 'School Admin'
      : context.role === 'tender_issuer'
        ? 'Tender Issuer'
        : 'Teacher';
    return `${role} · ${context.label}`;
  }
  return `${context.role.charAt(0).toUpperCase()}${context.role.slice(1)} · ${context.assetName ?? context.label}`;
}
