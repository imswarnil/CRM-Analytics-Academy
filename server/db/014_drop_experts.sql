-- Undo 011 (the experts network), which was removed from the site on
-- 2026-10-05 before it ever went live. 011 itself is deleted from the repo;
-- this is its down-migration, safe to run whether or not 011 was applied.
--
--   1. The roster table and its index go.
--   2. app.lead stops accepting the two expert-era types. Rows of those types
--      — if any were ever written — are left alone: the constraint is added
--      NOT VALID, so it is enforced for new rows only.
--
-- Apply by hand against Neon, after 013.

drop table if exists app.expert;

begin;
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'app.lead'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%(type = any%'
  loop
    execute format('alter table app.lead drop constraint %I', c.conname);
  end loop;
end $$;
alter table app.lead add constraint lead_type_check check (type in (
  'quote', 'sales', 'contact', 'instructor', 'sponsor',
  'team', 'nomination', 'training', 'implementation')) not valid;
commit;
