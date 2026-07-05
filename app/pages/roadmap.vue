<script setup lang="ts">
const title = 'Roadmap — CRM Analytics Academy'
const description = 'What we\'re building next for CRM Analytics Academy — now, next, and later.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const columns = [
  {
    key: 'now',
    label: 'In progress',
    icon: 'i-lucide-loader',
    color: 'text-primary',
    items: [
      'Installable PWA with offline support',
      'Mark-as-complete ticks in the sidebar',
      'Notification bell for comment replies'
    ]
  },
  {
    key: 'next',
    label: 'Up next',
    icon: 'i-lucide-arrow-right-circle',
    color: 'text-warning',
    items: [
      'Feedback widget on every page',
      'Interactive home page (analytics screen marquee)',
      '“Continue where you left off” for members',
      'More SAQL & Einstein Discovery lessons'
    ]
  },
  {
    key: 'later',
    label: 'Later',
    icon: 'i-lucide-sparkles',
    color: 'text-muted',
    items: [
      'Certificates for completed tracks',
      'Community Q&A / discussions',
      'Downloadable practice datasets & solutions',
      'Full translations across all 8 languages'
    ]
  }
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-14 text-center sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-map"
            class="mr-1 size-4"
          />
          Roadmap
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Where we're <span class="text-gradient">headed</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          The Academy is open source and always growing. Have an idea?
          <NuxtLink
            to="https://github.com/imswarnil/CRM-Analytics-Academy/issues"
            target="_blank"
            class="text-primary hover:underline"
          >Open an issue</NuxtLink>.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="col in columns"
          :key="col.key"
          class="rounded-2xl border border-default bg-elevated/30 p-6"
        >
          <h2 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              :name="col.icon"
              class="size-5"
              :class="col.color"
            />
            {{ col.label }}
          </h2>
          <ul class="space-y-3">
            <li
              v-for="item in col.items"
              :key="item"
              class="flex items-start gap-2.5 text-sm text-toned"
            >
              <UIcon
                name="i-lucide-circle-dot"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
