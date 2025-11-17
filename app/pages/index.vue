<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

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
    <UPageSection
  v-if="page.modules"
  :headline="page.modules.headline"
  :title="page.modules.title"
  :description="page.modules.description"
>
  <UPageGrid>
    <UPageCard
      v-for="(mod, index) in page.modules.items"
      :key="mod.slug || index"
      :title="mod.title"
      :description="mod.summary"
      :icon="mod.icon"
      :to="mod.to || undefined"
      spotlight
    >
      <template #description>
        <p class="mb-2">
          {{ mod.summary }}
        </p>

        <div class="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{{ mod.level }}</span>
          <span>•</span>
          <span>{{ mod.duration }}</span>
        </div>

        <div
          v-if="mod.tags?.length"
          class="mt-3 flex flex-wrap gap-2"
        >
          <UBadge
            v-for="tag in mod.tags"
            :key="tag"
            size="xs"
            color="gray"
            variant="soft"
          >
            {{ tag }}
          </UBadge>
        </div>
      </template>
    </UPageCard>
  </UPageGrid>
</UPageSection>
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

    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
    >
      <ImagePlaceholder />
    </UPageSection>

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

    <UPageCTA
      v-bind="page.cta"
      variant="naked"
      class="overflow-hidden"
    >
      <LazyStarsBg />
    </UPageCTA>

    
  </div>
</template>