<script setup lang="ts">
/**
 * One form for the three ways to reach the Academy as a company. The shared
 * fields (name, email, company, phone, message) are always here; the kind
 * adds its own selects, which land in the row's `details`.
 */
type Kind = 'enrollment' | 'quotation' | 'implementation'

interface Choice {
  key: string
  label: string
  options: string[]
}

const props = defineProps<{
  kind: Kind
  /** Pre-selected values, e.g. the cohort a learner clicked "Enroll" on. */
  preset?: Record<string, string>
}>()

const CHOICES: Record<Kind, Choice[]> = {
  enrollment: [
    { key: 'center', label: 'Training center', options: ['Bengaluru', 'Pune', 'Hyderabad', 'London', 'Austin', 'Live online'] },
    { key: 'track', label: 'Programme', options: ['CRM Analytics Foundations (5 days)', 'Dashboards & SAQL (5 days)', 'Go-to-Market Analytics (10 days)', 'Certification bootcamp (3 days)'] },
    { key: 'cohort', label: 'Preferred start', options: ['Next available', 'Within 1 month', 'Within 3 months', 'Weekend batch'] },
    { key: 'experience', label: 'Your experience', options: ['New to Salesforce', 'Salesforce admin / user', 'Data or BI background', 'Already using CRM Analytics'] }
  ],
  quotation: [
    { key: 'teamSize', label: 'Team size', options: ['5–10', '11–25', '26–50', '51–200', '200+'] },
    { key: 'plan', label: 'Programme', options: ['Foundations for everyone', 'Analyst track', 'Developer / SAQL track', 'Executive dashboards workshop', 'Custom curriculum'] },
    { key: 'delivery', label: 'Delivery', options: ['Onsite at our office', 'At an Academy center', 'Live virtual', 'Self-paced with mentor hours'] },
    { key: 'timeline', label: 'When', options: ['This month', 'Next quarter', 'Planning for later'] }
  ],
  implementation: [
    { key: 'scope', label: 'What do you need?', options: ['New CRM Analytics rollout', 'Dashboards on existing data', 'Data pipeline / recipes', 'Einstein Discovery model', 'Performance or security review', 'Rescue a stalled project'] },
    { key: 'orgEdition', label: 'Salesforce edition', options: ['Enterprise', 'Unlimited', 'Performance', 'Not sure'] },
    { key: 'dataSources', label: 'Data sources', options: ['Salesforce only', 'Salesforce + a warehouse', 'Salesforce + files/ERP', 'Many systems'] },
    { key: 'budget', label: 'Budget range', options: ['Under $10k', '$10k–$50k', '$50k–$150k', '$150k+', 'Not sure yet'] },
    { key: 'timeline', label: 'Timeline', options: ['ASAP', '1–3 months', '3–6 months', 'Exploring'] }
  ]
}

const COPY: Record<Kind, { submit: string, done: string, message: string }> = {
  enrollment: {
    submit: 'Reserve my seat',
    done: 'Seat request received. The center will email you the batch dates and joining details.',
    message: 'Anything we should know? (optional)'
  },
  quotation: {
    submit: 'Request a quotation',
    done: 'Thanks — a training advisor will send a quotation within two working days.',
    message: 'Goals for the team, tools you use, anything else (optional)'
  },
  implementation: {
    submit: 'Request a consultation',
    done: 'Thanks — a solution architect will reply to schedule a scoping call.',
    message: 'Describe the project: users, data, the decisions it should support'
  }
}

const choices = computed(() => CHOICES[props.kind])
const copy = computed(() => COPY[props.kind])

const state = reactive({
  name: '',
  email: '',
  company: '',
  phone: '',
  message: '',
  website: '',
  details: Object.fromEntries(CHOICES[props.kind].map(c => [c.key, props.preset?.[c.key] ?? ''])) as Record<string, string>
})

watch(() => props.preset, (p) => {
  for (const [k, v] of Object.entries(p ?? {})) state.details[k] = v
}, { deep: true })

const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  sending.value = true
  try {
    await $fetch('/api/inquiries', { method: 'POST', body: { kind: props.kind, ...state } })
    sent.value = true
  } catch (e) {
    const err = e as { statusMessage?: string, data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage || err.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    sending.value = false
  }
}

const localePath = useLocalePath()
</script>

<template>
  <div class="rounded-2xl border border-default bg-default p-5 sm:p-7">
    <div
      v-if="sent"
      class="flex flex-col items-center py-10 text-center"
    >
      <span class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UIcon
          name="i-lucide-check"
          class="size-6"
        />
      </span>
      <p class="mt-4 text-lg font-semibold text-highlighted">
        Request sent
      </p>
      <p class="mt-1 max-w-sm text-muted">
        {{ copy.done }}
      </p>
    </div>

    <form
      v-else
      class="space-y-5"
      @submit.prevent="submit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Full name"
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
          label="Work email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="email"
            required
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="kind === 'enrollment' ? 'Company (optional)' : 'Company'"
          :required="kind !== 'enrollment'"
        >
          <UInput
            v-model="state.company"
            autocomplete="organization"
            :required="kind !== 'enrollment'"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Phone (optional)">
          <UInput
            v-model="state.phone"
            type="tel"
            autocomplete="tel"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-for="c in choices"
          :key="c.key"
          :label="c.label"
        >
          <USelect
            v-model="state.details[c.key]"
            :items="c.options"
            placeholder="Select…"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField :label="copy.message">
        <UTextarea
          v-model="state.message"
          :rows="4"
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

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-xs text-muted">
          We only use these details to reply to you. See the
          <NuxtLink
            :to="localePath('/privacy')"
            class="underline hover:text-highlighted"
          >privacy policy</NuxtLink>.
        </p>
        <UButton
          type="submit"
          size="lg"
          :loading="sending"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ copy.submit }}
        </UButton>
      </div>
    </form>
  </div>
</template>
