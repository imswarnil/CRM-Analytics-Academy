<script setup lang="ts">
/**
 * /admin → Emails: the journeys (server/utils/journeys.ts), who is due an
 * email right now, and a button to run the hourly job immediately. Sending
 * needs RESEND_API_KEY on the Worker; without it this only previews.
 */
interface Report {
  configured: boolean
  dry: boolean
  due: { email: string, journey: string, step: number, ref: string, subject: string }[]
  sent: number
  failed: string[]
  sent30: number
  optouts: number
}
const toast = useToast()
const report = ref<Report | null>(null)
const busy = ref(false)

async function run(dry: boolean) {
  busy.value = true
  try {
    report.value = await $fetch<Report>('/api/admin/journeys', { method: 'POST', body: { dry } })
    if (!dry) toast.add({ title: `Sent ${report.value.sent}`, description: report.value.failed.join('; ') || undefined, color: report.value.failed.length ? 'warning' : 'success' })
  } catch (e) {
    toast.add({ title: 'Could not load', description: (e as Error).message, color: 'error' })
  } finally {
    busy.value = false
  }
}
onMounted(() => run(true))

const JOURNEYS = [
  { key: 'welcome', icon: 'i-lucide-hand', title: 'Welcome', when: 'Sign-up: after 10 min, day 2, day 5', what: 'Start the course · first lesson or "continue" · try a drill' },
  { key: 'stalled', icon: 'i-lucide-pause', title: 'Stalled', when: 'No lesson for 7 days', what: 'Pick up where you left off (once per lesson)' },
  { key: 'exam', icon: 'i-lucide-badge-check', title: 'Exam follow-up', when: '15 min after a paper', what: 'Score + the weakest domain\'s drill' },
  { key: 'checkout', icon: 'i-lucide-shopping-cart', title: 'Checkout', when: 'Checkout started, no Pro after 24 h', what: 'One reminder, no discount' },
  { key: 'capstone', icon: 'i-lucide-award', title: 'Capstone', when: 'Capstone approved', what: 'Certificate link (transactional)' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center gap-3">
      <span
        class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.09em]"
        :class="report?.configured ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'"
      >{{ report?.configured ? 'Sending on' : 'Preview only: add RESEND_API_KEY' }}</span>
      <span class="text-sm text-(--ink2)">Hourly on the Worker · max 2 marketing emails a week per person · only accounts from 22 Nov 2026</span>
      <span class="flex-1" />
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="busy"
        @click="run(true)"
      >
        Preview
      </UButton>
      <UButton
        size="sm"
        icon="i-lucide-send"
        :disabled="!report?.configured || !report?.due.length"
        :loading="busy"
        @click="run(false)"
      >
        Send due now
      </UButton>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-[6px] border border-(--line) bg-(--card) p-4">
        <p class="mono-label">
          Due now
        </p>
        <p class="mt-1 text-2xl font-bold text-(--ink)">
          {{ report?.due.length ?? '–' }}
        </p>
      </div>
      <div class="rounded-[6px] border border-(--line) bg-(--card) p-4">
        <p class="mono-label">
          Sent, 30 days
        </p>
        <p class="mt-1 text-2xl font-bold text-(--ink)">
          {{ report?.sent30 ?? '–' }}
        </p>
      </div>
      <div class="rounded-[6px] border border-(--line) bg-(--card) p-4">
        <p class="mono-label">
          Unsubscribed
        </p>
        <p class="mt-1 text-2xl font-bold text-(--ink)">
          {{ report?.optouts ?? '–' }}
        </p>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="j in JOURNEYS"
        :key="j.key"
        class="rounded-[6px] border border-(--line) bg-(--card) p-4"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="j.icon"
            class="size-4 text-(--signal)"
          />
          <h3 class="font-semibold text-(--ink)">
            {{ j.title }}
          </h3>
          <span class="ml-auto text-xs text-(--ink2)">{{ report?.due.filter(d => d.journey === j.key).length ?? 0 }} due</span>
        </div>
        <p class="mt-2 text-xs text-(--ink2)">
          {{ j.when }}
        </p>
        <p class="mt-1 text-sm text-(--ink)">
          {{ j.what }}
        </p>
      </article>
    </div>

    <div
      v-if="report?.due.length"
      class="overflow-x-auto rounded-[6px] border border-(--line) bg-(--card)"
    >
      <table class="w-full text-sm">
        <thead class="text-left text-(--ink2)">
          <tr>
            <th class="px-4 py-2 font-semibold">
              To
            </th>
            <th class="px-4 py-2 font-semibold">
              Journey
            </th>
            <th class="px-4 py-2 font-semibold">
              Subject
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in report.due"
            :key="`${d.email}${d.journey}${d.step}${d.ref}`"
            class="border-t border-(--line)"
          >
            <td class="px-4 py-2">
              {{ d.email }}
            </td>
            <td class="px-4 py-2">
              {{ d.journey }} {{ d.step }}
            </td>
            <td class="px-4 py-2">
              {{ d.subject }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
