import { FAMILY, type Family } from './types';

export type NetworkStructureId = 'actors' | 'resources' | 'intentions' | 'commitments' | 'activity' | 'knowledge';

export interface NetworkStructure {
  id: NetworkStructureId;
  label: string;
  description: string;
  families: readonly Family[];
}

/** Contextual family kept distinct from the six network structures. */
export const NETWORK_CONTEXT_FAMILIES = [FAMILY.PLACE] as const satisfies readonly Family[];

/** These families cut across structures; they are not additional workflow stages. */
export const NETWORK_CROSS_CUTTING_FAMILIES = [
  FAMILY.EXCHANGE,
  FAMILY.VALUE,
  FAMILY.GOVERNANCE,
] as const satisfies readonly Family[];

/** High-level lenses, not a mandatory sequence or an exhaustive database taxonomy. */
export const NETWORK_STRUCTURES = [
  {
    id: 'actors',
    label: 'Actors',
    description: 'Participants with agency and their legitimate collectives.',
    families: [FAMILY.ACTOR],
  },
  {
    id: 'resources',
    label: 'Resources',
    description: 'Capabilities and things available, required, controlled, or stewarded.',
    families: [FAMILY.CAPABILITY, FAMILY.RESOURCE],
  },
  {
    id: 'intentions',
    label: 'Intentions',
    description: 'Situated needs, opportunities, objectives, proposals, and constraints.',
    families: [FAMILY.INTENTION],
  },
  {
    id: 'commitments',
    label: 'Commitments',
    description: 'Agreements, obligations, roles, and scoped authority.',
    families: [FAMILY.COMMITMENT],
  },
  {
    id: 'activity',
    label: 'Activity',
    description: 'Work and events through which participants coordinate and change conditions.',
    families: [FAMILY.WORK, FAMILY.ACTIVITY, FAMILY.EVENT],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    description: 'Evidence, outcomes, findings, methods, and institutional memory.',
    families: [FAMILY.OUTPUT_OUTCOME, FAMILY.EVIDENCE, FAMILY.KNOWLEDGE],
  },
] as const satisfies readonly NetworkStructure[];
