# dbms.md — Data model reference

**Status: historical + forward-looking.** CRM Analytics Academy is now a **static,
markdown-only site**. There is no database, no auth, and no server-side state — every
page is prerendered from `content/**`.

This file exists so nothing is lost. It records:

1. [What data the site used to collect](#1-what-data-the-site-collected) (the Supabase layer that was removed).
2. [The full legacy schema](#2-legacy-schema-13-tables), table by table.
3. [A single-table design](#3-the-single-table-design) that replaces all of it, if we ever want the
   dynamic features back on one Supabase project — one table, one index, one RLS policy set.
4. [Ready-to-run SQL](#4-sql-for-the-single-table) for that table.

---

## 1. What data the site collected

Everything the removed backend stored falls into six buckets:

| Bucket | What it was | Who wrote it | Who read it |
| --- | --- | --- | --- |
| **Identity** | A profile row per signed-in user (name, avatar, bio, LinkedIn, member/admin role) | Auto-created on signup by a DB trigger | The user, plus public read for comment/resource attribution |
| **Learning progress** | One row per (user, lesson) marked complete | The learner | The learner (dashboard, sidebar ticks, certificate eligibility) |
| **Assessment** | Quiz attempts: score, total, pass/fail, the submitted answers, per-skill breakdown | The learner (graded server-side) | The learner |
| **Credentials** | Issued certificates with a public verification code | The server, on eligibility | Anyone (public `/verify` lookup) |
| **User-generated content** | Lesson comments, feedback threads + admin replies, guestbook entries (text + PNG drawing), submitted resources, resource upvotes | Signed-in users | Public (after moderation), admins |
| **Authored content** | Blog posts, and a `sections`/`lessons` builder | Admins | Public |

Bucket 6 was already obsolete before this change: the Content Studio wrote real markdown
files to `content/`, so `posts`, `sections`, and `lessons` were dead tables. That data now
lives entirely in git, which is where it should have been all along.

### What survives the static rewrite

| Was in the DB | Now |
| --- | --- |
| Blog posts (`posts`) | `content/blog/*.md` — already true before this change |
| Lesson bodies, ordering, video, gating (`sections`, `lessons`) | `content/<locale>/<NN.module>/<NN.lesson>.md` frontmatter |
| Curated resources | A static array in `app/pages/resources.vue` |
| Everything else (progress, quizzes, comments, feedback, guestbook, certificates, profiles) | **Gone.** Nothing on the site reads or writes it anymore. |

---

## 2. Legacy schema (13 tables)

All tables lived in `public`, all had Row-Level Security enabled, and all user references
pointed at `auth.users(id)` or `public.profiles(id)`. Two helper functions backed the
policies: `is_admin()` (SECURITY DEFINER, checks `profiles.role = 'admin'`) and
`set_updated_at()`.

### profiles
One row per auth user, created by an `after insert on auth.users` trigger. A
`before update` trigger reverted any non-admin attempt to change `role`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | → `auth.users(id)` on delete cascade |
| `username` | `text` unique | |
| `full_name` | `text` | seeded from OAuth metadata |
| `avatar_url` | `text` | seeded from OAuth metadata |
| `bio` | `text` | |
| `linkedin_url` | `text` | added later, for resource attribution |
| `role` | `text` not null default `'member'` | check in (`member`, `admin`) |
| `created_at` / `updated_at` | `timestamptz` | |

### lesson_progress
| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | → `auth.users(id)` cascade |
| `lesson_path` | `text` | locale-stripped key, e.g. `/foundations/saql` |
| `completed_at` | `timestamptz` | |
| | | PK `(user_id, lesson_path)` |

### quiz_attempts
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` | → `auth.users(id)` cascade |
| `quiz_id` | `text` | the lesson key |
| `score` / `total` | `integer` | |
| `passed` | `boolean` not null default false | |
| `answers` | `jsonb` | the learner's submitted choices |
| `skills` | `jsonb` | per-skill-area correct/total |
| `created_at` | `timestamptz` | |

Index: `(user_id, quiz_id)`.
Answers themselves were never in the DB — they lived in lesson frontmatter and were only
ever read server-side, so the browser never received the key.

### certificates
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `code` | `text` unique | public verification code |
| `user_id` | `uuid` | → `profiles(id)` on delete set null |
| `name` | `text` not null | name printed on the certificate |
| `course` | `text` not null default `'CRM Analytics Foundations'` | |
| `avg_score` | `int` | |
| `issued_at` | `timestamptz` | |

Index on `code`. Publicly selectable — that's how `/verify` worked.
Issuance rule: every section complete **and** average best-attempt score ≥ 75.

### comments
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` not null | → `profiles(id)` cascade (FK to profiles, not auth.users, so the author could be embedded in one query) |
| `page_path` | `text` not null | full localized route |
| `body` | `text` not null | check length 1–4000 |
| `parent_id` | `uuid` | → `comments(id)` cascade — one level of threading |
| `created_at` | `timestamptz` | |

Index: `(page_path, created_at)`. Public read; insert as self; delete own or admin.

### feedback
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` | → `profiles(id)` set null |
| `subject` | `text` | |
| `message` | `text` not null | check length 1–5000 |
| `category` | `text` not null default `'general'` | check in (`general`, `bug`, `idea`, `content`, `other`) |
| `page_path` | `text` | where it was submitted from |
| `status` | `text` not null default `'open'` | check in (`open`, `resolved`) |
| `created_at` | `timestamptz` | |

Index: `(user_id, created_at)`. Readable by its author or an admin.

### feedback_replies
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `feedback_id` | `uuid` not null | → `feedback(id)` cascade |
| `user_id` | `uuid` | → `profiles(id)` set null |
| `body` | `text` not null | check length 1–5000 |
| `created_at` | `timestamptz` | |

Index: `(feedback_id, created_at)`. Visible to the thread owner and admins.

### guestbook
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` not null | → `profiles(id)` cascade |
| `name` | `text` | |
| `message` | `text` | check ≤ 2000 |
| `drawing` | `text` | **PNG data URL** — a base64 blob in a text column |
| `status` | `text` not null default `'visible'` | check in (`visible`, `hidden`) |
| `created_at` | `timestamptz` | |

Constraint `guestbook_has_content`: a non-empty message **or** a drawing.
Index: `(created_at desc)`.

> Storing drawings as base64 data URLs inline was the schema's worst decision — a single
> row could be hundreds of KB and every list query paid for it. If this comes back, put
> the PNG in Supabase Storage and keep only the object path here.

### resources
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` | → `profiles(id)` set null |
| `title` | `text` not null | |
| `url` | `text` not null | |
| `description` | `text` | |
| `category` | `text` | Docs / Learning / Books / Blogs / Tools / Community |
| `icon` | `text` | added later |
| `status` | `text` not null default `'pending'` | check in (`pending`, `approved`, `rejected`) |
| `created_at` | `timestamptz` | |

Public read was scoped to `status = 'approved'` by RLS.

### resource_votes
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `resource_id` | `uuid` not null | → `resources(id)` cascade |
| `user_id` | `uuid` not null | → `profiles(id)` cascade |
| `created_at` | `timestamptz` | |

Unique on `(resource_id, user_id)`. Indexes on both FKs.

### posts *(unused by app code)*
Mirrored the blog frontmatter 1:1 — `slug` (unique), `title`, `description`, `body`,
`cover_url`, `tags text[]`, `status` (draft/published), `published_at`, `is_external`,
`source_url`, `source_name`, `author_name`, `author_url`, `excerpt_only`, `created_by`,
`created_at`, `updated_at`. Constraint `posts_external_needs_source` required
`source_url` + `author_name` when `is_external`. Indexes on `(status, published_at desc)`
and `slug`. **Superseded by `content/blog/*.md`.**

### sections / lessons *(unused by app code)*
The retired "Learn builder". `sections`: `slug` (unique), `title`, `description`, `icon`,
`position`, `status`, audit columns. `lessons`: `section_id` → `sections(id)` cascade,
`slug`, `title`, `description`, `body`, `position`, `status`, `access`
(public/members), `video_id` / `video_start` / `video_end` (with a
`lessons_video_range` check), `quiz jsonb`, `pass_score int default 85`, audit columns.
Index: `(section_id, position)`. **Superseded by `content/<locale>/**.md` frontmatter.**

### projects *(dropped)*
A showcase table (`title`, `description`, `image_url`, `link`, `tags text[]`, `status`),
dropped in migration `20260705010000_drop_projects.sql`. Recorded here only so the name
isn't mistaken for something still live.

---

## 3. The single-table design

If the dynamic side ever comes back, **all thirteen tables collapse into one.** The
observation that makes it work: every table above is the same shape — *an actor produced a
record of some kind, attached to some subject, at some time, with a moderation state.*
The columns that differ between them are all optional metadata.

```
academy_records
├── who    → user_id
├── what   → kind        ('progress' | 'quiz' | 'comment' | 'feedback' | …)
├── where  → subject     (lesson path, page path, parent record id, …)
├── data   → payload jsonb
├── state  → status      ('active' | 'pending' | 'approved' | 'hidden' | …)
└── when   → created_at
```

### Mapping

| Legacy table | `kind` | `subject` | `payload` holds |
| --- | --- | --- | --- |
| `profiles` | `profile` | `null` | `username`, `full_name`, `avatar_url`, `bio`, `linkedin_url` |
| `lesson_progress` | `progress` | lesson path | `{}` (the row's existence *is* the fact) |
| `quiz_attempts` | `quiz` | lesson path | `score`, `total`, `passed`, `answers`, `skills` |
| `certificates` | `certificate` | verification code | `name`, `course`, `avg_score` |
| `comments` | `comment` | page path | `body`, `parent_id` |
| `feedback` | `feedback` | page path | `subject`, `message`, `category` |
| `feedback_replies` | `feedback_reply` | parent record id | `body` |
| `guestbook` | `guestbook` | `null` | `name`, `message`, `drawing_path` |
| `resources` | `resource` | category | `title`, `url`, `description`, `icon` |
| `resource_votes` | `vote` | resource record id | `{}` |

`role` moves out of the payload and onto its own column, because RLS has to read it on
every request and a jsonb lookup in a policy is both slow and easy to get wrong.

### Why one table is the right call here

- **Volume is tiny.** A learning site's entire write traffic is a few thousand rows. Any
  argument for splitting this into thirteen tables is an argument about a scale this
  project will not reach.
- **One RLS policy set instead of thirteen.** The removed schema had ~35 policies. Most
  bugs in it were policy bugs. One table means one place to get authorization right.
- **New features need no migration.** Adding, say, bookmarks is `kind = 'bookmark'`, not a
  new table plus policies plus a types regeneration.
- **The typed client stays honest.** One row type, discriminated on `kind` in TypeScript,
  rather than thirteen generated interfaces that drift from the SQL.

### What it costs

Be clear-eyed about the trade:

- **No per-kind constraints.** Postgres can't enforce "a quiz payload has an integer
  score" the way a typed column can. Validate in the server route, or add a `CHECK` with
  a `jsonb_typeof` guard per kind if it matters.
- **No real foreign keys between kinds.** `subject` pointing at another record's id is a
  convention, not a constraint. A `vote` can outlive its `resource`. Clean up in
  application code, or add a self-referencing `parent_id uuid references academy_records(id)`
  if you want the cascade back.
- **Queries read worse.** `where kind = 'quiz'` on every query is noise compared to
  `from quiz_attempts`. Wrap the common ones in views if it starts to hurt.

If the site ever grows past hobby scale, the first thing to split back out is
`progress` — it's the highest-write kind and the one most likely to want its own
composite primary key.

---

## 4. SQL for the single table

Idempotent, same style as the migrations that were removed. Paste into the Supabase
dashboard → SQL Editor → Run.

```sql
-- One table for every dynamic record on CRM Analytics Academy.
set check_function_bodies = off;

create table if not exists public.academy_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,

  -- What this row is. Add to the check list to add a feature.
  kind        text not null check (kind in (
                'profile', 'progress', 'quiz', 'certificate',
                'comment', 'feedback', 'feedback_reply',
                'guestbook', 'resource', 'vote'
              )),

  -- What it is attached to: a lesson path, a page path, a category,
  -- another record's id, or a certificate code. Null when global.
  subject     text,

  -- Moderation / lifecycle state. 'active' for things needing no review.
  status      text not null default 'active' check (status in (
                'active', 'pending', 'approved', 'rejected', 'hidden', 'resolved'
              )),

  -- Everything kind-specific.
  payload     jsonb not null default '{}'::jsonb,

  -- Hoisted out of payload: RLS reads this on every request.
  role        text not null default 'member' check (role in ('member', 'admin')),

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One profile per user; one progress row per (user, lesson); one vote per
-- (user, resource). Partial unique index — the other kinds stay unconstrained.
create unique index if not exists academy_records_unique_idx
  on public.academy_records (user_id, kind, coalesce(subject, ''))
  where kind in ('profile', 'progress', 'vote');

-- The two access patterns: "my stuff" and "this page's stuff".
create index if not exists academy_records_user_idx
  on public.academy_records (user_id, kind, created_at desc);
create index if not exists academy_records_subject_idx
  on public.academy_records (kind, subject, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so it can read the table regardless of RLS, which also
-- avoids the policies recursing into themselves.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.academy_records
    where user_id = auth.uid() and kind = 'profile' and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists academy_records_updated_at on public.academy_records;
create trigger academy_records_updated_at
  before update on public.academy_records
  for each row execute function public.set_updated_at();

-- Nobody escalates themselves to admin.
create or replace function public.guard_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists academy_records_guard_role on public.academy_records;
create trigger academy_records_guard_role
  before update on public.academy_records
  for each row execute function public.guard_role();

-- Auto-create the profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.academy_records (user_id, kind, payload)
  values (
    new.id,
    'profile',
    jsonb_build_object(
      'full_name',  coalesce(new.raw_user_meta_data ->> 'full_name',
                             new.raw_user_meta_data ->> 'name'),
      'avatar_url', coalesce(new.raw_user_meta_data ->> 'avatar_url',
                             new.raw_user_meta_data ->> 'picture')
    )
  )
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security — four policies, total.
-- ---------------------------------------------------------------------------
alter table public.academy_records enable row level security;

-- Read: your own rows, anything public-by-kind, or anything if admin.
drop policy if exists academy_records_select on public.academy_records;
create policy academy_records_select
  on public.academy_records for select
  using (
    auth.uid() = user_id
    or public.is_admin()
    or (kind = 'profile')
    or (kind = 'certificate')
    or (kind = 'comment'   and status = 'active')
    or (kind = 'guestbook' and status = 'visible')
    or (kind = 'resource'  and status = 'approved')
    or (kind = 'vote')
  );

-- Write: only as yourself, and never a kind the server owns.
drop policy if exists academy_records_insert on public.academy_records;
create policy academy_records_insert
  on public.academy_records for insert
  with check (
    auth.uid() = user_id
    and kind not in ('certificate')   -- issued server-side only
  );

drop policy if exists academy_records_update on public.academy_records;
create policy academy_records_update
  on public.academy_records for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists academy_records_delete on public.academy_records;
create policy academy_records_delete
  on public.academy_records for delete
  using (auth.uid() = user_id or public.is_admin());
```

After signing in once, make yourself admin:

```sql
update public.academy_records
   set role = 'admin'
 where kind = 'profile'
   and user_id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
```

### Example queries

```sql
-- My completed lessons
select subject from public.academy_records
 where user_id = auth.uid() and kind = 'progress';

-- Best score per quiz
select subject,
       max((payload ->> 'score')::numeric / nullif((payload ->> 'total')::numeric, 0)) as best
  from public.academy_records
 where user_id = auth.uid() and kind = 'quiz'
 group by subject;

-- Comments on a page, newest first
select payload ->> 'body' as body, created_at
  from public.academy_records
 where kind = 'comment' and subject = '/foundations/saql' and status = 'active'
 order by created_at desc;

-- Resource leaderboard
select r.id, r.payload ->> 'title' as title, count(v.id) as votes
  from public.academy_records r
  left join public.academy_records v
    on v.kind = 'vote' and v.subject = r.id::text
 where r.kind = 'resource' and r.status = 'approved'
 group by r.id
 order by votes desc;
```

---

## 5. If you bring this back

The static site has no Supabase dependency at all — no module, no env vars, no client. To
restore dynamic features you would need, in order:

1. Run the SQL above in a Supabase project.
2. `pnpm add @nuxtjs/supabase`, re-add it to `modules` in `nuxt.config.ts` with a
   `supabase: { url, key, redirect: false }` block reading `CRMA_SUPABASE_URL` /
   `CRMA_SUPABASE_ANON_KEY`.
3. Rebuild the server routes. They were thin: read the session with
   `serverSupabaseUser(event)` (note: it returns JWT *claims*, so the user id is `sub`,
   not `id` — that cost an afternoon the first time), then one query against
   `academy_records`.
4. Accept that pages doing authed fetches stop being prerenderable. That is the actual
   price of the feature, and it is why the site is faster without it.

Git history has the full original implementation if you want it back verbatim — the
Supabase removal commit is the one to revert.
