alter table public.organizations
  add column public_summary text
    check (public_summary is null or length(trim(public_summary)) between 1 and 320),
  add column directory_published_at timestamptz,
  add column directory_published_by uuid;

alter table public.organizations
  drop constraint organizations_kind_check,
  add constraint organizations_kind_check
    check (kind in ('school', 'hospital', 'startup', 'community', 'builder'));

revoke select on public.organizations from anon, authenticated;
grant select (id, name, kind, location, created_at)
  on public.organizations to authenticated;

create view public.public_institution_directory
with (security_invoker = false, security_barrier = true)
as
select
  organization.id,
  organization.name,
  organization.kind,
  organization.location,
  organization.public_summary,
  organization.directory_published_at
from public.organizations organization
where organization.directory_published_at is not null;

grant select on public.public_institution_directory to anon, authenticated;

create view public.public_institution_tenders
with (security_invoker = false, security_barrier = true)
as
select tender.id, tender.slug, tender.organization_id
from public.public_market_tenders market
join public.tenders tender on tender.id = market.id
join public.organizations organization on organization.id = tender.organization_id
where not market.is_illustrative
  and organization.directory_published_at is not null
  and market.status in ('open', 'capitalized_pending_settlement')
  and market.current_signaled_amount_minor < market.funding_target_minor;

grant select on public.public_institution_tenders to anon, authenticated;

create or replace view public.public_commons_opportunities
with (security_invoker = false, security_barrier = true)
as
select
  opportunity.id,
  opportunity.tender_id,
  tender.slug as asset_slug,
  tender.asset_name,
  opportunity.role_title,
  opportunity.description,
  opportunity.skill_tags,
  opportunity.created_at,
  (select count(*) from public.commons_applications application
    where application.opportunity_id = opportunity.id) as application_count,
  case
    when organization.directory_published_at is not null then tender.organization_id
    else null
  end as organization_id
from public.commons_opportunities opportunity
join public.tenders tender on tender.id = opportunity.tender_id
left join public.organizations organization on organization.id = tender.organization_id
where opportunity.status = 'open'
  and tender.status not in ('draft', 'cancelled');

grant select on public.public_commons_opportunities to anon, authenticated;

create or replace function public.set_organization_directory_profile(
  p_organization_id uuid,
  p_public_summary text,
  p_published boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  normalized_summary text := nullif(trim(coalesce(p_public_summary, '')), '');
begin
  if auth.uid() is null then
    raise exception 'Sign in to manage an institution profile.'
      using errcode = '42501';
  end if;

  if normalized_summary is not null and length(normalized_summary) > 320 then
    raise exception 'Institution summaries must be 320 characters or fewer.'
      using errcode = '22023';
  end if;

  if p_published and normalized_summary is null then
    raise exception 'Add a short public summary before publishing.'
      using errcode = '22023';
  end if;

  update public.organizations organization
  set public_summary = normalized_summary,
      directory_published_at = case when p_published then now() else null end,
      directory_published_by = case when p_published then auth.uid() else null end
  where organization.id = p_organization_id
    and exists (
      select 1
      from public.organization_memberships membership
      where membership.organization_id = organization.id
        and membership.user_id = auth.uid()
        and membership.is_active
        and membership.role = 'principal'
    );

  if not found then
    raise exception 'Only an active institution principal can manage this profile.'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.set_organization_directory_profile(uuid, text, boolean)
  from public, anon;
grant execute on function public.set_organization_directory_profile(uuid, text, boolean)
  to authenticated;
