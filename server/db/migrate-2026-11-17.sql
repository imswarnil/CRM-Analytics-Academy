-- 2026-11-17: YouTube-subscriber tier removed; Pro Monthly, Pro Lifetime and
-- Teams & institutions added. Idempotent. Run, then re-apply schema.sql:
--   psql "$DATABASE_URL" -f server/db/migrate-2026-11-17.sql
--   psql "$DATABASE_URL" -f server/db/schema.sql
begin;
drop table if exists app.youtube_link;
-- entitlement: the boolean `pro` is implied by the row; products renamed.
alter table app.entitlement drop column if exists pro;
update app.entitlement set product = 'lifetime' where product in ('all-access');
update app.entitlement set product = 'grant' where product not in ('lifetime', 'grant');
alter table app.entitlement alter column product set default 'grant';
alter table app.entitlement drop constraint if exists entitlement_product_check;
alter table app.entitlement add constraint entitlement_product_check check (product in ('lifetime', 'grant'));
commit;
