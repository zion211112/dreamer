import 'server-only';
import { z } from 'zod';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

const institutionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  kind: z.enum(['school', 'hospital', 'startup', 'community', 'builder']),
  location: z.string(),
  public_summary: z.string().nullable(),
  directory_published_at: z.string(),
});

const institutionTenderSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  organization_id: z.string().uuid(),
});

export type PublishedInstitution = {
  id: string;
  name: string;
  kind: z.infer<typeof institutionSchema>['kind'];
  location: string;
  summary: string | null;
  publishedAt: string;
  fundingSlug: string | null;
};

export async function getPublishedInstitutions(): Promise<{
  configured: boolean;
  institutions: PublishedInstitution[];
  error: string | null;
}> {
  if (!hasSupabaseConfiguration()) {
    return { configured: false, institutions: [], error: null };
  }

  const supabase = await createSupabaseServerClient();
  const [institutionsResult, tendersResult] = await Promise.all([
    supabase
      .from('public_institution_directory')
      .select('id,name,kind,location,public_summary,directory_published_at')
      .order('name'),
    supabase
      .from('public_institution_tenders')
      .select('id,slug,organization_id'),
  ]);

  if (institutionsResult.error) {
    return {
      configured: true,
      institutions: [],
      error: `Published institutions could not be loaded: ${institutionsResult.error.message}`,
    };
  }
  if (tendersResult.error) {
    return {
      configured: true,
      institutions: [],
      error: `Institution work links could not be loaded: ${tendersResult.error.message}`,
    };
  }

  try {
    const institutions = z.array(institutionSchema).parse(institutionsResult.data ?? []);
    const tenders = z.array(institutionTenderSchema).parse(tendersResult.data ?? []);
    const fundingByOrganization = new Map<string, string>();
    for (const tender of tenders) {
      if (!fundingByOrganization.has(tender.organization_id)) {
        fundingByOrganization.set(tender.organization_id, tender.slug);
      }
    }

    return {
      configured: true,
      institutions: institutions.map(institution => ({
        id: institution.id,
        name: institution.name,
        kind: institution.kind,
        location: institution.location,
        summary: institution.public_summary,
        publishedAt: institution.directory_published_at,
        fundingSlug: fundingByOrganization.get(institution.id) ?? null,
      })),
      error: null,
    };
  } catch (error) {
    return {
      configured: true,
      institutions: [],
      error: error instanceof Error
        ? `Institution data was malformed: ${error.message}`
        : 'Institution data was malformed.',
    };
  }
}
