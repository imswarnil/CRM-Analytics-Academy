# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CRM Analytics Academy** — a free, open-source learning site for Salesforce CRM Analytics (data prep, SAQL, dashboards, bindings, Einstein Discovery, GTM dashboards). Live at **crmanalytics.imswarnil.com**, hosted on **Cloudflare Workers** (prerendered pages served as static assets, a small Worker for the dynamic routes) and deployed by GitHub Actions (`deploy-cloudflare.yml`). GitHub: **imswarnil/CRM-Analytics-Academy**.

Built on **Nuxt 4 + Nuxt Content 3 + Nuxt UI v4 + Tailwind CSS 4**, styled in the Blueprint design system. It is a **markdown-driven site**: every docs page is prerendered at build time from `content/`. On top sits a small dynamic layer — **Neon Postgres + Neon Auth (better-auth)** — for accounts, the learner dashboard (progress, streaks, bookmarks, quizzes, badges, leaderboard), comments, community submissions, first-party analytics and the admin console. Server code is in `server/api/**` and `server/utils/**`; the whole schema is `server/db/schema.sql`.

**A GTM SaaS product (2026-11-17) — `shared/utils/products.ts` (`PLANS`, data-driven; /pro renders it).** B2C: **Free** (`access: free`, the default — public, AdSense ads), **Pro Monthly** $15/mo (Stripe subscription → `app.subscription`, managed in the Stripe customer portal) and **Pro Lifetime** $99 once (Stripe payment → `app.entitlement` product `lifetime`; a full refund removes it). B2B: **Teams & institutions** — seats for companies, colleges and teams, sold through a short request on /pro (`POST /api/leads`, product `seats` → Salesforce) → the owner creates the org in /admin → Teams (`app.org`, join code, optional email domain for colleges) → members join at `/team`. `accessFor(userId)` in `server/utils/entitlement.ts` is the one definition of Pro (entitlement OR active subscription OR an active org seat, one query); `canOpen(held, needs)` compares. Pro members see no ads (the `crma_pro` hint cookie, set from /api/progress). Stripe runs over fetch (`server/utils/stripe.ts`), prices by lookup_key `crma_pro_monthly` / `crma_pro_lifetime` (`pnpm stripe:setup --webhook` also creates the customer portal; webhook events `checkout.session.completed`, `customer.subscription.updated/deleted`, `charge.refunded`). Points are gamification only. **Retired:** the YouTube-subscriber tier (2026-11-17), sponsors, the reading meter, section waitlists, page-view analytics, the visualisers and /course (2026-11-16). Schema changes: `server/db/cleanup-2026-11-16.sql`, `server/db/migrate-2026-11-17.sql`. **The curriculum restarts from scratch:** `content/<locale>/` holds only `exam/` and `interview-questions/` until new sections are written; `CURRICULUM.md` is still the plan. YouTube channel: `SITE.youtube` = https://www.youtube.com/@crmanalyticsacademy.

## Commands

Package manager is **pnpm** (`packageManager: pnpm@11.9.0`). Do **not** use npm.

```bash
pnpm install          # deps (runs `nuxt prepare` via postinstall)
pnpm dev              # dev server → http://localhost:3000
pnpm build            # scripts/prebuild.mjs (translate locally → lesson meta → search/llms/raw) → nuxt build
pnpm preview          # build WITHOUT translating, then run the Worker bundle locally (wrangler dev)
pnpm preview:last     # serve the last build again, no rebuild
pnpm translate        # translate changed English via the local LibreTranslate (see below)
pnpm translate:setup  # once: install LibreTranslate + models into .libretranslate/
pnpm new-lesson       # scaffold a lesson: numbered file, full frontmatter, free/pro, quiz stubs
pnpm lesson:check     # numbering, frontmatter, quiz answers, internal links
pnpm lint             # eslint .   (run after editing)
pnpm typecheck        # nuxt typecheck (vue-tsc)  (run after editing)
```

There is **no test runner** — `lint` and `typecheck` are the only verification steps. For anything with runtime behaviour, also do a `pnpm build` (`SKIP_TRANSLATE=1 pnpm build` skips translation).

### ⚠️ Dev-server content database (common gotcha)
`@nuxt/content` (native SQLite connector) stores a dev DB at `.data/content/contents.sqlite`. It **frequently goes stale/corrupt** across restarts, producing `no such table: _content_docs` and an empty docs sidebar. Fix: `pkill -f "nuxt dev"; rm -rf .data && pnpm dev` (the `dev-reset` skill). New Tailwind arbitrary classes sometimes need a dev restart too.

### ⚠️ Build traps (each one took the deploy down once)
- **`h3` must be 1.x everywhere.** `h3` is a direct dependency and aliased in `nuxt.config.ts` (`alias.h3`) because modules that import it without declaring it get whatever pnpm hoists.
- **Prerender memory.** `server/plugins/devtools-plugin-leak.ts` empties `__VUE_DEVTOOLS_PLUGINS__` after each response. Redirect sources and double-locale paths are in `nitro.prerender.ignore`. `/raw/**/*.md`, `llms.txt` and `llms-full.txt` are written as static files by `scripts/build-search-index.mjs`, never prerendered.
- **Translated UI strings are validated.** `translate.mjs` refuses a message that does not compile, adds `<`, `@`, `|` or `$`, or changes `{placeholders}`. Keep symbols out of translatable strings.

### Lint style (enforced)
`@nuxt/eslint` stylistic rules: **no comma-dangle**, **1tbs**, 2-space indent. TS interfaces: **one member per line, no delimiter**. `pnpm lint --fix` handles most issues.

## Architecture

### Content pipeline
- `content/<locale>/<NN.module>/<NN.lesson>.md` — numeric prefixes are **always two digits** (they sort as strings). `.navigation.yml` per dir sets `title`/`icon`. 12 locales: `en` (default, unprefixed) + `es fr de pt ja zh hi ar ru bn ur`; `ar`, `ur` are RTL. **Only `content/en/` is written by hand.** Renaming a file means renaming it in every locale and remapping its `<locale>:<path>` keys in `.translation-manifest.json`.
- `content.config.ts` — collections `docs`, `resources`, `people`. `comingSoon: true` marks a section placeholder: it stays in the sidebar, curriculum and llms.txt, but `useCourse()` leaves it out of the course order and progress, and the lesson page hides mark-complete and the timeline. Publishing a section = add its lessons and delete `comingSoon` from its index. Lesson frontmatter: `title`, `description`, `links[]`, `video` (`{ id, start?, end?, title?, author?, authorUrl? }` — a **YouTube** id on the English lesson; translations borrow it), `walkthrough` (recording script), `interview[]`, `quiz[]`, `authors[]`, `credits[]`.
- `app/pages/[...slug].vue` renders any lesson (player chrome, YouTube video, walkthrough, body, quiz, interview, credits, comments, Save-for-later) and falls back to English when a locale is untranslated.
- `app/data/lesson-meta.json` (minutes / video-or-article / quiz per route) is generated by `scripts/lesson-meta.mjs` (run by `pnpm build`) and read via `useLessonMeta()`.
- **Editing**: **Nuxt Studio** at `/_studio` (GitHub OAuth app; secrets `STUDIO_GITHUB_CLIENT_ID/SECRET`) commits markdown to `main`. There is no other CMS and no in-app content editor.
- **People and credits**: `content/people/<slug>.yml`; lesson `authors` (default `swarnil-singhai`) and `credits` on the English file only (`useLessonCredits`). Everyone appears on `/instructors`. The author portrait is `public/people/swarnil-singhai.jpg` (`AUTHOR.avatar` in `app/data/author.ts`).
- New pages must be link-reachable from `/` to be prerendered (`crawlLinks`).

### Static-first constraints
- Curriculum pages stay prerendered and must not gain fetches that can't run at build time. Dynamic behaviour belongs on `/dashboard`, `/submit`, `/admin`, `/api/**` (`PRIVATE_PATHS` in `nuxt.config.ts`, never prerendered).
- `nitro.preset: 'cloudflare_module'`; `wrangler.jsonc` serves `.output/public`; only misses reach the Worker. Auth is resolved server-side per request (`server/utils/auth.ts`).
- ⚠️ **The Worker has no content database.** Any `queryCollection*` that runs on the Worker fails and logs one error *per content row* — that once used 90% of the daily Workers Logs allowance. Content queries are guarded with `import.meta.server && !import.meta.prerender && !import.meta.dev` (app.vue, error.vue, `[...slug].vue`, `interview-questions/[slug].vue`): unknown lesson/question URLs answer 404 before querying. Keep that guard on any new content page. Workers Logs is sampled at 10% (`head_sampling_rate` in `wrangler.jsonc`).
- **Keep Worker work small.** The session is only fetched when the `crma_signed_in` hint cookie exists (`useAuth().restoreSession()`), so anonymous visitors and crawlers cost no `/api/auth/get-session`; private pages still check every time via the `auth` middleware.

### LLM surface
- `scripts/build-search-index.mjs` writes `public/llms.txt` (what the course is, how to take it, every section and lesson **in learning order** with raw links), `public/llms-full.txt` (that plus every lesson's markdown, in order), `public/<locale>/llms.txt`, `public/raw/**` and the ⌘K search + MCP indexes. Sections come from the folder order — nothing to register.
- `server/routes/mcp.{get,post}.ts` — read-only MCP at `/mcp` over `public/ask-index.json`.

### Translation (local LibreTranslate)
English is the source of truth; the other 11 locales are generated **on this machine** and committed.
- `scripts/libretranslate.sh` — installs LibreTranslate (Python 3.11 via `uv`) and its models into `.libretranslate/` (gitignored), and `run`s a command with the server on 127.0.0.1:5055, stopping it afterwards.
- `pnpm translate` = `libretranslate.sh run -- node scripts/translate.mjs`; `pnpm build` calls it first unless `CI` or `SKIP_TRANSLATE` is set. CI never translates.
- `scripts/translate.mjs` (driver, incremental), `scripts/markdown-protect.mjs` (**read its header before touching it**), `scripts/i18n.config.mjs` (locale map: `zh-Hans`, `pt`), `.translation-manifest.json` (hashes of the English source).
- **Never hand-edit a translation.** Everything not English comes from LibreTranslate; fix the English source and re-run. `options` lists (quiz/exam answers) are translated too.

### Interview questions, practice exams, companies (2026-10-28)
- **Interview Q&A are content**: `content/<locale>/interview-questions/<slug>.md` (collection `interview`; frontmatter `title` = the question, `description`, `type`, `topic` = section slug, `level`, optional `company`/`role`, `source`). The body is the model answer. English is written; the build translates. `/interview-questions` groups by course section (in course order) with type/level/company filters; `[slug].vue` has QAPage JSON-LD. Upvotes are `app.interview_upvote` (by slug), counts via cached `GET /api/interview/votes`.
- Community questions are submitted at `/interview-questions/new` → `app.interview_question` (pending) → approved in /admin → `scripts/pull-interview.mjs` (run by `prebuild` locally) writes them as English files → translated → pushed.
- **Exams**: `content/<locale>/exam/<domain>.md` (collection `exam`, a `quiz[]` of `{ id, q, options, answer, topic }` per domain; `options` is translated). `build-search-index.mjs` writes `public/exam/<locale>.json` (gitignored), which `certification/[paper].vue` fetches. Paper rules live in `app/utils/exam.ts`. While a paper runs the page is in **focus mode** (`useState('exam-focus')`): no header, footer, promos or pop-ups; full-screen when allowed; leaving asks first.
- **Companies**: `app/data/companies.json` — only companies with a public source that names CRM Analytics/Tableau CRM/Einstein Analytics (customer story, case study, partner page, job post). Never add one without a source. Suggestions arrive as `/submit?type=company` (kind `resource`, `details.type = company`).

### Pro lessons, seats and leads
- **Gating**: `access: pro` on the ENGLISH lesson (translations follow). `scripts/gate-content.mjs` (prebuild, CI too) moves each gated body into `server/assets/gated/<locale>/<route>.json` (bundled into the Worker only, with its `access`) and swaps a teaser stub into the content collection (`.gated-stubs/`, `.gated-files.json` — gitignored). `GET /api/lesson/<locale>/<route>` returns the body after `canOpen(accessFor(user), needs)`. The lesson page shows the teaser + `CourseProLockedCard` (Pro Monthly / Lifetime, or seats for teams), or the full lesson via `<MDC>`. **`pnpm build` ends with `scripts/verify-gating.mjs`, which fails the build if any gated passage is public.**
- **Seats**: `app.org` (kind company/college/team, seats, join code, optional domain, status, expiry) + `app.org_member` (one org per learner, role admin/member). `POST /api/org/join` checks the code, the domain (verified email at it) and free seats inside the insert; `GET /api/org` shows the org, and to its admins the code and members; `DELETE /api/org/members` frees a seat. /admin → Teams creates, resizes and ends orgs (`/api/admin/orgs`).
- **Salesforce**: `server/utils/salesforce.ts` posts each lead to Web-to-Lead for org `00Dg500000KBfkHEAT` — no credentials, no API user, nothing that can lock a Salesforce user. Custom Lead fields are mapped by 15-char field id in `LEAD_FIELDS` once deployed from `salesforce/crm/`. `app.lead.sf_status` records each send. A Pro purchase (monthly or lifetime) is a `subscribe` event; a sign-up carries its first-touch source. ⚠️ The org was frozen once: never script logins or bulk API calls against it.
- **Admin**: Overview (MRR, lifetime sales, team seats), Leads (new → contacted → won/lost), Teams (orgs and seats), Users (grant/revoke Pro), Submissions, Interview Q&A, Comments, Integrations (the GTM stack).
- **Points**: spendable balance = welcome + earned (`app.user_points`, which the global leaderboard ranks) + `app.points_ledger` — the view `app.wallet`. Gamification only.

### Home language and load time (2026-11-01)
- `/` runs the Worker first (`assets.run_worker_first` in wrangler.jsonc): `server/middleware/home-locale.ts` redirects to the country's language (`COUNTRY_LOCALE`) or the `crma_locale` choice, never crawlers; everything else is still edge-static.
- Nuxt Studio's editor is its own `studio-editor` chunk and is never preloaded or prefetched (`build:manifest` hook); `/_nuxt/*` and `/_fonts/*` are cached immutable for a year (`public/_headers`).

### Interview questions and exam windows
- `/interview-questions` is a **parent route** (`pages/interview-questions.vue`): the list stays, a question (`[slug].vue`) expands in place under its own row (the child `<NuxtPage>` renders inside that list item) with its own permalink, keeping the filters; ←/→/Esc work. `new.vue` renders on its own. The list comes from `useInterviewRows()` (Worker-guarded).
- **Focus pages** (`definePageMeta({ focus: true })`, read by app.vue before render): the navbar stays, the footer, promos and pop-ups go, and the page fits the viewport — the practice paper (it never scrolls; the question and navigator scroll inside), `/submit`.

### Bot protection and security
- **Headers**: `SECURITY_HEADERS` in `nuxt.config.ts` (Worker responses) and `public/_headers` (static files) — HSTS, nosniff, SAMEORIGIN, a narrow CSP (`frame-ancestors`, `object-src`, `base-uri`, `form-action`; no script allow-list because AdSense needs many Google hosts). Keep the two in step.
- **CSRF**: `server/middleware/origin-check.ts` refuses state-changing `/api` requests from another origin.
- **XSS**: `useJsonLd` escapes `<`, `>`, `&` in JSON-LD; unreviewed community text is never rendered as markdown in /admin; `pull-interview.mjs` neutralises HTML and script links before community answers become pages.
- **Admin** is pinned to one account id *and* email (`server/utils/admin.ts`).
- **Dependencies**: runtime security fixes are pinned in `pnpm-workspace.yaml` `overrides` (same major only).
- `server/utils/guard.ts`: honeypot (`website` field), per-action rate limit keyed by a SHA-256 of action + client address (`app.rate_hit`, no addresses stored), and **the site's own captcha** — a proof-of-work challenge (`server/utils/pow.ts`, `GET /api/challenge`) that `<HumanCheck>` solves silently in the browser; each solution is single-use (`app.used_challenge`). No third-party captcha. The HMAC key is `CAPTCHA_SECRET` or, unset, derived from `DATABASE_URL`. Required on sign-in, sign-up, newsletter and lead forms.

### Accounts, dashboard, analytics, admin
- **Schema**: `server/db/schema.sql` (idempotent: `progress`, `quiz_attempt`, `bookmark`, `comment`, `submission`, `demo_account`, `page_view`, `event`, view `user_points`). Apply with `psql "$DATABASE_URL" -f server/db/schema.sql`. `cleanup-2026-10-22.sql` was the one-off drop of the retired tables. Neon Auth's `neon_auth."user"` uses camelCase columns (`"createdAt"`, `"emailVerified"`).
- **Dashboard** (`app/pages/dashboard.vue`) reads one request, `GET /api/progress` (completions, bookmarks, best quizzes, activity days → streak, points/rank, top-5 leaderboard), shared through `useProgress()`. The weekly goal is per-browser (localStorage); badges are computed client-side.
- **GTM integrations** (/admin → Integrations): Cloudflare Web Analytics (`NUXT_PUBLIC_CF_BEACON_TOKEN`, a static beacon), Search Console (`NUXT_PUBLIC_GSC_VERIFICATION` or DNS), UTM-tagged share links, first touch (utm/referrer/direct, kept in localStorage `crma-src` by `analytics.client.ts`) attached to sign-ups and leads and sent to Salesforce, AdSense, Stripe. None of them costs the Worker a request.
- **Analytics (milestones only, 2026-11-16)**: no page views, reading time or click beacons — traffic is Cloudflare Web Analytics, which costs the Worker nothing. `useNuxtApp().$track(name, label)` sends only `sign_up`, `sign_in`, `lesson_complete`, `exam_finish`, `youtube_verified`, `checkout` (allow-list in both `analytics.client.ts` and `collect.post.ts`, rate-limited). No cookies, no IPs. No Google Analytics or Clarity.
- **Admin**: `/admin` (Overview · Analytics · Users · Submissions · Interview Q&A · Comments; sidebar with pending counts, keys 1–6, links to Cloudflare/Neon/AdSense/Search Console/YouTube/Actions) for **one account only**: `ADMIN_EMAIL = 'imswarnil@gmail.com'` in `server/utils/admin.ts` (`requireAdmin` → 404 for anyone else). No roles table.
- Comments: one level of replies, keyed by locale-stripped path. Submissions: images to R2 (`MEDIA` binding), reviewed in `/admin`.

### Community, reach and sharing (2026-10-26)
- **Language by country**: `shared/utils/regions.ts` holds `COUNTRY_LOCALE` (country → site language; IN/PK/PH/US/UK deliberately unmapped = English) and `COUNTRY_REGION` / `REGIONS`. `locale-auto.client.ts` lets the country decide first, then the browser language; a switcher choice always wins.
- **Wall of Fame**: curated `app/data/wall-of-fame.ts` + approved `nomination` submissions (`GET /api/wall`), merged client-side by `useWall()`; on the home page (`HomeWallSection`) and `/wall-of-fame`. Nominations come through `/submit?type=nominate` (`NOMINATE_PATH`) and are approved in /admin → Submissions.
- **Sharing**: `ShareBar` (LinkedIn, X, WhatsApp, native, copy) on lessons and the wall; "Share my progress" on the dashboard. Shared links carry `utm_source=<network>&utm_medium=share`; clicks are `share` events.

### Theming & branding — the Namaste Salesforce design system (since 2026-11-17)
Ported from `~/Developer/namaste-salesforce/sfdc/src/tokens`: Salesforce blue `#0176D3` is the one signal colour; deep navy `#032D60`/`#001A3E` for title bands and dark mode (the navy "console" — never a generic slate); white cards on a `#F4F6F8` page; hairline `#DDDBDA` borders; near-flat elevation (`0 4px 16px -8px` at most); **4px controls, 6px cards, 8px panels** (pills only for tags and segmented controls); Figtree everywhere; labels uppercase, tracked .09em, 11px, bold (`eyebrow`, `mono-label`). The `--paper/--card/--ink/--signal…` names and the `blueprint` ramp name are kept as this site's API, with Namaste values. Don't reintroduce the old Blueprint drawing style (crop marks, hard offset shadows, "FIG. 01 —" labels) or the interim rounded/pill look.
- `app/assets/css/main.css` — tokens (`--paper`, `--card`, `--ink`, `--ink2`, `--line`, `--navy`, `--signal`, `--tide`, `--frost`, `--ice`, `--glow`; dark in `.dark`) and utilities (`graph-paper*`, `hatch`, `ruler`, `eyebrow`, `mono-label`, `crosshair`, `bp-h1/h2/h3`, `bp-lead`, `bp-prose`, `bp-card`). Colour by token, never by hex.
- `app/app.config.ts` — Nuxt UI overrides (4px buttons and inputs, 6px cards and menus, uppercase labels). `app/components/bp/*` — shared primitives; `BpPageHeader` is a plain label + title + lead. `brand/` holds the logo mark, the PWA icons and the YouTube profile picture and cover (`node brand/build.mjs`, needs Switzer for the PNGs).
- The header: four nav links (icon + label, icons alone only when labels do not fit), search, language, theme, then one fixed-width slot — signed out *Test ride* + *Sign in*, signed in *Dashboard* + *Account* — so the bar never changes shape. Same `--ui-container` width on every page. The home hero is a navy title band with the product preview; the author portrait is a placeholder (`public/people/placeholder.svg`) until one is chosen.
- ⚠️ Tailwind's scanner skips `[...slug].vue`; `main.css` names those files in `@source` lines — keep them.

### Advertising (Google AdSense)
- `nuxt.config.ts` loads `adsbygoogle.js` once (client `ca-pub-1291242080282540`) and sets the `google-adsense-account` meta; `public/ads.txt` is published.
- The inventory (slot ids, sizes, formats) is `PROMO_UNITS` in `app/utils/promo.ts`. Every unit is `<PromoSlot unit="…">` (`app/components/PromoSlot.global.vue`): a rounded frame, reserved min-height, a fresh `<ins>` pushed on mount — pages remount on navigation, persistent layouts key it by `route.path`. In dev it shows a placeholder and requests nothing.
- Placements: in-article units spliced into lesson bodies (`withInArticlePromos`), a 160×600 under the lesson TOC, 300×250 at the foot of `BpCourseContents`, a multiplex after each lesson, a leaderboard at the bottom of content pages, and `PromoFloat` (closable bottom leaderboard, closed for the session). `promoAllowed()` excludes `/admin`, `/sign-in`, `/sign-up`, `/submit`.
- `ChannelPopup` is a timed YouTube subscribe card (45 s into a first session, then not for 30 days). **Never put an AdSense unit in a pop-up/modal** — AdSense policy forbids it; Vignette ads (AdSense Auto ads) are the compliant interstitial.
- **Never name files, components or CSS classes with "ad"/"adsense"** (filter lists block matching module URLs and the page fails to render) — that is why it is `promo`.

### Video
Lessons are recorded and published on YouTube; the English lesson carries `video: { id }`. The video tooling (Final Cut kit, OBS scenes, thumbnail and AI-video generators) was removed on 2026-11-17 and will be rebuilt from scratch in the Namaste Salesforce design.

## Environment variables

Local values in a **gitignored `.env`** (`.env.example` documents the shape). Production secrets live on the Worker (`wrangler secret put`): `DATABASE_URL`, `NEON_AUTH_*`, `DEMO_USER_*`, `STUDIO_GITHUB_*`, optional `CAPTCHA_SECRET`, optional `NEWSLETTER_GHOST_URL`.

## Conventions
- Internal links: `useLocalePath()` / `localePath('/path')`. New user-facing strings go in `i18n/locales/en.json` **only**; `pnpm translate` fills the other 11 (`fallbackLocale` is `en`). `/admin` is English-only and not translated.
- JSON-LD `inLanguage`, canonical and `og:locale` derive from the active locale — never hardcode `'en'`.
- The repo is public: never commit `.env`, `.libretranslate/`, `linkedin/`, Salesforce auth (`.sf/`, `.sfdx/`).

## The salesforce/ folder
`salesforce/` is the SFDX project for the learning org, and **all** of Swarnil's Salesforce
project material lives there: retrieved metadata (`force-app/`), Apex and SOQL scratch
(`scripts/`), sample data (`data/`). It is outside the site build — not in `content/`,
not linked from any page. Its CLI target is set in the gitignored `salesforce/.sf/config.json`
to alias `crma-learning` (`admin@crmanalyticsacademy.com`, `00Dg500000KBfkHEAT`).
The `org:pull` / `org:open` shortcuts were removed on 2026-10-28 while the org is frozen — run `sf` from `salesforce/` by hand only when Swarnil asks.
`force-app/main/default/wave/` is gitignored (the org ships Salesforce sample dashboards);
move your own builds into `salesforce/academy/` to commit them. The repo is public — see `salesforce/README.md`
for what must never be committed.
**The org is also the Academy's own CRM** — `salesforce/crm/` (its own package directory, never deployed to learners): Lead fields for everything Web-to-Lead sends plus `Lead_Score__c`/`Lead_Grade__c`, GTM fields (`Lifecycle_Stage__c`, `Motion__c`, MRR/ARR), Account/Contact/Opportunity seat fields, the `Seat_Assignment__c` object, the standard **Sales** and **Service** apps customised (no custom app), `AcademyLeadEvents` (site events → one record per person: sign-up = self-serve lead, Pro purchase = converted self-serve customer), the `Academy_CRM_Access` permission set and three reports. Products and the points price book are seeded by `scripts/apex/crm-seed.apex` (one Apex run). `salesforce/CRM-PROCESS.md` is the prospecting process and the deploy steps; `scripts/lead-field-ids.mjs` prints `LEAD_FIELDS` for `server/utils/salesforce.ts` after the deploy.
**Learning path and CI/CD (2026-11-01):** `salesforce/LEARNING.md` teaches admin → developer → DevOps on this folder's real metadata. `.github/workflows/salesforce.yml` runs LWC lint + Jest (`crm/**/lwc/*/__tests__`) on every change to `salesforce/`; the org validate/deploy job runs **only by hand** (workflow_dispatch) and only if the `SF_AUTH_URL` secret exists — never a login per push. The site deploy ignores `salesforce/**`-only commits.
Learners never share this org: `salesforce/scripts/academy-setup.mjs` (zero-dependency, every
call goes through `sf api request rest`) sets up *their own* org — permission sets, the
`Academy_Analytics` app from `salesforce/academy/`, and the 21 CSVs as `academy_*` datasets.
The learning org has null measure handling off, so eight blank numeric columns load as 0 there.

## Notes
- `README.md` is the overview and low-level design (data model, API, publishing).
- `linkedin/` (launch kit) is local only.
