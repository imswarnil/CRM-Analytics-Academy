<script setup lang="ts">
const props = defineProps<{ lessonPath: string }>()

const user = useSupabaseUser()
const client = useDb()
const localePath = useLocalePath()
const route = useRoute()

const completed = ref(false)
const busy = ref(false)

async function loadState() {
  if (!user.value) {
    completed.value = false
    return
  }
  const { data } = await client
    .from('lesson_progress')
    .select('lesson_path')
    .eq('user_id', user.value.id)
    .eq('lesson_path', props.lessonPath)
    .maybeSingle()
  completed.value = !!data
}

async function toggle() {
  if (!user.value || busy.value) return
  busy.value = true
  if (completed.value) {
    await client.from('lesson_progress').delete()
      .eq('user_id', user.value.id)
      .eq('lesson_path', props.lessonPath)
    completed.value = false
  } else {
    await client.from('lesson_progress')
      .upsert({ user_id: user.value.id, lesson_path: props.lessonPath })
    completed.value = true
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
