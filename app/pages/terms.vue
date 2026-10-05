<script setup lang="ts">
const { t, tm, rt, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const title = computed(() => t('terms.seo.title'))
const description = computed(() => t('terms.seo.description'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

usePageSchema(() => ({ name: title.value, description: description.value, type: 'WebPage' }))

const sections = computed(() =>
  (tm('terms.sections') as { title: string, body: string }[]).map(s => ({
    title: rt(s.title),
    body: rt(s.body)
  }))
)
</script>

<template>
  <div>
    <section class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
      <UContainer class="relative py-16 sm:py-20">
        <p class="eyebrow mb-5">
          {{ t('terms.hero.eyebrow') }}
        </p>
        <h1 class="bp-h1">
          {{ title }}
        </h1>
        <p class="mt-4 max-w-2xl bp-lead">
          {{ t('terms.hero.lead') }}
        </p>
        <i18n-t
          v-if="locale !== 'en'"
          keypath="terms.englishPrevails"
          tag="p"
          scope="global"
          class="mt-4 max-w-2xl text-sm text-(--ink2)"
        >
          <template #link>
            <NuxtLink
              :to="switchLocalePath('en')"
              class="text-(--signal) hover:underline"
            >
              {{ t('terms.englishLink') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </UContainer>
    </section>

    <section class="py-16 sm:py-20">
      <UContainer>
        <div class="mx-auto max-w-3xl space-y-10">
          <div
            v-for="(s, i) in sections"
            :key="i"
          >
            <h2 class="text-xl font-bold text-(--ink)">
              {{ s.title }}
            </h2>
            <p class="mt-2 text-(--ink2)">
              {{ s.body }}
            </p>
          </div>

          <PromoSlot
            placement="betweenSections"
            class="mx-auto my-8 max-w-3xl"
          />
        </div>
      </UContainer>
    </section>
  </div>
</template>
