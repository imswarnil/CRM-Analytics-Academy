-- 2026-11-23: lessons moved from /<section>/<lesson> to /course/<section>/<lesson>.
--
-- Every stored lesson path is rewritten to its new URL. Lesson slugs did not
-- change; three section slugs did (shared/utils/coursePaths.ts is the map):
--
--   /salesforce-foundations      → /course/foundations
--   /data-prep                   → /course/data-prep
--   /visualization               → /course/visualization
--   /saql                        → /course/saql
--   /interactions-and-bindings   → /course/bindings
--   /sharing-and-embedding       → /course/sharing
--   /einstein-discovery          → /course/einstein-discovery
--
-- Idempotent: a rewritten path starts with /course and no longer matches, so
-- running it twice changes nothing. Tables keyed by (user, path) first drop an
-- old row whose new form already exists, so the update cannot collide.
-- Until it has run, the Worker reads old paths as new ones
-- (currentLessonPath in progress.get.ts, both paths in comments).
--
--   psql "$DATABASE_URL" -f server/db/migrate-2026-11-23-course-urls.sql

begin;

create temporary table course_url_map (old text primary key, new text not null) on commit drop;
insert into course_url_map (old, new) values
  ('salesforce-foundations', 'foundations'),
  ('data-prep', 'data-prep'),
  ('visualization', 'visualization'),
  ('saql', 'saql'),
  ('interactions-and-bindings', 'bindings'),
  ('sharing-and-embedding', 'sharing'),
  ('einstein-discovery', 'einstein-discovery');

-- The new form of a path: an optional locale prefix (events and landing pages
-- carry one; lesson paths are locale-stripped), then /course/<new section>.
create or replace function pg_temp.course_url(p text) returns text language sql stable as $$
  select coalesce(
    (select regexp_replace(p, '^(/(?:en|es|de|pt|fr|ja|hi))?/' || m.old || '(?=/|$|[?#])', '\1/course/' || m.new)
     from course_url_map m
     where p ~ ('^(/(?:en|es|de|pt|fr|ja|hi))?/' || m.old || '(/|$|[?#])')
     limit 1),
    p)
$$;

-- progress: (user_id, lesson_path) is the key.
delete from app.progress o
 where pg_temp.course_url(o.lesson_path) <> o.lesson_path
   and exists (select 1 from app.progress n where n.user_id = o.user_id and n.lesson_path = pg_temp.course_url(o.lesson_path));
update app.progress set lesson_path = pg_temp.course_url(lesson_path)
 where pg_temp.course_url(lesson_path) <> lesson_path;

-- bookmark: (user_id, lesson_path) is the key.
delete from app.bookmark o
 where pg_temp.course_url(o.lesson_path) <> o.lesson_path
   and exists (select 1 from app.bookmark n where n.user_id = o.user_id and n.lesson_path = pg_temp.course_url(o.lesson_path));
update app.bookmark set lesson_path = pg_temp.course_url(lesson_path)
 where pg_temp.course_url(lesson_path) <> lesson_path;

-- quiz attempts and comments: no uniqueness on the path.
update app.quiz_attempt set lesson_path = pg_temp.course_url(lesson_path)
 where pg_temp.course_url(lesson_path) <> lesson_path;
update app.comment set lesson_path = pg_temp.course_url(lesson_path)
 where pg_temp.course_url(lesson_path) <> lesson_path;

-- Milestone events (lesson_complete carries the lesson's page path).
update app.event set path = pg_temp.course_url(path)
 where pg_temp.course_url(path) <> path;

-- First-touch landing pages on leads.
update app.lead set landing = pg_temp.course_url(landing)
 where landing is not null and pg_temp.course_url(landing) <> landing;

-- Email journeys: `stalled` is sent once per lesson, keyed by its path in ref.
delete from app.email_sent o
 where o.journey = 'stalled' and pg_temp.course_url(o.ref) <> o.ref
   and exists (select 1 from app.email_sent n
               where n.user_id = o.user_id and n.journey = o.journey and n.step = o.step and n.ref = pg_temp.course_url(o.ref));
update app.email_sent set ref = pg_temp.course_url(ref)
 where journey = 'stalled' and pg_temp.course_url(ref) <> ref;

commit;
