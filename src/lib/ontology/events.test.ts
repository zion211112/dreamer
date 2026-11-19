import { describe, it, expect } from 'vitest';
import {
  EVENT_TYPE,
  createEvent,
  createEventId,
  createCorrectiveEvent,
  isAptEvent,
} from './events';

describe('ontology events', () => {
  describe('EVENT_TYPE', () => {
    it('defines event types', () => {
      expect(EVENT_TYPE.ENTITY_CREATED).toBe('ENTITY_CREATED');
      expect(EVENT_TYPE.COMMIT_CREATED).toBe('COMMIT_CREATED');
      expect(EVENT_TYPE.VERIFY_CREATED).toBe('VERIFY_CREATED');
      expect(EVENT_TYPE.SETTLE_CREATED).toBe('SETTLE_CREATED');
      expect(EVENT_TYPE.PRODUCE_CREATED).toBe('PRODUCE_CREATED');
      expect(EVENT_TYPE.GATE_ADVANCED).toBe('GATE_ADVANCED');
    });
  });

  describe('createEventId', () => {
    it('creates event ids', () => {
      const id = createEventId();
      expect(id).toMatch(/^evt-/);
    });
    it('creates unique ids', () => {
      expect(createEventId()).not.toBe(createEventId());
    });
  });

  describe('createEvent', () => {
    it('creates a valid event envelope', () => {
      const event = createEvent({
        eventType: EVENT_TYPE.ENTITY_CREATED,
        subjectId: 'ent-1',
        actorId: 'user-1',
        occurredAt: '2026-01-01T00:00:00Z',
        source: { system: 'aptlabs-web', method: 'ui.create' },
        payload: { name: 'Test Entity' },
      });
      expect(isAptEvent(event)).toBe(true);
      expect(event.eventId).toMatch(/^evt-/);
      expect(event.eventType).toBe('ENTITY_CREATED');
      expect(event.schemaVersion).toBe('1.0.0');
      expect(event.subjectId).toBe('ent-1');
      expect(event.actorId).toBe('user-1');
      expect(event.occurredAt).toBe('2026-01-01T00:00:00Z');
      expect(event.recordedAt).toBeDefined();
      expect(event.source.system).toBe('aptlabs-web');
      expect(event.source.method).toBe('ui.create');
      expect(event.payload.name).toBe('Test Entity');
    });
    it('records occurredAt vs recordedAt separately', () => {
      const event = createEvent({
        eventType: EVENT_TYPE.ENTITY_CREATED,
        subjectId: 'ent-1',
        actorId: 'user-1',
        occurredAt: '2026-01-01T00:00:00Z',
        source: { system: 'aptlabs-web', method: 'ui.create' },
        payload: {},
        recordedAt: '2026-01-02T00:00:00Z',
      });
      expect(event.occurredAt).toBe('2026-01-01T00:00:00Z');
      expect(event.recordedAt).toBe('2026-01-02T00:00:00Z');
      expect(event.occurredAt).not.toBe(event.recordedAt);
    });
    it('accepts optional fields', () => {
      const event = createEvent({
        eventType: EVENT_TYPE.ENTITY_CREATED,
        subjectId: 'ent-1',
        actorId: 'user-1',
        occurredAt: '2026-01-01T00:00:00Z',
        source: { system: 'aptlabs-web', method: 'ui.create' },
        payload: {},
        organizationId: 'org-1',
        placeId: 'place-1',
        correlationId: 'corr-1',
        causationId: 'cause-1',
        evidenceIds: ['ev-1', 'ev-2'],
      });
      expect(event.organizationId).toBe('org-1');
      expect(event.placeId).toBe('place-1');
      expect(event.correlationId).toBe('corr-1');
      expect(event.causationId).toBe('cause-1');
      expect(event.evidenceIds).toEqual(['ev-1', 'ev-2']);
    });
  });

  describe('createCorrectiveEvent', () => {
    it('creates a corrective event with correction metadata', () => {
      const event = createCorrectiveEvent({
        correctsEventId: 'evt-old',
        correctionReason: 'Fixed typo in name',
        eventType: EVENT_TYPE.ENTITY_CORRECTED,
        subjectId: 'ent-1',
        actorId: 'user-1',
        occurredAt: '2026-01-02T00:00:00Z',
        source: { system: 'aptlabs-web', method: 'ui.correct' },
        payload: { name: 'Corrected Name' },
      });
      expect(event.correctsEventId).toBe('evt-old');
      expect(event.correctionReason).toBe('Fixed typo in name');
      expect(event.eventType).toBe('ENTITY_CORRECTED');
    });
  });

  describe('isAptEvent', () => {
    it('returns false for invalid events', () => {
      expect(isAptEvent(null)).toBe(false);
      expect(isAptEvent({})).toBe(false);
      expect(isAptEvent({ eventId: '1' })).toBe(false);
    });
  });
});
