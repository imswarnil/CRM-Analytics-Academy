<script setup lang="ts">
/**
 * /admin — users, roles and the moderation queue.
 *
 * Deliberately NOT translated. Every other user-facing string on this site
 * lives in i18n/locales/en.json and is machine-translated into eleven
 * languages; this screen is an internal tool with one operator, and putting
 * it through that pipeline would mean ~60 more keys translated into languages
 * nobody will administer the site in.
 *
 * The page is also not the security boundary. It asks /api/admin/me to decide
 * whether to render, but every route it calls re-checks the role server-side —
 * anything decided here can be skipped by not running the client.
 */
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Admin',
  robots: 'noindex, nofollow'
})

const tab = ref<'overview' | 'users' | 'queue' | 'content'>('overview')

const { data: me } = await useLazyAsyncData('admin-me', () =>
  $fetch<{ signedIn: boolean, role: string | null, email?: string }>('/api/admin/me'), {
  server: false,
  default: () => ({ signedIn: false, role: null as string | null, email: undefined as string | undefined })
})

const isAdmin = computed(() => me.value?.role === 'admin')
const isModerator = computed(() => me.value?.role === 'admin' || me.value?.role === 'moderator')

interface AdminUser {
  id: string
  email: string
  name: string | null
  createdAt: string
  emailVerified: boolean
  role: string
  points: number
  lessonsDone: number
  pendingSubmissions: number
  isDemo: boolean
  pro: boolean
  // True when the role comes from the ADMIN_EMAILS allowlist rather than
  // app.user_role — writing a role for them would be overridden by the env.
  roleLocked: boolean
}

interface QueueItem {
  id: number
  kind: string
  title: string
  url: string | null
  description: string
  tags: string[]
  imageUrl: string | null
  status: string
  createdAt: string
  submittedBy: { name: string | null, email: string | null }
}

interface SeriesPoint {
  day: string
  count: number
}

interface AdminStats {
  totals: {
    users: number
    pendingSubmissions: number
    approvedSubmissions: number
    rejectedSubmissions: number
    lessonsCompleted: number
    quizAttempts: number
  }
  series: {
    submissions: SeriesPoint[]
    progress: SeriesPoint[]
    // Empty (not zeros) when neon_auth."user" is unreadable — the chart hides.
    signups?: SeriesPoint[]
  }
  topLessons?: TopLesson[]
  quiz?: QuizStats
}

interface TopLesson {
  path: string
  count: number
}

interface QuizStats {
  attempts: number
  avgScorePct: number
}

const users = ref<AdminUser[]>([])
const queue = ref<QueueItem[]>([])
const stats = ref<AdminStats | null>(null)
const queueStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const busy = ref(false)
const error = ref('')

async function loadUsers() {
  if (!isAdmin.value) return
  try {
    const r = await $fetch<{ users: AdminUser[] }>('/api/admin/users')
    users.value = r.users
  } catch (e) { error.value = msg(e) }
}

async function loadQueue() {
  if (!isModerator.value) return
  try {
    const r = await $fetch<{ submissions: QueueItem[] }>('/api/admin/submissions', {
      query: { status: queueStatus.value }
    })
    queue.value = r.submissions
  } catch (e) { error.value = msg(e) }
}

async function loadStats() {
  if (!isAdmin.value) return
  try {
    stats.value = await $fetch<AdminStats>('/api/admin/stats')
  } catch (e) { error.value = msg(e) }
}

function msg(e: unknown) {
  return (e as { statusMessage?: string })?.statusMessage || 'Something went wrong.'
}

watch(isModerator, (ok) => {
  if (!ok) return
  loadQueue()
  // Moderators cannot read /api/admin/stats, so the default Overview tab is
  // useless to them — land them on the queue instead.
  if (!isAdmin.value && tab.value === 'overview') tab.value = 'queue'
}, { immediate: true })
watch(isAdmin, (ok) => {
  if (!ok) return
  loadUsers()
  loadStats()
}, { immediate: true })
watch(queueStatus, loadQueue)

/* --- Overview ----------------------------------------------------------- */
// When the database is fresh (every number zero), the dashboard demonstrates
// its full shape with clearly-labelled sample data instead of a wall of
// zeros. The wobble is index math, not Math.random, so it is deterministic.
const SAMPLE_TOTALS = {
  users: 128,
  pendingSubmissions: 6,
  approvedSubmissions: 42,
  rejectedSubmissions: 9,
  lessonsCompleted: 913,
  quizAttempts: 357
}

function lastDays(n: number): string[] {
  const out: string[] = []
  const now = Date.now()
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(now - i * 86400000).toISOString().slice(0, 10))
  }
  return out
}

function sampleSeries(): Required<AdminStats['series']> {
  const days = lastDays(14)
  return {
    submissions: days.map((day, i) => ({ day, count: 1 + ((i * 7) % 13) % 9 })),
    progress: days.map((day, i) => ({ day, count: 3 + ((i * 5 + 4) % 11) })),
    signups: days.map((day, i) => ({ day, count: 1 + ((i * 3 + 2) % 7) }))
  }
}

const SAMPLE_TOP_LESSONS: TopLesson[] = [
  { path: '/foundations/what-is-crm-analytics', count: 74 },
  { path: '/creating-datasets/recipes-vs-dataflows', count: 61 },
  { path: '/lenses-and-explorations/saql-basics', count: 48 },
  { path: '/designing-dashboards/bindings', count: 39 },
  { path: '/setup/enable-crm-analytics', count: 31 }
]

const SAMPLE_QUIZ: QuizStats = { attempts: 357, avgScorePct: 78 }

function statsEmpty(s: AdminStats) {
  return Object.values(s.totals).every(v => !v)
    && s.series.submissions.every(p => !p.count)
    && s.series.progress.every(p => !p.count)
}

const sampleActive = computed(() => !stats.value || statsEmpty(stats.value))
const displayTotals = computed(() => {
  const s = stats.value
  return !s || statsEmpty(s) ? SAMPLE_TOTALS : s.totals
})
const displaySeries = computed(() => {
  const s = stats.value
  return !s || statsEmpty(s) ? sampleSeries() : s.series
})

const statCards = computed(() => [
  { label: 'Users', icon: 'i-lucide-users', value: displayTotals.value.users },
  { label: 'Pending review', icon: 'i-lucide-inbox', value: displayTotals.value.pendingSubmissions },
  { label: 'Approved', icon: 'i-lucide-circle-check', value: displayTotals.value.approvedSubmissions },
  { label: 'Lessons completed', icon: 'i-lucide-book-open-check', value: displayTotals.value.lessonsCompleted },
  { label: 'Quiz attempts', icon: 'i-lucide-list-checks', value: displayTotals.value.quizAttempts }
])

// Inline SVG geometry. 280×140 viewBox, stretched to the card's width; the
// bottom 18 units are breathing room above the baseline.
const CHART_W = 280
const CHART_H = 140
const CHART_PAD = 18

const submissionBars = computed(() => {
  const s = displaySeries.value.submissions
  const max = Math.max(1, ...s.map(p => p.count))
  const bw = CHART_W / Math.max(1, s.length)
  return s.map((p, i) => {
    const h = (p.count / max) * (CHART_H - CHART_PAD - 8)
    return {
      x: +(i * bw + 2).toFixed(1),
      y: +(CHART_H - CHART_PAD - h).toFixed(1),
      w: +(bw - 4).toFixed(1),
      h: +h.toFixed(1)
    }
  })
})

const progressLine = computed(() => {
  const s = displaySeries.value.progress
  const max = Math.max(1, ...s.map(p => p.count))
  const step = CHART_W / Math.max(1, s.length - 1)
  const pts = s.map((p, i) => {
    const y = CHART_H - CHART_PAD - (p.count / max) * (CHART_H - CHART_PAD - 8)
    return `${(i * step).toFixed(1)},${y.toFixed(1)}`
  })
  return {
    line: pts.join(' '),
    area: `0,${CHART_H - CHART_PAD} ${pts.join(' ')} ${CHART_W},${CHART_H - CHART_PAD}`
  }
})

const displaySignups = computed(() => {
  const s = stats.value
  if (!s || statsEmpty(s)) return sampleSeries().signups
  return s.series.signups ?? []
})

const signupLine = computed(() => {
  const s = displaySignups.value
  const max = Math.max(1, ...s.map(p => p.count))
  const step = CHART_W / Math.max(1, s.length - 1)
  return s.map((p, i) => {
    const y = CHART_H - CHART_PAD - (p.count / max) * (CHART_H - CHART_PAD - 8)
    return `${(i * step).toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})

const displayTopLessons = computed(() => {
  const s = stats.value
  if (!s || statsEmpty(s)) return SAMPLE_TOP_LESSONS
  return s.topLessons ?? []
})

const topLessonMax = computed(() => Math.max(1, ...displayTopLessons.value.map(l => l.count)))

const displayQuiz = computed(() => {
  const s = stats.value
  if (!s || statsEmpty(s) || !s.quiz) return SAMPLE_QUIZ
  return s.quiz
})

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmtDay(day: string) {
  const parts = day.split('-')
  const m = Number(parts[1])
  const d = Number(parts[2])
  if (!m || !d) return day
  return `${MONTHS[m - 1]} ${d}`
}

// Sparse labels: only the first and last day of the window.
const dayLabels = computed(() => {
  const s = displaySeries.value.submissions
  const first = s[0]
  const last = s[s.length - 1]
  if (!first || !last) return { first: '', last: '' }
  return { first: fmtDay(first.day), last: fmtDay(last.day) }
})

async function setRole(u: AdminUser, role: string) {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'PATCH', body: { userId: u.id, role } })
    await loadUsers()
  } catch (e) {
    error.value = msg(e)
  } finally {
    busy.value = false
  }
}

async function togglePro(u: AdminUser) {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'PATCH', body: { userId: u.id, pro: !u.pro } })
    await loadUsers()
  } catch (e) {
    error.value = msg(e)
  } finally {
    busy.value = false
  }
}

async function review(item: QueueItem, action: 'approve' | 'reject' | 'delete') {
  // Deleting destroys the row and the person is never told why — reserved for
  // spam, and worth a confirm because rejection is almost always the right
  // action instead.
  if (action === 'delete' && !confirm(`Permanently delete "${item.title}"? Rejecting instead keeps it and tells the author why.`)) return
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/submissions', { method: 'PATCH', body: { id: item.id, action } })
    await loadQueue()
  } catch (e) {
    error.value = msg(e)
  } finally {
    busy.value = false
  }
}

/* --- Create user -------------------------------------------------------- */
const newUser = reactive({ email: '', name: '', role: 'learner' })
const created = ref<{ email: string, temporaryPassword: string } | null>(null)

async function createUser() {
  busy.value = true
  error.value = ''
  created.value = null
  try {
    created.value = await $fetch('/api/admin/users', { method: 'POST', body: { ...newUser } })
    Object.assign(newUser, { email: '', name: '', role: 'learner' })
    await loadUsers()
  } catch (e) {
    error.value = msg(e)
  } finally {
    busy.value = false
  }
}

const roles = ['learner', 'moderator', 'admin']

/* --- Content studio ------------------------------------------------------ */
// Edits English lessons straight against the GitHub repo (via
// /api/admin/content/*). Publishing commits to main, which kicks off the
// translate workflow and the Pages deploy — the same pipeline as a local push.
interface ContentFile {
  path: string
  size: number
}

interface PublishResult {
  path: string
  sha: string
  commitSha: string
  commitUrl: string | null
}

const CONTENT_PREFIX = 'content/en/'

// Mirrors the docs schema in content.config.ts: title + description are
// required; video and interview are the optional extras worth remembering.
const NEW_LESSON_TEMPLATE = `---
title: Lesson title
description: One-sentence summary shown in navigation and search results.
# Optional YouTube clip rendered above the lesson body:
# video:
#   id: YOUTUBE_VIDEO_ID
#   start: 0
#   end: 120
# Optional interview/quiz Q&A rendered after the body (also FAQPage JSON-LD):
# interview:
#   - q: A question a candidate should be able to answer?
#     a: The model answer.
---

Write the lesson body in markdown here.
`

const contentTree = ref<ContentFile[]>([])
const contentTreeLoaded = ref(false)
const contentTreeLoading = ref(false)
const contentError = ref('')
const activePath = ref('')
const newPath = ref('')
const isNewFile = ref(false)
const fileSha = ref('')
const fileLoading = ref(false)
const editorText = ref('')
const loadedText = ref('')
const commitMessage = ref('')
const publishing = ref(false)
const published = ref<PublishResult | null>(null)

const contentDirty = computed(() => editorText.value !== loadedText.value)

const contentModules = computed(() => {
  const groups = new Map<string, ContentFile[]>()
  for (const f of contentTree.value) {
    const rel = f.path.slice(CONTENT_PREFIX.length)
    const slash = rel.indexOf('/')
    const dir = slash === -1 ? '(top level)' : rel.slice(0, slash)
    const list = groups.get(dir) || []
    list.push(f)
    groups.set(dir, list)
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, files]) => ({ name, files }))
})

function fileLabel(f: ContentFile) {
  const rel = f.path.slice(CONTENT_PREFIX.length)
  const slash = rel.indexOf('/')
  return slash === -1 ? rel : rel.slice(slash + 1)
}

async function loadContentTree() {
  contentTreeLoading.value = true
  contentError.value = ''
  try {
    contentTree.value = await $fetch<ContentFile[]>('/api/admin/content/tree')
    contentTreeLoaded.value = true
  } catch (e) {
    contentError.value = msg(e)
  } finally {
    contentTreeLoading.value = false
  }
}

function confirmDiscard() {
  return !contentDirty.value
    || confirm(`Discard unsaved changes to ${activePath.value || 'the new lesson'}?`)
}

async function openContentFile(path: string) {
  if (path === activePath.value && !isNewFile.value) return
  if (!confirmDiscard()) return
  fileLoading.value = true
  contentError.value = ''
  published.value = null
  try {
    const r = await $fetch<{ path: string, sha: string, content: string }>('/api/admin/content/file', {
      query: { path }
    })
    activePath.value = r.path
    fileSha.value = r.sha
    editorText.value = r.content
    loadedText.value = r.content
    commitMessage.value = ''
    isNewFile.value = false
  } catch (e) {
    contentError.value = msg(e)
  } finally {
    fileLoading.value = false
  }
}

function startNewLesson() {
  if (!confirmDiscard()) return
  published.value = null
  contentError.value = ''
  isNewFile.value = true
  activePath.value = ''
  fileSha.value = ''
  newPath.value = 'content/en/<module>/<NN.slug>.md'
  editorText.value = NEW_LESSON_TEMPLATE
  loadedText.value = ''
  commitMessage.value = ''
}

// Client-side mirror of the server's path rule — the server re-validates, this
// just keeps the Publish button honest. '<' blocks the untouched placeholder.
function validLessonPath(p: string) {
  return p.startsWith(CONTENT_PREFIX) && p.endsWith('.md') && !p.includes('..') && !p.includes('<')
}

const publishPath = computed(() => (isNewFile.value ? newPath.value.trim() : activePath.value))
const canPublish = computed(() =>
  !publishing.value
  && !fileLoading.value
  && editorText.value.trim().length > 0
  && validLessonPath(publishPath.value)
  && (isNewFile.value || contentDirty.value)
)

async function publishContent() {
  const path = publishPath.value
  if (!validLessonPath(path)) {
    contentError.value = 'Path must look like content/en/<module>/<NN.slug>.md.'
    return
  }
  if (new TextEncoder().encode(editorText.value).length > 1024 * 1024) {
    contentError.value = 'Content exceeds the 1 MB limit.'
    return
  }
  publishing.value = true
  contentError.value = ''
  published.value = null
  try {
    const r = await $fetch<PublishResult>('/api/admin/content/file', {
      method: 'PUT',
      body: {
        path,
        content: editorText.value,
        ...(fileSha.value ? { sha: fileSha.value } : {}),
        ...(commitMessage.value.trim() ? { message: commitMessage.value.trim() } : {})
      }
    })
    published.value = r
    activePath.value = r.path
    fileSha.value = r.sha
    loadedText.value = editorText.value
    isNewFile.value = false
    commitMessage.value = ''
    await loadContentTree()
  } catch (e) {
    contentError.value = msg(e)
  } finally {
    publishing.value = false
  }
}

watch(tab, (t) => {
  if (t === 'content' && isAdmin.value && !contentTreeLoaded.value && !contentTreeLoading.value) {
    loadContentTree()
  }
})
</script>

<template>
  <div>
    <!-- Signed in but not an admin: say nothing useful. The API returns 404
         for the same reason — a 403 confirms the screen exists. -->
    <UContainer
      v-if="me?.signedIn && !isModerator"
      class="py-20 text-center"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
        404
      </p>
      <p class="mt-2 text-muted">
        Not found.
      </p>
    </UContainer>

    <UContainer v-else-if="isModerator">
      <UPageHeader
        :title="tab === 'overview' ? 'Overview' : tab === 'queue' ? 'Moderation' : tab === 'content' ? 'Content Studio' : 'Users & Roles'"
        :description="tab === 'overview' ? 'Site activity at a glance.' : tab === 'queue' ? 'Community submissions awaiting review.' : tab === 'content' ? 'Edit English lessons and publish them straight to GitHub.' : 'Accounts, roles and access.'"
      >
        <template #headline>
          <nav
            class="flex items-center gap-2"
            aria-label="Admin sections"
          >
            <UButton
              v-if="isAdmin"
              icon="i-lucide-layout-dashboard"
              size="sm"
              :color="tab === 'overview' ? 'primary' : 'neutral'"
              :variant="tab === 'overview' ? 'soft' : 'ghost'"
              @click="tab = 'overview'"
            >
              Overview
            </UButton>
            <UButton
              icon="i-lucide-inbox"
              size="sm"
              :color="tab === 'queue' ? 'primary' : 'neutral'"
              :variant="tab === 'queue' ? 'soft' : 'ghost'"
              @click="tab = 'queue'"
            >
              Moderation
              <UBadge
                v-if="queue.length && queueStatus === 'pending'"
                :label="String(queue.length)"
                size="sm"
              />
            </UButton>
            <UButton
              v-if="isAdmin"
              icon="i-lucide-file-pen-line"
              size="sm"
              :color="tab === 'content' ? 'primary' : 'neutral'"
              :variant="tab === 'content' ? 'soft' : 'ghost'"
              @click="tab = 'content'"
            >
              Content
            </UButton>
            <UButton
              v-if="isAdmin"
              icon="i-lucide-users"
              size="sm"
              :color="tab === 'users' ? 'primary' : 'neutral'"
              :variant="tab === 'users' ? 'soft' : 'ghost'"
              @click="tab = 'users'"
            >
              Users & Roles
            </UButton>
          </nav>
        </template>

        <template #links>
          <div class="text-end text-xs text-muted">
            <span class="block max-w-56 truncate font-medium text-highlighted">{{ me?.email }}</span>
            <span class="block">role {{ me?.role }}</span>
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <p
          v-if="error"
          class="mb-4 text-sm text-error"
          role="alert"
        >
          {{ error }}
        </p>

        <!-- ========================== OVERVIEW ========================== -->
        <section v-if="tab === 'overview' && isAdmin">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div
              v-for="card in statCards"
              :key="card.label"
              class="rounded-lg border border-default p-4"
            >
              <div class="flex items-center gap-2 text-muted">
                <UIcon
                  :name="card.icon"
                  class="size-4 shrink-0"
                />
                <span class="truncate text-xs font-semibold uppercase tracking-wide">{{ card.label }}</span>
              </div>
              <p class="mt-2 text-2xl font-bold tabular-nums text-highlighted">
                {{ card.value.toLocaleString('en-US') }}
              </p>
            </div>
          </div>

          <div class="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div class="rounded-lg border border-default p-4">
              <div class="mb-3 flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-highlighted">
                  Submissions — last 14 days
                </p>
                <UBadge
                  v-if="sampleActive"
                  label="Sample data"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <svg
                :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
                class="h-[140px] w-full text-primary"
                preserveAspectRatio="none"
                role="img"
                aria-label="Bar chart of submissions per day over the last 14 days"
              >
                <line
                  x1="0"
                  :y1="CHART_H - CHART_PAD"
                  :x2="CHART_W"
                  :y2="CHART_H - CHART_PAD"
                  stroke="currentColor"
                  stroke-width="1"
                  opacity="0.2"
                />
                <rect
                  v-for="(b, i) in submissionBars"
                  :key="i"
                  :x="b.x"
                  :y="b.y"
                  :width="b.w"
                  :height="b.h"
                  rx="1.5"
                  fill="currentColor"
                  opacity="0.85"
                />
              </svg>
              <div class="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
                <span>{{ dayLabels.first }}</span>
                <span>{{ dayLabels.last }}</span>
              </div>
            </div>

            <div class="rounded-lg border border-default p-4">
              <div class="mb-3 flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-highlighted">
                  Lessons completed — last 14 days
                </p>
                <UBadge
                  v-if="sampleActive"
                  label="Sample data"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <svg
                :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
                class="h-[140px] w-full text-primary"
                preserveAspectRatio="none"
                role="img"
                aria-label="Area chart of lessons completed per day over the last 14 days"
              >
                <line
                  x1="0"
                  :y1="CHART_H - CHART_PAD"
                  :x2="CHART_W"
                  :y2="CHART_H - CHART_PAD"
                  stroke="currentColor"
                  stroke-width="1"
                  opacity="0.2"
                />
                <polygon
                  :points="progressLine.area"
                  fill="currentColor"
                  opacity="0.15"
                />
                <polyline
                  :points="progressLine.line"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
              </svg>
              <div class="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
                <span>{{ dayLabels.first }}</span>
                <span>{{ dayLabels.last }}</span>
              </div>
            </div>

            <!-- Only rendered when the series exists: neon_auth."user" may be
               unreadable locally, and the API sends [] rather than zeros. -->
            <div
              v-if="displaySignups.length"
              class="rounded-lg border border-default p-4"
            >
              <div class="mb-3 flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-highlighted">
                  Signups — last 14 days
                </p>
                <UBadge
                  v-if="sampleActive"
                  label="Sample data"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <svg
                :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
                class="h-[140px] w-full text-primary"
                preserveAspectRatio="none"
                role="img"
                aria-label="Line chart of signups per day over the last 14 days"
              >
                <line
                  x1="0"
                  :y1="CHART_H - CHART_PAD"
                  :x2="CHART_W"
                  :y2="CHART_H - CHART_PAD"
                  stroke="currentColor"
                  stroke-width="1"
                  opacity="0.2"
                />
                <polyline
                  :points="signupLine"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
              </svg>
              <div class="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
                <span>{{ dayLabels.first }}</span>
                <span>{{ dayLabels.last }}</span>
              </div>
            </div>
          </div>

          <div class="mt-6 grid gap-4 lg:grid-cols-2">
            <div class="rounded-lg border border-default p-4">
              <div class="mb-3 flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-highlighted">
                  Top lessons
                </p>
                <UBadge
                  v-if="sampleActive"
                  label="Sample data"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <p
                v-if="!displayTopLessons.length"
                class="py-6 text-center text-sm text-muted"
              >
                No completions yet.
              </p>
              <ul
                v-else
                class="space-y-3"
              >
                <li
                  v-for="lesson in displayTopLessons"
                  :key="lesson.path"
                >
                  <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span class="truncate font-medium text-highlighted">{{ lesson.path }}</span>
                    <span class="shrink-0 tabular-nums text-muted">{{ lesson.count.toLocaleString('en-US') }}</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-elevated">
                    <div
                      class="h-1.5 rounded-full bg-primary"
                      :style="{ width: `${Math.max(4, (lesson.count / topLessonMax) * 100)}%` }"
                    />
                  </div>
                </li>
              </ul>
            </div>

            <div class="grid content-start gap-4 sm:grid-cols-2">
              <div class="rounded-lg border border-default p-4">
                <div class="flex items-center justify-between gap-2 text-muted">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-list-checks"
                      class="size-4 shrink-0"
                    />
                    <span class="truncate text-xs font-semibold uppercase tracking-wide">Quiz attempts</span>
                  </div>
                  <UBadge
                    v-if="sampleActive"
                    label="Sample data"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <p class="mt-2 text-2xl font-bold tabular-nums text-highlighted">
                  {{ displayQuiz.attempts.toLocaleString('en-US') }}
                </p>
              </div>
              <div class="rounded-lg border border-default p-4">
                <div class="flex items-center justify-between gap-2 text-muted">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-percent"
                      class="size-4 shrink-0"
                    />
                    <span class="truncate text-xs font-semibold uppercase tracking-wide">Avg quiz score</span>
                  </div>
                  <UBadge
                    v-if="sampleActive"
                    label="Sample data"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <p class="mt-2 text-2xl font-bold tabular-nums text-highlighted">
                  {{ displayQuiz.avgScorePct }}%
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================ QUEUE ============================ -->
        <section v-else-if="tab === 'queue'">
          <div class="mb-4 flex gap-2">
            <UButton
              v-for="s in (['pending', 'approved', 'rejected'] as const)"
              :key="s"
              :label="s"
              :color="queueStatus === s ? 'primary' : 'neutral'"
              :variant="queueStatus === s ? 'soft' : 'outline'"
              size="xs"
              @click="queueStatus = s"
            />
          </div>

          <p
            v-if="!queue.length"
            class="py-12 text-center text-sm text-muted"
          >
            Nothing {{ queueStatus }}.
          </p>

          <ul class="space-y-4">
            <li
              v-for="item in queue"
              :key="item.id"
            >
              <UCard>
                <div class="flex flex-col gap-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <UBadge
                      :label="item.kind"
                      color="neutral"
                      variant="subtle"
                      size="sm"
                    />
                    <span class="text-xs font-semibold uppercase tracking-wide text-dimmed">{{ item.submittedBy.email || 'unknown' }}</span>
                  </div>

                  <p class="font-semibold text-highlighted">
                    {{ item.title }}
                  </p>

                  <!-- rel="noopener nofollow" and no target-blank trust: this is an
                     unreviewed link submitted by a stranger. -->
                  <a
                    v-if="item.url"
                    :href="item.url"
                    target="_blank"
                    rel="noopener nofollow ugc"
                    class="text-sm text-primary break-all"
                  >{{ item.url }}</a>

                  <p class="whitespace-pre-line text-sm text-muted">
                    {{ item.description }}
                  </p>

                  <p
                    v-if="item.tags.length"
                    class="flex flex-wrap gap-1"
                  >
                    <UBadge
                      v-for="tg in item.tags"
                      :key="tg"
                      :label="tg"
                      color="neutral"
                      variant="outline"
                      size="sm"
                    />
                  </p>
                </div>

                <template #footer>
                  <div class="flex flex-wrap items-center gap-2">
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
                </template>
              </UCard>
            </li>
          </ul>
        </section>

        <!-- =========================== CONTENT =========================== -->
        <section v-else-if="tab === 'content' && isAdmin">
          <p
            v-if="contentError"
            class="mb-4 text-sm text-error"
            role="alert"
          >
            {{ contentError }}
          </p>

          <div class="grid gap-6 lg:grid-cols-[18rem_1fr]">
            <!-- File list -->
            <div>
              <UButton
                label="New lesson"
                icon="i-lucide-file-plus-2"
                size="sm"
                block
                variant="soft"
                class="mb-4"
                @click="startNewLesson"
              />

              <p
                v-if="contentTreeLoading"
                class="py-6 text-center text-sm text-muted"
              >
                Loading files…
              </p>
              <p
                v-else-if="!contentModules.length"
                class="py-6 text-center text-sm text-muted"
              >
                No files loaded.
              </p>

              <div
                v-for="mod in contentModules"
                :key="mod.name"
                class="mb-4"
              >
                <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  {{ mod.name }}
                </p>
                <ul>
                  <li
                    v-for="f in mod.files"
                    :key="f.path"
                  >
                    <button
                      type="button"
                      class="w-full truncate rounded-md px-2 py-1 text-start text-sm hover:bg-elevated"
                      :class="f.path === activePath && !isNewFile ? 'bg-elevated font-medium text-highlighted' : 'text-muted'"
                      :title="f.path"
                      @click="openContentFile(f.path)"
                    >
                      {{ fileLabel(f) }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Editor -->
            <div>
              <p
                v-if="!isNewFile && !activePath"
                class="rounded-lg border border-default p-10 text-center text-sm text-muted"
              >
                Pick a lesson on the left, or start a new one.
              </p>

              <div
                v-else
                class="flex flex-col gap-3"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <UInput
                    v-if="isNewFile"
                    v-model="newPath"
                    class="min-w-64 grow font-mono"
                    size="sm"
                    placeholder="content/en/<module>/<NN.slug>.md"
                  />
                  <code
                    v-else
                    class="truncate text-sm text-highlighted"
                  >{{ activePath }}</code>
                  <UBadge
                    v-if="contentDirty"
                    label="Unsaved changes"
                    color="warning"
                    variant="subtle"
                    size="sm"
                  />
                  <UBadge
                    v-if="isNewFile"
                    label="New file"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                  />
                </div>

                <textarea
                  v-model="editorText"
                  class="h-[60vh] w-full resize-y rounded-lg border border-default bg-default p-3 font-mono text-sm text-highlighted focus:outline-none focus:ring-2 focus:ring-primary"
                  :disabled="fileLoading"
                  spellcheck="false"
                  aria-label="Lesson markdown"
                />

                <div class="flex flex-wrap items-center gap-2">
                  <UInput
                    v-model="commitMessage"
                    class="min-w-64 grow"
                    size="sm"
                    :placeholder="`content: update ${publishPath || 'lesson'} via admin studio`"
                    aria-label="Commit message"
                  />
                  <UButton
                    label="Publish to GitHub"
                    icon="i-lucide-git-commit-horizontal"
                    :loading="publishing"
                    :disabled="!canPublish"
                    @click="publishContent"
                  />
                </div>

                <div
                  v-if="published"
                  class="rounded-lg border border-default bg-elevated p-4 text-sm"
                >
                  <p class="font-semibold text-highlighted">
                    Published {{ published.path }}
                  </p>
                  <p class="mt-1 text-muted">
                    Commit
                    <a
                      v-if="published.commitUrl"
                      :href="published.commitUrl"
                      target="_blank"
                      rel="noopener"
                      class="font-mono text-primary"
                    >{{ published.commitSha.slice(0, 7) }}</a>
                    <span
                      v-else
                      class="font-mono"
                    >{{ published.commitSha.slice(0, 7) }}</span>
                    is on main — the push triggers the translation workflow and the
                    Pages deploy automatically; no further action needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================ USERS ============================ -->
        <section v-else-if="tab === 'users' && isAdmin">
          <UCard class="mb-8">
            <div class="flex flex-col gap-2">
              <p class="font-semibold text-highlighted">
                Create a user
              </p>
              <div class="grid gap-3 sm:grid-cols-4">
                <UInput
                  v-model="newUser.email"
                  type="email"
                  placeholder="email"
                />
                <UInput
                  v-model="newUser.name"
                  type="text"
                  placeholder="name (optional)"
                />
                <USelect
                  v-model="newUser.role"
                  :items="roles"
                />
                <UButton
                  label="Create"
                  icon="i-lucide-user-plus"
                  :disabled="busy || !newUser.email"
                  @click="createUser"
                />
              </div>

              <!-- Shown once. There is no email sending on this site, so this is
                 the only time the password is visible. -->
              <div
                v-if="created"
                class="mt-4 space-y-2 rounded-lg border border-default bg-elevated p-4"
              >
                <p class="font-semibold text-highlighted">
                  Created {{ created.email }}
                </p>
                <p class="text-sm text-muted">
                  Temporary password — copy it now, it is not stored and will not
                  be shown again:
                </p>
                <code>{{ created.temporaryPassword }}</code>
              </div>
            </div>
          </UCard>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[52rem] border-collapse text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="px-2 py-2 text-start text-xs font-semibold uppercase tracking-wide text-muted">
                    User
                  </th>
                  <th class="px-2 py-2 text-start text-xs font-semibold uppercase tracking-wide text-muted">
                    Role
                  </th>
                  <th class="px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-muted">
                    Points
                  </th>
                  <th class="px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-muted">
                    Lessons
                  </th>
                  <th class="px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-muted">
                    Queue
                  </th>
                  <th class="px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-muted">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="u in users"
                  :key="u.id"
                  class="border-b border-default"
                >
                  <td class="px-2 py-3">
                    <span class="font-medium text-highlighted">{{ u.name || '—' }}</span>
                    <span class="block text-xs text-muted">{{ u.email }}</span>
                  </td>
                  <td class="px-2 py-3">
                    <select
                      class="rounded-md border border-default bg-default px-2 py-1 text-sm disabled:opacity-50"
                      :value="u.role"
                      :disabled="busy || u.isDemo || u.roleLocked"
                      @change="setRole(u, ($event.target as HTMLSelectElement).value)"
                    >
                      <option
                        v-for="r in roles"
                        :key="r"
                        :value="r"
                      >
                        {{ r }}
                      </option>
                    </select>
                    <!-- Say why it is disabled. A dead control with no
                       explanation reads as a bug. -->
                    <span
                      v-if="u.roleLocked"
                      class="mt-1 block text-xs text-muted"
                    >set by ADMIN_EMAILS</span>
                  </td>
                  <td class="px-2 py-3 text-end tabular-nums">
                    {{ u.points }}
                  </td>
                  <td class="px-2 py-3 text-end tabular-nums">
                    {{ u.lessonsDone }}
                  </td>
                  <td class="px-2 py-3 text-end tabular-nums">
                    {{ u.pendingSubmissions || '' }}
                  </td>
                  <td class="px-2 py-3 text-end">
                    <UButton
                      :label="u.pro ? 'Pro' : 'Free'"
                      :color="u.pro ? 'primary' : 'neutral'"
                      :variant="u.pro ? 'soft' : 'outline'"
                      size="xs"
                      :disabled="busy"
                      @click="togglePro(u)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </UPageBody>
    </UContainer>
  </div>
</template>
