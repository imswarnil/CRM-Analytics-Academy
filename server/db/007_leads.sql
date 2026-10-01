-- Every inbound contact with the Academy as a business, in one place: sales
-- conversations, quotations, classroom seats, implementation requests,
-- sponsorships, team sign-ups, instructor applications, Wall of Fame
-- nominations and plain "contact us" messages.
--
-- A new table rather than a widened app.inquiry: inquiry's check constraints
-- pin `kind` and `status` to its original three and four values, and widening
-- them means dropping constraints. This migration is additive only — nothing
-- is dropped or altered in place — and it copies inquiry's rows across so the
-- admin console has one inbox. app.inquiry stays, read-only history.
--
-- Public, like inquiry: the people writing are prospects without accounts, so
-- the API rate-limits by hashed IP (app.lead_rate) and carries a honeypot, and
-- nothing here is ever rendered on a public page.
create table if not exists app.lead (
  id                bigint generated always as identity primary key,
  type              text        not null check (type in (
                      'quote', 'sales', 'contact', 'instructor', 'sponsor',
                      'team', 'nomination', 'training', 'implementation')),

  name              text        not null check (length(btrim(name)) between 2 and 120),
  email             text        not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company           text        check (company is null or length(company) <= 160),
  company_domain    text        check (company_domain is null or length(company_domain) <= 253),
  role              text        check (role is null or length(role) <= 120),
  phone             text        check (phone is null or length(phone) <= 40),
  country           text        check (country is null or length(country) <= 80),
  seats             integer     check (seats is null or seats between 1 and 100000),
  budget            text        check (budget is null or length(budget) <= 80),
  message           text        check (message is null or length(message) <= 4000),
  source_page       text        check (source_page is null or length(source_page) <= 300),
  utm               jsonb       not null default '{}',
  -- Type-specific fields (nominee, tier, programme …) so a new form field
  -- does not need a migration.
  details           jsonb       not null default '{}',

  -- Enrichment from the company's own website (title, description, logo).
  company_name      text,
  logo_url          text,
  site_title        text,
  site_description  text,
  enriched_at       timestamptz,

  -- CRM sync: forwarded to n8n, which creates the Salesforce lead.
  n8n_status        text        not null default 'pending'
                      check (n8n_status in ('pending', 'sent', 'failed', 'not_configured')),
  n8n_attempts      integer     not null default 0,
  n8n_last_error    text,
  n8n_sent_at       timestamptz,
  salesforce_id     text,

  -- Working the lead.
  status            text        not null default 'new'
                      check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'spam')),
  owner             text,
  notes             text,

  legacy_inquiry_id bigint      unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists lead_status_idx on app.lead (status, created_at desc);
create index if not exists lead_type_idx   on app.lead (type, created_at desc);
create index if not exists lead_email_idx  on app.lead (lower(email));

-- Per-IP submission counter for the public form. The IP is stored hashed; a
-- row is only a count inside a one-hour window.
create table if not exists app.lead_rate (
  ip_hash      text        primary key,
  count        integer     not null default 0,
  window_start timestamptz not null default now()
);

-- Carry app.inquiry's rows across once. Re-running is a no-op: a row already
-- copied is matched on legacy_inquiry_id.
insert into app.lead (type, name, email, company, phone, message, details, status, notes, created_at, updated_at, legacy_inquiry_id, n8n_status)
select
  case i.kind when 'enrollment' then 'training' when 'quotation' then 'quote' else 'implementation' end,
  i.name, i.email, i.company, i.phone, i.message, i.details,
  case i.status when 'closed' then 'lost' else i.status end,
  i.note, i.created_at, coalesce(i.handled_at, i.created_at), i.id, 'not_configured'
from app.inquiry i
where not exists (select 1 from app.lead l where l.legacy_inquiry_id = i.id);
