/**
 * P5 evidence — the whole system, not just the chain, is one system of record.
 *
 * `coordination-chain.spec.ts` proves the pure domain chain
 * (INTENTION → COMMITMENT → OUTPUT_OUTCOME). This one goes one layer up:
 * it drives the Angular services and shows a single fulfilment on the shared
 * spine ripples, in the same tick, into Records (a new canon row + a longer
 * roll) and into Value (the row advances to fulfilled). That ripple is the
 * thesis — one action, every surface — made testable.
 */

import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CoordinationService, RecordsService, ValueService } from '@apt-labs/shared/state';

describe('system of record — one action ripples across every surface', () => {
  let coord: CoordinationService;
  let records: RecordsService;
  let value: ValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    coord = TestBed.inject(CoordinationService);
    records = TestBed.inject(RecordsService);
    value = TestBed.inject(ValueService);
  });

  it('a fulfilment on the spine grows Records canon + roll and moves Value', () => {
    const canonBefore = records.canon().length;
    const rollBefore = records.roll().length;
    const valueBefore = value.rows().length;

    // 1. Post an ad-hoc need — it lands as an open Value row immediately.
    const need = coord.createNeed({ need: 'Repair the cold-chain drying unit' });
    expect(value.rows().some((r) => r.key === need.id)).toBe(true);
    expect(value.rows().find((r) => r.key === need.id)?.status).toBe('open');

    // 2. A provider accepts it — the need advances to committed on the spine.
    coord.acceptNeed(need.id, 'actor-crew');
    expect(coord.needs().find((n) => n.needId === need.id)?.status).toBe('committed');

    // 3. The provider delivers, sealing evidence — this is the ripple.
    const commitmentId = coord.journey(need.id).commitments[0].id;
    coord.fulfilNeed(commitmentId, 'Cold-chain unit repaired and sealed', ['evd-cc-01']);

    // Records: a new sealed outcome landed in the canon…
    expect(records.canon().length).toBe(canonBefore + 1);
    // …and the append-only roll grew (post + accept + fulfil, each audited).
    expect(records.roll().length).toBeGreaterThanOrEqual(rollBefore + 3);
    // …and the very same action moved Value: the row is now delivered.
    const row = value.rows().find((r) => r.key === need.id);
    expect(row?.status).toBe('fulfilled');
    expect(value.rows().length).toBe(valueBefore + 1);
  });

  it('every surface reads one store — the seed is consistent across all three', () => {
    // 5 operational pilots, each delivered, share one store: the canon count
    // equals the delivered-need count and matches Value's delivered outcomes.
    const delivered = coord.needs().filter((n) => n.status === 'fulfilled').length;
    expect(records.canon().length).toBe(delivered);
    expect(value.rows().filter((r) => r.status === 'fulfilled').length).toBe(delivered);
    // …and all three agree on the total number of needs on the record.
    expect(coord.needs().length).toBe(value.rows().length);
  });
});
