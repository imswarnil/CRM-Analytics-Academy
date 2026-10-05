<script setup lang="ts">
/**
 * The mark-complete control at the foot of a lesson, plus the jump to the next
 * one. Completing and continuing are the same gesture for most learners, so
 * the two sit together — and completing deliberately does not navigate by
 * itself, because someone who wants to re-read the summary should not be
 * thrown forward by ticking a box.
 */
const route = useRoute()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { isDone, setDone } = useProgress()
const { next } = useCourse()
const { t } = useI18n()

const done = computed(() => isDone(route.path))

async function toggle() {
  await setDone(route.path, !done.value)
}
</script>

<template>
  <div
    class="mt-12 flex flex-wrap items-center justify-between gap-4 border-[1.5px] border-(--ink) p-4 transition-colors"
    :class="done ? 'bg-(--ice)' : 'graph-paper-fine bg-(--card)'"
  >
    <ClientOnly>
      <UButton
        v-if="isSignedIn"
        :icon="done ? 'i-lucide-check-check' : 'i-lucide-check'"
        :color="done ? 'secondary' : 'neutral'"
        :variant="done ? 'solid' : 'outline'"
        :label="done ? t('course.completed') : t('course.markComplete')"
        @click="toggle"
      />
      <p
        v-else
        class="text-sm text-(--ink2)"
      >
        <ULink
          :to="{ path: localePath('/sign-in'), query: { redirect: $route.fullPath } }"
          class="font-semibold text-(--signal)"
        >
          {{ t('course.signIn') }}
        </ULink>
        {{ ' ' }}{{ t('course.signInToTrack') }}
      </p>

      <!-- Reserves the control's height during SSR, so resolving the session
           does not shove everything below it down the page after paint. -->
      <template #fallback>
        <div class="h-8 w-40" />
      </template>
    </ClientOnly>

    <UButton
      v-if="next"
      :to="localePath(next.path)"
      trailing-icon="i-lucide-arrow-right"
      :label="t('course.nextLesson', { title: next.title })"
      class="max-w-full"
    />
  </div>
</template>
