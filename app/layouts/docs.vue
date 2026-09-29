<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const route = useRoute()

// The rail opens the section you are reading. Accordion state is only read on
// mount, so the nav is keyed on the section: crossing into another section
// re-opens the right one, while moving between lessons inside it does not
// remount anything.
const sectionKey = computed(() => {
  const segs = route.path.split('/').filter(Boolean)
  return segs.find(s => navigation?.value?.some(n => String(n.path).endsWith(`/${s}`))) ?? ''
})
</script>

<template>
  <UContainer>
    <!-- Hidden on mobile: the right rail (table of contents) renders first
         there, and should sit directly under the navbar with nothing between
         them. Desktop still gets the top banner above the two-column page. -->
    <AdUnit
      placement="headerBanner"
      class="mt-4 hidden lg:block"
    />

    <!-- The rail is widened from Nuxt UI's 2/10 columns to 3/10 and the body
         gives up the column; `.docs-grid` in main.css holds the arithmetic.
         A syllabus of ten modules and eighty lessons does not fit a 2/10 rail
         without truncating every second title, and a truncated lesson title in
         a course navigation is worse than a narrower page: the rail is how you
         know where you are. The body keeps 5/10, close to the design system's
         own reading measure of six columns in twelve, so prose is no worse off.

         The split lives in CSS rather than in Tailwind classes on the `ui`
         prop deliberately: those classes have to exist as compiled utilities,
         and `lg:col-span-3` is not one Nuxt UI's own theme ever emits, so
         passing it silently collapsed both columns to a single grid track. -->
    <UPage :ui="{ root: 'docs-grid' }">
      <template #left>
        <!-- Full-height rail, sticky under the header, scrolling inside
             itself. Nothing sits below the nav any more: the sponsor slot and
             the sponsor card used to be pinned to the bottom of this column,
             which cost the syllabus roughly a fifth of its height on a laptop
             and put an advert in the one part of the page a learner uses to
             navigate. Sponsorship still appears at the foot of each lesson and
             on /sponsor; it does not belong in the course rail. -->
        <nav
          class="lesson-rail hidden lg:block lg:-ms-3 lg:ps-3 lg:pe-2 lg:pb-8 lg:pt-6"
          aria-label="Course navigation"
        >
          <UContentNavigation
            :key="sectionKey"
            default-open
            highlight
            type="single"
            :navigation="navigation"
          />
        </nav>
      </template>

      <slot />
    </UPage>

    <AdUnit
      placement="footer"
      class="mb-8"
    />
  </UContainer>
</template>
