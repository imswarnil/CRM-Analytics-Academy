-- ===========================================================================
-- Feedback + threaded replies
--   feedback          — a message from a signed-in user (private to them + admin)
--   feedback_replies  — a two-way thread: the owner and admins can reply
-- Mirrors the RLS conventions used by resources/comments in the init migration.
-- Apply manually in the Supabase SQL editor (idempotent).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- feedback
-- ---------------------------------------------------------------------------
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  subject    text,
  message    text not null check (char_length(message) between 1 and 5000),
  category   text not null default 'general' check (category in ('general', 'bug', 'idea', 'content', 'other')),
  page_path  text,
  status     text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_idx on public.feedback (user_id, created_at);

alter table public.feedback enable row level security;

drop policy if exists "Owner or admin reads feedback" on public.feedback;
create policy "Owner or admin reads feedback"
  on public.feedback for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users submit their own feedback" on public.feedback;
create policy "Users submit their own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admin updates feedback" on public.feedback;
create policy "Admin updates feedback"
  on public.feedback for update using (public.is_admin());

drop policy if exists "Owner or admin deletes feedback" on public.feedback;
create policy "Owner or admin deletes feedback"
  on public.feedback for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- feedback_replies  (owner-of-thread and admins can both post)
-- ---------------------------------------------------------------------------
create table if not exists public.feedback_replies (
  id          uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback (id) on delete cascade,
  user_id     uuid references public.profiles (id) on delete set null,
  body        text not null check (char_length(body) between 1 and 5000),
  created_at  timestamptz not null default now()
);

create index if not exists feedback_replies_thread_idx on public.feedback_replies (feedback_id, created_at);

alter table public.feedback_replies enable row level security;

-- Visible to whoever can see the parent feedback (its owner, or any admin).
drop policy if exists "Thread participants read replies" on public.feedback_replies;
create policy "Thread participants read replies"
  on public.feedback_replies for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.feedback f
      where f.id = feedback_id and f.user_id = auth.uid()
    )
  );

-- Post as yourself, only on a thread you own (or as an admin on any thread).
drop policy if exists "Owner or admin posts replies" on public.feedback_replies;
create policy "Owner or admin posts replies"
  on public.feedback_replies for insert
  with check (
    auth.uid() = user_id
    and (
      public.is_admin()
      or exists (
        select 1 from public.feedback f
        where f.id = feedback_id and f.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Author or admin deletes replies" on public.feedback_replies;
create policy "Author or admin deletes replies"
  on public.feedback_replies for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Privileges (RLS still governs row access). Feedback is private — no anon read.
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.feedback, public.feedback_replies to authenticated;
