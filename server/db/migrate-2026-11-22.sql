-- Email journeys (2026-11-22). Every email sent is one row, so nobody gets the
-- same step twice; `ref` tells repeatable steps apart (an exam attempt id, a
-- lesson path). Opt-outs are per account and stop every marketing email.
create table if not exists app.email_sent (
  user_id  text        not null,
  journey  text        not null check (journey ~ '^[a-z_]{2,30}$'),
  step     smallint    not null default 0,
  ref      text        not null default '',
  sent_at  timestamptz not null default now(),
  primary key (user_id, journey, step, ref)
);
create index if not exists email_sent_user_time_idx on app.email_sent (user_id, sent_at desc);

create table if not exists app.email_optout (
  user_id    text        primary key,
  created_at timestamptz not null default now()
);
