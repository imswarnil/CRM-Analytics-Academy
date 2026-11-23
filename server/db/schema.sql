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
--   access    entitlement (lifetime / grants) · subscription (monthly) · org + org_member (seats) · stripe_event
--   community comment · submission · interview_question · interview_upvote
--   business  lead · event (milestones) · enrichment · company_domain · sf_sync · sf_sync_run
--   security  rate_hit · used_challenge · demo_account

create schema if not exists app;

-- Lessons a learner has marked complete. lesson_path is locale-stripped
-- (/course/saql/functions), so progress follows a learner across languages.
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
-- lesson_complete, exam_finish, checkout. No page views.
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

-- Pro that does not renew: a lifetime purchase (Stripe webhook, product
-- 'lifetime', no end date) or an admin grant in /admin → Users (product
-- 'grant', optional `expires_at`). Read only through accessFor().
create table if not exists app.entitlement (
  user_id    text primary key,
  product    text not null default 'grant' check (product in ('lifetime', 'grant')),
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

-- Pro Monthly: one row per user, mirroring the Stripe subscription (the
-- webhook is the only writer). Pro while status is active, trialing or past_due.
create table if not exists app.subscription (
  user_id              text primary key,
  plan                 text not null default 'monthly' check (plan in ('monthly', 'yearly')),
  stripe_customer      text not null,
  stripe_subscription  text not null unique,
  status               text not null,
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at           timestamptz not null default now()
);

-- Teams & institutions (B2B): an organisation buys N seats through a sales
-- conversation; the owner creates it in /admin. Members join with the join
-- code — and, when `domain` is set (a college), only with a verified email
-- at that domain. One organisation per learner.
create table if not exists app.org (
  id         bigint generated always as identity primary key,
  name       text        not null check (length(btrim(name)) between 2 and 120),
  kind       text        not null default 'company' check (kind in ('company', 'college', 'team')),
  seats      integer     not null check (seats between 1 and 100000),
  join_code  text        not null unique check (join_code ~ '^[A-Z0-9]{8}$'),
  domain     text        check (domain is null or domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  status     text        not null default 'active' check (status in ('active', 'ended')),
  expires_at timestamptz,
  lead_id    bigint,
  created_at timestamptz not null default now()
);

create table if not exists app.org_member (
  org_id    bigint      not null references app.org(id) on delete cascade,
  user_id   text        not null unique,
  role      text        not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Provisioning (2026-11-18). Seats assigned by email ahead of time: whoever
-- signs in with that verified address takes the seat on their next visit
-- (GET /api/org). `auto_join` lets anyone with a verified email at the org's
-- domain claim a seat without a code — for a college's students.
create table if not exists app.org_invite (
  org_id     bigint      not null references app.org(id) on delete cascade,
  email      text        not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now(),
  primary key (org_id, email)
);
create index if not exists org_invite_email_idx on app.org_invite (email);
alter table app.org add column if not exists auto_join boolean not null default false;

-- Product reviews (2026-11-18): one star rating + short text per person per
-- product ('notes' today). Public: name and avatar only.
create table if not exists app.review (
  id          bigserial primary key,
  product     text        not null check (product ~ '^[a-z0-9-]{1,40}$'),
  user_id     text        not null,
  rating      smallint    not null check (rating between 1 and 5),
  body        text        not null check (char_length(body) between 10 and 1000),
  status      text        not null default 'visible' check (status in ('visible', 'hidden')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product, user_id)
);
create index if not exists review_product_idx on app.review (product, status, created_at desc);

-- Email journeys (2026-11-22). Every email sent is one row, so nobody gets the
-- same step twice; `ref` tells repeatable steps apart (an exam attempt id, a
-- lesson path). Opt-outs are per account and stop every marketing email.
create table if not exists app.email_sent (
  user_id  text        not null,
  journey  text        not null check (journey ~ '^[a-z_]{2,30}$'),
  step     smallint    not null default 0,
  ref      text        not null default '',
  sent_at  timestamptz not null default now(),
  primary key (user_id, journey, step, ref)
);
create index if not exists email_sent_user_time_idx on app.email_sent (user_id, sent_at desc);

create table if not exists app.email_optout (
  user_id    text        primary key,
  created_at timestamptz not null default now()
);

-- GTM: first-party lead enrichment and the Salesforce account sync (2026-11-23,
-- migrate-2026-11-23-gtm.sql). No IP address is stored: only what Cloudflare
-- derived from it.

-- The company behind an email domain (server/utils/enrich.ts → domainInfo),
-- fetched once from the company's own home page and kept 30 days.
create table if not exists app.company_domain (
  domain      text        primary key check (domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  kind        text        not null check (kind in ('personal', 'business', 'education', 'government', 'disposable')),
  company     text,
  title       text,
  description text,
  logo        text,
  linkedin    text,
  website     text,
  -- Optional paid provider's answer (ENRICH_PROVIDER_URL), by domain only.
  provider    jsonb,
  status      text        not null default 'pending',
  fetched_at  timestamptz
);

-- One enrichment per signed-in person (user_id) or per "talk to us" request
-- (lead_id): geo + network at the last event, the email domain, product
-- signals, and the score from server/utils/score.ts with its reasons.
create table if not exists app.enrichment (
  id            bigint generated always as identity primary key,
  user_id       text        unique,
  lead_id       bigint      unique references app.lead(id) on delete cascade,
  email_domain  text,
  domain_kind   text,
  company       text,
  country       text,
  region        text,
  city          text,
  timezone      text,
  asn           integer,
  as_org        text,
  network_kind  text,
  first_touch   text,
  last_event    text,
  last_event_at timestamptz,
  signals       jsonb       not null default '{}'::jsonb,
  fit           smallint    not null default 0,
  engagement    smallint    not null default 0,
  score         smallint    not null default 0,
  grade         text        not null default 'Cold',
  reasons       jsonb       not null default '[]'::jsonb,
  updated_at    timestamptz not null default now(),
  constraint enrichment_has_subject check (user_id is not null or lead_id is not null)
);
create index if not exists enrichment_score_idx on app.enrichment (score desc) where user_id is not null;

-- What was last sent to Salesforce per record (server/utils/sf-sync.ts): a
-- hash of the payload, so only changed rows are sent. kind/ext_id is the
-- external ID: org → Account.Academy_Org_Id__c, learner →
-- Academy_Learner__c.Academy_User_Id__c, seat → Seat_Assignment__c.Academy_Seat_Key__c.
create table if not exists app.sf_sync (
  kind      text        not null check (kind in ('org', 'learner', 'seat')),
  ext_id    text        not null,
  hash      text        not null,
  sf_id     text,
  status    text        not null default 'ok',
  synced_at timestamptz not null default now(),
  primary key (kind, ext_id)
);

-- One row per sync run (hourly cron or /admin → Integrations → Sync now).
create table if not exists app.sf_sync_run (
  id          bigint generated always as identity primary key,
  trigger     text        not null default 'cron' check (trigger in ('cron', 'admin')),
  status      text        not null,
  candidates  integer     not null default 0,
  changed     integer     not null default 0,
  sent        integer     not null default 0,
  created     integer     not null default 0,
  updated     integer     not null default 0,
  failed      integer     not null default 0,
  calls       integer     not null default 0,
  error       text,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);
