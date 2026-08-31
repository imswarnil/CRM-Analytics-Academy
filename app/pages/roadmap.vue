<script setup lang="ts">
const localePath = useLocalePath()
const title = 'Roadmap — CRM Analytics Academy'
const description = 'Our vision for CRM Analytics Academy and what we\'re building next — now, next, and later.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const principles = [
  { icon: 'i-lucide-gift', title: 'Free, forever', text: 'Every lesson, exam, and certificate stays free — funded by ads and sponsors, never paywalls.' },
  { icon: 'i-lucide-git-fork', title: 'Open source', text: 'The whole site is on GitHub. Anyone can fix a typo, add a lesson, or ship a feature.' },
  { icon: 'i-lucide-video', title: 'Learn by watching + doing', text: 'Short video clips paired with hands-on steps and graded exams — not walls of text.' },
  { icon: 'i-lucide-users', title: 'Built with the community', text: 'Resources, feedback, and the guestbook are yours. The best ideas ship first.' }
]

const columns = [
  {
    key: 'now',
    label: 'In progress',
    icon: 'i-lucide-loader',
    color: 'text-primary',
    ring: 'ring-primary/20',
    items: [
      'More SAQL & Einstein Discovery video lessons',
      '“Continue where you left off” for members',
      'Notification bell for comment replies'
    ]
  },
  {
    key: 'next',
    label: 'Up next',
    icon: 'i-lucide-arrow-right-circle',
    color: 'text-warning',
    ring: 'ring-warning/20',
    items: [
      'Public learner profiles with earned certificates',
      'Community Q&A / discussions',
      'Downloadable practice datasets & solutions',
      'Resource collections & curated learning paths'
    ]
  },
  {
    key: 'later',
    label: 'Later',
    icon: 'i-lucide-sparkles',
    color: 'text-muted',
    ring: 'ring-default',
    items: [
      'Full translations across all 8 languages',
      'Live cohort sessions & office hours',
      'A companion mobile experience'
    ]
  }
]
</script>

<template>
  <div>
    <PageHero
      eyebrow="Roadmap"
      icon="i-lucide-map"
    >
      <template #title>
        Where we're <span class="text-marker">headed</span>
      </template>
      <template #description>
        The Academy is open source and always growing. Have an idea?
        <NuxtLink
          to="https://github.com/imswarnil/CRM-Analytics-Academy/issues"
          target="_blank"
          class="text-primary hover:underline"
        >Open an issue</NuxtLink>.
      </template>
    </PageHero>

    <div class="shell py-12 sm:py-16">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12">
        <!-- Left: vision -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <h2 class="flex items-center gap-2 text-lg font-bold text-highlighted">
            <Icon
              name="i-lucide-telescope"
              class="size-5 text-primary"
            />
            Our vision
          </h2>
          <p class="mt-3 text-muted">
            Make world-class CRM Analytics skills accessible to <span class="font-medium text-default">anyone</span>, anywhere — a
            practitioner-grade path from your first dataset to production dashboards and Einstein Discovery, without a paywall.
          </p>
          <ul class="mt-6 space-y-4">
            <li
              v-for="p in principles"
              :key="p.title"
              class="flex gap-3"
            >
              <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon
                  :name="p.icon"
                  class="size-4.5"
                />
              </div>
              <div>
                <p class="text-sm font-semibold text-highlighted">
                  {{ p.title }}
                </p>
                <p class="mt-0.5 text-sm text-muted">
                  {{ p.text }}
                </p>
              </div>
            </li>
          </ul>
          <UiButton
            variant="secondary"
            to="https://github.com/imswarnil/CRM-Analytics-Academy"
            target="_blank"
            icon="i-simple-icons-github"
            class="mt-6 rounded-full font-medium"
          >
            Star us on GitHub
          </UiButton>
        </aside>

        <!-- Right: now / next / later -->
        <div class="space-y-6">
          <div
            v-for="col in columns"
            :key="col.key"
            class="rounded-2xl border border-default bg-elevated/30 p-6"
          >
            <h3 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
              <span
                class="flex size-8 items-center justify-center rounded-lg bg-default ring-1"
                :class="col.ring"
              >
                <Icon
                  :name="col.icon"
                  class="size-4.5"
                  :class="col.color"
                />
              </span>
              {{ col.label }}
            </h3>
            <ul class="grid gap-3 sm:grid-cols-2">
              <li
                v-for="item in col.items"
                :key="item"
                class="flex items-start gap-2.5 rounded-xl border border-default/60 bg-default/50 p-3 text-sm text-toned"
              >
                <Icon
                  name="i-lucide-circle-dot"
                  class="mt-0.5 size-4 shrink-0 text-dimmed"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <p class="text-center text-sm text-muted">
            Shipped already? See the
            <NuxtLink
              :to="localePath('/changelog')"
              class="text-primary hover:underline"
            >changelog →</NuxtLink>
          </p>
        </div>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </div>
  </div>
</template>
