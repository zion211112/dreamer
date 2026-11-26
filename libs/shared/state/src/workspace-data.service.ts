import { Injectable, signal } from '@angular/core';

export interface WorkspaceOrganization {
  id: string;
  name: string;
  standing: string;
  role: string;
}

export interface WorkspaceUndertaking {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationStanding: string;
  title: string;
  scope: string;
  status: 'open' | 'active' | 'closed';
  createdAt: string;
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
      this.error.set(error instanceof Error ? error.message : 'workspace_unavailable');
    } finally {
      this.loading.set(false);
    }
  }

  organizations(): Promise<WorkspaceOrganization[]> {
    return this.get<{ data: WorkspaceOrganization[] }>('/api/me/organizations').then((result) => result.data);
  }

  undertakings(): Promise<WorkspaceUndertaking[]> {
    return this.get<{ data: WorkspaceUndertaking[] }>('/api/undertakings').then((result) => result.data);
  }

  network(): Promise<WorkspaceNetwork> {
    return this.get<{ data: WorkspaceNetwork }>('/api/me/network').then((result) => result.data);
  }

  records(): Promise<{ undertakings: WorkspaceUndertaking[]; events: WorkspaceEvent[] }> {
    return this.get<{ data: { undertakings: WorkspaceUndertaking[]; events: WorkspaceEvent[] } }>('/api/records').then((result) => result.data);
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(path, { credentials: 'same-origin' });
    const body = await response.json() as T & { error?: string };
    if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
    return body;
  }
}
