import type { RollEntry } from './db/roll';

export type RollOutcomeKind =
  | 'accepted'
  | 'partial'
  | 'disputed'
  | 'cancelled'
  | 'unresolved'
  | 'proposed'
  | 'not-recorded';

export interface RollOutcome {
  label: string;
  kind: RollOutcomeKind;
}

const OUTCOME_BY_ID: Record<string, RollOutcome> = {
  'roll-2026-10-17-03': { label: 'accepted', kind: 'accepted' },
  'roll-2026-10-20-01': { label: 'proposed', kind: 'proposed' },
  'roll-2026-11-01-07': { label: 'partial', kind: 'partial' },
  'roll-2026-11-05-02': { label: 'disputed', kind: 'disputed' },
  'roll-2026-11-07-09': { label: 'cancelled', kind: 'cancelled' },
};

export function getRollOutcome(entry: Pick<RollEntry, 'id' | 'acceptance'>): RollOutcome {
  return OUTCOME_BY_ID[entry.id]
    ?? (entry.acceptance.accepted_at.trim()
      ? { label: 'accepted', kind: 'accepted' }
      : { label: 'Not recorded', kind: 'not-recorded' });
}
