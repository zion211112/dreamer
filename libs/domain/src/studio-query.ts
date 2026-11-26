import { z } from 'zod';
import { STUDIO_OBJECT_TYPE_IDS } from './studio-ontology';

/**
 * Studio query contract. The API and the browser parse the same schema, so a
 * client cannot invent a filter shape the server will silently ignore.
 */
export const studioObjectTypeSchema = z.enum(STUDIO_OBJECT_TYPE_IDS);

export const studioSortSchema = z.enum(['recent', 'title', 'status']);

export const studioQuerySchema = z.object({
  type: studioObjectTypeSchema,
  search: z.string().trim().max(120).optional(),
  status: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  filters: z.record(z.string().max(40), z.union([z.string().max(160), z.array(z.string().max(160)).max(8)])).optional(),
  sort: studioSortSchema.default('recent'),
  limit: z.number().int().min(1).max(100).default(40),
  offset: z.number().int().min(0).max(5000).default(0),
}).strict();

export type StudioQuery = z.infer<typeof studioQuerySchema>;

export const studioGraphQuerySchema = z.object({
  type: studioObjectTypeSchema,
  id: z.uuid(),
  depth: z.coerce.number().int().min(1).max(2).default(1),
}).strict();

export type StudioGraphQuery = z.infer<typeof studioGraphQuerySchema>;

export function parseStudioQuery(input: unknown) {
  return studioQuerySchema.safeParse(input);
}

export function parseStudioGraphQuery(input: unknown) {
  return studioGraphQuerySchema.safeParse(input);
}

/** Builds the search-param form of a query so Studio views are deep-linkable. */
export function studioQueryParams(query: StudioQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set('type', query.type);
  if (query.search) params.set('q', query.search);
  for (const status of query.status ?? []) params.append('status', status);
  for (const [key, value] of Object.entries(query.filters ?? {})) {
    for (const entry of Array.isArray(value) ? value : [value]) params.append(`f.${key}`, entry);
  }
  if (query.sort !== 'recent') params.set('sort', query.sort);
  if (query.offset > 0) params.set('offset', String(query.offset));
  return params;
}

/** Reads a deep-linkable Studio view back into the same query contract. */
export function studioQueryFromParams(params: URLSearchParams, fallbackType: StudioQuery['type'] = 'undertaking'): StudioQuery {
  const type = params.get('type') ?? fallbackType;
  const filters: Record<string, string[]> = {};
  for (const [key, value] of params.entries()) {
    if (!key.startsWith('f.')) continue;
    (filters[key.slice(2)] ??= []).push(value);
  }
  const parsed = studioQuerySchema.safeParse({
    type,
    search: params.get('q') ?? undefined,
    status: params.getAll('status'),
    filters: Object.keys(filters).length ? filters : undefined,
    sort: params.get('sort') ?? 'recent',
    limit: Number(params.get('limit') ?? 40) || 40,
    offset: Number(params.get('offset') ?? 0) || 0,
  });
  return parsed.success ? parsed.data : studioQuerySchema.parse({ type: fallbackType });
}
