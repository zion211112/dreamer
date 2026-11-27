import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './api';

describe('same-origin API boundary', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('includes same-origin cookies on reads', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await api.get('/api/undertakings');

    expect(fetchMock).toHaveBeenCalledWith('/api/undertakings', { credentials: 'same-origin' });
  });

  it('preserves status and server error code for authorization failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 })));

    await expect(api.get('/api/workbench')).rejects.toMatchObject({ status: 403, code: 'forbidden' });
  });

  it('sends mutations as same-origin JSON requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { id: 'work-1' } }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await api.post('/api/organizations/org-1/undertakings', { title: 'Repair press', scope: 'Restore the community press.' });

    expect(fetchMock).toHaveBeenCalledWith('/api/organizations/org-1/undertakings', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Repair press', scope: 'Restore the community press.' }),
    });
  });
});
