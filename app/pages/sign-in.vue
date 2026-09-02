<script setup lang="ts">
useSeoMeta({
  title: 'Sign in',
  // An auth screen has no business in a search index, and indexing it invites
  // people to land here instead of on the curriculum.
  robots: 'noindex, nofollow'
})
</script>

<template>
  <!-- AuthForm centres its own card and carries its own padding, so the page
       adds no wrapper of its own. -->
  <AuthForm mode="sign-in" />
</template>
