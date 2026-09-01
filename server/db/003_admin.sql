-- Roles.
--
-- In app.*, not on neon_auth."user". That schema is managed by Better Auth and
-- may migrate underneath us — 001_init.sql establishes that nothing here
-- writes to it, and a `role` column added to someone else's table is exactly
-- the thing a managed migration drops without telling you.
create table if not exists app.user_role (
  user_id    text        primary key,
  role       text        not null default 'learner'
               check (role in ('admin', 'moderator', 'learner')),
  granted_by text,
  granted_at timestamptz not null default now()
);

-- A user with no row is a learner. The table only records exceptions, so
-- signing up costs no write here and the absence of a row is never ambiguous.
create index if not exists user_role_role_idx on app.user_role (role);

-- ---------------------------------------------------------------------------
-- Admin listing
-- ---------------------------------------------------------------------------
-- Joins the managed auth table to everything app.* knows about a person, so
-- the admin screen is one query rather than four and cannot show a user whose
-- numbers came from different moments.
create or replace view app.admin_user as
select
  u.id::text                          as user_id,
  u.email,
  u.name,
  u.image,
  u."createdAt"                       as created_at,
  u."emailVerified"                   as email_verified,
  coalesce(r.role, 'learner')         as role,
  coalesce(p.points, 0)               as points,
  coalesce(p.lessons_done, 0)         as lessons_done,
  coalesce(s.pending, 0)              as pending_submissions,
  (d.user_id is not null)             as is_demo,
  coalesce(e.pro, false)              as pro
from neon_auth."user" u
left join app.user_role   r on r.user_id = u.id::text
left join app.user_points p on p.user_id = u.id::text
left join app.entitlement e on e.user_id = u.id::text
left join app.demo_account d on d.user_id = u.id::text
left join (
  select user_id, count(*)::int as pending
  from app.submission
  where status = 'pending'
  group by user_id
) s on s.user_id = u.id::text;
