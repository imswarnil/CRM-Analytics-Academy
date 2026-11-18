-- 2026-11-18: product reviews. Additive and idempotent.

-- Product reviews (2026-11-18): one star rating + short text per person per
-- product ('notes' today). Public: name and avatar only.
create table if not exists app.review (
  id          bigserial primary key,
  product     text        not null check (product ~ '^[a-z0-9-]{1,40}$'),
  user_id     text        not null,
  rating      smallint    not null check (rating between 1 and 5),
  body        text        not null check (char_length(body) between 10 and 1000),
  status      text        not null default 'visible' check (status in ('visible', 'hidden')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product, user_id)
);
create index if not exists review_product_idx on app.review (product, status, created_at desc);
