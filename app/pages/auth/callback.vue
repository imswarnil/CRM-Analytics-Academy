<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Signing you in…',
  description: 'Finishing authentication'
})

const user = useSupabaseUser()

onMounted(async () => {
  // Supabase will already have set the session if everything went well.
  // Just wait a bit for the client to hydrate and redirect.
  const stop = watch(user, async (val) => {
    if (val) {
      stop()
      await navigateTo('/dashboard')
    }
  }, { immediate: true })
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <div class="animate-pulse text-lg font-medium">
      Finishing sign-in…
    </div>
    <p class="text-sm text-neutral-500">
      You will be redirected in a moment.
    </p>
  </div>
</template>
