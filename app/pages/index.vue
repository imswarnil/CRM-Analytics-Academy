<script setup lang="ts">
import { computed } from 'vue'
import type { StepperItem } from '@nuxt/ui'

const { data: page } = await useAsyncData('index', () =>
  queryCollection('index').first()
)

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

// ✅ Derive stepper items from YAML, but keep the same shape as our working code
const stepperItems = computed<StepperItem[]>(() => {
  const rawItems = page.value?.stepper?.items || []

  // Shallow clone into plain objects so Nuxt UI gets a clean array
  return rawItems.map((item: any) => ({
    title: item.title,
    description: item.description,
    icon: item.icon
  }))
})

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <div v-if="page">
    <!-- HERO -->
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
      :orientation="page.hero.orientation"
    >
      <template #top>
        <HeroBackground />
      </template>

      <template #title>
        <MDC
          :value="page.title"
          unwrap="p"
        />
      </template>

      <PromotionalVideo />
    </UPageHero>

    <!-- STEPPER: Learning Path (now powered by YAML) -->
    <UPageSection
      v-if="stepperItems.length"
      id="learning-path"
      :title="page.stepper.title"
      :description="page.stepper.description"
    >
      <UStepper
        :items="stepperItems"
        size="lg"
        color="primary"
        class="w-full max-w-4xl mx-auto"
      />
    </UPageSection>

    <!-- SECTIONS -->
    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :id="section.id"
      :features="section.features"
    >
      <ImagePlaceholder />
    </UPageSection>

    <!-- FEATURE GRID -->
    <UPageSection
      :title="page.features.title"
      :description="page.features.description"
    >
      <UPageGrid>
        <UPageCard
          v-for="(item, index) in page.features.items"
          :key="index"
          v-bind="item"
          spotlight
        />
      </UPageGrid>
    </UPageSection>

    <!-- TESTIMONIALS -->
    <UPageSection
      id="testimonials"
      :headline="page.testimonials.headline"
      :title="page.testimonials.title"
      :description="page.testimonials.description"
    >
      <UPageColumns class="xl:columns-4">
        <UPageCard
          v-for="(testimonial, index) in page.testimonials.items"
          :key="index"
          variant="subtle"
          :description="testimonial.quote"
          :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
        >
          <template #footer>
            <UUser
              v-bind="testimonial.user"
              size="lg"
            />
          </template>
        </UPageCard>
      </UPageColumns>
    </UPageSection>

    <USeparator />

    <!-- CTA -->
    <UPageCTA
      v-bind="page.cta"
      variant="naked"
      class="overflow-hidden"
    >
      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>
