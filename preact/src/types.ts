export type UndertakingStatus = 'open' | 'active' | 'closed';
export type ReviewDecision = 'accepted' | 'disputed' | 'needs_revision';

export interface WorkspaceOrganization {
  id: string;
  name: string;
  standing: string;
  role: string;
}

export interface WorkActions {
  canPostWork: boolean;
  canTriageInterests: boolean;
  canIssueOffer: boolean;
  canClose: boolean;
  canRegisterInterest: boolean;
  canAcceptPendingOffer: boolean;
  canReport: boolean;
  canReflect: boolean;
}

export interface WorkspaceUndertaking {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationStanding: string;
  title: string;
  scope: string;
  status: UndertakingStatus;
  createdAt: string;
  isMember?: boolean;
  isParticipant?: boolean;
  hasInterest?: boolean;
  pendingOfferId?: string | null;
  interestCount?: number;
  reportCount?: number;
  actions?: WorkActions;
}

export interface WorkbenchSummary {
  person: { id: string; name: string };
  organizations: WorkspaceOrganization[];
  counts: { needsYou: number; offersToYou: number; myWork: number; myInterests: number };
  needsYou: Array<{
    kind: 'interest' | 'report';
    interestId?: string;
    reportId?: string;
    undertakingId: string;
    title: string;
    organizationName: string;
    personName: string;
    message?: string;
    report?: string;
    createdAt: string;
  }>;
  offersToYou: Array<{ offerId: string; undertakingId: string; title: string; organizationName: string; proposal: string; issuedByName: string; createdAt: string }>;
  myWork: Array<{ undertakingId: string; title: string; scope: string; status: UndertakingStatus; organizationId: string; organizationName: string; joinedAt: string }>;
  myInterests: Array<{ undertakingId: string; title: string; status: UndertakingStatus; organizationName: string; message: string; createdAt: string }>;
  organizationWork: Array<{
    id: string; title: string; status: UndertakingStatus; organizationId: string; organizationName: string; createdAt: string;
    interestCount: number; offerCount: number; participantCount: number; reportCount: number;
  }>;
}

export interface UndertakingReview {
  id: string;
  reportId: string;
  reviewerName: string;
  decision: ReviewDecision;
  rationale: string;
  createdAt: string;
}

export interface ParticipantReflection {
  id: string;
  latestVersionId: string;
  undertakingId: string;
  authorPersonId: string;
  authorName: string;
  learning: string;
  localValue: string;
  financialRecordAssessment: 'consider' | 'not_indicated' | 'uncertain';
  financialRecordRationale: string;
  version: number;
  createdAt: string;
}

export interface UndertakingDetail {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationStanding: string;
  title: string;
  scope: string;
  status: UndertakingStatus;
  createdAt: string;
  createdByPersonId: string;
  createdByName: string;
  position: {
    role: string | null;
    isMember: boolean;
    isParticipant: boolean;
    hasInterest: boolean;
    pendingOffer: { id: string; proposal: string; issuedByName: string } | null;
    canReview: boolean;
  };
  actions: WorkActions;
  myReflection: ParticipantReflection | null;
  reflections: ParticipantReflection[];
  interests: Array<{ id: string; personId: string; personName: string; message: string; createdAt: string; declined: boolean }>;
  offers: Array<{ id: string; offeredToPersonId: string; offeredToPersonName: string; issuedByName: string; proposal: string; status: 'pending' | 'accepted' | 'declined'; createdAt: string; decidedAt: string | null }>;
  participants: Array<{ personId: string; name: string; joinedAt: string }>;
  reports: Array<{ id: string; authorPersonId: string; authorName: string; report: string; createdAt: string; review: UndertakingReview | null }>;
  events: Array<{ id: string; actorName: string; action: string; subjectType: string; subjectId: string; occurredAt: string }>;
}

export interface WorkspaceEvent {
  id: string;
  organizationId: string | null;
  organizationName: string | null;
  actorName: string;
  action: string;
  subjectType: string;
  subjectId: string;
  occurredAt: string;
}

export interface WorkspaceNetwork {
  organizations: WorkspaceOrganization[];
  members: Array<{ id: string; name: string; organizationId: string; organizationName: string; role: string }>;
}

export type StudioObjectTypeId = 'organization' | 'undertaking' | 'person' | 'interest' | 'offer' | 'report' | 'review' | 'event';
export interface StudioObject {
  type: StudioObjectTypeId;
  id: string;
  title: string;
  subtitle: string;
  status: string | null;
  href: string | null;
  properties: Record<string, string>;
  undertakingId?: string | null;
}
export interface StudioObjectSet {
  type: StudioObjectTypeId;
  total: number;
  facets: Array<{ value: string; count: number }>;
  objects: StudioObject[];
}
export interface StudioTypeDefinition {
  id: StudioObjectTypeId;
  label: string;
  plural: string;
  description: string;
  hrefTemplate: string | null;
  properties: Array<{ key: string; label: string; kind: string }>;
  filterable: string[];
}
export interface StudioOverview {
  person: { id: string };
  counts: Record<string, number>;
  organizations: Array<{ id: string; name: string; role: string }>;
  types: StudioTypeDefinition[];
  serverTime: string;
}
export interface StudioGraphNode {
  type: StudioObjectTypeId;
  id: string;
  title: string;
  subtitle: string;
  status: string | null;
}
export interface StudioGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  linkType: string;
}
export interface StudioGraph {
  root: string;
  nodes: StudioGraphNode[];
  edges: StudioGraphEdge[];
}
