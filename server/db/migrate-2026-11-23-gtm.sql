-- GTM: first-party lead enrichment and the Salesforce account sync (2026-11-23).
-- Idempotent; also appended to schema.sql. Apply with:
--   psql "$DATABASE_URL" -f server/db/migrate-2026-11-23-gtm.sql
--
-- No IP address is stored anywhere here: only what Cloudflare derived from it
-- (country, region, city, timezone, ASN and the AS organisation's name).

-- The company behind an email domain (server/utils/enrich.ts → domainInfo),
-- fetched once from the company's own home page and kept 30 days.
create table if not exists app.company_domain (
  domain      text        primary key check (domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  kind        text        not null check (kind in ('personal', 'business', 'education', 'government', 'disposable')),
  company     text,
  title       text,
  description text,
  logo        text,
  linkedin    text,
  website     text,
  -- Optional paid provider's answer (ENRICH_PROVIDER_URL), by domain only.
  provider    jsonb,
  status      text        not null default 'pending',
  fetched_at  timestamptz
);

-- One enrichment per signed-in person (user_id) or per "talk to us" request
-- (lead_id): geo + network at the last event, the email domain, product
-- signals, and the score from server/utils/score.ts with its reasons.
create table if not exists app.enrichment (
  id            bigint generated always as identity primary key,
  user_id       text        unique,
  lead_id       bigint      unique references app.lead(id) on delete cascade,
  email_domain  text,
  domain_kind   text,
  company       text,
  country       text,
  region        text,
  city          text,
  timezone      text,
  asn           integer,
  as_org        text,
  network_kind  text,
  first_touch   text,
  last_event    text,
  last_event_at timestamptz,
  signals       jsonb       not null default '{}'::jsonb,
  fit           smallint    not null default 0,
  engagement    smallint    not null default 0,
  score         smallint    not null default 0,
  grade         text        not null default 'Cold',
  reasons       jsonb       not null default '[]'::jsonb,
  updated_at    timestamptz not null default now(),
  constraint enrichment_has_subject check (user_id is not null or lead_id is not null)
);
create index if not exists enrichment_score_idx on app.enrichment (score desc) where user_id is not null;

-- What was last sent to Salesforce per record (server/utils/sf-sync.ts): a
-- hash of the payload, so only changed rows are sent. kind/ext_id is the
-- external ID: org → Account.Academy_Org_Id__c, learner →
-- Academy_Learner__c.Academy_User_Id__c, seat → Seat_Assignment__c.Academy_Seat_Key__c.
create table if not exists app.sf_sync (
  kind      text        not null check (kind in ('org', 'learner', 'seat')),
  ext_id    text        not null,
  hash      text        not null,
  sf_id     text,
  status    text        not null default 'ok',
  synced_at timestamptz not null default now(),
  primary key (kind, ext_id)
);

-- One row per sync run (hourly cron or /admin → Integrations → Sync now).
create table if not exists app.sf_sync_run (
  id          bigint generated always as identity primary key,
  trigger     text        not null default 'cron' check (trigger in ('cron', 'admin')),
  status      text        not null,
  candidates  integer     not null default 0,
  changed     integer     not null default 0,
  sent        integer     not null default 0,
  created     integer     not null default 0,
  updated     integer     not null default 0,
  failed      integer     not null default 0,
  calls       integer     not null default 0,
  error       text,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);
