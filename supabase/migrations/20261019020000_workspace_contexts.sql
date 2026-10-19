create index organization_memberships_user_active
  on public.organization_memberships(user_id)
  where is_active;

create index crew_members_user_active_context
  on public.crew_members(user_id, tender_id, role)
  where is_active;

create function public.get_workspace_contexts()
returns table (
  context_key text,
  context_kind text,
  context_label text,
  context_role text,
  organization_id uuid,
  tender_id uuid,
  tender_status public.tender_status,
  tender_slug text,
  asset_name text,
  is_illustrative boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    'network'::text,
    'network'::text,
    'Network Member'::text,
    'member'::text,
    null::uuid,
    null::uuid,
    null::public.tender_status,
    null::text,
    null::text,
    null::boolean
  where (select auth.uid()) is not null

  union all

  select
    'school:' || membership.organization_id::text,
    'school'::text,
    organization.name,
    membership.role,
    membership.organization_id,
    null::uuid,
    null::public.tender_status,
    null::text,
    null::text,
    null::boolean
  from public.organization_memberships membership
  join public.organizations organization
    on organization.id = membership.organization_id
  where membership.user_id = (select auth.uid())
    and membership.is_active

  union all

  select
    'crew:' || tender.id::text || ':' || crew.role,
    'crew'::text,
    tender.asset_name,
    crew.role,
    tender.organization_id,
    tender.id,
    tender.status,
    tender.slug,
    tender.asset_name,
    tender.is_illustrative
  from public.crew_members crew
  join public.tenders tender
    on tender.id = crew.tender_id
  where crew.user_id = (select auth.uid())
    and crew.is_active
    and exists (
      select 1
      from public.organization_memberships membership
      where membership.organization_id = tender.organization_id
        and membership.user_id = (select auth.uid())
        and membership.is_active
    );
$$;

revoke all on function public.get_workspace_contexts() from public, anon;
grant execute on function public.get_workspace_contexts() to authenticated;
