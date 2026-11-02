<script setup lang="ts">
/**
 * /sponsor/studio — the sponsor's own space: design the creative (photo, logo,
 * title, tagline, description, price, website, button and link; a colour
 * theme or any three colours, layout, corners, font) with a live preview of
 * every format it runs in — the bar on desktop and phone, the end-of-lesson
 * card and the contents tile —
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
const BLANK = { logo: '', photo: '', headline: '', tagline: '', body: '', price: '', website: '', cta: '', url: '', bg: '#0c1b33', fg: '#ffffff', accent: '#2f5bea', layout: 'image', radius: 'rounded', font: 'sans' }
const draft = reactive({ ...BLANK })
watch(current, (s) => {
  if (s) Object.assign(draft, BLANK, s.creative)
}, { immediate: true })

// Ready-made colour sets; any colour can still be changed after.
const THEMES = [
  { id: 'midnight', bg: '#0c1b33', fg: '#ffffff', accent: '#2f5bea' },
  { id: 'paper', bg: '#fbfaf6', fg: '#111827', accent: '#111827' },
  { id: 'sunset', bg: '#2b1055', fg: '#ffffff', accent: '#ff7a59' },
  { id: 'forest', bg: '#0f2e24', fg: '#eafff5', accent: '#10b981' },
  { id: 'electric', bg: '#0b0b0f', fg: '#ffffff', accent: '#84cc16' },
  { id: 'blush', bg: '#fff1f2', fg: '#4c0519', accent: '#e11d48' }
]
const useTheme = (th: typeof THEMES[number]) => Object.assign(draft, { bg: th.bg, fg: th.fg, accent: th.accent })
const OPTIONS = { layout: ['image', 'side', 'text'], radius: ['square', 'rounded', 'pill'], font: ['sans', 'serif', 'mono'] } as const
// What still stops publishing, in the order the form asks for it.
const missing = computed(() => (['headline', 'cta', 'url'] as const).filter(k => !draft[k]))

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

const uploading = ref<'' | 'logo' | 'photo'>('')
async function upload(e: Event, field: 'logo' | 'photo') {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = field
  error.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    draft[field] = (await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })).url
  } catch (err) {
    error.value = apiError(err) || t('contrib.err.generic')
  } finally {
    uploading.value = ''
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

      <!-- Designer: the form, and every format it runs in -->
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

        <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
          <form
            class="space-y-6 border-[1.5px] border-(--ink) bg-(--card) p-5"
            @submit.prevent="save(true)"
          >
            <!-- Content -->
            <fieldset class="space-y-3">
              <legend class="mono-label mb-2">
                {{ t('studio.g.content') }}
              </legend>
              <div class="grid grid-cols-2 gap-3">
                <label
                  v-for="f in (['photo', 'logo'] as const)"
                  :key="f"
                  class="group relative flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden border-[1.5px] border-dashed border-(--line) text-xs font-semibold text-(--ink2) hover:border-(--ink)"
                >
                  <img
                    v-if="draft[f]"
                    :src="draft[f]"
                    alt=""
                    class="absolute inset-0 size-full"
                    :class="f === 'photo' ? 'object-cover' : 'object-contain p-4'"
                  >
                  <span
                    class="relative z-10 flex items-center gap-1.5 bg-(--card)/90 px-2 py-1"
                    :class="draft[f] ? 'opacity-0 group-hover:opacity-100' : ''"
                  >
                    <UIcon
                      :name="uploading === f ? 'i-lucide-loader' : 'i-lucide-image-up'"
                      class="size-4"
                      :class="uploading === f ? 'animate-spin' : ''"
                    />{{ t(`studio.f.${f}`) }}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="sr-only"
                    @change="upload($event, f)"
                  >
                </label>
              </div>
              <UFormField
                :label="t('studio.f.headline')"
                required
              >
                <UInput
                  v-model="draft.headline"
                  maxlength="70"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('studio.f.tagline')">
                <UInput
                  v-model="draft.tagline"
                  maxlength="80"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('studio.f.body')">
                <UTextarea
                  v-model="draft.body"
                  maxlength="220"
                  :rows="3"
                  autoresize
                  class="w-full"
                />
              </UFormField>
              <div class="grid grid-cols-2 gap-3">
                <UFormField :label="t('studio.f.price')">
                  <UInput
                    v-model="draft.price"
                    maxlength="30"
                    :placeholder="t('studio.f.pricePh')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  :label="t('studio.f.cta')"
                  required
                >
                  <UInput
                    v-model="draft.cta"
                    maxlength="24"
                    class="w-full"
                  />
                </UFormField>
              </div>
              <UFormField
                :label="t('studio.f.url')"
                required
              >
                <UInput
                  v-model="draft.url"
                  type="url"
                  placeholder="https://"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('studio.f.website')">
                <UInput
                  v-model="draft.website"
                  maxlength="60"
                  placeholder="example.com"
                  class="w-full"
                />
              </UFormField>
            </fieldset>

            <!-- Style -->
            <fieldset class="space-y-4">
              <legend class="mono-label mb-2">
                {{ t('studio.g.style') }}
              </legend>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="th in THEMES"
                  :key="th.id"
                  type="button"
                  class="flex aspect-square items-end justify-end border-[1.5px] p-1"
                  :class="draft.bg === th.bg && draft.accent === th.accent ? 'border-(--ink) ring-2 ring-(--signal)' : 'border-(--line)'"
                  :style="{ background: th.bg }"
                  :title="th.id"
                  :aria-label="th.id"
                  @click="useTheme(th)"
                >
                  <span
                    class="size-3 rounded-full"
                    :style="{ background: th.accent }"
                  />
                </button>
              </div>
              <div class="flex flex-wrap gap-4">
                <label
                  v-for="k in (['bg', 'fg', 'accent'] as const)"
                  :key="k"
                  class="flex items-center gap-2 text-sm text-(--ink2)"
                >
                  <input
                    v-model="draft[k]"
                    type="color"
                    class="size-8 cursor-pointer border-[1.5px] border-(--ink)"
                  >{{ t(`studio.f.${k}`) }}
                </label>
              </div>
              <div
                v-for="(list, k) in OPTIONS"
                :key="k"
                class="flex flex-wrap items-center gap-2"
              >
                <span class="w-20 text-sm text-(--ink2)">{{ t(`studio.f.${k}`) }}</span>
                <button
                  v-for="o in list"
                  :key="o"
                  type="button"
                  class="border-[1.5px] px-2.5 py-1 text-xs font-semibold"
                  :class="draft[k] === o ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
                  @click="draft[k] = o"
                >
                  {{ t(`studio.o.${o}`) }}
                </button>
              </div>
            </fieldset>

            <div class="space-y-3 border-t-[1.5px] border-(--line) pt-4">
              <p
                v-if="missing.length"
                class="text-xs text-(--ink2)"
              >
                {{ t('studio.missing', { fields: missing.map(m => t(`studio.f.${m}`)).join(', ') }) }}
              </p>
              <div class="flex flex-wrap items-center gap-3">
                <UButton
                  type="submit"
                  icon="i-lucide-send"
                  :loading="saving"
                  :disabled="missing.length > 0"
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
                :description="error"
              />
            </div>
          </form>

          <!-- Every format, as readers will see it -->
          <div class="space-y-6 xl:sticky xl:top-[calc(var(--ui-header-height)+1rem)]">
            <div>
              <p class="mono-label mb-2">
                {{ t('studio.fmt.bar') }}
              </p>
              <div class="overflow-hidden border-[1.5px] border-(--ink) bg-(--paper)">
                <div class="flex h-8 items-center gap-2 border-b border-(--line) bg-(--card) px-3">
                  <span class="size-2 rounded-full bg-(--line)" /><span class="h-2 w-24 bg-(--line)" /><span class="ms-auto h-2 w-16 bg-(--line)" />
                </div>
                <SponsorCard
                  :company="current.company"
                  :creative="draft"
                  preview
                />
                <div class="space-y-2 p-4">
                  <span class="block h-3 w-1/2 bg-(--line)" /><span class="block h-2 w-5/6 bg-(--line)/60" />
                </div>
              </div>
            </div>
            <div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem]">
              <div>
                <p class="mono-label mb-2">
                  {{ t('studio.fmt.card') }}
                </p>
                <div class="space-y-3 border-[1.5px] border-(--ink) bg-(--paper) p-4">
                  <span class="block h-2 w-full bg-(--line)/60" /><span class="block h-2 w-4/5 bg-(--line)/60" />
                  <SponsorCard
                    :company="current.company"
                    :creative="draft"
                    format="card"
                    preview
                  />
                  <span class="block h-2 w-2/3 bg-(--line)/60" />
                </div>
              </div>
              <div>
                <p class="mono-label mb-2">
                  {{ t('studio.fmt.tile') }}
                </p>
                <div class="space-y-3 border-[1.5px] border-(--ink) bg-(--paper) p-3">
                  <span class="block h-2 w-1/2 bg-(--line)" /><span class="block h-2 w-3/4 bg-(--line)/60" /><span class="block h-2 w-2/3 bg-(--line)/60" />
                  <SponsorCard
                    :company="current.company"
                    :creative="draft"
                    format="tile"
                    preview
                  />
                </div>
              </div>
            </div>
            <div>
              <p class="mono-label mb-2">
                {{ t('studio.fmt.phone') }}
              </p>
              <div class="mx-auto w-[22rem] max-w-full overflow-hidden rounded-[2rem] border-[6px] border-(--ink) bg-(--paper)">
                <div class="flex h-9 items-center justify-between border-b border-(--line) bg-(--card) px-4">
                  <span class="h-2 w-16 bg-(--line)" /><span class="size-4 bg-(--line)" />
                </div>
                <SponsorCard
                  :company="current.company"
                  :creative="draft"
                  preview
                  narrow
                />
                <div class="space-y-2 p-4">
                  <span class="block h-3 w-2/3 bg-(--line)" /><span class="block h-2 w-full bg-(--line)/60" /><span class="block h-2 w-5/6 bg-(--line)/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
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
