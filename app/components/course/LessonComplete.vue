<script setup lang="ts">
/**
 * The mark-complete control at the foot of a lesson, plus the jump to the next
 * one. Completing and continuing are the same gesture for most learners, so
 * the two sit together and completing does not navigate away by itself —
 * someone who wants to re-read the summary should not be thrown forward.
 */
const route = useRoute()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { isDone, setDone } = useProgress()
const { next } = useCourse()

const done = computed(() => isDone(route.path))

async function toggle() {
  await setDone(route.path, !done.value)
}
</script>

<template>
  <div class="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-default bg-elevated/40 p-4">
    <template v-if="isSignedIn">
      <UButton
        :icon="done ? 'i-lucide-circle-check' : 'i-lucide-circle'"
        :color="done ? 'primary' : 'neutral'"
        :variant="done ? 'soft' : 'outline'"
        :label="done ? 'Completed' : 'Mark as complete'"
        @click="toggle"
      />
    </template>
    <template v-else>
      <p class="text-sm text-muted">
        <ULink :to="localePath('/sign-in')">
          Sign in
        </ULink>
        to track your progress.
      </p>
    </template>

    <UButton
      v-if="next"
      :to="localePath(next.path)"
      trailing-icon="i-lucide-arrow-right"
      :label="`Next: ${next.title}`"
      class="max-w-full"
    />
  </div>
</template>
