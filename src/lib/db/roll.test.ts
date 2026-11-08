import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRollEntry, queryRollEntries, verifyRollEntry } from './roll';
import { computeHashAnchor, createCanonicalRollJson } from './roll-hash';

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe('Roll canonical data and demo fixtures', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('canonicalizes deliverables and participants deterministically', async () => {
    const [entry] = await queryRollEntries({ undertaking_type: 'physical' });
    const reordered = {
      ...entry,
      deliverables: [...entry.deliverables].reverse(),
      participants: [...entry.participants].reverse(),
    };

    expect(createCanonicalRollJson(reordered)).toBe(createCanonicalRollJson(entry));
  });

  it('verifies matching hashes and detects committed-field tampering', async () => {
    const [entry] = await queryRollEntries({ undertaking_type: 'physical' });
    const valid = await verifyRollEntry(entry);
    const tampered = await verifyRollEntry({ ...entry, title: `${entry.title} (changed)` });

    expect(valid.valid).toBe(true);
    expect(valid.storedHash).toBe(valid.computedHash);
    expect(valid.canonicalJson).toContain(entry.title);
    expect(tampered.valid).toBe(false);
    expect(tampered.storedHash).not.toBe(tampered.computedHash);
  });

  it('does not imply that excluded evidence or recording metadata are hash-committed', async () => {
    const [entry] = await queryRollEntries({ undertaking_type: 'physical' });
    const changedExcludedFields = await verifyRollEntry({
      ...entry,
      recorded_at: '2030-01-01T00:00:00.000Z',
      recorded_by: 'different-recorder',
      evidence: entry.evidence.map(item => ({ ...item, title: 'Changed evidence label' })),
      version: entry.version + 1,
    });

    expect(changedExcludedFields.valid).toBe(true);
    expect(changedExcludedFields.canonicalJson).not.toContain('Changed evidence label');
    expect(changedExcludedFields.canonicalJson).not.toContain('different-recorder');
  });

  it('loads physical, digital, and creative synthetic examples with every visibility layer', async () => {
    const entries = await queryRollEntries();

    expect(new Set(entries.map(entry => entry.undertaking_type))).toEqual(
      new Set(['physical', 'digital', 'creative'])
    );
    for (const entry of entries) {
      expect(entry.commissioned_by.name).toMatch(/demo|example/i);
      expect(entry.participants.every(person => /demo|example/i.test(person.name))).toBe(true);
      expect(new Set(entry.evidence.map(evidence => evidence.layer))).toEqual(
        new Set(['public', 'participant', 'restricted'])
      );
      expect(entry.evidence.every(evidence => evidence.file_url === null)).toBe(true);
      expect((await verifyRollEntry(entry)).valid).toBe(true);
    }
  });

  it('persists a demo entry with a canonical hash and merges it with fixtures', async () => {
    const [fixture] = await queryRollEntries({ undertaking_type: 'physical' });
    const { id: _id, recorded_at: _recordedAt, hash_anchor: _hash, version: _version, ...data } = fixture;
    const created = await createRollEntry(data, 'demo-user');

    const storedEntries = JSON.parse(localStorage.getItem('demo_roll_entries') ?? '[]');
    const entries = await queryRollEntries();
    const persistedEntry = entries.find(entry => entry.id === created.id);

    expect(storedEntries).toHaveLength(1);
    expect(created.hash_anchor).toBe(await computeHashAnchor(createCanonicalRollJson(created)));
    expect(persistedEntry).toEqual(created);
    expect(entries).toHaveLength(4);
    expect(entries[0].id).toBe(created.id);
  });

  it('reports malformed demo storage instead of silently returning fixtures only', async () => {
    localStorage.setItem('demo_roll_entries', '{invalid json');

    await expect(queryRollEntries()).rejects.toThrow('Demo Roll entries are unreadable');
  });

  it('rejects demo storage that is valid JSON but not a Roll entry list', async () => {
    localStorage.setItem('demo_roll_entries', JSON.stringify([{ id: 'incomplete' }]));

    await expect(queryRollEntries()).rejects.toThrow('does not match the Roll entry format');
  });

  it('does not share mutable fixture values between queries', async () => {
    const [firstRead] = await queryRollEntries({ undertaking_type: 'physical' });
    firstRead.title = 'Changed in caller';
    firstRead.deliverables.push('Changed in caller');
    firstRead.evidence[0].title = 'Changed in caller';
    const [secondRead] = await queryRollEntries({ undertaking_type: 'physical' });

    expect(secondRead.title).toBe('DEMO · Community Workshop Build-out');
    expect(secondRead.deliverables).not.toContain('Changed in caller');
    expect(secondRead.evidence[0].title).toBe('Example handover checklist');
    expect((await verifyRollEntry(secondRead)).valid).toBe(true);
  });

  it('surfaces localStorage access failures instead of reporting an empty ledger', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('Storage disabled'); },
      setItem: () => { throw new Error('Storage disabled'); },
    });

    await expect(queryRollEntries()).rejects.toThrow('Demo Roll entries are unreadable from this browser');
  });

  it('does not report success when saving a demo entry fails', async () => {
    const [fixture] = await queryRollEntries({ undertaking_type: 'physical' });
    const { id: _id, recorded_at: _recordedAt, hash_anchor: _hash, version: _version, ...data } = fixture;
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => { throw new Error('Storage disabled'); },
    });

    await expect(createRollEntry(data, 'demo-user')).rejects.toThrow('could not be saved');
  });
});
