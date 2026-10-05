<script setup lang="ts">
/**
 * The operator's manual, inside the admin console: how to write a lesson,
 * make it free or Pro, attach video, turn it into slides, and run the
 * business side (leads, teams, community, tracking). Every step names the
 * real command, page or tab it happens in.
 */
interface Step {
  title: string
  body: string
  code?: string
  to?: string
}
interface Chapter {
  n: string
  icon: string
  title: string
  lead: string
  steps: Step[]
}

const chapters: Chapter[] = [
  {
    n: '01',
    icon: 'i-lucide-pen-line',
    title: 'Write a lesson',
    lead: 'English is the only language written by hand. The other eleven are generated on push.',
    steps: [
      { title: 'Or in the browser', body: 'Admin → Content edits lessons straight against GitHub: no local setup, a live preview, and every save is a commit. See "Editing content" below.', to: '#content' },
      { title: 'Open the CMS', body: 'Payload runs locally. Sign in with your admin account, then Course → Lessons → Create. Pick the section, order and slug; the body is markdown with the course\'s MDC blocks (::field-table, :lesson-links …).', code: 'pnpm cms:dev    # http://localhost:3100/admin' },
      { title: 'Or write markdown directly', body: 'Add content/en/<NN.section>/<NN.lesson>.md with two-digit prefixes. Frontmatter: title, description, navigation.title, access, mux (one playback id), walkthrough, quiz, interview, links.' },
      { title: 'Preview', body: 'Run the site and open the lesson. If the sidebar looks empty, reset the dev content database.', code: 'pnpm dev\npkill -f "nuxt dev"; rm -rf .data && pnpm dev   # if the nav is empty' },
      { title: 'Publish', body: 'Pull Payload into markdown (only changed files are written), review the diff, commit and push. The Translate workflow fills the 11 locales, then Deploy builds, verifies gating, ships to Cloudflare and pings IndexNow.', code: 'pnpm cms:pull:dry && pnpm cms:pull\ngit add content && git commit -m "content: …" && git push' }
    ]
  },
  {
    n: '02',
    icon: 'i-lucide-lock',
    title: 'Make it free or Pro',
    lead: 'Access is decided by the English lesson and applies to every translation.',
    steps: [
      { title: 'Toggle here', body: 'Admin → Lessons & Pro flips a lesson between free and Pro and commits the frontmatter change to GitHub for you.', to: '#lessons' },
      { title: 'Or in the file / CMS', body: 'Set access: pro in the English frontmatter (or the Access field in Payload). Leave it out for free.' },
      { title: 'What the build does', body: 'gate-content moves a Pro lesson\'s body into the Worker, publishes a teaser stub, and verify-gating fails the build if any hidden text leaks. Pro readers get the body from /api/lesson after an entitlement check; Pro lessons also carry paywall JSON-LD so search engines don\'t treat it as cloaking.' }
    ]
  },
  {
    n: '03',
    icon: 'i-lucide-clapperboard',
    title: 'Video, slides and editing',
    lead: 'One video per lesson, in your voice. Every language gets the same video with its own captions and transcript.',
    steps: [
      { title: 'Producing a lesson video', body: 'pnpm video runs the pipeline stage by stage; each writes into .data/video/<route>/ so any stage can be redone or replaced by hand. The voice is yours — HeyGen clone, a local clone, or a recording; there is no default TTS, and HeyGen runs only when you select it. Full guide: video/README.md.', code: 'pnpm video script /saql/functions          # narration beats (--with-claude: prompt to polish)\npnpm video voice  /saql/functions --provider=heygen   # or local-clone, or file --file=x.wav\npnpm video avatar /saql/functions --provider=none     # or heygen\npnpm video motion /saql/functions          # HyperFrames project → render in Claude Code\npnpm video edit   /saql/functions          # paste PREMIERE.md into Claude Code (Premiere MCP)' },
      { title: 'Upload to Mux', body: 'Uploads final.mp4 (Premiere\'s export), requests Mux auto-captions in English and writes mux: <id> into the English lesson. Free lessons get public playback; Pro lessons are signed and play only with a token minted after the entitlement check.', code: 'pnpm video upload /saql/functions\npnpm mux:lesson /saql/functions ~/Videos/saql.mp4 --test   # watermarked, deleted in 24h' },
      { title: 'Captions and transcripts', body: 'Once Mux has generated the captions, sync them; the Refresh captions workflow also does this daily, so a caption you correct in Mux flows through on its own. Translate then makes the other 11 languages and the deploy publishes them: the player shows the reader\'s language and a searchable transcript under the video.', code: 'pnpm video captions /saql/functions   # → content-transcripts/en/…vtt, then commit + push' },
      { title: 'Pro sections inside a free lesson', body: 'Wrap any part of a lesson — text, tables, a video — in ::pro … :: and it is locked like a Pro lesson: the build moves it into the Worker and leaves a locked card. Nested components take three colons (:::lesson-video{mux="…"}).' },
      { title: 'Turn a lesson into slides', body: 'Generates 1920×1080 Blueprint slides (title, concepts, examples, lab steps, quiz, recap), speaker notes and a Premiere timeline.', code: 'pnpm slides:lesson /introduction/set-up-your-org' },
      { title: 'Edit in After Effects / Premiere', body: 'content-assets/after-effects: run build-brand-kit.jsx (File → Scripts) to get fully editable comps, and import-lesson-slides.jsx to lay a deck out on a timeline. content-assets/premiere: ProRes 4444 overlays with alpha and an importable XML sequence.' }
    ]
  },
  {
    n: '04',
    icon: 'i-lucide-server',
    title: 'Where everything is hosted',
    lead: 'Each piece runs where it is cheapest and simplest to keep alive.',
    steps: [
      { title: 'Site — Cloudflare Workers', body: 'Prerendered pages are static assets at the edge; only /api and private pages reach the Worker. Secrets live on the Worker (wrangler secret put). A push to main deploys.' },
      { title: 'Data — Neon Postgres', body: 'Schemas: app (progress, billing, teams, leads, comments), neon_auth (accounts), payload (the CMS). Migrations in server/db/*.sql are applied by hand, in order.' },
      { title: 'Video — Mux · Media — R2', body: 'Mux for streaming; Cloudflare R2 for uploads (screenshots, submissions).' },
      { title: 'CMS — Payload (local)', body: 'Runs on your machine against Neon. To host it later: any Node host (Railway, Fly, a VPS) with the same cms/.env.' },
      { title: 'Automation — n8n', body: 'n8n Cloud or self-hosted. Import integrations/n8n/salesforce-leads.workflow.json, add Salesforce credentials there, and set N8N_WEBHOOK_URL + N8N_WEBHOOK_SECRET on the Worker.' },
      { title: 'Payments — Dodo (test mode)', body: 'Hosted checkout + webhook. Go live only by switching DODO_ENV and the live keys/products — never by editing code.' }
    ]
  },
  {
    n: '05',
    icon: 'i-lucide-briefcase',
    title: 'Leads: quotes, sales, sponsors, instructors',
    lead: 'Every form lands in Neon first, is enriched, then forwarded to Salesforce through n8n.',
    steps: [
      { title: 'The forms', body: '/teams#contact (talk to sales, quotes, invoicing), /teams (self-serve seats), /sponsor, /instructors, /nominate. Business forms require a company email — gmail, outlook, yahoo and other free domains are refused.' },
      { title: 'Enrichment', body: 'The company domain is fetched for its name, description and logo, so a lead arrives with context.' },
      { title: 'Work the pipeline', body: 'Admin → Leads: filter by type and status, set owner and notes, move new → contacted → qualified → won/lost, re-run enrichment, resend to n8n, export CSV.', to: '#leads' },
      { title: 'In Salesforce', body: 'The n8n workflow creates a Lead (LeadSource "CRM Analytics Academy") and a follow-up Task for sales and quote requests, and returns the Salesforce id to the lead row.' }
    ]
  },
  {
    n: '06',
    icon: 'i-lucide-users',
    title: 'Teams and self-serve',
    lead: 'A company buys seats, the buyer becomes the owner and invites colleagues from the same domain.',
    steps: [
      { title: 'Buying', body: '/pricing → Teams, or /teams: 3–50 seats, billed annually. More than 50, invoicing or SSO → the sales form at /teams#contact.' },
      { title: 'Inviting', body: 'The owner opens /team, invites by email (must match the company domain or an extra domain the owner adds) and shares the invite link. Accepting uses a seat and grants Pro.' },
      { title: 'Watching', body: 'Admin → Teams lists every team, its seats used and its members.', to: '#teams' }
    ]
  },
  {
    n: '07',
    icon: 'i-lucide-heart-handshake',
    title: 'Community',
    lead: 'Contributions come in through one stepper and are reviewed here.',
    steps: [
      { title: 'Submissions', body: 'Dashboards, resources, lesson fixes, translations and SAQL snippets arrive at /submit and wait in Pending review. Approve to credit the author (points toward their rank on /dashboard).' },
      { title: 'Showcase and resources', body: 'An approved dashboard becomes a file in content/showcase (or a Showcase entry in Payload); a resource becomes a file in content/resources.' },
      { title: 'Comments', body: 'Admin → Comments hides or restores comments on any lesson.', to: '#comments' },
      { title: 'Wall of Fame', body: 'Nominations arrive as leads of type nomination; add the person to the wall once they agree to be shown.' }
    ]
  },
  {
    n: '08',
    icon: 'i-lucide-activity',
    title: 'Track everything',
    lead: 'Where to look to know whether it is working.',
    steps: [
      { title: 'Learning', body: 'The KPI strip above: users, completions, quiz attempts, submissions. Each learner\'s own view, with their rank, is /dashboard.' },
      { title: 'Traffic and search', body: 'Microsoft Clarity for behaviour; Google Search Console for queries and rich results (verify the domain and submit sitemap_index.xml); Bing gets every changed URL through IndexNow on each deploy.' },
      { title: 'Revenue', body: 'Dodo dashboard for payments; Admin → Teams for seats; entitlements live in app.entitlement.' },
      { title: 'Deploys', body: 'GitHub Actions: Translate, Deploy (lint, typecheck, build, gating check, wrangler deploy, IndexNow).' }
    ]
  },
  {
    n: '09',
    icon: 'i-lucide-file-pen-line',
    title: 'Editing content',
    lead: 'Admin → Content reads the course from main on GitHub and writes it back as commits. The translate and deploy workflows take it from there.',
    steps: [
      { title: 'Open a lesson', body: 'Pick it in the course tree. The form edits title, sidebar title, description, access, authors, credits and the YouTube video (with its credit); the body is markdown with the course\'s MDC blocks and previews live. Raw file edits everything else (quiz, walkthrough, interview). Saving commits to main; if someone else committed the file since you opened it, the save is refused — reload and reapply.', to: '#content' },
      { title: 'New lesson / new section', body: 'A new lesson goes at the end of its section with the next two-digit prefix and a slug from the title. A new section gets its .navigation.yml and a first page (01.index.md). Also add the section to LLM_SECTIONS in nuxt.config.ts so llms.txt lists it.' },
      { title: 'Rename and reorder', body: 'Renaming changes the title only — the URL stays. Drag (or use the arrows) to reorder lessons within a section or sections in the course, then Save order: one commit renames the English files, the same paths in every translated locale, and the keys in .translation-manifest.json, so nothing is re-translated. URLs do not change, so progress and comments are unaffected.' },
      { title: 'Authors and credits', body: 'authors: [slug] names people from content/people (none = the site owner); they show as chips under the title and in the lesson\'s JSON-LD. credits: [{ kind, title, author, authorUrl, url, license, note }] lists any third-party video, post, article, image or dataset; a credited video shows "Video by …" under the embed. Inside a body: ::youtube-embed{id="…" author="…" authorUrl="…" creditTitle="…"}. Everyone credited appears on /instructors.' },
      { title: 'People', body: 'Content → People adds or edits content/people/<slug>.yml (name, role, avatar, headline, links). Roles: instructor, maintainer, blogger, creator, community.' },
      { title: 'Needs', body: 'GITHUB_CONTENT_TOKEN on the Worker: a fine-grained PAT on this repository with Contents read/write and Pull requests read/write. Optional GITHUB_CONTENT_REPO and GITHUB_CONTENT_BRANCH (defaults: this repo, main).' }
    ]
  },
  {
    n: '10',
    icon: 'i-lucide-graduation-cap',
    title: 'Instructors',
    lead: 'Instructors write lessons in the same editor; an admin reviews and publishes every change.',
    steps: [
      { title: 'Onboard one', body: '1. Content → People: add their person entry. 2. Users & Roles: set their account to instructor (create the account there if needed). 3. Content → People → Instructor accounts: link the account to their entry. Needs migration 012_instructors.sql applied.', to: '#users' },
      { title: 'What they can do', body: 'Open /admin (the header shows "Instructor studio") and see only the content editor. They edit lessons whose authors include them and create lessons and sections; they cannot reorder, rename sections or edit people.' },
      { title: 'How their saves arrive', body: 'Each save goes to a branch lesson/<slug>-<id> and one pull request; later saves to the same lesson update the same pull request. Content → Review queue shows each one with a per-file diff.' },
      { title: 'Publish or send back', body: 'Publish squash-merges into main (translation and deploy follow). Request changes posts your note on the pull request and shows it to the instructor in their studio. A pull request that touches anything outside content/ can only be merged on GitHub.' }
    ]
  },
  {
    n: '11',
    icon: 'i-lucide-megaphone',
    title: 'Sponsors',
    lead: 'One sponsor per calendar month (UTC), $99, exclusive — their creatives fill every promo slot on the site.',
    steps: [
      { title: 'How a month is sold', body: '/sponsor shows live reach and a twelve-month timeline. A signed-in buyer picks consecutive open months; checkout HOLDS them for 30 minutes (one live row per month, enforced by a unique index) and sends them to Dodo. Only the payment webhook turns a hold into Paid; a failed or abandoned checkout frees the month. No AdSense loads any more.' },
      { title: 'One-time setup', body: 'Apply server/db/010_sponsors.sql to Neon. In Dodo (test mode first) create a ONE-TIME product "Sponsorship — one month", price 99 USD, tax category digital services/advertising, and put its id on the Worker. Make sure the webhook endpoint also receives payment.failed and payment.cancelled.', code: 'wrangler secret put DODO_PRODUCT_SPONSOR_MONTH\n# optional, for page views + countries on /sponsor:\nwrangler secret put CF_API_TOKEN   # token with Zone · Analytics · Read\nwrangler secret put CF_ZONE_TAG' },
      { title: 'The sponsor studio', body: '/sponsor/studio: the sponsor sees their months, builds leaderboard (728×90 + 320×100), square (300×250 or 1:1) and text creatives with true-size previews, publishes, and watches impressions and clicks. Images go to R2 under brand/<sponsor>/ and are size-checked from the bytes.' },
      { title: 'Moderate and book by hand', body: 'Admin → Sponsors: the booking calendar, pause / reject (with a note the sponsor sees) / restore any creative, cancel a booking, and book months for a sponsor who pays by invoice or gets a complimentary month (they need an account first).', to: '#sponsors' },
      { title: 'Refunds', body: 'If someone pays after their hold lapsed AND another buyer took the month meanwhile, the booking is flagged "Refunds to make" in Admin → Sponsors. Refund it in the Dodo dashboard, then press Mark refunded. A cancelled paid month is also refunded in Dodo by hand.' },
      { title: 'What readers see', body: 'With a paid sponsor: their published creative per format, labelled Sponsored, links via /api/placement/go/<id> (counts the click). Without: the house "Promote your brand here" placeholder. Pro readers see neither. Changes reach every page within ~5 minutes (edge cache). Turning AdSense back on for unsold months: build with NUXT_PUBLIC_PROMO_NETWORK=adsense.' }
    ]
  }
]

const open = ref(chapters[0]!.n)
const emit = defineEmits<{ go: [tab: string] }>()
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
    <nav
      class="h-max border-[1.5px] border-(--ink) bg-(--card) lg:sticky lg:top-24"
      aria-label="Guide chapters"
    >
      <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
        Operator's guide
      </p>
      <button
        v-for="c in chapters"
        :key="c.n"
        type="button"
        class="relative flex w-full items-center gap-3 border-b border-dashed border-(--line) px-4 py-2.5 text-start text-sm last:border-b-0"
        :class="open === c.n ? 'bg-(--ice) font-bold text-(--signal)' : 'hover:bg-(--ice)/50'"
        @click="open = c.n"
      >
        <span
          v-if="open === c.n"
          class="absolute inset-y-0 start-0 w-[3px] bg-(--signal)"
        />
        <span class="font-mono text-[11px] text-(--ink2)">{{ c.n }}</span>
        <UIcon
          :name="c.icon"
          class="size-4 flex-none"
        />
        {{ c.title }}
      </button>
    </nav>

    <template
      v-for="c in chapters"
      :key="c.n"
    >
      <section
        v-if="open === c.n"
        class="border-[1.5px] border-(--ink) bg-(--card)"
      >
        <header class="graph-paper-fine border-b-[1.5px] border-(--ink) px-6 py-5">
          <p class="eyebrow">
            Chapter {{ c.n }}
          </p>
          <h2 class="bp-h3 mt-1">
            {{ c.title }}
          </h2>
          <p class="mt-2 text-(--ink2)">
            {{ c.lead }}
          </p>
        </header>
        <ol class="divide-y divide-dashed divide-(--line)">
          <li
            v-for="(s, i) in c.steps"
            :key="s.title"
            class="flex gap-4 px-6 py-5"
          >
            <span class="flex size-8 flex-none items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) font-mono text-xs font-semibold text-white">{{ i + 1 }}</span>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-(--ink)">
                {{ s.title }}
              </h3>
              <p class="mt-1 text-sm leading-relaxed text-(--ink2)">
                {{ s.body }}
              </p>
              <pre
                v-if="s.code"
                class="mt-3 overflow-x-auto border-[1.5px] border-(--ink) bg-[#07122A] p-3 font-mono text-xs leading-relaxed text-[#DDEBFA]"
              >{{ s.code }}</pre>
              <UButton
                v-if="s.to"
                size="xs"
                color="neutral"
                variant="outline"
                trailing-icon="i-lucide-arrow-right"
                class="mt-3"
                @click="emit('go', s.to.slice(1))"
              >
                Open
              </UButton>
            </div>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>
