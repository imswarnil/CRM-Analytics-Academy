# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CRM Analytics Academy** — a free, open-source learning site for Salesforce CRM Analytics (data prep, SAQL, dashboards, bindings, Einstein Discovery). Live at **crmanalytics.imswarnil.com** (deployed on **Vercel**). GitHub: **imswarnil/CRM-Analytics-Academy**.

Built on **Nuxt 4 + Nuxt Content 3 + Nuxt UI v4 + Tailwind CSS 4**, with **Supabase** for accounts/community and a **Gemini-backed AI chat** over the docs. Content is markdown-driven; most pages are generated from `content/`, not hand-written Vue routes.

## Commands

Package manager is **pnpm** (`packageManager: pnpm@11.9.0`). Do **not** use npm.

```bash
pnpm install        # deps (runs `nuxt prepare` via postinstall)
pnpm dev            # dev server → http://localhost:3000
pnpm build          # production build (also runs prerender)
pnpm preview        # preview the production build
pnpm lint           # eslint .   (run after editing)
pnpm typecheck      # nuxt typecheck (vue-tsc)  (run after editing)
```

There is **no test runner** — `lint` and `typecheck` are the only verification steps. Run both after edits. For anything with runtime behavior, also do a `pnpm build` (it catches SSR/prerender issues dev doesn't).

### ⚠️ Dev-server content database (common gotcha)
`@nuxt/content` (native SQLite connector) stores a dev DB at `.data/content/contents.sqlite`. It **frequently goes stale/corrupt** across restarts, producing `no such table: _content_docs` on server routes **and an empty docs navigation sidebar**. Fix = clean restart:

```bash
pkill -f "nuxt dev"; rm -rf .data && pnpm dev
```

If the docs nav or `/raw/*.md` ever looks empty/broken in dev, this is almost always the cause (the code is fine — it renders correctly on a clean build). See the `dev-reset` skill.

### Lint style (enforced)
`@nuxt/eslint` stylistic rules in `nuxt.config.ts`: **no comma-dangle**, **1tbs** brace style, 2-space indent. TypeScript interfaces: **one member per line, no comma/semicolon delimiter** between members (inline `{ a: X, b: Y }` on one line fails `member-delimiter-style`). `pnpm lint --fix` handles most issues.

## Architecture

### Content pipeline (the docs)
- `content/<locale>/<NN.module>/<NN.lesson>.md` — numeric prefixes set ordering; `.navigation.yml` per dir overrides `title`/`icon`. 8 locales: `en` (default, unprefixed) + `es fr de pt ja zh hi`.
- `content.config.ts` — the `docs` collection schema. Frontmatter supports: `title`, `description`, optional `links[]` (header buttons), **`access: 'members'`** (soft-gates the lesson), and **`quiz[]`** (`{ q, options[], answer }` — end-of-lesson quiz).
- `app/pages/[...slug].vue` — the single catch-all rendering any docs page (`docs` layout, `UPage`/`UContentToc`). It maps the localized route → content path, renders the body, and appends: members-gate, lesson progress, quiz, AI chat, and comments.
- `app/pages/index.vue` — landing page. Other top-level `app/pages/*.vue` are hand-written (about, resources, contribute, etc.).
- To add a lesson, add a markdown file under `content/` (see the `new-lesson` skill). Do **not** create a Vue file. New pages must be link-reachable from `/` to be prerendered (`nitro.prerender.crawlLinks`).

### AI chat ("CRM Analytics AI")
Q&A grounded in the docs. Defaults to the site's **Gemini** key (`gemini-2.0-flash`, `NUXT_GEMINI_API_KEY`, server-only) but supports **bring-your-own-key**: each visitor can pick a provider + model + paste their own key (no server storage).
- `server/utils/llm.ts` — multi-provider streaming (Gemini, OpenAI, Groq, OpenRouter, Anthropic). `fetchLlmStream()` fires the request; `sseToTextStream()` normalizes each provider's SSE into plain text.
- `server/api/chat.post.ts` — keyword-retrieves relevant docs sections (boosts the current page via `pagePath`), builds a docs-grounded system prompt, resolves provider/key (user's if supplied, else site Gemini), streams the answer. Maps upstream 401/403→"key rejected", 429→friendly rate-limit message.
- `app/composables/useAiSettings.ts` — the visitor's provider/model/key in localStorage (`AI_PROVIDERS` list). `app/components/AiSettings.vue` — the ⚙️ settings modal.
- `app/composables/useDocsChat.ts` — shared client controller. Enforces a **3-questions-per-session** cap (sessionStorage) **only when using the site's shared key**; a visitor's own key is uncapped.
- `app/components/AppChat.vue` — floating "Ask AI" widget (global, in `app.vue`).
- `app/components/DocsChat.vue` — inline per-lesson chat (renders before prev/next nav), passes the current page for on-topic answers.

### Supabase (accounts + community)
Uses the **`@nuxtjs/supabase`** module. **Google OAuth only.** Keys come from `CRMA_`-prefixed env (Vercel↔Supabase integration), mapped in the `supabase:` block of `nuxt.config.ts`. `redirect: false` (site is public; pages opt into auth). See `types/database.types.ts` + the `useDb()` typed-client wrapper.

- **Auth**: `app/pages/login.vue` (Google button), `app/pages/confirm.vue` (OAuth callback → detects session → redirects), `app/middleware/auth.ts` (per-page guard via `definePageMeta({ middleware: 'auth' })`), `app/components/AppUserMenu.vue` (header avatar menu, `ClientOnly`).
- **Composables**: `useDb()` = `useSupabaseClient<Database>()` (typed, RLS-scoped). `useProfile()` = current profile + `isAdmin` + `displayName` (shared `useState`).
- **Features**:
  - `LessonProgress.vue` — mark-as-complete (writes `lesson_progress`).
  - `LessonQuiz.vue` — renders `quiz` frontmatter, scores client-side, saves `quiz_attempts`.
  - `MembersGate.vue` — soft gate for `access: members` lessons (teaser + sign-in overlay; content is still in the page source).
  - `LessonComments.vue` — per-lesson comments (public read, auth to post, delete own/admin).
  - Submissions: `pages/submit/resource.vue`, `pages/submit/project.vue` → admin-moderated. Approved resources appear on `/resources`; approved projects on `/showcase`.
  - `pages/dashboard.vue` — progress, quizzes, and the user's submissions. `pages/profile.vue` — edit profile.
  - `pages/admin.vue` — moderation queue (admin-gated in UI). `server/api/admin/moderate.post.ts` — approve/reject, **service-role**, guarded by `server/utils/auth.ts requireAdmin()`.
- **Database**: `supabase/migrations/` — idempotent; all tables + RLS + `is_admin()` + auto-create-profile trigger + role-escalation guard. **Apply it manually** in the Supabase SQL Editor. Tables: `profiles`, `lesson_progress`, `quiz_attempts`, `resources`, `projects`, `comments`. `comments/resources/projects.user_id` FK → `profiles(id)` (enables author embedding).
- **Manual setup** required before it works end-to-end: run the migration; enable Google provider (Google Cloud OAuth client, redirect URI `https://<ref>.supabase.co/auth/v1/callback`); add app redirect URLs (`.../confirm`) + Site URL in Supabase; make yourself admin via SQL. See `supabase-setup` skill.

### Raw markdown + LLM/MCP surface
Same `docs` collection, three ways for AI agents:
- `server/routes/raw/[...slug].md.get.ts` — any page as raw markdown at `/raw/<path>.md`.
- `server/mcp/tools/{list-pages,get-page}.ts` — MCP tools (via `@nuxtjs/mcp-toolkit` / `defineMcpTool`).
- `nuxt-llms` (`llms:` in `nuxt.config.ts`) — generates `llms.txt` from `contentFilters` by path prefix. **When docs sections change, update these `sections`.**

### Theming & branding
- `app/app.config.ts` — runtime UI config (colors: `primary: salesforce`, `neutral: cloud`; header/footer/TOC links).
- `app/assets/css/main.css` — global CSS / Tailwind `@theme`.
- OG images: `nuxt-og-image` (`zeroRuntime`), template `app/components/OgImage/Docs.takumi.vue`.
- Ads: Google AdSense via `AdUnit.vue` (placements: headerBanner, endOfArticle, relatedPosts, sidebarSquare, footer).

## Environment variables

Local values live in a **gitignored `.env`** (`.env.example` documents the shape). On Vercel, set the same. Prefixes: `NUXT_*` map to runtimeConfig; `CRMA_*` are Supabase (from the Vercel integration).
- `NUXT_GEMINI_API_KEY` — server-only, AI chat.
- `CRMA_SUPABASE_URL`, `CRMA_SUPABASE_ANON_KEY` — public (browser client).
- `CRMA_SUPABASE_SERVICE_ROLE_KEY` — server-only (admin/moderation).

## Conventions
- Links: use `useLocalePath()` / `localePath('/path')` for internal links (i18n prefixing). New user-facing nav strings go in **all 8** `i18n/locales/*.json` (there's no message fallback).
- Auth-gated data: fetch client-side (RLS needs the user token); public data (approved submissions, comments) can SSR.
- Server auth: `requireUser(event)` / `requireAdmin(event)` from `server/utils/auth.ts`.
- Module warning `SUPABASE_SERVICE_KEY is deprecated` is non-blocking (still works).

## Notes
- Memory notes `project_crm_academy.md` and `supabase_platform.md` describe project context and required Supabase setup steps — verify against the actual files before relying on them.
