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
    class="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-colors"
    :class="done
      ? 'border-primary/40 bg-primary/5'
      : 'border-default bg-elevated/40'"
  >
    <ClientOnly>
      <UButton
        v-if="isSignedIn"
        :icon="done ? 'i-lucide-circle-check' : 'i-lucide-circle'"
        :color="done ? 'primary' : 'neutral'"
        :variant="done ? 'soft' : 'outline'"
        :label="done ? t('course.completed') : t('course.markComplete')"
        @click="toggle"
      />
      <p
        v-else
        class="text-sm text-muted"
      >
        <ULink :to="localePath('/sign-in')">
          {{ t('course.signIn') }}
        </ULink>
        {{ ' ' }}{{ t('course.signInToTrack') }}
      </p>

      <!-- Reserves the control's height during SSR. This block sits mid-page,
           so resolving the session must not shove the next-lesson button and
           everything below it down the page after paint. -->
      <template #fallback>
        <div class="h-8 w-40" />
      </template>
    </ClientOnly>

    <!-- The one solid button on a lesson page: NSDS allows exactly one, and
         "keep going" is the action the page exists to produce. -->
    <UButton
      v-if="next"
      :to="localePath(next.path)"
      trailing-icon="i-lucide-arrow-right"
      :label="t('course.nextLesson', { title: next.title })"
      class="max-w-full"
    />
  </div>
</template>
