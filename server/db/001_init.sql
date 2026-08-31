-- Application schema.
--
-- Kept separate from neon_auth, which Managed Better Auth owns and may migrate
-- underneath us; nothing here writes to that schema, it only references it.

create schema if not exists app;

-- One row per (learner, lesson) the moment they mark it complete.
-- lesson_path is locale-stripped (/foundations/saql, never /es/foundations/saql)
-- so a learner who switches language keeps their progress.
create table if not exists app.progress (
  user_id      text        not null,
  lesson_path  text        not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_path)
);

create index if not exists progress_user_idx on app.progress (user_id);

-- Entitlements. Written only by the server, only from a verified Dodo webhook
-- or an admin action — never from anything the browser can reach.
create table if not exists app.entitlement (
  user_id         text        primary key,
  pro             boolean     not null default false,
  source          text        not null default 'none',
  granted_at      timestamptz,
  dodo_payment_id text        unique,
  updated_at      timestamptz not null default now()
);

-- Webhook replay guard. Payment providers retry, and a retry must not grant
-- the entitlement twice or re-run any side effect; the provider's own event id
-- is the primary key, so a duplicate delivery fails the insert instead.
create table if not exists app.webhook_event (
  id          text        primary key,
  kind        text        not null,
  received_at timestamptz not null default now()
);

-- The demo account is shared, so its progress is wiped on a schedule rather
-- than accumulating whatever every visitor happened to click. Marked here so
-- the reset job has something to key on rather than a hardcoded email.
create table if not exists app.demo_account (
  user_id text primary key
);
