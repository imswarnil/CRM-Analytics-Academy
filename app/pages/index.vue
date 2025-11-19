<script setup lang="ts">
import { ref } from 'vue'
import type { StepperItem } from '@nuxt/ui'

const { data: page } = await useAsyncData('index', () =>
  queryCollection('index').first()
)

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

const stepperItems = ref<StepperItem[]>([
  {
    title: '1. Get Your Org Ready',
    description: 'Enable CRM Analytics, assign licenses, and explore Analytics Studio.',
    icon: 'i-lucide-rocket'
  },
  {
    title: '2. Create Datasets',
    description: 'Connect Salesforce objects, upload CSVs, and design clean datasets.',
    icon: 'i-lucide-database'
  },
  {
    title: '3. Build Dashboards',
    description: 'Create lenses, dashboards, and tweak JSON layouts.',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    title: '4. Dataflows & Recipes',
    description: 'Automate transforms, schedule refreshes, and monitor data jobs.',
    icon: 'i-lucide-flowchart'
  },
  {
    title: '5. SAQL & Bindings',
    description: 'Write SAQL, add bindings, and implement row-level security.',
    icon: 'i-lucide-code-2'
  },
  {
    title: '6. Einstein & Embedding',
    description: 'Use Einstein Discovery and embed analytics into Lightning pages.',
    icon: 'i-lucide-brain'
  }
])

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

    <!-- STEPPER: Learning Path (hard-coded items) -->
    <UPageSection
      id="learning-path"
      title="Your Salesforce CRM Analytics Learning Path"
      description="Follow these stages from zero to production-ready CRM Analytics dashboards."
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
