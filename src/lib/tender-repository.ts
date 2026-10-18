import 'server-only';
import { z } from 'zod';
import { TenderInvariantError, validateCatalog, type RollRecord, type Tender } from './tender';
import { tenderCatalog, tenders as demoTenders } from './tender-data';
import { createSupabaseServerClient, hasSupabaseConfiguration } from './supabase/server';

const categorySchema = z.enum(['education', 'energy', 'media', 'agriculture', 'infrastructure', 'software']);
const minorUnitsSchema = z.coerce.number().int().safe().nonnegative();
const crewSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  role: z.enum(['anchor', 'builder', 'apprentice']),
  organization_name: z.string(),
});
const blueprintSchema = z.object({
  id: z.string(),
  version: z.number(),
  currency: z.string(),
  hash: z.string(),
  lines: z.array(z.object({
    id: z.string(),
    item: z.string(),
    quantity: z.coerce.number(),
    unit: z.string(),
    unit_cost_minor: minorUnitsSchema,
  })),
});
const allocationSchema = z.object({
  id: z.string(),
  funder: z.string(),
  amount_minor: minorUnitsSchema,
  currency: z.string(),
  basis: z.enum(['illustrative', 'verified']),
});
const marketRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  asset_name: z.string(),
  summary: z.string(),
  description: z.string(),
  category: categorySchema,
  location: z.string(),
  issuer: z.string(),
  currency: z.string(),
  import_quote_minor: minorUnitsSchema,
  local_bom_minor: minorUnitsSchema,
  funding_target_minor: minorUnitsSchema,
  status: z.enum(['draft', 'open', 'materials', 'fabrication', 'anchor_signed', 'deployed', 'cancelled']),
  is_illustrative: z.boolean(),
  source_product_id: z.string().nullable(),
  blueprint: blueprintSchema,
  crew: z.array(crewSchema).length(3),
  funders: z.array(allocationSchema),
});

const rollRowSchema = z.object({
  id: z.string(),
  tender_id: z.string(),
  asset_name: z.string(),
  import_savings_minor: minorUnitsSchema,
  currency: z.string(),
  crew_snapshot: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(['anchor', 'builder', 'apprentice']),
    organization: z.string(),
  })).length(3),
  blueprint_snapshot: z.array(z.object({
    id: z.string(),
    item: z.string(),
    quantity: z.coerce.number().positive(),
    unit: z.string(),
    unit_cost_minor: minorUnitsSchema,
  })).min(1).max(100),
  blueprint_id: z.string(),
  blueprint_hash: z.string(),
  anchor_crew_member_id: z.string(),
  anchor_signed_at: z.string(),
  deployed_at: z.string(),
});

function mapMarketRow(value: unknown): Tender {
  const row = marketRowSchema.parse(value);
  return {
    id: row.id,
    slug: row.slug,
    assetName: row.asset_name,
    summary: row.summary,
    description: row.description,
    category: row.category,
    location: row.location,
    issuer: row.issuer,
    currency: row.currency,
    importQuoteMinor: row.import_quote_minor,
    localBomMinor: row.local_bom_minor,
    fundingTargetMinor: row.funding_target_minor,
    status: row.status,
    isIllustrative: row.is_illustrative,
    sourceTenderId: row.source_product_id ?? undefined,
    crew: row.crew.map(member => ({
      id: member.id,
      displayName: member.display_name,
      role: member.role,
      organization: member.organization_name,
    })),
    blueprint: {
      id: row.blueprint.id,
      version: row.blueprint.version,
      currency: row.blueprint.currency,
      hash: row.blueprint.hash,
      lines: row.blueprint.lines.map(line => ({
        id: line.id,
        item: line.item,
        quantity: line.quantity,
        unit: line.unit,
        unitCostMinor: line.unit_cost_minor,
      })),
    },
    funders: row.funders.map(funder => ({
      id: funder.id,
      funder: funder.funder,
      amountMinor: funder.amount_minor,
      currency: funder.currency,
      basis: funder.basis,
    })),
  };
}

function parseMarketRows(data: unknown): Tender[] {
  const rows = z.array(marketRowSchema).parse(data);
  return rows.map(row => mapMarketRow(row));
}

export async function getMarketTenders(): Promise<Tender[]> {
  if (!hasSupabaseConfiguration()) return demoTenders;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('public_market_tenders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Published Tenders could not be loaded: ${error.message}`);
  const live = parseMarketRows(data);
  const slugs = new Set(live.map(tender => tender.slug));
  const combined = [...live, ...demoTenders.filter(tender => !slugs.has(tender.slug))];
  try {
    validateCatalog({ tenders: combined, roll: [] });
  } catch (error) {
    if (error instanceof TenderInvariantError) throw error;
    throw new Error('The public Tender data returned an invalid shape.');
  }
  return combined;
}

export async function getMarketTenderBySlug(slug: string): Promise<Tender | undefined> {
  if (!hasSupabaseConfiguration()) return demoTenders.find(tender => tender.slug === slug);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('public_market_tenders')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`Tender ${slug} could not be loaded: ${error.message}`);
  if (data) return mapMarketRow(data);
  return demoTenders.find(tender => tender.slug === slug);
}

export async function getPublicRoll(): Promise<RollRecord[]> {
  if (!hasSupabaseConfiguration()) return tenderCatalog.roll;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('public_roll_records')
    .select('id,tender_id,asset_name,import_savings_minor,currency,crew_snapshot,blueprint_snapshot,blueprint_id,blueprint_hash,anchor_crew_member_id,anchor_signed_at,deployed_at')
    .order('deployed_at', { ascending: false });
  if (error) throw new Error(`The public Roll could not be loaded: ${error.message}`);
  return z.array(rollRowSchema).parse(data).map(record => ({
    id: record.id,
    tenderId: record.tender_id,
    assetName: record.asset_name,
    importSavingsMinor: record.import_savings_minor,
    currency: record.currency,
    crew: record.crew_snapshot.map(member => ({
      id: member.id,
      displayName: member.name,
      role: member.role,
      organization: member.organization,
    })),
    blueprintLines: record.blueprint_snapshot.map(line => ({
      id: line.id,
      item: line.item,
      quantity: line.quantity,
      unit: line.unit,
      unitCostMinor: line.unit_cost_minor,
    })),
    blueprintId: record.blueprint_id,
    blueprintHash: record.blueprint_hash,
    anchorSignOff: {
      crewMemberId: record.anchor_crew_member_id,
      blueprintId: record.blueprint_id,
      blueprintHash: record.blueprint_hash,
      signedAt: record.anchor_signed_at,
    },
    deployedAt: record.deployed_at,
  }));
}
