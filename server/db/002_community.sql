-- Community contributions and points.
--
-- Same rule as 001: nothing here writes to neon_auth, it only references it.
-- user_id is the Better Auth id, kept as text and NOT foreign-keyed, because
-- that schema is managed and may migrate underneath us.

-- ---------------------------------------------------------------------------
-- Submissions
-- ---------------------------------------------------------------------------
-- One table, not three. A resource, a showcase dashboard and a lesson idea
-- differ by which columns they fill, not by lifecycle: all three are submitted
-- by a learner, sit in a queue, and are approved or rejected by the same
-- person using the same screen. Three tables would mean three review screens
-- and three ways to forget to moderate one of them.
create table if not exists app.submission (
  id           bigint generated always as identity primary key,
  user_id      text        not null,
  kind         text        not null check (kind in ('resource', 'showcase', 'lesson-idea')),

  title        text        not null check (length(btrim(title)) between 3 and 160),
  url          text        check (url is null or url ~* '^https?://'),
  description  text        not null check (length(btrim(description)) between 20 and 2000),
  -- Free-form tags, lowercased by the API. Array rather than a join table:
  -- they are labels for filtering, not entities anything else references.
  tags         text[]      not null default '{}',
  -- Showcase entries carry a screenshot; resources do not.
  image_url    text        check (image_url is null or image_url ~* '^https?://'),

  -- Nothing is public until a human says so. This is a public form on a site
  -- with a database behind it, which is a spam target by definition.
  status       text        not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  review_note  text,
  reviewed_by  text,
  reviewed_at  timestamptz,

  created_at   timestamptz not null default now()
);

create index if not exists submission_status_idx  on app.submission (status, created_at desc);
create index if not exists submission_user_idx    on app.submission (user_id, created_at desc);

-- One person cannot submit the same link twice. Partial, so a rejected
-- submission can be resubmitted after it is fixed.
create unique index if not exists submission_user_url_uniq
  on app.submission (user_id, url)
  where url is not null and status <> 'rejected';

-- ---------------------------------------------------------------------------
-- Quiz attempts
-- ---------------------------------------------------------------------------
-- Every attempt is kept, not just the best one: "I got 4/5 on the second try"
-- is the interesting fact, and a table that overwrites cannot answer it.
-- The leaderboard reads the BEST score per quiz, so retries improve a score
-- but repeating an easy quiz cannot farm points.
create table if not exists app.quiz_attempt (
  id          bigint generated always as identity primary key,
  user_id     text        not null,
  -- Locale-stripped, exactly like app.progress.lesson_path, so a learner who
  -- switches language keeps their results.
  lesson_path text        not null,
  score       smallint    not null check (score >= 0),
  total       smallint    not null check (total > 0),
  created_at  timestamptz not null default now(),
  constraint quiz_score_within_total check (score <= total)
);

create index if not exists quiz_attempt_user_idx on app.quiz_attempt (user_id, lesson_path);

-- ---------------------------------------------------------------------------
-- Points
-- ---------------------------------------------------------------------------
-- A view, not a counter column. A stored total has to be updated from every
-- place that can earn a point, and the first one that forgets makes the
-- number quietly wrong with no way to notice. Derived from the source rows,
-- it cannot disagree with them.
--
-- The weights encode what the site wants more of: finishing lessons is the
-- baseline, and a contribution someone had to write and get approved is worth
-- several lessons.
create or replace view app.user_points as
with lesson_points as (
  select user_id, count(*) * 10 as pts, count(*)::int as lessons_done
  from app.progress
  group by user_id
),
quiz_points as (
  -- Best attempt per quiz only.
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
-- neon_auth."user".id is a uuid; every user_id we store is text, because
-- app.* deliberately does not depend on that schema's column types. The cast
-- goes on the uuid side so the text indexes on app.* stay usable.
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
