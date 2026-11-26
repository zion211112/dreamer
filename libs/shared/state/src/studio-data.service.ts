/**
 * @apt-labs/shared/state — StudioDataService
 *
 * Reads the authorized object sets and neighborhoods that make the workspace a
 * studio: a typed surface over the same records, scoped on the server to what
 * the signed-in person may see. No aggregate is computed in the browser that
 * the API did not already authorize.
 */
import { Injectable, signal } from '@angular/core';
import type { StudioObjectTypeId } from '@apt-labs/domain';
import { describeWorkspaceError } from './workspace-data.service';

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

export interface StudioQueryInput {
  type: StudioObjectTypeId;
  search?: string;
  status?: string[];
  sort?: 'recent' | 'title' | 'status';
  limit?: number;
  offset?: number;
}

@Injectable({ providedIn: 'root' })
export class StudioDataService {
  readonly overview = signal<StudioOverview | null>(null);
  readonly result = signal<StudioObjectSet | null>(null);
  readonly graph = signal<StudioGraph | null>(null);
  readonly selected = signal<StudioObject | null>(null);
  readonly loading = signal(false);
  readonly graphLoading = signal(false);
  readonly error = signal('');

  async loadOverview(): Promise<void> {
    try {
      const response = await this.get<{ data: StudioOverview }>('/api/studio');
      this.overview.set(response.data);
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    }
  }

  async query(input: StudioQueryInput): Promise<StudioObjectSet | null> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await this.send<{ data: StudioObjectSet }>('/api/studio/query', 'POST', {
        ...input,
        limit: input.limit ?? 40,
        offset: input.offset ?? 0,
      });
      this.result.set(response.data);
      return response.data;
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async loadGraph(type: StudioObjectTypeId, id: string, depth = 1): Promise<void> {
    this.graphLoading.set(true);
    try {
      const response = await this.get<{ data: StudioGraph }>(`/api/studio/graph?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}&depth=${depth}`);
      this.graph.set(response.data);
    } catch (error) {
      this.graph.set(null);
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.graphLoading.set(false);
    }
  }

  clearGraph(): void {
    this.graph.set(null);
    this.selected.set(null);
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(path, { credentials: 'same-origin' });
    return this.read<T>(response);
  }

  private async send<T>(path: string, method: 'POST', body: unknown): Promise<T> {
    const response = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return this.read<T>(response);
  }

  private async read<T>(response: Response): Promise<T> {
    const body = await response.json().catch(() => ({})) as T & { error?: string };
    if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
    return body;
  }
}
