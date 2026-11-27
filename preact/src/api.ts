export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, credentials: 'same-origin' });
  const body = await response.json().catch(() => ({})) as { data?: T; error?: string };
  if (!response.ok) throw new ApiError(response.status, body.error ?? `request_failed_${response.status}`);
  if (!('data' in body)) throw new ApiError(response.status, 'invalid_response');
  return body.data as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body: unknown) => request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
};

export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session has expired. Sign in again.';
    if (error.status === 403) return 'You are not authorized for this action.';
    if (error.status === 404) return 'This record is no longer available.';
    if (error.status === 409) return 'This record changed. Refresh and try again.';
    if (error.status >= 500) return 'The workspace service is unavailable. Try again shortly.';
    return error.code.replaceAll('_', ' ');
  }
  return 'The workspace service is unavailable. Check your connection and try again.';
}
