<script setup lang="ts">
/**
 * /admin → Analytics: first-party traffic from app.page_view and app.event
 * (collected by plugins/analytics.client.ts). English only, like all of /admin.
 */
interface Row {
  key: string
  views: number
  visitors: number
  avgSeconds: number
}
interface ConvRow {
  key: string
  visitors: number
  signups: number
  learners: number
}
interface Analytics {
  days: number
  totals: { views: number, visitors: number, sessions: number, avgSeconds: number, medianSeconds: number, signedInVisitors: number, bouncePct: number, liveNow: number }
  series: { day: string, views: number, visitors: number }[]
  pages: Row[]
  countries: Row[]
  devices: Row[]
  browsers: Row[]
  os: Row[]
  referrers: Row[]
  locales: Row[]
  events: { name: string, count: number, visitors: number }[]
  authClicks: { name: string, path: string, label: string | null, count: number }[]
  funnel: { step: string, count: number }[]
  conversionBySource: ConvRow[]
  conversionByLanding: ConvRow[]
  recent: { path: string, country: string | null, device: string, browser: string | null, seconds: number, at: string, signedIn: boolean }[]
}

const days = ref(30)
const { data, status, refresh } = await useLazyAsyncData('admin-analytics', () =>
  $fetch<Analytics>('/api/admin/analytics', { query: { days: days.value } }), { server: false, watch: [days] })

const FUNNEL_LABEL: Record<string, string> = {
  visitors: 'Visitors',
  engaged: 'Engaged (2+ pages or 30 s+)',
  clicked: 'Clicked sign-up',
  signed_up: 'Signed up',
  learned: 'Took a learning action'
}
const rate = (n: number, d: number) => d ? `${Math.round(1000 * n / d) / 10}%` : '—'
const fmtSec = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
const flag = (cc: string) => /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '🌐'
const countryName = (cc: string) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(cc) ?? cc
  } catch {
    return cc
  }
}
const EVENT_LABEL: Record<string, string> = {
  sign_in_click: 'Clicked “Sign in”',
  sign_up_click: 'Clicked “Sign up / Enroll”',
  sign_up: 'Signed up',
  sign_in: 'Signed in',
  lesson_complete: 'Marked a lesson complete',
  quiz_submit: 'Submitted a quiz',
  search_open: 'Opened search',
  outbound: 'Clicked an external link',
  bookmark: 'Saved a lesson',
  copy_page: 'Copied a page',
  youtube_click: 'Subscribe on YouTube (pop-up)',
  popup_close: 'Closed the YouTube pop-up',
  promo_close: 'Closed the floating ad',
  share: 'Shared a page',
  exam_start: 'Started a practice exam',
  exam_finish: 'Finished a practice exam',
  interview_submit: 'Submitted an interview question',
  contribute: 'Sent a contribution',
  product_view: 'Opened a product request',
  lead: 'Requested a product (lead)',
  waitlist: 'Joined a section waitlist',
  pro_locked: 'Hit a Pro lesson without Pro'
}

const bars = computed(() => (data.value?.series ?? []).map((d, i, all) => ({
  label: all.length <= 14 || i % Math.ceil(all.length / 10) === 0 ? d.day.slice(5) : '',
  value: d.views,
  tone: i === all.length - 1 ? 'signal' as const : 'tide' as const,
  title: `${d.day} · ${d.views} views · ${d.visitors} visitors`
})))

const tiles = computed(() => {
  const t = data.value?.totals
  if (!t) return []
  return [
    { label: 'Visitors', value: t.visitors.toLocaleString() },
    { label: 'Page views', value: t.views.toLocaleString() },
    { label: 'Sessions', value: t.sessions.toLocaleString() },
    { label: 'Views / session', value: t.sessions ? (t.views / t.sessions).toFixed(1) : '0' },
    { label: 'Avg time on page', value: fmtSec(t.avgSeconds) },
    { label: 'Median time', value: fmtSec(t.medianSeconds) },
    { label: 'Bounce rate', value: `${t.bouncePct}%` },
    { label: 'Signed-in visitors', value: t.signedInVisitors.toLocaleString() }
  ]
})

const deviceTotal = computed(() => (data.value?.devices ?? []).reduce((s, d) => s + d.views, 0) || 1)
const pct = (n: number, of: number) => `${Math.round((n / (of || 1)) * 100)}%`
const signInClicks = computed(() => data.value?.events.find(e => e.name === 'sign_in_click')?.count ?? 0)
const signUpClicks = computed(() => data.value?.events.find(e => e.name === 'sign_up_click')?.count ?? 0)
const signUps = computed(() => data.value?.events.find(e => e.name === 'sign_up')?.count ?? 0)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        v-for="d in [1, 7, 30, 90, 365]"
        :key="d"
        :label="d === 1 ? 'Today' : d === 365 ? '1 year' : `${d} days`"
        size="xs"
        :color="days === d ? 'primary' : 'neutral'"
        :variant="days === d ? 'solid' : 'outline'"
        @click="days = d"
      />
      <UButton
        icon="i-lucide-refresh-cw"
        size="xs"
        color="neutral"
        variant="ghost"
        :loading="status === 'pending'"
        aria-label="Refresh"
        @click="refresh()"
      />
      <span
        v-if="data"
        class="ms-auto flex items-center gap-2 font-mono text-xs uppercase tracking-[.1em] text-(--ink2)"
      >
        <span class="size-2 animate-pulse rounded-full bg-(--glow)" />{{ data.totals.liveNow }} on the site now
      </span>
    </div>

    <p
      v-if="!data && status !== 'pending'"
      class="py-12 text-center text-sm text-(--ink2)"
    >
      No analytics yet — run server/db/schema.sql, then visit the site.
    </p>

    <template v-if="data">
      <dl class="grid grid-cols-2 border-s-[1.5px] border-t-[1.5px] border-(--ink) sm:grid-cols-4">
        <div
          v-for="tile in tiles"
          :key="tile.label"
          class="flex flex-col-reverse border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-4"
        >
          <dd class="mt-1 text-2xl font-black tabular-nums tracking-[-0.03em] text-(--ink)">
            {{ tile.value }}
          </dd>
          <dt class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
            {{ tile.label }}
          </dt>
        </div>
      </dl>

      <section class="border-[1.5px] border-(--ink) bg-(--card)">
        <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
          <p class="eyebrow">
            Page views per day
          </p>
        </header>
        <div class="graph-paper-fine p-5">
          <BpBarChart
            :bars="bars"
            :height="160"
            :gap="bars.length > 60 ? 1 : 4"
          />
        </div>
      </section>

      <!-- Conversion: visitor → learner -->
      <section class="border-[1.5px] border-(--ink) bg-(--card)">
        <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
          <p class="eyebrow">
            Conversion funnel · per visitor
          </p>
        </header>
        <ol class="grid gap-px bg-(--line) sm:grid-cols-5">
          <li
            v-for="(f, i) in data.funnel"
            :key="f.step"
            class="bg-(--card) p-4"
          >
            <p class="text-3xl font-extrabold tabular-nums text-(--ink)">
              {{ f.count.toLocaleString() }}
            </p>
            <p class="mt-1 text-sm font-semibold text-(--ink)">
              {{ FUNNEL_LABEL[f.step] ?? f.step }}
            </p>
            <p class="mt-1 font-mono text-[11px] text-(--ink2)">
              <template v-if="i">
                {{ rate(f.count, data.funnel[i - 1]!.count) }} of previous · {{ rate(f.count, data.funnel[0]!.count) }} of all
              </template>
              <template v-else>
                100%
              </template>
            </p>
            <div class="mt-3 h-1.5 bg-(--ice)">
              <div
                class="h-full bg-(--signal)"
                :style="{ width: rate(f.count, data.funnel[0]!.count) === '—' ? '0%' : rate(f.count, data.funnel[0]!.count) }"
              />
            </div>
          </li>
        </ol>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <section
          v-for="block in [{ title: 'Conversion by source', rows: data.conversionBySource }, { title: 'Conversion by landing page', rows: data.conversionByLanding }]"
          :key="block.title"
          class="border-[1.5px] border-(--ink) bg-(--card)"
        >
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              {{ block.title }}
            </p>
          </header>
          <table class="w-full text-sm">
            <thead class="font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)">
              <tr>
                <th class="px-5 py-2 text-start">
                  {{ block.title.endsWith('source') ? 'Source' : 'Landing page' }}
                </th>
                <th class="px-3 py-2 text-end">
                  Visitors
                </th>
                <th class="px-3 py-2 text-end">
                  Sign-ups
                </th>
                <th class="px-5 py-2 text-end">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in block.rows"
                :key="r.key"
                class="border-t border-dashed border-(--line)"
              >
                <td class="max-w-0 truncate px-5 py-2 font-medium text-(--ink)">
                  {{ r.key }}
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ r.visitors }}
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ r.signups }}
                </td>
                <td class="px-5 py-2 text-end font-mono tabular-nums text-(--signal)">
                  {{ rate(r.signups, r.visitors) }}
                </td>
              </tr>
              <tr v-if="!block.rows.length">
                <td
                  colspan="4"
                  class="px-5 py-4 text-(--ink2)"
                >
                  No data yet.
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <!-- Sign-in / sign-up funnel -->
      <section class="border-[1.5px] border-(--ink) bg-(--card)">
        <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
          <p class="eyebrow">
            Sign-in & sign-up clicks
          </p>
        </header>
        <div class="grid gap-0 sm:grid-cols-3">
          <div
            v-for="(f, i) in [
              { label: 'Clicked Sign in', value: signInClicks },
              { label: 'Clicked Sign up / Enroll', value: signUpClicks },
              { label: 'Created an account', value: signUps }
            ]"
            :key="f.label"
            class="border-b-[1.5px] border-(--ink) p-5 sm:border-b-0"
            :class="i < 2 ? 'sm:border-e-[1.5px]' : ''"
          >
            <p class="mono-label">
              {{ f.label }}
            </p>
            <p class="mt-1 text-3xl font-black tabular-nums text-(--signal)">
              {{ f.value }}
            </p>
          </div>
        </div>
        <table
          v-if="data.authClicks.length"
          class="w-full border-t-[1.5px] border-(--ink) text-sm"
        >
          <thead class="bg-(--ice) text-start font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
            <tr>
              <th class="px-5 py-2 text-start">
                Button
              </th>
              <th class="px-5 py-2 text-start">
                On page
              </th>
              <th class="px-5 py-2 text-end">
                Clicks
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in data.authClicks"
              :key="c.name + c.path + c.label"
              class="border-t border-dashed border-(--line)"
            >
              <td class="px-5 py-2">
                {{ c.name === 'sign_in_click' ? 'Sign in' : 'Sign up' }} <span class="text-(--ink2)">{{ c.label ? `“${c.label}”` : '' }}</span>
              </td>
              <td class="px-5 py-2 font-mono text-xs">
                {{ c.path }}
              </td>
              <td class="px-5 py-2 text-end tabular-nums">
                {{ c.count }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Top pages -->
        <section class="border-[1.5px] border-(--ink) bg-(--card) lg:col-span-2">
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Top pages
            </p>
          </header>
          <table class="w-full text-sm">
            <thead class="bg-(--ice) font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
              <tr>
                <th class="px-5 py-2 text-start">
                  Page
                </th>
                <th class="px-3 py-2 text-end">
                  Views
                </th>
                <th class="px-3 py-2 text-end">
                  Visitors
                </th>
                <th class="px-5 py-2 text-end">
                  Avg time
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in data.pages"
                :key="p.key"
                class="border-t border-dashed border-(--line)"
              >
                <td class="max-w-0 truncate px-5 py-2">
                  <NuxtLink
                    :to="p.key"
                    target="_blank"
                    class="font-mono text-xs text-(--ink) hover:text-(--signal)"
                  >{{ p.key }}</NuxtLink>
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ p.views }}
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ p.visitors }}
                </td>
                <td class="px-5 py-2 text-end tabular-nums text-(--ink2)">
                  {{ fmtSec(p.avgSeconds) }}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Countries -->
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Countries
            </p>
          </header>
          <ul>
            <li
              v-for="c in data.countries"
              :key="c.key"
              class="relative flex items-center gap-3 border-b border-dashed border-(--line) px-5 py-2 text-sm last:border-b-0"
            >
              <span
                class="absolute inset-y-0 start-0 bg-(--ice)"
                :style="{ width: pct(c.visitors, data.totals.visitors) }"
              />
              <span class="relative">{{ flag(c.key) }}</span>
              <span class="relative min-w-0 flex-1 truncate">{{ countryName(c.key) }}</span>
              <span class="relative font-mono text-xs tabular-nums">{{ c.visitors }} · {{ pct(c.visitors, data.totals.visitors) }}</span>
            </li>
          </ul>
        </section>

        <!-- Devices, browsers, OS -->
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Devices
            </p>
          </header>
          <div class="flex flex-wrap gap-6 p-5">
            <div
              v-for="d in data.devices"
              :key="d.key"
              class="flex items-center gap-3"
            >
              <BpDonut
                :value="d.views / deviceTotal"
                :size="44"
              />
              <div>
                <p class="flex items-center gap-1 text-sm font-bold capitalize">
                  <UIcon :name="d.key === 'mobile' ? 'i-lucide-smartphone' : d.key === 'tablet' ? 'i-lucide-tablet' : 'i-lucide-monitor'" />{{ d.key }}
                </p>
                <p class="font-mono text-xs text-(--ink2)">
                  {{ pct(d.views, deviceTotal) }} · {{ fmtSec(d.avgSeconds) }}
                </p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 border-t-[1.5px] border-(--ink)">
            <div
              v-for="(list, i) in [{ title: 'Browsers', rows: data.browsers }, { title: 'Operating systems', rows: data.os }]"
              :key="list.title"
              class="p-5"
              :class="i === 0 ? 'border-e-[1.5px] border-(--ink)' : ''"
            >
              <p class="mono-label mb-2">
                {{ list.title }}
              </p>
              <p
                v-for="r in list.rows"
                :key="r.key"
                class="flex justify-between py-0.5 text-sm"
              >
                <span>{{ r.key }}</span><span class="font-mono text-xs text-(--ink2)">{{ r.visitors }}</span>
              </p>
            </div>
          </div>
        </section>

        <!-- Referrers + languages -->
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Referrers
            </p>
          </header>
          <p
            v-if="!data.referrers.length"
            class="p-5 text-sm text-(--ink2)"
          >
            Only direct traffic so far.
          </p>
          <p
            v-for="r in data.referrers"
            :key="r.key"
            class="flex justify-between border-b border-dashed border-(--line) px-5 py-2 text-sm last:border-b-0"
          >
            <span class="truncate">{{ r.key }}</span><span class="font-mono text-xs text-(--ink2)">{{ r.visitors }}</span>
          </p>
        </section>
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Languages read
            </p>
          </header>
          <div class="flex flex-wrap gap-2 p-5">
            <span
              v-for="l in data.locales"
              :key="l.key"
              class="border-[1.5px] border-(--ink) px-2 py-1 font-mono text-xs uppercase"
            >{{ l.key }} · {{ l.views }}</span>
          </div>
        </section>

        <!-- All events -->
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Events
            </p>
          </header>
          <p
            v-if="!data.events.length"
            class="p-5 text-sm text-(--ink2)"
          >
            No events yet.
          </p>
          <p
            v-for="e in data.events"
            :key="e.name"
            class="flex justify-between border-b border-dashed border-(--line) px-5 py-2 text-sm last:border-b-0"
          >
            <span>{{ EVENT_LABEL[e.name] ?? e.name }}</span><span class="font-mono text-xs text-(--ink2)">{{ e.count }} · {{ e.visitors }} people</span>
          </p>
        </section>

        <!-- Live feed -->
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Latest page views
            </p>
          </header>
          <ul class="max-h-96 overflow-y-auto">
            <li
              v-for="(r, i) in data.recent"
              :key="i"
              class="flex items-center gap-2 border-b border-dashed border-(--line) px-5 py-2 text-xs last:border-b-0"
            >
              <span>{{ r.country ? flag(r.country) : '🌐' }}</span>
              <UIcon
                :name="r.device === 'mobile' ? 'i-lucide-smartphone' : r.device === 'tablet' ? 'i-lucide-tablet' : 'i-lucide-monitor'"
                class="text-(--ink2)"
              />
              <span class="min-w-0 flex-1 truncate font-mono">{{ r.path }}</span>
              <UIcon
                v-if="r.signedIn"
                name="i-lucide-user-check"
                class="text-(--signal)"
              />
              <span class="font-mono text-(--ink2)">{{ fmtSec(r.seconds) }}</span>
              <span class="w-16 text-end font-mono text-(--ink2)">{{ new Date(r.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>
