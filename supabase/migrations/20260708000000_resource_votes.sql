-- Resource upvotes
-- ----------------
-- Signed-in learners can upvote a community resource once (toggle). Vote
-- counts are public (readable by anon) so the resources page + leaderboard can
-- rank by popularity. One row per (resource, user); a unique constraint stops
-- ballot-stuffing. Deleting a resource or a profile cascades its votes away.
--
-- Idempotent: safe to re-run in the Supabase SQL editor.

create table if not exists public.resource_votes (
  id          uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (resource_id, user_id)
);

create index if not exists resource_votes_resource_idx on public.resource_votes (resource_id);
create index if not exists resource_votes_user_idx on public.resource_votes (user_id);

alter table public.resource_votes enable row level security;

drop policy if exists "Resource votes are public" on public.resource_votes;
create policy "Resource votes are public"
  on public.resource_votes for select using (true);

drop policy if exists "Users cast their own vote" on public.resource_votes;
create policy "Users cast their own vote"
  on public.resource_votes for insert with check (auth.uid() = user_id);

drop policy if exists "Users or admin remove a vote" on public.resource_votes;
create policy "Users or admin remove a vote"
  on public.resource_votes for delete
  using (auth.uid() = user_id or public.is_admin());

grant select on public.resource_votes to anon;
grant select, insert, delete on public.resource_votes to authenticated;
