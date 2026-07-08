<script setup lang="ts">
// Slim, site-wide sponsor strip shown under the header on every page.
// The sponsor link is marked rel="sponsored" (honest + SEO-correct), and the
// second link invites others to take a (currently demo) placement.
const localePath = useLocalePath()
</script>

<template>
  <aside class="border-b border-default bg-primary/5">
    <UContainer class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-sm">
      <a
        href="https://www.namastesalesforce.com/"
        target="_blank"
        rel="sponsored noopener"
        class="group inline-flex items-center gap-2 font-medium text-highlighted hover:text-primary"
      >
        <span class="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          Sponsored
        </span>
        <UIcon
          name="i-lucide-sparkles"
          class="size-4 shrink-0 text-primary"
        />
        <span>Namaste Salesforce — learn Salesforce the friendly way</span>
        <UIcon
          name="i-lucide-arrow-up-right"
          class="size-3.5 shrink-0 text-dimmed transition group-hover:text-primary"
        />
      </a>

      <span class="hidden text-dimmed sm:inline">·</span>

      <NuxtLink
        :to="localePath('/sponsor')"
        class="text-xs text-muted transition hover:text-primary"
      >
        Your business here? This spot is a demo — promote with us →
      </NuxtLink>
    </UContainer>
  </aside>
</template>
