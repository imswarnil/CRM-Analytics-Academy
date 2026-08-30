<script setup lang="ts">
/**
 * Command-K search. Replaces UContentSearch / UContentSearchButton.
 *
 * The index is fetched lazily on first open, not on page load: it is the
 * largest single payload the site can serve, and most readers never search.
 * Matching is plain substring scoring rather than a fuzzy library — the corpus
 * is one curriculum, and a dependency here would outweigh the benefit.
 */
const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const open = ref(false)
const query = ref('')
const activeIndex = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)
const loading = ref(false)

interface Section {
  id: string
  title: string
  titles: string[]
  content: string
  level: number
}

const sections = shallowRef<Section[]>([])
let loaded = false

async function load() {
  if (loaded) return
  loading.value = true
  try {
    // Scoped to the active locale so a Spanish reader is not offered English
    // results, and so the payload is one language rather than twelve.
    const data = await queryCollectionSearchSections('docs')
    sections.value = (data as Section[]).filter(s => s.id.startsWith(`/${locale.value}/`))
    loaded = true
  } catch {
    sections.value = []
  } finally {
    loading.value = false
  }
}

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (q.length < 2) return []

  const scored: { section: Section, score: number }[] = []
  for (const section of sections.value) {
    const title = section.title?.toLowerCase() ?? ''
    const content = section.content?.toLowerCase() ?? ''

    let score = 0
    // Title hits outrank body hits: someone typing "saql" wants the SAQL
    // lesson, not every lesson that happens to mention it.
    if (title.startsWith(q)) score += 100
    else if (title.includes(q)) score += 60
    if (content.includes(q)) score += 10

    if (score > 0) {
      scored.push({ section, score })
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(s => s.section)
})

// A new result set means the previous highlight points at a different lesson.
watch(results, () => {
  activeIndex.value = 0
})

async function show() {
  open.value = true
  await load()
  await nextTick()
  inputEl.value?.focus()
}

function hide() {
  open.value = false
  query.value = ''
}

function go(section: Section) {
  // Content ids are locale-prefixed paths with an optional #anchor; the route
  // is the same path with the default locale unprefixed.
  const [path, hash] = section.id.split('#')
  const routePath = contentToRoutePath(path || '')
  hide()
  router.push({ path: localePath(routePath), hash: hash ? `#${hash}` : undefined })
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (open.value) {
      hide()
    } else {
      show()
    }
    return
  }
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    hide()
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  }
  if (e.key === 'Enter') {
    const hit = results.value[activeIndex.value]
    if (hit) {
      e.preventDefault()
      go(hit)
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

// The dialog owns the scroll while it is open, or the page scrolls behind it.
watch(open, (isOpen) => {
  if (import.meta.client) document.body.style.overflow = isOpen ? 'hidden' : ''
})
</script>

<template>
  <div class="search">
    <button
      class="search__trigger"
      type="button"
      @click="show"
    >
      <Icon
        name="i-lucide-search"
        class="search__trigger-icon"
      />
      <span class="search__trigger-label">Search</span>
      <kbd class="search__kbd">⌘K</kbd>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="search__overlay"
        @click.self="hide"
      >
        <div
          class="search__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Search the curriculum"
        >
          <div class="search__field">
            <Icon
              name="i-lucide-search"
              class="search__field-icon"
            />
            <input
              ref="inputEl"
              v-model="query"
              class="search__input"
              type="search"
              placeholder="Search lessons…"
              autocomplete="off"
              spellcheck="false"
            >
            <button
              class="search__close"
              type="button"
              aria-label="Close search"
              @click="hide"
            >
              <Icon name="i-lucide-x" />
            </button>
          </div>

          <div class="search__results">
            <p
              v-if="loading"
              class="search__empty"
            >
              Loading…
            </p>
            <p
              v-else-if="query.trim().length < 2"
              class="search__empty"
            >
              Type at least two characters.
            </p>
            <p
              v-else-if="!results.length"
              class="search__empty"
            >
              No lessons match “{{ query }}”.
            </p>

            <ul
              v-else
              class="search__list"
            >
              <li
                v-for="(hit, i) in results"
                :key="hit.id"
              >
                <button
                  class="search__hit"
                  :class="{ 'is-active': i === activeIndex }"
                  type="button"
                  @click="go(hit)"
                  @mouseenter="activeIndex = i"
                >
                  <span class="search__hit-title">{{ hit.title }}</span>
                  <span
                    v-if="hit.titles?.length"
                    class="search__hit-path"
                  >{{ hit.titles.join(' › ') }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.search__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: 2.5rem;
  padding-inline: var(--s-3);
  border: 1px solid var(--c-line);
  border-radius: var(--r-full);
  background: var(--c-bg-sunken);
  color: var(--c-text-faint);
  font-size: var(--t-tiny);
  transition:
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);

  &:hover {
    border-color: var(--c-brand);
    color: var(--c-text);
  }
}

.search__trigger-icon {
  width: 1rem;
  height: 1rem;
}

.search__trigger-label {
  @media (max-width: 47.999rem) { display: none; }
}

.search__kbd {
  padding: 0.15em 0.4em;
  border: 1px solid var(--c-line);
  border-radius: var(--r-xs);
  background: var(--c-bg-raised);
  font-family: var(--font-mono);
  font-size: var(--t-micro);

  @media (max-width: 47.999rem) { display: none; }
}

.search__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  justify-content: center;
  padding: var(--s-6) var(--s-4);
  background: rgb(5 11 20 / 0.55);
  backdrop-filter: blur(3px);

  @media (min-width: 48rem) {
    padding-block-start: 12vh;
  }
}

.search__panel {
  width: 100%;
  max-width: 40rem;
  max-height: min(32rem, 80vh);
  display: flex;
  flex-direction: column;
  background: var(--c-bg-raised);
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-4);
  overflow: hidden;
  animation: search-in var(--dur-mid) var(--ease-spring);
}

@keyframes search-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

.search__field {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-4);
  border-block-end: 1px solid var(--c-line);
}

.search__field-icon {
  width: 1.15rem;
  height: 1.15rem;
  color: var(--c-text-faint);
  flex-shrink: 0;
}

.search__input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: none;
  outline: none;
  font-size: var(--t-lead);
  color: var(--c-text);

  &::-webkit-search-cancel-button { display: none; }
}

.search__close {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--r-sm);
  color: var(--c-text-faint);

  &:hover { background: var(--c-bg-inset); color: var(--c-text); }
}

.search__results {
  overflow-y: auto;
  padding: var(--s-2);
}

.search__empty {
  padding: var(--s-6) var(--s-4);
  text-align: center;
  color: var(--c-text-faint);
  font-size: var(--t-small);
}

.search__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.search__hit {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  width: 100%;
  padding: var(--s-3);
  border-radius: var(--r-sm);
  text-align: start;

  &.is-active {
    background: var(--c-brand-faint);
  }
}

.search__hit-title {
  font-weight: 650;
  color: var(--c-text);
  font-size: var(--t-small);
}

.search__hit-path {
  font-size: var(--t-micro);
  color: var(--c-text-faint);
}
</style>
