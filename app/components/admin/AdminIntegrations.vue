<script setup lang="ts">
/**
 * /admin → Integrations: the GTM stack, and whether each piece is switched on.
 *
 * Every tool here collects its own data from the browser or its own crawler —
 * none of them costs the Worker a request. The site's part is small and
 * static: a beacon token, a verification meta tag, UTM tags on shared links,
 * the first-touch source captured at sign-up and sent to Salesforce.
 */
const { public: pub } = useRuntimeConfig()

interface Tool {
  name: string
  icon: string
  what: string
  on: boolean
  how: string
  to: string
}
const TOOLS = computed<Tool[]>(() => [
  {
    name: 'Cloudflare Web Analytics',
    icon: 'i-simple-icons-cloudflare',
    what: 'Traffic, pages, referrers, countries, Core Web Vitals. Cookieless, no Worker requests.',
    on: Boolean(pub.cfBeaconToken),
    how: 'Set NUXT_PUBLIC_CF_BEACON_TOKEN (Cloudflare → Web Analytics → add site → copy the token).',
    to: 'https://dash.cloudflare.com/?to=/:account/web-analytics'
  },
  {
    name: 'Google Search Console',
    icon: 'i-simple-icons-googlesearchconsole',
    what: 'Search queries, impressions, clicks, indexing. The sitemap is /sitemap_index.xml.',
    on: Boolean(pub.gscVerification),
    how: 'Domain property is verified by DNS; for a URL-prefix property set NUXT_PUBLIC_GSC_VERIFICATION.',
    to: 'https://search.google.com/search-console'
  },
  {
    name: 'Source tagging (UTM)',
    icon: 'i-lucide-tags',
    what: 'Every share link carries utm_source/utm_medium. A visitor\'s first source is kept in their browser and attached to their sign-up and to any lead.',
    on: true,
    how: 'Built in. Tag your own links: ?utm_source=linkedin&utm_medium=post&utm_campaign=<name>.',
    to: '/admin?tab=leads'
  },
  {
    name: 'Salesforce (Web-to-Lead)',
    icon: 'i-simple-icons-salesforce',
    what: 'Sign-ups, purchases and "talk to us" requests become Leads with their source, in your org.',
    on: true,
    how: 'Built in; field ids live in LEAD_FIELDS (server/utils/salesforce.ts).',
    to: 'https://login.salesforce.com/'
  },
  {
    name: 'Google AdSense',
    icon: 'i-simple-icons-googleadsense',
    what: 'Ads for free learners only; Pro members never see one.',
    on: true,
    how: 'Client id in nuxt.config.ts; units in app/utils/promo.ts.',
    to: 'https://adsense.google.com/'
  },
  {
    name: 'Stripe',
    icon: 'i-simple-icons-stripe',
    what: 'Pro Monthly and Pro Lifetime checkouts, the customer portal and the webhook.',
    on: true,
    how: 'pnpm stripe:setup --webhook, then STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET on the Worker.',
    to: 'https://dashboard.stripe.com/'
  },
  {
    name: 'Channel conversations',
    icon: 'i-lucide-messages-square',
    what: 'Where learners talk to you: YouTube comments, LinkedIn, GitHub discussions. Reply there; nothing is pulled into the site.',
    on: true,
    how: 'Links below; tag every link you post so it shows up in sources.',
    to: 'https://studio.youtube.com/channel/comments'
  }
])
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <article
      v-for="tool in TOOLS"
      :key="tool.name"
      class="flex flex-col rounded-[6px] border border-(--line) bg-(--card) p-5"
    >
      <div class="flex items-center gap-3">
        <span class="flex size-9 items-center justify-center rounded-[6px] bg-(--ice) text-(--signal)">
          <UIcon
            :name="tool.icon"
            class="size-5"
          />
        </span>
        <h3 class="flex-1 font-semibold text-(--ink)">
          {{ tool.name }}
        </h3>
        <span
          class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em]"
          :class="tool.on ? 'bg-success/10 text-success' : 'bg-(--paper) text-(--ink2)'"
        >{{ tool.on ? 'On' : 'Off' }}</span>
      </div>
      <p class="mt-3 text-sm text-(--ink2)">
        {{ tool.what }}
      </p>
      <p class="mt-2 text-xs text-(--label)">
        {{ tool.how }}
      </p>
      <UButton
        :to="tool.to"
        :target="tool.to.startsWith('http') ? '_blank' : undefined"
        size="sm"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-arrow-up-right"
        class="mt-4 self-start"
      >
        Open
      </UButton>
    </article>
  </div>
</template>
