-- ===========================================================================
-- Guestbook — signed-in visitors leave a message and/or a small drawing.
-- Entries are auto-published (status 'visible'); an admin can hide or delete
-- anything. Server-side profanity check runs before insert (see
-- server/utils/profanity.ts). Mirrors the comments RLS conventions.
-- Apply manually in the Supabase SQL editor (idempotent).
-- ===========================================================================

create table if not exists public.guestbook (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  name       text,
  message    text check (message is null or char_length(message) <= 2000),
  drawing    text,  -- PNG data URL (optional)
  status     text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now(),
  -- must carry at least a message or a drawing
  constraint guestbook_has_content check (
    coalesce(char_length(trim(message)), 0) > 0 or drawing is not null
  )
);

create index if not exists guestbook_created_idx on public.guestbook (created_at desc);

alter table public.guestbook enable row level security;

-- Public sees visible entries; owner sees their own; admin sees all.
drop policy if exists "Visible guestbook entries are public" on public.guestbook;
create policy "Visible guestbook entries are public"
  on public.guestbook for select
  using (status = 'visible' or auth.uid() = user_id or public.is_admin());

-- Post as yourself, auto-published.
drop policy if exists "Users sign the guestbook" on public.guestbook;
create policy "Users sign the guestbook"
  on public.guestbook for insert
  with check (auth.uid() = user_id and status = 'visible');

-- Admin can hide/unhide (moderation).
drop policy if exists "Admin updates guestbook" on public.guestbook;
create policy "Admin updates guestbook"
  on public.guestbook for update using (public.is_admin());

drop policy if exists "Owner or admin deletes guestbook" on public.guestbook;
create policy "Owner or admin deletes guestbook"
  on public.guestbook for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------
grant select on public.guestbook to anon;
grant select, insert, update, delete on public.guestbook to authenticated;
