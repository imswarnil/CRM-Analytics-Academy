<script setup lang="ts">
// The same list the server enforces; plain TypeScript, safe in the browser.
import { emailDomain, isFreeEmailDomain } from '../../server/utils/freeEmailDomains'

/**
 * One form for every way to reach the Academy: contact, sales, quotes, team
 * sign-ups, implementation, sponsorship, instructor applications, Wall of
 * Fame nominations, and the experts network — project requests (`project`)
 * and applications to join (`expert`).
 *
 * The contact fields are shared; `type` decides which of them are required,
 * whether a work email is required (business conversations — the company
 * domain is how a lead is matched to its company), and which type-specific
 * fields appear. Everything is validated again on the server in
 * server/utils/leads.ts; this side only gives earlier, friendlier errors.
 */
type LeadType = 'quote' | 'sales' | 'contact' | 'instructor' | 'sponsor' | 'team' | 'nomination' | 'implementation' | 'project' | 'expert'

interface Option {
  label: string
  value: string
}

interface Field {
  key: string
  label: string
  kind: 'select' | 'multiselect' | 'text' | 'url' | 'textarea'
  /** Plain strings are stored as written; options store `value` and show `label`. */
  options?: string[] | Option[]
  required?: boolean
  placeholder?: string
  wide?: boolean
}

interface TypeConfig {
  label: string
  submit: string
  done: string
  message: string
  messageRequired?: boolean
  company: 'required' | 'optional' | 'hidden'
  role?: boolean
  country?: boolean
  seats?: string
  budget?: string[] | Option[]
  fields: Field[]
}

const props = defineProps<{
  type: LeadType
  /** Pre-filled detail values, e.g. the programme a learner clicked. */
  preset?: Record<string, string>
}>()

const { t } = useI18n()

const WORK_EMAIL: LeadType[] = ['quote', 'sales', 'team', 'implementation', 'sponsor', 'project']

/** Options whose stored value is a stable key and whose label is translated. */
function keyed(keys: readonly string[], prefix: string): Option[] {
  return keys.map(k => ({ value: k, label: t(`${prefix}.${k}`) }))
}

// The experts network's forms are translated; the older ones are English-only
// pages and keep their English config below.
const EXPERT_CONFIG = computed<Record<'project' | 'expert', TypeConfig>>(() => ({
  project: {
    label: t('experts.form.project.label'),
    submit: t('experts.form.project.submit'),
    done: t('experts.form.project.done'),
    message: t('experts.form.project.message'),
    messageRequired: true,
    company: 'required',
    role: true,
    country: true,
    budget: keyed(['under10k', 'from10k', 'from50k', 'from150k', 'unsure'], 'experts.form.project.budgets'),
    fields: [
      { key: 'services', label: t('experts.form.project.services'), kind: 'multiselect', required: true, wide: true, options: keyed(PROJECT_SERVICES, 'experts.services') },
      { key: 'orgEdition', label: t('experts.form.project.edition'), kind: 'select', options: keyed(['enterprise', 'unlimited', 'performance', 'unsure'], 'experts.form.project.editions') },
      { key: 'dataSources', label: t('experts.form.project.data'), kind: 'select', options: keyed(['salesforce', 'warehouse', 'files', 'many'], 'experts.form.project.sources') },
      { key: 'timeline', label: t('experts.form.project.timeline'), kind: 'select', options: keyed(['asap', 'months1to3', 'months3to6', 'exploring'], 'experts.form.project.timelines') }
    ]
  },
  expert: {
    label: t('experts.form.expert.label'),
    submit: t('experts.form.expert.submit'),
    done: t('experts.form.expert.done'),
    message: t('experts.form.expert.message'),
    messageRequired: true,
    company: 'optional',
    role: true,
    country: true,
    fields: [
      { key: 'expertise', label: t('experts.form.expert.expertise'), kind: 'multiselect', required: true, wide: true, options: keyed(EXPERT_SKILLS, 'experts.skills') },
      { key: 'experienceYears', label: t('experts.form.expert.years'), kind: 'select', required: true, options: keyed(EXPERT_YEARS, 'experts.years') },
      { key: 'linkedin', label: t('experts.form.expert.linkedin'), kind: 'url', required: true, placeholder: 'https://www.linkedin.com/in/…' },
      { key: 'portfolio', label: t('experts.form.expert.portfolio'), kind: 'url', placeholder: 'https://…' },
      { key: 'rateBand', label: t('experts.form.expert.rate'), kind: 'select', options: keyed(EXPERT_RATES, 'experts.rates') },
      { key: 'availability', label: t('experts.form.expert.availability'), kind: 'select', options: keyed(EXPERT_AVAILABILITY, 'experts.availability') },
      { key: 'timezone', label: t('experts.form.expert.timezone'), kind: 'text', placeholder: t('experts.form.expert.timezonePlaceholder') }
    ]
  }
}))

const LEGACY_CONFIG: Record<Exclude<LeadType, 'project' | 'expert'>, TypeConfig> = {
  contact: {
    label: 'Contact',
    submit: 'Send message',
    done: 'Thanks — we read every message and reply within two working days.',
    message: 'Your message',
    messageRequired: true,
    company: 'optional',
    fields: [
      { key: 'topic', label: 'Topic', kind: 'select', options: ['A question about a lesson', 'My account or Pro', 'Billing', 'Partnership', 'Press', 'Something else'] }
    ]
  },
  sales: {
    label: 'Talk to sales',
    submit: 'Talk to sales',
    done: 'Thanks — someone from the Academy will email you within one working day to set up a call.',
    message: 'What would you like to cover on the call?',
    company: 'required',
    role: true,
    country: true,
    seats: 'People to train',
    fields: [
      { key: 'topic', label: 'Interested in', kind: 'select', options: ['Team licences (Pro for everyone)', 'Custom curriculum for our org', 'Implementation help', 'Partnership / reseller'] },
      { key: 'timeline', label: 'Timeline', kind: 'select', options: ['This month', 'This quarter', 'Next quarter', 'Just exploring'] }
    ]
  },
  quote: {
    label: 'Get a quotation',
    submit: 'Request a quotation',
    done: 'Thanks — a written quotation will reach you within two working days.',
    message: 'Goals for the team, tools you use, anything else',
    company: 'required',
    role: true,
    country: true,
    seats: 'Number of seats',
    budget: ['Under $2k', '$2k–$10k', '$10k–$50k', '$50k+', 'Not sure yet'],
    fields: [
      { key: 'plan', label: 'Programme', kind: 'select', options: ['Pro licences only', 'Foundations for everyone', 'Analyst track', 'Developer / SAQL track', 'Executive dashboards workshop', 'Custom curriculum'] },
      { key: 'delivery', label: 'Delivery', kind: 'select', options: ['Self-paced (licences)', 'Live virtual', 'Onsite at our office', 'At an Academy center', 'Self-paced with mentor hours'] },
      { key: 'timeline', label: 'When', kind: 'select', options: ['This month', 'Next quarter', 'Planning for later'] }
    ]
  },
  team: {
    label: 'Team access',
    submit: 'Set up team access',
    done: 'Thanks — we will email your team administrator with the next steps.',
    message: 'Anything we should know? (optional)',
    company: 'required',
    role: true,
    seats: 'Seats',
    fields: [
      { key: 'plan', label: 'Plan', kind: 'select', options: ['Team (annual)', 'Enterprise (SSO, invoicing)'] }
    ]
  },
  implementation: {
    label: 'Implementation',
    submit: 'Request a consultation',
    done: 'Thanks — a solution architect will reply to schedule a scoping call.',
    message: 'Describe the project: users, data, the decisions it should support',
    messageRequired: true,
    company: 'required',
    role: true,
    country: true,
    budget: ['Under $10k', '$10k–$50k', '$50k–$150k', '$150k+', 'Not sure yet'],
    fields: [
      { key: 'scope', label: 'What do you need?', kind: 'select', options: ['New CRM Analytics rollout', 'Dashboards on existing data', 'Data pipeline / recipes', 'Einstein Discovery model', 'Performance or security review', 'Rescue a stalled project'] },
      { key: 'orgEdition', label: 'Salesforce edition', kind: 'select', options: ['Enterprise', 'Unlimited', 'Performance', 'Not sure'] },
      { key: 'dataSources', label: 'Data sources', kind: 'select', options: ['Salesforce only', 'Salesforce + a warehouse', 'Salesforce + files/ERP', 'Many systems'] },
      { key: 'timeline', label: 'Timeline', kind: 'select', options: ['ASAP', '1–3 months', '3–6 months', 'Exploring'] }
    ]
  },
  sponsor: {
    label: 'Sponsorship',
    submit: 'Start a sponsorship',
    done: 'Thanks — the media kit and available slots will reach you within two working days.',
    message: 'What would you like to promote, and to whom?',
    company: 'required',
    role: true,
    budget: ['Under $500 / month', '$500–$2k / month', '$2k–$5k / month', '$5k+ / month', 'One-off'],
    fields: [
      { key: 'tier', label: 'Interested in', kind: 'select', options: ['Course sponsor (site-wide credit)', 'Section sponsor', 'Newsletter / video mention', 'Dataset or tool feature', 'Talk to us'] },
      { key: 'timeline', label: 'Start', kind: 'select', options: ['This month', 'Next quarter', 'Later this year'] }
    ]
  },
  instructor: {
    label: 'Become an instructor',
    submit: 'Apply to teach',
    done: 'Thanks for applying — we review every application and reply within a week.',
    message: 'A lesson or lab you would love to teach, in a few lines',
    messageRequired: true,
    company: 'optional',
    role: true,
    country: true,
    fields: [
      { key: 'expertise', label: 'Your strongest area', kind: 'select', required: true, options: ['Data prep & recipes', 'SAQL', 'Dashboard design', 'Bindings & interactions', 'Security & sharing', 'Einstein Discovery', 'APIs & automation', 'Go-to-market analytics'] },
      { key: 'experienceYears', label: 'Years with CRM Analytics', kind: 'select', options: ['1–2', '3–5', '6–9', '10+'] },
      { key: 'linkedin', label: 'LinkedIn profile', kind: 'url', placeholder: 'https://www.linkedin.com/in/…' },
      { key: 'portfolio', label: 'Talk, blog or repo (optional)', kind: 'url', placeholder: 'https://…' },
      { key: 'availability', label: 'Availability', kind: 'select', options: ['A lesson or two', 'A section a quarter', 'Live cohorts', 'Mentoring hours'] }
    ]
  },
  nomination: {
    label: 'Wall of Fame nomination',
    submit: 'Send the nomination',
    done: 'Nomination received — thank you. We check every one and let you know if they make the wall.',
    message: 'Anything else we should know? (optional)',
    company: 'hidden',
    fields: [
      { key: 'nomineeName', label: 'Who are you nominating?', kind: 'text', required: true, placeholder: 'Their full name' },
      { key: 'nomineeUrl', label: 'Their LinkedIn or website', kind: 'url', placeholder: 'https://…' },
      { key: 'builtWhat', label: 'What did they build or do?', kind: 'textarea', required: true, wide: true, placeholder: 'A dashboard, a talk, a lesson, help in the community…' },
      { key: 'photoUrl', label: 'Photo URL (optional)', kind: 'url', placeholder: 'https://… (a public image of them)' },
      { key: 'relationship', label: 'How do you know them?', kind: 'select', options: ['Colleague', 'Manager', 'Learner', 'Community member', 'It is me — self-nomination'] }
    ]
  }
}

function configFor(type: LeadType): TypeConfig {
  return type === 'project' || type === 'expert' ? EXPERT_CONFIG.value[type] : LEGACY_CONFIG[type]
}
const config = computed(() => configFor(props.type))
const workEmail = computed(() => WORK_EMAIL.includes(props.type))

const route = useRoute()
const state = reactive({
  name: '',
  email: '',
  company: '',
  role: '',
  phone: '',
  country: '',
  seats: '',
  budget: '',
  message: '',
  website: '',
  details: {} as Record<string, string>
})
// Multi-select answers, kept apart so every single-value field stays a string.
const multi = ref<Record<string, string[]>>({})

function resetDetails() {
  const fields = configFor(props.type).fields
  state.details = Object.fromEntries(fields.filter(f => f.kind !== 'multiselect').map(f => [f.key, props.preset?.[f.key] ?? '']))
  multi.value = Object.fromEntries(fields.filter(f => f.kind === 'multiselect').map(f => [f.key, props.preset?.[f.key]?.split(',').filter(Boolean) ?? []]))
}
resetDetails()
watch(() => props.type, resetDetails)
watch(() => props.preset, (p) => {
  for (const [k, v] of Object.entries(p ?? {})) state.details[k] = v
}, { deep: true })

// Instant feedback on a personal address, with the same list the server uses.
const emailProblem = computed(() => {
  const e = state.email.trim().toLowerCase()
  if (!workEmail.value || !e.includes('@')) return ''
  const domain = emailDomain(e)
  return domain.includes('.') && isFreeEmailDomain(domain)
    ? t('leadForm.personalEmail', { domain })
    : ''
})

// A favicon beside each URL a visitor types, from /api/url-meta.
const previews = reactive<Record<string, { icon?: string, title?: string } | null>>({})
const debounce: Record<string, ReturnType<typeof setTimeout>> = {}
function preview(key: string) {
  clearTimeout(debounce[key])
  const v = (state.details[key] ?? '').trim()
  if (!v || v.length < 6 || !v.includes('.')) {
    previews[key] = null
    return
  }
  debounce[key] = setTimeout(async () => {
    try {
      previews[key] = await $fetch<{ icon?: string, title?: string }>('/api/url-meta', { query: { url: v } })
    } catch {
      previews[key] = null
    }
  }, 600)
}

const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (emailProblem.value) {
    error.value = emailProblem.value
    return
  }
  // A required multi-select has no native `required`; check it here.
  const missing = config.value.fields.find(f => f.kind === 'multiselect' && f.required && !multi.value[f.key]?.length)
  if (missing) {
    error.value = t('leadForm.pickOne', { field: missing.label })
    return
  }
  sending.value = true
  try {
    const q = route.query
    const utm = Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
      .filter(k => typeof q[k] === 'string').map(k => [k, String(q[k])]))
    await $fetch('/api/leads', {
      method: 'POST',
      body: { type: props.type, ...state, details: { ...state.details, ...multi.value }, sourcePage: route.path, utm }
    })
    sent.value = true
  } catch (e) {
    error.value = apiError(e) || t('leadForm.failed')
  } finally {
    sending.value = false
  }
}

function again() {
  sent.value = false
  state.message = ''
  resetDetails()
}

const localePath = useLocalePath()
</script>

<template>
  <div class="crosshair relative border-[1.5px] border-(--ink) bg-(--card) p-5 shadow-[10px_10px_0_var(--ice)] sm:p-7">
    <p class="mono-label mb-5">
      {{ t('leadForm.formLabel', { label: config.label }) }}
    </p>

    <div
      v-if="sent"
      class="flex flex-col items-center py-10 text-center"
      role="status"
    >
      <span class="flex size-12 items-center justify-center border-[1.5px] border-(--ink) bg-(--glow) text-(--ink)">
        <UIcon
          name="i-lucide-check"
          class="size-6"
        />
      </span>
      <p class="mt-4 text-xl font-extrabold tracking-[-0.02em] text-(--ink)">
        {{ t('leadForm.sent') }}
      </p>
      <p class="mt-1 max-w-sm text-(--ink2)">
        {{ config.done }}
      </p>
      <UButton
        class="mt-6"
        color="neutral"
        variant="outline"
        size="sm"
        @click="again"
      >
        {{ t('leadForm.sendAnother') }}
      </UButton>
    </div>

    <form
      v-else
      class="space-y-5"
      @submit.prevent="submit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          :label="type === 'nomination' ? t('leadForm.yourName') : t('leadForm.fullName')"
          required
        >
          <UInput
            v-model="state.name"
            autocomplete="name"
            required
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="workEmail ? t('leadForm.workEmail') : (type === 'nomination' ? t('leadForm.yourEmail') : t('leadForm.email'))"
          :hint="workEmail ? t('leadForm.companyDomain') : undefined"
          :error="emailProblem || undefined"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="email"
            :placeholder="workEmail ? 'you@company.com' : 'you@example.com'"
            required
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="config.company !== 'hidden'"
          :label="config.company === 'required' ? t('leadForm.company') : t('leadForm.companyOptional')"
          :required="config.company === 'required'"
        >
          <UInput
            v-model="state.company"
            autocomplete="organization"
            :required="config.company === 'required'"
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="config.role"
          :label="t('leadForm.roleOptional')"
        >
          <UInput
            v-model="state.role"
            autocomplete="organization-title"
            :placeholder="t('leadForm.rolePlaceholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="config.seats"
          :label="config.seats"
        >
          <UInput
            v-model="state.seats"
            type="number"
            min="1"
            inputmode="numeric"
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="config.budget"
          :label="t('leadForm.budget')"
        >
          <USelect
            v-model="state.budget"
            :items="config.budget"
            :placeholder="t('leadForm.select')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="config.country"
          :label="t('leadForm.countryOptional')"
        >
          <UInput
            v-model="state.country"
            autocomplete="country-name"
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="type !== 'nomination'"
          :label="t('leadForm.phoneOptional')"
        >
          <UInput
            v-model="state.phone"
            type="tel"
            autocomplete="tel"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-for="f in config.fields"
          :key="f.key"
          :label="f.label"
          :required="f.required"
          :class="f.wide || f.kind === 'textarea' ? 'sm:col-span-2' : ''"
        >
          <USelect
            v-if="f.kind === 'select'"
            v-model="state.details[f.key]"
            :items="f.options"
            :placeholder="t('leadForm.select')"
            class="w-full"
          />
          <USelect
            v-else-if="f.kind === 'multiselect'"
            v-model="multi[f.key]"
            :items="f.options"
            multiple
            :placeholder="t('leadForm.selectMany')"
            class="w-full"
          />
          <UTextarea
            v-else-if="f.kind === 'textarea'"
            v-model="state.details[f.key]"
            :placeholder="f.placeholder"
            :required="f.required"
            :rows="3"
            autoresize
            class="w-full"
          />
          <UInput
            v-else
            v-model="state.details[f.key]"
            :type="f.kind === 'url' ? 'url' : 'text'"
            :placeholder="f.placeholder"
            :required="f.required"
            class="w-full"
            @update:model-value="f.kind === 'url' && preview(f.key)"
          >
            <template
              v-if="f.kind === 'url' && previews[f.key]?.icon"
              #leading
            >
              <img
                :src="previews[f.key]!.icon"
                alt=""
                class="size-4"
                loading="lazy"
                referrerpolicy="no-referrer"
              >
            </template>
          </UInput>
          <p
            v-if="f.kind === 'url' && previews[f.key]?.title"
            class="mt-1 truncate font-mono text-[10px] uppercase tracking-[.06em] text-(--ink2)"
          >
            {{ previews[f.key]!.title }}
          </p>
        </UFormField>
      </div>

      <UFormField
        :label="config.message"
        :required="config.messageRequired"
      >
        <UTextarea
          v-model="state.message"
          :rows="4"
          :required="config.messageRequired"
          autoresize
          class="w-full"
        />
      </UFormField>

      <!-- Honeypot: hidden from people and from assistive tech. -->
      <div
        class="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <label>Website <input
          v-model="state.website"
          tabindex="-1"
          autocomplete="off"
        ></label>
      </div>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="error"
      />

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-(--line) pt-5">
        <i18n-t
          keypath="leadForm.privacy"
          tag="p"
          class="text-xs text-(--ink2)"
          scope="global"
        >
          <template #link>
            <NuxtLink
              :to="localePath('/privacy')"
              class="underline hover:text-(--signal)"
            >{{ t('leadForm.privacyLink') }}</NuxtLink>
          </template>
        </i18n-t>
        <UButton
          type="submit"
          size="lg"
          :loading="sending"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ config.submit }}
        </UButton>
      </div>
    </form>
  </div>
</template>
