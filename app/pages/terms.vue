<script setup lang="ts">
const title = 'Terms of Service — CRM Analytics Academy'
const description = 'The terms for using the CRM Analytics Academy curriculum.'

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const sections = [
  {
    title: 'Using this site',
    body: 'CRM Analytics Academy is a free, educational curriculum about Salesforce CRM Analytics. You may read, copy code snippets, and follow along in your own Salesforce org for personal or commercial learning purposes.'
  },
  {
    title: 'Not an official Salesforce product',
    body: 'This is an independent, community-built learning resource. It is not affiliated with, endorsed by, or sponsored by Salesforce, Inc. "Salesforce" and "CRM Analytics" are trademarks of Salesforce, Inc., used here for identification purposes only.'
  },
  {
    title: 'Content license',
    body: 'Lesson content lives in a public, open-source repository. See the repository\'s license file for the exact terms governing reuse and contributions.'
  },
  {
    title: 'No warranty',
    body: 'Lessons are provided "as is," without warranty of any kind. SAQL examples, recipes, and configuration steps are illustrative — always validate changes in a sandbox or Developer org before applying them to production data.'
  },
  {
    title: 'Advertising',
    body: 'This site is partly funded by Google AdSense. Ads are served by Google and its partners and are not endorsements by CRM Analytics Academy. See our Privacy Policy for details on how ad-related data is handled.'
  },
  {
    title: 'Limitation of liability',
    body: 'CRM Analytics Academy and its maintainers are not liable for any loss or damage arising from the use of this site or reliance on its content.'
  },
  {
    title: 'Changes to these terms',
    body: 'These terms may be updated as the project evolves. Continued use of the site after a change constitutes acceptance of the updated terms.'
  },
  {
    title: 'Contact',
    body: 'Questions about these terms? Open an issue on the project\'s GitHub repository.'
  }
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <UContainer class="relative py-16 sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-file-text"
            class="mr-1 size-4"
          />
          Legal
        </UBadge>
        <h1 class="text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Terms of Service
        </h1>
        <p class="mt-4 max-w-2xl text-lg text-muted">
          The ground rules for using this free curriculum.
        </p>
      </UContainer>
    </section>

    <section class="py-16 sm:py-20">
      <UContainer>
        <div class="mx-auto max-w-3xl space-y-10">
          <div
            v-for="s in sections"
            :key="s.title"
          >
            <h2 class="text-xl font-bold text-highlighted">
              {{ s.title }}
            </h2>
            <p class="mt-2 text-muted">
              {{ s.body }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
