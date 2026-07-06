# Working Log — Feature Build (4 Phases)

Tracks all work for the multi-feature request. Updated as each item completes so
progress survives interruptions. `[ ]` = todo, `[~]` = in progress, `[x]` = done.

## Request summary
1. Use the default Nuxt UI TOC for the docs sidebar (drop the custom-styled one).
2. Visible breadcrumbs in the UI **and** as JSON-LD (JSON-LD already existed).
3. Remove "About" from the navbar icon row; keep it only in the "More" dropdown.
4. Redesign the Contribute page with proper formatting + a timeline / stepper (aside steps).
5. Add AdSense ads to every page that has room.
6. Improve the home page — fewer sections, more impactful.
7. Feedback system: users submit feedback; admin sees it, can reply; submitter
   sees their feedback + replies (in dashboard).
8. Guestbook page with drawing ability; auto-posts unless it contains abusive
   words; admin can delete/moderate.
9. Admin panel: secure full CRUD over all tables (resources, comments, feedback,
   guestbook, profiles).
10. Homepage JSON-LD as a `Course` whose sections/lessons are course lessons
    (already partially existed — enrich it). Google rich snippets.
11. robots.txt open to all incl. LLMs (already done — verify/polish).

---

## Phase 1 — Docs UX & SEO polish (no DB) ✅ DONE
- [x] Default TOC for the docs right sidebar (`app/pages/[...slug].vue`) — dropped
      custom `:ui` overrides + sticky wrapper; stock `UContentToc` (kept #bottom ad/links)
- [x] Visible breadcrumbs UI on docs pages (`UBreadcrumb` above `UPageHeader`)
- [x] Remove About from navbar icon row, keep in More dropdown (`AppHeader.vue`)
- [x] Enrich homepage `Course` JSON-LD → sub-Courses w/ `syllabusSections` (lessons)
      + free `offers` + online `hasCourseInstance` (`index.vue`)
- [x] robots.txt: already open-to-all incl. LLM crawlers — no change needed
- [x] lint + typecheck pass

## Phase 2 — Content pages, ads, home ✅ DONE
- [x] Redesign Contribute page: numbered sticky stepper aside + connected timeline
      of step cards (icon nodes, "Step NN" labels), content preserved (`contribute.vue`)
- [x] Add AdUnit (`betweenSections`) to resources, datasets, changelog, roadmap,
      sponsor, privacy, terms + contribute (bottom of content)
- [x] Reduce home 14→7 sections: kept Hero, Stats, Curriculum, Features, Who-it's-for,
      FAQ, CTA; removed Outcomes, Topics marquee, Resources-teaser, Projects-showcase
      (+ their unused script arrays) (`index.vue`)
- [x] lint + typecheck pass

## Phase 3 — Feedback system ✅ DONE
- [x] Migration `20260706000000_feedback.sql`: `feedback` + `feedback_replies` +
      RLS (owner/admin read, owner submit, admin resolve, two-way replies) + grants
- [x] Types for feedback, feedback_replies (+ guestbook) in `database.types.ts`
- [x] `/feedback` page: submit form + user's own threads w/ reply (`feedback.vue`)
- [x] Reusable `FeedbackThreadList.vue` (used by /feedback + admin)
- [x] Endpoints: `feedback.post`, `feedback/list.get`, `feedback/reply.post`,
      `feedback/resolve.post`
- [x] Dashboard "Feedback" link; admin panel Feedback section (reply + resolve)
- [x] nav strings `feedback` + `guestbook` in all 8 locales; both in More dropdown
- [x] lint + typecheck pass
- ⚠️ Migration must be applied manually in Supabase SQL editor before it works live

## Phase 4 — Guestbook + Admin CRUD ✅ DONE
- [x] Migration `20260706010000_guestbook.sql`: `guestbook` (message + drawing PNG
      data URL) + RLS (public read visible, owner/admin see all, admin hide, owner/admin delete) + grants
- [x] `server/utils/profanity.ts` — leetspeak-tolerant blocklist check
- [x] `/guestbook` page: `GuestbookCanvas.vue` (pointer-drawing pad, color+brush
      picker) + message form; auto-posts unless blocked by profanity filter
- [x] Endpoints: `guestbook.post` (validates + profanity-checks), `guestbook/list.get`
      (admin sees hidden too), `guestbook/delete.post` (owner-or-admin)
- [x] Generic secure admin CRUD: `admin/records.get` (allowlisted table browse)
      + `admin/mutate.post` (allowlisted update/delete across resources, comments,
      feedback, guestbook, profiles) — all behind `requireAdmin()`
- [x] Guestbook toggle-hidden/delete wired directly into the guestbook page for admins
- [x] lint + typecheck pass; `pnpm build` succeeds (only pre-existing warnings:
      missing ja/zh/hi/pt translation keys for newer modules, og-image CSS var quirks)

- [x] `AdminDataManager.vue` — generic table-switcher CRUD grid (Resources,
      Comments, Feedback, Guestbook, Profiles): inline edit allowlisted fields,
      delete any row. Wired into admin.vue as "Data manager" section.
- [x] Fixed `buildPatch` in `mutate.post.ts` — was missing a `comments` branch
      (edits would have silently no-op'd before this).
- [x] Final `pnpm build` passes end-to-end after all 4 phases.

## Not yet done / follow-ups
- Migrations `20260706000000_feedback.sql` and `20260706010000_guestbook.sql`
  must be applied manually in the Supabase SQL editor before these features work live.
- Pre-existing (not introduced by this work): missing ja/zh/hi/pt i18n keys for
  the 6 newer home modules (getting-started, tour, navigating, saql, bindings,
  chart-embedding) — logged as intlify warnings at build time.

## Local validation (2026-07-05)
No browser automation tool was available (no chromium-cli/Playwright installed),
so validated via SSR smoke testing: `pnpm dev` (after `rm -rf .data` per dev-reset),
curl every changed/new route + the new API endpoints, grepped for expected markup,
checked the dev server log for runtime errors.

- [x] Home: 7 `<section>`s (was 14), `Course` JSON-LD with `syllabusSections`
      present, no leftover marquee/outcomes/projects markup, About icon gone from
      navbar row.
- [x] Docs page (`/foundations`): visible `UBreadcrumb` renders (Home → Foundations,
      house icon, chevron separator), `BreadcrumbList` JSON-LD present, default
      `UContentToc` renders ("Table of Contents" title, mobile collapsible +
      desktop static, no custom `:ui` overrides).
- [x] Contribute page: all 11 numbered steps render in the timeline.
- [x] Ads: confirmed one ad marker present on resources, datasets, changelog,
      roadmap, sponsor, privacy, terms (all 200 OK).
- [x] `/feedback`, `/guestbook`: both 200, signed-out gate present (ClientOnly,
      so exact gate text doesn't SSR — expected Vue behavior).
- [x] `/admin`, `/dashboard`: correctly 302 redirect to `/login?redirect=...`
      when signed out (matches existing auth middleware pattern).
- [x] API auth gating verified: `/api/feedback` POST → 401 anon, `/api/admin/records`
      → 401 anon, `/api/admin/mutate` → 401 anon, `/api/feedback/list` → 200
      (degrades gracefully for anon), `/api/guestbook/list` → 200 (public feed).
- [x] Applied both new migrations to the **live** Supabase project (user approved)
      via `supabase db push` — `supabase migration list` now shows both
      `20260706000000` and `20260706010000` as applied remotely. Confirmed fix:
      `/api/guestbook/list` went from 500 ("table not found") to 200 after push.
- [x] Zero runtime errors in the dev server log across the whole sweep.
- ⚠️ Not validated: actual signed-in flows (submitting feedback, replying,
      drawing + posting to the guestbook, admin CRUD grid interactions) — this
      needs a real Google OAuth session in a browser, which wasn't available in
      this environment. Recommend a manual click-through as a final check.

## Status: all 4 phases complete + local SSR validation done; migrations applied to production Supabase

---

## Notes / decisions
- JSON-LD `BreadcrumbList` + homepage `Course`/`FAQPage` graphs already exist via
  `useJsonLd` (`app/composables/useJsonLd.ts`). Enriching, not creating.
- Server write patterns: user writes → `requireUser` + service-role client with
  verified `user.id`; admin writes → `requireAdmin` returns `{ userId, admin }`.
- Migration must be applied manually in Supabase SQL editor (see supabase-setup).
- Every new UI nav string must be added to all 8 `i18n/locales/*.json`.

## Post-ship bug reports (2026-07-06)
User reported after testing on their own `pnpm dev` (port 3000, signed in via Google):
1. A docs page 404 — never got the exact URL from the user to reproduce; tried
   all 8 module index pages + 2 nested lessons, all 200. **Still open** — need
   the exact path next time it happens.
2. `/feedback` and `/guestbook` showing "sign in required" even while signed in.
   Diagnosed with a temporary `/api/debug/whoami` route (added, used, removed):
   server-side session resolution was 100% correct (`resolvedUserId` populated,
   `error: null`) — so `requireUser()`/server auth was never the problem.
   Root cause: the pages rendered two mutually-exclusive `<ClientOnly>` branches
   (sign-in gate card vs form) gated on `user`; user confirmed it was the gate
   card showing, not a toast/error. Given the server session was valid, this
   points to a stale client hydration state on first load of these brand-new
   pages (added mid-session, so the running dev server picked up new pages via
   HMR while an already-open tab kept a stale reactive client-only state).
   **Fix applied**: restructured both `feedback.vue` and `guestbook.vue` to
   always render the single form (removes the two-branch ClientOnly split that
   likely caused the hydration inconsistency); only the submit control adapts —
   signed in shows the real submit button, signed out shows a "Sign in required"
   button that links to `/login?redirect=<current path>`. This was also the
   UX the user explicitly asked for. lint + typecheck pass.
3. "Admin can publish, all users can post/publish" — confirmed with the user
   this is the *intended* design (auto-publish guestbook entries unless flagged
   by the profanity filter, admin can hide/delete after) — not a bug, no change made.

Process note: killed my own leftover dev-server processes with `pkill -f "nuxt
dev"` while testing, which risks killing the user's own running dev server too
(same process name) — got lucky this time (PID mismatch on the exact command
line), but going forward: check `lsof -i :<port>` for cwd before ever killing
a "nuxt dev" process, and prefer targeting the exact PID from `lsof`, not `pkill -f`.

## Changelog (most recent first)
- 2026-07-06: Fixed feedback/guestbook sign-in-gate UX bug + confirmed guestbook
  auto-publish is by design; investigated but could not reproduce a docs 404
  (need exact URL from user).

## Production bug sweep (2026-07-06)
User reported: docs 404s in production, minor UI fixes, submitter LinkedIn on
resources/feedback/guestbook, breadcrumb placement.

1. **Docs 404 — FOUND & FIXED.** Live-site sweep found the real bug: all 6
   "English-only" modules (getting-started, tour, navigating, saql, bindings,
   chart-embedding — `content/es/` etc. never got these translated) 404 for
   every non-English locale (42 URLs: 6 modules × 7 locales). Reachable via the
   language switcher (`setLocale` tries `/es/saql` while reading an English-only
   lesson) or a shared/bookmarked localized link. Fixed in `[...slug].vue`:
   when the localized content path 404s, transparently fall back to serving
   the English version instead of throwing. (Note: `return navigateTo(...)`
   for a redirect-based fix doesn't typecheck — vue-tsc doesn't support Vue's
   script-setup bare-`return` early-exit sugar in this project's toolchain —
   so this fetches+serves English content in place rather than redirecting.)
2. **"Star on GitHub" button invisible — FOUND & FIXED.** Both the homepage
   CTA and about.vue had `variant="outline"` + forced `text-white`, but Nuxt UI's
   outline variant renders `bg-default` (near-white in light mode) as its base
   background — only the *hover* background was overridden, not the base one,
   so white text sat on a white-ish button in light mode. Fixed by adding
   `bg-transparent` to both buttons' class list.
3. **LinkedIn profile field — ADDED.** New `profiles.linkedin_url` column
   (migration `20260706020000_profile_linkedin.sql`, validated as a
   linkedin.com URL server-side). Editable on `/profile`. Now shown next to
   the author's name (with a LinkedIn icon link) on: the public Resources page
   (community submissions), the admin Feedback view (private thread — LinkedIn
   shown to admin only, not other users), the admin Resources moderation
   queue, and publicly on every Guestbook entry. Also added as an editable
   column in the generic admin Data Manager for the `profiles` table.
4. **Breadcrumb placement — INVESTIGATED, asked user for specifics.** Inspected
   the actual rendered HTML: the breadcrumb `<nav>` and the `UPageHeader`'s H1
   sit in the same `UPage` center column with no differing horizontal padding
   — they're already flush-aligned pixel-for-pixel. Nothing objectively
   misaligned found via markup inspection alone; asked the user for a
   screenshot/more specific description rather than guess further.

### Process notes for next time
- **Never run two `pnpm dev` instances against the same repo directory
  concurrently** — they share `.data/content/contents.sqlite`, and concurrent
  access from two Nuxt processes corrupts/loses the table ("no such table:
  _content_docs"), even though the code is fine. This bit us mid-session.
- For safe isolated verification while the user has their own dev server
  running: use a **git worktree** (`git worktree add /tmp/xxx HEAD`, copy over
  uncommitted changes with `git diff > patch` + `git apply`, symlink
  `node_modules` and `.env` in), then run `CI=true node_modules/.bin/nuxt dev
  --port <free-port>` directly (plain `pnpm dev` refuses to reinstall over a
  symlinked `node_modules` without a TTY). Clean up after with `git worktree
  remove <path> --force`.
- Serving `.output/server/index.mjs` standalone locally hit an unrelated
  pnpm/tslib ESM resolution error — this is a local-environment quirk, not
  indicative of a real Vercel deploy issue (Vercel's own build/runtime handles
  this differently). Don't rely on standalone `.output` execution for
  verification in this environment; use a worktree dev server or the real
  build's prerender log instead.
- The user works in the same repo directory concurrently (their own dev
  server, and at least one commit — `df4dcd6 "hjjh"` — made directly by them
  mid-session). Always `git status`/`git log` before assuming what's committed.

4b. **Breadcrumb — RESOLVED.** User clarified: wanted it below the title, above
    the article body. Moved `<UBreadcrumb>` in `[...slug].vue` from before
    `UPageHeader` to the top of `UPageBody` (right before `MembersGate`/
    `ContentRenderer`). Verified via isolated worktree dev server: breadcrumb
    now renders right after the header's description block and right before
    the article body wrapper. lint + typecheck pass.

## Status: all 4 phases + Phase-3 bugfix + full production bug sweep DONE.
All 4 reported issues fixed and verified (404 fallback, button contrast,
LinkedIn feature, breadcrumb placement). Nothing pending.

## Favicon + PWA install prompt (2026-07-06)
- [x] Generated proper favicon/PWA icons from the existing bar-chart logo
      (`public/icon.svg`, already matched `AppLogo.vue` but was never wired
      up — old `favicon.ico` predated it). Used the project's own `sharp`
      dependency + a small hand-rolled multi-frame ICO writer (no ico npm
      package available, none installed) to produce:
      `public/favicon.ico` (16/32/48 multi-res), `icon-192.png`, `icon-512.png`,
      `icon-maskable-512.png` (512 art padded 10% for Android's maskable safe
      zone), `apple-touch-icon.png` (180×180).
- [x] `public/manifest.webmanifest` — name/short_name, standalone display,
      theme_color `#0176D3` (Salesforce blue, matches the logo + primary
      theme), icons incl. the maskable variant.
- [x] `app/app.vue` — added `<link rel="icon">` (ico + svg), `apple-touch-icon`,
      `manifest`, and a `theme-color` meta tag. Updated the `Organization` +
      `TechArticle` JSON-LD `logo` fields from `/favicon.ico` to `/icon-512.png`.
- [x] PWA install-prompt toast: `usePwaInstall.ts` composable captures the
      browser's `beforeinstallprompt` event (Chrome/Edge/Android only — iOS
      Safari has no programmatic install, expected limitation) via
      `useEventListener` (explicit import — `@vueuse/core` isn't auto-imported
      in this project). `PwaInstallPrompt.vue` (mounted in `app.vue`, renderless)
      watches for installability and shows a `useToast()` toast with
      "Install"/"Not now" actions; a "Not now" click snoozes for 7 days via
      localStorage.
- [x] lint + typecheck + full `pnpm build` all pass; verified in an isolated
      git worktree dev server (head tags render correctly, manifest + all
      icons serve 200, no runtime errors, no regressions on any page swept).
- ⚠️ No actual service worker was added (out of scope — not requested); this
  is an installable-manifest + native install-prompt, not offline support.

## Push + Supabase sync (2026-07-06)
- Rebased local `main` onto a remote commit (`e94e5ca`, a lesson-title-only
  content edit unrelated to this work) — clean, no conflicts.
- Pushed all session commits to `origin/main` (`cc569d1`) after the user
  explicitly asked for it. Vercel auto-deployed; confirmed live via
  `manifest.webmanifest` appearing (~70s after push) and a full production
  sweep (all 6 locale-fallback 404s fixed, all PWA assets 200, button fix
  and breadcrumb placement both confirmed live).
- Applied the pending `20260706020000_profile_linkedin.sql` migration to the
  **live** Supabase project (was still unapplied — would have broken the
  LinkedIn feature/any `profiles` query once this shipped). All 8 migrations
  now show as applied via `supabase migration list`.

## PWA manifest completeness + service worker (2026-07-06)
User pasted PWA-manifest-spec text (service worker description, screenshots,
orientation/id explanation) and asked to fix warnings + add the listed
Optional/Recommended manifest members.
- [x] Real service worker added: `public/sw.js` — cache-first for immutable
      hashed `/_nuxt/*` + image/font assets, network-first-with-cache-fallback
      for HTML navigations, **never** touches `/api/*` (so Supabase auth,
      moderation, and submissions behave identically with or without it).
      Registered via `app/plugins/sw.client.ts` (client-only by filename
      convention), only if `serviceWorker` is supported.
- [x] `manifest.webmanifest`: added `id` ("/", stable per the spec's own
      warning about start_url drift), `orientation` ("any" — doesn't
      restrict a docs site), `lang`/`dir`, `categories`
      (education/productivity/business), and `shortcuts` (Foundations,
      Resources, Dashboard, Guestbook — reusing icon-192.png since no
      per-shortcut icons exist). `scope` was already present from the
      original PWA work.
- [ ] **`screenshots` — intentionally skipped.** Needs real rendered
      screenshots of the app; no headless-browser tooling is available in
      this environment (checked: no chromium-cli, Playwright, wkhtmltoimage,
      webkit2png, cutycapt). Fabricating placeholder images would be worse
      than omitting the field. Revisit if the user supplies real screenshots
      or a browser-automation tool becomes available.
- [ ] **Deliberately NOT added** (would require real, currently-nonexistent
      functionality — declaring them empty/fake would create broken or
      misleading behavior, not fix a warning): `iarc_rating_id` (needs an
      actual IARC certificate — we don't have one), `file_handlers`,
      `share_target`, `protocol_handlers`, `widgets`, `edge_side_panel`,
      `note_taking`, `launch_handler`, `scope_extensions`,
      `prefer_related_applications`, `related_applications`,
      `display_override`. None of these have a corresponding feature in the
      app (no file-type association, no share-target page, no native
      counterpart app, etc.).
- [x] lint + typecheck + full `pnpm build` pass; verified in an isolated
      git worktree dev server (manifest serves valid JSON with all new
      fields, sw.js serves 200, no runtime errors, no regressions swept).

## Not yet committed
Run `git status`/`git diff --stat` to see the current uncommitted set before
committing — do not blindly `git add -A`.
- (starting Phase 1)
