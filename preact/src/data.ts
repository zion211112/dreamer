import { ApiError, api } from './api';
import { parseStudioGraphQuery, parseStudioQuery, type StudioQuery } from '../../libs/domain/src/studio-query';
import type { StudioGraph, StudioObjectSet, StudioOverview, StudioObjectTypeId, UndertakingDetail, WorkspaceEvent, WorkspaceNetwork, WorkspaceOrganization, WorkspaceUndertaking, WorkbenchSummary } from './types';

export const data = {
  organizations: () => api.get<WorkspaceOrganization[]>('/api/me/organizations'),
  undertakings: (query = '') => api.get<WorkspaceUndertaking[]>(`/api/undertakings${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  network: () => api.get<WorkspaceNetwork>('/api/me/network'),
  records: async () => {
    const [work, network] = await Promise.all([
      api.get<{ undertakings: WorkspaceUndertaking[]; events: WorkspaceEvent[] }>('/api/records'),
      api.get<WorkspaceNetwork>('/api/me/network'),
    ]);
    return { ...work, organizations: network.organizations };
  },
  workbench: () => api.get<WorkbenchSummary>('/api/workbench'),
  undertaking: (id: string) => api.get<UndertakingDetail>(`/api/undertakings/${encodeURIComponent(id)}`),
  studioOverview: () => api.get<StudioOverview>('/api/studio'),
  studioQuery: (input: StudioQuery) => {
    const parsed = parseStudioQuery(input);
    if (!parsed.success) throw new ApiError(400, 'invalid_studio_query');
    return api.post<StudioObjectSet>('/api/studio/query', parsed.data);
  },
  studioGraph: (type: StudioObjectTypeId, id: string, depth: 1 | 2) => {
    const parsed = parseStudioGraphQuery({ type, id, depth });
    if (!parsed.success) throw new ApiError(400, 'invalid_studio_graph_query');
    return api.get<StudioGraph>(`/api/studio/graph?type=${encodeURIComponent(parsed.data.type)}&id=${encodeURIComponent(parsed.data.id)}&depth=${parsed.data.depth}`);
  },
  createOrganization: (name: string) => api.post<{ id: string }>('/api/organizations', { name }),
  addMember: (organizationId: string, email: string, role: string) => api.post<{ personId: string; name: string; role: string }>(`/api/organizations/${organizationId}/members`, { email, role }),
  createUndertaking: (organizationId: string, body: { title: string; scope: string }) => api.post<{ id: string }>(`/api/organizations/${organizationId}/undertakings`, body),
  registerInterest: (undertakingId: string, message: string) => api.post(`/api/undertakings/${undertakingId}/interests`, { message }),
  issueOffer: (organizationId: string, undertakingId: string, interestId: string, proposal: string) => api.post(`/api/organizations/${organizationId}/undertakings/${undertakingId}/offers`, { interestId, proposal }),
  decideOffer: (offerId: string, decision: 'accepted' | 'declined') => api.post(`/api/undertaking-offers/${offerId}/decision`, { decision }),
  submitReport: (undertakingId: string, report: string) => api.post(`/api/undertakings/${undertakingId}/reports`, { report }),
  submitReview: (organizationId: string, reportId: string, decision: 'accepted' | 'disputed' | 'needs_revision', rationale: string) => api.post(`/api/organizations/${organizationId}/reports/${reportId}/reviews`, { decision, rationale }),
  saveReflection: (undertakingId: string, body: { learning: string; localValue: string; financialRecordAssessment: 'consider' | 'not_indicated' | 'uncertain'; financialRecordRationale: string; expectedVersion: number }) => api.post(`/api/undertakings/${encodeURIComponent(undertakingId)}/reflection`, body),
  closeUndertaking: (organizationId: string, undertakingId: string) => api.post(`/api/organizations/${organizationId}/undertakings/${undertakingId}/close`, {}),
  declineInterest: (organizationId: string, undertakingId: string, interestId: string) => api.post(`/api/organizations/${organizationId}/undertakings/${undertakingId}/interests/${interestId}/decline`, {}),
};
