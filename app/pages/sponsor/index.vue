<script setup lang="ts">
/**
 * /sponsor — the self-serve sponsorship pitch and booking page.
 *
 * Prerendered like every public page; everything live on it (reach figures,
 * the twelve-month calendar, checkout) is fetched in the browser, so the
 * static file never carries yesterday's numbers or a month that has since
 * been sold. One sponsor per calendar month, $99, every placement.
 */
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()

const price = `$${PARTNER_PRICE_USD}`
const title = t('sponsor.page.seoTitle')
const description = t('sponsor.page.seoDescription', { price })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })
usePageSchema({ name: title, description, type: 'WebPage' })

const pairs = (key: string) => (tm(key) as { t: string, d: string }[]).map(x => ({ t: rt(x.t), d: rt(x.d) }))
const offer = computed(() => pairs('sponsor.page.offer'))
const how = computed(() => pairs('sponsor.page.how'))
const faqs = computed(() => (tm('sponsor.page.faqs') as { q: string, a: string }[])
  .map(f => ({ label: rt(f.q, { price }), content: rt(f.a, { price }) })))

const offerIcons = ['i-lucide-crown', 'i-lucide-layout-grid', 'i-lucide-mouse-pointer-click']

/** A sample creative per format, so the formats section shows real shapes. */
const sample = (format: PartnerFormat) => ({
  format,
  mode: 'designed' as const,
  imageUrl: null,
  imageMobileUrl: null,
  logoUrl: null,
  headline: t('sponsor.slot.title'),
  body: t('sponsor.slot.textBody', { price }),
  cta: t('sponsor.slot.cta'),
  theme: format === 'square' ? 'navy' as const : 'paper' as const,
  alt: null,
  sponsor: 'Your brand'
})
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('sponsor.page.sheet')"
      :title="t('sponsor.page.title')"
      :lead="t('sponsor.page.lead', { price })"
    >
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          to="#calendar"
          size="xl"
          icon="i-lucide-calendar-range"
        >
          {{ t('sponsor.page.ctaBook') }}
        </UButton>
        <UButton
          v-if="isSignedIn"
          :to="localePath('/sponsor/studio')"
          size="xl"
          color="neutral"
          variant="outline"
          icon="i-lucide-pen-tool"
        >
          {{ t('sponsor.page.ctaStudio') }}
        </UButton>
      </div>
    </BpPageHeader>

    <UContainer class="space-y-20 py-14 sm:py-20">
      <PartnerReach />

      <!-- The offer -->
      <section>
        <p class="eyebrow">
          {{ t('sponsor.page.offerEyebrow') }}
        </p>
        <h2 class="bp-h2 mt-3">
          {{ t('sponsor.page.offerTitle', { price }) }}
        </h2>
        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          <div
            v-for="(o, i) in offer"
            :key="o.t"
            class="bp-card bp-card--hover p-6"
          >
            <span class="bp-iconbox">
              <UIcon
                :name="offerIcons[i] ?? 'i-lucide-check'"
                class="size-5"
              />
            </span>
            <h3 class="bp-h3 mt-4">
              {{ o.t }}
            </h3>
            <p class="mt-2 text-sm text-(--ink2)">
              {{ o.d }}
            </p>
          </div>
        </div>
      </section>

      <PartnerCalendar />

      <!-- How it works -->
      <section>
        <p class="eyebrow">
          {{ t('sponsor.page.howEyebrow') }}
        </p>
        <h2 class="bp-h2 mt-3">
          {{ t('sponsor.page.howTitle') }}
        </h2>
        <ol class="mt-8 grid border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="(s, i) in how"
            :key="s.t"
            class="-mb-[1.5px] -me-[1.5px] border-b-[1.5px] border-e-[1.5px] border-(--ink) p-5"
          >
            <span class="flex size-8 items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) font-mono text-xs font-semibold text-white">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3 class="mt-3 font-bold text-(--ink)">
              {{ s.t }}
            </h3>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ s.d }}
            </p>
          </li>
        </ol>
      </section>

      <!-- Formats -->
      <section>
        <p class="eyebrow">
          {{ t('sponsor.page.formatsEyebrow') }}
        </p>
        <h2 class="bp-h2 mt-3">
          {{ t('sponsor.page.formatsTitle') }}
        </h2>
        <div class="mt-8 space-y-8">
          <BpFigure
            :caption="t('sponsor.page.formats.leaderboard')"
            :spec="t('sponsor.page.formats.leaderboardSpec')"
            ruler
          >
            <div class="graph-paper-fine p-4 sm:p-6">
              <div class="mx-auto w-full max-w-[320px] aspect-[320/100] sm:max-w-[728px] sm:aspect-[728/90]">
                <PromoCreative :creative="sample('leaderboard')" />
              </div>
              <p class="mt-3 text-center text-xs text-(--ink2)">
                {{ t('sponsor.page.formats.leaderboardWhere') }}
              </p>
            </div>
          </BpFigure>
          <div class="grid gap-8 lg:grid-cols-2">
            <BpFigure
              :caption="t('sponsor.page.formats.square')"
              :spec="t('sponsor.page.formats.squareSpec')"
            >
              <div class="graph-paper-fine flex flex-1 flex-col justify-center p-4 sm:p-6">
                <div class="mx-auto w-full max-w-[300px] aspect-[300/250]">
                  <PromoCreative :creative="sample('square')" />
                </div>
                <p class="mt-3 text-center text-xs text-(--ink2)">
                  {{ t('sponsor.page.formats.squareWhere') }}
                </p>
              </div>
            </BpFigure>
            <BpFigure
              :caption="t('sponsor.page.formats.text')"
              :spec="t('sponsor.page.formats.textSpec')"
            >
              <div class="graph-paper-fine flex flex-1 flex-col justify-center p-4 sm:p-6">
                <div class="h-32 w-full">
                  <PromoCreative :creative="sample('text')" />
                </div>
                <p class="mt-3 text-center text-xs text-(--ink2)">
                  {{ t('sponsor.page.formats.textWhere') }}
                </p>
              </div>
            </BpFigure>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <p class="eyebrow">
            {{ t('sponsor.page.faqEyebrow') }}
          </p>
          <h2 class="bp-h2 mt-3">
            {{ t('sponsor.page.faqTitle') }}
          </h2>
        </div>
        <UAccordion
          :items="faqs"
          class="border-[1.5px] border-(--ink) bg-(--card) px-4"
        />
      </section>

      <!-- Invoice / bigger deals -->
      <section
        id="sponsor-form"
        class="grid scroll-mt-24 gap-10 lg:grid-cols-5"
      >
        <div class="lg:col-span-2">
          <p class="eyebrow">
            {{ t('sponsor.page.invoiceEyebrow') }}
          </p>
          <h2 class="bp-h2 mt-3">
            {{ t('sponsor.page.invoiceTitle') }}
          </h2>
          <p class="bp-lead mt-4">
            {{ t('sponsor.page.invoiceLead') }}
          </p>
        </div>
        <div class="lg:col-span-3">
          <LeadForm type="sponsor" />
        </div>
      </section>
    </UContainer>
  </div>
</template>
