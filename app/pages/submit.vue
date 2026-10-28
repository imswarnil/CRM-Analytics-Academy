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

definePageMeta({ middleware: 'auth' })

const { t, locales } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
useSeoMeta({ title: t('contrib.title'), robots: 'noindex, nofollow' })

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
  website: '' // honeypot — hidden from people
})
const CATEGORIES = ['uses', 'hires', 'partner'] as const
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
      return { kind: 'resource' as Kind, title: clip(form.title, 160), url: form.url.trim(), description: clip(form.body, 2000), details: { type: 'resource' } }
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
    Object.assign(form, { url: '', title: '', body: '', company: '', wrong: '', self: false })
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
  pending: 'border-(--line) text-(--ink2)',
  approved: 'border-(--signal) text-(--signal)',
  rejected: 'border-error text-error'
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <p class="eyebrow">
      {{ t('contrib.eyebrow') }}
    </p>
    <h1 class="bp-h2 mt-3">
      {{ t('contrib.title') }}
    </h1>
    <p class="bp-lead mt-3">
      {{ t('contrib.lead') }}
    </p>

    <!-- 1. What are you sharing? -->
    <fieldset class="mt-10">
      <legend class="text-lg font-bold text-(--ink)">
        <span class="font-mono text-(--signal)">1</span> · {{ t('contrib.pick') }}
      </legend>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          v-for="ty in TYPES"
          :key="ty.value"
          type="button"
          class="flex min-h-16 items-start gap-3 border-[1.5px] p-4 text-start transition-colors"
          :class="type === ty.value ? 'border-(--ink) bg-(--ice) shadow-[4px_4px_0_var(--ink)]' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
          :aria-pressed="type === ty.value"
          @click="choose(ty.value)"
        >
          <UIcon
            :name="ty.icon"
            class="mt-0.5 size-6 shrink-0 text-(--signal)"
          />
          <span>
            <span class="block text-[17px] font-bold text-(--ink)">{{ t(`contrib.types.${ty.value}.label`) }}</span>
            <span class="mt-0.5 block text-[15px] leading-snug text-(--ink2)">{{ t(`contrib.types.${ty.value}.hint`) }}</span>
          </span>
        </button>
      </div>
    </fieldset>

    <!-- 2. The short form -->
    <form
      v-if="type && !sent"
      class="mt-10 space-y-6"
      novalidate
      @submit.prevent="send"
    >
      <p class="text-lg font-bold text-(--ink)">
        <span class="font-mono text-(--signal)">2</span> · {{ t(`contrib.types.${type}.label`) }}
      </p>

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
            size="xl"
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
          size="xl"
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
            size="xl"
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
            size="xl"
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
            size="xl"
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
          size="xl"
          class="w-full"
          placeholder="https://"
        />
      </UFormField>

      <UFormField
        v-if="type === 'resource'"
        :label="t('contrib.f.title')"
        required
      >
        <UInput
          v-model="form.title"
          size="xl"
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
          :rows="5"
          autoresize
          class="w-full"
        />
      </UFormField>

      <UCheckbox
        v-if="type === 'nominate'"
        v-model="form.self"
        :label="t('contrib.f.self')"
      />

      <UAlert
        v-if="(tried && problem) || error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :description="error || problem"
      />

      <div class="flex flex-wrap items-center gap-4">
        <UButton
          type="submit"
          size="xl"
          :loading="sending"
          icon="i-lucide-send"
        >
          {{ t('contrib.send') }}
        </UButton>
        <p class="text-[15px] text-(--ink2)">
          {{ t('contrib.reviewed') }}
        </p>
      </div>
    </form>

    <div
      v-if="sent"
      class="mt-10 border-[1.5px] border-(--ink) bg-(--ice) p-6"
    >
      <p class="text-xl font-bold text-(--ink)">
        {{ t('contrib.thanks') }}
      </p>
      <p class="mt-2 text-(--ink2)">
        {{ t('contrib.thanksBody') }}
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
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

    <!-- 3. Yours -->
    <section
      v-if="mine?.submissions?.length"
      class="mt-14"
    >
      <h2 class="text-lg font-bold text-(--ink)">
        {{ t('contrib.mine') }}
      </h2>
      <ul class="mt-4 divide-y divide-(--line) border-[1.5px] border-(--line) bg-(--card)">
        <li
          v-for="s in mine.submissions"
          :key="s.id"
          class="flex flex-wrap items-center gap-3 px-4 py-3"
        >
          <span class="min-w-0 flex-1 truncate font-semibold text-(--ink)">{{ s.title }}</span>
          <span
            class="border-[1.5px] px-2 py-0.5 font-mono text-[11px] uppercase"
            :class="STATUS[s.status]"
          >{{ t(`contrib.status.${s.status}`) }}</span>
          <p
            v-if="s.reviewNote"
            class="w-full text-sm text-(--ink2)"
          >
            {{ s.reviewNote }}
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>
