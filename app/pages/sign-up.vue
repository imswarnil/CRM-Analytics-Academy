<script setup lang="ts">
useSeoMeta({
  title: 'Create an account',
  // An auth screen has no business in a search index, and indexing it invites
  // people to land here instead of on the curriculum.
  robots: 'noindex, nofollow'
})
</script>

<template>
  <!-- Full-bleed: AuthForm is a two-column split and a width cap around it
       would leave the brand panel floating in a gutter. -->
  <AuthForm mode="sign-up" />
</template>
