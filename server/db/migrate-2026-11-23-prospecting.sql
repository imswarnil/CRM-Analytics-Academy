-- Prospecting (2026-11-23): /admin → Prospecting. Idempotent; also appended to
-- schema.sql. Apply with:
--   psql "$DATABASE_URL" -f server/db/migrate-2026-11-23-prospecting.sql
--
-- B2B outreach from the owner's own Gmail. Every prospect records where it
-- came from and its lawful basis (legitimate interest, B2B); deleting one
-- deletes its activity, list memberships, enrollments and messages.

-- Saved companies (from a provider search or by hand). Enrichment comes from
-- app.company_domain (the GTM cache) by domain.
create table if not exists app.prospect_company (
  id              bigint generated always as identity primary key,
  domain          text        unique check (domain is null or domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  name            text        not null,
  industry        text,
  size            integer,
  country         text,
  city            text,
  website         text,
  linkedin        text,
  uses_salesforce boolean,
  provider        text,
  provider_id     text,
  notes           text,
  created_at      timestamptz not null default now()
);

create table if not exists app.prospect (
  id              bigint generated always as identity primary key,
  company_id      bigint      references app.prospect_company(id) on delete set null,
  first_name      text,
  last_name       text,
  title           text,
  seniority       text,
  email           text        check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  email_status    text        check (email_status in ('valid', 'risky', 'invalid', 'unknown')),
  email_detail    text,
  email_checked_at timestamptz,
  linkedin        text,
  country         text,
  city            text,
  timezone        text,
  -- GDPR: where the data came from and why we may process it.
  source          text        not null,
  lawful_basis    text        not null default 'legitimate_interest' check (lawful_basis in ('legitimate_interest', 'consent')),
  status          text        not null default 'new'
                  check (status in ('new', 'active', 'replied', 'bounced', 'unsubscribed', 'converted', 'do_not_contact')),
  lead_id         bigint,
  provider        text,
  provider_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index if not exists prospect_email_idx on app.prospect (lower(email)) where email is not null;
create index if not exists prospect_company_idx on app.prospect (company_id);

create table if not exists app.prospect_list (
  id         bigint generated always as identity primary key,
  name       text        not null unique check (length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);
create table if not exists app.prospect_list_member (
  list_id     bigint      not null references app.prospect_list(id) on delete cascade,
  prospect_id bigint      not null references app.prospect(id) on delete cascade,
  added_at    timestamptz not null default now(),
  primary key (list_id, prospect_id)
);

-- Sequences: draft → reviewed (previewed by the owner) → running ⇄ paused.
create table if not exists app.prospect_sequence (
  id          bigint generated always as identity primary key,
  name        text        not null check (length(btrim(name)) between 1 and 80),
  status      text        not null default 'draft' check (status in ('draft', 'reviewed', 'running', 'paused')),
  reviewed_at timestamptz,
  started_at  timestamptz,
  created_at  timestamptz not null default now()
);
-- Step n waits delay_days after step n-1 (step 0: after enrollment).
create table if not exists app.prospect_step (
  sequence_id bigint   not null references app.prospect_sequence(id) on delete cascade,
  position    smallint not null check (position between 0 and 9),
  delay_days  smallint not null default 0 check (delay_days between 0 and 60),
  subject     text     not null check (length(subject) between 1 and 200),
  body        text     not null check (length(body) between 1 and 5000),
  primary key (sequence_id, position)
);
create table if not exists app.prospect_enrollment (
  id              bigint generated always as identity primary key,
  sequence_id     bigint      not null references app.prospect_sequence(id) on delete cascade,
  prospect_id     bigint      not null references app.prospect(id) on delete cascade,
  status          text        not null default 'active' check (status in ('active', 'finished', 'replied', 'bounced', 'unsubscribed', 'stopped')),
  step            smallint    not null default 0,
  next_at         timestamptz not null default now(),
  thread_id       text,
  rfc_message_id  text,
  last_checked_at timestamptz,
  created_at      timestamptz not null default now(),
  unique (sequence_id, prospect_id)
);
create index if not exists prospect_enrollment_due_idx on app.prospect_enrollment (next_at) where status = 'active';

create table if not exists app.prospect_message (
  id            bigint generated always as identity primary key,
  enrollment_id bigint      not null references app.prospect_enrollment(id) on delete cascade,
  prospect_id   bigint      not null references app.prospect(id) on delete cascade,
  step          smallint    not null,
  gmail_id      text,
  thread_id     text,
  subject       text        not null,
  sent_at       timestamptz not null default now()
);
create index if not exists prospect_message_time_idx on app.prospect_message (sent_at desc);

-- The timeline: found, verified, enrolled, sent, replied, bounced, unsubscribed, converted, note…
create table if not exists app.prospect_activity (
  id          bigint generated always as identity primary key,
  prospect_id bigint      not null references app.prospect(id) on delete cascade,
  kind        text        not null check (kind ~ '^[a-z_]{2,30}$'),
  detail      text,
  at          timestamptz not null default now()
);
create index if not exists prospect_activity_idx on app.prospect_activity (prospect_id, at desc);

-- Never contact: an address, or a whole domain written as '@acme.com'.
create table if not exists app.prospect_suppression (
  value      text        primary key check (value ~ '^([^@\s]+)?@[^@\s]+\.[^@\s]+$'),
  reason     text        not null check (reason in ('unsubscribed', 'bounced', 'manual', 'deleted')),
  note       text,
  created_at timestamptz not null default now()
);

-- Provider answers, so the same lookup is never paid for twice; and the call
-- log behind rate limits and the usage numbers in the admin.
create table if not exists app.prospect_cache (
  provider   text        not null,
  op         text        not null,
  key        text        not null,
  response   jsonb       not null,
  created_at timestamptz not null default now(),
  primary key (provider, op, key)
);
create table if not exists app.provider_call (
  id       bigint generated always as identity primary key,
  provider text        not null,
  op       text        not null,
  status   integer     not null,
  cached   boolean     not null default false,
  at       timestamptz not null default now()
);
create index if not exists provider_call_idx on app.provider_call (provider, at desc);

-- The connected Gmail mailbox (one). refresh_enc is AES-GCM sealed under the
-- site secret (server/utils/prospect-core.ts); the plain token is never stored.
create table if not exists app.mail_account (
  email        text        primary key,
  provider     text        not null default 'gmail' check (provider = 'gmail'),
  refresh_enc  text        not null,
  status       text        not null default 'ok',
  connected_at timestamptz not null default now()
);

-- Settings: daily_cap, ramp_start, ramp_step, window_start, window_end,
-- default_tz, sender_name, footer, suppress_learners.
create table if not exists app.prospect_setting (
  key   text  primary key check (key ~ '^[a-z_]{2,30}$'),
  value jsonb not null
);
