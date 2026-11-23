/**
 * @apt-labs/shared/state — Angular signals (replacing Pinia stores)
 *
 * L1: Zoneless, signal-based state management.
 */

export { CoordinationService } from './coordination.service';
export type {
  CommitmentRow,
  KnowledgeOutcome,
  OnboardProviderInput,
  PostNeedInput,
  EvidenceInput,
} from './coordination.service';

export { NetworkService, GROUP_LABELS, groupOf } from './network.service';
export type { NetworkGroup, DirectoryRow } from './network.service';
