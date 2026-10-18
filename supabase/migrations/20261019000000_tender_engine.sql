create type public.tender_status as enum (
  'draft',
  'open',
  'materials',
  'fabrication',
  'anchor_signed',
  'deployed',
  'cancelled'
);

create type public.tender_category as enum (
  'education',
  'energy',
  'media',
  'agriculture',
  'infrastructure',
  'software'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  kind text not null check (kind in ('school', 'startup', 'community', 'builder')),
  location text not null default '',
  created_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('principal', 'teacher', 'tender_issuer')),
  display_name text not null default '',
  public_name_consent boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.tenders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  source_product_id uuid references public.tenders(id),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  asset_name text not null check (length(trim(asset_name)) between 1 and 160),
  summary text not null check (length(trim(summary)) between 1 and 300),
  description text not null default '' check (length(description) <= 10000),
  category public.tender_category not null,
  location text not null default '',
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  import_quote_minor bigint not null check (import_quote_minor between 0 and 9007199254740991),
  local_bom_minor bigint not null check (local_bom_minor between 0 and 9007199254740991),
  funding_target_minor bigint not null check (funding_target_minor between 0 and 9007199254740991),
  status public.tender_status not null default 'draft',
  is_illustrative boolean not null default false,
  active_blueprint_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, currency),
  check (source_product_id is null or source_product_id <> id)
);

create table public.blueprints (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  version integer not null check (version > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  content_hash text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tender_id, version),
  unique (tender_id, id),
  foreign key (tender_id, currency)
    references public.tenders(id, currency),
  check (length(content_hash) between 8 and 128)
);

alter table public.tenders
  add constraint tenders_active_blueprint_fk
  foreign key (id, active_blueprint_id)
  references public.blueprints(tender_id, id)
  deferrable initially deferred;

create unique index blueprints_one_active_per_tender
  on public.blueprints(tender_id) where is_active;

create table public.blueprint_lines (
  id uuid primary key default gen_random_uuid(),
  blueprint_id uuid not null references public.blueprints(id) on delete cascade,
  item text not null check (length(trim(item)) between 1 and 240),
  quantity numeric(12, 3) not null check (quantity > 0),
  unit text not null check (length(trim(unit)) between 1 and 40),
  unit_cost_minor bigint not null check (unit_cost_minor between 0 and 9007199254740991)
);

create table public.crew_members (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  user_id uuid references auth.users(id),
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  organization_name text not null default '',
  role text not null check (role in ('anchor', 'builder', 'apprentice')),
  show_publicly boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tender_id, id)
);

create unique index crew_one_active_anchor_per_tender
  on public.crew_members(tender_id)
  where role = 'anchor' and is_active;

create unique index crew_unique_user_role_per_tender
  on public.crew_members(tender_id, user_id, role)
  where user_id is not null;

create table public.funders (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(trim(display_name)) between 1 and 160),
  public_name_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.funding_allocations (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  funder_id uuid not null references public.funders(id),
  amount_minor bigint not null check (amount_minor between 0 and 9007199254740991),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  basis text not null check (basis in ('illustrative', 'verified')),
  created_at timestamptz not null default now(),
  foreign key (tender_id, currency)
    references public.tenders(id, currency)
);

create table public.anchor_sign_offs (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id),
  crew_member_id uuid not null,
  blueprint_id uuid not null,
  blueprint_hash text not null,
  signed_by uuid not null references auth.users(id),
  signed_at timestamptz not null default now(),
  unique (tender_id, blueprint_id),
  unique (id, tender_id, crew_member_id),
  foreign key (tender_id, crew_member_id)
    references public.crew_members(tender_id, id),
  foreign key (tender_id, blueprint_id)
    references public.blueprints(tender_id, id)
);

create table public.roll_records (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null unique references public.tenders(id),
  asset_name text not null,
  import_savings_minor bigint not null check (import_savings_minor between 0 and 9007199254740991),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  crew_snapshot jsonb not null check (
    jsonb_typeof(crew_snapshot) = 'array' and jsonb_array_length(crew_snapshot) = 3
  ),
  blueprint_snapshot jsonb not null check (
    jsonb_typeof(blueprint_snapshot) = 'array'
    and jsonb_array_length(blueprint_snapshot) between 1 and 100
  ),
  blueprint_id uuid not null references public.blueprints(id),
  blueprint_hash text not null,
  anchor_sign_off_id uuid not null unique references public.anchor_sign_offs(id),
  anchor_crew_member_id uuid not null,
  anchor_signed_at timestamptz not null,
  foreign key (anchor_sign_off_id, tender_id, anchor_crew_member_id)
    references public.anchor_sign_offs(id, tender_id, crew_member_id),
  deployed_at timestamptz not null default now()
);

create function public.prevent_roll_record_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Roll records are immutable';
end;
$$;

create trigger roll_records_immutable
before update or delete on public.roll_records
for each row execute function public.prevent_roll_record_mutation();

create function public.school_tender_crew_candidates()
returns table (user_id uuid, display_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  select m.organization_id into v_organization_id
    from public.organization_memberships m
    join public.organizations o on o.id = m.organization_id
   where m.user_id = v_user_id
     and m.role in ('principal', 'tender_issuer')
     and m.is_active
     and o.kind = 'school'
   order by (m.role = 'principal') desc, m.created_at, m.organization_id
   limit 1;
  if v_organization_id is null then
    raise exception 'A school Principal or Tender issuer membership is required';
  end if;
  return query
    select m.user_id, m.display_name
      from public.organization_memberships m
     where m.organization_id = v_organization_id
       and m.is_active
       and length(trim(m.display_name)) > 0
     order by m.display_name;
end;
$$;

create function public.publish_school_tender(
  p_slug text,
  p_asset_name text,
  p_summary text,
  p_import_quote_minor bigint,
  p_local_bom_minor bigint,
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
  v_hash text;
  v_crew_ids uuid[];
  v_line jsonb;
  v_item text;
  v_quantity numeric;
  v_unit text;
  v_unit_cost_numeric numeric;
  v_unit_cost_minor bigint;
  v_line_total numeric;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_slug is null
     or p_asset_name is null
     or p_summary is null
     or p_import_quote_minor is null
     or p_local_bom_minor is null
     or p_anchor_user_id is null
     or p_builder_user_id is null
     or p_apprentice_user_id is null
     or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or length(p_slug) > 120
     or length(trim(p_asset_name)) not between 1 and 160
     or length(trim(p_summary)) not between 1 and 10000
     or p_import_quote_minor <= p_local_bom_minor
     or p_import_quote_minor > 9007199254740991
     or p_local_bom_minor > 9007199254740991
     or p_local_bom_minor <= 0
     or p_anchor_user_id = p_builder_user_id
     or p_anchor_user_id = p_apprentice_user_id
     or p_builder_user_id = p_apprentice_user_id then
    raise exception 'Tender fields or same-currency quotes are invalid';
  end if;
  if p_blueprint_lines is null or jsonb_typeof(p_blueprint_lines) is distinct from 'array' then
    raise exception 'An itemized Blueprint is required';
  end if;
  if jsonb_array_length(p_blueprint_lines) not between 1 and 100 then
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
    p_slug || ':' || p_local_bom_minor::text || ':' || p_blueprint_lines::text,
    'UTF8'
  )), 'hex');
  insert into public.tenders (
    id, organization_id, source_product_id, slug, asset_name, summary, description,
    category, location, currency, import_quote_minor, local_bom_minor,
    funding_target_minor, status, is_illustrative
  ) values (
    v_tender_id, v_organization_id, v_source_product_id, p_slug, trim(p_asset_name),
    left(trim(p_summary), 300), trim(p_summary), 'education', v_location, 'KES',
    p_import_quote_minor, p_local_bom_minor, p_local_bom_minor, 'draft', false
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
    v_unit_cost_minor := v_unit_cost_numeric::bigint;
    insert into public.blueprint_lines (blueprint_id, item, quantity, unit, unit_cost_minor)
    values (v_blueprint_id, v_item, v_quantity, v_unit, v_unit_cost_minor);
  end loop;
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

  if (
    select coalesce(sum(bl.quantity * bl.unit_cost_minor), 0)
      from public.blueprint_lines bl
     where bl.blueprint_id = v_blueprint_id
  ) <> p_local_bom_minor then
    raise exception 'Blueprint total does not match the local quote';
  end if;
  update public.tenders set status = 'open', updated_at = now() where id = v_tender_id;

  return p_slug;
end;
$$;

create function public.transition_tender(
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

  select * into v_tender
    from public.tenders
   where id = p_tender_id
   for update;
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
    if v_blueprint.currency <> v_tender.currency or v_total <> v_tender.local_bom_minor then
      raise exception 'Active Blueprint total or currency does not match the Tender quote';
    end if;
    insert into public.anchor_sign_offs (
      tender_id, crew_member_id, blueprint_id, blueprint_hash, signed_by
    ) values (
      p_tender_id, v_crew.id, v_blueprint.id, v_blueprint.content_hash, v_user_id
    ) returning * into v_sign_off;
    update public.tenders set status = 'anchor_signed', updated_at = now() where id = p_tender_id;
    return null;
  elsif p_next_status = 'deployed' and v_tender.status = 'anchor_signed' then
    if v_tender.is_illustrative then
      raise exception 'Illustrative Tenders cannot be deployed into the Roll';
    end if;
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
    if v_blueprint.currency <> v_tender.currency or v_total <> v_tender.local_bom_minor then
      raise exception 'Active Blueprint total or currency does not match the Tender quote';
    end if;

    insert into public.roll_records (
      tender_id, asset_name, import_savings_minor, currency, crew_snapshot, blueprint_snapshot,
      blueprint_id, blueprint_hash, anchor_sign_off_id, anchor_crew_member_id,
      anchor_signed_at
    )
    select
      v_tender.id,
      v_tender.asset_name,
      v_tender.import_quote_minor - v_tender.local_bom_minor,
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
        join public.tenders consent_tender
          on consent_tender.organization_id = m.organization_id
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

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.tenders enable row level security;
alter table public.blueprints enable row level security;
alter table public.blueprint_lines enable row level security;
alter table public.crew_members enable row level security;
alter table public.funders enable row level security;
alter table public.funding_allocations enable row level security;
alter table public.anchor_sign_offs enable row level security;
alter table public.roll_records enable row level security;

create policy "Public organizations for published Tenders"
  on public.organizations for select
  using (exists (
    select 1 from public.tenders t
    where t.organization_id = organizations.id
      and t.status not in ('draft', 'cancelled')
  ));

create policy "Members read their organization memberships"
  on public.organization_memberships for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Members update their own profile fields"
  on public.organization_memberships for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Published Tenders are public"
  on public.tenders for select
  using (status not in ('draft', 'cancelled'));

create policy "School issuers read their private drafts"
  on public.tenders for select to authenticated
  using (exists (
    select 1 from public.organization_memberships m
    where m.organization_id = tenders.organization_id
      and m.user_id = (select auth.uid())
      and m.is_active
      and m.role in ('principal', 'tender_issuer')
  ));

create policy "Public Blueprints belong to published Tenders"
  on public.blueprints for select
  using (exists (
    select 1 from public.tenders t
    where t.id = blueprints.tender_id
      and t.status not in ('draft', 'cancelled')
  ));

create policy "School issuers read their draft Blueprints"
  on public.blueprints for select to authenticated
  using (exists (
    select 1 from public.tenders t
    join public.organization_memberships m on m.organization_id = t.organization_id
    where t.id = blueprints.tender_id
      and t.status = 'draft'
      and m.user_id = (select auth.uid())
      and m.is_active
      and m.role in ('principal', 'tender_issuer')
  ));

create policy "Public BOM lines belong to published Blueprints"
  on public.blueprint_lines for select
  using (exists (
    select 1 from public.blueprints b
    join public.tenders t on t.id = b.tender_id
    where b.id = blueprint_lines.blueprint_id
      and t.status not in ('draft', 'cancelled')
  ));

create policy "School issuers read BOM lines in their draft"
  on public.blueprint_lines for select to authenticated
  using (exists (
    select 1 from public.blueprints b
    join public.tenders t on t.id = b.tender_id
    join public.organization_memberships m on m.organization_id = t.organization_id
    where b.id = blueprint_lines.blueprint_id
      and t.status = 'draft'
      and m.user_id = (select auth.uid())
      and m.is_active
      and m.role in ('principal', 'tender_issuer')
  ));

create policy "Crew reads own assignment"
  on public.crew_members for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and is_active
    and exists (
      select 1 from public.tenders t
      join public.organization_memberships m on m.organization_id = t.organization_id
      where t.id = crew_members.tender_id
        and m.user_id = (select auth.uid())
        and m.is_active
    )
  );

create policy "Consented funder names are public"
  on public.funders for select
  using (public_name_consent);

create policy "Public funding signals belong to published Tenders"
  on public.funding_allocations for select
  using (exists (
    select 1 from public.tenders t
    join public.funders f on f.id = funding_allocations.funder_id
    where t.id = funding_allocations.tender_id
      and t.status not in ('draft', 'cancelled')
      and f.public_name_consent
  ));

create policy "Real Roll records are public"
  on public.roll_records for select
  using (true);

create policy "Crew reads own sign-offs"
  on public.anchor_sign_offs for select to authenticated
  using (signed_by = (select auth.uid()));

revoke all on function public.school_tender_crew_candidates() from public, anon;
revoke all on function public.publish_school_tender(text, text, text, bigint, bigint, jsonb, uuid, uuid, uuid) from public, anon;
revoke all on function public.transition_tender(uuid, public.tender_status) from public, anon;
grant execute on function public.school_tender_crew_candidates() to authenticated;
grant execute on function public.publish_school_tender(text, text, text, bigint, bigint, jsonb, uuid, uuid, uuid) to authenticated;
grant execute on function public.transition_tender(uuid, public.tender_status) to authenticated;

revoke insert, update, delete, truncate, references, trigger
  on public.organizations, public.organization_memberships, public.tenders,
     public.blueprints, public.blueprint_lines, public.crew_members,
     public.funders, public.funding_allocations, public.anchor_sign_offs,
     public.roll_records
  from anon, authenticated;
grant update (display_name, public_name_consent)
  on public.organization_memberships to authenticated;

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
  t.import_quote_minor,
  t.local_bom_minor,
  t.funding_target_minor,
  t.status,
  t.is_illustrative,
  t.source_product_id,
  t.created_at,
  (
    select jsonb_build_object(
      'id', b.id,
      'version', b.version,
      'currency', b.currency,
      'hash', b.content_hash,
      'lines', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', bl.id,
          'item', bl.item,
          'quantity', bl.quantity,
          'unit', bl.unit,
          'unit_cost_minor', bl.unit_cost_minor
        ) order by bl.id)
        from public.blueprint_lines bl
        where bl.blueprint_id = b.id
      ), '[]'::jsonb)
    )
    from public.blueprints b
    where b.id = t.active_blueprint_id
      and b.is_active
  ) as blueprint,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', cm.id,
      'display_name', case
        when cm.show_publicly and t.is_illustrative then cm.display_name
        when cm.show_publicly and consent.public_name_consent then consent.display_name
        when cm.role = 'anchor' then 'Anchor (identity private)'
        when cm.role = 'builder' then 'Builder (identity private)'
        else 'Apprentice (identity private)'
      end,
      'role', cm.role,
      'organization_name', case
        when cm.show_publicly and t.is_illustrative then cm.organization_name
        when cm.show_publicly and consent.public_name_consent then o.name
        else ''
      end
    ) order by cm.role)
    from public.crew_members cm
    left join lateral (
      select m.public_name_consent, m.display_name
        from public.organization_memberships m
       where m.organization_id = t.organization_id
         and m.user_id = cm.user_id
         and m.is_active
    ) consent on true
    left join public.organizations o on o.id = t.organization_id
    where cm.tender_id = t.id
      and cm.is_active
  ), '[]'::jsonb) as crew,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id,
      'funder', f.display_name,
      'amount_minor', a.amount_minor,
      'currency', a.currency,
      'basis', a.basis
    ) order by a.created_at)
    from public.funding_allocations a
    join public.funders f on f.id = a.funder_id
    where a.tender_id = t.id
      and f.public_name_consent
      and a.currency = t.currency
  ), '[]'::jsonb) as funders
from public.tenders t
join public.organizations o on o.id = t.organization_id
where t.status in ('open', 'materials', 'fabrication', 'anchor_signed');

create view public.public_roll_records
with (security_invoker = false, security_barrier = true)
as
select
  r.id,
  r.tender_id,
  r.asset_name,
  r.import_savings_minor,
  r.currency,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', roll_crew.value ->> 'id',
      'name', case
        when cm.show_publicly
         and m.user_id is not null
         and length(trim(m.display_name)) > 0 then m.display_name
        when roll_crew.value ->> 'role' = 'anchor' then 'Anchor (identity private)'
        when roll_crew.value ->> 'role' = 'builder' then 'Builder (identity private)'
        else 'Apprentice (identity private)'
      end,
      'role', roll_crew.value ->> 'role',
      'organization', case
        when cm.show_publicly and m.user_id is not null then o.name
        else ''
      end
    ) order by roll_crew.value ->> 'role')
    from jsonb_array_elements(r.crew_snapshot) as roll_crew(value)
    left join public.crew_members cm
      on cm.id = (roll_crew.value ->> 'id')::uuid
     and cm.tender_id = r.tender_id
    left join public.tenders t on t.id = r.tender_id
    left join public.organization_memberships m
      on m.organization_id = t.organization_id
     and m.user_id = cm.user_id
     and m.is_active
     and m.public_name_consent
    left join public.organizations o on o.id = t.organization_id
  ), '[]'::jsonb) as crew_snapshot,
  r.blueprint_snapshot,
  r.blueprint_id,
  r.blueprint_hash,
  r.anchor_sign_off_id,
  r.anchor_crew_member_id,
  r.anchor_signed_at,
  r.deployed_at
from public.roll_records r;

grant select on public.public_market_tenders to anon, authenticated;
grant select on public.public_roll_records to anon, authenticated;
grant select on public.tenders to anon, authenticated;
grant select on public.organizations to anon, authenticated;
grant select on public.blueprints, public.blueprint_lines to anon, authenticated;
grant select on public.funders, public.funding_allocations to anon, authenticated;
revoke select on public.roll_records from anon, authenticated;
revoke select on public.crew_members from anon, authenticated;
grant select (id, tender_id, user_id, role, is_active)
  on public.crew_members to authenticated;
grant select on public.organization_memberships, public.anchor_sign_offs to authenticated;

insert into public.organizations (id, name, kind, location)
values ('00000000-0000-4000-8000-000000000001', 'APT-LABS', 'builder', 'Nairobi, Kenya')
on conflict (id) do nothing;

insert into public.tenders (
  id, organization_id, slug, asset_name, summary, description, category, location,
  currency, import_quote_minor, local_bom_minor, funding_target_minor, status, is_illustrative
)
values (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'school-console',
  'School Console',
  'A local-first toolkit for the week teachers actually have.',
  'A local-first school utility for lessons and transparent marking.',
  'software',
  'Nairobi, Kenya',
  'KES',
  4800000,
  2400000,
  2400000,
  'open',
  true
)
on conflict (slug) do nothing;

do $$
declare
  v_tender_id uuid;
  v_blueprint_id uuid := '00000000-0000-4000-8000-000000000003';
begin
  select id into v_tender_id from public.tenders where slug = 'school-console';
  insert into public.blueprints (id, tender_id, version, currency, content_hash, is_active)
  values (v_blueprint_id, v_tender_id, 1, 'KES', 'illustrative-school-console-v1', true)
  on conflict (id) do nothing;
  insert into public.blueprint_lines (blueprint_id, item, quantity, unit, unit_cost_minor)
  select v_blueprint_id, 'Local-first school utility build', 1, 'build', 2400000
  where not exists (select 1 from public.blueprint_lines where blueprint_id = v_blueprint_id);
  update public.tenders set active_blueprint_id = v_blueprint_id where id = v_tender_id;
end;
$$;

insert into public.crew_members (
  id, tender_id, display_name, organization_name, role, show_publicly
)
select
  assignment.id,
  t.id,
  assignment.display_name,
  'APT-LABS',
  assignment.role,
  true
from public.tenders t
cross join (values
  ('00000000-0000-4000-8000-000000000011'::uuid, 'Example Anchor', 'anchor'),
  ('00000000-0000-4000-8000-000000000012'::uuid, 'Example Builder', 'builder'),
  ('00000000-0000-4000-8000-000000000013'::uuid, 'Example Apprentice', 'apprentice')
) as assignment(id, display_name, role)
where t.slug = 'school-console'
on conflict (id) do nothing;
