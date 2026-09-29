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

// Every person is a numbered drawing sheet; the portrait crop cycles so
// neighbouring cards do not line up like a spreadsheet.
const aspects = ['aspect-[4/3]', 'aspect-square', 'aspect-[5/4]']
const frameFor = (i: number) => ({
  no: String(i + 1).padStart(3, '0'),
  aspect: aspects[i % aspects.length]
})

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
    <BpPageHeader
      :sheet="`Sheet 09 / ${t('wall.eyebrow')}`"
      :title="t('wall.title')"
      :lead="t('wall.subtitle')"
      center
    />

    <UContainer class="pb-16 sm:pb-20">
      <div class="mb-8 flex flex-wrap justify-center gap-2">
        <UButton
          :color="selected === 'all' ? 'primary' : 'neutral'"
          :variant="selected === 'all' ? 'subtle' : 'ghost'"
          icon="i-lucide-layout-grid"
          @click="selected = 'all'"
        >
          {{ t('wall.all') }}
          <UBadge
            :label="String(countFor('all'))"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </UButton>
        <UButton
          v-for="type in types"
          :key="type"
          :color="selected === type ? 'primary' : 'neutral'"
          :variant="selected === type ? 'subtle' : 'ghost'"
          :icon="typeIcons[type]"
          @click="selected = type"
        >
          {{ t(`wall.types.${type}`) }}
          <UBadge
            :label="String(countFor(type))"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </UButton>
      </div>

      <div class="columns-1 gap-6 sm:columns-2 lg:columns-3">
        <div
          v-for="(p, i) in filtered"
          :key="p.name"
          class="bp-card bp-card--hover group relative mb-6 break-inside-avoid"
        >
          <div
            class="crosshair hatch relative border-b-[1.5px] border-(--ink) bg-(--ice)"
            :class="frameFor(i).aspect"
            aria-hidden="true"
          >
            <UIcon
              name="i-lucide-user-round"
              class="absolute bottom-0 left-1/2 size-[62%] -translate-x-1/2 text-(--tide)"
            />
            <span class="absolute start-3 top-3 bg-(--card) px-1.5 py-0.5 font-mono text-[10px] tracking-[.1em] text-(--ink)">No. {{ frameFor(i).no }}</span>
          </div>

          <div class="p-4">
            <p class="mono-label">
              {{ t(`wall.types.${p.type}`) }}
            </p>
            <h3 class="mt-1 text-lg font-extrabold tracking-[-0.02em] text-(--ink) group-hover:text-(--signal)">
              {{ p.name }}
            </h3>
            <p class="mt-2 text-sm text-(--ink2)">
              {{ p.desc }}
            </p>

            <div class="mt-4 flex items-center justify-between gap-2 border-t border-dashed border-(--line) pt-3">
              <UBadge
                :label="t(`wall.types.${p.type}`)"
                :icon="typeIcons[p.type]"
                color="primary"
                variant="subtle"
                size="sm"
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

          <!-- whole-card link to LinkedIn -->
          <NuxtLink
            :to="p.linkedin"
            target="_blank"
            :aria-label="p.name"
            class="absolute inset-0"
          />
        </div>
      </div>

      <UPageCTA
        :title="t('wall.nominateTitle')"
        :description="t('wall.nominateDesc')"
        variant="naked"
        class="mt-12"
        :ui="{
          root: 'graph-paper-navy border-[1.5px] border-(--ink) bg-(--navy) shadow-[10px_10px_0_var(--signal)]',
          title: 'text-white',
          description: 'text-white/80'
        }"
        :links="[
          {
            label: t('wall.nominate'),
            to: 'https://github.com/imswarnil/CRM-Analytics-Academy/discussions',
            target: '_blank',
            icon: 'i-lucide-heart-handshake',
            color: 'secondary'
          }
        ]"
      />
    </UContainer>
  </div>
</template>
