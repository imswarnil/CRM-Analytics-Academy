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
  url?: string
  icon?: string
}

// Curated by hand — like the resources list, this is data, not UI copy.
// To add someone: append an entry with their name, one of the five types,
// a short factual description of their community contribution, and a `url`
// only if you are sure of the domain (the card renders fine without one).
const people: Person[] = [
  { name: 'Rikke Hovgaard', type: 'blogger', desc: 'Writes salesforceblogger.com, one of the longest-running blogs dedicated to CRM Analytics tips, bindings, and dashboard techniques.', url: 'https://www.salesforceblogger.com' },
  { name: 'Mohan Chinnappan', type: 'builder', desc: 'Builds and maintains open-source sfdx plugin tooling that many teams use to work with CRM Analytics assets from the command line.', url: 'https://github.com/mohan-chinnappan-n' },
  { name: 'Carl Brundage', type: 'speaker', desc: 'Einstein Analytics Champion and consultant, known for sharing deep implementation expertise at community events.' },
  { name: 'Mark Tossell', type: 'author', desc: 'Wrote the book Learning Tableau CRM and shares practical guidance on analytics adoption and dashboard design.' },
  { name: 'Bobby Brill', type: 'speaker', desc: 'Longtime Einstein Discovery product leader at Salesforce, a familiar face in community demos and sessions.' },
  { name: 'Skip Sauls', type: 'speaker', desc: 'CRM Analytics product management leader at Salesforce, known for engaging with practitioners in the Trailblazer community.' }
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
    'item': { '@type': 'Person', 'name': p.name, ...(p.url ? { url: p.url } : {}) }
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

      <UPageGrid>
        <UPageCard
          v-for="p in filtered"
          :key="p.name"
          :ui="{ body: 'flex-1' }"
        >
          <div class="flex h-full flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <UAvatar
                :text="initials(p.name)"
                size="lg"
              />
              <UBadge
                :label="t(`wall.types.${p.type}`)"
                :icon="p.icon || typeIcons[p.type]"
                color="primary"
                variant="subtle"
                size="sm"
                class="rounded-full"
              />
            </div>
            <h3 class="font-semibold text-highlighted">
              {{ p.name }}
            </h3>
            <p class="grow text-sm text-muted">
              {{ p.desc }}
            </p>
            <div v-if="p.url">
              <UButton
                :to="p.url"
                target="_blank"
                color="neutral"
                variant="outline"
                size="sm"
                trailing-icon="i-lucide-arrow-up-right"
                class="rounded-full"
              >
                {{ t('wall.visit') }}
              </UButton>
            </div>
          </div>
        </UPageCard>
      </UPageGrid>

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
