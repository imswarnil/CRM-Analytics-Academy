<script setup lang="ts">
/**
 * Applying to the experts network. The application is a lead of type
 * `expert` (/api/leads → app.lead → n8n); an admin reviews it in
 * /admin → Experts and, on approval, it becomes a public roster profile.
 *
 * Revenue terms are deliberately not quoted here: the split between lead,
 * reviewer and the network is agreed per project, in writing.
 */
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

const title = computed(() => t('experts.seo.joinTitle'))
const description = computed(() => t('experts.seo.joinDescription'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

const who = computed(() => (tm('experts.join.who') as string[]).map(p => rt(p)))
const pairs = (key: string) => (tm(key) as { t: string, d: string }[]).map(p => ({ title: rt(p.t), text: rt(p.d) }))

const GET_ICONS = ['i-lucide-briefcase', 'i-lucide-users', 'i-lucide-handshake', 'i-lucide-id-card']
const EXPECT_ICONS = ['i-lucide-badge-check', 'i-lucide-scan-eye', 'i-lucide-message-square', 'i-lucide-package-check']
const get = computed(() => pairs('experts.join.get').map((p, i) => ({ ...p, icon: GET_ICONS[i] ?? 'i-lucide-circle' })))
const expect = computed(() => pairs('experts.join.expect').map((p, i) => ({ ...p, icon: EXPECT_ICONS[i] ?? 'i-lucide-circle' })))

usePageSchema(() => ({
  name: title.value,
  description: description.value,
  trail: [{ name: t('experts.seo.title'), path: '/experts' }]
}))
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('experts.join.sheet')"
      :title="t('experts.join.title')"
      :lead="t('experts.join.lead')"
    >
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          to="#apply"
          size="lg"
          icon="i-lucide-send"
        >
          {{ t('experts.join.apply') }}
        </UButton>
        <UButton
          :to="localePath('/experts')"
          size="lg"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('experts.join.back') }}
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-24 px-4 py-16 sm:px-6 lg:px-8">
      <!-- Who can join -->
      <section class="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <p class="eyebrow">
            {{ t('experts.join.whoEyebrow') }}
          </p>
          <h2 class="bp-h2 mt-4">
            {{ t('experts.join.whoTitle') }}
          </h2>
        </div>
        <ul class="border-[1.5px] border-(--ink) bg-(--card)">
          <li
            v-for="(w, i) in who"
            :key="w"
            class="flex items-start gap-3 p-4"
            :class="i ? 'border-t border-dashed border-(--line)' : ''"
          >
            <UIcon
              name="i-lucide-check"
              class="mt-0.5 size-5 flex-none text-(--signal)"
            />
            <span class="text-(--ink)">{{ w }}</span>
          </li>
        </ul>
      </section>

      <!-- What members get / what we expect -->
      <section
        v-for="block in [
          { eyebrow: t('experts.join.getEyebrow'), title: t('experts.join.getTitle'), items: get },
          { eyebrow: t('experts.join.expectEyebrow'), title: t('experts.join.expectTitle'), items: expect }
        ]"
        :key="block.title"
      >
        <p class="eyebrow">
          {{ block.eyebrow }}
        </p>
        <h2 class="bp-h2 mt-4">
          {{ block.title }}
        </h2>
        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="item in block.items"
            :key="item.title"
            class="bp-card bp-card--hover p-5"
          >
            <span class="bp-iconbox size-10">
              <UIcon
                :name="item.icon"
                class="size-5"
              />
            </span>
            <h3 class="mt-4 text-lg font-extrabold text-(--ink)">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm text-(--ink2)">
              {{ item.text }}
            </p>
          </div>
        </div>
      </section>

      <!-- Application -->
      <section
        id="apply"
        class="grid scroll-mt-24 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
      >
        <div>
          <p class="eyebrow">
            {{ t('experts.join.formEyebrow') }}
          </p>
          <h2 class="bp-h2 mt-4">
            {{ t('experts.join.formTitle') }}
          </h2>
          <p class="bp-lead mt-4">
            {{ t('experts.join.formLead') }}
          </p>
        </div>
        <LeadForm type="expert" />
      </section>
    </div>
  </div>
</template>
