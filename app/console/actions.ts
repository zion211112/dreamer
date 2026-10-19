'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import type { SchoolTenderDraft } from '@/lib/console-storage';
import { compileSchoolTenderBOM, parseKesMinorUnits } from '@/lib/school-tender';

export interface SchoolCrewCandidate {
  userId: string;
  displayName: string;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function actionError(error: unknown): string {
  return error instanceof Error ? error.message : 'The school account operation failed.';
}

export async function getSchoolCrewCandidates(): Promise<{
  candidates?: SchoolCrewCandidate[];
  error?: string;
}> {
  if (!hasSupabaseConfiguration()) {
    return { error: 'School publishing is not configured for this deployment.' };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) return { error: 'Sign in with an authorized school account first.' };
    const { data, error } = await supabase.rpc('school_tender_crew_candidates');
    if (error) return { error: `The school team could not be loaded: ${error.message}` };
    if (!Array.isArray(data)) return { error: 'The school team response was invalid.' };
    const candidates: SchoolCrewCandidate[] = [];
    for (const row of data) {
      if (
        typeof row !== 'object' ||
        row === null ||
        !('user_id' in row) ||
        !('display_name' in row) ||
        typeof row.user_id !== 'string' ||
        typeof row.display_name !== 'string'
      ) {
        return { error: 'The school team response contains an invalid member.' };
      }
      candidates.push({ userId: row.user_id, displayName: row.display_name });
    }
    if (candidates.length < 3) {
      return { error: 'Add at least three active, named school members before assigning the Anchor, Builder and Apprentice.' };
    }
    return { candidates };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function publishSchoolTender(input: {
  draft: SchoolTenderDraft;
  anchorUserId: string;
  builderUserId: string;
  apprenticeUserId: string;
}): Promise<{ slug?: string; error?: string }> {
  if (typeof input !== 'object' || input === null || typeof input.draft !== 'object' || input.draft === null) {
    return { error: 'The Tender draft is missing or invalid.' };
  }
  if (!hasSupabaseConfiguration()) {
    return { error: 'School publishing is not configured for this deployment.' };
  }
  const { draft, anchorUserId, builderUserId, apprenticeUserId } = input;
  const assetBuildCostMinor = typeof draft.assetBuildCost === 'string' ? parseKesMinorUnits(draft.assetBuildCost) : undefined;
  const projectedAnnualYieldMinor = draft.projectedAnnualYield.trim()
    ? parseKesMinorUnits(draft.projectedAnnualYield)
    : null;
  const localSpendPercentage = Number(draft.localSpendPercentage);
  const crewWageAllocationMinor = {
    anchor: parseKesMinorUnits(draft.crewWageAllocation.anchor),
    builder: parseKesMinorUnits(draft.crewWageAllocation.builder),
    apprentice: parseKesMinorUnits(draft.crewWageAllocation.apprentice),
  };
  if (
    typeof draft.assetName !== 'string' ||
    draft.assetName.trim().length < 1 ||
    draft.assetName.trim().length > 160 ||
    typeof draft.need !== 'string' ||
    draft.need.trim().length < 1 ||
    draft.need.trim().length > 10000 ||
    assetBuildCostMinor === undefined ||
    assetBuildCostMinor <= 0 ||
    (draft.projectedAnnualYield.trim() !== '' && projectedAnnualYieldMinor === undefined) ||
    !Number.isFinite(localSpendPercentage) ||
    localSpendPercentage < 0 ||
    localSpendPercentage > 100 ||
    crewWageAllocationMinor.anchor === undefined ||
    crewWageAllocationMinor.builder === undefined ||
    crewWageAllocationMinor.apprentice === undefined ||
    crewWageAllocationMinor.anchor + crewWageAllocationMinor.builder + crewWageAllocationMinor.apprentice > assetBuildCostMinor ||
    (projectedAnnualYieldMinor !== null && !draft.economicModelNote.trim()) ||
    !uuidPattern.test(anchorUserId) ||
    !uuidPattern.test(builderUserId) ||
    !uuidPattern.test(apprenticeUserId) ||
    new Set([anchorUserId, builderUserId, apprenticeUserId]).size !== 3
  ) {
    return { error: 'Review the asset economics, itemized build cost and three distinct crew assignments.' };
  }
  let blueprintLines: ReturnType<typeof compileSchoolTenderBOM>;
  try {
    blueprintLines = compileSchoolTenderBOM(draft.blueprintLines, assetBuildCostMinor);
  } catch (error) {
    return { error: `The Tender cannot be published: ${actionError(error)}` };
  }

  const base = draft.assetName.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/g, '') || 'school-need';
  const slug = `${base}-${randomUUID().slice(0, 8)}`;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) return { error: 'Sign in with an authorized school account first.' };
    const { data, error } = await supabase.rpc('publish_school_asset_tender', {
      p_slug: slug,
      p_asset_name: draft.assetName.trim(),
      p_summary: draft.need.trim(),
      p_asset_build_cost_minor: assetBuildCostMinor,
      p_target_amount_minor: assetBuildCostMinor,
      p_projected_annual_yield_minor: projectedAnnualYieldMinor,
      p_local_spend_percentage: localSpendPercentage,
      p_crew_wage_allocation_minor: crewWageAllocationMinor,
      p_economic_model_note: projectedAnnualYieldMinor === null ? null : draft.economicModelNote.trim(),
      p_blueprint_lines: blueprintLines.map(line => ({
        item: line.item,
        quantity: line.quantity,
        unit: line.unit,
        unit_cost_minor: line.unitCostMinor,
      })),
      p_anchor_user_id: anchorUserId,
      p_builder_user_id: builderUserId,
      p_apprentice_user_id: apprenticeUserId,
    });
    if (error) return { error: `Tender was not published: ${error.message}` };
    if (data !== slug) return { error: 'Tender publication returned an unexpected result.' };
    revalidatePath('/tenders');
    revalidatePath(`/tenders/${slug}`);
    return { slug };
  } catch (error) {
    return { error: actionError(error) };
  }
}
