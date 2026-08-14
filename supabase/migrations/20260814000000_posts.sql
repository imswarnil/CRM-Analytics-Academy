-- Blog / curated posts
-- ---------------------
-- Two kinds of post live in this one table:
--
--   1. Original posts written in the admin editor (is_external = false).
--   2. Curated posts that were first published somewhere else
--      (is_external = true). Those MUST carry attribution: the original
--      author, the publication, and the canonical URL back to the source.
--
-- For curated posts we default to storing an EXCERPT rather than the full
-- article (excerpt_only = true) and always render a visible credit line plus a
-- rel="canonical" pointer, so we never present someone else's work as ours and
-- never compete with the original in search.
--
-- Admin-only writes; anonymous reads are limited to published rows. Idempotent.

create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  description    text,
  -- Markdown. For curated posts this is the excerpt/summary we are allowed to
  -- show, not a copy of the full source article.
  body           text,
  cover_url      text,
  tags           text[] not null default '{}',

  status         text not null default 'draft' check (status in ('draft', 'published')),
  published_at   timestamptz,

  -- Attribution for curated / syndicated content.
  is_external    boolean not null default false,
  source_url     text,
  source_name    text,
  author_name    text,
  author_url     text,
  excerpt_only   boolean not null default true,

  created_by     uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- An external post is only publishable if we can point back at the original.
alter table public.posts drop constraint if exists posts_external_needs_source;
alter table public.posts add constraint posts_external_needs_source
  check (not is_external or (source_url is not null and author_name is not null));

create index if not exists posts_status_published_idx
  on public.posts (status, published_at desc);
create index if not exists posts_slug_idx on public.posts (slug);

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Published posts are public" on public.posts;
create policy "Published posts are public"
  on public.posts for select
  using (status = 'published' or public.is_admin());

drop policy if exists "Admins insert posts" on public.posts;
create policy "Admins insert posts"
  on public.posts for insert
  with check (public.is_admin());

drop policy if exists "Admins update posts" on public.posts;
create policy "Admins update posts"
  on public.posts for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete posts" on public.posts;
create policy "Admins delete posts"
  on public.posts for delete
  using (public.is_admin());

grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
