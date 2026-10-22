-- CRM Analytics Academy — the whole database, in one idempotent file.
--
--   psql "$DATABASE_URL" -f server/db/schema.sql
--
-- Safe to re-run: everything is `if not exists` / `or replace`. Users and
-- sessions live in Neon Auth's own schema (neon_auth."user"), which this file
-- never touches; everything the site owns is in schema `app`, keyed by the
-- Neon Auth user id as text.

create schema if not exists app;

-- Lessons a learner has marked complete. lesson_path is locale-stripped
-- (/saql/functions), so progress follows a learner across languages.
create table if not exists app.progress (
  user_id      text        not null,
  lesson_path  text        not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_path)
);
create index if not exists progress_user_idx on app.progress (user_id);
create index if not exists progress_time_idx on app.progress (completed_at desc);

-- Every graded quiz attempt; the best score per lesson counts.
create table if not exists app.quiz_attempt (
  id          bigint generated always as identity primary key,
  user_id     text        not null,
  lesson_path text        not null,
  score       smallint    not null check (score >= 0),
  total       smallint    not null check (total > 0),
  created_at  timestamptz not null default now(),
  constraint quiz_score_within_total check (score <= total)
);
create index if not exists quiz_attempt_user_idx on app.quiz_attempt (user_id, lesson_path);

-- Lessons a learner saved for later (the dashboard's reading list).
create table if not exists app.bookmark (
  user_id     text        not null,
  lesson_path text        not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, lesson_path)
);

-- Lesson comments, one level of replies.
create table if not exists app.comment (
  id          bigint generated always as identity primary key,
  lesson_path text        not null check (lesson_path ~ '^/[a-z0-9/-]*$'),
  user_id     text        not null,
  parent_id   bigint      references app.comment(id) on delete cascade,
  body        text        not null check (length(btrim(body)) between 2 and 2000),
  status      text        not null default 'visible' check (status in ('visible', 'hidden')),
  hidden_by   text,
  hidden_at   timestamptz,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz
);
create index if not exists comment_lesson_idx on app.comment (lesson_path, created_at);
create index if not exists comment_user_idx   on app.comment (user_id, created_at desc);
create index if not exists comment_status_idx on app.comment (status, created_at desc);

-- Community submissions: resources, showcase dashboards, lesson ideas.
create table if not exists app.submission (
  id           bigint generated always as identity primary key,
  user_id      text        not null,
  kind         text        not null check (kind in ('resource', 'showcase', 'lesson-idea')),
  title        text        not null check (length(btrim(title)) between 3 and 160),
  url          text        check (url is null or url ~* '^https?://'),
  description  text        not null check (length(btrim(description)) between 20 and 2000),
  tags         text[]      not null default '{}',
  image_url    text        check (image_url is null or image_url ~* '^https?://'),
  details      jsonb       not null default '{}'::jsonb,
  status       text        not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  review_note  text,
  reviewed_by  text,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists submission_status_idx on app.submission (status, created_at desc);
create index if not exists submission_user_idx   on app.submission (user_id, created_at desc);
create unique index if not exists submission_user_url_uniq
  on app.submission (user_id, url)
  where url is not null and status <> 'rejected';

-- The shared demo account (signs in from /sign-in without a password).
create table if not exists app.demo_account (
  user_id text primary key
);

-- First-party analytics (see server/api/collect.post.ts). No cookies and no
-- IP addresses: `visitor` is a random id kept in the browser's localStorage,
-- `session` one kept in sessionStorage. Country comes from Cloudflare.
create table if not exists app.page_view (
  id         bigint generated always as identity primary key,
  visitor    text        not null,
  session    text        not null,
  user_id    text,
  path       text        not null,
  locale     text        not null default 'en',
  referrer   text,
  country    text,
  device     text        not null default 'desktop' check (device in ('desktop', 'mobile', 'tablet')),
  browser    text,
  os         text,
  duration_ms integer    not null default 0 check (duration_ms >= 0),
  created_at timestamptz not null default now()
);
create index if not exists page_view_time_idx on app.page_view (created_at desc);
create index if not exists page_view_path_idx on app.page_view (path, created_at desc);

-- Clicks and milestones: sign_in_click, sign_up_click, sign_up, sign_in,
-- lesson_complete, quiz_submit, search_open, outbound.
create table if not exists app.event (
  id         bigint generated always as identity primary key,
  visitor    text        not null,
  session    text        not null,
  user_id    text,
  name       text        not null check (name ~ '^[a-z_]{2,40}$'),
  path       text        not null,
  label      text,
  created_at timestamptz not null default now()
);
create index if not exists event_time_idx on app.event (created_at desc, name);

-- Points and rank for the dashboard: 10 per lesson, 2 per best quiz point,
-- 25 per approved submission (50 for a showcase dashboard).
create or replace view app.user_points as
with lesson_points as (
  select user_id, count(*) * 10 as pts, count(*)::int as lessons_done
  from app.progress
  group by user_id
),
quiz_points as (
  select user_id, sum(best) * 2 as pts
  from (
    select user_id, lesson_path, max(score) as best
    from app.quiz_attempt
    group by user_id, lesson_path
  ) b
  group by user_id
),
contrib_points as (
  select user_id,
         sum(case kind when 'showcase' then 50 else 25 end) as pts,
         count(*)::int as contributions
  from app.submission
  where status = 'approved'
  group by user_id
)
select
  u.id::text                                  as user_id,
  u.name,
  u.image,
  coalesce(l.lessons_done, 0)                 as lessons_done,
  coalesce(c.contributions, 0)                as contributions,
  coalesce(l.pts, 0) + coalesce(q.pts, 0) + coalesce(c.pts, 0) as points
from neon_auth."user" u
left join lesson_points  l on l.user_id = u.id::text
left join quiz_points    q on q.user_id = u.id::text
left join contrib_points c on c.user_id = u.id::text;
