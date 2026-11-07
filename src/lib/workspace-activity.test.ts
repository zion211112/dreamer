import { describe, expect, it } from 'vitest';
import { getEngineActivityStatus, type EngineRunStatus } from './workspace-activity';

describe('getEngineActivityStatus', () => {
  it('reportsNoActiveRunsForNull', () => {
    expect(getEngineActivityStatus(null)).toBe('No active runs');
  });

  it('labelsEachRunState', () => {
    const labels: Record<EngineRunStatus, string> = {
      queued: 'Queued',
      running: 'Running',
      completed: 'Completed',
      blocked: 'Blocked',
      failed: 'Failed',
      cancelled: 'Cancelled',
    };

    for (const [status, label] of Object.entries(labels) as [EngineRunStatus, string][]) {
      expect(getEngineActivityStatus(status)).toBe(label);
    }
  });
});
