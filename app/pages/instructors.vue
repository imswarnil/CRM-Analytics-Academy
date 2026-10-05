<script setup lang="ts">
/**
 * Instructors & credits: everyone whose work is on the site.
 *
 *   - Instructors (and the maintainer): people in content/people who write
 *     lessons, with the lessons that name them in `authors`.
 *   - Creators and writers whose videos, posts and datasets lessons embed:
 *     registry entries with role blogger/creator, plus anyone named in a
 *     lesson's `credits` or credited video — derived, so attributing a video
 *     in a lesson is enough to list its author here.
 *   - Community contributors, and the way into the Wall of Fame.
 *
 * Then the "teach with us" application, as before.
 */
const { t } = useI18n()
const title = computed(() => t('people.title'))
const description = computed(() => t('people.description'))
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })
usePageSchema({ name: title.value, description: description.value, type: 'CollectionPage' })

interface LessonRef {
  title: string
  to: string
}
interface CreditedWork {
  kind: string
  title: string
  url: string
  lesson: LessonRef
}
interface Card {
  slug: string
  name: string
  role: string
  avatar: string | null
  headline: string | null
  links: Record<string, string>
  authored: LessonRef[]
  credited: CreditedWork[]
}

const { data: people } = await usePeople()
const { data: lessons } = await useAsyncData('people-lessons', () =>
  queryCollection('docs')
    .where('path', 'LIKE', '/en/%')
    .select('path', 'title', 'authors', 'credits', 'video')
    .all()
)

const LINK_ICONS: Record<string, string> = {
  site: 'i-lucide-globe',
  linkedin: 'i-simple-icons-linkedin',
  youtube: 'i-simple-icons-youtube',
  x: 'i-simple-icons-x',
  github: 'i-simple-icons-github'
}

const cards = computed<Card[]>(() => {
  const bySlug = new Map<string, Card>()
  for (const p of people.value ?? []) {
    const lp = toLessonPerson(p)
    bySlug.set(lp.slug, { ...lp, authored: [], credited: [] })
  }
  const byName = new Map([...bySlug.values()].map(c => [c.name.toLowerCase(), c]))

  // Derived entries for credited authors who have no registry file.
  const creditCard = (name: string, url?: string | null): Card => {
    const known = byName.get(name.toLowerCase())
    if (known) return known
    const slug = `credit-${slugify(name)}`
    const card: Card = { slug, name, role: 'creator', avatar: null, headline: null, links: url ? { site: url } : {}, authored: [], credited: [] }
    bySlug.set(slug, card)
    byName.set(name.toLowerCase(), card)
    return card
  }

  for (const l of lessons.value ?? []) {
    const lesson = { title: String(l.title), to: contentToRoutePath(l.path) }
    const authors = (l.authors as string[] | undefined)?.length ? l.authors as string[] : [OWNER_SLUG]
    for (const a of authors) bySlug.get(a)?.authored.push(lesson)
    for (const c of (l.credits ?? []) as LessonCredit[]) {
      creditCard(c.author, c.authorUrl).credited.push({ kind: c.kind, title: c.title, url: c.url, lesson })
    }
    const v = l.video as { id?: string, title?: string, author?: string, authorUrl?: string } | undefined
    if (v?.id && v.author) {
      creditCard(v.author, v.authorUrl).credited.push({ kind: 'video', title: v.title || 'YouTube', url: `https://www.youtube.com/watch?v=${v.id}`, lesson })
    }
  }
  return [...bySlug.values()]
})

const groups = computed(() => [
  {
    key: 'instructors',
    people: cards.value
      .filter(c => c.role === 'instructor' || c.role === 'maintainer')
      .sort((a, b) => b.authored.length - a.authored.length)
  },
  {
    key: 'creators',
    people: cards.value
      .filter(c => c.role === 'blogger' || c.role === 'creator')
      .sort((a, b) => b.credited.length - a.credited.length || a.name.localeCompare(b.name))
  },
  {
    key: 'community',
    people: cards.value.filter(c => c.role === 'community').sort((a, b) => a.name.localeCompare(b.name))
  }
])

const initials = (name: string) => name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
const expanded = ref<Record<string, boolean>>({})
const SHOWN = 5

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  'name': title.value,
  'description': description.value,
  'url': `${SITE.url}/instructors`,
  'itemListElement': cards.value.map((c, i) => ({
    '@type': 'ListItem',
    'position': i + 1,
    'item': {
      '@type': 'Person',
      'name': c.name,
      'url': `${SITE.url}/instructors#${c.slug}`,
      ...(c.headline ? { description: c.headline } : {}),
      ...(Object.keys(c.links).length ? { sameAs: Object.values(c.links) } : {})
    }
  }))
})

const ways = computed(() => ['01', '02', '04'].map(n => ({
  n,
  title: t(`people.teach.ways.${n}.title`),
  text: t(`people.teach.ways.${n}.text`)
})))
const looking = computed(() => [1, 2, 3, 4].map(i => t(`people.teach.looking.${i}`)))
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="`Sheet 22 / ${t('people.eyebrow')}`"
      :title="t('people.title')"
      :lead="t('people.lead')"
    />

    <div class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <section
        v-for="(g, gi) in groups"
        :key="g.key"
        :class="gi ? 'mt-20' : ''"
        :aria-labelledby="`people-${g.key}`"
      >
        <p
          :id="`people-${g.key}`"
          class="eyebrow"
        >
          Fig. {{ String(gi + 1).padStart(2, '0') }} — {{ t(`people.groups.${g.key}.title`) }}
        </p>
        <p class="mt-2 max-w-2xl text-(--ink2)">
          {{ t(`people.groups.${g.key}.lead`) }}
        </p>

        <p
          v-if="!g.people.length"
          class="mt-6 border-[1.5px] border-dashed border-(--line) p-6 text-sm text-(--ink2)"
        >
          {{ t(`people.groups.${g.key}.empty`) }}
        </p>

        <ul
          v-else
          class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <li
            v-for="p in g.people"
            :id="p.slug"
            :key="p.slug"
            class="bp-card flex scroll-mt-28 flex-col p-5 target:shadow-[6px_6px_0_var(--signal)]"
          >
            <div class="flex items-start gap-3">
              <img
                v-if="p.avatar"
                :src="p.avatar"
                alt=""
                width="48"
                height="48"
                loading="lazy"
                class="size-12 flex-none border-[1.5px] border-(--ink) object-cover"
              >
              <span
                v-else
                class="grid size-12 flex-none place-items-center border-[1.5px] border-(--ink) bg-(--ice) font-mono text-sm font-semibold"
                aria-hidden="true"
              >{{ initials(p.name) }}</span>
              <div class="min-w-0">
                <p class="mono-label">
                  {{ t(`people.roles.${p.role}`) }}
                </p>
                <h3 class="font-extrabold text-(--ink)">
                  {{ p.name }}
                </h3>
              </div>
            </div>
            <p
              v-if="p.headline"
              class="mt-3 text-sm text-(--ink2)"
            >
              {{ p.headline }}
            </p>
            <div
              v-if="Object.keys(p.links).length"
              class="mt-3 flex flex-wrap gap-1"
            >
              <UButton
                v-for="(url, key) in p.links"
                :key="key"
                :to="url"
                target="_blank"
                rel="noopener"
                :icon="LINK_ICONS[key] ?? 'i-lucide-link'"
                :aria-label="`${p.name} — ${key}`"
                color="neutral"
                variant="outline"
                size="xs"
                square
              />
            </div>

            <div
              v-if="p.authored.length"
              class="mt-4 border-t border-dashed border-(--line) pt-3"
            >
              <p class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                {{ t('people.authored', p.authored.length) }}
              </p>
              <ul class="mt-1.5 space-y-1 text-sm">
                <li
                  v-for="l in (expanded[p.slug] ? p.authored : p.authored.slice(0, SHOWN))"
                  :key="l.to"
                >
                  <NuxtLink
                    :to="l.to"
                    class="text-(--ink) hover:text-(--signal)"
                  >
                    {{ l.title }}
                  </NuxtLink>
                </li>
              </ul>
              <button
                v-if="p.authored.length > SHOWN"
                type="button"
                class="mt-1.5 font-mono text-[10px] uppercase tracking-[.1em] text-(--signal) hover:underline"
                @click="expanded[p.slug] = !expanded[p.slug]"
              >
                {{ expanded[p.slug] ? t('people.showLess') : t('people.showAll', { n: p.authored.length }) }}
              </button>
            </div>

            <div
              v-if="p.credited.length"
              class="mt-4 border-t border-dashed border-(--line) pt-3"
            >
              <p class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                {{ t('people.credited', p.credited.length) }}
              </p>
              <ul class="mt-1.5 space-y-2 text-sm">
                <li
                  v-for="(w, i) in p.credited"
                  :key="`${w.url}-${i}`"
                >
                  <a
                    :href="w.url"
                    target="_blank"
                    rel="noopener"
                    class="font-medium text-(--ink) hover:text-(--signal)"
                  >{{ w.title }} ↗</a>
                  <span class="block text-xs text-(--ink2)">
                    {{ t(`credits.kinds.${w.kind}`) }} · {{ t('people.inLesson') }}
                    <NuxtLink
                      :to="w.lesson.to"
                      class="hover:text-(--signal)"
                    >{{ w.lesson.title }}</NuxtLink>
                  </span>
                </li>
              </ul>
            </div>
          </li>
        </ul>

        <p
          v-if="g.key === 'community'"
          class="mt-6 text-sm text-(--ink2)"
        >
          {{ t('people.wallLead') }}
          <NuxtLink
            to="/wall-of-fame"
            class="font-semibold text-(--signal) underline-offset-4 hover:underline"
          >{{ t('people.wallLink') }}</NuxtLink>
        </p>
      </section>

      <!-- Teach with us -->
      <section class="mt-24 border-t-[1.5px] border-(--ink) pt-16">
        <p class="eyebrow">
          Fig. 04 — {{ t('people.teach.title') }}
        </p>
        <p class="mt-2 max-w-2xl text-(--ink2)">
          {{ t('people.teach.lead') }}
        </p>
        <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="w in ways"
            :key="w.n"
            class="bp-card bp-card--hover p-5"
          >
            <span class="text-3xl font-black tracking-[-0.04em] text-(--signal)">{{ w.n }}</span>
            <h3 class="mt-2 font-extrabold text-(--ink)">
              {{ w.title }}
            </h3>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ w.text }}
            </p>
          </div>
        </div>

        <div class="mt-16 grid gap-10 lg:grid-cols-5">
          <div class="lg:col-span-2">
            <p class="eyebrow">
              {{ t('people.teach.lookingTitle') }}
            </p>
            <ul class="mt-6 space-y-3">
              <li
                v-for="l in looking"
                :key="l"
                class="flex gap-3 text-(--ink)"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-1 size-4 flex-none text-(--signal)"
                />
                {{ l }}
              </li>
            </ul>
            <p class="mt-6 text-sm text-(--ink2)">
              {{ t('people.teach.startSmall') }} <NuxtLink
                to="/contribute"
                class="font-semibold text-(--signal) underline-offset-4 hover:underline"
              >{{ t('people.teach.contribute') }}</NuxtLink>
            </p>
          </div>
          <div class="lg:col-span-3">
            <LeadForm type="instructor" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
