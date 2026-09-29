<script setup lang="ts">
const localePath = useLocalePath()
const title = 'Roadmap'
const description = 'Our vision for CRM Analytics Academy and what we\'re building next — now, next, and later.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const principles = [
  { icon: 'i-lucide-gift', title: 'Free, forever', text: 'The core course, exams and certificates stay free — funded by sponsors, ads and optional Pro.' },
  { icon: 'i-lucide-git-fork', title: 'Open source', text: 'The whole site is on GitHub. Anyone can fix a typo, add a lesson, or ship a feature.' },
  { icon: 'i-lucide-monitor-play', title: 'Build it, don\u2019t read it', text: 'Every hands-on lesson carries a screen walkthrough \u2014 what to click, and what is worth saying about it \u2014 plus a graded quiz.' },
  { icon: 'i-lucide-users', title: 'Built with the community', text: 'Resources, feedback, and the guestbook are yours. The best ideas ship first.' }
]

const columns = [
  {
    key: 'now',
    label: 'Shipped',
    icon: 'i-lucide-check-circle-2',
    color: 'text-white',
    ring: 'bg-(--signal)',
    items: [
      'Nineteen sections and 161 lessons, rewritten end to end',
      'Seventeen go-to-market builds on the Academy\u2019s own business data',
      'Screen walkthroughs on every hands-on lesson',
      'Downloadable practice datasets, with the true totals published'
    ]
  },
  {
    key: 'next',
    label: 'In progress',
    icon: 'i-lucide-loader',
    color: 'text-(--signal)',
    ring: 'bg-(--ice)',
    items: [
      'Recording the walkthrough scripts as video',
      'A browsable mirror of the org the builds are made in',
      'Showcase write-ups for adoption and AI-search dashboards',
      'Translations regenerating across the other eleven languages'
    ]
  },
  {
    key: 'later',
    label: 'Later',
    icon: 'i-lucide-sparkles',
    color: 'text-(--ink2)',
    ring: 'hatch bg-(--card)',
    items: [
      'Public learner profiles with earned certificates',
      'Community Q&A and curated learning paths',
      'Live cohort sessions & office hours'
    ]
  }
]
</script>

<template>
  <div>
    <section class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
      <UContainer class="relative py-14 text-center sm:py-20">
        <p class="eyebrow mb-5">
          Sheet 11 / Roadmap
        </p>
        <h1 class="mx-auto max-w-3xl bp-h1">
          Where we're <span class="text-gradient">headed</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl bp-lead">
          The Academy is open source and always growing. Have an idea?
          <NuxtLink
            to="https://github.com/imswarnil/CRM-Analytics-Academy/issues"
            target="_blank"
            class="text-(--signal) hover:underline"
          >Open an issue</NuxtLink>.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12">
        <!-- Left: vision -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <h2 class="flex items-center gap-2 text-lg font-bold text-(--ink)">
            <UIcon
              name="i-lucide-telescope"
              class="size-5 text-(--signal)"
            />
            Our vision
          </h2>
          <p class="mt-3 text-(--ink2)">
            Make world-class CRM Analytics skills accessible to <span class="font-medium text-(--ink)">anyone</span>, anywhere — a
            practitioner-grade path from your first dataset to production dashboards and Einstein Discovery, without a paywall.
          </p>
          <ul class="mt-6 space-y-4">
            <li
              v-for="p in principles"
              :key="p.title"
              class="flex gap-3"
            >
              <div class="flex size-9 shrink-0 items-center justify-center border-[1.5px] border-(--ink) bg-(--ice) text-(--signal) ">
                <UIcon
                  :name="p.icon"
                  class="size-4.5"
                />
              </div>
              <div>
                <p class="text-sm font-semibold text-(--ink)">
                  {{ p.title }}
                </p>
                <p class="mt-0.5 text-sm text-(--ink2)">
                  {{ p.text }}
                </p>
              </div>
            </li>
          </ul>
          <UButton
            to="https://github.com/imswarnil/CRM-Analytics-Academy"
            target="_blank"
            icon="i-simple-icons-github"
            color="neutral"
            variant="outline"
            class="mt-6 font-medium"
          >
            Star us on GitHub
          </UButton>
        </aside>

        <!-- Right: now / next / later -->
        <div class="space-y-6">
          <div
            v-for="col in columns"
            :key="col.key"
            class="border-[1.5px] border-(--ink) bg-(--card) p-6"
          >
            <h3 class="mb-4 flex items-center gap-3 text-lg font-extrabold tracking-[-0.02em] text-(--ink)">
              <span
                class="flex size-8 items-center justify-center border-[1.5px] border-(--ink)"
                :class="col.ring"
              >
                <UIcon
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
                class="flex items-start gap-2.5 border border-dashed border-(--line) bg-(--card) p-3 text-sm text-(--ink2)"
              >
                <UIcon
                  name="i-lucide-circle-dot"
                  class="mt-0.5 size-4 shrink-0 text-(--ink2)"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <p class="text-center text-sm text-(--ink2)">
            Shipped already? See the
            <NuxtLink
              :to="localePath('/changelog')"
              class="text-(--signal) hover:underline"
            >changelog →</NuxtLink>
          </p>
        </div>
      </div>

      <PromoSlot
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
