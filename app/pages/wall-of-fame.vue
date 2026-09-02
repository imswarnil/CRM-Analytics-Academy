<script setup lang="ts">
const { t, locale, locales } = useI18n()
const title = computed(() => t('wall.title'))
const description = computed(() => t('wall.subtitle'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

type PersonType = 'blogger' | 'youtuber' | 'author' | 'speaker' | 'builder'

interface Person {
  name: string
  type: PersonType
  desc: string
  linkedin: string
  url?: string
  icon?: string
}

// Curated by hand — like the resources list, this is data, not UI copy.
// To add someone: append an entry with their name, one of the five types,
// a short factual description of their community contribution, and a
// `linkedin` link. Unless you are certain of the person's exact LinkedIn
// handle, use a people-search URL (`/search/results/all/?keywords=<name>`)
// so we never fabricate a profile slug. `url` is an optional secondary
// link (personal site, GitHub) rendered as a small icon button.
const people: Person[] = [
  { name: 'Rikke Hovgaard', type: 'blogger', desc: 'Writes salesforceblogger.com, one of the longest-running blogs dedicated to CRM Analytics tips, bindings, and dashboard techniques.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Rikke%20Hovgaard', url: 'https://www.salesforceblogger.com', icon: 'i-lucide-globe' },
  { name: 'Mohan Chinnappan', type: 'builder', desc: 'Builds and maintains open-source sfdx plugin tooling that many teams use to work with CRM Analytics assets from the command line.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Mohan%20Chinnappan', url: 'https://github.com/mohan-chinnappan-n', icon: 'i-simple-icons-github' },
  { name: 'Carl Brundage', type: 'speaker', desc: 'Einstein Analytics Champion and consultant, known for sharing deep implementation expertise at community events.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Carl%20Brundage' },
  { name: 'Mark Tossell', type: 'author', desc: 'Wrote the book Learning Tableau CRM and shares practical guidance on analytics adoption and dashboard design.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Mark%20Tossell' },
  { name: 'Bobby Brill', type: 'speaker', desc: 'Longtime Einstein Discovery product leader at Salesforce, a familiar face in community demos and sessions.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Bobby%20Brill' },
  { name: 'Skip Sauls', type: 'speaker', desc: 'CRM Analytics product management leader at Salesforce, known for engaging with practitioners in the Trailblazer community.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Skip%20Sauls' }
]

const typeIcons: Record<PersonType, string> = {
  blogger: 'i-lucide-pen-line',
  youtuber: 'i-lucide-youtube',
  author: 'i-lucide-book-open',
  speaker: 'i-lucide-mic',
  builder: 'i-lucide-wrench'
}

const types: PersonType[] = ['blogger', 'youtuber', 'author', 'speaker', 'builder']
const selected = ref<'all' | PersonType>('all')
const filtered = computed(() => selected.value === 'all' ? people : people.filter(p => p.type === selected.value))
const countFor = (key: 'all' | PersonType) => key === 'all' ? people.length : people.filter(p => p.type === key).length

const initials = (name: string) => name.split(/\s+/).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('')

// A gallery wall never hangs perfectly straight — cycle a few tilts by index.
const rotations = ['rotate-1', '-rotate-1', 'rotate-0', '-rotate-2']

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  'name': title.value,
  'description': description.value,
  'url': `${SITE.url}/wall-of-fame`,
  'inLanguage': locales.value.find(l => l.code === locale.value)?.language || locale.value,
  'itemListElement': people.map((p, i) => ({
    '@type': 'ListItem',
    'position': i + 1,
    'item': { '@type': 'Person', 'name': p.name, 'url': p.linkedin }
  }))
})
</script>

<template>
  <div>
    <UPageHero
      :title="t('wall.title')"
      :description="t('wall.subtitle')"
    >
      <template #headline>
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          icon="i-lucide-trophy"
          class="rounded-full"
        >
          {{ t('wall.eyebrow') }}
        </UBadge>
      </template>
    </UPageHero>

    <UContainer class="pb-16 sm:pb-20">
      <div class="mb-8 flex flex-wrap justify-center gap-2">
        <UButton
          :color="selected === 'all' ? 'primary' : 'neutral'"
          :variant="selected === 'all' ? 'subtle' : 'ghost'"
          icon="i-lucide-layout-grid"
          class="rounded-full"
          @click="selected = 'all'"
        >
          {{ t('wall.all') }}
          <UBadge
            :label="String(countFor('all'))"
            color="neutral"
            variant="subtle"
            size="sm"
            class="rounded-full"
          />
        </UButton>
        <UButton
          v-for="type in types"
          :key="type"
          :color="selected === type ? 'primary' : 'neutral'"
          :variant="selected === type ? 'subtle' : 'ghost'"
          :icon="typeIcons[type]"
          class="rounded-full"
          @click="selected = type"
        >
          {{ t(`wall.types.${type}`) }}
          <UBadge
            :label="String(countFor(type))"
            color="neutral"
            variant="subtle"
            size="sm"
            class="rounded-full"
          />
        </UButton>
      </div>

      <section class="bg-dots rounded-lg p-6 ring-1 ring-default sm:p-10">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
          <div
            v-for="(p, i) in filtered"
            :key="p.name"
            class="group relative transition-transform duration-300 hover:rotate-0"
            :class="rotations[i % rotations.length]"
          >
            <!-- the nail it hangs from -->
            <span
              class="absolute -top-2 left-1/2 z-10 size-2 -translate-x-1/2 rounded-full bg-neutral-400 shadow-sm dark:bg-neutral-500"
              aria-hidden="true"
            />

            <!-- wooden frame + mat -->
            <div class="flex h-full flex-col rounded-sm border-8 border-amber-900/70 bg-amber-50 p-4 shadow-xl dark:border-amber-950 dark:bg-neutral-800">
              <!-- sepia "photo" -->
              <div
                class="flex aspect-square items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-neutral-700 dark:to-neutral-800"
                aria-hidden="true"
              >
                <UAvatar
                  :text="initials(p.name)"
                  size="3xl"
                  class="bg-amber-200 font-serif text-amber-900 ring-2 ring-amber-300/70 dark:bg-neutral-600 dark:text-neutral-100 dark:ring-neutral-500/70"
                />
              </div>

              <!-- brass name plaque -->
              <div class="mt-3 rounded-sm border border-amber-300 bg-amber-200/80 px-3 py-1.5 text-center dark:border-amber-800 dark:bg-amber-900/40">
                <p class="text-sm font-semibold uppercase tracking-widest text-amber-950 dark:text-amber-100">
                  {{ p.name }}
                </p>
                <p class="text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  {{ t(`wall.types.${p.type}`) }}
                </p>
              </div>

              <p class="mt-3 grow text-xs text-muted">
                {{ p.desc }}
              </p>

              <div class="mt-3 flex items-center justify-between gap-2">
                <UBadge
                  :label="t(`wall.types.${p.type}`)"
                  :icon="typeIcons[p.type]"
                  color="primary"
                  variant="subtle"
                  size="sm"
                  class="rounded-full"
                />
                <div class="relative z-10 flex items-center gap-1">
                  <UButton
                    v-if="p.url"
                    :to="p.url"
                    target="_blank"
                    :aria-label="t('wall.visit')"
                    :icon="p.icon || 'i-lucide-globe'"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                  />
                  <UButton
                    :to="p.linkedin"
                    target="_blank"
                    :aria-label="t('wall.connect')"
                    icon="i-simple-icons-linkedin"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                  />
                </div>
              </div>
            </div>

            <!-- whole-frame link to LinkedIn -->
            <NuxtLink
              :to="p.linkedin"
              target="_blank"
              :aria-label="p.name"
              class="absolute inset-0 rounded-sm"
            />
          </div>
        </div>
      </section>

      <UPageCTA
        :title="t('wall.nominateTitle')"
        :description="t('wall.nominateDesc')"
        variant="subtle"
        class="mt-12"
        :links="[
          {
            label: t('wall.nominate'),
            to: 'https://github.com/imswarnil/CRM-Analytics-Academy/discussions',
            target: '_blank',
            icon: 'i-lucide-heart-handshake',
            color: 'primary'
          }
        ]"
      />
    </UContainer>
  </div>
</template>
