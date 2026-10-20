import {
  buildQueues,
  buildRelations,
  capitalStateLabel,
  deriveStudio,
  resolveActions,
  resolveFocus,
} from '@/lib/workbench/derive';
import {
  recordKey,
  recordStatusLabel,
  sourceStatusText,
  type StudioRecordKey,
} from '@/lib/workbench/types';
import {
  badge,
  crewContext,
  deployedAsset,
  illustrativeAsset,
  makeDataset,
  networkContext,
  openAsset,
  ownApplication,
  ownIntent,
  reviewableApplication,
  role,
  rollRecord,
  thirdPartyIntent,
} from './workbench-fixture';

describe('workbench derivation', () => {
  it('turns only persisted relationships into edges', () => {
    const dataset = makeDataset();
    const relations = buildRelations(dataset, recordKey('asset', openAsset.id));

    expect(relations.edges.length).toBeGreaterThan(0);
    for (const edge of relations.edges) {
      expect(edge.category).toBe('persisted');
      expect(edge.basis).toMatch(/^[a-z_]+\.[a-z_]+$/);
    }
    // A computed value is never a relation: the capital ladder, the capital
    // efficiency and the deployment tier are computed, so they cannot be edges.
    const targets = relations.edges.map(edge => edge.to);
    expect(targets).not.toContain('capital:unfunded');
    expect(targets.every(target => target.includes(':'))).toBe(true);
  });

  it('never makes an application the principal may not see into a node', () => {
    const withoutReviewable = makeDataset({
      records: [
        openAsset,
        deployedAsset,
        role,
        ownApplication,
        ownIntent,
        thirdPartyIntent,
        rollRecord,
        badge,
      ],
    });
    const relations = buildRelations(withoutReviewable, recordKey('role', 'role-1'));
    const applicationKeys = relations.edges
      .filter(edge => edge.to.startsWith('application:'))
      .map(edge => edge.to);

    expect(applicationKeys).toEqual([recordKey('application', ownApplication.id)]);
    expect(applicationKeys).not.toContain(recordKey('application', reviewableApplication.id));
  });

  it('gives a non-deployed Asset no Roll node and reaches a deployed Asset through its Roll record', () => {
    const dataset = makeDataset();

    const openRelations = buildRelations(dataset, recordKey('asset', openAsset.id));
    expect(openRelations.edges.some(edge => edge.to.startsWith('roll:'))).toBe(false);

    const deployedRelations = buildRelations(dataset, recordKey('asset', deployedAsset.id));
    expect(deployedRelations.edges.map(edge => edge.to)).toContain(recordKey('roll', rollRecord.id));

    const rollRelations = buildRelations(dataset, recordKey('roll', rollRecord.id));
    expect(rollRelations.edges.map(edge => edge.to)).toContain(recordKey('asset', deployedAsset.id));
  });

  it('tags capital intents by the viewer relation and never displays a name', () => {
    const dataset = makeDataset();
    const intents = dataset.records.filter(record => record.kind === 'capital_intent');
    const own = intents.find(intent => intent.id === ownIntent.id);
    const third = intents.find(intent => intent.id === thirdPartyIntent.id);

    expect(own?.relation).toBe('own');
    expect(own?.counterpartyLabel).toBe('Your capital intent');
    expect(third?.relation).toBe('issuer');
    expect(third?.counterpartyLabel).toBe("Another participant's intent (identity not exposed)");

    for (const intent of intents) {
      const serialized = JSON.stringify(intent);
      // No participant identity travels with an intent: no account id, no
      // display name, no free-text label beyond the relation wording.
      expect(serialized).not.toContain('user_id');
      expect(serialized).not.toContain('userId');
      expect(serialized).not.toContain('displayName');
      expect(serialized).not.toContain('display_name');
      expect(Object.keys(intent)).toEqual([
        'kind',
        'id',
        'tenderId',
        'assetName',
        'amountMinor',
        'currency',
        'status',
        'createdAt',
        'relation',
        'counterpartyLabel',
      ]);
    }
  });

  it('labels a capability proof as a deployment count and names the Anchor sign-off as its verifier', () => {
    const dataset = makeDataset();
    const record = dataset.records.find(entry => entry.kind === 'capability_badge');
    if (record?.kind !== 'capability_badge') throw new Error('Fixture requires a capability proof.');

    expect(record.deploymentCount).toBe(1);
    expect(record.verifiedByCrewMemberId).toBe(rollRecord.anchorCrewMemberId);
    expect(record.verifiedAt).toBe(rollRecord.anchorSignedAt);

    const relations = buildRelations(dataset, recordKey('capability_badge', record.id));
    expect(relations.edges.map(edge => edge.to)).toContain(recordKey('roll', rollRecord.id));
  });

  it('falls back to a chooser instead of an arbitrary record', () => {
    const dataset = makeDataset({ context: networkContext });
    const queues = buildQueues(dataset);

    const contextual = resolveFocus(dataset, null, queues);
    expect(contextual.kind).toBe('chooser');
    expect(contextual.key).toBeNull();
    expect(contextual.invalid).toBe(false);

    const unknown = resolveFocus(dataset, 'asset:not-visible', queues);
    expect(unknown.kind).toBe('chooser');
    expect(unknown.invalid).toBe(true);

    const explicit = resolveFocus(dataset, recordKey('asset', openAsset.id), queues);
    expect(explicit.kind).toBe('asset');
    expect(explicit.key).toBe(recordKey('asset', openAsset.id));
  });

  it('uses the context record when the context names exactly one', () => {
    const dataset = makeDataset({ context: crewContext });
    const queues = buildQueues(dataset);
    const focus = resolveFocus(dataset, null, queues);
    expect(focus.kind).toBe('asset');
    expect(focus.key).toBe(recordKey('asset', openAsset.id));
  });

  it('keeps empty, unavailable, denied and error apart', () => {
    expect(sourceStatusText('ok')).toBe('Loaded');
    expect(sourceStatusText('empty')).toBe('Loaded · no records');
    expect(sourceStatusText('unavailable')).toBe('Not available to this session');
    expect(sourceStatusText('denied')).toBe('Not permitted for this account');
    expect(sourceStatusText('error')).toBe('Could not be loaded');
  });

  it('never presents an illustrative record with a live marker', () => {
    const dataset = makeDataset();
    const record = dataset.records.find(entry => entry.id === illustrativeAsset.id);
    if (record?.kind !== 'asset') throw new Error('Fixture requires an illustrative Asset.');

    expect(record.isIllustrative).toBe(true);
    expect(recordStatusLabel(record)).toBe('ILLUSTRATIVE');
    expect(recordStatusLabel(openAsset)).toBe('open');

    const relations = buildRelations(dataset, recordKey('asset', illustrativeAsset.id));
    for (const node of relations.nodes) {
      expect(node.isIllustrative).toBe(true);
    }
  });

  it('does not read a zero capital target as an absence of capital need', () => {
    const zeroTarget = { fundingTargetMinor: 0, capitalState: 'unfunded' as const };
    expect(capitalStateLabel(zeroTarget)).toBe('No capital target recorded');
    expect(capitalStateLabel({ fundingTargetMinor: 100, capitalState: 'unfunded' })).toBe('No capital signalled yet');
  });

  it('states a reason for every action that is not available', () => {
    const dataset = makeDataset();
    for (const record of dataset.records) {
      for (const action of resolveActions(dataset, record)) {
        if (action.available) continue;
        expect(action.blockedReason).toBeTruthy();
      }
    }
  });

  it('blocks every shared write on a local development identity and says why', () => {
    const dataset = makeDataset({ localMode: true });
    const actions = resolveActions(dataset, openAsset);
    const writes = actions.filter(action => action.serverAction);

    expect(writes.length).toBeGreaterThan(0);
    for (const action of writes) {
      expect(action.available).toBe(false);
      expect(action.blockedReason).toMatch(/local development identity/i);
    }
  });

  it('offers no dossier for a deployed Asset and points at the Roll instead', () => {
    const dataset = makeDataset();
    const actions = resolveActions(dataset, deployedAsset);
    const dossier = actions.find(action => action.id === 'open-dossier');
    const roll = actions.find(action => action.id === 'open-roll');

    expect(dossier?.available).toBe(false);
    expect(dossier?.blockedReason).toMatch(/dossier/i);
    expect(roll?.href).toBe('/roll');
  });

  it('only lets an issuer review an application, and never the applicant’s own', () => {
    const dataset = makeDataset();
    const reviewable = resolveActions(dataset, reviewableApplication);
    const own = resolveActions(dataset, ownApplication);

    expect(reviewable.every(action => action.available)).toBe(true);
    expect(own.every(action => !action.available)).toBe(true);
    expect(own[0]?.blockedReason).toMatch(/own application/i);
  });

  it('derives a coherent view for a focused record', () => {
    const dataset = makeDataset();
    const derivation = deriveStudio(dataset, recordKey('asset', openAsset.id));

    expect(derivation.focusedRecord?.id).toBe(openAsset.id);
    expect(derivation.relations.links.length).toBe(derivation.relations.edges.length);
    expect(derivation.relations.links.every(link => Boolean(link.node.key))).toBe(true);
    expect(derivation.nextStep).toBeTruthy();
  });

  it('queues the tasks that exist for the principal and nothing else', () => {
    const dataset = makeDataset();
    const queues = buildQueues(dataset);
    const byId = new Map(queues.map(queue => [queue.id, queue]));

    expect(byId.get('my-applications')?.recordKeys).toEqual([recordKey('application', ownApplication.id)]);
    expect(byId.get('applications-to-review')?.recordKeys).toEqual([recordKey('application', reviewableApplication.id)]);
    expect(byId.get('my-capital')?.recordKeys).toEqual([recordKey('capital_intent', ownIntent.id)]);
    expect(byId.get('visible-intents')?.recordKeys).toEqual([recordKey('capital_intent', thirdPartyIntent.id)]);
    expect(byId.get('my-assignments')?.recordKeys).toEqual([]);
  });

  it('exposes the same relations in the list rendering as in the edge set', () => {
    const dataset = makeDataset();
    const relations = buildRelations(dataset, recordKey('asset', openAsset.id));
    const listed: StudioRecordKey[] = relations.links.map(link => link.node.key);
    const edged: StudioRecordKey[] = relations.edges.map(edge => edge.to);
    expect(listed).toEqual(edged);
  });
});
