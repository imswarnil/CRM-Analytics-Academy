-- The experts network: freelancers who deliver CRM Analytics projects together.
--
-- Two changes, both safe to re-run:
--
--   1. app.lead accepts two more types. `project` is a company asking the
--      network to deliver something; `expert` is a freelancer applying to
--      join. Both arrive through the same public form and pipeline as every
--      other lead (/api/leads → app.lead → n8n), so applications and project
--      requests are worked in the same inbox.
--
--   2. app.expert — the public roster. A profile is created by an admin when
--      an `expert` application is approved (lead_id points back at it), and
--      only rows with status = 'approved' are ever served publicly. `hidden`
--      takes someone off the page without losing their profile.
--
-- Apply by hand against Neon, after 009 (and 010 if present).

-- 1. Widen the lead type check. The constraint was declared inline on the
--    column in 007, so Postgres named it lead_type_check — but rather than
--    trust the generated name, drop whichever check constraint tests `type`
--    against a list, then add the wider one under a known name. One
--    transaction, so the table is never unprotected; the list keeps every
--    retired type because rows of those types already exist.
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
  'team', 'nomination', 'training', 'implementation',
  'project', 'expert'));
commit;

-- 2. The roster.
create table if not exists app.expert (
  id               bigint generated always as identity primary key,
  -- The application this profile came from; null for profiles added by hand.
  lead_id          bigint      unique references app.lead (id) on delete set null,
  -- Optional link to a site account, for a future "edit your own profile".
  user_id          text        unique,

  name             text        not null check (length(btrim(name)) between 2 and 120),
  -- Private: how the network reaches them. Never served by the public API.
  email            text        check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  headline         text        check (headline is null or length(headline) <= 160),
  bio              text        check (bio is null or length(bio) <= 1200),
  photo_url        text        check (photo_url is null or photo_url ~* '^https://'),
  linkedin_url     text        check (linkedin_url is null or linkedin_url ~* '^https://'),
  portfolio_url    text        check (portfolio_url is null or portfolio_url ~* '^https://'),
  skills           text[]      not null default '{}',
  years            smallint    check (years is null or years between 0 and 60),
  country          text        check (country is null or length(country) <= 80),
  timezone         text        check (timezone is null or length(timezone) <= 64),

  status           text        not null default 'pending'
                     check (status in ('pending', 'approved', 'hidden')),
  -- Lower first on the public page; ties broken by name.
  sort_order       integer     not null default 100,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists expert_public_idx on app.expert (status, sort_order, name);
