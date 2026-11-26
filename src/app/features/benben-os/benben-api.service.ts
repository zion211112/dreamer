import { Injectable } from '@angular/core';

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code);
    this.name = 'ApiError';
  }
}

/** Thin client for /api/benbenos. Session cookies travel with each request. */
@Injectable({ providedIn: 'root' })
export class BenbenApi {
  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async send<T>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
    return this.request<T>(method, path, body);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`/api/benbenos${path}`, {
        method,
        credentials: 'include',
        headers: body === undefined ? {} : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, 'network_error');
    }
    const text = await response.text();
    const payload = text ? (JSON.parse(text) as { data?: T; error?: string }) : {};
    if (!response.ok) throw new ApiError(response.status, payload.error ?? 'internal_error');
    return payload.data as T;
  }
}
