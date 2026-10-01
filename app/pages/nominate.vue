<script setup lang="ts">
/**
 * Wall of Fame nominations. A nomination is a lead of type `nomination`: it
 * is reviewed in the admin console and, if accepted, the person is added to
 * the wall by hand.
 */
const title = 'Nominate someone for the Wall of Fame'
const description = 'Know a CRM Analytics builder who shipped something great — a dashboard, a talk, a lesson or help in the community? Nominate them for the Academy\'s Wall of Fame.'
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })
usePageSchema({ name: title, description, type: 'WebPage', trail: [{ name: 'Wall of Fame', path: '/wall-of-fame' }] })

const localePath = useLocalePath()
const criteria = [
  { icon: 'i-lucide-layout-dashboard', text: 'Built something people use — a dashboard, an app, a recipe others copied.' },
  { icon: 'i-lucide-megaphone', text: 'Taught it — a talk, a post, a video, a lesson here.' },
  { icon: 'i-lucide-hand-heart', text: 'Helped others — answers in the community, mentoring, reviews.' },
  { icon: 'i-lucide-user-round-check', text: 'Self-nominations are welcome. Tell us what you shipped.' }
]
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 23 / Nominate"
      title="Put a builder on the wall"
      lead="The Wall of Fame is for the people who make CRM Analytics better for everyone else. Tell us who, and what they did."
    />

    <div class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <p class="eyebrow">
            Fig. 01 — What counts
          </p>
          <ul class="mt-6 grid gap-3">
            <li
              v-for="c in criteria"
              :key="c.text"
              class="flex gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4 text-(--ink)"
            >
              <UIcon
                :name="c.icon"
                class="mt-0.5 size-5 flex-none text-(--signal)"
              />
              {{ c.text }}
            </li>
          </ul>
          <UButton
            :to="localePath('/wall-of-fame')"
            color="neutral"
            variant="outline"
            icon="i-lucide-award"
            class="mt-6"
          >
            See the Wall of Fame
          </UButton>
        </div>
        <div class="lg:col-span-3">
          <LeadForm type="nomination" />
        </div>
      </div>
    </div>
  </div>
</template>
