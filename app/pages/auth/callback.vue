<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Signing you in...',
  description: 'Completing authentication'
})

const router = useRouter()
const user = useSupabaseUser()

watch(
  user,
  (val) => {
    if (val) {
      router.push('/dashboard')   // or wherever you want after OAuth/email confirm
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 py-16">
    <span class="i-lucide-loader-2 animate-spin text-3xl" />
    <p>Completing sign-in, please wait...</p>
  </div>
</template>
