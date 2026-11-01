<script setup lang="ts">
/**
 * /sponsor/studio — the sponsor's own space: design the banner (logo, two
 * lines, a button, three colours) with a live preview of exactly what runs,
 * publish it for approval, pay the invoice, and watch views, clicks and CTR
 * by day and by page. Signed-in; a request made with the same email before
 * signing up appears here automatically.
 */
definePageMeta({ middleware: 'auth' })

interface Day { day: string, views: number, clicks: number }
interface Sponsorship {
  id: number
  company: string
  package: string
  status: string
  creative: Record<string, string>
  creativeStatus: string
  reviewNote: string | null
  invoiceUrl: string | null
  startsAt: string | null
  endsAt: string | null
  packageDays: number
  days: Day[]
  pages: { path: string, views: number, clicks: number }[]
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { data, refresh } = await useLazyFetch<{ sponsorships: Sponsorship[] }>('/api/sponsor/mine', { server: false })
const selected = ref<number | null>(null)
const current = computed(() => data.value?.sponsorships.find(s => s.id === selected.value) ?? data.value?.sponsorships[0] ?? null)
const draft = reactive({ logo: '', headline: '', body: '', cta: '', url: '', bg: '#0c1b33', fg: '#ffffff', accent: '#2f5bea' })
watch(current, (s) => {
  if (s) Object.assign(draft, { logo: '', headline: '', body: '', cta: '', url: '', bg: '#0c1b33', fg: '#ffffff', accent: '#2f5bea' }, s.creative)
}, { immediate: true })

const saving = ref(false)
const error = ref('')
const saved = ref('')
async function save(submit: boolean) {
  if (!current.value) return
  saving.value = true
  error.value = ''
  saved.value = ''
  try {
    await $fetch('/api/sponsor/creative', { method: 'POST', body: { id: current.value.id, creative: draft, submit } })
    saved.value = submit ? t('studio.submitted') : t('studio.saved')
    await refresh()
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  } finally {
    saving.value = false
  }
}

const uploading = ref(false)
async function upload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    draft.logo = (await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })).url
  } catch (err) {
    error.value = apiError(err) || t('contrib.err.generic')
  } finally {
    uploading.value = false
  }
}

const totals = computed(() => {
  const d = current.value?.days ?? []
  const views = d.reduce((n, x) => n + x.views, 0)
  const clicks = d.reduce((n, x) => n + x.clicks, 0)
  return { views, clicks, ctr: views ? Math.round((clicks / views) * 1000) / 10 : 0 }
})
const maxViews = computed(() => Math.max(1, ...(current.value?.days ?? []).map(d => d.views)))
const date = (d: string | null) => (d ? new Date(d).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' }) : '—')

useSeoMeta({ title: () => t('studio.title'), robots: 'noindex' })
</script>

<template>
  <div class="mx-auto max-w-(--ui-container) space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow">
          {{ t('sponsor.eyebrow') }}
        </p>
        <h1 class="mt-1 text-3xl font-extrabold tracking-[-0.03em] text-(--ink)">
          {{ t('studio.title') }}
        </h1>
      </div>
      <div
        v-if="(data?.sponsorships.length ?? 0) > 1"
        class="flex flex-wrap gap-1.5"
      >
        <button
          v-for="s in data!.sponsorships"
          :key="s.id"
          type="button"
          class="border-[1.5px] px-2.5 py-1 text-sm font-semibold"
          :class="current?.id === s.id ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
          @click="selected = s.id"
        >
          {{ s.company }} · {{ t(`studio.status.${s.status}`) }}
        </button>
      </div>
    </header>

    <div
      v-if="data && !current"
      class="border-[1.5px] border-dashed border-(--line) p-10 text-center"
    >
      <p class="text-(--ink2)">
        {{ t('studio.none') }}
      </p>
      <UButton
        class="mt-4"
        :to="localePath('/sponsor')"
        icon="i-lucide-megaphone"
      >
        {{ t('sponsor.title') }}
      </UButton>
    </div>

    <template v-if="current">
      <!-- Where it stands -->
      <div class="flex flex-wrap items-center gap-3 border-[1.5px] border-(--ink) bg-(--ice) px-5 py-3 text-sm">
        <span class="bg-(--ink) px-2 py-0.5 font-mono text-[11px] uppercase text-(--paper)">{{ t(`studio.status.${current.status}`) }}</span>
        <span class="text-(--ink)">{{ t(`studio.next.${current.status}`) }}</span>
        <span
          v-if="current.status === 'live'"
          class="font-mono text-xs text-(--ink2)"
        >{{ date(current.startsAt) }} → {{ date(current.endsAt) }}</span>
        <UButton
          v-if="current.invoiceUrl && current.status === 'invoiced'"
          :to="current.invoiceUrl"
          target="_blank"
          size="sm"
          icon="i-lucide-credit-card"
          class="ms-auto"
        >
          {{ t('studio.payInvoice') }}
        </UButton>
      </div>

      <!-- Design + preview -->
      <section class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="bp-h3">
            {{ t('studio.design') }}
          </h2>
          <span
            class="border-[1.5px] px-2 py-0.5 font-mono text-[11px] uppercase"
            :class="current.creativeStatus === 'approved' ? 'border-(--signal) text-(--signal)' : current.creativeStatus === 'changes' ? 'border-error text-error' : 'border-(--line) text-(--ink2)'"
          >{{ t(`studio.creative.${current.creativeStatus}`) }}</span>
        </div>
        <UAlert
          v-if="current.reviewNote"
          color="warning"
          variant="subtle"
          icon="i-lucide-message-square"
          :description="current.reviewNote"
        />
        <div class="border-[1.5px] border-(--ink) shadow-[6px_6px_0_var(--ink)]">
          <SponsorCard
            :company="current.company"
            :creative="draft"
            preview
          />
        </div>
        <form
          class="grid gap-4 border-[1.5px] border-(--ink) bg-(--card) p-5 md:grid-cols-2"
          @submit.prevent="save(true)"
        >
          <UInput
            v-model="draft.headline"
            :placeholder="t('studio.f.headline')"
            maxlength="70"
            size="lg"
          />
          <UInput
            v-model="draft.body"
            :placeholder="t('studio.f.body')"
            maxlength="140"
            size="lg"
          />
          <UInput
            v-model="draft.cta"
            :placeholder="t('studio.f.cta')"
            maxlength="24"
            size="lg"
          />
          <UInput
            v-model="draft.url"
            type="url"
            placeholder="https://"
            size="lg"
          />
          <div class="flex flex-wrap items-center gap-4 md:col-span-2">
            <label class="flex cursor-pointer items-center gap-2 border-[1.5px] border-(--line) px-3 py-2 text-sm font-semibold hover:border-(--ink)">
              <UIcon
                :name="uploading ? 'i-lucide-loader' : 'i-lucide-image-up'"
                class="size-4"
                :class="uploading ? 'animate-spin' : ''"
              />{{ draft.logo ? t('studio.f.changeLogo') : t('studio.f.logo') }}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="sr-only"
                @change="upload"
              >
            </label>
            <label
              v-for="c in (['bg', 'fg', 'accent'] as const)"
              :key="c"
              class="flex items-center gap-2 text-sm text-(--ink2)"
            >
              <input
                v-model="draft[c]"
                type="color"
                class="size-8 cursor-pointer border-[1.5px] border-(--ink)"
              >{{ t(`studio.f.${c}`) }}
            </label>
          </div>
          <div class="flex flex-wrap items-center gap-3 md:col-span-2">
            <UButton
              type="submit"
              icon="i-lucide-send"
              :loading="saving"
            >
              {{ t('studio.publish') }}
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              :loading="saving"
              @click="save(false)"
            >
              {{ t('studio.saveDraft') }}
            </UButton>
            <span
              v-if="saved"
              class="text-sm text-(--signal)"
            >{{ saved }}</span>
          </div>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            class="md:col-span-2"
            :description="error"
          />
        </form>
      </section>

      <!-- Results -->
      <section class="space-y-4">
        <h2 class="bp-h3">
          {{ t('studio.results') }}
        </h2>
        <dl class="grid grid-cols-3 border-s-[1.5px] border-t-[1.5px] border-(--ink)">
          <div
            v-for="tile in [{ k: 'views', v: totals.views.toLocaleString(locale) }, { k: 'clicks', v: totals.clicks.toLocaleString(locale) }, { k: 'ctr', v: `${totals.ctr}%` }]"
            :key="tile.k"
            class="flex flex-col-reverse border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-4"
          >
            <dd class="mt-1 text-3xl font-black tabular-nums text-(--ink)">
              {{ tile.v }}
            </dd>
            <dt class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
              {{ t(`studio.${tile.k}`) }}
            </dt>
          </div>
        </dl>
        <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div class="border-[1.5px] border-(--ink) bg-(--card) p-4">
            <p class="mono-label mb-2">
              {{ t('studio.byDay') }}
            </p>
            <div class="flex h-40 items-end gap-1">
              <div
                v-for="d in current.days"
                :key="d.day"
                class="flex flex-1 flex-col justify-end"
                :title="`${d.day} · ${d.views} / ${d.clicks}`"
              >
                <span
                  class="block bg-(--signal)"
                  :style="{ height: `${(d.clicks / maxViews) * 10}rem` }"
                />
                <span
                  class="block bg-(--frost)"
                  :style="{ height: `${((d.views - d.clicks) / maxViews) * 10}rem` }"
                />
              </div>
              <p
                v-if="!current.days.length"
                class="text-sm text-(--ink2)"
              >
                {{ t('studio.noData') }}
              </p>
            </div>
          </div>
          <div class="border-[1.5px] border-(--ink) bg-(--card) p-4">
            <p class="mono-label mb-2">
              {{ t('studio.topPages') }}
            </p>
            <ol class="space-y-1 text-sm">
              <li
                v-for="p in current.pages"
                :key="p.path"
                class="flex gap-2"
              >
                <span class="min-w-0 flex-1 truncate font-mono text-xs text-(--ink)">{{ p.path }}</span>
                <span class="tabular-nums text-(--ink2)">{{ p.views }} · {{ p.clicks }}</span>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
