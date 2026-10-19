create type public.commons_resource_kind as enum (
  'blueprint',
  'bom',
  'cad',
  'media',
  'reference'
);

create type public.commons_review_status as enum (
  'pending',
  'published',
  'hidden',
  'rejected'
);

create type public.commons_report_reason as enum (
  'spam',
  'unsafe',
  'rights',
  'privacy',
  'other'
);

create table public.workspace_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_workspace text not null check (default_workspace in ('apt', 'school')),
  updated_at timestamptz not null default now()
);

create table public.commons_moderators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.commons_contributors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  approved_by uuid not null references auth.users(id),
  approved_at timestamptz not null default now()
);

create table public.commons_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz
);

create unique index commons_one_pending_access_request
  on public.commons_access_requests(user_id)
  where status = 'pending';

create table public.commons_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Maker'
    check (length(trim(display_name)) between 1 and 80),
  public_name_consent boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.commons_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 180),
  summary text not null check (length(trim(summary)) between 1 and 2000),
  resource_kind public.commons_resource_kind not null,
  source_url text not null check (source_url ~* '^https?://'),
  attribution text not null check (length(trim(attribution)) between 1 and 400),
  license_name text not null check (length(trim(license_name)) between 1 and 120),
  license_url text not null check (license_url ~* '^https?://'),
  revision text not null check (length(trim(revision)) between 1 and 80),
  tender_id uuid references public.tenders(id) on delete set null,
  submitted_by uuid not null references auth.users(id),
  status public.commons_review_status not null default 'pending',
  created_at timestamptz not null default now(),
  published_at timestamptz,
  moderated_by uuid references auth.users(id),
  moderated_at timestamptz
);

create index commons_resources_public_index
  on public.commons_resources(resource_kind, published_at desc)
  where status = 'published';

create table public.commons_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 160),
  body text not null check (length(trim(body)) between 1 and 5000),
  post_kind text not null default 'discussion'
    check (post_kind in ('discussion', 'poll')),
  author_id uuid not null references auth.users(id),
  status public.commons_review_status not null default 'pending',
  created_at timestamptz not null default now(),
  published_at timestamptz,
  moderated_by uuid references auth.users(id),
  moderated_at timestamptz
);

create index commons_posts_public_activity
  on public.commons_posts(published_at desc, id)
  where status = 'published';

create table public.commons_post_resources (
  post_id uuid not null references public.commons_posts(id) on delete cascade,
  resource_id uuid not null references public.commons_resources(id) on delete restrict,
  primary key (post_id, resource_id)
);

create table public.commons_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.commons_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  body text not null check (length(trim(body)) between 1 and 3000),
  status public.commons_review_status not null default 'pending',
  created_at timestamptz not null default now(),
  published_at timestamptz,
  moderated_by uuid references auth.users(id),
  moderated_at timestamptz
);

create index commons_comments_post_activity
  on public.commons_comments(post_id, published_at, id)
  where status = 'published';

create table public.commons_polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.commons_posts(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  closes_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.commons_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.commons_polls(id) on delete cascade,
  label text not null check (length(trim(label)) between 1 and 120),
  position smallint not null check (position between 1 and 6),
  unique (poll_id, position),
  unique (poll_id, id)
);

create table public.commons_poll_votes (
  poll_id uuid not null references public.commons_polls(id) on delete cascade,
  option_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id),
  foreign key (poll_id, option_id)
    references public.commons_poll_options(poll_id, id)
);

create table public.commons_reports (
  id uuid primary key default gen_random_uuid(),
  target_kind text not null check (target_kind in ('resource', 'post', 'comment')),
  target_id uuid not null,
  reporter_id uuid not null references auth.users(id),
  reason public.commons_report_reason not null,
  status text not null default 'pending'
    check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  unique (target_kind, target_id, reporter_id)
);

create table public.commons_moderation_events (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id),
  target_kind text not null
    check (target_kind in ('access_request', 'contributor', 'resource', 'post', 'comment', 'report')),
  target_id uuid not null,
  action text not null
    check (action in ('approve_contributor', 'decline_contributor', 'revoke_contributor', 'restore_contributor', 'publish', 'hide', 'reject', 'resolve_report', 'dismiss_report')),
  note text not null default '' check (length(note) <= 500),
  created_at timestamptz not null default now()
);

create table public.commons_rate_windows (
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null
    check (action in ('post', 'poll', 'comment', 'vote', 'resource', 'report', 'access_request')),
  window_start timestamptz not null,
  action_count integer not null check (action_count between 1 and 100),
  primary key (user_id, action, window_start)
);

create function public.is_commons_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.commons_moderators m
    where m.user_id = (select auth.uid()) and m.is_active
  );
$$;

create function public.is_commons_contributor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.commons_contributors c
    where c.user_id = (select auth.uid()) and c.is_active
  );
$$;

create function public.commons_contributor_requests_open()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.commons_moderators where is_active);
$$;

create function public.can_read_commons_post(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.commons_posts post
    where post.id = p_post_id
      and (
        post.status = 'published'
        or post.author_id = (select auth.uid())
        or public.is_commons_moderator()
      )
  );
$$;

create function public.can_read_commons_poll(p_poll_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.commons_polls poll
    where poll.id = p_poll_id
      and public.can_read_commons_post(poll.post_id)
  );
$$;

create function public.consume_commons_rate_limit(p_action text, p_limit integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_window_start timestamptz := date_trunc('hour', now());
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_action, 0));
  delete from public.commons_rate_windows
   where user_id = v_user_id
     and window_start < now() - interval '7 days';
  insert into public.commons_rate_windows (user_id, action, window_start, action_count)
  values (v_user_id, p_action, v_window_start, 1)
  on conflict (user_id, action, window_start)
  do update set action_count = public.commons_rate_windows.action_count + 1
    where public.commons_rate_windows.action_count < p_limit
  returning action_count into v_count;
  if v_count is null then
    raise exception 'Hourly contribution limit reached for this action';
  end if;
end;
$$;

create function public.request_commons_access()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required to request Commons access';
  end if;
  if not public.commons_contributor_requests_open() then
    raise exception 'Commons contributions are read-only because human moderation is not staffed';
  end if;
  if public.is_commons_contributor() then
    raise exception 'This account already has Commons contributor access';
  end if;
  if exists (
    select 1 from public.commons_access_requests
    where user_id = v_user_id and status = 'pending'
  ) then
    raise exception 'A Commons access request is already pending';
  end if;
  perform public.consume_commons_rate_limit('access_request', 1);
  insert into public.commons_access_requests (user_id)
  values (v_user_id)
  returning id into v_request_id;
  return v_request_id;
end;
$$;

create function public.submit_commons_resource(
  p_title text,
  p_summary text,
  p_resource_kind public.commons_resource_kind,
  p_source_url text,
  p_attribution text,
  p_license_name text,
  p_license_url text,
  p_revision text,
  p_tender_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_resource_id uuid;
begin
  if v_user_id is null or not public.is_commons_contributor() then
    raise exception 'Approved Commons contributor access required';
  end if;
  if not public.commons_contributor_requests_open() then
    raise exception 'Commons contributions are read-only because human moderation is not staffed';
  end if;
  if p_title is null or length(trim(p_title)) not between 1 and 180
     or p_summary is null or length(trim(p_summary)) not between 1 and 2000
     or p_resource_kind is null
     or p_source_url is null or p_source_url !~* '^https?://'
     or p_attribution is null
     or p_license_url !~* '^https?://'
     or p_license_url is null
     or p_license_name is null
     or p_revision is null
     or length(trim(p_attribution)) not between 1 and 400
     or length(trim(p_license_name)) not between 1 and 120
     or length(trim(p_revision)) not between 1 and 80 then
    raise exception 'Resource source, attribution, license, or revision is invalid';
  end if;
  if p_tender_id is not null and not exists (
    select 1 from public.tenders t
    where t.id = p_tender_id and t.status not in ('draft', 'cancelled')
  ) then
    raise exception 'Related public Tender not found';
  end if;
  perform public.consume_commons_rate_limit('resource', 3);
  insert into public.commons_resources (
    title, summary, resource_kind, source_url, attribution, license_name,
    license_url, revision, tender_id, submitted_by, status
  )
  values (
    trim(p_title), trim(p_summary), p_resource_kind, trim(p_source_url),
    trim(p_attribution), trim(p_license_name), trim(p_license_url),
    trim(p_revision), p_tender_id, v_user_id, 'pending'
  )
  returning id into v_resource_id;
  return v_resource_id;
end;
$$;

create function public.submit_commons_post(
  p_title text,
  p_body text,
  p_resource_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_post_id uuid;
  v_resource_ids uuid[] := coalesce(p_resource_ids, '{}'::uuid[]);
begin
  if v_user_id is null or not public.is_commons_contributor() then
    raise exception 'Approved Commons contributor access required';
  end if;
  if not public.commons_contributor_requests_open() then
    raise exception 'Commons contributions are read-only because human moderation is not staffed';
  end if;
  if p_title is null or length(trim(p_title)) not between 1 and 160
     or p_body is null or length(trim(p_body)) not between 1 and 5000 then
    raise exception 'Post title or body is outside the allowed length';
  end if;
  if cardinality(v_resource_ids) > 5
     or cardinality(v_resource_ids) <> (
       select count(distinct resource_id) from unnest(v_resource_ids) as resources(resource_id)
     ) then
    raise exception 'A post may reference at most five distinct resources';
  end if;
  if exists (
    select 1 from unnest(v_resource_ids) as resources(resource_id)
    where not exists (
      select 1 from public.commons_resources r
      where r.id = resource_id and r.status = 'published'
    )
  ) then
    raise exception 'A referenced resource is unavailable';
  end if;
  perform public.consume_commons_rate_limit('post', 5);
  insert into public.commons_posts (title, body, post_kind, author_id, status)
  values (trim(p_title), trim(p_body), 'discussion', v_user_id, 'pending')
  returning id into v_post_id;
  insert into public.commons_post_resources (post_id, resource_id)
  select v_post_id, resource_id from unnest(v_resource_ids) as resources(resource_id);
  return v_post_id;
end;
$$;

create function public.submit_commons_poll(
  p_question text,
  p_context text,
  p_options text[],
  p_closes_at timestamptz,
  p_resource_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_post_id uuid;
  v_poll_id uuid;
  v_option text;
  v_position smallint := 0;
  v_resource_ids uuid[] := coalesce(p_resource_ids, '{}'::uuid[]);
begin
  if v_user_id is null or not public.is_commons_contributor() then
    raise exception 'Approved Commons contributor access required';
  end if;
  if not public.commons_contributor_requests_open() then
    raise exception 'Commons contributions are read-only because human moderation is not staffed';
  end if;
  if p_question is null or length(trim(p_question)) not between 1 and 160
     or p_context is null or length(trim(p_context)) not between 1 and 3000
     or coalesce(array_length(p_options, 1), 0) not between 2 and 6 then
    raise exception 'Poll question, context, or option count is invalid';
  end if;
  if exists (
    select 1 from unnest(p_options) as options(option_label)
    where option_label is null or length(trim(option_label)) not between 1 and 120
  ) or (
    select count(distinct lower(trim(option_label))) from unnest(p_options) as options(option_label)
  ) <> array_length(p_options, 1) then
    raise exception 'Poll options must be distinct and contain 1 to 120 characters';
  end if;
  if p_closes_at is null or p_closes_at <= now() then
    raise exception 'Poll close time must be in the future';
  end if;
  if cardinality(v_resource_ids) > 5
     or cardinality(v_resource_ids) <> (
       select count(distinct resource_id) from unnest(v_resource_ids) as resources(resource_id)
     ) then
    raise exception 'A poll may reference at most five distinct resources';
  end if;
  if exists (
    select 1 from unnest(v_resource_ids) as resources(resource_id)
    where not exists (
      select 1 from public.commons_resources r
      where r.id = resource_id and r.status = 'published'
    )
  ) then
    raise exception 'A referenced resource is unavailable';
  end if;
  perform public.consume_commons_rate_limit('poll', 2);
  insert into public.commons_posts (title, body, post_kind, author_id, status)
  values (trim(p_question), trim(p_context), 'poll', v_user_id, 'pending')
  returning id into v_post_id;
  insert into public.commons_polls (post_id, closes_at)
  values (v_post_id, p_closes_at)
  returning id into v_poll_id;
  foreach v_option in array p_options loop
    v_position := v_position + 1;
    insert into public.commons_poll_options (poll_id, label, position)
    values (v_poll_id, trim(v_option), v_position);
  end loop;
  insert into public.commons_post_resources (post_id, resource_id)
  select v_post_id, resource_id from unnest(v_resource_ids) as resources(resource_id);
  return v_post_id;
end;
$$;

create function public.submit_commons_comment(p_post_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_comment_id uuid;
begin
  if v_user_id is null or not public.is_commons_contributor() then
    raise exception 'Approved Commons contributor access required';
  end if;
  if not public.commons_contributor_requests_open() then
    raise exception 'Commons contributions are read-only because human moderation is not staffed';
  end if;
  if p_body is null or length(trim(p_body)) not between 1 and 3000 then
    raise exception 'Comment is outside the allowed length';
  end if;
  if not exists (
    select 1 from public.commons_posts p
    where p.id = p_post_id and p.status = 'published'
  ) then
    raise exception 'Published Commons post not found';
  end if;
  perform public.consume_commons_rate_limit('comment', 20);
  insert into public.commons_comments (post_id, author_id, body, status)
  values (p_post_id, v_user_id, trim(p_body), 'pending')
  returning id into v_comment_id;
  return v_comment_id;
end;
$$;

create function public.cast_commons_vote(p_poll_id uuid, p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_closes_at timestamptz;
begin
  if v_user_id is null or not public.is_commons_contributor() then
    raise exception 'Approved Commons contributor access required';
  end if;
  select poll.closes_at into v_closes_at
    from public.commons_polls poll
    join public.commons_posts post on post.id = poll.post_id
   where poll.id = p_poll_id
     and poll.status = 'open'
     and post.status = 'published'
   for update of poll;
  if not found or (v_closes_at is not null and v_closes_at <= now()) then
    raise exception 'This advisory poll is closed or unavailable';
  end if;
  if not exists (
    select 1 from public.commons_poll_options option_row
    where option_row.poll_id = p_poll_id and option_row.id = p_option_id
  ) then
    raise exception 'Choose an option in this poll';
  end if;
  perform public.consume_commons_rate_limit('vote', 30);
  insert into public.commons_poll_votes (poll_id, option_id, user_id)
  values (p_poll_id, p_option_id, v_user_id);
exception
  when unique_violation then
    raise exception 'A vote has already been recorded for this account';
end;
$$;

create function public.report_commons_content(
  p_target_kind text,
  p_target_id uuid,
  p_reason public.commons_report_reason
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_report_id uuid;
  v_target_exists boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentication required to report content';
  end if;
  if p_reason is null then raise exception 'Choose a reason for the report'; end if;
  if p_target_kind = 'resource' then
    select exists(select 1 from public.commons_resources where id = p_target_id and status = 'published') into v_target_exists;
  elsif p_target_kind = 'post' then
    select exists(select 1 from public.commons_posts where id = p_target_id and status = 'published') into v_target_exists;
  elsif p_target_kind = 'comment' then
    select exists(
      select 1
      from public.commons_comments comment
      join public.commons_posts post on post.id = comment.post_id
      where comment.id = p_target_id
        and comment.status = 'published'
        and post.status = 'published'
    ) into v_target_exists;
  else
    raise exception 'Unknown Commons report target';
  end if;
  if not v_target_exists then
    raise exception 'Published Commons content not found';
  end if;
  perform public.consume_commons_rate_limit('report', 10);
  insert into public.commons_reports (target_kind, target_id, reporter_id, reason)
  values (p_target_kind, p_target_id, v_user_id, p_reason)
  returning id into v_report_id;
  return v_report_id;
end;
$$;

create function public.review_commons_access_request(
  p_request_id uuid,
  p_approve boolean,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_moderator uuid := auth.uid();
  v_request public.commons_access_requests%rowtype;
begin
  if v_moderator is null or not public.is_commons_moderator() then
    raise exception 'Commons moderator access required';
  end if;
  if p_approve is null then raise exception 'Choose whether to approve or decline the request'; end if;
  if length(coalesce(p_note, '')) > 500 then
    raise exception 'Moderation note is too long';
  end if;
  select * into v_request from public.commons_access_requests
   where id = p_request_id and status = 'pending' for update;
  if not found then
    raise exception 'Pending Commons access request not found';
  end if;
  update public.commons_access_requests
     set status = case when p_approve then 'approved' else 'declined' end,
         reviewed_by = v_moderator,
         reviewed_at = now()
   where id = p_request_id;
  if p_approve then
    insert into public.commons_contributors (user_id, approved_by, approved_at, is_active)
    values (v_request.user_id, v_moderator, now(), true)
    on conflict (user_id) do update
      set is_active = true, approved_by = excluded.approved_by, approved_at = excluded.approved_at;
  end if;
  insert into public.commons_moderation_events (moderator_id, target_kind, target_id, action, note)
  values (
    v_moderator,
    'access_request',
    p_request_id,
    case when p_approve then 'approve_contributor' else 'decline_contributor' end,
    coalesce(p_note, '')
  );
end;
$$;

create function public.set_commons_contributor_active(
  p_user_id uuid,
  p_is_active boolean,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_moderator uuid := auth.uid();
begin
  if v_moderator is null or not public.is_commons_moderator() then
    raise exception 'Commons moderator access required';
  end if;
  if p_user_id is null or p_is_active is null or length(coalesce(p_note, '')) > 500 then
    raise exception 'Contributor status change is invalid';
  end if;
  update public.commons_contributors
     set is_active = p_is_active
   where user_id = p_user_id;
  if not found then raise exception 'Commons contributor not found'; end if;
  insert into public.commons_moderation_events (moderator_id, target_kind, target_id, action, note)
  values (
    v_moderator,
    'contributor',
    p_user_id,
    case when p_is_active then 'restore_contributor' else 'revoke_contributor' end,
    coalesce(p_note, '')
  );
end;
$$;

create function public.review_commons_resource(
  p_resource_id uuid,
  p_decision text,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_moderator uuid := auth.uid();
  v_status public.commons_review_status;
begin
  if v_moderator is null or not public.is_commons_moderator() then
    raise exception 'Commons moderator access required';
  end if;
  if p_decision is null or p_decision not in ('publish', 'hide', 'reject') or length(coalesce(p_note, '')) > 500 then
    raise exception 'Invalid resource moderation decision';
  end if;
  v_status := case p_decision
    when 'publish' then 'published'::public.commons_review_status
    when 'hide' then 'hidden'::public.commons_review_status
    else 'rejected'::public.commons_review_status
  end;
  update public.commons_resources
     set status = v_status,
         published_at = case when v_status = 'published' then coalesce(published_at, now()) else published_at end,
         moderated_by = v_moderator,
         moderated_at = now()
   where id = p_resource_id;
  if not found then raise exception 'Commons resource not found'; end if;
  insert into public.commons_moderation_events (moderator_id, target_kind, target_id, action, note)
  values (v_moderator, 'resource', p_resource_id, p_decision, coalesce(p_note, ''));
end;
$$;

create function public.review_commons_post(
  p_post_id uuid,
  p_decision text,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_moderator uuid := auth.uid();
  v_status public.commons_review_status;
begin
  if v_moderator is null or not public.is_commons_moderator() then
    raise exception 'Commons moderator access required';
  end if;
  if p_decision is null or p_decision not in ('publish', 'hide', 'reject') or length(coalesce(p_note, '')) > 500 then
    raise exception 'Invalid post moderation decision';
  end if;
  v_status := case p_decision
    when 'publish' then 'published'::public.commons_review_status
    when 'hide' then 'hidden'::public.commons_review_status
    else 'rejected'::public.commons_review_status
  end;
  update public.commons_posts
     set status = v_status,
         published_at = case when v_status = 'published' then coalesce(published_at, now()) else published_at end,
         moderated_by = v_moderator,
         moderated_at = now()
   where id = p_post_id;
  if not found then raise exception 'Commons post not found'; end if;
  insert into public.commons_moderation_events (moderator_id, target_kind, target_id, action, note)
  values (v_moderator, 'post', p_post_id, p_decision, coalesce(p_note, ''));
end;
$$;

create function public.review_commons_comment(
  p_comment_id uuid,
  p_decision text,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_moderator uuid := auth.uid();
  v_status public.commons_review_status;
begin
  if v_moderator is null or not public.is_commons_moderator() then
    raise exception 'Commons moderator access required';
  end if;
  if p_decision is null or p_decision not in ('publish', 'hide', 'reject')
     or length(coalesce(p_note, '')) > 500 then
    raise exception 'Invalid comment moderation decision';
  end if;
  v_status := case p_decision
    when 'publish' then 'published'::public.commons_review_status
    when 'hide' then 'hidden'::public.commons_review_status
    else 'rejected'::public.commons_review_status
  end;
  update public.commons_comments
     set status = v_status,
         published_at = case when v_status = 'published' then coalesce(published_at, now()) else published_at end,
         moderated_by = v_moderator,
         moderated_at = now()
   where id = p_comment_id;
  if not found then raise exception 'Commons comment not found'; end if;
  insert into public.commons_moderation_events (moderator_id, target_kind, target_id, action, note)
  values (v_moderator, 'comment', p_comment_id, p_decision, coalesce(p_note, ''));
end;
$$;

create function public.review_commons_report(
  p_report_id uuid,
  p_dismiss boolean,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_moderator uuid := auth.uid();
begin
  if v_moderator is null or not public.is_commons_moderator() then
    raise exception 'Commons moderator access required';
  end if;
  if p_dismiss is null then raise exception 'Choose whether to resolve or dismiss the report'; end if;
  if length(coalesce(p_note, '')) > 500 then
    raise exception 'Moderation note is too long';
  end if;
  update public.commons_reports
     set status = case when p_dismiss then 'dismissed' else 'resolved' end,
         reviewed_by = v_moderator,
         reviewed_at = now()
   where id = p_report_id and status = 'pending';
  if not found then raise exception 'Pending Commons report not found'; end if;
  insert into public.commons_moderation_events (moderator_id, target_kind, target_id, action, note)
  values (
    v_moderator,
    'report',
    p_report_id,
    case when p_dismiss then 'dismiss_report' else 'resolve_report' end,
    coalesce(p_note, '')
  );
end;
$$;

alter table public.workspace_preferences enable row level security;
alter table public.commons_moderators enable row level security;
alter table public.commons_contributors enable row level security;
alter table public.commons_access_requests enable row level security;
alter table public.commons_profiles enable row level security;
alter table public.commons_resources enable row level security;
alter table public.commons_posts enable row level security;
alter table public.commons_post_resources enable row level security;
alter table public.commons_comments enable row level security;
alter table public.commons_polls enable row level security;
alter table public.commons_poll_options enable row level security;
alter table public.commons_poll_votes enable row level security;
alter table public.commons_reports enable row level security;
alter table public.commons_moderation_events enable row level security;
alter table public.commons_rate_windows enable row level security;

create policy "Users read their own workspace preference"
  on public.workspace_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users create their own workspace preference"
  on public.workspace_preferences for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their own workspace preference"
  on public.workspace_preferences for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their own contributor entitlement"
  on public.commons_contributors for select to authenticated
  using (user_id = (select auth.uid()) or public.is_commons_moderator());
create policy "Moderators read access requests"
  on public.commons_access_requests for select to authenticated
  using (user_id = (select auth.uid()) or public.is_commons_moderator());

create policy "Users read their own profile or consented aliases"
  on public.commons_profiles for select
  using (
    user_id = (select auth.uid())
    or public_name_consent
    or public.is_commons_moderator()
  );
create policy "Users create their own Commons profile"
  on public.commons_profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their own Commons profile"
  on public.commons_profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Public reads published Commons resources"
  on public.commons_resources for select
  using (status = 'published' or submitted_by = (select auth.uid()) or public.is_commons_moderator());
create policy "Public reads published Commons posts"
  on public.commons_posts for select
  using (status = 'published' or author_id = (select auth.uid()) or public.is_commons_moderator());
create policy "Public reads visible post resource links"
  on public.commons_post_resources for select
  using (public.can_read_commons_post(post_id));

create policy "Public reads published Commons comments"
  on public.commons_comments for select
  using (
    status = 'published'
    or author_id = (select auth.uid())
    or public.is_commons_moderator()
  );
create policy "Public reads polls for published posts"
  on public.commons_polls for select
  using (public.can_read_commons_post(post_id));
create policy "Public reads options for published polls"
  on public.commons_poll_options for select
  using (public.can_read_commons_poll(poll_id));

create policy "Users read their reports or moderators read all"
  on public.commons_reports for select to authenticated
  using (reporter_id = (select auth.uid()) or public.is_commons_moderator());
create policy "Moderators read moderation events"
  on public.commons_moderation_events for select to authenticated
  using (public.is_commons_moderator());

revoke all on public.commons_moderators, public.commons_rate_windows from anon, authenticated;
revoke all on public.commons_contributors, public.commons_access_requests,
  public.commons_profiles, public.commons_resources, public.commons_posts,
  public.commons_post_resources, public.commons_comments, public.commons_polls,
  public.commons_poll_options, public.commons_poll_votes, public.commons_reports,
  public.commons_moderation_events, public.workspace_preferences
  from anon, authenticated;

grant select (user_id, is_active, approved_at) on public.commons_contributors to authenticated;
grant select (id, user_id, status, created_at, reviewed_by, reviewed_at)
  on public.commons_access_requests to authenticated;
grant select on public.commons_profiles to authenticated;
grant insert (user_id, display_name, public_name_consent, updated_at) on public.commons_profiles to authenticated;
grant update (display_name, public_name_consent, updated_at) on public.commons_profiles to authenticated;
grant select (id, title, summary, resource_kind, source_url, attribution, license_name, license_url, revision, tender_id, status, created_at, published_at)
  on public.commons_resources to authenticated;
grant select (id, title, body, post_kind, status, created_at, published_at)
  on public.commons_posts to authenticated;
grant select (post_id, resource_id) on public.commons_post_resources to authenticated;
grant select (id, post_id, body, status, created_at, published_at)
  on public.commons_comments to authenticated;
grant select (id, post_id, status, closes_at, created_at) on public.commons_polls to authenticated;
grant select (id, poll_id, label, position) on public.commons_poll_options to authenticated;
grant select on public.commons_reports, public.commons_moderation_events to authenticated;
grant select on public.workspace_preferences to authenticated;
grant insert (user_id, default_workspace, updated_at) on public.workspace_preferences to authenticated;
grant update (default_workspace, updated_at) on public.workspace_preferences to authenticated;

create view public.public_commons_posts
with (security_invoker = false, security_barrier = true)
as
select
  post.id,
  post.title,
  post.body,
  post.post_kind,
  post.created_at,
  post.published_at,
  case
    when profile.public_name_consent then profile.display_name
    else 'Commons member'
  end as author_name
from public.commons_posts post
left join public.commons_profiles profile on profile.user_id = post.author_id
where post.status = 'published';

create view public.public_commons_comments
with (security_invoker = false, security_barrier = true)
as
select
  comment.id,
  comment.post_id,
  comment.body,
  comment.created_at,
  case
    when profile.public_name_consent then profile.display_name
    else 'Commons member'
  end as author_name
from public.commons_comments comment
left join public.commons_profiles profile on profile.user_id = comment.author_id
where comment.status = 'published'
  and exists (
    select 1 from public.commons_posts post
    where post.id = comment.post_id and post.status = 'published'
  );

create view public.public_commons_resources
with (security_invoker = false, security_barrier = true)
as
select
  id,
  title,
  summary,
  resource_kind,
  source_url,
  attribution,
  license_name,
  license_url,
  revision,
  tender_id,
  published_at
from public.commons_resources
where status = 'published';

create view public.public_commons_post_resources
with (security_invoker = false, security_barrier = true)
as
select link.post_id, link.resource_id
from public.commons_post_resources link
join public.commons_posts post on post.id = link.post_id and post.status = 'published'
join public.commons_resources resource on resource.id = link.resource_id and resource.status = 'published';

create view public.public_commons_polls
with (security_invoker = false, security_barrier = true)
as
select
  poll.id,
  poll.post_id,
  case
    when poll.status = 'open' and poll.closes_at <= now() then 'closed'
    else poll.status
  end as status,
  poll.closes_at
from public.commons_polls poll
join public.commons_posts post on post.id = poll.post_id
where post.status = 'published';

create view public.public_commons_poll_options
with (security_invoker = false, security_barrier = true)
as
select option_row.id, option_row.poll_id, option_row.label, option_row.position
from public.commons_poll_options option_row
join public.commons_polls poll on poll.id = option_row.poll_id
join public.commons_posts post on post.id = poll.post_id
where post.status = 'published';

create view public.public_commons_poll_results
with (security_invoker = false, security_barrier = true)
as
select
  option_row.poll_id,
  option_row.id as option_id,
  count(vote.user_id)::bigint as vote_count
from public.commons_poll_options option_row
join public.commons_polls poll on poll.id = option_row.poll_id
join public.commons_posts post on post.id = poll.post_id and post.status = 'published'
left join public.commons_poll_votes vote
  on vote.poll_id = option_row.poll_id and vote.option_id = option_row.id
group by option_row.poll_id, option_row.id;

create view public.moderator_commons_access_requests
with (security_invoker = false, security_barrier = true)
as
select request.id, request.user_id, account.email, request.created_at
from public.commons_access_requests request
join auth.users account on account.id = request.user_id
where request.status = 'pending'
  and public.is_commons_moderator();

revoke all on public.public_commons_posts, public.public_commons_comments,
  public.public_commons_resources, public.public_commons_post_resources,
  public.public_commons_polls, public.public_commons_poll_options,
  public.public_commons_poll_results, public.moderator_commons_access_requests
  from public, anon, authenticated;
grant select on public.public_commons_posts, public.public_commons_comments,
  public.public_commons_resources, public.public_commons_post_resources,
  public.public_commons_polls, public.public_commons_poll_options,
  public.public_commons_poll_results
  to anon, authenticated;
grant select on public.moderator_commons_access_requests to authenticated;

revoke all on function public.is_commons_moderator() from public, anon;
revoke all on function public.is_commons_contributor() from public, anon;
revoke all on function public.commons_contributor_requests_open() from public, anon;
revoke all on function public.can_read_commons_post(uuid) from public, anon;
revoke all on function public.can_read_commons_poll(uuid) from public, anon;
revoke all on function public.consume_commons_rate_limit(text, integer) from public, anon, authenticated;
revoke all on function public.request_commons_access() from public, anon;
revoke all on function public.submit_commons_resource(text, text, public.commons_resource_kind, text, text, text, text, text, uuid) from public, anon;
revoke all on function public.submit_commons_post(text, text, uuid[]) from public, anon;
revoke all on function public.submit_commons_poll(text, text, text[], timestamptz, uuid[]) from public, anon;
revoke all on function public.submit_commons_comment(uuid, text) from public, anon;
revoke all on function public.cast_commons_vote(uuid, uuid) from public, anon;
revoke all on function public.report_commons_content(text, uuid, public.commons_report_reason) from public, anon;
revoke all on function public.review_commons_access_request(uuid, boolean, text) from public, anon;
revoke all on function public.set_commons_contributor_active(uuid, boolean, text) from public, anon;
revoke all on function public.review_commons_resource(uuid, text, text) from public, anon;
revoke all on function public.review_commons_post(uuid, text, text) from public, anon;
revoke all on function public.review_commons_comment(uuid, text, text) from public, anon;
revoke all on function public.review_commons_report(uuid, boolean, text) from public, anon;

grant execute on function public.is_commons_moderator() to anon, authenticated;
grant execute on function public.is_commons_contributor() to authenticated;
grant execute on function public.commons_contributor_requests_open() to authenticated;
grant execute on function public.can_read_commons_post(uuid) to authenticated;
grant execute on function public.can_read_commons_poll(uuid) to authenticated;
grant execute on function public.request_commons_access() to authenticated;
grant execute on function public.submit_commons_resource(text, text, public.commons_resource_kind, text, text, text, text, text, uuid) to authenticated;
grant execute on function public.submit_commons_post(text, text, uuid[]) to authenticated;
grant execute on function public.submit_commons_poll(text, text, text[], timestamptz, uuid[]) to authenticated;
grant execute on function public.submit_commons_comment(uuid, text) to authenticated;
grant execute on function public.cast_commons_vote(uuid, uuid) to authenticated;
grant execute on function public.report_commons_content(text, uuid, public.commons_report_reason) to authenticated;
grant execute on function public.review_commons_access_request(uuid, boolean, text) to authenticated;
grant execute on function public.set_commons_contributor_active(uuid, boolean, text) to authenticated;
grant execute on function public.review_commons_resource(uuid, text, text) to authenticated;
grant execute on function public.review_commons_post(uuid, text, text) to authenticated;
grant execute on function public.review_commons_comment(uuid, text, text) to authenticated;
grant execute on function public.review_commons_report(uuid, boolean, text) to authenticated;
