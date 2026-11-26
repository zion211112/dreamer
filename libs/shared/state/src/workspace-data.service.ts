import { Injectable, signal } from '@angular/core';

export type UndertakingStatus = 'open' | 'active' | 'closed';
export type OfferStatus = 'pending' | 'accepted' | 'declined';
export type ReviewDecision = 'accepted' | 'disputed' | 'needs_revision';
export type OrganizationRole = 'owner' | 'administrator' | 'manager' | 'member' | 'viewer';

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
    role: OrganizationRole | null;
    isMember: boolean;
    isParticipant: boolean;
    hasInterest: boolean;
    pendingOffer: { id: string; proposal: string; issuedByName: string } | null;
    canReview: boolean;
  };
  actions: WorkActions;
  interests: Array<{ id: string; personId: string; personName: string; message: string; createdAt: string; declined: boolean }>;
  offers: Array<{ id: string; offeredToPersonId: string; offeredToPersonName: string; issuedByName: string; proposal: string; status: OfferStatus; createdAt: string; decidedAt: string | null }>;
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

const ERROR_COPY: Record<string, string> = {
  unauthenticated: 'Your session is unavailable. Sign in again.',
  forbidden: 'Your account is not authorised for this action.',
  person_identity_missing: 'This account has no person record yet. Sign out and sign in again.',
  undertaking_unavailable: 'That undertaking is no longer open.',
  undertaking_closed: 'This undertaking is closed. Its history stays readable, but no new work can be added.',
  undertaking_already_closed: 'This undertaking is already closed.',
  interest_already_submitted: 'You have already expressed interest in this undertaking.',
  interest_not_found: 'That expression of interest no longer exists.',
  interest_has_offer: 'An offer has already been issued from that interest.',
  interest_already_declined: 'That expression of interest was already declined.',
  interest_not_found_in_work: 'That interest does not belong to this undertaking.',
  offer_already_exists: 'That person already has an offer for this undertaking.',
  offer_unavailable: 'That offer is no longer available.',
  offer_already_decided: 'That offer was already decided.',
  participant_required: 'Only an accepted participant can report on this work.',
  author_cannot_review_own_report: 'The author of a report cannot review it.',
  report_already_reviewed: 'This report already has a review.',
  report_not_found: 'That report no longer exists.',
  invalid_undertaking: 'A title of at least 3 characters and a scope are required.',
  invalid_interest: 'Write at least one sentence about what you bring to this scope.',
  invalid_offer: 'Describe the commitment in the offer.',
  invalid_report: 'Describe what was delivered.',
  invalid_review: 'Choose a decision and write the rationale.',
  invalid_organization: 'Give the organization a name.',
  organization_members_do_not_submit_interest: 'Members of the owning organization decide this work; they do not apply to it.',
  not_found: 'That record does not exist or is not visible to you.',
  administrator_required: 'Only an owner or administrator can add members.',
  no_account_for_email: 'No account exists with that email. Ask the person to sign up first.',
  member_exists: 'That person is already a member of this organization.',
  already_a_member: 'You cannot add yourself.',
  invalid_membership: 'Enter a valid email and choose a role.',
};

export function describeWorkspaceError(error: unknown): string {
  if (!(error instanceof Error)) return 'The request could not be completed. Please try again.';
  if (error.message.includes('Failed to fetch')) return 'The workspace service is unavailable. Check the server and try again.';
  return ERROR_COPY[error.message] ?? error.message.replaceAll('_', ' ');
}

@Injectable({ providedIn: 'root' })
export class WorkspaceDataService {
  readonly organizationsState = signal<WorkspaceOrganization[]>([]);
  readonly undertakingsState = signal<WorkspaceUndertaking[]>([]);
  readonly networkState = signal<WorkspaceNetwork>({ organizations: [], members: [] });
  readonly recordsState = signal<{ undertakings: WorkspaceUndertaking[]; events: WorkspaceEvent[] }>({ undertakings: [], events: [] });
  readonly loading = signal(false);
  readonly error = signal('');

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [organizations, undertakings, network, records] = await Promise.all([
        this.organizations(), this.undertakings(), this.network(), this.records(),
      ]);
      this.organizationsState.set(organizations);
      this.undertakingsState.set(undertakings);
      this.networkState.set(network);
      this.recordsState.set(records);
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.loading.set(false);
    }
  }

  organizations(): Promise<WorkspaceOrganization[]> {
    return this.get<{ data: WorkspaceOrganization[] }>('/api/me/organizations').then((result) => result.data);
  }

  undertakings(query = ''): Promise<WorkspaceUndertaking[]> {
    const suffix = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
    return this.get<{ data: WorkspaceUndertaking[] }>(`/api/undertakings${suffix}`).then((result) => result.data);
  }

  network(): Promise<WorkspaceNetwork> {
    return this.get<{ data: WorkspaceNetwork }>('/api/me/network').then((result) => result.data);
  }

  records(): Promise<{ undertakings: WorkspaceUndertaking[]; events: WorkspaceEvent[] }> {
    return this.get<{ data: { undertakings: WorkspaceUndertaking[]; events: WorkspaceEvent[] } }>('/api/records').then((result) => result.data);
  }

  workbench(): Promise<WorkbenchSummary> {
    return this.get<{ data: WorkbenchSummary }>('/api/workbench').then((result) => result.data);
  }

  undertaking(id: string): Promise<UndertakingDetail> {
    return this.get<{ data: UndertakingDetail }>(`/api/undertakings/${encodeURIComponent(id)}`).then((result) => result.data);
  }

  createOrganization(name: string): Promise<{ id: string }> {
    return this.send<{ data: { id: string } }>('/api/organizations', 'POST', { name }).then((result) => result.data);
  }

  addMember(organizationId: string, email: string, role: string): Promise<{ personId: string; name: string; role: string }> {
    return this.send<{ data: { personId: string; name: string; role: string } }>(`/api/organizations/${organizationId}/members`, 'POST', { email, role }).then((result) => result.data);
  }

  createUndertaking(organizationId: string, body: { title: string; scope: string }): Promise<{ id: string }> {
    return this.send<{ data: { id: string } }>(`/api/organizations/${organizationId}/undertakings`, 'POST', body).then((result) => result.data);
  }

  registerInterest(undertakingId: string, message: string): Promise<unknown> {
    return this.send(`/api/undertakings/${undertakingId}/interests`, 'POST', { message });
  }

  issueOffer(organizationId: string, undertakingId: string, interestId: string, proposal: string): Promise<unknown> {
    return this.send(`/api/organizations/${organizationId}/undertakings/${undertakingId}/offers`, 'POST', { interestId, proposal });
  }

  decideOffer(offerId: string, decision: 'accepted' | 'declined'): Promise<unknown> {
    return this.send(`/api/undertaking-offers/${offerId}/decision`, 'POST', { decision });
  }

  submitReport(undertakingId: string, report: string): Promise<unknown> {
    return this.send(`/api/undertakings/${undertakingId}/reports`, 'POST', { report });
  }

  submitReview(organizationId: string, reportId: string, decision: ReviewDecision, rationale: string): Promise<unknown> {
    return this.send(`/api/organizations/${organizationId}/reports/${reportId}/reviews`, 'POST', { decision, rationale });
  }

  closeUndertaking(organizationId: string, undertakingId: string): Promise<unknown> {
    return this.send(`/api/organizations/${organizationId}/undertakings/${undertakingId}/close`, 'POST', {});
  }

  declineInterest(organizationId: string, undertakingId: string, interestId: string): Promise<unknown> {
    return this.send(`/api/organizations/${organizationId}/undertakings/${undertakingId}/interests/${interestId}/decline`, 'POST', {});
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(path, { credentials: 'same-origin' });
    return this.read<T>(response);
  }

  async send<T = unknown>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown): Promise<T> {
    const response = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return this.read<T>(response);
  }

  private async read<T>(response: Response): Promise<T> {
    const body = await response.json().catch(() => ({})) as T & { error?: string };
    if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
    return body;
  }
}
