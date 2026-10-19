alter table public.tenders
  add column asset_build_cost_minor bigint,
  add column target_amount_minor bigint,
  add column current_signaled_amount_minor bigint not null default 0,
  add column current_settled_amount_minor bigint not null default 0,
  add column projected_annual_yield_minor bigint,
  add column local_spend_percentage numeric(5, 2),
  add column crew_wage_allocation_minor jsonb,
  add column economic_model_note text;

update public.tenders
   set asset_build_cost_minor = local_bom_minor,
       target_amount_minor = funding_target_minor;

alter table public.roll_records
  add column asset_build_cost_minor bigint;

drop trigger roll_records_immutable on public.roll_records;

update public.roll_records record
   set asset_build_cost_minor = tender.asset_build_cost_minor
  from public.tenders tender
 where tender.id = record.tender_id;

alter table public.roll_records
  alter column asset_build_cost_minor set not null,
  add constraint roll_records_asset_build_cost_positive
    check (asset_build_cost_minor > 0);

create trigger roll_records_immutable
before update or delete on public.roll_records
for each row execute function public.prevent_roll_record_mutation();

alter table public.tenders
  alter column asset_build_cost_minor set not null,
  alter column target_amount_minor set not null,
  add constraint tenders_asset_build_cost_positive
    check (asset_build_cost_minor > 0),
  add constraint tenders_target_amount_positive
    check (target_amount_minor > 0),
  add constraint tenders_current_signaled_nonnegative
    check (current_signaled_amount_minor >= 0),
  add constraint tenders_current_settled_nonnegative
    check (current_settled_amount_minor >= 0 and current_settled_amount_minor <= current_signaled_amount_minor),
  add constraint tenders_yield_nonnegative
    check (projected_annual_yield_minor is null or projected_annual_yield_minor >= 0),
  add constraint tenders_local_spend_percentage_range
    check (local_spend_percentage is null or local_spend_percentage between 0 and 100),
  add constraint tenders_crew_wage_allocation_shape
    check (
      crew_wage_allocation_minor is null
      or (
        jsonb_typeof(crew_wage_allocation_minor) = 'object'
        and jsonb_typeof(crew_wage_allocation_minor -> 'anchor') = 'number'
        and jsonb_typeof(crew_wage_allocation_minor -> 'builder') = 'number'
        and jsonb_typeof(crew_wage_allocation_minor -> 'apprentice') = 'number'
        and (crew_wage_allocation_minor ->> 'anchor')::numeric >= 0
        and (crew_wage_allocation_minor ->> 'builder')::numeric >= 0
        and (crew_wage_allocation_minor ->> 'apprentice')::numeric >= 0
        and (crew_wage_allocation_minor ->> 'anchor')::numeric <= 9007199254740991
        and (crew_wage_allocation_minor ->> 'builder')::numeric <= 9007199254740991
        and (crew_wage_allocation_minor ->> 'apprentice')::numeric <= 9007199254740991
        and (crew_wage_allocation_minor ->> 'anchor')::numeric = trunc((crew_wage_allocation_minor ->> 'anchor')::numeric)
        and (crew_wage_allocation_minor ->> 'builder')::numeric = trunc((crew_wage_allocation_minor ->> 'builder')::numeric)
        and (crew_wage_allocation_minor ->> 'apprentice')::numeric = trunc((crew_wage_allocation_minor ->> 'apprentice')::numeric)
        and (
          (crew_wage_allocation_minor ->> 'anchor')::numeric
          + (crew_wage_allocation_minor ->> 'builder')::numeric
          + (crew_wage_allocation_minor ->> 'apprentice')::numeric
        ) <= asset_build_cost_minor
      )
    ),
  add constraint tenders_yield_requires_basis
    check (
      (projected_annual_yield_minor is null and economic_model_note is null)
      or (projected_annual_yield_minor is not null and length(trim(economic_model_note)) between 1 and 1000)
    );

create table public.capital_intents (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  amount_minor bigint not null check (amount_minor between 1 and 9007199254740991),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'SIGNALED'
    check (status in ('SIGNALED', 'WITHDRAWN', 'SETTLED_OFFLINE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  settled_by uuid references auth.users(id),
  settled_at timestamptz,
  foreign key (tender_id, currency)
    references public.tenders(id, currency),
  check (
    (status = 'SETTLED_OFFLINE' and settled_by is not null and settled_at is not null)
    or (status <> 'SETTLED_OFFLINE' and settled_by is null and settled_at is null)
  )
);

create index capital_intents_tender_status
  on public.capital_intents(tender_id, status);

create index capital_intents_user_recent
  on public.capital_intents(user_id, created_at desc);

alter table public.capital_intents enable row level security;

create policy "Intent owner reads their capital signals"
  on public.capital_intents for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
        from public.tenders tender
        join public.organization_memberships membership
          on membership.organization_id = tender.organization_id
       where tender.id = capital_intents.tender_id
         and membership.user_id = (select auth.uid())
         and membership.role in ('principal', 'tender_issuer')
         and membership.is_active
    )
  );

revoke insert, update, delete, truncate, references, trigger on public.capital_intents from anon, authenticated;
grant select on public.capital_intents to authenticated;

create function public.refresh_tender_signal_total(p_tender_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tender public.tenders%rowtype;
  v_signaled bigint;
  v_settled bigint;
begin
  select * into v_tender
    from public.tenders
   where id = p_tender_id
   for update;
  if not found then
    raise exception 'Tender not found';
  end if;

  select
    coalesce(sum(amount_minor) filter (where status in ('SIGNALED', 'SETTLED_OFFLINE')), 0),
    coalesce(sum(amount_minor) filter (where status = 'SETTLED_OFFLINE'), 0)
    into v_signaled, v_settled
    from public.capital_intents
   where tender_id = p_tender_id
     and currency = v_tender.currency;

  update public.tenders
     set current_signaled_amount_minor = v_signaled,
         current_settled_amount_minor = v_settled,
         status = case
           when v_tender.status in ('open', 'capitalized_pending_settlement')
             and v_signaled >= v_tender.target_amount_minor
             and v_settled < v_tender.target_amount_minor
             then 'capitalized_pending_settlement'::public.tender_status
           when v_tender.status = 'capitalized_pending_settlement'
             and v_settled >= v_tender.target_amount_minor
             then 'open'::public.tender_status
           when v_tender.status = 'capitalized_pending_settlement'
             and v_signaled < v_tender.target_amount_minor
             then 'open'::public.tender_status
           else v_tender.status
         end,
         updated_at = now()
   where id = p_tender_id;
end;
$$;

revoke all on function public.refresh_tender_signal_total(uuid) from public, anon, authenticated;

create function public.signal_tender_capital(p_tender_id uuid, p_amount_minor bigint)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_tender public.tenders%rowtype;
  v_intent_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_amount_minor is null or p_amount_minor < 1 or p_amount_minor > 9007199254740991 then
    raise exception 'Capital intent amount is invalid';
  end if;

  select * into v_tender
    from public.tenders
   where id = p_tender_id
   for update;
  if not found or v_tender.status not in ('open', 'capitalized_pending_settlement') then
    raise exception 'Tender is not accepting capital signals';
  end if;
  if v_tender.is_illustrative then
    raise exception 'Illustrative Tenders cannot accept capital signals';
  end if;
  if v_tender.current_signaled_amount_minor >= v_tender.target_amount_minor
     or p_amount_minor > v_tender.target_amount_minor - v_tender.current_signaled_amount_minor then
    raise exception 'The remaining Capital Intent target is below the requested amount';
  end if;

  insert into public.capital_intents (tender_id, user_id, amount_minor, currency)
  values (p_tender_id, v_user_id, p_amount_minor, v_tender.currency)
  returning id into v_intent_id;

  perform public.refresh_tender_signal_total(p_tender_id);
  return v_intent_id;
end;
$$;

create function public.withdraw_tender_capital(p_intent_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_intent public.capital_intents%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  select * into v_intent from public.capital_intents where id = p_intent_id for update;
  if not found or v_intent.user_id <> v_user_id then
    raise exception 'Capital intent owner required';
  end if;
  if v_intent.status <> 'SIGNALED' then
    raise exception 'Only unsettled capital signals can be withdrawn';
  end if;

  update public.capital_intents
     set status = 'WITHDRAWN', updated_at = now()
   where id = p_intent_id;
  perform public.refresh_tender_signal_total(v_intent.tender_id);
end;
$$;

create function public.verify_offline_capital_settlement(p_intent_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_intent public.capital_intents%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  select * into v_intent from public.capital_intents where id = p_intent_id for update;
  if not found or v_intent.status <> 'SIGNALED' then
    raise exception 'An unsettled capital signal is required';
  end if;
  if not exists (
    select 1
      from public.tenders tender
      join public.organization_memberships membership
        on membership.organization_id = tender.organization_id
     where tender.id = v_intent.tender_id
       and membership.user_id = v_user_id
       and membership.role in ('principal', 'tender_issuer')
       and membership.is_active
  ) then
    raise exception 'An active Tender issuer or Principal must verify offline settlement';
  end if;

  update public.capital_intents
     set status = 'SETTLED_OFFLINE',
         settled_by = v_user_id,
         settled_at = now(),
         updated_at = now()
   where id = p_intent_id;
  perform public.refresh_tender_signal_total(v_intent.tender_id);
end;
$$;

create function public.enforce_settled_capital_before_assembly()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settled bigint;
begin
  if new.status = 'materials' and old.status = 'open' then
    select coalesce(sum(amount_minor), 0) into v_settled
      from public.capital_intents
     where tender_id = new.id
       and currency = new.currency
       and status = 'SETTLED_OFFLINE';
    if v_settled < new.target_amount_minor then
      raise exception 'Verified offline settlement must meet the Tender target before Assembly';
    end if;
  end if;
  return new;
end;
$$;

create trigger tenders_require_settlement_before_assembly
before update of status on public.tenders
for each row execute function public.enforce_settled_capital_before_assembly();

revoke all on function public.enforce_settled_capital_before_assembly() from public, anon, authenticated;
revoke all on function public.signal_tender_capital(uuid, bigint) from public, anon;
revoke all on function public.withdraw_tender_capital(uuid) from public, anon;
revoke all on function public.verify_offline_capital_settlement(uuid) from public, anon;
grant execute on function public.signal_tender_capital(uuid, bigint) to authenticated;
grant execute on function public.withdraw_tender_capital(uuid) to authenticated;
grant execute on function public.verify_offline_capital_settlement(uuid) to authenticated;

create function public.publish_school_asset_tender(
  p_slug text,
  p_asset_name text,
  p_summary text,
  p_asset_build_cost_minor bigint,
  p_target_amount_minor bigint,
  p_projected_annual_yield_minor bigint,
  p_local_spend_percentage numeric,
  p_crew_wage_allocation_minor jsonb,
  p_economic_model_note text,
  p_blueprint_lines jsonb,
  p_anchor_user_id uuid,
  p_builder_user_id uuid,
  p_apprentice_user_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_organization_name text;
  v_location text;
  v_source_product_id uuid;
  v_tender_id uuid := gen_random_uuid();
  v_blueprint_id uuid := gen_random_uuid();
  v_crew_ids uuid[];
  v_hash text;
  v_line jsonb;
  v_item text;
  v_unit text;
  v_quantity numeric;
  v_unit_cost_numeric numeric;
  v_unit_cost_minor bigint;
  v_line_total numeric;
  v_total numeric := 0;
  v_wage_total numeric;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_slug is null
     or p_asset_name is null
     or p_summary is null
     or p_asset_build_cost_minor is null
     or p_target_amount_minor is null
     or p_anchor_user_id is null
     or p_builder_user_id is null
     or p_apprentice_user_id is null
     or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or length(p_slug) > 120
     or length(trim(p_asset_name)) not between 1 and 160
     or length(trim(p_summary)) not between 1 and 10000
     or p_asset_build_cost_minor not between 1 and 9007199254740991
     or p_target_amount_minor not between 1 and 9007199254740991
     or (p_projected_annual_yield_minor is not null
         and p_projected_annual_yield_minor not between 0 and 9007199254740991)
     or (p_local_spend_percentage is not null
         and p_local_spend_percentage not between 0 and 100)
     or (p_projected_annual_yield_minor is null and p_economic_model_note is not null)
     or (p_projected_annual_yield_minor is not null
         and (p_economic_model_note is null or length(trim(p_economic_model_note)) not between 1 and 1000))
     or p_crew_wage_allocation_minor is null
     or jsonb_typeof(p_crew_wage_allocation_minor) is distinct from 'object'
     or jsonb_typeof(p_crew_wage_allocation_minor -> 'anchor') is distinct from 'number'
     or jsonb_typeof(p_crew_wage_allocation_minor -> 'builder') is distinct from 'number'
     or jsonb_typeof(p_crew_wage_allocation_minor -> 'apprentice') is distinct from 'number'
     or p_anchor_user_id = p_builder_user_id
     or p_anchor_user_id = p_apprentice_user_id
     or p_builder_user_id = p_apprentice_user_id then
    raise exception 'Tender fields or crew allocations are invalid';
  end if;

  v_wage_total :=
    (p_crew_wage_allocation_minor ->> 'anchor')::numeric
    + (p_crew_wage_allocation_minor ->> 'builder')::numeric
    + (p_crew_wage_allocation_minor ->> 'apprentice')::numeric;
  if v_wage_total < 0
     or v_wage_total > p_asset_build_cost_minor
     or (p_crew_wage_allocation_minor ->> 'anchor')::numeric < 0
     or (p_crew_wage_allocation_minor ->> 'builder')::numeric < 0
     or (p_crew_wage_allocation_minor ->> 'apprentice')::numeric < 0
     or (p_crew_wage_allocation_minor ->> 'anchor')::numeric <> trunc((p_crew_wage_allocation_minor ->> 'anchor')::numeric)
     or (p_crew_wage_allocation_minor ->> 'builder')::numeric <> trunc((p_crew_wage_allocation_minor ->> 'builder')::numeric)
     or (p_crew_wage_allocation_minor ->> 'apprentice')::numeric <> trunc((p_crew_wage_allocation_minor ->> 'apprentice')::numeric)
     or v_wage_total > 9007199254740991 then
    raise exception 'Crew wage allocation exceeds the supported asset build cost';
  end if;

  if p_blueprint_lines is null or jsonb_typeof(p_blueprint_lines) is distinct from 'array'
     or jsonb_array_length(p_blueprint_lines) not between 1 and 100 then
    raise exception 'A Blueprint must contain between 1 and 100 itemized lines';
  end if;

  select o.id, o.name, o.location
    into v_organization_id, v_organization_name, v_location
    from public.organization_memberships m
    join public.organizations o on o.id = m.organization_id
   where m.user_id = v_user_id
     and m.role in ('principal', 'tender_issuer')
     and m.is_active
     and o.kind = 'school'
   order by (m.role = 'principal') desc, m.created_at, m.organization_id
   limit 1;
  if v_organization_id is null then
    raise exception 'An authenticated Principal or Tender issuer membership is required';
  end if;

  v_crew_ids := array[p_anchor_user_id, p_builder_user_id, p_apprentice_user_id];
  if (
    select count(distinct m.user_id)
      from public.organization_memberships m
     where m.organization_id = v_organization_id
       and m.is_active
       and m.user_id = any(v_crew_ids)
  ) <> 3 then
    raise exception 'Anchor, Builder and Apprentice must each be active members of this school';
  end if;

  select id into v_source_product_id
    from public.tenders
   where slug = 'school-console'
     and status <> 'cancelled'
   limit 1;
  if v_source_product_id is null then
    raise exception 'The School Console product Tender is not installed';
  end if;

  v_hash := encode(sha256(convert_to(
    p_slug || ':' || p_asset_build_cost_minor::text || ':' || p_blueprint_lines::text,
    'UTF8'
  )), 'hex');
  insert into public.tenders (
    id, organization_id, source_product_id, slug, asset_name, summary, description,
    category, location, currency, asset_build_cost_minor, target_amount_minor,
    funding_target_minor, projected_annual_yield_minor, local_spend_percentage,
    crew_wage_allocation_minor, economic_model_note, status, is_illustrative
  ) values (
    v_tender_id, v_organization_id, v_source_product_id, p_slug, trim(p_asset_name),
    left(trim(p_summary), 300), trim(p_summary), 'education', v_location, 'KES',
    p_asset_build_cost_minor, p_target_amount_minor, p_target_amount_minor,
    p_projected_annual_yield_minor, p_local_spend_percentage,
    p_crew_wage_allocation_minor,
    case when p_projected_annual_yield_minor is null then null else trim(p_economic_model_note) end,
    'draft', false
  );

  insert into public.blueprints (id, tender_id, version, currency, content_hash, is_active)
  values (v_blueprint_id, v_tender_id, 1, 'KES', v_hash, true);
  for v_line in
    select value from jsonb_array_elements(p_blueprint_lines) as blueprint_line(value)
  loop
    if jsonb_typeof(v_line) is distinct from 'object'
       or jsonb_typeof(v_line -> 'item') is distinct from 'string'
       or jsonb_typeof(v_line -> 'quantity') is distinct from 'number'
       or jsonb_typeof(v_line -> 'unit') is distinct from 'string'
       or jsonb_typeof(v_line -> 'unit_cost_minor') is distinct from 'number' then
      raise exception 'Each Blueprint line needs an item, quantity, unit and integer unit cost';
    end if;
    v_item := trim(v_line ->> 'item');
    v_quantity := (v_line ->> 'quantity')::numeric;
    v_unit := trim(v_line ->> 'unit');
    v_unit_cost_numeric := (v_line ->> 'unit_cost_minor')::numeric;
    if length(v_item) not between 1 and 240
       or length(v_unit) not between 1 and 40
       or v_quantity <= 0
       or v_quantity > 999999999.999
       or v_quantity <> round(v_quantity, 3)
       or v_unit_cost_numeric < 0
       or v_unit_cost_numeric > 9007199254740991
       or v_unit_cost_numeric <> trunc(v_unit_cost_numeric) then
      raise exception 'Blueprint line values exceed supported item, quantity or currency precision';
    end if;
    v_line_total := v_quantity * v_unit_cost_numeric;
    if v_line_total <> trunc(v_line_total)
       or v_line_total > 9007199254740991 then
      raise exception 'Blueprint line total must be a safe integer number of minor currency units';
    end if;
    v_total := v_total + v_line_total;
    if v_total > 9007199254740991 then
      raise exception 'Blueprint total exceeds supported currency precision';
    end if;
    v_unit_cost_minor := v_unit_cost_numeric::bigint;
    insert into public.blueprint_lines (blueprint_id, item, quantity, unit, unit_cost_minor)
    values (v_blueprint_id, v_item, v_quantity, v_unit, v_unit_cost_minor);
  end loop;
  if v_total <> p_asset_build_cost_minor then
    raise exception 'Blueprint total does not match the asset build cost';
  end if;
  update public.tenders set active_blueprint_id = v_blueprint_id where id = v_tender_id;

  insert into public.crew_members (
    tender_id, user_id, display_name, organization_name, role, show_publicly
  )
  select
    v_tender_id,
    m.user_id,
    m.display_name,
    v_organization_name,
    assignment_role.role,
    m.public_name_consent
  from unnest(v_crew_ids) with ordinality as assignment(user_id, ordinal)
  join public.organization_memberships m
    on m.organization_id = v_organization_id
   and m.user_id = assignment.user_id
   and m.is_active
  cross join lateral (
    select case assignment.ordinal
      when 1 then 'anchor'
      when 2 then 'builder'
      else 'apprentice'
    end as role
  ) assignment_role(role);

  update public.tenders set status = 'open', updated_at = now() where id = v_tender_id;
  return p_slug;
end;
$$;

create or replace function public.transition_tender(
  p_tender_id uuid,
  p_next_status public.tender_status
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_tender public.tenders%rowtype;
  v_crew public.crew_members%rowtype;
  v_blueprint public.blueprints%rowtype;
  v_sign_off public.anchor_sign_offs%rowtype;
  v_roll_id uuid;
  v_total numeric;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  select * into v_tender from public.tenders where id = p_tender_id for update;
  if not found then
    raise exception 'Tender not found';
  end if;
  if v_tender.is_illustrative then
    raise exception 'Illustrative Tenders cannot enter a real Assembly';
  end if;

  select * into v_crew
    from public.crew_members
   where tender_id = p_tender_id
     and user_id = v_user_id
     and is_active
     and exists (
       select 1 from public.organization_memberships m
       where m.organization_id = v_tender.organization_id
         and m.user_id = v_user_id
         and m.is_active
     )
   limit 1;
  if not found then
    raise exception 'Assigned crew membership required';
  end if;

  if v_tender.status = 'deployed' and p_next_status = 'deployed' then
    select id into v_roll_id from public.roll_records where tender_id = p_tender_id;
    return v_roll_id;
  end if;

  if p_next_status = 'materials' and v_tender.status = 'open' then
    if v_tender.current_settled_amount_minor < v_tender.target_amount_minor then
      raise exception 'Verified offline settlement must meet the Tender target before Assembly';
    end if;
    update public.tenders set status = 'materials', updated_at = now() where id = p_tender_id;
    return null;
  elsif p_next_status = 'fabrication' and v_tender.status = 'materials' then
    if v_crew.role not in ('anchor', 'builder') then
      raise exception 'Only the assigned Anchor or Builder may advance fabrication';
    end if;
    update public.tenders set status = 'fabrication', updated_at = now() where id = p_tender_id;
    return null;
  elsif p_next_status = 'anchor_signed' and v_tender.status = 'fabrication' then
    if v_crew.role <> 'anchor' then
      raise exception 'Only the assigned Anchor may sign off';
    end if;
    select * into v_blueprint
      from public.blueprints
     where id = v_tender.active_blueprint_id
       and tender_id = p_tender_id
       and is_active;
    if not found then
      raise exception 'Active Blueprint not found';
    end if;
    select coalesce(sum(quantity * unit_cost_minor), 0) into v_total
      from public.blueprint_lines where blueprint_id = v_blueprint.id;
    if v_blueprint.currency <> v_tender.currency or v_total <> v_tender.asset_build_cost_minor then
      raise exception 'Active Blueprint total or currency does not match the asset build cost';
    end if;
    insert into public.anchor_sign_offs (
      tender_id, crew_member_id, blueprint_id, blueprint_hash, signed_by
    ) values (
      p_tender_id, v_crew.id, v_blueprint.id, v_blueprint.content_hash, v_user_id
    ) returning * into v_sign_off;
    update public.tenders set status = 'anchor_signed', updated_at = now() where id = p_tender_id;
    return null;
  elsif p_next_status = 'deployed' and v_tender.status = 'anchor_signed' then
    if v_crew.role <> 'anchor' then
      raise exception 'Only the assigned Anchor may deploy a Tender';
    end if;
    select * into v_blueprint
      from public.blueprints
     where id = v_tender.active_blueprint_id
       and tender_id = p_tender_id
       and is_active;
    select * into v_sign_off
      from public.anchor_sign_offs
     where tender_id = p_tender_id
       and crew_member_id = v_crew.id
       and blueprint_id = v_blueprint.id
       and blueprint_hash = v_blueprint.content_hash
       and signed_by = v_user_id;
    if not found then
      raise exception 'A current Anchor sign-off on the active Blueprint is required';
    end if;
    select coalesce(sum(quantity * unit_cost_minor), 0) into v_total
      from public.blueprint_lines where blueprint_id = v_blueprint.id;
    if v_blueprint.currency <> v_tender.currency or v_total <> v_tender.asset_build_cost_minor then
      raise exception 'Active Blueprint total or currency does not match the asset build cost';
    end if;

    insert into public.roll_records (
      tender_id, asset_name, asset_build_cost_minor, currency,
      crew_snapshot, blueprint_snapshot, blueprint_id, blueprint_hash,
      anchor_sign_off_id, anchor_crew_member_id, anchor_signed_at
    )
    select
      v_tender.id,
      v_tender.asset_name,
      v_tender.asset_build_cost_minor,
      v_tender.currency,
      coalesce(jsonb_agg(jsonb_build_object(
        'id', cm.id,
        'name', case
          when cm.show_publicly and consent.public_name_consent then cm.display_name
          when cm.role = 'anchor' then 'Anchor (identity private)'
          when cm.role = 'builder' then 'Builder (identity private)'
          else 'Apprentice (identity private)'
        end,
        'role', cm.role,
        'organization', case
          when cm.show_publicly and consent.public_name_consent then cm.organization_name
          else ''
        end
      ) order by cm.role), '[]'::jsonb),
      (
        select jsonb_agg(jsonb_build_object(
          'id', bl.id,
          'item', bl.item,
          'quantity', bl.quantity,
          'unit', bl.unit,
          'unit_cost_minor', bl.unit_cost_minor
        ) order by bl.id)
        from public.blueprint_lines bl
        where bl.blueprint_id = v_blueprint.id
      ),
      v_blueprint.id,
      v_blueprint.content_hash,
      v_sign_off.id,
      v_sign_off.crew_member_id,
      v_sign_off.signed_at
    from public.crew_members cm
    left join lateral (
      select m.public_name_consent
        from public.organization_memberships m
        join public.tenders consent_tender on consent_tender.organization_id = m.organization_id
       where consent_tender.id = cm.tender_id
         and m.user_id = cm.user_id
         and m.is_active
    ) consent on true
    where cm.tender_id = v_tender.id
      and cm.is_active
    returning id into v_roll_id;

    update public.tenders set status = 'deployed', updated_at = now() where id = p_tender_id;
    return v_roll_id;
  end if;
  raise exception 'Illegal Tender transition from % to %', v_tender.status, p_next_status;
end;
$$;

revoke all on function public.publish_school_asset_tender(
  text, text, text, bigint, bigint, bigint, numeric, jsonb, text, jsonb, uuid, uuid, uuid
) from public, anon;
grant execute on function public.publish_school_asset_tender(
  text, text, text, bigint, bigint, bigint, numeric, jsonb, text, jsonb, uuid, uuid, uuid
) to authenticated;
drop function public.publish_school_tender(text, text, text, bigint, bigint, jsonb, uuid, uuid, uuid);

drop view public.public_market_tenders;
create view public.public_market_tenders
with (security_invoker = false, security_barrier = true)
as
select
  t.id,
  t.slug,
  t.asset_name,
  t.summary,
  t.description,
  t.category,
  t.location,
  o.name as issuer,
  t.currency,
  t.funding_target_minor,
  t.status,
  t.is_illustrative,
  t.source_product_id,
  t.created_at,
  (
    select jsonb_build_object(
      'id', b.id, 'version', b.version, 'currency', b.currency, 'hash', b.content_hash,
      'lines', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', bl.id, 'item', bl.item, 'quantity', bl.quantity,
          'unit', bl.unit, 'unit_cost_minor', bl.unit_cost_minor
        ) order by bl.id)
        from public.blueprint_lines bl where bl.blueprint_id = b.id
      ), '[]'::jsonb)
    )
    from public.blueprints b
    where b.id = t.active_blueprint_id and b.is_active
  ) as blueprint,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', cm.id,
      'display_name', case
        when cm.show_publicly and (t.is_illustrative or consent.public_name_consent) then cm.display_name
        when cm.role = 'anchor' then 'Anchor (identity private)'
        when cm.role = 'builder' then 'Builder (identity private)'
        else 'Apprentice (identity private)'
      end,
      'role', cm.role,
      'organization_name', case
        when cm.show_publicly and (t.is_illustrative or consent.public_name_consent) then cm.organization_name
        else ''
      end
    ) order by cm.role)
    from public.crew_members cm
    left join lateral (
      select m.public_name_consent
        from public.organization_memberships m
       where m.organization_id = t.organization_id
         and m.user_id = cm.user_id
         and m.is_active
    ) consent on true
    where cm.tender_id = t.id and cm.is_active
  ), '[]'::jsonb) as crew,
  '[]'::jsonb as funders,
  t.asset_build_cost_minor,
  t.target_amount_minor,
  t.current_signaled_amount_minor,
  t.current_settled_amount_minor,
  t.projected_annual_yield_minor,
  t.local_spend_percentage,
  t.crew_wage_allocation_minor,
  t.economic_model_note
from public.tenders t
join public.organizations o on o.id = t.organization_id
where t.status in ('open', 'capitalized_pending_settlement', 'materials', 'fabrication', 'anchor_signed');

grant select on public.public_market_tenders to anon, authenticated;

drop view public.public_roll_records;
create view public.public_roll_records
with (security_invoker = false, security_barrier = true)
as
select
  r.id,
  r.tender_id,
  r.asset_name,
  r.asset_build_cost_minor,
  r.currency,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', roll_crew.value ->> 'id',
      'name', case
        when cm.show_publicly and m.user_id is not null and length(trim(m.display_name)) > 0 then m.display_name
        when roll_crew.value ->> 'role' = 'anchor' then 'Anchor (identity private)'
        when roll_crew.value ->> 'role' = 'builder' then 'Builder (identity private)'
        else 'Apprentice (identity private)'
      end,
      'role', roll_crew.value ->> 'role',
      'organization', case when cm.show_publicly and m.user_id is not null then o.name else '' end
    ) order by roll_crew.value ->> 'role')
    from jsonb_array_elements(r.crew_snapshot) as roll_crew(value)
    left join public.crew_members cm on cm.id = (roll_crew.value ->> 'id')::uuid and cm.tender_id = r.tender_id
    left join public.tenders t on t.id = r.tender_id
    left join public.organization_memberships m
      on m.organization_id = t.organization_id and m.user_id = cm.user_id and m.is_active and m.public_name_consent
    left join public.organizations o on o.id = t.organization_id
  ), '[]'::jsonb) as crew_snapshot,
  r.blueprint_snapshot,
  r.blueprint_id,
  r.blueprint_hash,
  r.anchor_sign_off_id,
  r.anchor_crew_member_id,
  r.anchor_signed_at,
  r.deployed_at,
  t.asset_build_cost_minor
from public.roll_records r
join public.tenders t on t.id = r.tender_id;

grant select on public.public_roll_records to anon, authenticated;

comment on column public.tenders.projected_annual_yield_minor is
  'Optional modeled annual yield in minor currency units; must not be represented as realized cash.';
comment on column public.tenders.economic_model_note is
  'Required provenance and assumptions for any annual yield projection.';
comment on table public.capital_intents is
  'Authenticated, non-binding capital intent. Signals are not funds held or transferred.';

alter table public.tenders
  drop column import_quote_minor,
  drop column local_bom_minor;

alter table public.roll_records
  drop column import_savings_minor;
