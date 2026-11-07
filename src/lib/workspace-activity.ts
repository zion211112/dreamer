export type EngineRunStatus = 'queued' | 'running' | 'completed' | 'blocked' | 'failed' | 'cancelled';

export interface EngineRunSummary {
  id: string;
  status: EngineRunStatus;
  summary: string;
  pendingProposalCount: number;
}

export function getEngineActivityStatus(status: EngineRunStatus | null): string {
  if (status === null) return 'No active runs';
  return status[0].toUpperCase() + status.slice(1);
}
