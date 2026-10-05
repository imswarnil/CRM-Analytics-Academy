-- Instructors and the lesson review queue.
--
-- Idempotent: every statement can run again on a database that already has
-- it. Applied by hand against Neon, after 010, like every other migration.
--
-- 1. A fourth role. An instructor can open /admin, but sees only the content
--    editor, may edit only the lessons that list them as an author (plus the
--    ones they create), and never writes to main: every save lands on a branch
--    and a pull request an admin publishes or sends back.
-- 2. Which person in the public registry (content/people/<slug>.yml) an
--    instructor account is. Lesson frontmatter names authors by that slug, so
--    this mapping is what turns "authors: [jane-doe]" into "jane may edit it".
--    Kept here, not in the YAML, because the repo is public and an account's
--    id or email has no business in it.
-- 3. The instructor's open drafts — the branch and pull request each save
--    goes to, so the next save updates the same pull request instead of
--    opening another one. GitHub is the source of truth for whether a pull
--    request is still open; this table only remembers which one is whose.

-- 1 ---------------------------------------------------------------------------
-- The check was declared inline in 003_admin.sql, so Postgres named it
-- user_role_role_check. Dropped and re-added rather than altered: a check
-- constraint cannot be edited in place.
alter table app.user_role drop constraint if exists user_role_role_check;
alter table app.user_role
  add constraint user_role_role_check
  check (role in ('admin', 'moderator', 'instructor', 'learner'));

-- 2 ---------------------------------------------------------------------------
create table if not exists app.instructor_profile (
  user_id     text        primary key,
  person_slug text        not null unique
                check (person_slug ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  updated_by  text,
  updated_at  timestamptz not null default now()
);

-- 3 ---------------------------------------------------------------------------
create table if not exists app.lesson_draft (
  id          bigserial   primary key,
  user_id     text        not null,
  -- lesson/<slug>-<shortid>; one branch, one pull request.
  branch      text        not null unique,
  pr_number   integer,
  pr_url      text,
  title       text        not null,
  -- Every content path the branch touches, so "is there already a draft for
  -- this lesson?" is one indexed lookup.
  paths       text[]      not null default '{}',
  status      text        not null default 'open'
                check (status in ('open', 'changes_requested', 'published', 'closed')),
  review_note text,
  reviewed_by text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists lesson_draft_user_idx on app.lesson_draft (user_id, status);
create index if not exists lesson_draft_paths_idx on app.lesson_draft using gin (paths);
