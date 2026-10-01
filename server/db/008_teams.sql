-- Teams: self-serve seats of Pro for a company.
--
-- A team is bought by one person (the owner) on a company-domain email. Its
-- seats are a Dodo subscription whose quantity is the seat count. Members
-- join by accepting an invite link; an invite is only valid for an email on
-- the team's domain (or one of the extra domains the owner allows), and a
-- seat is consumed when it is accepted, not when it is sent.
--
-- Invite tokens are stored as SHA-256 hashes: the link the owner copies is
-- the only place the token itself exists.
--
-- Additive only. Apply by hand against Neon, after 007.
create table if not exists app.team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id text not null,
  domain text not null,
  extra_domains text[] not null default '{}',
  seats integer not null default 3 check (seats between 1 and 500),
  dodo_subscription_id text,
  dodo_customer_id text,
  status text not null default 'active' check (status in ('pending', 'active', 'past_due', 'cancelled', 'inactive')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists team_subscription_uidx on app.team (dodo_subscription_id) where dodo_subscription_id is not null;
create index if not exists team_owner_idx on app.team (owner_user_id);

create table if not exists app.team_member (
  team_id uuid not null references app.team (id) on delete cascade,
  user_id text not null,
  email text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index if not exists team_member_user_idx on app.team_member (user_id);

create table if not exists app.team_invite (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references app.team (id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  invited_by text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  accepted_by text
);
create index if not exists team_invite_team_idx on app.team_invite (team_id);
