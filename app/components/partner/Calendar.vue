<script setup lang="ts">
/**
 * The twelve-month sponsorship timeline and the booking form.
 *
 * Each cell is a month: open (selectable), held (someone is checking out),
 * booked (with the sponsor's name), closed (too little of it left), or
 * yours. A selection is always a consecutive run: clicking next to it
 * extends it, clicking elsewhere starts again.
 *
 * Signed-out readers keep their selection through sign-in (?months= in the
 * redirect). Checkout holds the months server-side and sends the browser to
 * Dodo; only the payment webhook turns a hold into a booking.
 */
interface Month {
  month: string
  status: 'available' | 'held' | 'booked' | 'closed'
  sponsor: string | null
  mine: boolean
}
interface Calendar {
  priceUsd: number
  holdMinutes: number
  available: boolean
  months: Month[]
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { isSignedIn, user } = useAuth()

const { data, status, refresh } = useLazyFetch<Calendar>('/api/partner/calendar', { server: false })
const me = ref<{ sponsor: { name: string, website: string | null } | null } | null>(null)
watch(isSignedIn, (signedIn) => {
  if (signedIn) {
    $fetch<{ sponsor: { name: string, website: string | null } | null }>('/api/partner/me')
      .then((r) => {
        me.value = r
      })
      .catch(() => {})
    refresh()
  }
}, { immediate: true })

const selected = ref<string[]>(String(route.query.months ?? '').split(',').filter(m => PARTNER_MONTH_RE.test(m)))
watch(data, (d) => {
  // Drop anything from ?months= that is no longer open.
  if (d) selected.value = selected.value.filter(m => d.months.some(x => x.month === m && x.status === 'available'))
})

const brandName = ref('')
const website = ref('')
watch(me, (m) => {
  if (m?.sponsor) {
    brandName.value ||= m.sponsor.name
    website.value ||= m.sponsor.website ?? ''
  }
})

function label(key: string) {
  const [y, m] = key.split('-').map(Number) as [number, number]
  return new Intl.DateTimeFormat(locale.value, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)))
}
const year = (key: string) => key.slice(0, 4)

function toggle(m: Month) {
  if (m.status !== 'available') return
  const s = selected.value
  if (s.includes(m.month)) {
    // Removing from an end keeps the run; from the middle, start over there.
    if (m.month === s[0]) selected.value = s.slice(1)
    else if (m.month === s.at(-1)) selected.value = s.slice(0, -1)
    else selected.value = [m.month]
    return
  }
  if (s.length && partnerNextMonth(s.at(-1)!) === m.month) selected.value = [...s, m.month]
  else if (s.length && partnerNextMonth(m.month) === s[0]) selected.value = [m.month, ...s]
  else selected.value = [m.month]
}

const price = computed(() => data.value?.priceUsd ?? PARTNER_PRICE_USD)
const total = computed(() => `$${(selected.value.length * price.value).toLocaleString('en-US')}`)
const needsBrand = computed(() => isSignedIn.value && !me.value?.sponsor)

const busy = ref(false)
const error = ref('')

async function book() {
  error.value = ''
  if (!selected.value.length) return
  if (!isSignedIn.value) {
    const back = `${localePath('/sponsor')}?months=${selected.value.join(',')}#calendar`
    await navigateTo({ path: localePath('/sign-in'), query: { redirect: back } })
    return
  }
  if (needsBrand.value && brandName.value.trim().length < 2) {
    error.value = t('sponsor.calendar.brandName')
    return
  }
  busy.value = true
  try {
    const { url } = await $fetch<{ url: string }>('/api/partner/checkout', {
      method: 'POST',
      body: { months: selected.value, brand: { name: brandName.value.trim(), website: website.value.trim() } }
    })
    window.location.href = url
  } catch (e) {
    error.value = apiError(e) || t('sponsor.calendar.error')
    busy.value = false
    refresh()
  }
}

function cellClass(m: Month) {
  if (selected.value.includes(m.month)) return 'bg-(--signal) text-white border-(--ink)'
  if (m.mine) return 'bg-(--ice) border-(--signal)'
  switch (m.status) {
    case 'available': return 'bg-(--card) hover:bg-(--ice) cursor-pointer'
    case 'booked': return 'hatch [--x:var(--line)] bg-(--paper) text-(--ink2)'
    case 'held': return 'bg-(--paper) text-(--ink2) border-dashed'
    default: return 'bg-(--paper) text-(--ink2) opacity-60'
  }
}
function statusText(m: Month) {
  if (selected.value.includes(m.month)) return t('sponsor.calendar.selected')
  if (m.mine) return t('sponsor.calendar.mine')
  switch (m.status) {
    case 'available': return t('sponsor.calendar.available')
    case 'booked': return m.sponsor ? t('sponsor.calendar.bookedBy', { name: m.sponsor }) : t('sponsor.calendar.booked')
    case 'held': return t('sponsor.calendar.held')
    default: return t('sponsor.calendar.closed')
  }
}
</script>

<template>
  <section
    id="calendar"
    class="scroll-mt-24"
  >
    <p class="eyebrow">
      {{ t('sponsor.calendar.eyebrow') }}
    </p>
    <h2 class="bp-h2 mt-3">
      {{ t('sponsor.calendar.title') }}
    </h2>
    <p class="bp-lead mt-3 max-w-2xl">
      {{ t('sponsor.calendar.lead') }}
    </p>

    <p
      v-if="status === 'error'"
      class="mt-6 text-sm text-error"
    >
      {{ t('sponsor.calendar.error') }}
    </p>

    <ol
      class="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      :aria-busy="!data"
    >
      <template v-if="!data">
        <li
          v-for="i in 12"
          :key="i"
          class="h-24 border-[1.5px] border-dashed border-(--line)"
        />
      </template>
      <li
        v-for="m in data?.months"
        v-else
        :key="m.month"
      >
        <button
          type="button"
          class="flex h-24 w-full flex-col justify-between border-[1.5px] border-(--ink) p-3 text-start transition-colors disabled:cursor-default"
          :class="cellClass(m)"
          :disabled="m.status !== 'available'"
          :aria-pressed="selected.includes(m.month)"
          @click="toggle(m)"
        >
          <span>
            <span class="block font-mono text-[10px] uppercase tracking-[.12em] opacity-80">{{ year(m.month) }}</span>
            <span class="block text-lg font-black capitalize leading-tight">{{ label(m.month) }}</span>
          </span>
          <span
            class="truncate font-mono text-[10px] uppercase tracking-[.08em]"
            :title="m.status === 'held' ? t('sponsor.calendar.heldHint') : undefined"
          >{{ statusText(m) }}</span>
        </button>
      </li>
    </ol>

    <div class="mt-6 grid gap-6 border-[1.5px] border-(--ink) bg-(--card) p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div class="min-w-0">
        <p class="text-2xl font-black tracking-[-0.02em]">
          {{ t('sponsor.calendar.summary', { n: selected.length, total }, selected.length) }}
        </p>
        <div
          v-if="needsBrand"
          class="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <label class="block">
            <span class="mono-label">{{ t('sponsor.calendar.brandName') }}</span>
            <input
              v-model="brandName"
              type="text"
              maxlength="80"
              :placeholder="t('sponsor.calendar.brandNamePlaceholder')"
              class="mt-1 w-full border-[1.5px] border-(--ink) bg-(--card) px-3 py-2 outline-none focus:border-(--signal)"
            >
          </label>
          <label class="block">
            <span class="mono-label">{{ t('sponsor.calendar.website') }}</span>
            <input
              v-model="website"
              type="url"
              maxlength="300"
              placeholder="https://"
              class="mt-1 w-full border-[1.5px] border-(--ink) bg-(--card) px-3 py-2 outline-none focus:border-(--signal)"
            >
          </label>
        </div>
        <p class="mt-3 text-xs text-(--ink2)">
          <template v-if="data && !data.available">
            {{ t('sponsor.calendar.unavailable') }}
          </template>
          <template v-else>
            {{ t('sponsor.calendar.holdNote', { minutes: data?.holdMinutes ?? PARTNER_HOLD_MINUTES }) }}
          </template>
        </p>
        <p
          v-if="error"
          class="mt-2 text-sm text-error"
          role="alert"
        >
          {{ error }}
        </p>
      </div>
      <UButton
        size="xl"
        icon="i-lucide-calendar-check"
        :loading="busy"
        :disabled="!selected.length || (data && !data.available)"
        @click="book"
      >
        {{ isSignedIn ? t('sponsor.calendar.book') : t('sponsor.calendar.signIn') }}
      </UButton>
    </div>
    <p
      v-if="isSignedIn && user"
      class="mt-2 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)"
    >
      {{ user.email }}
    </p>
  </section>
</template>
