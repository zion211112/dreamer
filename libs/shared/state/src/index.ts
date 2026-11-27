/**
 * @apt-labs/shared/state — Angular signals (replacing Pinia stores)
 *
 * L1: Zoneless, signal-based state management.
 */

export { CoordinationService } from './coordination.service';
export type { NeedRow, NeedStatus } from './coordination.service';

export { RecordsService } from './records.service';
export type { RecordsView, RecordsRow } from './records.service';

export { ValueService } from './value.service';
export type { ValueRow, ValueMetrics, ValueFilter } from './value.service';

export { NetworkService, GROUP_LABELS, groupOf } from './network.service';
export type { NetworkGroup, DirectoryRow } from './network.service';
export { WorkspaceDataService } from './workspace-data.service';
export type { WorkActions, WorkbenchSummary, WorkspaceEvent, WorkspaceNetwork, WorkspaceOrganization, WorkspaceUndertaking, UndertakingDetail, UndertakingReview, ParticipantReflection, UndertakingStatus, OfferStatus, ReviewDecision, OrganizationRole } from './workspace-data.service';
export { describeWorkspaceError } from './workspace-data.service';
export { StudioDataService } from './studio-data.service';
export type { StudioGraph, StudioGraphEdge, StudioGraphNode, StudioObject, StudioObjectSet, StudioOverview, StudioQueryInput, StudioTypeDefinition } from './studio-data.service';
