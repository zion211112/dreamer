import { tenders } from '@/lib/tender-data';
import { capitalAllocationState, TenderInvariantError, transitionTender, validateCatalog } from '@/lib/tender';

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
