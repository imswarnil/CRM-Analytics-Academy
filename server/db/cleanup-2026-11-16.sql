-- One-off: drop what the 2026-11-16 simplification retired — page-view
-- analytics, the reading meter, Teams, sponsors, section waitlists and Pro
-- subscriptions. NOT run automatically; it deletes data. Review, then:
--   psql "$DATABASE_URL" -f server/db/cleanup-2026-11-16.sql
begin;
drop view if exists app.human_page_view;
drop view if exists app.human_event;
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
commit;
