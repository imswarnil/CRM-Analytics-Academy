-- Quiz grading upgrade
-- ---------------------
-- Scoring moved server-side (answers are never sent to the browser). Each
-- attempt now records the learner's selected answers and whether they passed,
-- so we can compute an average score per learner and show pass/fail history.
--
-- Idempotent: safe to re-run in the Supabase SQL editor.

alter table public.quiz_attempts
  add column if not exists answers jsonb,
  add column if not exists passed  boolean not null default false;

-- Speeds up "attempts for this user + quiz" lookups (used to rotate the
-- question set on each retry) and per-quiz "best attempt" aggregation.
create index if not exists quiz_attempts_user_quiz_idx
  on public.quiz_attempts (user_id, quiz_id);
