<script setup lang="ts">
/**
 * /sponsor/studio — where a sponsor sees their months, builds creatives for
 * the three formats with true-size previews, publishes them, and watches
 * impressions and clicks.
 *
 * Private: excluded from the prerender (PRIVATE_PATHS in nuxt.config) and
 * noindex. English-only, like /admin and the other signed-in tools. Every
 * call it makes is re-checked on the server against the session.
 */
import type { PartnerFormat, PartnerMode, PartnerTheme } from '#shared/utils/partner'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Sponsor studio', robots: 'noindex, nofollow' })

interface Creative {
  id: string
  format: PartnerFormat
  mode: PartnerMode
  imageUrl: string | null
  imageMobileUrl: string | null
  logoUrl: string | null
  headline: string | null
  body: string | null
  cta: string | null
  theme: PartnerTheme
  clickUrl: string
  alt: string | null
  status: string
  reviewNote: string | null
  updatedAt: string
  publishedAt: string | null
  impressions: number
  clicks: number
}
interface Me {
  email: string
  sponsor: { id: string, name: string, website: string | null, contactEmail: string } | null
  bookings: { id: string, month: string, status: string, source: string, holdExpiresAt: string | null, paidAt: string | null, needsRefund: boolean }[]
  creatives: Creative[]
  daily?: { day: string, impressions: number, clicks: number }[]
}

const localePath = useLocalePath()
const route = useRoute()
const { data, status, refresh, error: loadError } = await useFetch<Me>('/api/partner/me', { server: false })

const current = partnerMonthKey(new Date())
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number) as [number, number]
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)))
}
const paid = computed(() => (data.value?.bookings ?? []).filter(b => b.status === 'paid'))
const held = computed(() => (data.value?.bookings ?? []).filter(b => b.status === 'held'))
const canPublish = computed(() => paid.value.some(b => b.month >= current))
const liveNow = computed(() => paid.value.some(b => b.month === current))

// Back from checkout: the webhook settles the hold within seconds. Poll
// briefly so "On hold" turns into "Paid" without a manual refresh.
const justPaid = route.query.checkout === 'done'
let polls = 0
let pollTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  if (!justPaid) return
  pollTimer = setInterval(async () => {
    polls++
    await refresh()
    if (!held.value.length || polls > 20) {
      if (pollTimer) clearInterval(pollTimer)
    }
  }, 3000)
})
onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

// ---- brand -----------------------------------------------------------------
const brand = reactive({ name: '', website: '' })
watch(() => data.value?.sponsor, (s) => {
  if (s) {
    brand.name = s.name
    brand.website = s.website ?? ''
  }
}, { immediate: true })
const brandBusy = ref(false)
const brandMsg = ref('')
async function saveBrand() {
  brandBusy.value = true
  brandMsg.value = ''
  try {
    await $fetch('/api/partner/account', { method: 'PATCH', body: brand })
    brandMsg.value = 'Saved.'
    await refresh()
  } catch (e) {
    brandMsg.value = apiError(e) || 'Could not save.'
  } finally {
    brandBusy.value = false
  }
}

// ---- creatives -------------------------------------------------------------
const formats: { value: PartnerFormat, label: string, spec: string, icon: string }[] = [
  { value: 'leaderboard', label: 'Leaderboard', spec: '728×90 · 320×100', icon: 'i-lucide-rectangle-horizontal' },
  { value: 'square', label: 'Square', spec: '300×250 · 1:1', icon: 'i-lucide-square' },
  { value: 'text', label: 'Text', spec: 'logo + 60 + 140', icon: 'i-lucide-text' }
]
const tab = ref<PartnerFormat>('leaderboard')
const editing = ref<Creative | 'new' | null>(null)
const ofFormat = computed(() => (data.value?.creatives ?? []).filter(c => c.format === tab.value))
watch(tab, () => {
  editing.value = null
})

async function onSaved() {
  await refresh()
  editing.value = null
}

const actionError = ref('')
async function setLive(c: Creative, action: 'publish' | 'unpublish') {
  actionError.value = ''
  try {
    await $fetch(`/api/partner/creatives/${c.id}`, { method: 'PATCH', body: { action } })
    await refresh()
  } catch (e) {
    actionError.value = apiError(e) || 'Could not update.'
  }
}
async function remove(c: Creative) {
  if (!confirm('Delete this creative and its numbers?')) return
  actionError.value = ''
  try {
    await $fetch(`/api/partner/creatives/${c.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    actionError.value = apiError(e) || 'Could not delete.'
  }
}

// ---- numbers ---------------------------------------------------------------
const totals = computed(() => {
  const list = data.value?.creatives ?? []
  const impressions = list.reduce((n, c) => n + c.impressions, 0)
  const clicks = list.reduce((n, c) => n + c.clicks, 0)
  return { impressions, clicks, ctr: impressions ? `${((clicks / impressions) * 100).toFixed(2)}%` : '—' }
})
const bars = computed(() => (data.value?.daily ?? []).map(d => ({
  label: d.day.slice(5),
  value: d.impressions,
  title: `${d.day}: ${d.impressions} impressions, ${d.clicks} clicks`
})))
const ctr = (c: Creative) => (c.impressions ? `${((c.clicks / c.impressions) * 100).toFixed(2)}%` : '—')
const statusTone = (s: string) => s === 'published'
  ? 'border-(--signal) text-(--signal)'
  : s === 'rejected' || s === 'paused' ? 'border-error text-error' : 'border-(--ink) text-(--ink2)'
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 13b / Sponsor studio"
      title="Sponsor studio"
      :lead="data?.sponsor ? `Signed in as ${data.email}. Build your creatives, publish them, and they replace the placeholders across the academy during your months.` : undefined"
    />

    <UContainer class="space-y-10 py-10">
      <p
        v-if="loadError"
        class="text-sm text-error"
      >
        The studio could not load. Refresh to try again.
      </p>

      <div
        v-if="justPaid"
        class="border-[1.5px] border-(--signal) bg-(--ice) p-4 text-sm"
        role="status"
      >
        <strong>Thank you.</strong>
        <template v-if="held.length">
          Confirming your payment… months turn from <em>On hold</em> to <em>Paid</em> as soon as the payment provider confirms it, usually within seconds.
        </template>
        <template v-else>
          Your months are confirmed. Build your creatives below.
        </template>
      </div>

      <!-- No sponsor account yet -->
      <div
        v-if="status === 'success' && !data?.sponsor"
        class="border-[1.5px] border-dashed border-(--ink2) bg-(--card) p-8 text-center"
      >
        <p class="bp-h3">
          You have not booked a month yet.
        </p>
        <p class="mt-2 text-(--ink2)">
          Pick an open month on the sponsor page; the studio unlocks as soon as you book.
        </p>
        <UButton
          :to="`${localePath('/sponsor')}#calendar`"
          class="mt-5"
          icon="i-lucide-calendar-range"
        >
          See open months
        </UButton>
      </div>

      <template v-if="data?.sponsor">
        <!-- Months + brand -->
        <section class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div class="border-[1.5px] border-(--ink) bg-(--card)">
            <p class="flex items-center justify-between border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
              <span>Your months</span>
              <span
                v-if="liveNow"
                class="flex items-center gap-1.5 text-(--signal)"
              ><span class="size-2 animate-pulse bg-(--signal)" /> Live now</span>
            </p>
            <ul
              v-if="data.bookings.length"
              class="divide-y divide-dashed divide-(--line)"
            >
              <li
                v-for="b in data.bookings"
                :key="b.id"
                class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <span class="font-bold">{{ monthLabel(b.month) }}</span>
                <span class="font-mono text-[10px] uppercase tracking-[.08em]">
                  <span
                    class="border-[1.5px] px-1.5 py-0.5"
                    :class="b.status === 'paid' ? 'border-(--signal) text-(--signal)' : 'border-dashed border-(--ink2) text-(--ink2)'"
                  >{{ b.status === 'paid' ? (b.month === current ? 'Live' : b.month < current ? 'Ended' : 'Paid') : 'On hold' }}</span>
                  <span
                    v-if="b.source !== 'dodo'"
                    class="ms-2 text-(--ink2)"
                  >{{ b.source }}</span>
                </span>
              </li>
            </ul>
            <p
              v-else
              class="px-4 py-6 text-sm text-(--ink2)"
            >
              No active bookings.
            </p>
            <div class="border-t-[1.5px] border-(--ink) px-4 py-3">
              <NuxtLink
                :to="`${localePath('/sponsor')}#calendar`"
                class="font-mono text-xs font-semibold uppercase tracking-[.1em] text-(--signal)"
              >
                Book more months →
              </NuxtLink>
            </div>
          </div>

          <form
            class="space-y-3 border-[1.5px] border-(--ink) bg-(--card) p-4"
            @submit.prevent="saveBrand"
          >
            <p class="mono-label">
              Brand
            </p>
            <label class="block">
              <span class="mono-label">Name (shown on the calendar and creatives)</span>
              <input
                v-model="brand.name"
                maxlength="80"
                required
                class="mt-1 w-full border-[1.5px] border-(--ink) bg-(--card) px-3 py-2 text-sm outline-none focus:border-(--signal)"
              >
            </label>
            <label class="block">
              <span class="mono-label">Website</span>
              <input
                v-model="brand.website"
                type="url"
                maxlength="300"
                class="mt-1 w-full border-[1.5px] border-(--ink) bg-(--card) px-3 py-2 text-sm outline-none focus:border-(--signal)"
              >
            </label>
            <div class="flex items-center gap-3">
              <UButton
                type="submit"
                size="sm"
                color="neutral"
                variant="outline"
                :loading="brandBusy"
              >
                Save brand
              </UButton>
              <span class="text-xs text-(--ink2)">{{ brandMsg }}</span>
            </div>
          </form>
        </section>

        <!-- Numbers -->
        <section>
          <div class="grid border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-3">
            <div
              v-for="(v, k) in { 'Impressions': totals.impressions.toLocaleString('en-US'), 'Clicks': totals.clicks.toLocaleString('en-US'), 'Click-through': totals.ctr }"
              :key="k"
              class="border-b-[1.5px] border-(--ink) p-4 last:border-b-0 sm:border-e-[1.5px] sm:border-b-0 sm:last:border-e-0"
            >
              <p class="mono-label">
                {{ k }}
              </p>
              <p class="mt-1 text-2xl font-black tabular-nums text-(--signal)">
                {{ v }}
              </p>
            </div>
          </div>
          <BpFigure
            v-if="bars.length"
            caption="Impressions per day"
            spec="last 30 days"
            class="mt-4"
          >
            <div class="p-4">
              <BpBarChart
                :bars="bars"
                :height="140"
                :gap="3"
              />
            </div>
          </BpFigure>
          <p class="mt-2 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
            An impression is counted when at least half the creative is on screen. Pro members never see creatives.
          </p>
        </section>

        <!-- Creatives -->
        <section>
          <p class="eyebrow">
            Creatives
          </p>
          <nav
            class="mt-3 flex flex-wrap gap-1 border-[1.5px] border-(--ink) bg-(--card) p-1"
            aria-label="Formats"
          >
            <UButton
              v-for="f in formats"
              :key="f.value"
              :icon="f.icon"
              size="sm"
              :color="tab === f.value ? 'primary' : 'neutral'"
              :variant="tab === f.value ? 'solid' : 'ghost'"
              @click="tab = f.value"
            >
              {{ f.label }} <span class="font-mono text-[10px] opacity-70">{{ f.spec }}</span>
            </UButton>
          </nav>

          <p
            v-if="actionError"
            class="mt-3 text-sm text-error"
            role="alert"
          >
            {{ actionError }}
          </p>

          <div
            v-if="editing"
            class="mt-6"
          >
            <PartnerEditor
              :format="tab"
              :initial="editing === 'new' ? null : editing"
              :sponsor-name="data.sponsor.name"
              :website="data.sponsor.website"
              :can-publish="canPublish"
              @saved="onSaved"
              @cancel="editing = null"
            />
          </div>

          <div
            v-else
            class="mt-6 space-y-3"
          >
            <div
              v-for="c in ofFormat"
              :key="c.id"
              class="grid gap-4 border-[1.5px] border-(--ink) bg-(--card) p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            >
              <div class="min-w-0">
                <div
                  class="max-w-full"
                  :class="c.format === 'leaderboard' ? 'aspect-[728/90] w-full max-w-[728px]' : c.format === 'square' ? 'aspect-[300/250] w-[200px]' : 'h-32 w-full max-w-[680px]'"
                >
                  <PromoCreative
                    :creative="{ ...c, sponsor: data.sponsor.name }"
                    variant="desktop"
                  />
                </div>
                <p class="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
                  <span
                    class="border-[1.5px] px-1.5 py-0.5"
                    :class="statusTone(c.status)"
                  >{{ c.status }}</span>
                  <span>{{ c.impressions.toLocaleString('en-US') }} impressions</span>
                  <span>{{ c.clicks.toLocaleString('en-US') }} clicks</span>
                  <span>CTR {{ ctr(c) }}</span>
                  <span class="truncate normal-case">→ {{ c.clickUrl }}</span>
                </p>
                <p
                  v-if="c.reviewNote"
                  class="mt-1 text-xs text-error"
                >
                  Note from the site owner: {{ c.reviewNote }}
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-pencil"
                  @click="editing = c"
                >
                  Edit
                </UButton>
                <UButton
                  v-if="c.status === 'draft'"
                  size="xs"
                  icon="i-lucide-radio"
                  :disabled="!canPublish"
                  @click="setLive(c, 'publish')"
                >
                  Publish
                </UButton>
                <UButton
                  v-if="c.status === 'published'"
                  size="xs"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-pause"
                  @click="setLive(c, 'unpublish')"
                >
                  Unpublish
                </UButton>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  aria-label="Delete"
                  @click="remove(c)"
                />
              </div>
            </div>

            <p
              v-if="!ofFormat.length"
              class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-sm text-(--ink2)"
            >
              No {{ tab }} creative yet. Until you publish one, this format shows the house placeholder during your months.
            </p>

            <UButton
              icon="i-lucide-plus"
              @click="editing = 'new'"
            >
              New {{ tab }} creative
            </UButton>
          </div>
        </section>
      </template>
    </UContainer>
  </div>
</template>
