<script setup lang="ts">
// OAuth callback landing page. The Supabase client (detectSessionInUrl) exchanges
// the ?code in the URL for a session automatically; we just wait for the user to
// appear, then forward to the intended destination.
const user = useSupabaseUser()
const route = useRoute()
const localePath = useLocalePath()

useSeoMeta({ title: 'Signing you in…', robots: 'noindex' })

const target = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : localePath('/dashboard')
})

watchEffect(() => {
  if (user.value) navigateTo(target.value, { replace: true })
})

// Fallback: if no session materialises, send the user back to login.
onMounted(() => {
  setTimeout(() => {
    if (!user.value) navigateTo(localePath('/login'), { replace: true })
  }, 6000)
})
</script>

<template>
  <UContainer class="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
    <UIcon
      name="i-lucide-loader-circle"
      class="size-8 animate-spin text-primary"
    />
    <p class="text-sm text-muted">
      Signing you in…
    </p>
  </UContainer>
</template>
