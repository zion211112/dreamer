-- Workspace problem briefs: user-owned intake records.
-- These are NOT Tenders. A problem brief is a precursor intake item that may
-- later be promoted into a Tender (the primary domain entity) via the normal
-- Tender lifecycle. Keeping them separate avoids conflating vague field
-- problems with accountable asset Tenders while still persisting them.

create table public.problem_briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 160),
  place text not null default '' check (length(place) <= 160),
  description text not null default '' check (length(description) <= 4000),
  status text not null default 'draft' check (status in ('draft', 'triaged', 'promoted', 'archived')),
  is_illustrative boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index problem_briefs_user_created_idx
  on public.problem_briefs (user_id, created_at desc);

alter table public.problem_briefs enable row level security;

create policy "Owners read their problem briefs"
  on public.problem_briefs for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners create their problem briefs"
  on public.problem_briefs for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Owners update their problem briefs"
  on public.problem_briefs for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Owners delete their problem briefs"
  on public.problem_briefs for delete to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.problem_briefs to authenticated;
revoke all on public.problem_briefs from anon;
