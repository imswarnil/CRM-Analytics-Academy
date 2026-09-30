<script setup lang="ts">
/**
 * Classroom training at the Academy's centers.
 *
 * The centers are the fictional business the course's go-to-market builds
 * model — enrollments, seats, utilisation and completion all come from them —
 * and this page is that business's storefront. The notice under the header
 * says so, because the form is real and a person filling it in must not come
 * away believing they hold a confirmed seat in a building that does not exist.
 */
const title = 'Classroom training'
const description = 'Instructor-led CRM Analytics programmes, in person and live online: foundations, dashboards and SAQL, go-to-market analytics and a certification bootcamp.'
// Hand-written English, so one copy: twelve locale copies of an untranslated
// page add prerender weight (the build runs near its heap limit) and nothing
// a reader can use.
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

usePageSchema({
  name: title,
  description,
  type: 'WebPage',
  extra: [{
    '@type': 'Service',
    'name': title,
    'description': description,
    'serviceType': 'Salesforce CRM Analytics classroom training',
    'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
    'areaServed': 'Worldwide',
    'url': `${SITE.url}/training`
  }]
})

const programmes = [
  { key: 'CRM Analytics Foundations (5 days)', title: 'Foundations', days: 5, icon: 'i-lucide-blocks', level: 'Beginner', price: '$1,450', blurb: 'Access and security, data prep, datasets and grain, your first lens and dashboard.' },
  { key: 'Dashboards & SAQL (5 days)', title: 'Dashboards & SAQL', days: 5, icon: 'i-lucide-code-xml', level: 'Intermediate', price: '$1,650', blurb: 'Dashboard design, interactions, bindings, SAQL and the dashboard JSON underneath.' },
  { key: 'Go-to-Market Analytics (10 days)', title: 'Go-to-Market Analytics', days: 10, icon: 'i-lucide-trending-up', level: 'Advanced', price: '$2,900', blurb: 'Seventeen revenue dashboards — demand, pipeline, retention — built on one company\'s data.' },
  { key: 'Certification bootcamp (3 days)', title: 'Certification bootcamp', days: 3, icon: 'i-lucide-award', level: 'Exam prep', price: '$890', blurb: 'The Consultant exam outline, timed practice and a review of every weak area.' }
]

const centers = [
  { city: 'Bengaluru', region: 'APAC', address: 'Indiranagar', seats: 32, icon: 'i-lucide-building-2' },
  { city: 'Pune', region: 'APAC', address: 'Baner', seats: 24, icon: 'i-lucide-building-2' },
  { city: 'Hyderabad', region: 'APAC', address: 'HITEC City', seats: 28, icon: 'i-lucide-building-2' },
  { city: 'London', region: 'EMEA', address: 'Shoreditch', seats: 20, icon: 'i-lucide-building-2' },
  { city: 'Austin', region: 'AMER', address: 'East Austin', seats: 20, icon: 'i-lucide-building-2' },
  { city: 'Live online', region: 'Global', address: 'Every timezone', seats: 40, icon: 'i-lucide-video' }
]

const preset = reactive<Record<string, string>>({})
function choose(key: 'track' | 'center', value: string) {
  preset[key] = value
  document.getElementById('enroll')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 08 / Classroom"
      title="Learn CRM Analytics in a room, with an instructor and an org of your own"
      lead="The same curriculum as the free online course, taught over one to two weeks in small batches. Every seat comes with a configured practice org and the course datasets loaded."
    >
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          to="#enroll"
          size="lg"
          icon="i-lucide-ticket"
        >
          Reserve a seat
        </UButton>
        <UButton
          to="/teams"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-users"
        >
          Training a team?
        </UButton>
      </div>

      <div class="mt-10 flex max-w-3xl gap-3 border-[1.5px] border-dashed border-(--ink) bg-(--card) p-4">
        <UIcon
          name="i-lucide-info"
          class="mt-0.5 size-4 flex-none text-(--signal)"
        />
        <div class="text-sm">
          <p class="font-bold text-(--ink)">
            These centers are the course's worked example
          </p>
          <p class="mt-1 text-(--ink2)">
            CRM Analytics Academy's classroom business is the fictional company the go-to-market dashboards are built on. Requests sent here are received and answered, but no batch, seat or payment is confirmed through this page.
          </p>
        </div>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <!-- Programmes -->
      <p class="eyebrow">
        Fig. 01 — Programmes
      </p>
      <h2 class="bp-h2 mt-3">
        Four programmes, one path
      </h2>

      <div class="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(p, n) in programmes"
          :key="p.key"
          class="bp-card bp-card--hover flex flex-col p-5"
        >
          <div class="flex items-center justify-between">
            <span class="bp-iconbox">
              <UIcon
                :name="p.icon"
                class="size-5"
              />
            </span>
            <span class="border-[1.5px] border-(--ink) px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]">{{ p.level }}</span>
          </div>
          <p class="mono-label mt-4">
            P-0{{ n + 1 }}
          </p>
          <h3 class="mt-1 text-lg font-extrabold tracking-[-0.02em] text-(--ink)">
            {{ p.title }}
          </h3>
          <p class="mt-1.5 flex-1 text-sm text-(--ink2)">
            {{ p.blurb }}
          </p>
          <div class="mt-5 flex items-end justify-between border-t border-dashed border-(--line) pt-4">
            <div>
              <p class="text-2xl font-black tracking-[-0.03em] text-(--ink)">
                {{ p.price }}
              </p>
              <p class="font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
                {{ p.days }} days · per seat
              </p>
            </div>
            <UButton
              size="sm"
              trailing-icon="i-lucide-arrow-right"
              @click="choose('track', p.key)"
            >
              Enroll
            </UButton>
          </div>
        </article>
      </div>

      <!-- Centers -->
      <div class="mt-20">
        <p class="eyebrow">
          Fig. 02 — Training centers
        </p>
        <h2 class="bp-h2 mt-3">
          Five cities and a live-online room
        </h2>

        <div class="mt-8 grid border-s-[1.5px] border-t-[1.5px] border-(--ink) sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="c in centers"
            :key="c.city"
            type="button"
            class="flex items-center gap-4 border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-4 text-start transition-colors hover:bg-(--ice)"
            @click="choose('center', c.city)"
          >
            <span class="bp-iconbox">
              <UIcon
                :name="c.icon"
                class="size-5"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-extrabold text-(--ink)">{{ c.city }}</span>
              <span class="block text-sm text-(--ink2)">{{ c.address }} · {{ c.region }}</span>
            </span>
            <span class="text-end">
              <span class="block text-xl font-black text-(--ink)">{{ c.seats }}</span>
              <span class="block font-mono text-[10px] uppercase text-(--ink2)">seats</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Enroll -->
      <div
        id="enroll"
        class="mt-20 grid scroll-mt-24 gap-10 lg:grid-cols-5"
      >
        <div class="lg:col-span-2">
          <p class="eyebrow">
            Fig. 03 — Enrollment
          </p>
          <h2 class="bp-h2 mt-3">
            Reserve a seat
          </h2>
          <p class="bp-lead mt-4">
            Pick a programme and a center. Batches start when a room reaches eight seats; you
            hear from the center before anything is confirmed.
          </p>
          <ul class="mt-6 space-y-3 text-sm text-(--ink)">
            <li
              v-for="item in ['A practice org per seat, datasets preloaded', 'Maximum 16 learners per instructor', 'Every lesson stays free online afterwards', 'Certificate of completion on the final build']"
              :key="item"
              class="flex gap-2.5"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-(--signal)"
              />
              {{ item }}
            </li>
          </ul>
        </div>
        <div class="lg:col-span-3">
          <InquiryForm
            kind="enrollment"
            :preset="preset"
          />
        </div>
      </div>
    </div>
  </div>
</template>
