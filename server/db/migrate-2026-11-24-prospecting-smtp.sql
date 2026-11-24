-- Prospecting moves off Gmail (2026-11-24): outreach is sent by SMTP from the
-- owner's Hostinger mailbox (or by n8n), and replies/bounces arrive from n8n
-- through a signed webhook. Idempotent; run after migrate-2026-11-23-prospecting.sql:
--   psql "$DATABASE_URL" -f server/db/migrate-2026-11-24-prospecting-smtp.sql

-- The Gmail OAuth token store is gone (no OAuth, no sealed refresh token).
drop table if exists app.mail_account;

-- Messages are matched by our own Message-ID now, not by a Gmail id/thread.
alter table app.prospect_message add column if not exists message_id text;
alter table app.prospect_message add column if not exists transport text;
alter table app.prospect_message drop column if exists gmail_id;
alter table app.prospect_message drop column if exists thread_id;
create unique index if not exists prospect_message_mid_idx on app.prospect_message (message_id) where message_id is not null;

-- No thread polling: the enrollment keeps the first Message-ID (rfc_message_id) for threading.
alter table app.prospect_enrollment drop column if exists thread_id;
alter table app.prospect_enrollment drop column if exists last_checked_at;

-- Every signed event n8n posts (reply, bounce, unsubscribe, auto_reply).
-- `signature` is unique, so a replayed request is refused.
create table if not exists app.prospect_inbound (
  id          bigint generated always as identity primary key,
  signature   text        not null unique,
  type        text        not null check (type in ('reply', 'bounce', 'unsubscribe', 'auto_reply')),
  from_addr   text,
  message_id  text,
  in_reply_to text,
  prospect_id bigint      references app.prospect(id) on delete cascade,
  matched_by  text,
  received_at timestamptz,
  at          timestamptz not null default now()
);
create index if not exists prospect_inbound_at_idx on app.prospect_inbound (at desc);
