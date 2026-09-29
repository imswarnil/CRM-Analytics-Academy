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
const description = 'Instructor-led CRM Analytics programmes at the Academy\'s training centers and live online: foundations, dashboards and SAQL, go-to-market analytics and a certification bootcamp.'
// Hand-written English, so one copy: twelve locale copies of an untranslated
// page add prerender weight (the build runs near its heap limit) and nothing
// a reader can use.
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

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
    <section class="bg-brand-wash border-b border-default">
      <UContainer class="py-14 sm:py-20">
        <p class="im-meta text-primary">
          CRM Analytics Academy · Classroom
        </p>
        <h1 class="mt-3 max-w-3xl text-4xl font-bold tracking-tighter text-highlighted sm:text-5xl text-balance">
          Learn CRM Analytics in a room, with an instructor and an org of your own
        </h1>
        <p class="mt-5 max-w-2xl text-lg text-muted text-pretty">
          The same curriculum as the free online course, taught over one to two weeks in small
          batches. Every seat comes with a configured practice org and the course datasets loaded.
        </p>
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

        <UAlert
          class="mt-10 max-w-3xl"
          color="info"
          variant="subtle"
          icon="i-lucide-info"
          title="These centers are the course's worked example"
          description="CRM Analytics Academy's classroom business is the fictional company the go-to-market dashboards are built on. Requests sent here are received and answered, but no batch, seat or payment is confirmed through this page."
        />
      </UContainer>
    </section>

    <UContainer class="py-14 sm:py-16">
      <!-- Programmes -->
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="im-meta text-primary">
            Programmes
          </p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">
            Four programmes, one path
          </h2>
        </div>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="p in programmes"
          :key="p.key"
          class="im-card-hover flex flex-col rounded-xl border border-default bg-default p-5"
        >
          <div class="flex items-center justify-between">
            <span class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UIcon
                :name="p.icon"
                class="size-5"
              />
            </span>
            <UBadge
              color="neutral"
              variant="soft"
            >
              {{ p.level }}
            </UBadge>
          </div>
          <h3 class="mt-4 text-lg font-semibold tracking-tight text-highlighted">
            {{ p.title }}
          </h3>
          <p class="mt-1.5 flex-1 text-sm text-muted">
            {{ p.blurb }}
          </p>
          <div class="mt-5 flex items-end justify-between border-t border-default pt-4">
            <div>
              <p class="im-figure text-xl font-semibold text-highlighted">
                {{ p.price }}
              </p>
              <p class="im-meta text-dimmed">
                {{ p.days }} days · per seat
              </p>
            </div>
            <UButton
              size="sm"
              variant="soft"
              trailing-icon="i-lucide-arrow-right"
              @click="choose('track', p.key)"
            >
              Enroll
            </UButton>
          </div>
        </article>
      </div>

      <!-- Centers -->
      <div class="mt-16">
        <p class="im-meta text-primary">
          Training centers
        </p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">
          Five cities and a live-online room
        </h2>

        <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="c in centers"
            :key="c.city"
            type="button"
            class="im-card-hover flex items-center gap-4 rounded-xl border border-default bg-default p-4 text-start"
            @click="choose('center', c.city)"
          >
            <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-primary">
              <UIcon
                :name="c.icon"
                class="size-5"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-highlighted">{{ c.city }}</span>
              <span class="block text-sm text-muted">{{ c.address }} · {{ c.region }}</span>
            </span>
            <span class="text-end">
              <span class="im-figure block text-highlighted">{{ c.seats }}</span>
              <span class="im-meta block text-dimmed">seats</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Enroll -->
      <div
        id="enroll"
        class="mt-16 grid scroll-mt-24 gap-10 lg:grid-cols-5"
      >
        <div class="lg:col-span-2">
          <p class="im-meta text-primary">
            Enrollment
          </p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">
            Reserve a seat
          </h2>
          <p class="mt-3 text-muted">
            Pick a programme and a center. Batches start when a room reaches eight seats; you
            hear from the center before anything is confirmed.
          </p>
          <ul class="mt-6 space-y-3 text-sm text-toned">
            <li
              v-for="item in ['A practice org per seat, datasets preloaded', 'Maximum 16 learners per instructor', 'Every lesson stays free online afterwards', 'Certificate of completion on the final build']"
              :key="item"
              class="flex gap-2.5"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
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
    </UContainer>
  </div>
</template>
