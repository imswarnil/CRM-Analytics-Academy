-- One-off (applied 2026-11-16, after a full pg_dump of schema `app`):
-- the platform simplification. Drops everything retired and the data that
-- points at content which no longer exists. Idempotent; safe to re-run.
--   psql "$DATABASE_URL" -f server/db/cleanup-2026-11-16.sql
begin;

-- Retired features: page-view analytics, the reading meter, Teams, sponsors,
-- section waitlists, Pro subscriptions, points spending, attribution.
drop view  if exists app.human_page_view;
drop view  if exists app.human_event;
drop view  if exists app.wallet;
drop table if exists app.human_visitor;
drop table if exists app.bot_drop;
drop table if exists app.page_view;
drop table if exists app.meter_view;
drop table if exists app.session_ledger;
drop table if exists app.waitlist;
drop table if exists app.sponsor_stat;
drop table if exists app.sponsor;
drop table if exists app.org_invite;
drop table if exists app.org_member;
drop table if exists app.org;
drop table if exists app.subscription;
drop table if exists app.points_ledger;
drop table if exists app.user_attribution;

-- Lead columns that only page-view attribution filled.
alter table app.lead drop column if exists visitor;
alter table app.lead drop column if exists first_landing;
alter table app.lead drop column if exists views_before;

-- Every lesson was deleted: learner state that points at a lesson is stale.
delete from app.progress;
delete from app.bookmark;
delete from app.quiz_attempt;
delete from app.comment;

-- One practice paper remains.
delete from app.exam_attempt where paper <> 'paper-1';

-- Events: milestones only.
delete from app.event where name not in ('sign_up', 'sign_in', 'lesson_complete', 'exam_finish', 'youtube_verified', 'checkout');
alter table app.event drop column if exists session;

-- Indexes a primary key already covers (leading column user_id).
drop index if exists app.progress_user_idx;
drop index if exists app.interview_upvote_user_idx;
create index if not exists event_user_name_idx on app.event (user_id, name) where user_id is not null;

-- Short-lived security rows.
delete from app.rate_hit where at < now() - interval '1 day';
delete from app.used_challenge where at < now() - interval '1 hour';

commit;
