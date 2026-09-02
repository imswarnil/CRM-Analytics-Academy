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

// Every frame on a real wall is different: three frame builds (polaroid,
// wood, black gallery), five tilts and three photo crops, cycled so no two
// neighbours match. Frame interiors stay light in both themes — paper and
// wood don't theme — so interior text uses fixed dark tones, not semantic
// tokens; only the wall behind them (.bg-wall) follows the color mode.
const rotations = ['rotate-1', '-rotate-2', 'rotate-0', '-rotate-1', 'rotate-2']
const aspects = ['aspect-square', 'aspect-[4/5]', 'aspect-[3/4]']
const frameStyles = ['polaroid', 'wood', 'gallery'] as const
const frameFor = (i: number) => ({
  style: frameStyles[i % frameStyles.length],
  rotation: rotations[i % rotations.length],
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

      <section class="bg-wall rounded-lg p-6 shadow-inner ring-1 ring-default sm:p-10 lg:p-14">
        <!-- CSS-columns masonry: mixed photo crops give every column its own
             rhythm, like a wall that grew one frame at a time. -->
        <div class="columns-1 gap-10 sm:columns-2 lg:columns-3">
          <div
            v-for="(p, i) in filtered"
            :key="p.name"
            class="group relative mb-10 break-inside-avoid transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-none"
            :class="frameFor(i).rotation"
          >
            <!-- the nail it hangs from -->
            <span
              class="absolute -top-2.5 left-1/2 z-10 size-2 -translate-x-1/2 rounded-full bg-neutral-400 shadow-sm dark:bg-neutral-500"
              aria-hidden="true"
            />

            <!-- the frame: polaroid paper, wood + mat, or thin black gallery -->
            <div
              class="flex h-full flex-col shadow-xl transition-shadow duration-300 group-hover:shadow-2xl"
              :class="{
                'bg-white p-3 pb-5': frameFor(i).style === 'polaroid',
                'rounded-sm border-8 border-amber-900/80 bg-amber-50 p-3': frameFor(i).style === 'wood',
                'border-[6px] border-neutral-900 bg-white p-4': frameFor(i).style === 'gallery'
              }"
            >
              <!-- the photograph: sepia portrait silhouette under a glass sheen -->
              <div
                class="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200"
                :class="frameFor(i).aspect"
                aria-hidden="true"
              >
                <UIcon
                  name="i-lucide-user-round"
                  class="absolute bottom-0 left-1/2 size-[72%] -translate-x-1/2 translate-y-[10%] text-amber-900/25"
                />
                <span class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40" />
                <span class="absolute inset-0 ring-1 ring-black/10 ring-inset" />
              </div>

              <!-- the caption, in the frame's own voice -->
              <div
                v-if="frameFor(i).style === 'wood'"
                class="mt-3 rounded-sm border border-amber-300 bg-amber-200/80 px-3 py-1.5 text-center"
              >
                <p class="text-sm font-semibold tracking-widest text-amber-950 uppercase">
                  {{ p.name }}
                </p>
                <p class="text-[10px] tracking-wider text-amber-800 uppercase">
                  {{ t(`wall.types.${p.type}`) }}
                </p>
              </div>
              <div
                v-else-if="frameFor(i).style === 'polaroid'"
                class="mt-3 text-center"
              >
                <p class="font-serif text-lg text-neutral-800 italic">
                  {{ p.name }}
                </p>
                <p class="text-[10px] tracking-wider text-neutral-500 uppercase">
                  {{ t(`wall.types.${p.type}`) }}
                </p>
              </div>
              <div
                v-else
                class="mt-3 text-center"
              >
                <p class="text-xs font-medium tracking-[0.2em] text-neutral-800 uppercase">
                  {{ p.name }}
                </p>
                <p class="text-[10px] tracking-wider text-neutral-500 uppercase">
                  {{ t(`wall.types.${p.type}`) }}
                </p>
              </div>

              <p class="mt-3 grow text-xs text-neutral-600">
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
              class="absolute inset-0"
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
