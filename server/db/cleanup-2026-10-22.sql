-- One-off, run once on 2026-10-22: removes everything the simplification
-- retired (payments, teams, sponsors, leads, instructor drafts, roles and the
-- Payload CMS schema). Then run schema.sql.
drop table if exists
  app.entitlement, app.webhook_event,
  app.team_invite, app.team_member, app.team,
  app.lead_rate, app.lead, app.inquiry,
  app.sponsor_stat, app.sponsor_creative, app.sponsor_booking, app.sponsor,
  app.lesson_draft, app.instructor_profile, app.user_role, app.expert
  cascade;
drop schema if exists payload cascade;
