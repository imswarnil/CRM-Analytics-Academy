<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, displayName } = useProfile()
const localePath = useLocalePath()
const ai = useAiSettings()

useSeoMeta({ title: 'Your dashboard — CRM Analytics Academy', robots: 'noindex' })

interface DashboardData {
  progress: { lesson_path: string, completed_at: string }[]
  resources: { id: string, title: string, status: string, created_at: string }[]
  projects: { id: string, title: string, status: string, created_at: string }[]
  quizzes: { quiz_id: string, score: number, total: number, created_at: string }[]
}

// Fetched via a server route so RLS sees the authenticated user (the browser
// client can arrive anonymous).
const { data, pending, refresh } = await useAsyncData<DashboardData | null>(
  'dashboard',
  () => $fetch('/api/dashboard'),
  { server: false, watch: [user] }
)

// useAsyncData caches by key across navigations, so re-fetch every time the
// dashboard is opened — otherwise a lesson just marked complete won't show.
onMounted(() => refresh())

const statusColor = (s: string) => (s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'warning')

function lessonTitle(path: string) {
  const seg = path.split('/').filter(Boolean).pop() || path
  return seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted sm:text-3xl">
          Welcome back, {{ displayName }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          Your learning progress and contributions.
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          :to="localePath('/submit/resource')"
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          size="sm"
        >
          Submit resource
        </UButton>
        <UButton
          :to="localePath('/submit/project')"
          icon="i-lucide-plus"
          color="primary"
          size="sm"
        >
          Submit project
        </UButton>
      </div>
    </div>

    <!-- AI assistant / API key -->
    <div class="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default bg-elevated/40 px-4 py-3.5">
      <div class="flex items-center gap-2.5">
        <div class="flex size-9 items-center justify-center rounded-full bg-primary/10">
          <UIcon
            name="i-lucide-sparkles"
            class="size-4.5 text-primary"
          />
        </div>
        <div>
          <p class="text-sm font-medium text-default">
            AI assistant
          </p>
          <p class="text-xs text-muted">
            {{ ai.usingOwn.value ? `Using your own ${ai.provider.value.label} key — no limits` : "Using the site's shared model — add your own key for unlimited use" }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <AiSettings />
        <UButton
          :to="localePath('/profile')"
          size="sm"
          color="neutral"
          variant="outline"
          icon="i-lucide-key-round"
        >
          Add / manage API key
        </UButton>
      </div>
    </div>

    <div
      v-if="pending"
      class="flex justify-center py-16"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-primary"
      />
    </div>

    <div
      v-else
      class="grid gap-6 lg:grid-cols-3"
    >
      <!-- Progress -->
      <UPageCard
        class="lg:col-span-2"
        :ui="{ body: 'space-y-4' }"
      >
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-circle-check-big"
              class="size-5 text-primary"
            />
            Lessons completed
          </h2>
          <UBadge
            color="primary"
            variant="subtle"
          >
            {{ data?.progress.length || 0 }}
          </UBadge>
        </div>

        <ul
          v-if="data?.progress.length"
          class="divide-y divide-default"
        >
          <li
            v-for="p in data.progress.slice(0, 8)"
            :key="p.lesson_path"
            class="flex items-center justify-between gap-3 py-2.5"
          >
            <NuxtLink
              :to="p.lesson_path"
              class="truncate text-sm text-default hover:text-primary"
            >
              {{ lessonTitle(p.lesson_path) }}
            </NuxtLink>
            <UIcon
              name="i-lucide-check"
              class="size-4 shrink-0 text-success"
            />
          </li>
        </ul>
        <p
          v-else
          class="py-6 text-center text-sm text-muted"
        >
          No lessons marked complete yet.
          <NuxtLink
            :to="localePath('/')"
            class="text-primary hover:underline"
          >Start learning →</NuxtLink>
        </p>
      </UPageCard>

      <!-- Quizzes -->
      <UPageCard :ui="{ body: 'space-y-4' }">
        <h2 class="flex items-center gap-2 font-semibold text-highlighted">
          <UIcon
            name="i-lucide-list-checks"
            class="size-5 text-primary"
          />
          Recent quizzes
        </h2>
        <ul
          v-if="data?.quizzes.length"
          class="space-y-2"
        >
          <li
            v-for="(q, i) in data.quizzes"
            :key="i"
            class="flex items-center justify-between text-sm"
          >
            <span class="truncate text-muted">{{ q.quiz_id }}</span>
            <UBadge
              :color="q.score / q.total >= 0.7 ? 'success' : 'warning'"
              variant="subtle"
            >
              {{ q.score }}/{{ q.total }}
            </UBadge>
          </li>
        </ul>
        <p
          v-else
          class="py-6 text-center text-sm text-muted"
        >
          No quiz attempts yet.
        </p>
      </UPageCard>

      <!-- My resources -->
      <UPageCard :ui="{ body: 'space-y-4' }">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-library-big"
              class="size-5 text-primary"
            />
            My resources
          </h2>
          <UButton
            :to="localePath('/submit/resource')"
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="xs"
          />
        </div>
        <ul
          v-if="data?.resources.length"
          class="space-y-2"
        >
          <li
            v-for="r in data.resources"
            :key="r.id"
            class="flex items-center justify-between gap-2 text-sm"
          >
            <span class="truncate text-default">{{ r.title }}</span>
            <UBadge
              :color="statusColor(r.status)"
              variant="subtle"
              class="shrink-0 capitalize"
            >
              {{ r.status }}
            </UBadge>
          </li>
        </ul>
        <p
          v-else
          class="py-6 text-center text-sm text-muted"
        >
          You haven't submitted any resources.
        </p>
      </UPageCard>

      <!-- My projects -->
      <UPageCard
        class="lg:col-span-2"
        :ui="{ body: 'space-y-4' }"
      >
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-layout-dashboard"
              class="size-5 text-primary"
            />
            My projects
          </h2>
          <UButton
            :to="localePath('/submit/project')"
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="xs"
          />
        </div>
        <ul
          v-if="data?.projects.length"
          class="space-y-2"
        >
          <li
            v-for="p in data.projects"
            :key="p.id"
            class="flex items-center justify-between gap-2 text-sm"
          >
            <span class="truncate text-default">{{ p.title }}</span>
            <UBadge
              :color="statusColor(p.status)"
              variant="subtle"
              class="shrink-0 capitalize"
            >
              {{ p.status }}
            </UBadge>
          </li>
        </ul>
        <p
          v-else
          class="py-6 text-center text-sm text-muted"
        >
          You haven't submitted any projects yet.
          <NuxtLink
            :to="localePath('/submit/project')"
            class="text-primary hover:underline"
          >Share your first dashboard →</NuxtLink>
        </p>
      </UPageCard>
    </div>
  </UContainer>
</template>
