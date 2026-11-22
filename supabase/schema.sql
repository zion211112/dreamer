-- APT-LABS — Supabase schema (production backend)
-- Run this in the Supabase SQL editor to enable the real backend.
-- Demo mode (localStorage) is used when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are unset.

-- Generic key-value storage backing record-envelope, relationship-store, evidence-store, etc.
-- Each lib module stores its JSON under a namespaced key (e.g. 'aptlabs:records').
create table if not exists public.apt_storage (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable realtime so open tabs reflect writes from other users (optional, safe to omit).
alter table public.apt_storage enable replica identity full;

-- RLS: each row is keyed by a namespace; in production scope reads/writes by org/actor context.
-- For the MVP, authenticated users can read/write all rows; tighten per-org once actor membership
-- is backed by Supabase profiles/memberships tables.
alter table public.apt_storage enable row level security;

create policy "Authenticated users can read apt_storage"
  on public.apt_storage for select
  to authenticated
  using (true);

create policy "Authenticated users can write apt_storage"
  on public.apt_storage for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update apt_storage"
  on public.apt_storage for update
  to authenticated
  using (true);

create policy "Authenticated users can delete apt_storage"
  on public.apt_storage for delete
  to authenticated
  using (true);

-- Index for freshness ordering (mirrors listRecords updatedAt sort).
create index if not exists idx_apt_storage_updated_at on public.apt_storage (updated_at desc);
