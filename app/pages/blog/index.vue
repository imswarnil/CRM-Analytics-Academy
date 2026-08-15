<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()

const tag = computed(() => (typeof route.query.tag === 'string' ? route.query.tag : null))

// Public, published-only data — safe to render on the server. Sourced from
// the `blog` Nuxt Content collection (content/blog/**), not a DB table.
// Tag filtering happens client-side below: `tags` is a JSON array column, and
// the query builder has no array-contains operator, so it's simplest (and
// small enough here) to fetch the published set once and filter in memory.
const { data: allPosts } = await useAsyncData(
  'blog-index',
  () => queryCollection('blog').where('status', '=', 'published').order('publishedAt', 'DESC').all(),
  { default: () => [] }
)

const posts = computed(() => {
  if (!tag.value) return allPosts.value
  return allPosts.value.filter(post => post.tags?.includes(tag.value as string))
})

const allTags = computed(() => {
  const seen = new Set<string>()
  for (const post of allPosts.value) {
    for (const t of post.tags ?? []) seen.add(t)
  }
  return [...seen].sort()
})

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const title = 'Blog — CRM Analytics Academy'
const description = 'Articles, tutorials, and hand-picked writing from across the Salesforce CRM Analytics community.'

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
        Blog
      </h1>
      <p class="mt-3 text-muted">
        Original write-ups plus the best CRM Analytics writing from around the community —
        always credited and linked back to the people who wrote it.
      </p>
    </div>

    <div
      v-if="allTags.length"
      class="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <UButton
        :to="localePath('/blog')"
        size="xs"
        :variant="tag ? 'ghost' : 'solid'"
        color="neutral"
        class="rounded-full"
      >
        All
      </UButton>
      <UButton
        v-for="t in allTags"
        :key="t"
        :to="`${localePath('/blog')}?tag=${encodeURIComponent(t)}`"
        size="xs"
        :variant="tag === t ? 'solid' : 'ghost'"
        color="neutral"
        class="rounded-full"
      >
        {{ t }}
      </UButton>
    </div>

    <div
      v-if="!posts.length"
      class="mt-16 text-center text-muted"
    >
      <UIcon
        name="i-lucide-newspaper"
        class="mx-auto size-10 text-dimmed"
      />
      <p class="mt-3 text-sm">
        No posts published yet — check back soon.
      </p>
    </div>

    <div
      v-else
      class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="post in posts"
        :key="post.id"
        class="group flex flex-col overflow-hidden rounded-2xl border border-default bg-default transition hover:border-primary/40 hover:shadow-lg"
      >
        <NuxtLink
          :to="localePath(post.path)"
          class="flex flex-1 flex-col"
        >
          <div
            v-if="post.coverUrl"
            class="aspect-video overflow-hidden bg-elevated"
          >
            <img
              :src="post.coverUrl"
              :alt="post.title"
              loading="lazy"
              class="size-full object-cover transition duration-300 group-hover:scale-105"
            >
          </div>

          <div class="flex flex-1 flex-col p-5">
            <div class="flex items-center gap-2 text-xs text-dimmed">
              <span
                v-if="post.isExternal"
                class="rounded bg-primary/10 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-primary"
              >
                Community
              </span>
              <time v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
            </div>

            <h2 class="mt-2 font-semibold text-highlighted group-hover:text-primary">
              {{ post.title }}
            </h2>

            <p
              v-if="post.description"
              class="mt-2 line-clamp-3 flex-1 text-sm text-muted"
            >
              {{ post.description }}
            </p>

            <!-- Attribution is part of the card, not an afterthought. -->
            <p
              v-if="post.isExternal && post.authorName"
              class="mt-3 border-t border-default pt-3 text-xs text-dimmed"
            >
              By {{ post.authorName }}<template v-if="post.sourceName"> · {{ post.sourceName }}</template>
            </p>
          </div>
        </NuxtLink>
      </article>
    </div>
  </UContainer>
</template>
