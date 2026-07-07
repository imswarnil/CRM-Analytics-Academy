-- Certificates
-- ------------
-- When a learner becomes eligible, we mint ONE immutable certificate row with a
-- public verification code. The code, holder name, course, score, and issue
-- date are snapshotted at issue time and never change — so a downloaded or
-- shared certificate can always be validated at /verify by its code.
--
-- Issuance + verification both run server-side with the service role; RLS keeps
-- direct table reads scoped to the owner (or admin). Idempotent.

create table if not exists public.certificates (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  user_id    uuid references public.profiles (id) on delete set null,
  name       text not null,
  course     text not null default 'CRM Analytics Foundations',
  avg_score  int,
  issued_at  timestamptz not null default now(),
  unique (user_id, course)
);

create index if not exists certificates_code_idx on public.certificates (code);

alter table public.certificates enable row level security;

drop policy if exists "Owners or admin read certificates" on public.certificates;
create policy "Owners or admin read certificates"
  on public.certificates for select
  using (auth.uid() = user_id or public.is_admin());

grant select on public.certificates to authenticated;
