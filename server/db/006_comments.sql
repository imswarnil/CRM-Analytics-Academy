-- Lesson comments.
--
-- One flat table with an optional parent for a single level of replies —
-- enough for "question → answer" under a lesson, without the moderation cost
-- of arbitrarily deep threads. lesson_path is locale-stripped, like
-- app.progress.lesson_path, so a question asked on the Spanish page is
-- visible to English readers of the same lesson.
--
-- Comments publish immediately (status 'visible'); moderators can hide them.
-- Hidden rather than deleted, so a moderation decision can be reviewed and
-- reversed, and so a reply never loses the question it answered.
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
