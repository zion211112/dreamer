/**
 * P5 evidence — the whole system, not just the chain, is one system of record.
 *
 * `coordination-chain.spec.ts` proves the pure domain chain
 * (INTENTION → COMMITMENT → OUTPUT_OUTCOME). This one goes one layer up:
 * it drives the Angular services and shows a single fulfilment on the shared
 * spine ripples, in the same tick, into Records (a new outcome row + a longer
 * roll). Work records do not create financial value.
 */

import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CoordinationService, NetworkService, RecordsService, ValueService } from '@apt-labs/shared/state';

describe('system of record — one action ripples across every surface', () => {
  let coord: CoordinationService;
  let records: RecordsService;
  let value: ValueService;
  let network: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    coord = TestBed.inject(CoordinationService);
    records = TestBed.inject(RecordsService);
    value = TestBed.inject(ValueService);
    network = TestBed.inject(NetworkService);
  });

  it('a fulfilment on the spine grows Records canon and roll without creating financial value', () => {
    const canonBefore = records.canon().length;
    const rollBefore = records.roll().length;

    // 1. Post an ad-hoc need. Work records do not create financial entries.
    const need = coord.createNeed({ need: 'Repair the cold-chain drying unit' });
    expect(value.rows()).toEqual([]);

    // 2. A provider accepts it — the need advances to committed on the spine.
    coord.acceptNeed(need.id, 'actor-crew');
    expect(coord.needs().find((n) => n.needId === need.id)?.status).toBe('committed');

    // 3. A participant reports an outcome and optional evidence references.
    const commitmentId = coord.journey(need.id).commitments[0].id;
    coord.fulfilNeed(commitmentId, 'Cold-chain unit repaired and recorded');

    // Records: a new reported outcome landed in the canon…
    expect(records.canon().length).toBe(canonBefore + 1);
    expect(records.canon()[0].status).toBe('reported');
    expect(records.canon()[0].title).toContain('Reported —');
    // …and the append-only roll grew (post + accept + outcome, each audited).
    expect(records.roll().length).toBeGreaterThanOrEqual(rollBefore + 3);
    // Value remains empty: no financial instrument or settlement was recorded.
    expect(value.rows()).toEqual([]);
    expect(value.metrics().totalKes).toBe(0);
    expect(network.directory).toEqual([]);
  });

  it('starts with honest empty workspace views and no synthetic directory entries', () => {
    expect(coord.needs()).toEqual([]);
    expect(records.canon()).toEqual([]);
    expect(records.annals()).toEqual([]);
    expect(records.roll()).toEqual([]);
    expect(value.rows()).toEqual([]);
    expect(network.directory).toEqual([]);
  });
});
