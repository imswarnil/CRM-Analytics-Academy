# How CRM Analytics Academy works

A field guide to the whole project — what runs where, how a request becomes a
page, and how each feature is wired together. See `CLAUDE.md` for the terse
build-instructions version of this; this doc is the narrative walkthrough.

## 1. The stack, in one paragraph

**Nuxt 4** (Vue 3) renders the site. **Nuxt Content 3** turns markdown files
in `content/` into pages at build/dev time. **Nuxt UI v4** + **Tailwind CSS
4** provide the design system (Salesforce-flavored theme). **Supabase**
(Postgres + Auth) is the only backend — there is no separate API server.
Everything server-side lives in Nitro server routes under `server/`, which
run as Vercel serverless functions in production. **pnpm** is the package
manager; there's no test runner, so `pnpm lint` + `pnpm typecheck` + `pnpm
build` are the verification gates.

One fact shapes a lot of the architecture: **Vercel's filesystem is
read-only at runtime**, and Nuxt Content compiles markdown **at build time**,
not at request time. So markdown content is fast and cacheable, but nothing
running in production can create or edit a `.md` file. Anything that needs
to change after deploy without a git push — user accounts, comments, quiz
attempts, moderation queues — lives in Supabase instead. Content authoring
itself stays entirely file-based (see §2); the write path for those files
just happens locally, not in production (see §2c).

## 2. Content (`content/`)

### 2a. Docs — the curriculum

```
content/<locale>/<NN.module>/<NN.lesson>.md
```

- 8 locales: `en` (default, unprefixed) + `es fr de pt ja zh hi`.
- Numeric prefixes (`3.creating-datasets`, `4.grain-lookups-and-joins.md`)
  set both the on-disk sort order and the site navigation order.
- Each module folder has a `.navigation.yml` with `title`/`icon`, overriding
  the folder name in the sidebar.
- `content.config.ts` defines the `docs` collection schema: `title`,
  `description` (built into Nuxt Content's `page` type), plus custom fields —
  `links[]` (header buttons), `access: 'members'` (soft content gate),
  `video` (a YouTube clip: id/start/end), `quiz[]` (end-of-lesson question
  pool), `passScore`, `interview[]` (Q&A shown before the quiz).
- **One Vue file renders every docs page**: `app/pages/[...slug].vue`. It
  maps the localized route to a content path, fetches the page via
  `queryCollection('docs')`, and renders: breadcrumb → header → video embed →
  `ContentRenderer` (the markdown body) → members-gate → interview prep →
  quiz → mark-as-complete → comments → prev/next surround links. It also
  builds `TechArticle` + `BreadcrumbList` (+ `VideoObject`/`FAQPage` when
  applicable) JSON-LD for SEO.
- To add a lesson you add a markdown file — never a `.vue` file. New pages
  must be reachable by a link from `/` or they won't get prerendered
  (`nitro.prerender.crawlLinks`).
- Reusable content components available inside the markdown body via MDC
  syntax: `::note`, `::tip`, `::lesson-cards`, `::lesson-links`,
  `::lesson-steps`.
- Same collection is also exposed to AI agents/crawlers: any page as raw
  markdown at `/raw/<path>.md` (`server/routes/raw/[...slug].md.get.ts`), and
  `llms.txt` is generated from it via the `nuxt-llms` module
  (`llms:` block in `nuxt.config.ts` — update `sections` there when docs
  sections change).

### 2b. Blog (`content/blog/`)

Also markdown, but **not** locale-prefixed — one collection, `blog`, sourced
from `content/blog/**` (excluded from the `docs` collection so the two don't
double-ingest each other). Frontmatter:

- `title`, `description`, `coverUrl`, `tags[]`, `status` (`draft`/
  `published` — drafts are simply excluded from the index/detail query, no
  special build step), `publishedAt`.
- `isExternal` marks a **curated** post — pointing at someone else's article.
  Curated posts *require* `sourceUrl` + `authorName` (validated in the
  authoring UI), render a visible credit line, and set `rel="canonical"`
  back to the original so this site doesn't compete with the source in
  search. `excerptOnly` (default `true`) means: host a summary here, link
  out for the full piece.
- Public pages: `app/pages/blog/index.vue` (tag-filterable list) and
  `app/pages/blog/[slug].vue` (detail — 404s if the slug is missing or still
  a draft), both querying the `blog` collection directly with
  `queryCollection`.
- A Supabase `posts` table still exists from an earlier design but is no
  longer read or written by the app — left in place, unused, non-destructive.

### 2c. Content Studio — the authoring tool (`pages/admin/studio.vue`)

The **only** content-authoring tool in the app (an earlier DB-backed "Learn"
builder was tried and retired — see §2d). It's a GUI that writes real
markdown files into `content/en/<module>/<lesson>.md` and
`content/blog/<slug>.md`, structurally identical to what you'd get hand-
writing them — same `.navigation.yml` convention, so a section/lesson
created here is indistinguishable from one in `content/en/1.foundations`:
same navigation, same rendering, same URLs, same prerendering. No
special-casing needed anywhere else in the app.

- `server/utils/studio.ts` — path-traversal-safe helpers (`safeContentPath`,
  `safeSegment`), YAML frontmatter parse/stringify, numeric-prefix
  parsing/slugify.
- `server/api/admin/studio/{tree,node,reorder}.*.ts` — all admin-gated
  (`requireAdmin`); every *write* endpoint additionally calls
  `requireLocalDev()`, which 403s outright when `NODE_ENV === 'production'`
  (i.e. on Vercel) with a message pointing back at running `pnpm dev`
  locally — because of the read-only-filesystem fact from §1. `GET tree`
  walks `content/en/**` and `content/blog/*` **live off disk on every
  request** — there's no cache and no explicit "sync" action; a file you
  hand-edited five seconds ago just shows up.
- `pages/admin/studio.vue` — two-pane UI: a tree (sections → lessons, plus a
  Blog branch) with create/rename/delete/reorder controls, and an editor
  panel with real form fields for the common frontmatter (access, video
  clip, blog attribution) plus a raw YAML textarea for the rest
  (quiz/interview/passScore/links) and a toolbar that inserts the
  `::note`/`::tip`/`::lesson-cards`/etc. snippets at the cursor. Shows a
  read-only banner and disables writes when the API reports it isn't running
  locally.
- **Workflow**: run `pnpm dev` → open `/admin/studio` → create/arrange/edit
  → the files land on disk under `content/` exactly as if you'd typed them
  by hand → `git add`, commit, push → Vercel builds them in like any other
  markdown change.

### 2d. What happened to the DB-backed "Learn" builder

An earlier iteration tried storing curriculum in Supabase (`sections` +
`lessons` tables, `pages/admin/content.vue`, public `pages/learn/*`) so it
could be published without a redeploy. It was retired: merging it into the
same navigation as the file-based docs would have made the build-time
crawler prerender those pages as static HTML too, which defeats the entire
point of a DB-backed system (new content wouldn't actually go live until the
next deploy). Rather than build workarounds for that conflict, the DB
approach was dropped in favor of Content Studio (§2c) — publishing still
requires a commit + push, same as always, but there's now a GUI for it and
one single authoring path instead of two. The `sections`/`lessons` tables
still exist in Supabase but are unused by the app.

## 3. Accounts and data (Supabase)

`@nuxtjs/supabase` module, keys from `CRMA_`-prefixed env vars (the
Vercel↔Supabase integration maps these; locally they live in a gitignored
`.env`). `redirect: false` — the site is public by default, individual pages
opt into requiring auth via `definePageMeta({ middleware: 'auth' })`
(`app/middleware/auth.ts`).

**Auth methods**: Google OAuth + email/password.
- `pages/login.vue` — one screen, three modes (`signin`/`signup`/`forgot`)
  plus the Google button.
- `pages/confirm.vue` — lands after OAuth or an email-confirmation link,
  detects the session, redirects.
- `pages/reset-password.vue` — the password-recovery landing page.
- Signup silently no-ops (rather than erroring) when the email is already
  registered — Supabase returns an empty `identities` array in that case,
  which the page detects, specifically to avoid leaking which addresses
  already have accounts.

**Composables**: `useDb()` = typed, RLS-scoped Supabase client
(`useSupabaseClient<Database>()`). `useProfile()` = the current user's
profile + `isAdmin` + `displayName` (shared `useState`, so it doesn't
re-fetch on every component).

**Server-side auth** (`server/utils/auth.ts`):
- `getUserId(event)` — the signed-in user's id or `null`, never throws.
- `requireUser(event)` — 401s if not signed in.
- `requireAdmin(event)` — 401/403s unless the caller's `profiles.role` is
  `admin`; returns a **service-role** client for the privileged operation
  that bypasses RLS.

**Tables** (`supabase/migrations/`, applied by hand in the Supabase SQL
editor — there's no migration runner):
`profiles`, `lesson_progress`, `quiz_attempts`, `resources`, `projects`,
`comments`. `posts` and `sections`/`lessons` also exist but are unused by
the app (kept, not dropped, from earlier iterations — see §2b, §2d). All
tables have RLS, an `is_admin()` helper, an auto-create-profile trigger, and
a role-escalation guard so a regular user can't promote themselves to admin.

**Features built on this layer**:
- `LessonProgress.vue` — mark-as-complete, writes `lesson_progress`.
- `LessonQuiz.vue` — renders a lesson's `quiz` frontmatter, grades via
  `server/api/quiz.post.ts` (which uses `server/utils/quiz-source.ts` to
  resolve the quiz pool from the `docs` collection by path — answers never
  reach the client), saves `quiz_attempts`.
- `MembersGate.vue` — soft gate for `access: members` content: content is
  still present in the page source (nothing to leak), but logged-out readers
  see a teaser + sign-in prompt over it.
- `LessonComments.vue` — per-lesson comments; public read, sign-in to post,
  delete own or (as admin) anyone's.
- Submissions: `pages/submit/resource.vue` → moderated at
  `pages/admin/index.vue`'s queue, approved resources show up on
  `/resources`.
- `pages/dashboard.vue` — a user's own progress, quiz history, and
  submissions. `pages/profile.vue` — edit profile.
- `pages/certificate.vue` + `server/api/certificate.get.ts` +
  `server/api/verify-certificate.get.ts` — issues and publicly verifies
  completion certificates.
- `pages/feedback.vue` / `pages/guestbook.vue` — lightweight community
  features, each with its own small API + admin moderation surface
  (`server/api/feedback/*`, `server/api/guestbook/*`).
- `pages/admin/index.vue` — the admin home: moderation queue + overview
  stats, and the entry point into Content Studio (§2c) for authoring.
- Generic admin data management (`server/api/admin/{mutate,overview,queue,
  records,moderate}.*.ts`) backs `AdminDataManager.vue` — approve/reject/
  edit/delete rows across `resources`, `comments`, `feedback`, `guestbook`,
  `profiles`, `resource_votes` from one browser.

## 4. Request lifecycle, top to bottom

A docs page (`crmanalytics.imswarnil.com/setup/licenses-and-permission-sets`):

1. **Build time** (Vercel): `nuxt build` runs Nuxt Content's build step,
   which parses every file under `content/` into a queryable collection and
   prerenders every page reachable by crawling links from `/`
   (`nitro.prerender.crawlLinks`). Nitro also builds the serverless
   functions from `server/`.
2. **Request**: Vercel serves the prerendered HTML for that route if it was
   crawled; otherwise (or for anything dynamic) a Nitro function handles it.
3. `app/pages/[...slug].vue` resolves the route to a content path
   (`routeToContentPath`, aware of the 8 locale codes), queries the `docs`
   collection, and — if the locale-specific page doesn't exist yet — falls
   back to the English version rather than 404ing a reader whose language
   switcher points somewhere untranslated.
4. Client-side: `useSupabaseUser()` determines whether `MembersGate` should
   lock the content; `LessonQuiz`/`LessonProgress`/`LessonComments` each
   independently call their own `/api/*` route, all of which go through
   `requireUser`/`requireAdmin` server-side and Postgres RLS.

## 5. i18n

`i18n/locales/*.json`, one JSON per locale, no fallback — every user-facing
nav string has to be added to **all 8** files or a locale will show a raw
translation key. Internal links must go through `useLocalePath()`/
`localePath('/path')` so the locale prefix is applied correctly (the default
`en` locale is unprefixed; others aren't).

## 6. Theming, SEO, ads

- `app/app.config.ts` — Nuxt UI runtime config: `primary: salesforce`,
  `neutral: cloud`, header/footer/TOC links.
- `app/assets/css/main.css` — global CSS + Tailwind `@theme`.
- OG images generated per-page via `nuxt-og-image` (`zeroRuntime` — computed
  at build, not per-request) using the `OgImage/Docs.takumi.vue` template.
- `AdUnit.vue` renders Google AdSense at named placements (`headerBanner`,
  `endOfArticle`, `relatedPosts`, `sidebarSquare`, `footer`); docs pages also
  auto-inject an ad between body sections (`injectInArticleAds`).

## 7. Environment & commands

Local secrets live in a gitignored `.env` (`.env.example` documents the
shape); the same variables are set on Vercel. `NUXT_*` → `runtimeConfig`;
`CRMA_*` → Supabase (public: `CRMA_SUPABASE_URL`/`CRMA_SUPABASE_ANON_KEY`;
server-only: `CRMA_SUPABASE_SERVICE_ROLE_KEY`).

```bash
pnpm install        # deps
pnpm dev             # dev server
pnpm build           # production build + prerender
pnpm preview         # preview the production build
pnpm lint            # eslint . (run after every edit)
pnpm typecheck       # nuxt typecheck
```

No test runner exists — lint + typecheck + a real `pnpm build` are the only
verification available, so a `pnpm build` is worth running for anything with
runtime (not just type-level) behavior, since it catches SSR/prerender
issues dev mode doesn't.

**Common gotcha**: `@nuxt/content`'s dev-mode SQLite cache
(`.data/content/contents.sqlite`) goes stale across restarts — symptoms are
an empty docs nav sidebar or `no such table: _content_docs`. Fix:
`pkill -f "nuxt dev"; rm -rf .data && pnpm dev` (see the `dev-reset` skill).
