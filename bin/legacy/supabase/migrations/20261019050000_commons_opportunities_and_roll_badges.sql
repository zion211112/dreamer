create or replace function public.get_workspace_contexts()
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

  select distinct
    'funder:' || tender.id::text,
    'funder'::text,
    tender.asset_name,
    'funder'::text,
    tender.organization_id,
    tender.id,
    tender.status,
    tender.slug,
    tender.asset_name,
    tender.is_illustrative
  from public.capital_intents intent
  join public.tenders tender on tender.id = intent.tender_id
  where intent.user_id = (select auth.uid())
    and intent.status in ('SIGNALED', 'SETTLED_OFFLINE')
    and tender.is_illustrative = false
    and tender.status not in ('draft', 'cancelled')

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

create table public.commons_opportunities (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  role_title text not null check (length(trim(role_title)) between 2 and 120),
  description text not null check (length(trim(description)) between 20 and 3000),
  skill_tags text[] not null default '{}'
    check (cardinality(skill_tags) between 0 and 12),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index commons_opportunities_open_recent
  on public.commons_opportunities(created_at desc)
  where status = 'open';

create table public.commons_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.commons_opportunities(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  note text not null check (length(trim(note)) between 20 and 2000),
  share_roll_profile boolean not null default false,
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewed', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, applicant_id)
);

create index commons_applications_by_applicant
  on public.commons_applications(applicant_id, created_at desc);

alter table public.commons_opportunities enable row level security;
alter table public.commons_applications enable row level security;

create policy "Open Commons opportunities are public"
  on public.commons_opportunities for select
  using (status = 'open');

create policy "Opportunity owners can read applications"
  on public.commons_applications for select to authenticated
  using (
    applicant_id = (select auth.uid())
    or exists (
      select 1
        from public.commons_opportunities opportunity
        join public.tenders tender on tender.id = opportunity.tender_id
        join public.organization_memberships membership
          on membership.organization_id = tender.organization_id
       where opportunity.id = commons_applications.opportunity_id
         and membership.user_id = (select auth.uid())
         and membership.is_active
         and membership.role in ('principal', 'tender_issuer')
    )
  );

revoke all on public.commons_opportunities, public.commons_applications
  from anon, authenticated;
grant select on public.commons_opportunities to anon, authenticated;
grant select on public.commons_applications to authenticated;

create function public.publish_commons_opportunity(
  p_tender_id uuid,
  p_role_title text,
  p_description text,
  p_skill_tags text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_opportunity_id uuid;
  v_tags text[] := coalesce(p_skill_tags, '{}');
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_role_title is null or length(trim(p_role_title)) not between 2 and 120
     or p_description is null or length(trim(p_description)) not between 20 and 3000
     or cardinality(v_tags) > 12
     or exists (
       select 1 from unnest(v_tags) as tag(value)
        where value is null or length(trim(value)) not between 1 and 40
     ) then
    raise exception 'Opportunity details or skill tags are invalid';
  end if;
  if not exists (
    select 1
      from public.tenders tender
      join public.organization_memberships membership
        on membership.organization_id = tender.organization_id
     where tender.id = p_tender_id
       and tender.is_illustrative = false
       and tender.status not in ('draft', 'cancelled', 'deployed')
       and membership.user_id = v_user_id
       and membership.is_active
       and membership.role in ('principal', 'tender_issuer')
  ) then
    raise exception 'An authorized issuer for a published Asset is required';
  end if;
  insert into public.commons_opportunities (
    tender_id, created_by, role_title, description, skill_tags
  ) values (
    p_tender_id, v_user_id, trim(p_role_title), trim(p_description),
    array(select trim(tag) from unnest(v_tags) as tags(tag))
  ) returning id into v_opportunity_id;
  return v_opportunity_id;
end;
$$;

create function public.apply_to_commons_opportunity(
  p_opportunity_id uuid,
  p_note text,
  p_share_roll_profile boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_application_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_note is null or length(trim(p_note)) not between 20 and 2000 then
    raise exception 'Application note must be between 20 and 2000 characters';
  end if;
  if p_share_roll_profile is not true then
    raise exception 'Consent to share a Roll profile with this Asset issuer is required';
  end if;
  if not exists (
    select 1 from public.commons_opportunities opportunity
     where opportunity.id = p_opportunity_id
       and opportunity.status = 'open'
       and opportunity.created_by <> v_user_id
  ) then
    raise exception 'Open opportunity not found';
  end if;

  insert into public.commons_profiles (user_id, display_name, public_name_consent)
  values (v_user_id, 'Maker', false)
  on conflict (user_id) do nothing;

  insert into public.commons_applications (opportunity_id, applicant_id, note, share_roll_profile)
  values (p_opportunity_id, v_user_id, trim(p_note), true)
  returning id into v_application_id;
  return v_application_id;
exception
  when unique_violation then
    raise exception 'You have already applied to this opportunity';
end;
$$;

create function public.review_commons_application(
  p_application_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_application public.commons_applications%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_status not in ('reviewed', 'declined') then
    raise exception 'Application status is invalid';
  end if;
  select application.* into v_application
    from public.commons_applications application
    join public.commons_opportunities opportunity on opportunity.id = application.opportunity_id
    join public.tenders tender on tender.id = opportunity.tender_id
    join public.organization_memberships membership
      on membership.organization_id = tender.organization_id
   where application.id = p_application_id
     and membership.user_id = v_user_id
     and membership.is_active
     and membership.role in ('principal', 'tender_issuer')
   for update of application;
  if not found then
    raise exception 'Authorized Asset issuer and application are required';
  end if;
  update public.commons_applications
     set status = p_status, updated_at = now()
   where id = v_application.id;
end;
$$;

revoke all on function public.publish_commons_opportunity(uuid, text, text, text[]) from public, anon;
revoke all on function public.apply_to_commons_opportunity(uuid, text, boolean) from public, anon;
revoke all on function public.review_commons_application(uuid, text) from public, anon;
grant execute on function public.publish_commons_opportunity(uuid, text, text, text[]) to authenticated;
grant execute on function public.apply_to_commons_opportunity(uuid, text, boolean) to authenticated;
grant execute on function public.review_commons_application(uuid, text) to authenticated;

create view public.public_commons_opportunities
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
    where application.opportunity_id = opportunity.id) as application_count
from public.commons_opportunities opportunity
join public.tenders tender on tender.id = opportunity.tender_id
where opportunity.status = 'open'
  and tender.status not in ('draft', 'cancelled');

grant select on public.public_commons_opportunities to anon, authenticated;

create table public.roll_capability_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete restrict,
  roll_record_id uuid not null references public.roll_records(id) on delete restrict,
  crew_member_id uuid not null references public.crew_members(id) on delete restrict,
  role text not null check (role in ('anchor', 'builder', 'apprentice')),
  issued_at timestamptz not null default now(),
  unique (user_id, roll_record_id, role),
  unique (crew_member_id, roll_record_id)
);

create index roll_capability_badges_by_user
  on public.roll_capability_badges(user_id, issued_at desc);

alter table public.roll_capability_badges enable row level security;
create policy "Members read their own capability proofs"
  on public.roll_capability_badges for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.roll_capability_badges from anon, authenticated;
grant select on public.roll_capability_badges to authenticated;

insert into public.roll_capability_badges (
  user_id, tender_id, roll_record_id, crew_member_id, role
)
select
  crew.user_id,
  record.tender_id,
  record.id,
  crew.id,
  crew.role
from public.roll_records record
join public.tenders tender on tender.id = record.tender_id
join public.crew_members crew
  on crew.tender_id = record.tender_id
 and crew.is_active
 and crew.user_id is not null
 and crew.role in ('anchor', 'builder', 'apprentice')
where tender.is_illustrative = false
on conflict do nothing;

create function public.issue_roll_capability_badges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.roll_capability_badges (
    user_id, tender_id, roll_record_id, crew_member_id, role
  )
  select
    crew.user_id,
    new.tender_id,
    new.id,
    crew.id,
    crew.role
  from public.crew_members crew
  join public.tenders tender
    on tender.id = crew.tender_id
  where crew.tender_id = new.tender_id
    and tender.is_illustrative = false
    and crew.is_active
    and crew.user_id is not null
    and crew.role in ('anchor', 'builder', 'apprentice')
  on conflict (user_id, roll_record_id, role) do nothing;
  return new;
end;
$$;

create trigger roll_records_issue_capability_badges
after insert on public.roll_records
for each row execute function public.issue_roll_capability_badges();

revoke all on function public.issue_roll_capability_badges() from public, anon, authenticated;

create view public.public_roll_profiles
with (security_invoker = false, security_barrier = true)
as
select
  profile.user_id,
  profile.display_name,
  count(distinct badge.roll_record_id)::integer as deployed_asset_count,
  count(badge.id)::integer as capability_badge_count,
  max(badge.issued_at) as last_verified_build_at,
  case
    when count(distinct badge.roll_record_id) >= 3 then 'Tier 2'
    when count(distinct badge.roll_record_id) >= 1 then 'Tier 1'
    else 'New builder'
  end as derived_rank
from public.commons_profiles profile
left join public.roll_capability_badges badge on badge.user_id = profile.user_id
where profile.public_name_consent
group by profile.user_id, profile.display_name;

grant select on public.public_roll_profiles to anon, authenticated;

create view public.public_roll_capability_badges
with (security_invoker = false, security_barrier = true)
as
select
  badge.id,
  profile.user_id,
  profile.display_name,
  tender.slug as asset_slug,
  tender.asset_name,
  badge.role,
  badge.issued_at,
  record.blueprint_hash
from public.roll_capability_badges badge
join public.commons_profiles profile
  on profile.user_id = badge.user_id
 and profile.public_name_consent
join public.tenders tender on tender.id = badge.tender_id
join public.roll_records record on record.id = badge.roll_record_id;

grant select on public.public_roll_capability_badges to anon, authenticated;

create function public.get_commons_opportunity_applications(p_opportunity_ids uuid[])
returns table (
  application_id uuid,
  opportunity_id uuid,
  applicant_id uuid,
  note text,
  status text,
  created_at timestamptz,
  applicant_name text,
  profile_is_public boolean,
  deployed_asset_count integer,
  capability_badge_count integer,
  derived_rank text,
  capability_badges jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  return query
  select
    application.id,
    application.opportunity_id,
    application.applicant_id,
    application.note,
    application.status,
    application.created_at,
    case
      when application.share_roll_profile then coalesce(nullif(profile.display_name, ''), 'Maker')
      else 'Builder (identity private)'
    end,
    coalesce(profile.public_name_consent, false) and application.share_roll_profile,
    case when application.share_roll_profile then proof.deployed_asset_count else 0 end,
    case when application.share_roll_profile then proof.capability_badge_count else 0 end,
    case
      when not application.share_roll_profile then 'Roll profile not shared'
      when proof.deployed_asset_count >= 3 then 'Tier 2'
      when proof.deployed_asset_count >= 1 then 'Tier 1'
      else 'New builder'
    end,
    case when application.share_roll_profile then proof.capability_badges else '[]'::jsonb end
  from public.commons_applications application
  join public.commons_opportunities opportunity on opportunity.id = application.opportunity_id
  join public.tenders tender on tender.id = opportunity.tender_id
  left join public.commons_profiles profile on profile.user_id = application.applicant_id
  left join lateral (
    select
      count(distinct badge.roll_record_id)::integer as deployed_asset_count,
      count(badge.id)::integer as capability_badge_count,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'asset_name', tender.asset_name,
            'role', badge.role,
            'issued_at', badge.issued_at,
            'blueprint_hash', record.blueprint_hash
          ) order by badge.issued_at desc
        ) filter (where badge.id is not null),
        '[]'::jsonb
      ) as capability_badges
    from public.roll_capability_badges badge
    join public.tenders tender on tender.id = badge.tender_id
    join public.roll_records record on record.id = badge.roll_record_id
    where badge.user_id = application.applicant_id
  ) proof on true
  where application.opportunity_id = any(coalesce(p_opportunity_ids, '{}'))
    and (
      application.applicant_id = v_user_id
      or exists (
        select 1
        from public.organization_memberships membership
        where membership.organization_id = tender.organization_id
          and membership.user_id = v_user_id
          and membership.is_active
          and membership.role in ('principal', 'tender_issuer')
      )
    )
  order by application.created_at desc;
end;
$$;

revoke all on function public.get_commons_opportunity_applications(uuid[]) from public, anon;
grant execute on function public.get_commons_opportunity_applications(uuid[]) to authenticated;
