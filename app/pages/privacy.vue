<script setup lang="ts">
const title = 'Privacy Policy — CRM Analytics Academy'
const description = 'How CRM Analytics Academy handles data, cookies, analytics, and advertising.'

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const sections = [
  {
    title: 'What we collect',
    body: 'We do not require an account or sign-up to read any lesson. We do not collect names, emails, or payment details. Pages you visit, your approximate location (country/region), device type, and referrer are collected automatically through the analytics and advertising tools described below.'
  },
  {
    title: 'Cookies & similar technologies',
    body: 'This site uses cookies and similar technologies for two purposes: understanding how the curriculum is used (analytics) and showing ads that help keep every lesson free (advertising). You can block or delete cookies in your browser settings at any time; the site will keep working, though personalized ads may stop.'
  },
  {
    title: 'Analytics',
    body: 'We use Vercel Analytics to see which pages are popular and where visitors come from. It is configured to avoid storing personally identifiable information.'
  },
  {
    title: 'Advertising — Google AdSense',
    body: 'We run Google AdSense to fund hosting and ongoing content development. Google and its partners may use cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this and other sites. You can opt out of personalized advertising by visiting Google\'s Ads Settings, or opt out of third-party vendor cookies generally by visiting www.aboutads.info.'
  },
  {
    title: 'Third-party links',
    body: 'Lessons link out to official Salesforce documentation, Trailhead, and other community resources. We are not responsible for the privacy practices of those external sites.'
  },
  {
    title: 'Children\'s privacy',
    body: 'This site is not directed at children under 13 and we do not knowingly collect data from them.'
  },
  {
    title: 'Your choices',
    body: 'You can browse this entire curriculum without enabling cookies. Most browsers let you block third-party cookies or clear them per-site. Disabling cookies may affect how ads are personalized but will not block access to any lesson.'
  },
  {
    title: 'Changes to this policy',
    body: 'This policy may be updated as the project evolves. Material changes will be reflected by an updated date on this page.'
  },
  {
    title: 'Contact',
    body: 'Questions about this policy? Open an issue on the project\'s GitHub repository.'
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
            name="i-lucide-shield-check"
            class="mr-1 size-4"
          />
          Privacy
        </UBadge>
        <h1 class="text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Privacy Policy
        </h1>
        <p class="mt-4 max-w-2xl text-lg text-muted">
          CRM Analytics Academy is a free curriculum, funded in part by advertising. Here is exactly what
          that means for your data.
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

          <AdUnit
            placement="betweenSections"
            class="mx-auto my-8 max-w-3xl"
          />
        </div>
      </UContainer>
    </section>
  </div>
</template>
