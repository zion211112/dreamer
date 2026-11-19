import { describe, it, expect } from 'vitest';
import {
  CANONICAL_WORKFLOWS,
  isWorkflowStatus,
  isWorkflowDefinition,
} from './workflow';
import type { ActionKind } from './actions';

describe('ontology workflow', () => {
  describe('CANONICAL_WORKFLOWS', () => {
    it('defines five canonical workflows', () => {
      expect(CANONICAL_WORKFLOWS).toHaveLength(5);
    });
    it('has workflows for all five kinetic actions', () => {
      const kinds = new Set(CANONICAL_WORKFLOWS.map((w) => w.actionKind));
      expect(kinds.has('commit')).toBe(true);
      expect(kinds.has('assign')).toBe(true);
      expect(kinds.has('verify')).toBe(true);
      expect(kinds.has('settle')).toBe(true);
      expect(kinds.has('produce')).toBe(true);
    });
    it('SETTLE requires approval', () => {
      const settle = CANONICAL_WORKFLOWS.find((w) => w.actionKind === 'settle');
      expect(settle?.requiresApproval).toBe(true);
    });
    it('other workflows do not require approval', () => {
      for (const w of CANONICAL_WORKFLOWS) {
        if (w.actionKind !== 'settle') {
          expect(w.requiresApproval).toBe(false);
        }
      }
    });
    it('all workflows are active', () => {
      for (const w of CANONICAL_WORKFLOWS) {
        expect(w.active).toBe(true);
      }
    });
    it('every step has required fields', () => {
      for (const w of CANONICAL_WORKFLOWS) {
        for (const step of w.steps) {
          expect(step.id).toBeDefined();
          expect(step.name).toBeDefined();
          expect(typeof step.required).toBe('boolean');
          expect(typeof step.retryable).toBe('boolean');
          expect(Array.isArray(step.dependsOn)).toBe(true);
        }
      }
    });
  });

  describe('isWorkflowStatus', () => {
    it('returns true for valid statuses', () => {
      expect(isWorkflowStatus('pending')).toBe(true);
      expect(isWorkflowStatus('completed')).toBe(true);
      expect(isWorkflowStatus('failed')).toBe(true);
    });
    it('returns false for invalid statuses', () => {
      expect(isWorkflowStatus('unknown')).toBe(false);
    });
  });

  describe('isWorkflowDefinition', () => {
    it('returns true for valid definitions', () => {
      expect(isWorkflowDefinition(CANONICAL_WORKFLOWS[0])).toBe(true);
    });
    it('returns false for invalid definitions', () => {
      expect(isWorkflowDefinition(null)).toBe(false);
      expect(isWorkflowDefinition({})).toBe(false);
    });
  });
});
