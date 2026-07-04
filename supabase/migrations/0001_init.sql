-- CRM Analytics Academy — core schema (profiles, progress, quizzes, resources,
-- projects, comments) with Row-Level Security.
--
-- HOW TO APPLY: paste this whole file into the Supabase dashboard →
-- SQL Editor → New query → Run. It is idempotent: safe to run again after edits.
--
-- AFTER APPLYING, make yourself admin (once you've signed in once):
--   update public.profiles set role = 'admin' where id = (
--     select id from auth.users where email = 'YOUR_EMAIL_HERE');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- True when the current request belongs to an admin. SECURITY DEFINER so it can
-- read profiles regardless of RLS (and avoids recursive policy evaluation).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Generic updated_at bump.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique,
  full_name   text,
  avatar_url  text,
  bio         text,
  role        text not null default 'member' check (role in ('member', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Stop non-admins from escalating their own role via a profile update.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up (Google fills these).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users who signed up before this migration ran
-- (otherwise comments/resources/projects, which FK to profiles, would fail).
insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- lesson_progress  (mark a lesson as done)
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  lesson_path  text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_path)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "Users manage their own progress (select)" on public.lesson_progress;
create policy "Users manage their own progress (select)"
  on public.lesson_progress for select using (auth.uid() = user_id);

drop policy if exists "Users manage their own progress (insert)" on public.lesson_progress;
create policy "Users manage their own progress (insert)"
  on public.lesson_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage their own progress (delete)" on public.lesson_progress;
create policy "Users manage their own progress (delete)"
  on public.lesson_progress for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- quiz_attempts
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  quiz_id    text not null,
  score      integer not null,
  total      integer not null,
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

drop policy if exists "Users read their own quiz attempts" on public.quiz_attempts;
create policy "Users read their own quiz attempts"
  on public.quiz_attempts for select using (auth.uid() = user_id);

drop policy if exists "Users insert their own quiz attempts" on public.quiz_attempts;
create policy "Users insert their own quiz attempts"
  on public.quiz_attempts for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- resources  (community-submitted, admin-moderated)
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete set null,
  title       text not null,
  url         text not null,
  description text,
  category    text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

alter table public.resources enable row level security;

drop policy if exists "Approved resources are public; owners/admin see their own" on public.resources;
create policy "Approved resources are public; owners/admin see their own"
  on public.resources for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin());

drop policy if exists "Users submit resources (pending)" on public.resources;
create policy "Users submit resources (pending)"
  on public.resources for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Owners or admin delete resources" on public.resources;
create policy "Owners or admin delete resources"
  on public.resources for delete
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admin updates resources" on public.resources;
create policy "Admin updates resources"
  on public.resources for update using (public.is_admin());

-- ---------------------------------------------------------------------------
-- projects  (community dashboards/showcase, admin-moderated)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete set null,
  title       text not null,
  description text,
  image_url   text,
  link        text,
  tags        text[],
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "Approved projects are public; owners/admin see their own" on public.projects;
create policy "Approved projects are public; owners/admin see their own"
  on public.projects for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin());

drop policy if exists "Users submit projects (pending)" on public.projects;
create policy "Users submit projects (pending)"
  on public.projects for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Owners or admin delete projects" on public.projects;
create policy "Owners or admin delete projects"
  on public.projects for delete
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admin updates projects" on public.projects;
create policy "Admin updates projects"
  on public.projects for update using (public.is_admin());

-- ---------------------------------------------------------------------------
-- comments  (per docs page, flat with optional threading)
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  page_path  text not null,
  body       text not null check (char_length(body) between 1 and 4000),
  parent_id  uuid references public.comments (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists comments_page_path_idx on public.comments (page_path, created_at);

alter table public.comments enable row level security;

drop policy if exists "Comments are viewable by everyone" on public.comments;
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

drop policy if exists "Authenticated users post comments" on public.comments;
create policy "Authenticated users post comments"
  on public.comments for insert with check (auth.uid() = user_id);

drop policy if exists "Owners edit their comments" on public.comments;
create policy "Owners edit their comments"
  on public.comments for update using (auth.uid() = user_id);

drop policy if exists "Owners or admin delete comments" on public.comments;
create policy "Owners or admin delete comments"
  on public.comments for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Privileges (RLS still governs row access; these grant table-level access)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.profiles, public.resources, public.projects, public.comments to anon;

grant select, insert, update, delete on
  public.profiles, public.lesson_progress, public.quiz_attempts,
  public.resources, public.projects, public.comments
  to authenticated;
