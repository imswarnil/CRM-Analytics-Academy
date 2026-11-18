<script setup lang="ts">
/**
 * Contribute — one calm page, no stepper.
 *
 * 1. Pick what you are sharing (five choices, each one line long).
 * 2. Fill in a short form: two to four fields, every one labelled with what
 *    it is for. One Submit button.
 * 3. See it in "Your contributions" with its review status.
 *
 * Everything posts to /api/submissions: `kind` is the moderation bucket,
 * `details.type` what it really is. Nothing is public until approved in
 * /admin. Old links (?kind=resource, ?type=lesson) still land on the right
 * form.
 */
import { isHttpUrl } from '~/utils/urlMeta'
import { ROADMAP } from '~/data/roadmap'

definePageMeta({ focus: true, middleware: 'auth' })

const { t, locales } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
useSeoMeta({ title: t('contrib.title'), robots: 'noindex, nofollow' })
// One screen, like a practice paper: the navbar stays, no footer or promos.
const focus = useState('exam-focus', () => false)
focus.value = true
onBeforeUnmount(() => (focus.value = false))

type Type = 'resource' | 'company' | 'nominate' | 'lesson' | 'translation'
type Kind = 'resource' | 'lesson-idea' | 'nomination'

const TYPES: { value: Type, icon: string }[] = [
  { value: 'resource', icon: 'i-lucide-link' },
  { value: 'company', icon: 'i-lucide-building-2' },
  { value: 'nominate', icon: 'i-lucide-award' },
  { value: 'lesson', icon: 'i-lucide-lightbulb' },
  { value: 'translation', icon: 'i-lucide-languages' }
]
const LEGACY: Record<string, Type> = { 'resource': 'resource', 'lesson-idea': 'lesson', 'nomination': 'nominate', 'snippet': 'lesson', 'dashboard': 'resource' }
const fromQuery = String(route.query.type ?? route.query.kind ?? '')
const type = ref<Type | null>(TYPES.some(x => x.value === fromQuery) ? fromQuery as Type : LEGACY[fromQuery] ?? null)

// One flat form; each type uses the fields it needs.
const form = reactive({
  url: '',
  title: '',
  body: '',
  company: '',
  companyKind: 'uses' as 'uses' | 'hires' | 'partner',
  role: 'learner' as string,
  self: false,
  lessonMode: 'fix' as 'fix' | 'idea',
  locale: '' as string,
  wrong: '',
  resType: 'article' as ResType,
  section: '' as string,
  website: '' // honeypot — hidden from people
})
const CATEGORIES = ['uses', 'hires', 'partner'] as const
type ResType = 'article' | 'video' | 'tool' | 'docs' | 'dataset'
const RES_TYPES: { value: ResType, icon: string }[] = [
  { value: 'article', icon: 'i-lucide-file-text' },
  { value: 'video', icon: 'i-lucide-circle-play' },
  { value: 'tool', icon: 'i-lucide-wrench' },
  { value: 'docs', icon: 'i-lucide-book-open' },
  { value: 'dataset', icon: 'i-lucide-database' }
]
const sectionItems = computed(() => [{ label: t('contrib.anySection'), value: '' }, ...ROADMAP.map(r => ({ label: t(`roadmap.${r.key}.title`), value: r.key }))])
// The link's host, for the preview and a title guess.
const host = computed(() => {
  try {
    return isHttpUrl(form.url) ? new URL(form.url.trim()).hostname.replace(/^www\./, '') : ''
  } catch {
    return ''
  }
})
function guessTitle() {
  if (form.title.trim() || !isHttpUrl(form.url)) return
  try {
    const u = new URL(form.url.trim())
    const last = u.pathname.split('/').filter(Boolean).pop() ?? ''
    const words = decodeURIComponent(last).replace(/\.[a-z]+$/i, '').replace(/[-_]+/g, ' ').trim()
    if (words.length > 3) form.title = words.charAt(0).toUpperCase() + words.slice(1)
  } catch {
    // not a URL yet
  }
}
const ROLES = ['learner', 'mentor', 'creator', 'contributor'] as const
const localeItems = computed(() => locales.value.filter(l => l.code !== 'en').map(l => ({ label: l.name ?? l.code, value: l.code as string })))

const len = (s: string) => s.trim().length

/** The first problem with the form, in words, or '' when it can be sent. */
const problem = computed(() => {
  switch (type.value) {
    case 'resource':
      if (!isHttpUrl(form.url)) return t('contrib.err.link')
      if (len(form.title) < 3) return t('contrib.err.title')
      if (len(form.body) < 20) return t('contrib.err.why')
      return ''
    case 'company':
      if (len(form.company) < 2) return t('contrib.err.company')
      if (!isHttpUrl(form.url)) return t('contrib.err.source')
      if (len(form.body) < 20) return t('contrib.err.why')
      return ''
    case 'nominate':
      if (len(form.title) < 3) return t('contrib.err.name')
      if (form.url && !isHttpUrl(form.url)) return t('contrib.err.link')
      if (len(form.body) < 20) return t('contrib.err.why')
      return ''
    case 'lesson':
      if (len(form.title) < 3) return t('contrib.err.title')
      if (len(form.body) < 20) return t('contrib.err.why')
      return ''
    case 'translation':
      if (!form.locale) return t('contrib.err.locale')
      if (len(form.title) < 3) return t('contrib.err.page')
      if (len(form.wrong) < 2 || len(form.body) < 2) return t('contrib.err.correction')
      return ''
  }
  return t('contrib.err.pick')
})

const clip = (s: string, n: number) => (s.trim().length > n ? `${s.trim().slice(0, n - 1)}…` : s.trim())

function payload() {
  switch (type.value) {
    case 'resource':
      return { kind: 'resource' as Kind, title: clip(form.title, 160), url: form.url.trim(), description: clip(form.body, 2000), tags: [form.resType, ...(form.section ? [form.section] : [])], details: { type: 'resource', resType: form.resType, section: form.section || undefined } }
    case 'company':
      return { kind: 'resource' as Kind, title: clip(form.company, 160), url: form.url.trim(), description: clip(form.body, 2000), tags: ['company', form.companyKind], details: { type: 'company', category: form.companyKind } }
    case 'nominate':
      return { kind: 'nomination' as Kind, title: clip(form.title, 160), url: form.url.trim() || undefined, description: clip(form.body, 2000), tags: [form.role], details: { type: 'nominate', role: form.role, self: form.self } }
    case 'lesson':
      return { kind: 'lesson-idea' as Kind, title: clip(`${form.lessonMode === 'fix' ? 'Fix' : 'Idea'}: ${form.title}`, 160), description: clip(form.body, 2000), tags: [form.lessonMode === 'fix' ? 'lesson-fix' : 'lesson-idea'], details: { type: 'lesson', mode: form.lessonMode } }
    case 'translation':
      return {
        kind: 'lesson-idea' as Kind,
        title: clip(`Translation (${form.locale}): ${form.title}`, 160),
        description: clip(`Wrong: ${form.wrong}\nSuggested: ${form.body}`, 2000),
        tags: ['translation', form.locale],
        details: { type: 'translation', locale: form.locale, lessonPath: form.title.trim(), wrong: form.wrong.trim(), suggested: form.body.trim() }
      }
  }
  throw new Error('pick a type')
}

const sending = ref(false)
const sent = ref(false)
const tried = ref(false)
const error = ref('')

async function send() {
  tried.value = true
  error.value = ''
  if (problem.value || form.website) return
  sending.value = true
  try {
    await $fetch('/api/submissions', { method: 'POST', body: payload() })
    useNuxtApp().$track?.('contribute', type.value ?? '')
    sent.value = true
    tried.value = false
    Object.assign(form, { url: '', title: '', body: '', company: '', wrong: '', self: false, section: '' })
    await refreshMine()
  } catch (e) {
    const err = e as { statusMessage?: string, data?: { statusMessage?: string } }
    error.value = err?.data?.statusMessage || err?.statusMessage || t('contrib.err.generic')
  } finally {
    sending.value = false
  }
}

function choose(v: Type) {
  type.value = v
  sent.value = false
  tried.value = false
  error.value = ''
}

interface Mine {
  id: number
  kind: string
  type: string | null
  title: string
  status: 'pending' | 'approved' | 'rejected'
  reviewNote: string | null
}
const { data: mine, refresh: refreshMine } = await useLazyAsyncData('my-submissions', () =>
  $fetch<{ submissions: Mine[] }>('/api/submissions'), { server: false, default: () => ({ submissions: [] as Mine[] }) })
const STATUS: Record<Mine['status'], string> = {
  pending: 'bg-(--ice) text-(--ink2)',
  approved: 'bg-(--signal)/12 text-(--signal)',
  rejected: 'bg-error/10 text-error'
}
</script>

<template>
  <!-- Exactly the viewport on desktop: a slim bar of calls to action, then
       the choice on the left and the form on the right, each scrolling
       inside its own column if it must — the page itself never does. -->
  <div class="flex flex-col bg-(--paper) lg:h-[calc(100dvh-var(--ui-header-height))] lg:overflow-hidden">
    <!-- Calls to action: above everything, not in a hero -->
    <div class="shrink-0 border-b border-(--line) bg-(--card)">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <p class="me-auto text-sm text-(--ink2)">
          {{ t('contrib.ctaLine') }}
        </p>
        <UButton
          :to="SITE.youtube"
          target="_blank"
          size="sm"
          icon="i-simple-icons-youtube"
          class="bg-[#FF0000] text-white hover:bg-[#d90000]"
        >
          {{ t('contrib.ctaYoutube') }}
        </UButton>
        <UButton
          :to="SITE.github"
          target="_blank"
          size="sm"
          color="neutral"
          variant="outline"
          icon="i-simple-icons-github"
        >
          {{ t('contrib.ctaGithub') }}
        </UButton>
      </div>
    </div>

    <div class="mx-auto grid w-full min-h-0 max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <!-- 1. What are you sharing? -->
      <div class="flex min-h-0 flex-col gap-5 lg:overflow-y-auto lg:pe-1">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-(--ink)">
            {{ t('contrib.title') }}
          </h1>
          <p class="mt-1.5 text-sm leading-relaxed text-(--ink2)">
            {{ t('contrib.lead') }}
          </p>
          <p class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-(--ice) px-3 py-1 text-xs font-medium text-(--ink)">
            <UIcon
              name="i-lucide-coins"
              class="size-3.5 text-(--signal)"
            />{{ t('contrib.pointsBadge') }}
          </p>
        </div>

        <fieldset>
          <legend class="mb-2 text-xs font-medium text-(--ink2)">
            {{ t('contrib.pick') }}
          </legend>
          <div class="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            <button
              v-for="ty in TYPES"
              :key="ty.value"
              type="button"
              class="group flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-start transition-colors duration-150"
              :class="type === ty.value ? 'bg-(--card) ring-1 ring-(--signal)' : 'hover:bg-(--card)'"
              :aria-pressed="type === ty.value"
              @click="choose(ty.value)"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-[4px] transition-colors"
                :class="type === ty.value ? 'bg-(--signal) text-white' : 'bg-(--ice) text-(--signal)'"
              >
                <UIcon
                  :name="ty.icon"
                  class="size-[18px]"
                />
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-(--ink)">{{ t(`contrib.types.${ty.value}.label`) }}</span>
                <span class="line-clamp-2 block text-xs leading-snug text-(--ink2)">{{ t(`contrib.types.${ty.value}.hint`) }}</span>
              </span>
            </button>
          </div>
        </fieldset>

        <!-- 3. Yours -->
        <section
          v-if="mine?.submissions?.length"
          class="max-lg:order-last"
        >
          <h2 class="mb-2 text-xs font-medium text-(--ink2)">
            {{ t('contrib.mine') }}
          </h2>
          <ul class="divide-y divide-(--line) overflow-hidden rounded-[6px] border border-(--line) bg-(--card)">
            <li
              v-for="s in mine.submissions"
              :key="s.id"
              class="flex flex-wrap items-center gap-2 px-3 py-2.5"
            >
              <span class="min-w-0 flex-1 truncate text-sm text-(--ink)">{{ s.title }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="STATUS[s.status]"
              >{{ t(`contrib.status.${s.status}`) }}</span>
              <p
                v-if="s.reviewNote"
                class="w-full text-xs text-(--ink2)"
              >
                {{ s.reviewNote }}
              </p>
            </li>
          </ul>
        </section>
      </div>

      <!-- 2. The short form -->
      <div class="flex min-h-0 min-w-0 flex-col">
        <div
          v-if="!type && !sent"
          class="flex min-h-64 flex-1 flex-col items-center justify-center gap-3 rounded-[6px] border border-dashed border-(--line) p-8 text-center text-(--ink2)"
        >
          <UIcon
            name="i-lucide-mouse-pointer-click"
            class="size-7 text-(--signal)"
          />
          {{ t('contrib.err.pick') }}
        </div>

        <form
          v-if="type && !sent"
          class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-(--line) bg-(--card)"
          novalidate
          @submit.prevent="send"
        >
          <header class="flex shrink-0 items-center gap-3 border-b border-(--line) px-6 py-4">
            <UIcon
              :name="TYPES.find(x => x.value === type)!.icon"
              class="size-5 text-(--signal)"
            />
            <p class="text-base font-semibold text-(--ink)">
              {{ t(`contrib.types.${type}.label`) }}
            </p>
          </header>

          <div class="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <!-- honeypot: invisible to people, filled in by naive bots -->
            <input
              v-model="form.website"
              name="website"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
              class="absolute -left-[9999px] size-px opacity-0"
            >

            <template v-if="type === 'company'">
              <UFormField
                :label="t('contrib.f.company')"
                required
              >
                <UInput
                  v-model="form.company"
                  size="lg"
                  class="w-full"
                  :placeholder="t('contrib.ph.company')"
                />
              </UFormField>
              <UFormField :label="t('contrib.f.companyKind')">
                <URadioGroup
                  v-model="form.companyKind"
                  orientation="horizontal"
                  :items="CATEGORIES.map(c => ({ label: t(`companies.kinds.${c}`), value: c }))"
                />
              </UFormField>
            </template>

            <UFormField
              v-if="type === 'nominate'"
              :label="t('contrib.f.name')"
              required
            >
              <UInput
                v-model="form.title"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <template v-if="type === 'lesson'">
              <URadioGroup
                v-model="form.lessonMode"
                orientation="horizontal"
                :items="[{ label: t('contrib.f.fix'), value: 'fix' }, { label: t('contrib.f.idea'), value: 'idea' }]"
              />
              <UFormField
                :label="form.lessonMode === 'fix' ? t('contrib.f.whichLesson') : t('contrib.f.ideaTitle')"
                required
              >
                <UInput
                  v-model="form.title"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
            </template>

            <template v-if="type === 'translation'">
              <UFormField
                :label="t('contrib.f.language')"
                required
              >
                <USelect
                  v-model="form.locale"
                  :items="localeItems"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                :label="t('contrib.f.page')"
                :hint="t('contrib.ph.page')"
                required
              >
                <UInput
                  v-model="form.title"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                :label="t('contrib.f.wrong')"
                required
              >
                <UTextarea
                  v-model="form.wrong"
                  :rows="2"
                  autoresize
                  class="w-full"
                />
              </UFormField>
            </template>

            <UFormField
              v-if="type === 'resource' || type === 'company' || type === 'nominate'"
              :label="type === 'company' ? t('contrib.f.source') : type === 'nominate' ? t('contrib.f.profile') : t('contrib.f.link')"
              :hint="type === 'nominate' ? t('contrib.optional') : undefined"
              :help="type === 'company' ? t('contrib.ph.source') : undefined"
              :required="type !== 'nominate'"
            >
              <UInput
                v-model="form.url"
                type="url"
                inputmode="url"
                size="lg"
                class="w-full"
                placeholder="https://"
                @blur="type === 'resource' && guessTitle()"
              />
            </UFormField>

            <template v-if="type === 'resource'">
              <UFormField :label="t('contrib.f.resType')">
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="r in RES_TYPES"
                    :key="r.value"
                    type="button"
                    class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                    :class="form.resType === r.value ? 'border-(--signal) bg-(--ice) text-(--signal)' : 'border-(--line) text-(--ink2) hover:border-(--signal)'"
                    :aria-pressed="form.resType === r.value"
                    @click="form.resType = r.value"
                  >
                    <UIcon
                      :name="r.icon"
                      class="size-4"
                    />{{ t(`contrib.resTypes.${r.value}`) }}
                  </button>
                </div>
              </UFormField>
              <UFormField :label="t('contrib.f.section')">
                <USelect
                  v-model="form.section"
                  :items="sectionItems"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
            </template>

            <UFormField
              v-if="type === 'resource'"
              :label="t('contrib.f.title')"
              required
            >
              <UInput
                v-model="form.title"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField
              v-if="type === 'nominate'"
              :label="t('contrib.f.role')"
            >
              <URadioGroup
                v-model="form.role"
                orientation="horizontal"
                :items="ROLES.map(r => ({ label: t(`contrib.roles.${r}`), value: r as string }))"
              />
            </UFormField>

            <UFormField
              :label="t(`contrib.body.${type}`)"
              :help="t('contrib.bodyHelp')"
              required
            >
              <UTextarea
                v-model="form.body"
                :rows="4"
                autoresize
                :maxrows="10"
                class="w-full"
              />
            </UFormField>

            <UCheckbox
              v-if="type === 'nominate'"
              v-model="form.self"
              :label="t('contrib.f.self')"
            />

            <!-- How it will look on /resources once approved -->
            <div
              v-if="type === 'resource' && (form.title || host)"
              class="rounded-[6px] border border-dashed border-(--line) bg-(--paper) p-4"
            >
              <p class="mb-3 text-[10px] font-bold uppercase tracking-[.09em] text-(--label)">
                {{ t('contrib.preview') }}
              </p>
              <div class="flex items-start gap-3 rounded-[6px] border border-(--line) bg-(--card) p-4">
                <span class="flex size-10 shrink-0 items-center justify-center rounded-[4px] bg-(--ice) text-(--signal)">
                  <UIcon
                    :name="RES_TYPES.find(r => r.value === form.resType)!.icon"
                    class="size-5"
                  />
                </span>
                <div class="min-w-0">
                  <p class="font-bold text-(--ink)">
                    {{ form.title || t('contrib.f.title') }}
                  </p>
                  <p class="mt-0.5 line-clamp-2 text-sm text-(--ink2)">
                    {{ form.body || t('contrib.body.resource') }}
                  </p>
                  <p class="mt-2 text-xs font-medium text-(--signal)">
                    {{ host || 'example.com' }}<template v-if="form.section">
                      · {{ t(`roadmap.${form.section}.title`) }}
                    </template>
                  </p>
                </div>
              </div>
            </div>

            <UAlert
              v-if="(tried && problem) || error"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :description="error || problem"
            />
          </div>

          <footer class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-(--line) px-6 py-4">
            <p class="text-sm text-(--ink2)">
              {{ t('contrib.reviewed') }}
            </p>
            <UButton
              type="submit"
              size="lg"
              class="px-6"
              :loading="sending"
              icon="i-lucide-send"
            >
              {{ t('contrib.send') }}
            </UButton>
          </footer>
        </form>

        <div
          v-if="sent"
          class="flex flex-1 flex-col items-center justify-center rounded-[6px] border border-(--line) bg-(--card) p-10 text-center"
        >
          <span class="flex size-14 items-center justify-center rounded-full bg-(--signal)/12">
            <UIcon
              name="i-lucide-check"
              class="size-7 text-(--signal)"
            />
          </span>
          <p class="mt-5 text-xl font-semibold text-(--ink)">
            {{ t('contrib.thanks') }}
          </p>
          <p class="mt-2 max-w-md text-(--ink2)">
            {{ t('contrib.thanksBody') }}
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <UButton
              icon="i-lucide-plus"

              @click="sent = false"
            >
              {{ t('contrib.another') }}
            </UButton>
            <UButton
              :to="localePath('/dashboard')"
              color="neutral"
              variant="outline"
            >
              {{ t('contrib.toDashboard') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
