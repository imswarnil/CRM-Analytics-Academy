<script setup lang="ts">
definePageMeta({
  // Auth-gated and personal: never prerendered, never cached, never indexed.
  // The real enforcement is server-side on every /api/progress call — this
  // only decides what the browser draws.
  middleware: 'auth'
})

const { user } = useAuth()
const localePath = useLocalePath()

useSeoMeta({
  title: 'Dashboard',
  robots: 'noindex, nofollow'
})

const { data: progress } = await useLazyAsyncData('progress', () =>
  $fetch<{ completed: string[], pro: boolean }>('/api/progress'), {
  server: false,
  default: () => ({ completed: [] as string[], pro: false })
})

// The denominator comes from the curriculum tree the sidebar already loaded,
// not from the API — the client can count it for free.
const { lessons } = useCourse()

const done = computed(() => progress.value?.completed?.length ?? 0)
const total = computed(() => lessons.value.length)
const percent = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0))
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-widest text-primary">
        Dashboard
      </p>
      <h1 class="mt-1 text-3xl font-bold text-highlighted">
        {{ user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back' }}
      </h1>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <UCard class="lg:col-span-2">
        <template #header>
          <p class="font-semibold text-highlighted">
            Your progress
          </p>
        </template>

        <div class="flex items-center gap-6">
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex items-baseline justify-between">
              <span class="text-sm text-muted">{{ done }} of {{ total }} lessons</span>
              <span class="font-mono text-sm font-bold text-highlighted">{{ percent }}%</span>
            </div>
            <UProgress
              :model-value="percent"
              :max="100"
            />
          </div>
        </div>

        <template #footer>
          <UButton
            :to="localePath('/foundations')"
            trailing-icon="i-lucide-arrow-right"
            label="Continue learning"
          />
        </template>
      </UCard>

      <UCard>
        <template #header>
          <p class="font-semibold text-highlighted">
            Access
          </p>
        </template>

        <div class="flex items-center gap-3">
          <UIcon
            :name="progress?.pro ? 'i-lucide-badge-check' : 'i-lucide-lock'"
            class="size-6"
            :class="progress?.pro ? 'text-primary' : 'text-muted'"
          />
          <div>
            <p class="font-medium text-highlighted">
              {{ progress?.pro ? 'Pro' : 'Free' }}
            </p>
            <p class="text-sm text-muted">
              {{ progress?.pro
                ? 'Every lesson and project is unlocked.'
                : 'Core lessons are free forever.' }}
            </p>
          </div>
        </div>

        <template
          v-if="!progress?.pro"
          #footer
        >
          <UButton
            :to="localePath('/pro')"
            variant="subtle"
            block
            label="See what Pro adds"
          />
        </template>
      </UCard>
    </div>
  </UContainer>
</template>
