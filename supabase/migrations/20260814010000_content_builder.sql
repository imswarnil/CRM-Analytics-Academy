-- Admin content builder: sections + lessons
-- -----------------------------------------
-- The original curriculum ships as markdown under content/ and is compiled by
-- Nuxt Content at BUILD time. That is great for version-controlled lessons but
-- it cannot be edited from a running site (Vercel's filesystem is read-only).
--
-- These tables are the runtime-editable half: an admin can create sections,
-- add lessons, reorder them, and publish — all from /admin, with no redeploy
-- and no trip to the Supabase dashboard. They render at /learn/<section>/<lesson>.
--
-- Ordering uses an integer `position`; the reorder endpoint rewrites the whole
-- list in one transaction so positions stay dense and unambiguous. Idempotent.

create table if not exists public.sections (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  icon         text not null default 'i-lucide-book-open',
  position     int  not null default 0,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.lessons (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid not null references public.sections (id) on delete cascade,
  slug         text not null,
  title        text not null,
  description  text,
  -- Markdown body, rendered client-side through the same prose components.
  body         text,
  position     int  not null default 0,
  status       text not null default 'draft' check (status in ('draft', 'published')),

  -- 'members' soft-gates the lesson, matching the markdown `access` frontmatter.
  access       text not null default 'public' check (access in ('public', 'members')),

  -- Optional YouTube clip. start/end are offsets in seconds; both optional so a
  -- lesson can embed a whole video or a precise segment of one.
  video_id     text,
  video_start  int,
  video_end    int,

  -- Same shape as the markdown `quiz` frontmatter: [{ q, options, answer, skill }].
  -- Answers live server-side only; the public lesson API strips them.
  quiz         jsonb,
  pass_score   int not null default 85,

  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (section_id, slug)
);

alter table public.lessons drop constraint if exists lessons_video_range;
alter table public.lessons add constraint lessons_video_range
  check (video_start is null or video_end is null or video_end > video_start);

create index if not exists sections_position_idx on public.sections (position);
create index if not exists lessons_section_position_idx
  on public.lessons (section_id, position);

drop trigger if exists sections_touch_updated_at on public.sections;
create trigger sections_touch_updated_at
  before update on public.sections
  for each row execute function public.touch_updated_at();

drop trigger if exists lessons_touch_updated_at on public.lessons;
create trigger lessons_touch_updated_at
  before update on public.lessons
  for each row execute function public.touch_updated_at();

alter table public.sections enable row level security;
alter table public.lessons  enable row level security;

drop policy if exists "Published sections are public" on public.sections;
create policy "Published sections are public"
  on public.sections for select
  using (status = 'published' or public.is_admin());

drop policy if exists "Admins write sections" on public.sections;
create policy "Admins write sections"
  on public.sections for all
  using (public.is_admin())
  with check (public.is_admin());

-- A lesson is only visible when BOTH it and its parent section are published.
drop policy if exists "Published lessons are public" on public.lessons;
create policy "Published lessons are public"
  on public.lessons for select
  using (
    public.is_admin()
    or (
      status = 'published'
      and exists (
        select 1 from public.sections s
        where s.id = lessons.section_id and s.status = 'published'
      )
    )
  );

drop policy if exists "Admins write lessons" on public.lessons;
create policy "Admins write lessons"
  on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.sections, public.lessons to anon, authenticated;
grant insert, update, delete on public.sections, public.lessons to authenticated;
