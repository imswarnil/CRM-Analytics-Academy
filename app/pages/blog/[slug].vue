<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug))

const { data, error } = await useFetch(() => `/api/posts/${slug.value}`)

if (error.value || !data.value?.post) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

const post = computed(() => data.value!.post)

function formatDate(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

useSeoMeta({
  title: () => `${post.value.title} — CRM Analytics Academy`,
  description: () => post.value.description ?? undefined,
  ogTitle: () => post.value.title,
  ogDescription: () => post.value.description ?? undefined,
  ogImage: () => post.value.cover_url ?? undefined,
  articleAuthor: () => (post.value.author_name ? [post.value.author_name] : undefined)
})

// For curated posts we only host an excerpt, so the ORIGINAL is the canonical
// URL. This keeps us out of the source's way in search results rather than
// competing with the article we're pointing at.
useHead(() => ({
  link: post.value.is_external && post.value.source_url
    ? [{ rel: 'canonical', href: post.value.source_url }]
    : []
}))
</script>

<template>
  <UContainer class="py-12">
    <article class="mx-auto max-w-2xl">
      <UButton
        :to="localePath('/blog')"
        variant="link"
        color="neutral"
        icon="i-lucide-arrow-left"
        class="-ml-2 mb-6"
      >
        All posts
      </UButton>

      <div class="flex flex-wrap items-center gap-2 text-sm text-dimmed">
        <span
          v-if="post.is_external"
          class="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          Community
        </span>
        <time v-if="post.published_at">{{ formatDate(post.published_at) }}</time>
      </div>

      <h1 class="mt-3 text-3xl font-bold text-highlighted sm:text-4xl">
        {{ post.title }}
      </h1>

      <p
        v-if="post.description"
        class="mt-4 text-lg text-muted"
      >
        {{ post.description }}
      </p>

      <!--
        Attribution for curated posts sits ABOVE the content, not buried at the
        bottom — a reader should know whose work this is before they read it.
      -->
      <aside
        v-if="post.is_external"
        class="mt-8 rounded-xl border border-default bg-elevated/50 p-4"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-quote"
            class="mt-0.5 size-5 shrink-0 text-primary"
          />
          <div class="text-sm">
            <p class="text-default">
              Written by
              <a
                v-if="post.author_url"
                :href="post.author_url"
                target="_blank"
                rel="noopener author"
                class="font-semibold text-primary hover:underline"
              >{{ post.author_name }}</a>
              <span
                v-else
                class="font-semibold text-highlighted"
              >{{ post.author_name }}</span>
              <template v-if="post.source_name">
                , originally published on {{ post.source_name }}
              </template>.
            </p>
            <p
              v-if="post.excerpt_only"
              class="mt-1 text-muted"
            >
              We're showing a short excerpt here. Please read the full article at the source.
            </p>
          </div>
        </div>

        <UButton
          v-if="post.source_url"
          :to="post.source_url"
          target="_blank"
          rel="noopener"
          trailing-icon="i-lucide-arrow-up-right"
          size="sm"
          class="mt-3 rounded-full"
        >
          Read the original
        </UButton>
      </aside>

      <img
        v-if="post.cover_url"
        :src="post.cover_url"
        :alt="post.title"
        class="mt-8 w-full rounded-xl border border-default"
      >

      <div
        v-if="post.body"
        class="prose prose-primary mt-8 max-w-none dark:prose-invert"
      >
        <MDC :value="post.body" />
      </div>

      <div
        v-if="post.tags?.length"
        class="mt-10 flex flex-wrap gap-2 border-t border-default pt-6"
      >
        <UButton
          v-for="t in post.tags"
          :key="t"
          :to="`${localePath('/blog')}?tag=${encodeURIComponent(t)}`"
          size="xs"
          variant="soft"
          color="neutral"
          class="rounded-full"
        >
          {{ t }}
        </UButton>
      </div>

      <!-- Repeated at the end so the credit survives however far someone reads. -->
      <aside
        v-if="post.is_external && post.source_url"
        class="mt-8 rounded-xl border border-default p-4 text-sm text-muted"
      >
        This article is the work of
        <span class="font-medium text-highlighted">{{ post.author_name }}</span>.
        <a
          :href="post.source_url"
          target="_blank"
          rel="noopener"
          class="text-primary hover:underline"
        >View the original{{ post.source_name ? ` on ${post.source_name}` : '' }} →</a>
      </aside>
    </article>
  </UContainer>
</template>
