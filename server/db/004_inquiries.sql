-- Enquiries to the Academy as a company: a classroom enrollment, a quotation
-- for a team, or an implementation request.
--
-- Public: the people sending these are prospects, not learners, so no account
-- is required. That makes it a spam target, which is why the API rate-limits
-- by IP and carries a honeypot, and why nothing here is ever rendered
-- publicly — the rows are only read in the admin console.
--
-- One table, not three, for the same reason as app.submission: the three
-- differ by which details they carry, not by lifecycle. Kind-specific fields
-- live in `details` (jsonb) so a new form field does not need a migration.
create table if not exists app.inquiry (
  id          bigint generated always as identity primary key,
  kind        text        not null check (kind in ('enrollment', 'quotation', 'implementation')),

  name        text        not null check (length(btrim(name)) between 2 and 120),
  email       text        not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company     text        check (company is null or length(company) <= 160),
  phone       text        check (phone is null or length(phone) <= 40),
  message     text        check (message is null or length(message) <= 4000),
  details     jsonb       not null default '{}',

  status      text        not null default 'new'
                check (status in ('new', 'contacted', 'won', 'closed')),
  note        text,
  handled_by  text,
  handled_at  timestamptz,

  created_at  timestamptz not null default now()
);

create index if not exists inquiry_status_idx on app.inquiry (status, created_at desc);
create index if not exists inquiry_kind_idx   on app.inquiry (kind, created_at desc);
