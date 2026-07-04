<script setup lang="ts">
const props = defineProps<{ lessonPath: string }>()

const user = useSupabaseUser()
const localePath = useLocalePath()
const route = useRoute()
const toast = useToast()

const completed = ref(false)
const busy = ref(false)

// All authed progress goes through server routes (the browser client can arrive
// unauthenticated; the server reliably has the session cookie).
async function loadState() {
  if (!user.value) {
    completed.value = false
    return
  }
  try {
    const { paths } = await $fetch<{ paths: string[] }>('/api/progress')
    completed.value = paths.includes(props.lessonPath)
  } catch {
    completed.value = false
  }
}

async function toggle() {
  if (!user.value || busy.value) return
  busy.value = true
  const wasComplete = completed.value
  try {
    const res = await $fetch<{ done: boolean }>('/api/progress', {
      method: 'POST',
      body: { lessonPath: props.lessonPath, done: !wasComplete }
    })
    completed.value = res.done
    if (res.done) {
      toast.add({ title: 'Marked complete', color: 'success', icon: 'i-lucide-check' })
    }
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({
      title: 'Could not save your progress',
      description: err?.data?.statusMessage || err?.statusMessage || 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle'
    })
  }
  busy.value = false
}

watch(user, loadState, { immediate: true })
</script>

<template>
  <ClientOnly>
    <div class="not-prose my-8 flex items-center justify-between gap-3 rounded-xl border border-default bg-elevated/40 px-4 py-3">
      <div class="flex items-center gap-2.5">
        <UIcon
          :name="completed ? 'i-lucide-circle-check-big' : 'i-lucide-circle-dashed'"
          class="size-5"
          :class="completed ? 'text-success' : 'text-muted'"
        />
        <span class="text-sm font-medium text-default">
          {{ completed ? 'Lesson complete' : 'Finished this lesson?' }}
        </span>
      </div>

      <UButton
        v-if="user"
        :color="completed ? 'success' : 'primary'"
        :variant="completed ? 'soft' : 'solid'"
        size="sm"
        :loading="busy"
        :icon="completed ? 'i-lucide-check' : undefined"
        @click="toggle"
      >
        {{ completed ? 'Completed' : 'Mark as complete' }}
      </UButton>

      <UButton
        v-else
        :to="localePath('/login') + `?redirect=${encodeURIComponent(route.fullPath)}`"
        color="primary"
        variant="subtle"
        size="sm"
        icon="i-lucide-log-in"
      >
        Sign in to track
      </UButton>
    </div>
  </ClientOnly>
</template>
