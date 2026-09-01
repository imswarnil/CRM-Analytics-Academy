# Next steps

What is built, what is deliberately unfinished, and the one thing you have to
do before the admin screen will let you in.

Schema lives in `server/db/00{1,2,3}_*.sql`, all applied to Neon.

---

## 0. Do this first: get yourself an admin account

`ADMIN_EMAILS` on the Worker is set to **`imswarnil@gmail.com`**, as asked.

Your existing account is **`swarnilsinghaicse@gmail.com`** — a different
address, so it is *not* an admin. Either:

- **sign up at `/sign-up` with `imswarnil@gmail.com`** (then `/admin` opens), or
- add the other address:
  `printf '{"ADMIN_EMAILS":"imswarnil@gmail.com,swarnilsinghaicse@gmail.com"}' > /tmp/a.json && pnpm exec wrangler secret bulk /tmp/a.json && rm /tmp/a.json`

The allowlist exists to solve the bootstrap problem — the first admin cannot be
granted a role through a screen only admins can open. After that, roles are
granted in `/admin` and stored in `app.user_role`, so adding a moderator never
needs a redeploy.

---

## 1. Nuxt Studio needs connecting

`content.preview` is enabled in `nuxt.config.ts`, which is only the door. To
finish: sign in at **nuxt.studio** with GitHub, create a project, point it at
`imswarnil/CRM-Analytics-Academy`.

Studio edits markdown through the GitHub API and commits to a branch, so
publishing goes through the same push → translate → deploy chain as a
hand-written commit rather than around it. That is why it is worth using here
rather than a database-backed editor.

---

## 2. Quiz

Data layer done and unused. `app.quiz_attempt` stores every attempt and
`app.user_points` already awards 2 points per correct answer counting **only
the best attempt per lesson**, so retrying improves a score but replaying an
easy quiz cannot farm points.

Missing:

- **A content format.** Suggested frontmatter, matching the existing
  `interview[]` shape in `content.config.ts`:

  ```yaml
  quiz:
    - q: "Which object stores a synced dataset?"
      options: ["Dataflow", "Dataset", "Lens", "App"]
      answer: 1        # index into options
  ```

- **`POST /api/quiz`** — takes `{ lessonPath, answers[] }` and scores it
  **server-side**.

  That is the one real design constraint: the answers must not reach the
  browser before submission, or the quiz is decorative. Since every lesson is
  prerendered, either strip `answer` from the payload at render time (the way
  `gate-content.mjs` strips gated bodies) or serve the questions from a server
  route.

- **`LessonQuiz.vue`**, rendered after `LessonInterview` in
  `app/pages/[...slug].vue`.

---

## 3. Approved showcase submissions do not become showcase entries

`kind = 'showcase'` rows can be approved in `/admin`, which awards the points —
but `content/showcase/**` is a Nuxt Content collection built from markdown, so
nothing appears on `/showcase`.

Two options, genuinely different products:

- **Publish from the database.** `/showcase` reads approved rows at runtime.
  Fastest, but the showcase stops being prerendered and entries lose the
  `kpis[]` / `recipe[]` / `techniques[]` structure the current ones have.
- **Approval writes a markdown file** via the GitHub API. Keeps the collection,
  the structure and the prerender. More work, and it is the option that matches
  how the rest of this site works — and how Studio (above) already writes.

---

## 4. Smaller things

- **User creation hands out a plaintext temporary password.** There is no email
  sending configured, so `/admin` shows it once for you to pass on. That is a
  stopgap: a password that travels through a person ends up in a chat log. The
  right shape is an invite email with a single-use link — **Cloudflare Email
  Service** would cover it and adds no new vendor.
- **Leaderboard privacy.** Names are public with no opt-in. Zero-point users are
  excluded and email is never exposed, but if you want it opt-in that is one
  boolean plus a `where` clause in `server/api/leaderboard.get.ts`.
- **Rate limiting is per-isolate.** The `Map` in `submissions.post.ts`,
  `admin` routes and `auth/demo.post.ts` lives in one Worker isolate, so the
  real limit is per-isolate, not global. Fine at current traffic; move to KV or
  Durable Objects if it matters.
- **Unused i18n keys.** `video.thanksForWatching`, `video.replay`,
  `video.lessonCompleted` were the old custom player's end screen.
- **`/pro` does not exist.** `access: pro` gating, `server/api/lesson` and
  `app.entitlement` are built and dormant — no lesson is marked `pro`. The
  admin screen can toggle Pro per user already.
- **`/admin` is not translated**, on purpose: it is a one-operator internal
  tool and would otherwise add ~60 keys to eleven languages.

---

## 5. Nothing is committed

All of the above — the NSDS layer, the course player, the community features,
the admin — is in the working tree. This is now a large amount of uncommitted
work sitting on `feat/neon-auth`.

Note the ordering when you do commit: pushing `i18n/locales/en.json` triggers
`.github/workflows/translate.yml`, which fills in the ~90 new keys for the
other 11 locales and commits back, which triggers the Cloudflare deploy. Until
that push happens those locales render raw keys — there is no message fallback.
