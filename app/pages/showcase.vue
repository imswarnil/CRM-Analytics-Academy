<script setup lang="ts">
const client = useDb()
const user = useSupabaseUser()
const localePath = useLocalePath()

const title = 'Community Showcase — CRM Analytics Academy'
const description = 'Dashboards, apps, and projects built by the CRM Analytics Academy community.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

interface ProjectRow {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link: string | null
  tags: string[] | null
  created_at: string
  profiles: { username: string | null, full_name: string | null, avatar_url: string | null } | null
}

const { data: projects } = await useAsyncData('showcase', async () => {
  const { data } = await client
    .from('projects')
    .select('id, title, description, image_url, link, tags, created_at, profiles(username, full_name, avatar_url)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .returns<ProjectRow[]>()
  return data ?? []
})

const authorName = (p: ProjectRow) => p.profiles?.full_name || p.profiles?.username || 'Community member'
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-16 text-center sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-layout-dashboard"
            class="mr-1 size-4"
          />
          Showcase
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Built by the <span class="text-gradient">community</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Real CRM Analytics dashboards and projects shared by learners like you.
        </p>
        <UButton
          :to="user ? localePath('/submit/project') : localePath('/login') + '?redirect=' + encodeURIComponent(localePath('/submit/project'))"
          size="xl"
          icon="i-lucide-plus"
          class="mt-8 rounded-full font-semibold"
        >
          Submit your project
        </UButton>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div
        v-if="projects?.length"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <UPageCard
          v-for="p in projects"
          :key="p.id"
          :ui="{ body: 'space-y-3' }"
        >
          <img
            v-if="p.image_url"
            :src="p.image_url"
            :alt="p.title"
            loading="lazy"
            class="mb-1 aspect-video w-full rounded-lg border border-default object-cover"
          >
          <h3 class="font-semibold text-highlighted">
            {{ p.title }}
          </h3>
          <p
            v-if="p.description"
            class="line-clamp-3 text-sm text-muted"
          >
            {{ p.description }}
          </p>
          <div
            v-if="p.tags?.length"
            class="flex flex-wrap gap-1.5"
          >
            <UBadge
              v-for="tag in p.tags"
              :key="tag"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ tag }}
            </UBadge>
          </div>
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs text-dimmed">by {{ authorName(p) }}</span>
            <UButton
              v-if="p.link"
              :to="p.link"
              target="_blank"
              trailing-icon="i-lucide-external-link"
              color="neutral"
              variant="link"
              size="xs"
            >
              View
            </UButton>
          </div>
        </UPageCard>
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-default py-20 text-center"
      >
        <UIcon
          name="i-lucide-sparkles"
          class="mx-auto mb-3 size-8 text-muted"
        />
        <p class="text-muted">
          No projects yet — be the first to share yours!
        </p>
      </div>
    </UContainer>
  </div>
</template>
