<script setup lang="ts">
useSeoMeta({
  title: 'Create an account',
  // A sign-in screen has no business in a search index, and indexing it
  // invites people to land here instead of on the curriculum.
  robots: 'noindex, nofollow'
})
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <AuthForm mode="sign-up" />
  </UContainer>
</template>
