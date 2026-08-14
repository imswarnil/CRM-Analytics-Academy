<script setup lang="ts">
const localePath = useLocalePath()

// Public, published-only curriculum — safe to render on the server.
const { data } = await useFetch('/api/learn', {
  default: () => ({ sections: [] })
})

const sections = computed(() => data.value?.sections ?? [])

const lessonCount = computed(() =>
  sections.value.reduce((total, section) => total + (section.lessons?.length ?? 0), 0))

const title = 'Learn — CRM Analytics Academy'
const description = 'Guided CRM Analytics sections and lessons — data prep, SAQL, dashboards, bindings, and Einstein Discovery.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UContainer class="py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h1 class="text-3xl font-bold text-highlighted sm:text-4xl">
        Learn CRM Analytics
      </h1>
      <p class="mt-3 text-muted">
        A guided path through Salesforce CRM Analytics — work through each section in order,
        or jump straight to the lesson you need.
      </p>
      <p
        v-if="lessonCount"
        class="mt-3 text-sm text-dimmed"
      >
        {{ sections.length }} {{ sections.length === 1 ? 'section' : 'sections' }} ·
        {{ lessonCount }} {{ lessonCount === 1 ? 'lesson' : 'lessons' }}
      </p>
    </div>

    <div
      v-if="!sections.length"
      class="mt-16 text-center text-muted"
    >
      <UIcon
        name="i-lucide-graduation-cap"
        class="mx-auto size-10 text-dimmed"
      />
      <p class="mt-3 text-sm">
        No sections published yet — check back soon.
      </p>
      <UButton
        :to="localePath('/foundations')"
        variant="link"
        color="neutral"
        trailing-icon="i-lucide-arrow-right"
        class="mt-2"
      >
        Browse the docs curriculum
      </UButton>
    </div>

    <div
      v-else
      class="mt-10 grid gap-6 lg:grid-cols-2"
    >
      <section
        v-for="section in sections"
        :key="section.id"
        class="flex flex-col overflow-hidden rounded-2xl border border-default bg-default"
      >
        <div class="flex items-start gap-3 border-b border-default p-5">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <UIcon
              :name="section.icon || 'i-lucide-book-open'"
              class="size-5 text-primary"
            />
          </div>
          <div class="min-w-0">
            <h2 class="font-semibold text-highlighted">
              {{ section.title }}
            </h2>
            <p
              v-if="section.description"
              class="mt-1 text-sm text-muted"
            >
              {{ section.description }}
            </p>
          </div>
        </div>

        <p
          v-if="!section.lessons?.length"
          class="p-5 text-sm text-dimmed"
        >
          No lessons published in this section yet.
        </p>

        <ul
          v-else
          class="divide-y divide-default"
        >
          <li
            v-for="lesson in section.lessons"
            :key="lesson.id"
          >
            <NuxtLink
              :to="localePath(`/learn/${section.slug}/${lesson.slug}`)"
              class="group flex items-center gap-3 px-5 py-3 transition hover:bg-elevated/50"
            >
              <UIcon
                :name="lesson.video_id ? 'i-lucide-play-circle' : 'i-lucide-file-text'"
                class="size-4 shrink-0 text-dimmed group-hover:text-primary"
              />

              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-default group-hover:text-primary">
                  {{ lesson.title }}
                </span>
                <span
                  v-if="lesson.description"
                  class="mt-0.5 block truncate text-xs text-dimmed"
                >
                  {{ lesson.description }}
                </span>
              </span>

              <UBadge
                v-if="lesson.access === 'members'"
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-lock"
              >
                Members
              </UBadge>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </UContainer>
</template>
