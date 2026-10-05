-- Sponsorship: one sponsor per calendar month, $99, exclusive.
--
-- A sponsor is a signed-in account (Neon Auth user) that books whole calendar
-- months. The sponsor of the current month fills every placement on the site
-- — leaderboard, square and text — with the creatives they publish in the
-- sponsor studio (/sponsor/studio). A month with no paid sponsor shows the
-- house placeholder ("Promote your brand here").
--
--   app.sponsor           the account: brand name, site, contact
--   app.sponsor_booking   one row per month per attempt; at most ONE live row
--                         (held or paid) per month, enforced by a partial
--                         unique index, so two buyers can never both pay for
--                         the same month
--   app.sponsor_creative  leaderboard / square / text creatives
--   app.sponsor_stat      impressions and clicks per creative per day
--
-- Booking lifecycle:
--   held       a checkout is in flight. hold_expires_at (≈30 min) frees the
--              month again if the buyer walks away; an expired hold is
--              cancelled lazily by the next booking attempt.
--   paid       the Dodo webhook confirmed payment.succeeded (or an admin
--              recorded an invoice / comp booking). Only the webhook or an
--              admin ever sets this — never the return redirect.
--   cancelled  released: payment failed or was cancelled, the hold expired,
--              or an admin cancelled it.
--
-- needs_refund is raised when a payment succeeds for a hold that had already
-- expired AND someone else has since taken the month. The money arrived but
-- the month cannot be given; the admin console lists these for a refund.
--
-- Additive only and independent of 012–014. Apply by hand against Neon.

create table if not exists app.sponsor (
  id             uuid        primary key default gen_random_uuid(),
  user_id        text        not null unique,
  name           text        not null check (length(btrim(name)) between 2 and 80),
  website        text        check (website is null or length(website) <= 300),
  contact_email  text        not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists app.sponsor_booking (
  id               uuid        primary key default gen_random_uuid(),
  sponsor_id       uuid        not null references app.sponsor (id) on delete cascade,
  -- Always the first day of the month (UTC calendar month).
  month            date        not null check (month = date_trunc('month', month)::date),
  status           text        not null default 'held' check (status in ('held', 'paid', 'cancelled')),
  source           text        not null default 'dodo' check (source in ('dodo', 'invoice', 'comp')),
  -- Groups the months bought in one checkout; carried to Dodo in metadata.
  checkout_ref     uuid,
  hold_expires_at  timestamptz,
  amount_cents     integer     check (amount_cents is null or amount_cents >= 0),
  dodo_payment_id  text,
  needs_refund     boolean     not null default false,
  note             text        check (note is null or length(note) <= 500),
  created_at       timestamptz not null default now(),
  paid_at          timestamptz,
  updated_at       timestamptz not null default now()
);
-- The exclusivity rule: one live (held or paid) booking per month.
create unique index if not exists sponsor_booking_month_live_uidx
  on app.sponsor_booking (month) where status in ('held', 'paid');
create index if not exists sponsor_booking_sponsor_idx on app.sponsor_booking (sponsor_id);
create index if not exists sponsor_booking_checkout_idx on app.sponsor_booking (checkout_ref);
create index if not exists sponsor_booking_month_idx on app.sponsor_booking (month);

create table if not exists app.sponsor_creative (
  id           uuid        primary key default gen_random_uuid(),
  sponsor_id   uuid        not null references app.sponsor (id) on delete cascade,
  format       text        not null check (format in ('leaderboard', 'square', 'text')),
  -- image: an uploaded picture; designed: built from the fields below.
  -- A text creative is always 'designed'.
  mode         text        not null default 'designed' check (mode in ('image', 'designed')),
  image_url         text   check (image_url is null or length(image_url) <= 300),
  -- Leaderboard only: the 320×100 picture for phones.
  image_mobile_url  text   check (image_mobile_url is null or length(image_mobile_url) <= 300),
  logo_url     text        check (logo_url is null or length(logo_url) <= 300),
  headline     text        check (headline is null or length(headline) <= 60),
  body         text        check (body is null or length(body) <= 140),
  cta          text        check (cta is null or length(cta) <= 24),
  theme        text        not null default 'paper' check (theme in ('paper', 'navy', 'signal')),
  click_url    text        not null check (click_url ~* '^https://' and length(click_url) <= 500),
  alt          text        check (alt is null or length(alt) <= 140),
  status       text        not null default 'draft' check (status in ('draft', 'published', 'paused', 'rejected')),
  review_note  text        check (review_note is null or length(review_note) <= 500),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists sponsor_creative_sponsor_idx on app.sponsor_creative (sponsor_id, format, status);

create table if not exists app.sponsor_stat (
  creative_id  uuid    not null references app.sponsor_creative (id) on delete cascade,
  day          date    not null,
  impressions  integer not null default 0,
  clicks       integer not null default 0,
  primary key (creative_id, day)
);
