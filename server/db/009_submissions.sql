-- Structured submission details.
--
-- The contribute stepper collects different things per type — a dashboard's
-- data sources and KPI formulas, a translation's wrong and corrected text, a
-- SAQL snippet and its dataset shape — so they ride along as one JSON object
-- rather than a column per field. `details.type` is the fine-grained type
-- (dashboard, resource, lesson, translation, snippet); `kind` keeps its three
-- moderation buckets so the admin queue and its constraint are unchanged.
alter table app.submission
  add column if not exists details jsonb not null default '{}'::jsonb;
