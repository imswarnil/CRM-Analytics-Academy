-- CRM Analytics Academy — the whole database, in one idempotent file.
--
--   psql "$DATABASE_URL" -f server/db/schema.sql
--
-- Safe to re-run: everything is `if not exists` / `or replace`. Users and
-- sessions live in Neon Auth's own schema (neon_auth."user"), which this file
-- never touches; everything the site owns is in schema `app`, keyed by the
-- Neon Auth user id as text (no foreign key into neon_auth: Neon manages it).
--
-- Design rules: one fact in one place (counts and points are views, never
-- stored twice); a primary key on every table that has a natural one; an
-- index only where a query in server/ needs it and no primary key covers it;
-- short-lived rows (rate_hit, used_challenge) are pruned by the code that
-- writes them. Retired objects are dropped by dated cleanup-*.sql files.
--
--   learner   progress · quiz_attempt · bookmark · exam_attempt   (+ view user_points)
--   access    entitlement (All Access) · youtube_link (subscribers) · stripe_event
--   community comment · submission · interview_question · interview_upvote
--   business  lead · event (milestones)
--   security  rate_hit · used_challenge · demo_account

create schema if not exists app;

-- Lessons a learner has marked complete. lesson_path is locale-stripped
-- (/saql/functions), so progress follows a learner across languages.
create table if not exists app.progress (
  user_id      text        not null,
  lesson_path  text        not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_path)
);
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

-- Community submissions: resources, lesson ideas, Wall of Fame nominations
-- (and historic showcase dashboards).
create table if not exists app.submission (
  id           bigint generated always as identity primary key,
  user_id      text        not null,
  kind         text        not null,
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
-- Kinds, kept as a named constraint so it can widen without a new table.
alter table app.submission drop constraint if exists submission_kind_check;
alter table app.submission add constraint submission_kind_check
  check (kind in ('resource', 'showcase', 'lesson-idea', 'nomination'));
create index if not exists submission_status_idx on app.submission (status, created_at desc);
create index if not exists submission_user_idx   on app.submission (user_id, created_at desc);
create unique index if not exists submission_user_url_uniq
  on app.submission (user_id, url)
  where url is not null and status <> 'rejected';

-- The shared demo account (signs in from /sign-in without a password).
create table if not exists app.demo_account (
  user_id text primary key
);

-- Milestones only (server/api/collect.post.ts): sign_up, sign_in,
-- lesson_complete, exam_finish, youtube_verified, checkout. No page views.
create table if not exists app.event (
  id         bigint generated always as identity primary key,
  visitor    text        not null,
  user_id    text,
  name       text        not null check (name ~ '^[a-z_]{2,40}$'),
  path       text        not null,
  label      text,
  created_at timestamptz not null default now()
);
create index if not exists event_time_idx on app.event (created_at desc, name);
-- "Is this the account's first sign_up?" (collect.post.ts)
create index if not exists event_user_name_idx on app.event (user_id, name) where user_id is not null;

-- Community interview questions awaiting review. The published bank is
-- content/en/interview-questions/*.md; approved rows here are written there
-- by scripts/pull-interview.mjs (source 'academy' rows are the old seed)
-- and community submissions (source 'community', pending until approved in
-- /admin). The answer is markdown.
create table if not exists app.interview_question (
  id          bigint generated always as identity primary key,
  slug        text        not null unique check (slug ~ '^[a-z0-9-]{3,100}$'),
  question    text        not null check (length(btrim(question)) between 10 and 300),
  answer_md   text        not null check (length(btrim(answer_md)) between 30 and 12000),
  type        text        not null default 'conceptual'
                check (type in ('conceptual', 'technical', 'scenario', 'behavioral', 'saql')),
  topic       text        not null default 'foundations',
  level       text        not null default 'mid' check (level in ('junior', 'mid', 'senior')),
  company     text        check (company is null or length(btrim(company)) between 2 and 80),
  role        text        check (role is null or length(btrim(role)) between 2 and 80),
  source      text        not null default 'community' check (source in ('academy', 'community')),
  status      text        not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  user_id     text,
  review_note text,
  upvotes     integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists interview_status_idx on app.interview_question (status, created_at desc);
create index if not exists interview_topic_idx on app.interview_question (topic, type);

-- Upvotes on interview questions, keyed by the question's slug (questions
-- live in content files; community ones also have a row above).
drop table if exists app.interview_vote;
create table if not exists app.interview_upvote (
  user_id    text not null,
  slug       text not null check (slug ~ '^[a-z0-9-]{3,100}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);
create index if not exists interview_upvote_slug_idx on app.interview_upvote (slug);

-- Certification practice: one row per finished practice paper.
create table if not exists app.exam_attempt (
  id          bigint generated always as identity primary key,
  user_id     text        not null,
  paper       text        not null,
  score       smallint    not null check (score >= 0),
  total       smallint    not null check (total > 0),
  seconds     integer     not null check (seconds >= 0),
  domains     jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists exam_attempt_user_idx on app.exam_attempt (user_id, paper, created_at desc);

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

-- Rate limiting for public write endpoints (server/utils/guard.ts). The key is
-- a SHA-256 of action + client address, so no address is stored.
create table if not exists app.rate_hit (
  key text not null,
  at  timestamptz not null default now()
);
create index if not exists rate_hit_key_at_idx on app.rate_hit (key, at);

-- All Access. Written by the Stripe webhook (product 'all-access', one
-- payment, no end date) or by an admin grant in /admin → Users (any product,
-- optional `expires_at`). Read only through accessFor() in entitlement.ts.
create table if not exists app.entitlement (
  user_id    text primary key,
  pro        boolean not null default true,
  product    text not null default 'pro',
  note       text,
  expires_at timestamptz,
  granted_at timestamptz not null default now()
);

-- "Talk to us" requests from /pro. Also sent to Salesforce as a Lead
-- (server/utils/salesforce.ts); `sf_status` records how that went.
create table if not exists app.lead (
  id          bigint generated always as identity primary key,
  product     text not null,
  first_name  text,
  last_name   text not null,
  email       text not null,
  company     text,
  title       text,
  country     text,
  phone       text,
  team_size   text,
  message     text,
  user_id     text,
  locale      text,
  source      text,
  landing     text,
  lessons_done integer not null default 0,
  points      integer not null default 0,
  seats       integer,
  org_kind    text,
  interest    text,
  status      text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  sf_status   text not null default 'pending',
  created_at  timestamptz not null default now()
);
create index if not exists lead_created_idx on app.lead (created_at desc);

-- Spent proof-of-work challenges (server/utils/pow.ts): each solves once.
create table if not exists app.used_challenge (
  challenge text primary key,
  at        timestamptz not null default now()
);

-- Stripe webhook events already handled (Stripe retries; handle each once).
create table if not exists app.stripe_event (
  id         text primary key,
  type       text not null,
  created_at timestamptz not null default now()
);

-- YouTube subscribers (2026-11-16). A learner verifies, with Google, that they
-- subscribe to the channel; `access: youtube` lessons open while verified_at
-- is within YOUTUBE_RECHECK_DAYS. One Google account unlocks one Academy
-- account (google_sub is unique), so a subscription cannot be shared. No
-- Google token is stored: it is used once and revoked.
create table if not exists app.youtube_link (
  user_id      text primary key,
  google_sub   text not null unique,
  google_email text,
  subscribed   boolean not null default false,
  verified_at  timestamptz not null default now()
);
