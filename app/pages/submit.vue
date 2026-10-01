<script setup lang="ts">
/**
 * The contribute stepper.
 *
 * Step one picks what is being contributed; every later step is specific to
 * that choice — a dashboard asks how the data was prepared, where it came
 * from and how each KPI is calculated; a resource starts from its link and
 * previews it; a translation fix asks for the wrong and the corrected text.
 * Each step validates before Next, Back keeps everything, and a review step
 * shows exactly what will be sent.
 *
 * Everything posts to /api/submissions: `kind` is one of the three moderation
 * buckets, `details` carries the structured fields of the fine-grained type.
 * The copy is English only; the route stays localized because localized
 * pages link to it.
 */
import { hostOf, isHttpUrl, type UrlMeta } from '~/components/submit/urlMeta'

definePageMeta({
  // Personal and auth-gated, like /dashboard: never prerendered, never
  // indexed. The real enforcement is server-side on /api/submissions.
  middleware: 'auth'
})

useSeoMeta({
  title: 'Contribute',
  robots: 'noindex, nofollow'
})

type Type = 'dashboard' | 'resource' | 'lesson' | 'translation' | 'snippet'
type Kind = 'resource' | 'showcase' | 'lesson-idea'

interface Mine {
  id: number
  kind: string
  type: Type | null
  title: string
  url: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewNote: string | null
}

const TYPES: { value: Type, kind: Kind, label: string, blurb: string, icon: string }[] = [
  { value: 'dashboard', kind: 'showcase', label: 'A dashboard', blurb: 'For the showcase: how you prepared the data, the sources, every KPI and how it is calculated.', icon: 'i-lucide-chart-column' },
  { value: 'resource', kind: 'resource', label: 'A resource', blurb: 'A docs page, course, tool, blog or community worth someone’s time.', icon: 'i-lucide-link' },
  { value: 'lesson', kind: 'lesson-idea', label: 'A lesson fix or idea', blurb: 'Something wrong in a lesson, or a lesson that should exist.', icon: 'i-lucide-lightbulb' },
  { value: 'translation', kind: 'lesson-idea', label: 'A translation fix', blurb: 'A machine translation that reads wrong in your language.', icon: 'i-lucide-languages' },
  { value: 'snippet', kind: 'lesson-idea', label: 'A SAQL snippet', blurb: 'A query that solves a real problem, with the dataset it runs on.', icon: 'i-lucide-code-xml' }
]

const STEPS: Record<Type, string[]> = {
  dashboard: ['Type', 'Dashboard', 'Data', 'KPIs & media', 'Review'],
  resource: ['Type', 'Link', 'Details', 'Review'],
  lesson: ['Type', 'Lesson', 'Proposal', 'Review'],
  translation: ['Type', 'Where', 'Correction', 'Review'],
  snippet: ['Type', 'Snippet', 'Context', 'Review']
}

const route = useRoute()
const localePath = useLocalePath()
const { locales } = useI18n()
const { lessons } = useCourse()

// A link can preselect what is being submitted: ?type=snippet, or the older
// ?kind=showcase|resource|lesson-idea buckets.
const LEGACY: Record<string, Type> = { 'showcase': 'dashboard', 'resource': 'resource', 'lesson-idea': 'lesson' }
const initial = (TYPES.some(t => t.value === route.query.type) ? route.query.type : LEGACY[String(route.query.kind)]) as Type | undefined
const type = ref<Type>(initial ?? 'dashboard')
const step = ref(initial ? 1 : 0)

const steps = computed(() => STEPS[type.value])
const total = computed(() => steps.value.length)
const isReview = computed(() => step.value === total.value - 1)
const pad = (n: number) => String(n).padStart(2, '0')
const typeInfo = computed(() => TYPES.find(t => t.value === type.value)!)

// ---------------------------------------------------------------- state ---

const DOMAINS = ['Sales', 'Service', 'Marketing', 'Finance', 'Other']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const PREP_TOOLS = ['Recipe', 'Dataflow', 'Data sync / connector', 'CSV upload', 'External data API']
const PREP_STEPS = ['Joins / augments', 'Filters', 'Formula fields', 'Aggregations', 'Append', 'Bucketing', 'Date handling', 'Deduplication']
const SOURCE_TYPES = ['Salesforce object', 'CSV', 'External connector', 'Snowflake', 'Other database', 'Other']
const TECHNIQUES = ['Bindings', 'SAQL', 'Compare tables', 'Windowing', 'Security predicates', 'Faceting', 'Dynamic filters', 'Actions', 'Einstein Discovery', 'Mobile layout']
const CATEGORIES = ['Docs', 'Learning', 'Books', 'Blogs', 'Tools', 'Community']

const dash = reactive({
  name: '',
  domain: 'Sales',
  difficulty: 'Intermediate',
  tools: [] as string[],
  prepSteps: [] as string[],
  prep: '',
  grain: '',
  sources: [{ type: 'Salesforce object', name: '', rows: '' }],
  kpis: [{ name: '', formula: '', why: '' }],
  techniques: [] as string[],
  media: [] as { url: string, key?: string }[],
  mediaUrl: '',
  writeup: '',
  creditName: '',
  creditUrl: ''
})

const res = reactive({ url: '', title: '', description: '', category: 'Docs', why: '', siteName: '', icon: '' })

const lesson = reactive({
  mode: 'fix' as 'fix' | 'idea',
  path: '',
  ideaTitle: '',
  body: '',
  sources: [{ url: '' }]
})

const tr = reactive({ locale: '', path: '', wrong: '', suggested: '', note: '' })

const snip = reactive({ title: '', saql: '', what: '', dataset: '', shape: '' })

function toggle(list: string[], value: string) {
  const i = list.indexOf(value)
  if (i >= 0) list.splice(i, 1)
  else list.push(value)
}

const lessonItems = computed(() => lessons.value.map(l => ({ label: `${l.moduleTitle} — ${l.title}`, value: l.path })))
const lessonLabel = (path: string) => lessonItems.value.find(l => l.value === path)?.label ?? path
const localeItems = computed(() => locales.value.filter(l => l.code !== 'en').map(l => ({ label: `${l.name} (${l.code})`, value: String(l.code) })))

function onResourceMeta(meta: UrlMeta) {
  res.siteName = meta.siteName ?? ''
  res.icon = meta.icon ?? ''
  if (!res.title.trim() && meta.title) res.title = meta.title.slice(0, 160)
  if (!res.description.trim() && meta.description) res.description = meta.description.slice(0, 400)
}

// ---------------------------------------------------------------- media ---
// /api/upload answers 503 in local dev (no R2 binding), so a failed upload is
// a message, never a blocker — an image URL works as well.
const MAX_MEDIA = 4
const MAX_BYTES = 4 * 1024 * 1024
const uploading = ref(false)
const mediaError = ref('')

async function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  mediaError.value = ''
  for (const file of files) {
    if (dash.media.length >= MAX_MEDIA) break
    if (file.size > MAX_BYTES) {
      mediaError.value = 'Images are capped at 4 MB each.'
      continue
    }
    const body = new FormData()
    body.append('file', file)
    uploading.value = true
    try {
      const up = await $fetch<{ key: string, url: string }>('/api/upload', { method: 'POST', body })
      dash.media.push({ url: new URL(up.url, window.location.origin).toString(), key: up.key })
    } catch (err) {
      mediaError.value = messageOf(err, 'Upload failed — paste an image URL instead.')
    } finally {
      uploading.value = false
    }
  }
}

function addMediaUrl() {
  const url = dash.mediaUrl.trim()
  if (!isHttpUrl(url)) {
    mediaError.value = 'Image links must start with http:// or https://'
    return
  }
  if (dash.media.length >= MAX_MEDIA) return
  dash.media.push({ url })
  dash.mediaUrl = ''
  mediaError.value = ''
}

// ----------------------------------------------------------- validation ---

const optionalUrlOk = (u: string) => !u.trim() || isHttpUrl(u)
const len = (s: string) => s.trim().length

/** Why the current step cannot continue, or '' when it can. */
const problem = computed(() => {
  const s = step.value
  if (s === 0) return ''
  switch (type.value) {
    case 'dashboard':
      if (s === 1) {
        if (len(dash.name) < 3) return 'Give the dashboard a name (3+ characters).'
        if (!optionalUrlOk(dash.writeup)) return 'The write-up link must start with http:// or https://'
        if (!optionalUrlOk(dash.creditUrl)) return 'Your link must start with http:// or https://'
      }
      if (s === 2) {
        if (len(dash.prep) < 20) return 'Describe how you prepared the data (20+ characters).'
        if (!dash.sources.some(x => len(x.name))) return 'Add at least one data source.'
      }
      if (s === 3) {
        const kpis = dash.kpis.filter(k => len(k.name) || len(k.formula))
        if (!kpis.length) return 'Add at least one KPI.'
        if (kpis.some(k => !len(k.name) || !len(k.formula))) return 'Every KPI needs a name and how it is calculated.'
      }
      return ''
    case 'resource':
      if (s === 1 && !isHttpUrl(res.url)) return 'Paste the link, starting with http:// or https://'
      if (s === 2) {
        if (len(res.title) < 3) return 'Give it a title (3+ characters).'
        if (len(res.why) < 20) return 'Say why it is useful (20+ characters).'
      }
      return ''
    case 'lesson':
      if (s === 1) {
        if (lesson.mode === 'fix' && !lesson.path) return 'Pick the lesson.'
        if (lesson.mode === 'idea' && len(lesson.ideaTitle) < 3) return 'Give the lesson idea a title.'
      }
      if (s === 2) {
        if (len(lesson.body) < 20) return lesson.mode === 'fix' ? 'Describe what is wrong (20+ characters).' : 'Outline the lesson (20+ characters).'
        if (lesson.sources.some(x => !optionalUrlOk(x.url))) return 'Source links must start with http:// or https://'
      }
      return ''
    case 'translation':
      if (s === 1 && (!tr.locale || !tr.path)) return 'Pick the language and the lesson.'
      if (s === 2 && (len(tr.wrong) < 2 || len(tr.suggested) < 2)) return 'Paste the wrong text and your correction.'
      return ''
    case 'snippet':
      if (s === 1) {
        if (len(snip.title) < 3) return 'Give the snippet a title.'
        if (len(snip.saql) < 10) return 'Paste the SAQL.'
      }
      if (s === 2 && len(snip.what) < 20) return 'Say what it does (20+ characters).'
      return ''
  }
  return ''
})

const showProblem = ref(false)
function next() {
  if (problem.value) {
    showProblem.value = true
    return
  }
  showProblem.value = false
  step.value = Math.min(step.value + 1, total.value - 1)
}
function back() {
  showProblem.value = false
  step.value = Math.max(step.value - 1, 0)
}
function choose(t: Type) {
  type.value = t
  step.value = 1
  showProblem.value = false
}

// -------------------------------------------------------------- payload ---

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

const dashSources = computed(() => dash.sources.filter(x => len(x.name)).map(x => ({ type: x.type, name: x.name.trim(), rows: x.rows.trim() || undefined })))
const dashKpis = computed(() => dash.kpis.filter(k => len(k.name)).map(k => ({ name: k.name.trim(), formula: k.formula.trim(), why: k.why.trim() || undefined })))

/** Everything the review step shows and the API receives. */
const payload = computed(() => {
  switch (type.value) {
    case 'dashboard': {
      const sources = dashSources.value
      const kpis = dashKpis.value
      const description = [
        dash.prep.trim(),
        kpis.length ? `\nKPIs:\n${kpis.map(k => `- ${k.name}: ${k.formula}`).join('\n')}` : ''
      ].join('')
      return {
        kind: 'showcase' as Kind,
        title: clip(dash.name.trim(), 160),
        url: dash.writeup.trim() || undefined,
        imageUrl: dash.media[0]?.url,
        description: clip(description, 2000),
        tags: dash.techniques.slice(0, 8),
        details: {
          type: 'dashboard',
          domain: dash.domain,
          difficulty: dash.difficulty,
          prep: { tools: dash.tools, steps: dash.prepSteps, notes: dash.prep.trim(), grain: dash.grain.trim() || undefined },
          sources,
          kpis,
          techniques: dash.techniques,
          media: dash.media.map(m => m.url),
          credit: len(dash.creditName) || len(dash.creditUrl) ? { name: dash.creditName.trim(), url: dash.creditUrl.trim() || undefined } : undefined
        }
      }
    }
    case 'resource':
      return {
        kind: 'resource' as Kind,
        title: clip(res.title.trim(), 160),
        url: res.url.trim(),
        description: clip(res.why.trim(), 2000),
        tags: [res.category.toLowerCase()],
        details: { type: 'resource', category: res.category, summary: res.description.trim() || undefined, siteName: res.siteName || undefined, icon: res.icon || undefined }
      }
    case 'lesson': {
      const sources = lesson.sources.map(x => x.url.trim()).filter(Boolean)
      const title = lesson.mode === 'fix' ? `Fix: ${lessonLabel(lesson.path)}` : `Lesson idea: ${lesson.ideaTitle.trim()}`
      return {
        kind: 'lesson-idea' as Kind,
        title: clip(title, 160),
        url: sources[0],
        description: clip(lesson.body.trim(), 2000),
        tags: [lesson.mode === 'fix' ? 'lesson-fix' : 'lesson-idea'],
        details: { type: 'lesson', mode: lesson.mode, lessonPath: lesson.mode === 'fix' ? lesson.path : undefined, ideaTitle: lesson.mode === 'idea' ? lesson.ideaTitle.trim() : undefined, sources }
      }
    }
    case 'translation': {
      const description = `Wrong (${tr.locale}): ${tr.wrong.trim()}\nSuggested: ${tr.suggested.trim()}${tr.note.trim() ? `\nNote: ${tr.note.trim()}` : ''}`
      return {
        kind: 'lesson-idea' as Kind,
        title: clip(`Translation (${tr.locale}): ${lessonLabel(tr.path)}`, 160),
        url: undefined,
        description: clip(description, 2000),
        tags: ['translation', tr.locale],
        details: { type: 'translation', locale: tr.locale, lessonPath: tr.path, wrong: tr.wrong.trim(), suggested: tr.suggested.trim(), note: tr.note.trim() || undefined }
      }
    }
    case 'snippet':
      return {
        kind: 'lesson-idea' as Kind,
        title: clip(snip.title.trim(), 160),
        url: undefined,
        description: clip(snip.what.trim(), 2000),
        tags: ['saql'],
        details: { type: 'snippet', saql: snip.saql.trim(), dataset: snip.dataset.trim() || undefined, shape: snip.shape.trim() || undefined }
      }
  }
  throw new Error('unknown type')
})

/** Every link anywhere in the form, for the review step's favicon list. */
const allLinks = computed(() => {
  const links: string[] = []
  if (type.value === 'dashboard') links.push(dash.writeup, dash.creditUrl, ...dash.media.map(m => m.url))
  if (type.value === 'resource') links.push(res.url)
  if (type.value === 'lesson') links.push(...lesson.sources.map(s => s.url))
  return [...new Set(links.map(l => l.trim()).filter(isHttpUrl))]
})

// ---------------------------------------------------------------- send ----

const sending = ref(false)
const sent = ref(false)
const error = ref('')

function messageOf(e: unknown, fallback = 'Something went wrong.') {
  const err = e as { statusMessage?: string, data?: { statusMessage?: string } }
  return err?.data?.statusMessage || err?.statusMessage || fallback
}

function reset() {
  Object.assign(dash, { name: '', domain: 'Sales', difficulty: 'Intermediate', tools: [], prepSteps: [], prep: '', grain: '', sources: [{ type: 'Salesforce object', name: '', rows: '' }], kpis: [{ name: '', formula: '', why: '' }], techniques: [], media: [], mediaUrl: '', writeup: '', creditName: '', creditUrl: '' })
  Object.assign(res, { url: '', title: '', description: '', category: 'Docs', why: '', siteName: '', icon: '' })
  Object.assign(lesson, { mode: 'fix', path: '', ideaTitle: '', body: '', sources: [{ url: '' }] })
  Object.assign(tr, { locale: '', path: '', wrong: '', suggested: '', note: '' })
  Object.assign(snip, { title: '', saql: '', what: '', dataset: '', shape: '' })
}

async function send() {
  error.value = ''
  sending.value = true
  try {
    await $fetch('/api/submissions', { method: 'POST', body: payload.value })
    sent.value = true
    reset()
    step.value = 0
    await refreshMine()
  } catch (e) {
    // The API's statusMessage is written to be read by a person (including
    // the 429 rate-limit message), so it is shown as-is.
    error.value = messageOf(e)
  } finally {
    sending.value = false
  }
}

const { data: mine, refresh: refreshMine } = await useLazyAsyncData('my-submissions', () =>
  $fetch<{ submissions: Mine[] }>('/api/submissions'), {
  server: false,
  default: () => ({ submissions: [] as Mine[] })
})

const STATUS: Record<Mine['status'], { label: string, cls: string }> = {
  pending: { label: 'Pending review', cls: 'border-(--line) text-(--ink2)' },
  approved: { label: 'Approved', cls: 'border-(--signal) text-(--signal)' },
  rejected: { label: 'Rejected', cls: 'border-error text-error' }
}
const typeLabel = (s: Mine) => TYPES.find(t => t.value === s.type)?.label.replace(/^A /, '')
  ?? ({ 'showcase': 'dashboard', 'resource': 'resource', 'lesson-idea': 'lesson idea' } as Record<string, string>)[s.kind] ?? s.kind
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 07 / Contribute"
      title="Contribute to the Academy"
      lead="Dashboards, resources, lesson fixes, translations and SAQL. Everything is reviewed by a person before it appears, and approved work earns points on the leaderboard."
    />

    <div class="mx-auto max-w-[76rem] px-4 py-12 sm:px-6">
      <!-- Sent -->
      <div
        v-if="sent"
        class="crosshair border-[1.5px] border-(--ink) bg-(--card) p-10 text-center shadow-[10px_10px_0_var(--ice)]"
      >
        <span class="mx-auto flex size-14 items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) text-white">
          <UIcon
            name="i-lucide-check"
            class="size-7"
          />
        </span>
        <p class="eyebrow mt-6">
          Received
        </p>
        <h2 class="bp-h3 mt-2">
          Thank you — it is in the review queue.
        </h2>
        <p class="mx-auto mt-3 max-w-lg text-(--ink2)">
          You will see its status below. Approved contributions are credited to you and count on the leaderboard.
        </p>
        <UButton
          class="mt-6"
          icon="i-lucide-plus"
          @click="sent = false"
        >
          Contribute something else
        </UButton>
      </div>

      <div
        v-else
        class="crosshair border-[1.5px] border-(--ink) bg-(--card) shadow-[10px_10px_0_var(--ice)]"
      >
        <!-- Stepper header -->
        <div class="border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-5 sm:px-8">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="font-mono text-xs font-semibold uppercase tracking-[.14em] text-(--signal)">
              Step {{ pad(step + 1) }} / {{ pad(total) }} — {{ steps[step] }}
            </p>
            <p
              v-if="step > 0"
              class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)"
            >
              <UIcon
                :name="typeInfo.icon"
                class="size-4"
              />{{ typeInfo.label }}
            </p>
          </div>
          <ol class="mt-4 flex border-[1.5px] border-(--ink) bg-(--card)">
            <li
              v-for="(label, i) in steps"
              :key="label"
              class="relative flex-1 border-e-[1.5px] border-(--ink) last:border-e-0"
            >
              <button
                type="button"
                class="flex h-full w-full flex-col items-start gap-0.5 px-3 py-2 text-start transition-colors disabled:cursor-not-allowed"
                :class="i < step ? 'bg-(--tide) text-white' : i === step ? 'bg-(--signal) text-white' : 'hatch text-(--ink2)'"
                :disabled="i > step"
                :aria-current="i === step ? 'step' : undefined"
                @click="i < step && (step = i, showProblem = false)"
              >
                <span class="font-mono text-[10px] tracking-[.1em]">{{ pad(i + 1) }}</span>
                <span class="hidden truncate text-xs font-bold sm:block">{{ label }}</span>
              </button>
            </li>
          </ol>
        </div>

        <div class="px-5 py-8 sm:px-8">
          <!-- STEP 1: type -->
          <div
            v-if="step === 0"
            class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <button
              v-for="t in TYPES"
              :key="t.value"
              type="button"
              class="bp-card bp-card--hover group flex flex-col items-start gap-3 p-6 text-start"
              :class="type === t.value ? 'ring-2 ring-(--signal)' : ''"
              @click="choose(t.value)"
            >
              <span class="bp-iconbox size-11">
                <UIcon
                  :name="t.icon"
                  class="size-5"
                />
              </span>
              <span class="text-lg font-extrabold text-(--ink)">{{ t.label }}</span>
              <span class="text-sm text-(--ink2)">{{ t.blurb }}</span>
              <span class="mt-auto font-mono text-[10px] uppercase tracking-[.12em] text-(--signal)">{{ STEPS[t.value].length - 1 }} steps →</span>
            </button>
          </div>

          <!-- DASHBOARD -->
          <template v-else-if="type === 'dashboard'">
            <div
              v-if="step === 1"
              class="grid gap-6 lg:grid-cols-2"
            >
              <UFormField
                label="Dashboard name"
                required
                class="lg:col-span-2"
              >
                <UInput
                  v-model="dash.name"
                  size="xl"
                  placeholder="Pipeline coverage by segment"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Business domain">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="d in DOMAINS"
                    :key="d"
                    type="button"
                    class="border-[1.5px] px-3 py-1.5 text-sm font-semibold"
                    :class="dash.domain === d ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
                    @click="dash.domain = d"
                  >
                    {{ d }}
                  </button>
                </div>
              </UFormField>
              <UFormField label="Difficulty">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="d in DIFFICULTIES"
                    :key="d"
                    type="button"
                    class="border-[1.5px] px-3 py-1.5 text-sm font-semibold"
                    :class="dash.difficulty === d ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
                    @click="dash.difficulty = d"
                  >
                    {{ d }}
                  </button>
                </div>
              </UFormField>
              <UFormField
                label="Public write-up"
                hint="Optional"
                class="lg:col-span-2"
              >
                <UInput
                  v-model="dash.writeup"
                  placeholder="https://…"
                  class="w-full"
                >
                  <template #leading>
                    <SubmitFavicon
                      :url="dash.writeup"
                      :size="18"
                    />
                  </template>
                </UInput>
              </UFormField>
              <UFormField
                label="Credit — your name"
                hint="Optional"
              >
                <UInput
                  v-model="dash.creditName"
                  placeholder="As it should appear on the showcase"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Credit — your link"
                hint="Optional"
              >
                <UInput
                  v-model="dash.creditUrl"
                  placeholder="https://linkedin.com/in/…"
                  class="w-full"
                >
                  <template #leading>
                    <SubmitFavicon
                      :url="dash.creditUrl"
                      :size="18"
                    />
                  </template>
                </UInput>
              </UFormField>
            </div>

            <div
              v-else-if="step === 2"
              class="space-y-8"
            >
              <div class="grid gap-6 lg:grid-cols-2">
                <UFormField label="Built with">
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="x in PREP_TOOLS"
                      :key="x"
                      type="button"
                      class="flex items-center gap-1.5 border-[1.5px] px-3 py-1.5 text-sm"
                      :class="dash.tools.includes(x) ? 'border-(--signal) bg-(--ice) font-semibold text-(--signal)' : 'border-(--line) hover:border-(--ink)'"
                      @click="toggle(dash.tools, x)"
                    >
                      <UIcon
                        :name="dash.tools.includes(x) ? 'i-lucide-square-check' : 'i-lucide-square'"
                        class="size-4"
                      />{{ x }}
                    </button>
                  </div>
                </UFormField>
                <UFormField label="Preparation steps">
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="x in PREP_STEPS"
                      :key="x"
                      type="button"
                      class="flex items-center gap-1.5 border-[1.5px] px-3 py-1.5 text-sm"
                      :class="dash.prepSteps.includes(x) ? 'border-(--signal) bg-(--ice) font-semibold text-(--signal)' : 'border-(--line) hover:border-(--ink)'"
                      @click="toggle(dash.prepSteps, x)"
                    >
                      <UIcon
                        :name="dash.prepSteps.includes(x) ? 'i-lucide-square-check' : 'i-lucide-square'"
                        class="size-4"
                      />{{ x }}
                    </button>
                  </div>
                </UFormField>
              </div>
              <UFormField
                label="How did you prepare the data?"
                required
                help="The joins and why, what you filtered out, anything that surprised you."
              >
                <UTextarea
                  v-model="dash.prep"
                  :rows="6"
                  autoresize
                  class="w-full"
                  placeholder="Opportunities augmented with Account on AccountId; closed-lost older than 2 years filtered out; …"
                />
              </UFormField>
              <UFormField
                label="Grain"
                hint="Optional"
                help="What one row of the final dataset is."
              >
                <UInput
                  v-model="dash.grain"
                  class="w-full"
                  placeholder="One row per opportunity per snapshot week"
                />
              </UFormField>

              <div>
                <p class="mono-label mb-3">
                  Data sources
                </p>
                <div class="border-[1.5px] border-(--ink)">
                  <div
                    v-for="(src, i) in dash.sources"
                    :key="i"
                    class="grid items-center gap-3 border-b border-dashed border-(--line) p-3 last:border-b-0 sm:grid-cols-[12rem_minmax(0,1fr)_9rem_auto]"
                  >
                    <USelect
                      v-model="src.type"
                      :items="SOURCE_TYPES"
                      class="w-full"
                    />
                    <UInput
                      v-model="src.name"
                      placeholder="Opportunity / opportunities.csv / SALES.PIPELINE"
                      class="w-full"
                    />
                    <UInput
                      v-model="src.rows"
                      placeholder="Rows (optional)"
                      class="w-full"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      color="neutral"
                      variant="ghost"
                      square
                      aria-label="Remove source"
                      :disabled="dash.sources.length === 1"
                      @click="dash.sources.splice(i, 1)"
                    />
                  </div>
                </div>
                <UButton
                  class="mt-3"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :disabled="dash.sources.length >= 12"
                  @click="dash.sources.push({ type: 'Salesforce object', name: '', rows: '' })"
                >
                  Add a source
                </UButton>
              </div>
            </div>

            <div
              v-else-if="step === 3"
              class="space-y-8"
            >
              <div>
                <p class="mono-label mb-3">
                  KPIs — name, how it is calculated, why it matters
                </p>
                <div class="space-y-4">
                  <div
                    v-for="(k, i) in dash.kpis"
                    :key="i"
                    class="border-[1.5px] border-(--ink)"
                  >
                    <div class="flex items-center justify-between border-b-[1.5px] border-(--ink) bg-(--ice) px-3 py-2">
                      <span class="font-mono text-[11px] font-semibold uppercase tracking-[.1em] text-(--signal)">KPI {{ pad(i + 1) }}</span>
                      <UButton
                        icon="i-lucide-trash-2"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        square
                        aria-label="Remove KPI"
                        :disabled="dash.kpis.length === 1"
                        @click="dash.kpis.splice(i, 1)"
                      />
                    </div>
                    <div class="grid gap-3 p-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
                      <UInput
                        v-model="k.name"
                        placeholder="Win rate"
                        class="w-full"
                      />
                      <UTextarea
                        v-model="k.formula"
                        :rows="2"
                        autoresize
                        placeholder="sum(IsWon) / count() — over closed opportunities, by close date"
                        class="w-full"
                        :ui="{ base: 'font-mono text-sm' }"
                      />
                      <UInput
                        v-model="k.why"
                        placeholder="Why it matters (optional)"
                        class="w-full lg:col-span-2"
                      />
                    </div>
                  </div>
                </div>
                <UButton
                  class="mt-3"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :disabled="dash.kpis.length >= 12"
                  @click="dash.kpis.push({ name: '', formula: '', why: '' })"
                >
                  Add a KPI
                </UButton>
              </div>

              <UFormField label="Techniques used">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="x in TECHNIQUES"
                    :key="x"
                    type="button"
                    class="border-[1.5px] px-3 py-1.5 font-mono text-xs uppercase tracking-[.06em]"
                    :class="dash.techniques.includes(x) ? 'border-(--signal) bg-(--signal) text-white' : 'border-(--line) hover:border-(--ink)'"
                    @click="toggle(dash.techniques, x)"
                  >
                    {{ x }}
                  </button>
                </div>
              </UFormField>

              <div>
                <p class="mono-label mb-3">
                  Screenshots — up to {{ MAX_MEDIA }}
                </p>
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div
                    v-for="(m, i) in dash.media"
                    :key="m.url"
                    class="relative aspect-video border-[1.5px] border-(--ink) bg-(--ice)"
                  >
                    <img
                      :src="m.url"
                      alt=""
                      class="size-full object-cover"
                      referrerpolicy="no-referrer"
                    >
                    <UButton
                      class="absolute end-1 top-1"
                      icon="i-lucide-x"
                      size="xs"
                      color="neutral"
                      square
                      aria-label="Remove screenshot"
                      @click="dash.media.splice(i, 1)"
                    />
                  </div>
                  <label
                    v-if="dash.media.length < MAX_MEDIA"
                    class="graph-paper-fine flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-(--ink2) font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2) hover:border-(--signal) hover:text-(--signal)"
                  >
                    <UIcon
                      :name="uploading ? 'i-lucide-loader-circle' : 'i-lucide-image-plus'"
                      class="size-6"
                      :class="uploading ? 'animate-spin' : ''"
                    />
                    {{ uploading ? 'Uploading…' : 'Drop screenshot' }}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      class="sr-only"
                      @change="onFiles"
                    >
                  </label>
                </div>
                <div class="mt-3 flex gap-2">
                  <UInput
                    v-model="dash.mediaUrl"
                    placeholder="…or paste an image URL"
                    class="flex-1"
                    @keydown.enter.prevent="addMediaUrl"
                  />
                  <UButton
                    color="neutral"
                    variant="outline"
                    :disabled="!dash.mediaUrl.trim() || dash.media.length >= MAX_MEDIA"
                    @click="addMediaUrl"
                  >
                    Add
                  </UButton>
                </div>
                <p
                  v-if="mediaError"
                  class="mt-2 text-sm text-warning"
                >
                  {{ mediaError }}
                </p>
              </div>
            </div>
          </template>

          <!-- RESOURCE -->
          <template v-else-if="type === 'resource'">
            <div
              v-if="step === 1"
              class="space-y-5"
            >
              <UFormField
                label="Link"
                required
                help="Paste it — we fetch the title, description and logo."
              >
                <UInput
                  v-model="res.url"
                  size="xl"
                  placeholder="https://…"
                  class="w-full"
                  autofocus
                >
                  <template #leading>
                    <SubmitFavicon :url="res.url" />
                  </template>
                </UInput>
              </UFormField>
              <SubmitUrlPreview
                :url="res.url"
                @meta="onResourceMeta"
              />
            </div>
            <div
              v-else-if="step === 2"
              class="grid gap-6 lg:grid-cols-2"
            >
              <SubmitUrlPreview
                :url="res.url"
                class="lg:col-span-2"
              />
              <UFormField
                label="Title"
                required
              >
                <UInput
                  v-model="res.title"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Category">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="c in CATEGORIES"
                    :key="c"
                    type="button"
                    class="border-[1.5px] px-3 py-1.5 text-sm font-semibold"
                    :class="res.category === c ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
                    @click="res.category = c"
                  >
                    {{ c }}
                  </button>
                </div>
              </UFormField>
              <UFormField
                label="What it is"
                hint="Optional"
                class="lg:col-span-2"
              >
                <UTextarea
                  v-model="res.description"
                  :rows="2"
                  autoresize
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Why is it useful?"
                required
                help="Who should read it, and what they will get out of it."
                class="lg:col-span-2"
              >
                <UTextarea
                  v-model="res.why"
                  :rows="4"
                  autoresize
                  class="w-full"
                />
              </UFormField>
            </div>
          </template>

          <!-- LESSON -->
          <template v-else-if="type === 'lesson'">
            <div
              v-if="step === 1"
              class="space-y-6"
            >
              <div class="inline-flex border-[1.5px] border-(--ink)">
                <button
                  v-for="m in (['fix', 'idea'] as const)"
                  :key="m"
                  type="button"
                  class="px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[.1em]"
                  :class="lesson.mode === m ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
                  @click="lesson.mode = m"
                >
                  {{ m === 'fix' ? 'Fix a lesson' : 'Propose a lesson' }}
                </button>
              </div>
              <UFormField
                v-if="lesson.mode === 'fix'"
                label="Which lesson?"
                required
              >
                <USelectMenu
                  v-model="lesson.path"
                  :items="lessonItems"
                  value-key="value"
                  placeholder="Search lessons…"
                  size="xl"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                v-else
                label="Proposed lesson title"
                required
              >
                <UInput
                  v-model="lesson.ideaTitle"
                  size="xl"
                  class="w-full"
                  placeholder="Incremental data sync without full reloads"
                />
              </UFormField>
            </div>
            <div
              v-else-if="step === 2"
              class="space-y-6"
            >
              <UFormField
                :label="lesson.mode === 'fix' ? 'What is wrong?' : 'Outline'"
                required
                :help="lesson.mode === 'fix' ? 'Quote the passage and say what it should say.' : 'What it teaches, in what order, and what the learner builds.'"
              >
                <UTextarea
                  v-model="lesson.body"
                  :rows="8"
                  autoresize
                  class="w-full"
                />
              </UFormField>
              <div>
                <p class="mono-label mb-3">
                  Sources — optional
                </p>
                <div class="space-y-2">
                  <div
                    v-for="(src, i) in lesson.sources"
                    :key="i"
                    class="flex gap-2"
                  >
                    <UInput
                      v-model="src.url"
                      placeholder="https://help.salesforce.com/…"
                      class="flex-1"
                    >
                      <template #leading>
                        <SubmitFavicon
                          :url="src.url"
                          :size="18"
                        />
                      </template>
                    </UInput>
                    <UButton
                      icon="i-lucide-trash-2"
                      color="neutral"
                      variant="ghost"
                      square
                      aria-label="Remove source"
                      :disabled="lesson.sources.length === 1"
                      @click="lesson.sources.splice(i, 1)"
                    />
                  </div>
                </div>
                <UButton
                  class="mt-3"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :disabled="lesson.sources.length >= 6"
                  @click="lesson.sources.push({ url: '' })"
                >
                  Add a source
                </UButton>
              </div>
            </div>
          </template>

          <!-- TRANSLATION -->
          <template v-else-if="type === 'translation'">
            <div
              v-if="step === 1"
              class="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]"
            >
              <UFormField
                label="Language"
                required
              >
                <USelect
                  v-model="tr.locale"
                  :items="localeItems"
                  placeholder="Pick a language"
                  size="xl"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Lesson"
                required
              >
                <USelectMenu
                  v-model="tr.path"
                  :items="lessonItems"
                  value-key="value"
                  placeholder="Search lessons…"
                  size="xl"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div
              v-else-if="step === 2"
              class="grid gap-6 lg:grid-cols-2"
            >
              <UFormField
                label="The text as it reads now"
                required
              >
                <UTextarea
                  v-model="tr.wrong"
                  :rows="6"
                  autoresize
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="What it should say"
                required
              >
                <UTextarea
                  v-model="tr.suggested"
                  :rows="6"
                  autoresize
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Note"
                hint="Optional"
                class="lg:col-span-2"
              >
                <UInput
                  v-model="tr.note"
                  class="w-full"
                  placeholder="e.g. 'Grain' is a term of art here, not wheat"
                />
              </UFormField>
            </div>
          </template>

          <!-- SNIPPET -->
          <template v-else-if="type === 'snippet'">
            <div
              v-if="step === 1"
              class="space-y-6"
            >
              <UFormField
                label="Title"
                required
              >
                <UInput
                  v-model="snip.title"
                  size="xl"
                  class="w-full"
                  placeholder="Running total by fiscal quarter"
                />
              </UFormField>
              <UFormField
                label="SAQL"
                required
              >
                <UTextarea
                  v-model="snip.saql"
                  :rows="12"
                  autoresize
                  spellcheck="false"
                  class="w-full"
                  :ui="{ base: 'bg-[#07122A] font-mono text-sm text-[#DDEBFA] placeholder:text-[#7FB2EA]/60' }"
                  placeholder="q = load &quot;opportunities&quot;;&#10;q = group q by 'CloseDate_Year';&#10;q = foreach q generate 'CloseDate_Year', sum('Amount') as 'total';"
                />
              </UFormField>
            </div>
            <div
              v-else-if="step === 2"
              class="grid gap-6 lg:grid-cols-2"
            >
              <UFormField
                label="What does it do?"
                required
                class="lg:col-span-2"
              >
                <UTextarea
                  v-model="snip.what"
                  :rows="4"
                  autoresize
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Dataset"
                hint="Optional"
              >
                <UInput
                  v-model="snip.dataset"
                  class="w-full"
                  placeholder="opportunities"
                />
              </UFormField>
              <UFormField
                label="Dataset shape"
                hint="Optional"
                help="The fields the query needs, with types."
              >
                <UTextarea
                  v-model="snip.shape"
                  :rows="3"
                  autoresize
                  class="w-full"
                  :ui="{ base: 'font-mono text-sm' }"
                  placeholder="CloseDate (date), Amount (measure), StageName (dimension)"
                />
              </UFormField>
            </div>
          </template>

          <!-- REVIEW (all types) -->
          <div
            v-if="isReview"
            class="space-y-6"
          >
            <p class="text-(--ink2)">
              This is exactly what will be sent for review.
            </p>
            <dl class="border-[1.5px] border-(--ink)">
              <div class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <dt class="mono-label">
                  Type
                </dt>
                <dd class="flex items-center gap-2 font-semibold">
                  <UIcon
                    :name="typeInfo.icon"
                    class="size-4 text-(--signal)"
                  />{{ typeInfo.label }}
                </dd>
              </div>
              <div class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <dt class="mono-label">
                  Title
                </dt>
                <dd class="font-semibold">
                  {{ payload.title }}
                </dd>
              </div>
              <div class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <dt class="mono-label">
                  Summary
                </dt>
                <dd class="whitespace-pre-line text-sm text-(--ink2)">
                  {{ payload.description }}
                </dd>
              </div>

              <template v-if="type === 'dashboard'">
                <div class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <dt class="mono-label">
                    Domain · level
                  </dt>
                  <dd>{{ dash.domain }} · {{ dash.difficulty }}</dd>
                </div>
                <div class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <dt class="mono-label">
                    Data sources
                  </dt>
                  <dd>
                    <ul class="space-y-1 text-sm">
                      <li
                        v-for="s in dashSources"
                        :key="s.name"
                      >
                        <span class="font-mono text-[11px] uppercase text-(--ink2)">{{ s.type }}</span> — {{ s.name }}<span v-if="s.rows"> · {{ s.rows }} rows</span>
                      </li>
                    </ul>
                  </dd>
                </div>
                <div class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <dt class="mono-label">
                    KPIs
                  </dt>
                  <dd>
                    <ul class="space-y-2 text-sm">
                      <li
                        v-for="k in dashKpis"
                        :key="k.name"
                      >
                        <span class="font-bold">{{ k.name }}</span>
                        <code class="mt-1 block bg-(--ice) px-2 py-1 font-mono text-xs">{{ k.formula }}</code>
                      </li>
                    </ul>
                  </dd>
                </div>
                <div
                  v-if="dash.techniques.length"
                  class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]"
                >
                  <dt class="mono-label">
                    Techniques
                  </dt>
                  <dd class="flex flex-wrap gap-1.5">
                    <span
                      v-for="x in dash.techniques"
                      :key="x"
                      class="border border-(--signal) px-2 py-0.5 font-mono text-[10px] uppercase text-(--signal)"
                    >{{ x }}</span>
                  </dd>
                </div>
                <div
                  v-if="dash.media.length"
                  class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]"
                >
                  <dt class="mono-label">
                    Screenshots
                  </dt>
                  <dd class="flex flex-wrap gap-2">
                    <img
                      v-for="m in dash.media"
                      :key="m.url"
                      :src="m.url"
                      alt=""
                      referrerpolicy="no-referrer"
                      class="h-16 w-28 border border-(--ink) object-cover"
                    >
                  </dd>
                </div>
              </template>

              <template v-else-if="type === 'lesson' && lesson.mode === 'fix'">
                <div class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <dt class="mono-label">
                    Lesson
                  </dt>
                  <dd>
                    <NuxtLink
                      :to="localePath(lesson.path)"
                      target="_blank"
                      class="text-(--signal) underline"
                    >{{ lessonLabel(lesson.path) }}</NuxtLink>
                  </dd>
                </div>
              </template>

              <template v-else-if="type === 'snippet'">
                <div class="grid gap-1 border-b border-dashed border-(--line) p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <dt class="mono-label">
                    SAQL
                  </dt>
                  <dd>
                    <pre class="overflow-x-auto border border-(--ink) bg-[#07122A] p-3 font-mono text-xs text-[#DDEBFA]">{{ snip.saql }}</pre>
                  </dd>
                </div>
              </template>

              <div
                v-if="allLinks.length"
                class="grid gap-1 p-4 sm:grid-cols-[12rem_minmax(0,1fr)]"
              >
                <dt class="mono-label">
                  Links
                </dt>
                <dd>
                  <ul class="space-y-2">
                    <li
                      v-for="l in allLinks"
                      :key="l"
                      class="flex min-w-0 items-center gap-2 text-sm"
                    >
                      <SubmitFavicon :url="l" />
                      <a
                        :href="l"
                        target="_blank"
                        rel="noopener nofollow"
                        class="truncate text-(--signal) underline"
                      >{{ l }}</a>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>
            <p
              v-if="error"
              class="border-[1.5px] border-error bg-error/10 px-4 py-3 text-sm text-error"
            >
              {{ error }}
            </p>
          </div>

          <!-- Validation message -->
          <p
            v-if="showProblem && problem"
            class="mt-6 flex items-center gap-2 border-[1.5px] border-dashed border-warning px-4 py-3 text-sm text-warning"
            role="alert"
          >
            <UIcon
              name="i-lucide-triangle-alert"
              class="size-4 flex-none"
            />{{ problem }}
          </p>
        </div>

        <!-- Footer controls -->
        <div
          v-if="step > 0"
          class="flex items-center justify-between gap-3 border-t-[1.5px] border-(--ink) px-5 py-4 sm:px-8"
        >
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="outline"
            size="lg"
            @click="back"
          >
            Back
          </UButton>
          <UButton
            v-if="!isReview"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
            @click="next"
          >
            Next — {{ steps[step + 1] }}
          </UButton>
          <UButton
            v-else
            icon="i-lucide-send"
            size="lg"
            :loading="sending"
            @click="send"
          >
            Submit for review
          </UButton>
        </div>
      </div>

      <!-- Your submissions -->
      <section class="mt-16">
        <p class="eyebrow">
          Fig. 02 — Your submissions
        </p>
        <h2 class="bp-h3 mt-2">
          What you have sent
        </h2>
        <p
          v-if="!mine?.submissions?.length"
          class="mt-6 border-[1.5px] border-dashed border-(--line) p-6 text-center text-sm text-(--ink2)"
        >
          Nothing yet — your first contribution will show up here with its review status.
        </p>
        <ul
          v-else
          class="mt-6 border-[1.5px] border-(--ink) bg-(--card)"
        >
          <li
            v-for="s in mine.submissions"
            :key="s.id"
            class="flex flex-wrap items-center gap-3 border-b border-dashed border-(--line) px-4 py-3 last:border-b-0"
          >
            <SubmitFavicon
              v-if="s.url"
              :url="s.url"
            />
            <span class="w-24 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">{{ typeLabel(s) }}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-(--ink)">{{ s.title }}</span>
              <a
                v-if="s.url"
                :href="s.url"
                target="_blank"
                rel="noopener nofollow"
                class="block truncate font-mono text-[11px] text-(--signal)"
              >{{ hostOf(s.url) }}</a>
              <span
                v-if="s.reviewNote"
                class="block text-xs text-(--ink2)"
              >Note: {{ s.reviewNote }}</span>
            </span>
            <span
              class="border-[1.5px] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.08em]"
              :class="STATUS[s.status].cls"
            >{{ STATUS[s.status].label }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
