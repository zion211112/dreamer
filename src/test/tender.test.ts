import { tenders } from '@/lib/tender-data';
import {
  capitalAllocationState,
  tenderLifecycle,
  TenderInvariantError,
  tenderStatuses,
  transitionTender,
  validateCatalog,
} from '@/lib/tender';

describe('Tender invariants', () => {
  it('distinguishes intent from verified settlement in the capital allocation state', () => {
    const sample = tenders[0];
    expect(capitalAllocationState(sample)).toBe('unfunded');
    expect(capitalAllocationState({
      ...sample,
      currentSignaledAmountMinor: 1,
    })).toBe('soft_committed');
    expect(capitalAllocationState({
      ...sample,
      currentSignaledAmountMinor: sample.fundingTargetMinor,
    })).toBe('awaiting_settlement');
    expect(capitalAllocationState({
      ...sample,
      currentSignaledAmountMinor: sample.fundingTargetMinor,
      currentSettledAmountMinor: 1,
    })).toBe('partially_settled');
    expect(capitalAllocationState({
      ...sample,
      currentSignaledAmountMinor: sample.fundingTargetMinor,
      currentSettledAmountMinor: sample.fundingTargetMinor,
    })).toBe('fully_capitalized');
  });

  it('rejects duplicate identifiers and mismatched BOM totals', () => {
    const sample = tenders[0];
    expect(() => validateCatalog({ tenders: [sample, sample], roll: [] })).toThrow('Duplicate Tender id');
    expect(() => validateCatalog({
      tenders: [{ ...sample, assetBuildCostMinor: sample.assetBuildCostMinor + 1 }],
      roll: [],
    })).toThrow('Blueprint total does not match asset build cost');
  });

  it('does not allow deployment without the assigned Anchor sign-off', () => {
    const sample = tenders.find(tender => tender.slug === 'community-radio-studio');
    if (!sample) throw new Error('Missing radio Tender fixture.');
    const nonIllustrative = { ...sample, isIllustrative: false, status: 'anchor_signed' as const };
    const anchor = nonIllustrative.crew.find(member => member.role === 'anchor');
    if (!anchor) throw new Error('Fixture requires an Anchor.');

    expect(() => transitionTender(nonIllustrative, 'deployed', anchor.id, '2026-10-19T00:00:00.000Z'))
      .toThrow(TenderInvariantError);
  });

  it('creates one Roll snapshot atomically when a valid Anchor signs the active Blueprint', () => {
    const sample = tenders.find(tender => tender.slug === 'community-radio-studio');
    if (!sample) throw new Error('Missing radio Tender fixture.');
    const build = { ...sample, isIllustrative: false, status: 'fabrication' as const };
    const anchor = build.crew.find(member => member.role === 'anchor');
    if (!anchor) throw new Error('Fixture requires an Anchor.');

    const signOff = transitionTender(build, 'anchor_signed', anchor.id, '2026-10-18T12:00:00.000Z');
    const deployment = transitionTender(signOff.tender, 'deployed', anchor.id, '2026-10-19T00:00:00.000Z');

    expect(deployment.tender.status).toBe('deployed');
    expect(deployment.rollRecord).toMatchObject({
      tenderId: build.id,
      assetBuildCostMinor: build.assetBuildCostMinor,
      blueprintLines: build.blueprint.lines,
      blueprintId: build.blueprint.id,
      blueprintHash: build.blueprint.hash,
      anchorSignOff: signOff.tender.anchorSignOff,
    });
    const rollRecord = deployment.rollRecord;
    if (!rollRecord) throw new Error('Deployment requires its Roll snapshot.');
    const deployedCatalog = {
      tenders: tenders.map(tender => tender.id === build.id ? deployment.tender : tender),
      roll: [rollRecord],
    };
    expect(() => validateCatalog(deployedCatalog)).not.toThrow();
    expect(() => validateCatalog({
      ...deployedCatalog,
      roll: [{ ...rollRecord, blueprintLines: [] }],
    })).toThrow('Roll record must reference a real deployed Tender');
    expect(() => transitionTender(deployment.tender, 'deployed', anchor.id, '2026-10-19T00:00:01.000Z'))
      .toThrow('Cannot transition Tender');
  });

  it('rejects a non-Anchor attempting to sign the Blueprint', () => {
    const sample = tenders.find(tender => tender.slug === 'community-radio-studio');
    if (!sample) throw new Error('Missing radio Tender fixture.');
    const builder = sample.crew.find(member => member.role === 'builder');
    if (!builder) throw new Error('Fixture requires a Builder.');
    expect(() => transitionTender({ ...sample, status: 'fabrication' }, 'anchor_signed', builder.id, '2026-10-19T00:00:00.000Z'))
      .toThrow('Only the assigned Anchor can sign off');
  });
});

describe('Tender lifecycle', () => {
  it('permits materials once the funding target is fully settled', () => {
    const lifecycle = tenderLifecycle({
      status: 'open',
      fundingTargetMinor: 100,
      currentSettledAmountMinor: 100,
    });
    expect(lifecycle.status).toBe('open');
    expect(lifecycle.permitted).toEqual(['materials']);
    expect(lifecycle.gate).toBeNull();
    expect(lifecycle.awaitingSettlement).toBe(false);
  });

  it('holds materials behind the settlement gate until capital settles', () => {
    const lifecycle = tenderLifecycle({
      status: 'open',
      fundingTargetMinor: 100,
      currentSettledAmountMinor: 0,
    });
    expect(lifecycle.permitted).toEqual([]);
    expect(lifecycle.gate).not.toBeNull();
    expect(lifecycle.gate?.toLowerCase()).toContain('settl');
    expect(lifecycle.awaitingSettlement).toBe(true);
  });

  it('never unlocks materials for a zero funding target', () => {
    const lifecycle = tenderLifecycle({
      status: 'open',
      fundingTargetMinor: 0,
      currentSettledAmountMinor: 0,
    });
    expect(lifecycle.permitted).toEqual([]);
    expect(lifecycle.awaitingSettlement).toBe(true);
  });

  it('advances materials, fabrication and the Anchor sign-off in order', () => {
    const settled = { fundingTargetMinor: 100, currentSettledAmountMinor: 100 };
    expect(tenderLifecycle({ status: 'materials', ...settled }).permitted).toEqual(['fabrication']);
    expect(tenderLifecycle({ status: 'fabrication', ...settled }).permitted).toEqual(['anchor_signed']);
    expect(tenderLifecycle({ status: 'anchor_signed', ...settled }).permitted).toEqual(['deployed']);
  });

  it('permits no further transition from a closed, pre-open or settled status', () => {
    const settled = { fundingTargetMinor: 100, currentSettledAmountMinor: 100 };
    for (const status of ['draft', 'capitalized_pending_settlement', 'deployed', 'cancelled'] as const) {
      expect(tenderLifecycle({ status, ...settled }).permitted).toEqual([]);
    }
  });

  it('refuses every transition the lifecycle does not permit', () => {
    const sample = tenders.find(tender => tender.slug === 'community-radio-studio');
    if (!sample) throw new Error('Missing radio Tender fixture.');
    const anchor = sample.crew.find(member => member.role === 'anchor');
    if (!anchor) throw new Error('Fixture requires an Anchor.');

    for (const status of tenderStatuses) {
      const candidate = { ...sample, status };
      const lifecycle = tenderLifecycle(candidate);
      for (const next of tenderStatuses) {
        if (lifecycle.permitted.includes(next)) continue;
        expect(() => transitionTender(candidate, next, anchor.id, '2026-10-20T00:00:00.000Z'))
          .toThrow('Cannot transition Tender');
      }
    }
  });

  it('keeps the settlement gate aligned with the transition engine', () => {
    const sample = tenders.find(tender => tender.slug === 'community-radio-studio');
    if (!sample) throw new Error('Missing radio Tender fixture.');
    const anchor = sample.crew.find(member => member.role === 'anchor');
    if (!anchor) throw new Error('Fixture requires an Anchor.');

    const settled = {
      ...sample,
      status: 'open' as const,
      fundingTargetMinor: 100,
      currentSignaledAmountMinor: 100,
      currentSettledAmountMinor: 100,
    };
    expect(() => transitionTender(settled, 'materials', anchor.id, '2026-10-20T00:00:00.000Z'))
      .not.toThrow();
    expect(() => transitionTender({ ...settled, currentSettledAmountMinor: 0 }, 'materials', anchor.id, '2026-10-20T00:00:00.000Z'))
      .toThrow('Cannot transition Tender');
  });
});
