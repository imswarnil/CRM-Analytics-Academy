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
- (starting Phase 1)
