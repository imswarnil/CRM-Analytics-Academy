<script setup lang="ts">
/**
 * /admin — the site owner's console: overview, traffic analytics, users,
 * community submissions and lesson comments.
 *
 * Only one account can open it (ADMIN_EMAIL in server/utils/admin.ts), and
 * every route it calls re-checks that server-side; this page only decides
 * whether to draw. Deliberately not translated — one operator, English.
 * Content is edited in Nuxt Studio (/_studio), not here.
 */
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Admin',
  robots: 'noindex, nofollow'
})

type Tab = 'overview' | 'analytics' | 'leads' | 'users' | 'submissions' | 'interview' | 'comments'
const TABS: { key: Tab, label: string, icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'i-lucide-gauge' },
  { key: 'analytics', label: 'Analytics', icon: 'i-lucide-chart-line' },
  { key: 'leads', label: 'Leads', icon: 'i-lucide-handshake' },
  { key: 'users', label: 'Users', icon: 'i-lucide-users' },
  { key: 'submissions', label: 'Submissions', icon: 'i-lucide-inbox' },
  { key: 'interview', label: 'Interview Q&A', icon: 'i-lucide-messages-square' },
  { key: 'comments', label: 'Comments', icon: 'i-lucide-message-square' }
]
const route = useRoute()
const tab = ref<Tab>(TABS.some(t => t.key === route.query.tab) ? route.query.tab as Tab : 'overview')
watch(tab, t => navigateTo({ query: { tab: t } }, { replace: true }))

const { data: me, status: meStatus } = await useLazyAsyncData('admin-me', () =>
  $fetch<{ signedIn: boolean, admin: boolean, email: string | null }>('/api/admin/me'), { server: false })
const isAdmin = computed(() => Boolean(me.value?.admin))

/* --- Overview --------------------------------------------------------------- */
interface Stats {
  totals: { users: number, pendingSubmissions: number, approvedSubmissions: number, lessonsCompleted: number, quizAttempts: number, comments: number, views7d: number, visitors7d: number, signups7d: number, proMembers: number, newLeads: number, leads30d: number, wonLeads: number, waitlist: number }
  series: { progress: { day: string, count: number }[], signups: { day: string, count: number }[] }
  topLessons: { path: string, count: number }[]
  quiz: { attempts: number, avgScorePct: number }
}
const { data: stats } = await useLazyAsyncData('admin-stats', () => $fetch<Stats>('/api/admin/stats'), { server: false, immediate: false })
watch(isAdmin, ok => ok && refreshNuxtData('admin-stats'), { immediate: true })

const overviewTiles = computed(() => {
  const t = stats.value?.totals
  if (!t) return []
  return [
    { label: 'Visitors · 7 days', value: t.visitors7d, to: 'analytics' as Tab },
    { label: 'Page views · 7 days', value: t.views7d, to: 'analytics' as Tab },
    { label: 'Users', value: t.users, to: 'users' as Tab },
    { label: 'New users · 7 days', value: t.signups7d, to: 'users' as Tab },
    { label: 'Lessons completed', value: t.lessonsCompleted, to: null },
    { label: 'Quiz attempts', value: t.quizAttempts, to: null },
    { label: 'Pro members', value: t.proMembers, to: 'users' as Tab },
    { label: 'New leads', value: t.newLeads, to: 'leads' as Tab },
    { label: 'Leads · 30 days', value: t.leads30d, to: 'leads' as Tab },
    { label: 'On section waitlists', value: t.waitlist, to: null },
    { label: 'Pending submissions', value: t.pendingSubmissions, to: 'submissions' as Tab },
    { label: 'Comments', value: t.comments, to: 'comments' as Tab }
  ]
})
const seriesBars = (s?: { day: string, count: number }[]) => (s ?? []).map((d, i, all) => ({
  label: i % 2 === 0 ? d.day.slice(5) : '',
  value: d.count,
  tone: i === all.length - 1 ? 'signal' as const : 'tide' as const,
  title: `${d.day} · ${d.count}`
}))

/* --- Users ----------------------------------------------------------------- */
interface AdminUser {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
  emailVerified: boolean
  points: number
  lessonsDone: number
  quizzes: number
  comments: number
  lastLessonAt: string | null
  isDemo: boolean
  admin: boolean
  pro: boolean
  proUntil: string | null
}
const { data: users, refresh: refreshUsers } = await useLazyAsyncData('admin-users', () =>
  $fetch<{ users: AdminUser[] }>('/api/admin/users').then(r => r.users), { server: false, immediate: false, default: () => [] })
const userQuery = ref('')
const shownUsers = computed(() => {
  const q = userQuery.value.trim().toLowerCase()
  return q ? users.value.filter(u => `${u.email} ${u.name ?? ''}`.toLowerCase().includes(q)) : users.value
})
const newUser = reactive({ email: '', name: '' })
const created = ref<{ email: string, temporaryPassword: string } | null>(null)
const busy = ref(false)
const error = ref('')
async function createUser() {
  busy.value = true
  error.value = ''
  try {
    created.value = await $fetch<{ email: string, temporaryPassword: string }>('/api/admin/users', { method: 'POST', body: { ...newUser } })
    newUser.email = ''
    newUser.name = ''
    await refreshUsers()
  } catch (e) {
    error.value = apiError(e) || 'Could not create the user.'
  } finally {
    busy.value = false
  }
}

async function setPro(u: AdminUser, pro: boolean, months?: number) {
  busy.value = true
  try {
    await $fetch('/api/admin/pro', { method: 'POST', body: { userId: u.id, pro, months } })
    await refreshUsers()
  } catch (e) {
    error.value = apiError(e) || 'Could not change Pro.'
  } finally {
    busy.value = false
  }
}

/* --- Submissions ------------------------------------------------------------ */
interface Submission {
  id: number
  kind: string
  title: string
  url: string | null
  description: string
  tags: string[]
  status: string
  createdAt: string
  submittedBy: { name: string | null, email: string | null }
}
const queueStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const { data: queue, refresh: refreshQueue } = await useLazyAsyncData('admin-queue', () =>
  $fetch<{ submissions: Submission[] }>('/api/admin/submissions', { query: { status: queueStatus.value } }).then(r => r.submissions),
{ server: false, immediate: false, default: () => [], watch: [queueStatus] })
async function review(item: Submission, action: 'approve' | 'reject' | 'delete') {
  busy.value = true
  try {
    await $fetch('/api/admin/submissions', { method: 'PATCH', body: { id: item.id, action } })
    await refreshQueue()
  } catch (e) {
    error.value = apiError(e) || 'Could not update the submission.'
  } finally {
    busy.value = false
  }
}

/* --- Interview questions ---------------------------------------------------- */
interface InterviewItem { id: number, slug: string, question: string, answer: string, type: string, topic: string, level: string, company: string | null, role: string | null, status: string, createdAt: string, email: string | null }
const iqStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const { data: iq, refresh: refreshIq } = await useLazyAsyncData('admin-interview', () =>
  $fetch<InterviewItem[]>('/api/admin/interview', { query: { status: iqStatus.value } }), { server: false, immediate: false, default: () => [], watch: [iqStatus] })
async function reviewIq(item: InterviewItem, action: 'approve' | 'reject' | 'delete') {
  busy.value = true
  try {
    await $fetch('/api/admin/interview', { method: 'PATCH', body: { id: item.id, action } })
    await refreshIq()
  } catch (e) {
    error.value = apiError(e) || 'Could not update the question.'
  } finally {
    busy.value = false
  }
}

watch(isAdmin, (ok) => {
  if (!ok) return
  refreshUsers()
  refreshQueue()
  refreshIq()
}, { immediate: true })

// Live counts beside each section, and the overview's to-do list.
const pendingIq = computed(() => iqStatus.value === 'pending' ? iq.value.length : 0)
function badge(key: Tab) {
  if (key === 'submissions') return stats.value?.totals.pendingSubmissions ?? 0
  if (key === 'leads') return stats.value?.totals.newLeads ?? 0
  if (key === 'interview') return pendingIq.value
  return 0
}
const attention = computed(() => [
  { tab: 'leads' as Tab, icon: 'i-lucide-handshake', n: badge('leads'), label: `${badge('leads')} new lead(s) to follow up` },
  { tab: 'submissions' as Tab, icon: 'i-lucide-inbox', n: badge('submissions'), label: `${badge('submissions')} submission(s) to review` },
  { tab: 'interview' as Tab, icon: 'i-lucide-messages-square', n: pendingIq.value, label: `${pendingIq.value} interview question(s) to review` }
].filter(a => a.n > 0))

// The services this site runs on, one click away.
const SERVICES = [
  { label: 'Cloudflare', icon: 'i-simple-icons-cloudflare', to: 'https://dash.cloudflare.com/389ebc0d5a66f36d522736d3dac41aae/workers/services/view/crm-analytics-academy/production' },
  { label: 'Neon', icon: 'i-lucide-database', to: 'https://console.neon.tech/' },
  { label: 'AdSense', icon: 'i-simple-icons-googleadsense', to: 'https://adsense.google.com/' },
  { label: 'Search Console', icon: 'i-simple-icons-googlesearchconsole', to: 'https://search.google.com/search-console?resource_id=sc-domain%3Aimswarnil.com' },
  { label: 'YouTube Studio', icon: 'i-simple-icons-youtube', to: 'https://studio.youtube.com/' },
  { label: 'Deploys', icon: 'i-simple-icons-githubactions', to: 'https://github.com/imswarnil/CRM-Analytics-Academy/actions' }
]

// Keyboard: 1–7 switch sections (ignored while typing).
function onKey(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  if (e.metaKey || e.ctrlKey || e.altKey || el?.closest('input, textarea, select, [contenteditable]')) return
  const t = TABS[Number(e.key) - 1]
  if (t) tab.value = t.key
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const date = (d: string | null) => d ? new Date(d).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' }) : '—'
</script>

<template>
  <div>
    <div
      v-if="meStatus === 'pending' || !me"
      class="py-32 text-center font-mono text-xs uppercase tracking-[.12em] text-(--ink2)"
    >
      Checking access…
    </div>

    <div
      v-else-if="!isAdmin"
      class="mx-auto max-w-xl py-32 text-center"
    >
      <p class="eyebrow">
        404
      </p>
      <h1 class="bp-h2 mt-4">
        Not found
      </h1>
      <UButton
        to="/dashboard"
        class="mt-8"
        trailing-icon="i-lucide-arrow-right"
      >
        Your dashboard
      </UButton>
    </div>

    <template v-else>
      <BpPageHeader
        sheet="Sheet 00 / Admin"
        title="Admin console"
        :lead="`Signed in as ${me.email}. Content lives in Nuxt Studio.`"
      >
        <div class="mt-6 flex flex-wrap gap-2">
          <UButton
            to="/_studio"
            external
            icon="i-lucide-pen-line"
            label="Edit content (Studio)"
          />
          <UButton
            v-for="l in SERVICES"
            :key="l.label"
            :to="l.to"
            target="_blank"
            :icon="l.icon"
            :label="l.label"
            color="neutral"
            variant="outline"
          />
        </div>
      </BpPageHeader>

      <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:px-8">
        <nav
          class="lg:sticky lg:top-24 lg:self-start"
          aria-label="Admin sections"
        >
          <ul class="flex gap-1 overflow-x-auto lg:flex-col">
            <li
              v-for="(tb, i) in TABS"
              :key="tb.key"
            >
              <button
                type="button"
                class="flex min-h-11 w-full items-center gap-3 whitespace-nowrap px-3 text-start text-[15px] font-semibold"
                :class="tab === tb.key ? 'bg-(--ink) text-(--paper)' : 'text-(--ink) hover:bg-(--ice)'"
                :aria-current="tab === tb.key ? 'page' : undefined"
                @click="tab = tb.key"
              >
                <UIcon
                  :name="tb.icon"
                  class="size-5 shrink-0"
                />
                <span class="flex-1">{{ tb.label }}</span>
                <span
                  v-if="badge(tb.key)"
                  class="min-w-6 bg-(--signal) px-1.5 text-center font-mono text-xs text-white"
                >{{ badge(tb.key) }}</span>
                <kbd class="hidden font-mono text-[10px] opacity-50 lg:inline">{{ i + 1 }}</kbd>
              </button>
            </li>
          </ul>
        </nav>

        <div class="min-w-0">
          <UAlert
            v-if="error"
            class="mb-6"
            color="error"
            variant="subtle"
            :title="error"
            :close="{ onClick: () => { error = '' } }"
          />

          <!-- ============================ OVERVIEW ============================ -->
          <section
            v-if="tab === 'overview'"
            class="space-y-6"
          >
            <div
              v-if="attention.length"
              class="border-[1.5px] border-(--ink) bg-(--ice) p-5"
            >
              <p class="eyebrow">
                Needs your attention
              </p>
              <ul class="mt-3 flex flex-wrap gap-3">
                <li
                  v-for="a in attention"
                  :key="a.label"
                >
                  <UButton
                    :icon="a.icon"
                    :label="a.label"
                    @click="tab = a.tab"
                  />
                </li>
              </ul>
            </div>
            <p
              v-else
              class="flex items-center gap-2 border-[1.5px] border-dashed border-(--line) p-4 text-(--ink2)"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="size-5 text-(--signal)"
              /> Inbox zero — nothing waiting for review.
            </p>

            <dl class="grid grid-cols-2 border-s-[1.5px] border-t-[1.5px] border-(--ink) sm:grid-cols-4">
              <component
                :is="tile.to ? 'button' : 'div'"
                v-for="tile in overviewTiles"
                :key="tile.label"
                type="button"
                class="flex flex-col-reverse border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-4 text-start"
                :class="tile.to ? 'hover:bg-(--ice)' : ''"
                @click="tile.to && (tab = tile.to)"
              >
                <dd class="mt-1 text-3xl font-black tabular-nums tracking-[-0.03em] text-(--ink)">
                  {{ tile.value.toLocaleString() }}
                </dd>
                <dt class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
                  {{ tile.label }}
                </dt>
              </component>
            </dl>

            <div class="grid gap-6 lg:grid-cols-2">
              <section class="border-[1.5px] border-(--ink) bg-(--card)">
                <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
                  <p class="eyebrow">
                    Sign-ups · 14 days
                  </p>
                </header>
                <div class="graph-paper-fine p-5">
                  <BpBarChart
                    :bars="seriesBars(stats?.series.signups)"
                    :height="140"
                  />
                </div>
              </section>
              <section class="border-[1.5px] border-(--ink) bg-(--card)">
                <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
                  <p class="eyebrow">
                    Lessons completed · 14 days
                  </p>
                </header>
                <div class="graph-paper-fine p-5">
                  <BpBarChart
                    :bars="seriesBars(stats?.series.progress)"
                    :height="140"
                  />
                </div>
              </section>
              <section class="border-[1.5px] border-(--ink) bg-(--card)">
                <header class="flex justify-between border-b-[1.5px] border-(--ink) px-5 py-3">
                  <p class="eyebrow">
                    Most completed lessons
                  </p>
                  <span class="font-mono text-xs text-(--ink2)">quiz avg {{ stats?.quiz.avgScorePct ?? 0 }}%</span>
                </header>
                <p
                  v-if="!stats?.topLessons.length"
                  class="p-5 text-sm text-(--ink2)"
                >
                  Nothing completed yet.
                </p>
                <p
                  v-for="l in stats?.topLessons"
                  :key="l.path"
                  class="flex justify-between border-b border-dashed border-(--line) px-5 py-2 text-sm last:border-b-0"
                >
                  <NuxtLink
                    :to="l.path"
                    class="truncate font-mono text-xs hover:text-(--signal)"
                  >{{ l.path }}</NuxtLink><span class="font-mono text-xs">{{ l.count }}</span>
                </p>
              </section>
              <section class="graph-paper-navy border-[1.5px] border-(--ink) bg-(--navy) p-5 text-white">
                <p class="font-mono text-[10px] uppercase tracking-[.12em] text-(--glow)">
                  Publishing
                </p>
                <ol class="mt-3 list-decimal space-y-2 ps-5 text-sm text-white/85">
                  <li>
                    Edit English lessons in <a
                      href="/_studio"
                      class="underline"
                    >Nuxt Studio</a> (commits to main) or in <code>content/en/</code>.
                  </li>
                  <li>Locally: <code>pnpm build</code> translates into 11 languages with the local LibreTranslate.</li>
                  <li>Commit and push — Cloudflare deploys.</li>
                  <li>Videos: <code>pnpm fcp &lt;route&gt;</code> → Final Cut Pro → YouTube → <code>video: {id}</code>.</li>
                </ol>
              </section>
            </div>
          </section>

          <!-- ============================ ANALYTICS =========================== -->
          <AdminAnalytics v-else-if="tab === 'analytics'" />

          <!-- ============================== LEADS ============================= -->
          <AdminLeads v-else-if="tab === 'leads'" />

          <!-- ============================== USERS ============================= -->
          <section
            v-else-if="tab === 'users'"
            class="space-y-6"
          >
            <div class="flex flex-wrap items-end gap-3">
              <UInput
                v-model="userQuery"
                icon="i-lucide-search"
                placeholder="Search name or email"
                class="w-72"
              />
              <span class="font-mono text-xs uppercase tracking-[.1em] text-(--ink2)">{{ shownUsers.length }} of {{ users.length }}</span>
              <form
                class="ms-auto flex flex-wrap items-end gap-2"
                @submit.prevent="createUser"
              >
                <UInput
                  v-model="newUser.email"
                  type="email"
                  required
                  placeholder="new@email.com"
                />
                <UInput
                  v-model="newUser.name"
                  placeholder="Name (optional)"
                />
                <UButton
                  type="submit"
                  icon="i-lucide-user-plus"
                  :loading="busy"
                >
                  Create user
                </UButton>
              </form>
            </div>
            <UAlert
              v-if="created"
              color="info"
              variant="subtle"
              icon="i-lucide-key-round"
              :title="`Created ${created.email}`"
              :description="`Temporary password (shown once): ${created.temporaryPassword}`"
              :close="{ onClick: () => { created = null } }"
            />
            <div class="overflow-x-auto border-[1.5px] border-(--ink) bg-(--card)">
              <table class="w-full min-w-[56rem] text-sm">
                <thead class="bg-(--ice) font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                  <tr>
                    <th class="px-4 py-2 text-start">
                      User
                    </th>
                    <th class="px-3 py-2 text-start">
                      Joined
                    </th>
                    <th class="px-3 py-2 text-end">
                      Lessons
                    </th>
                    <th class="px-3 py-2 text-end">
                      Quizzes
                    </th>
                    <th class="px-3 py-2 text-end">
                      Comments
                    </th>
                    <th class="px-3 py-2 text-end">
                      Points
                    </th>
                    <th class="px-4 py-2 text-end">
                      Last lesson
                    </th>
                    <th class="px-4 py-2 text-end">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="u in shownUsers"
                    :key="u.id"
                    class="border-t border-dashed border-(--line)"
                  >
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-2">
                        <span class="flex size-7 flex-none items-center justify-center overflow-hidden border-[1.5px] border-(--ink) bg-(--signal) text-xs font-bold text-white">
                          <img
                            v-if="u.image"
                            :src="u.image"
                            alt=""
                            class="size-full object-cover"
                          >
                          <template v-else>{{ (u.name || u.email).slice(0, 1).toUpperCase() }}</template>
                        </span>
                        <span class="min-w-0">
                          <span class="block truncate font-semibold">{{ u.name || '—' }}
                            <UBadge
                              v-if="u.admin"
                              label="admin"
                              size="sm"
                            />
                            <UBadge
                              v-if="u.isDemo"
                              label="demo"
                              size="sm"
                              color="neutral"
                              variant="outline"
                            />
                          </span>
                          <span class="block truncate font-mono text-xs text-(--ink2)">{{ u.email }}<UIcon
                            v-if="u.emailVerified"
                            name="i-lucide-badge-check"
                            class="ms-1 text-(--signal)"
                          /></span>
                        </span>
                      </div>
                    </td>
                    <td class="px-3 py-2 font-mono text-xs">
                      {{ date(u.createdAt) }}
                    </td>
                    <td class="px-3 py-2 text-end tabular-nums">
                      {{ u.lessonsDone }}
                    </td>
                    <td class="px-3 py-2 text-end tabular-nums">
                      {{ u.quizzes }}
                    </td>
                    <td class="px-3 py-2 text-end tabular-nums">
                      {{ u.comments }}
                    </td>
                    <td class="px-3 py-2 text-end tabular-nums">
                      {{ u.points }}
                    </td>
                    <td class="px-4 py-2 text-end font-mono text-xs">
                      {{ date(u.lastLessonAt) }}
                    </td>
                    <td class="px-4 py-2 text-end">
                      <div class="flex items-center justify-end gap-1">
                        <span
                          v-if="u.pro"
                          class="font-mono text-[11px] text-(--signal)"
                        >{{ u.proUntil ? `until ${date(u.proUntil)}` : 'no end' }}</span>
                        <UButton
                          v-if="!u.pro"
                          size="xs"
                          label="Grant 12 mo"
                          :disabled="busy"
                          @click="setPro(u, true, 12)"
                        />
                        <UButton
                          v-if="!u.pro"
                          size="xs"
                          color="neutral"
                          variant="outline"
                          label="1 mo"
                          :disabled="busy"
                          @click="setPro(u, true, 1)"
                        />
                        <UButton
                          v-else
                          size="xs"
                          color="neutral"
                          variant="ghost"
                          label="Revoke"
                          :disabled="busy"
                          @click="setPro(u, false)"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- =========================== SUBMISSIONS ========================== -->
          <section v-else-if="tab === 'submissions'">
            <div class="mb-4 flex gap-2">
              <UButton
                v-for="s in (['pending', 'approved', 'rejected'] as const)"
                :key="s"
                :label="s"
                :color="queueStatus === s ? 'primary' : 'neutral'"
                :variant="queueStatus === s ? 'solid' : 'outline'"
                size="xs"
                @click="queueStatus = s"
              />
            </div>
            <p
              v-if="!queue.length"
              class="py-12 text-center text-sm text-(--ink2)"
            >
              Nothing {{ queueStatus }}.
            </p>
            <ul class="space-y-4">
              <li
                v-for="item in queue"
                :key="item.id"
                class="bp-card p-5"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge
                    :label="item.kind"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                  />
                  <span class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">{{ item.submittedBy.email || 'unknown' }} · {{ date(item.createdAt) }}</span>
                </div>
                <p class="mt-2 font-semibold text-(--ink)">
                  {{ item.title }}
                </p>
                <!-- An unreviewed link from a stranger: nofollow, ugc. -->
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener nofollow ugc"
                  class="text-sm break-all text-(--signal)"
                >{{ item.url }}</a>
                <p class="mt-2 text-sm whitespace-pre-line text-(--ink2)">
                  {{ item.description }}
                </p>
                <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-(--line) pt-4">
                  <UButton
                    label="Approve"
                    icon="i-lucide-check"
                    size="sm"
                    :disabled="busy || item.status === 'approved'"
                    @click="review(item, 'approve')"
                  />
                  <UButton
                    label="Reject"
                    icon="i-lucide-x"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    :disabled="busy || item.status === 'rejected'"
                    @click="review(item, 'reject')"
                  />
                  <UButton
                    label="Delete"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="sm"
                    class="ms-auto"
                    :disabled="busy"
                    @click="review(item, 'delete')"
                  />
                </div>
              </li>
            </ul>
          </section>

          <!-- ========================= INTERVIEW Q&A ========================== -->
          <section v-else-if="tab === 'interview'">
            <p class="mb-4 border-s-[3px] border-(--signal) bg-(--ice) px-4 py-3 text-sm text-(--ink)">
              Approving does not publish yet: your next local <code>pnpm build</code> writes approved questions to
              <code>content/en/interview-questions/</code>, translates them, and they go live with the push.
            </p>
            <div class="mb-4 flex gap-2">
              <UButton
                v-for="st in (['pending', 'approved', 'rejected'] as const)"
                :key="st"
                :label="st"
                :color="iqStatus === st ? 'primary' : 'neutral'"
                :variant="iqStatus === st ? 'solid' : 'outline'"
                size="xs"
                @click="iqStatus = st"
              />
              <span class="ms-auto font-mono text-xs text-(--ink2)">Community submissions only; the Academy's own are seeded from server/db/seed.</span>
            </div>
            <p
              v-if="!iq.length"
              class="py-12 text-center text-sm text-(--ink2)"
            >
              Nothing {{ iqStatus }}.
            </p>
            <ul class="space-y-4">
              <li
                v-for="item in iq"
                :key="item.id"
                class="bp-card p-5"
              >
                <p class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
                  {{ item.type }} · {{ item.level }} · {{ item.topic }}<span v-if="item.company"> · {{ item.company }}</span><span v-if="item.role"> · {{ item.role }}</span> · {{ item.email || 'unknown' }} · {{ date(item.createdAt) }}
                </p>
                <p class="mt-2 text-lg font-bold text-(--ink)">
                  {{ item.question }}
                </p>
                <div class="bp-prose mt-3 max-h-80 overflow-y-auto border border-dashed border-(--line) p-3 text-sm">
                  <!-- Shown as plain text: this is unreviewed community input,
                       and rendering it would run its markup in the admin's
                       session. -->
                  <pre class="whitespace-pre-wrap font-sans text-sm text-(--ink)">{{ item.answer }}</pre>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-(--line) pt-4">
                  <UButton
                    label="Approve"
                    icon="i-lucide-check"
                    size="sm"
                    :disabled="busy || item.status === 'approved'"
                    @click="reviewIq(item, 'approve')"
                  />
                  <UButton
                    label="Reject"
                    icon="i-lucide-x"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    :disabled="busy || item.status === 'rejected'"
                    @click="reviewIq(item, 'reject')"
                  />
                  <UButton
                    v-if="item.status === 'approved'"
                    :to="`/interview-questions/${item.slug}`"
                    target="_blank"
                    label="View"
                    icon="i-lucide-external-link"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                  />
                  <UButton
                    label="Delete"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="sm"
                    class="ms-auto"
                    :disabled="busy"
                    @click="reviewIq(item, 'delete')"
                  />
                </div>
              </li>
            </ul>
          </section>

          <!-- ============================ COMMENTS ============================ -->
          <AdminComments v-else-if="tab === 'comments'" />
        </div>
      </div>
    </template>
  </div>
</template>
