-- APT-LABS v3.0 — single source of truth; keep in sync with migrations/
-- Fresh-installable DDL: all 14 v3 tables + RLS + indexes.
-- Mirrors src/lib/db/* and src/lib/auth/types.ts field-for-field.
-- uuid PKs with gen_random_uuid() defaults; timestamptz created_at/updated_at.
-- Apply on a fresh database. For an existing DB already on migration 0001,
-- the DDL is identical — re-running on a live schema is not supported;
-- use migrations/0001_init.sql for Supabase CLI or psql.

create extension if not exists pgcrypto;

-- Helper: is the caller an admin profile?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Helper: is the caller a steward of an institution?
create or replace function public.is_steward(institution_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'institution'
      and p.id = institution_id
  );
$$;

-- Helper: caller is a participant in an undertaking (owns, coordinates, or is in a package)?
create or replace function public.is_undertaking_participant(undertaking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.undertakings u
    where u.id = undertaking_id
      and (u.institution_id = auth.uid() or u.coordinator_id = auth.uid())
  )
  or exists (
    select 1 from public.packages p
    where p.undertaking_id = undertaking_id and p.person_id = auth.uid()
  );
$$;

-- ============================================================================
-- 1. profiles  (src/lib/auth/types.ts Profile)
-- ============================================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('institution', 'founder', 'coordinator', 'admin')),
  display_name text not null,
  avatar_url text,
  organization_name text,
  location text,
  service_area text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.profiles enable row level security;

create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin());
create policy "profiles_admin_read" on public.profiles
  for select using (public.is_admin());

-- ============================================================================
-- 2. network_nodes  (plan §3)
-- ============================================================================
create table public.network_nodes (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('person', 'crew', 'project', 'asset', 'work', 'institution', 'evidence')),
  label text not null,
  record_basis text not null check (record_basis in ('illustrative', 'local-profile', 'project-reported')),
  data jsonb not null default '{}',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.network_nodes enable row level security;

create policy "network_nodes_role_gated_read" on public.network_nodes
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('institution', 'founder', 'coordinator', 'admin')
    )
    or public.is_admin()
  );
create policy "network_nodes_write" on public.network_nodes
  for insert with check (public.is_admin()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('founder', 'coordinator')));
create policy "network_nodes_update" on public.network_nodes
  for update using (public.is_admin());

-- ============================================================================
-- 3. network_edges  (plan §3; 13 RelationshipKinds from people-network.ts)
-- ============================================================================
create table public.network_edges (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.network_nodes (id) on delete cascade,
  to_id uuid not null references public.network_nodes (id) on delete cascade,
  kind text not null check (kind in (
    'membership', 'affiliation', 'work', 'stewardship', 'contribution',
    'evidence', 'owns', 'operates', 'stewards', 'funds',
    'contributes_to', 'attests', 'issues'
  )),
  props jsonb not null default '{}',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_id <> to_id)
);

alter table public.network_edges enable row level security;

create policy "network_edges_role_gated_read" on public.network_edges
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('institution', 'founder', 'coordinator', 'admin')
    )
    or public.is_admin()
  );
create policy "network_edges_write" on public.network_edges
  for insert with check (public.is_admin()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('founder', 'coordinator')));
create policy "network_edges_update" on public.network_edges
  for update using (public.is_admin());

-- ============================================================================
-- 4. commons_signals  (plan §3)
-- ============================================================================
create table public.commons_signals (
  id uuid primary key default gen_random_uuid(),
  observation text not null,
  proposed_action text not null,
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected', 'returned')),
  steward_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commons_signals enable row level security;

create policy "commons_signals_read" on public.commons_signals
  for select using (true);
create policy "commons_signals_steward_write" on public.commons_signals
  for insert with check (auth.uid() is not null);
create policy "commons_signals_steward_update" on public.commons_signals
  for update using (auth.uid() = steward_id or public.is_admin());

-- ============================================================================
-- 5. work_opps  (plan §3)
-- ============================================================================
create table public.work_opps (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.commons_signals (id) on delete set null,
  title text not null,
  scope text not null,
  status text not null default 'proposed',
  cost numeric,
  currency text not null default 'KES',
  steward_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_opps enable row level security;

create policy "work_opps_read" on public.work_opps
  for select using (true);
create policy "work_opps_steward_write" on public.work_opps
  for insert with check (auth.uid() is not null);
create policy "work_opps_steward_update" on public.work_opps
  for update using (auth.uid() = steward_id or public.is_admin());

-- ============================================================================
-- 6. undertakings  (src/lib/db/work.ts Undertaking)
-- ============================================================================
create table public.undertakings (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null,
  coordinator_id uuid,
  title text not null,
  scope text not null,
  deliverables text[] not null default '{}',
  status text not null default 'draft' check (status in
    ('draft', 'brief', 'team_composed', 'in_progress', 'evidence_submitted', 'accepted', 'closed')),
  brief_id uuid,
  agreed_cost numeric,
  currency text not null default 'KES',
  started_at timestamptz,
  accepted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  created_by uuid,
  updated_by uuid
);

alter table public.undertakings enable row level security;

create policy "undertakings_owned_read" on public.undertakings
  for select using (
    public.is_undertaking_participant(id)
    or public.is_admin()
  );
create policy "undertakings_owned_write" on public.undertakings
  for insert with check (auth.uid() = institution_id or public.is_admin());
create policy "undertakings_owned_update" on public.undertakings
  for update using (public.is_undertaking_participant(id) or public.is_admin());

-- ============================================================================
-- 7. packages  (src/lib/db/work.ts Package)
-- ============================================================================
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  undertaking_id uuid not null references public.undertakings (id) on delete cascade,
  role_type text not null check (role_type in ('anchor', 'builder', 'apprentice', 'coordinator')),
  person_id uuid not null,
  profile_id uuid,
  capability_claims text[] not null default '{}',
  compensation jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

alter table public.packages enable row level security;

create policy "packages_cascade_read" on public.packages
  for select using (
    public.is_undertaking_participant(undertaking_id)
    or public.is_admin()
  );
create policy "packages_cascade_write" on public.packages
  for insert with check (
    public.is_undertaking_participant(undertaking_id)
    or public.is_admin()
  );
create policy "packages_cascade_update" on public.packages
  for update using (public.is_admin());
create policy "packages_cascade_delete" on public.packages
  for delete using (public.is_admin() or auth.uid() = person_id);

-- ============================================================================
-- 8. milestones  (src/lib/db/work.ts Milestone)
-- ============================================================================
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  undertaking_id uuid not null references public.undertakings (id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  completed_at timestamptz,
  evidence_ids uuid[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'submitted', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.milestones enable row level security;

create policy "milestones_cascade_read" on public.milestones
  for select using (public.is_undertaking_participant(undertaking_id) or public.is_admin());
create policy "milestones_cascade_write" on public.milestones
  for insert with check (public.is_undertaking_participant(undertaking_id) or public.is_admin());
create policy "milestones_cascade_update" on public.milestones
  for update using (public.is_admin());

-- ============================================================================
-- 9. evidence  (src/lib/db/network.ts Evidence + work.ts WorkEvidence)
--    The 'evidence' table serves both network profile evidence (profile_id)
--    and work evidence (undertaking_id). WorkEvidence fields are a subset.
-- ============================================================================
create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  undertaking_id uuid,
  type text,
  title text not null,
  description text,
  file_url text,
  file_urls text[] not null default '{}',
  file_type text,
  file_size integer,
  verification_status text,
  verified_by uuid,
  verified_at timestamptz,
  related_capability_ids text[] not null default '{}',
  related_service_offer_ids text[] not null default '{}',
  milestone_id uuid,
  submitted_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  created_by uuid,
  updated_by uuid
);

alter table public.evidence enable row level security;

create policy "evidence_cascade_read" on public.evidence
  for select using (
    auth.uid() = profile_id
    or (undertaking_id is not null and public.is_undertaking_participant(undertaking_id))
    or public.is_admin()
  );
create policy "evidence_write" on public.evidence
  for insert with check (
    auth.uid() = profile_id
    or auth.uid() = submitted_by
    or public.is_admin()
  );
create policy "evidence_update" on public.evidence
  for update using (auth.uid() = profile_id or auth.uid() = created_by or public.is_admin());

-- ============================================================================
-- 10. roll_entries  (src/lib/db/roll.ts RollEntry)
-- ============================================================================
create table public.roll_entries (
  id uuid primary key default gen_random_uuid(),
  undertaking_id uuid not null references public.undertakings (id) on delete cascade,
  undertaking_type text not null check (undertaking_type in ('physical', 'digital', 'creative', 'hybrid')),
  title text not null,
  scope text not null,
  deliverables text[] not null default '{}',
  reusable_designs jsonb,
  commissioned_by jsonb not null,
  participants jsonb not null default '[]',
  evidence jsonb not null default '[]',
  acceptance jsonb not null,
  maintenance_obligations jsonb,
  recorded_at timestamptz not null default now(),
  recorded_by uuid not null,
  hash_anchor text not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- hash_anchor immutability: reject any UPDATE that changes hash_anchor.
create or replace function public.protect_roll_hash_anchor()
returns trigger
language plpgsql
as $$
begin
  if new.hash_anchor is distinct from old.hash_anchor then
    raise exception 'roll_entries.hash_anchor is immutable (append-only revision chain)';
  end if;
  return new;
end;
$$;

create trigger roll_entries_protect_hash_anchor
  before update on public.roll_entries
  for each row
  execute function public.protect_roll_hash_anchor();

alter table public.roll_entries enable row level security;

create policy "roll_entries_cascade_read" on public.roll_entries
  for select using (public.is_undertaking_participant(undertaking_id) or public.is_admin());
create policy "roll_entries_append" on public.roll_entries
  for insert with check (auth.uid() = recorded_by or public.is_admin());
create policy "roll_entries_update" on public.roll_entries
  for update using (public.is_admin());

-- ============================================================================
-- 11. roll_revisions  (src/lib/db/roll.ts RollRevision)
-- ============================================================================
create table public.roll_revisions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.roll_entries (id) on delete cascade,
  revised_by uuid not null,
  revised_at timestamptz not null default now(),
  previous_hash text not null,
  new_hash text not null,
  change_summary text not null,
  change_type text not null default 'correction' check (change_type in ('correction', 'restriction_change', 'evidence_added')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chain integrity: previous_hash must equal the current entry hash_anchor
-- (first revision) or the latest revision new_hash.
create or replace function public.verify_roll_revision_chain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  entry_hash text;
  latest_hash text;
begin
  select hash_anchor into entry_hash from roll_entries where id = new.entry_id;
  if not found then
    raise exception 'roll_revisions: entry % not found', new.entry_id;
  end if;
  select new_hash into latest_hash
    from roll_revisions
    where entry_id = new.entry_id
    order by revised_at desc
    limit 1;
  if latest_hash is null then
    if new.previous_hash <> entry_hash then
      raise exception 'roll_revisions: first revision previous_hash must equal entry hash_anchor';
    end if;
  else
    if new.previous_hash <> latest_hash then
      raise exception 'roll_revisions: previous_hash does not match latest revision new_hash';
    end if;
  end if;
  return new;
end;
$$;

create trigger roll_revisions_verify_chain
  before insert on public.roll_revisions
  for each row
  when (not public.is_admin())
  execute function public.verify_roll_revision_chain();

alter table public.roll_revisions enable row level security;

create policy "roll_revisions_read" on public.roll_revisions
  for select using (public.is_undertaking_participant((select undertaking_id from roll_entries where id = entry_id)) or public.is_admin());
create policy "roll_revisions_append" on public.roll_revisions
  for insert with check (auth.uid() = revised_by or public.is_admin());

-- ============================================================================
-- 12. roll_evidence_files  (src/lib/db/roll.ts RollEvidenceFile)
-- ============================================================================
create table public.roll_evidence_files (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.roll_entries (id) on delete cascade,
  layer text not null check (layer in ('public', 'participant', 'restricted')),
  title text not null,
  description text,
  storage_path text not null,
  mime_type text,
  file_size integer,
  uploaded_by uuid,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roll_evidence_files enable row level security;

create policy "roll_evidence_files_read" on public.roll_evidence_files
  for select using (public.is_undertaking_participant((select undertaking_id from roll_entries where id = entry_id)) or public.is_admin());
create policy "roll_evidence_files_write" on public.roll_evidence_files
  for insert with check (auth.uid() = uploaded_by or public.is_admin());
create policy "roll_evidence_files_update" on public.roll_evidence_files
  for update using (public.is_admin());

-- ============================================================================
-- 13. attestations  (src/lib/intelligence/types.ts Attestation — Passport)
--     Stored snake_case to match Supabase convention; client maps camelCase.
-- ============================================================================
create table public.attestations (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  issuer text not null,
  claim text not null,
  scope text not null,
  evidence text[] not null default '{}',
  consent boolean not null default true,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired', 'disputed')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  revocation_reason text,
  portable boolean not null default true,
  undertaking uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.attestations enable row level security;

create policy "attestations_consent_gated_read" on public.attestations
  for select using (auth.uid()::text = subject or issuer = auth.uid()::text or public.is_admin());
create policy "attestations_issuer_write" on public.attestations
  for insert with check (issuer = auth.uid()::text or public.is_admin());
create policy "attestations_issuer_update" on public.attestations
  for update using (issuer = auth.uid()::text or public.is_admin());

-- ============================================================================
-- 14. instruments  (src/lib/intelligence/types.ts EconomicInstrument — Coin)
-- ============================================================================
create table public.instruments (
  id uuid primary key default gen_random_uuid(),
  purpose text not null,
  issuer text not null,
  terms text not null,
  lifecycle text not null default 'proposed' check (lifecycle in ('proposed', 'active', 'suspended', 'retired')),
  participants text[] not null default '{}',
  settlement_rules text,
  undertaking uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.instruments enable row level security;

create policy "instruments_read_only" on public.instruments
  for select using (public.is_admin());
-- research-only in v3: no write policies (writes behind future authority model).

-- ============================================================================
-- 15. findings  (src/lib/intelligence/types.ts Finding — Engine)
-- ============================================================================
create table public.findings (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  scope text not null,
  evidence_base text[] not null default '{}',
  assessment text not null,
  limitations text[] not null default '{}',
  authorized_decision_maker text not null,
  status text not null default 'draft' check (status in ('draft', 'issued', 'withdrawn')),
  issued_at timestamptz,
  undertaking uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.findings enable row level security;

create policy "findings_read_only" on public.findings
  for select using (public.is_admin());
-- research-only in v3: no write policies (writes behind future authority model).

-- ============================================================================
-- Indexes on FK and query columns
-- ============================================================================
create index idx_network_edges_from on public.network_edges (from_id);
create index idx_network_edges_to on public.network_edges (to_id);
create index idx_network_edges_kind on public.network_edges (kind);
create index idx_commons_signals_steward on public.commons_signals (steward_id);
create index idx_work_opps_signal on public.work_opps (signal_id);
create index idx_work_opps_steward on public.work_opps (steward_id);
create index idx_undertakings_institution on public.undertakings (institution_id);
create index idx_undertakings_coordinator on public.undertakings (coordinator_id);
create index idx_undertakings_status on public.undertakings (status);
create index idx_packages_undertaking on public.packages (undertaking_id);
create index idx_packages_person on public.packages (person_id);
create index idx_milestones_undertaking on public.milestones (undertaking_id);
create index idx_milestones_due on public.milestones (due_date);
create index idx_evidence_profile on public.evidence (profile_id);
create index idx_evidence_undertaking on public.evidence (undertaking_id);
create index idx_evidence_milestone on public.evidence (milestone_id);
create index idx_roll_entries_undertaking on public.roll_entries (undertaking_id);
create index idx_roll_entries_type on public.roll_entries (undertaking_type);
create index idx_roll_entries_recorded_at on public.roll_entries (recorded_at);
create index idx_roll_revisions_entry on public.roll_revisions (entry_id);
create index idx_roll_revisions_revised_at on public.roll_revisions (revised_at);
create index idx_roll_evidence_files_entry on public.roll_evidence_files (entry_id);
create index idx_attestations_subject on public.attestations (subject);
create index idx_attestations_issuer on public.attestations (issuer);
create index idx_instruments_issuer on public.instruments (issuer);
create index idx_findings_subject on public.findings (subject);
