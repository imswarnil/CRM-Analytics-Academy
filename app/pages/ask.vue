<script setup lang="ts">
// Retrieval-only "ask the curriculum" page (ai.md, option 1 + option 0).
//
// No model, no server: the page pulls the static index the build wrote to
// /ask-index.json and ranks it in the browser, so it works on the prerendered
// page at zero cost and never hallucinates. The two promo cards below the
// results are option 0 (llms-full.txt in your own AI tool) and option 2 (the
// MCP endpoint served by this same Worker at /mcp).
const { t, locale } = useI18n()
const localePath = useLocalePath()

const title = computed(() => t('ask.title'))
const description = computed(() => t('ask.subtitle'))

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('Docs', { title: title.value, description: description.value })

interface AskDoc {
  path: string
  title: string
  description: string
  headings: string[]
  text: string
  words: number
}

const docs = ref<AskDoc[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    docs.value = await $fetch<AskDoc[]>('/ask-index.json')
  } catch {
    docs.value = []
  } finally {
    loading.value = false
  }
})

// Seeded from ?q= so the WebSite SearchAction in the site's JSON-LD (and any
// shared link) lands with the question already answered.
const query = ref(String(useRoute().query.q ?? ''))

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(term => term.length > 1)
}

function countHits(haystack: string, term: string): number {
  let count = 0
  let at = haystack.indexOf(term)
  while (at !== -1) {
    count += 1
    at = haystack.indexOf(term, at + term.length)
  }
  return count
}

interface AskResult {
  doc: AskDoc
  score: number
  snippet: string
}

const results = computed<AskResult[]>(() => {
  const terms = tokenize(query.value)
  if (!terms.length) return []

  const scored: AskResult[] = []
  for (const doc of docs.value) {
    const lowTitle = doc.title.toLowerCase()
    const lowHeadings = doc.headings.join(' ').toLowerCase()
    const lowDescription = doc.description.toLowerCase()
    const lowText = doc.text.toLowerCase()

    let score = 0
    for (const term of terms) {
      score += countHits(lowTitle, term) * 5
      score += countHits(lowHeadings, term) * 3
      score += countHits(lowDescription, term) * 2
      score += countHits(lowText, term)
    }
    if (score > 0) scored.push({ doc, score, snippet: snippetFor(doc, terms) })
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 6)
})

/** ~160 chars of the lesson text around the first matching term. */
function snippetFor(doc: AskDoc, terms: string[]): string {
  const low = doc.text.toLowerCase()
  let at = -1
  for (const term of terms) {
    const hit = low.indexOf(term)
    if (hit !== -1 && (at === -1 || hit < at)) at = hit
  }
  if (at === -1) return doc.text.slice(0, 160)
  const start = Math.max(0, at - 60)
  const end = Math.min(doc.text.length, at + 100)
  return (start > 0 ? '…' : '') + doc.text.slice(start, end) + (end < doc.text.length ? '…' : '')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Escape, then wrap every query-term occurrence in <mark>. */
function highlight(snippet: string): string {
  const terms = tokenize(query.value)
  let html = escapeHtml(snippet)
  if (terms.length) {
    const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
    html = html.replace(pattern, '<mark>$1</mark>')
  }
  return html
}

const LLMS_FULL_URL = 'https://crmanalytics.imswarnil.com/llms-full.txt'
const MCP_URL = 'https://crmanalytics.imswarnil.com/mcp'

const copied = ref<string | null>(null)
async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = value
    setTimeout(() => {
      if (copied.value === value) copied.value = null
    }, 2000)
  } catch {
    // Clipboard unavailable (permissions, http) — the input is selectable.
  }
}

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': title.value,
  'description': description.value,
  'url': `${SITE.url}/ask`,
  'inLanguage': locale.value
})
</script>

<template>
  <div>
    <section class="graph-paper border-b-[1.5px] border-(--ink)">
      <div class="mx-auto max-w-(--ui-container) px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <p class="eyebrow">
          Sheet 06 / {{ t('ask.eyebrow') }}
        </p>
        <h1 class="bp-h1 mx-auto mt-4 max-w-4xl">
          {{ t('ask.title') }}
        </h1>
        <p class="bp-lead mx-auto mt-5 max-w-2xl">
          {{ t('ask.subtitle') }}
        </p>

        <div class="mx-auto mt-8 max-w-2xl shadow-[8px_8px_0_var(--ink)]">
          <UInput
            v-model="query"
            icon="i-lucide-search"
            size="xl"
            :placeholder="t('ask.placeholder')"
            :loading="loading"
            autofocus
            class="w-full"
          />
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <!-- Results -->
      <div
        v-if="results.length"
        class="mx-auto max-w-3xl"
      >
        <p class="eyebrow mb-4">
          {{ t('ask.sources') }}
        </p>
        <div class="space-y-4">
          <div
            v-for="(result, n) in results"
            :key="result.doc.path"
            class="bp-card bp-card--hover p-5"
          >
            <p class="mono-label mb-1">
              Source {{ String(n + 1).padStart(2, '0') }}
            </p>
            <NuxtLink
              :to="localePath(result.doc.path)"
              class="text-lg font-extrabold tracking-[-0.02em] text-(--ink) hover:text-(--signal)"
            >
              {{ result.doc.title }}
            </NuxtLink>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ result.doc.description }}
            </p>
            <!-- eslint-disable vue/no-v-html -- snippet is HTML-escaped before <mark> is added -->
            <p
              class="mt-3 border-s-[3px] border-(--signal) ps-3 text-sm text-(--ink) [&_mark]:bg-(--glow)/50 [&_mark]:px-0.5 [&_mark]:text-(--ink)"
              v-html="highlight(result.snippet)"
            />
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="query.trim() && !loading"
        class="mx-auto max-w-3xl py-8 text-center"
      >
        <UIcon
          name="i-lucide-search-x"
          class="mx-auto size-8 text-(--ink2)"
        />
        <p class="mt-3 text-(--ink2)">
          {{ t('ask.empty') }}
        </p>
      </div>

      <!-- Promo cards: use the curriculum in your own AI tool / over MCP -->
      <div class="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        <div class="graph-paper-navy border-[1.5px] border-(--ink) bg-(--navy) p-5 text-white">
          <div class="flex items-center gap-2.5">
            <UIcon
              name="i-lucide-bot"
              class="size-5 text-(--glow)"
            />
            <h2 class="font-extrabold">
              {{ t('ask.aiBox') }}
            </h2>
          </div>
          <p class="mt-2 text-sm text-white/75">
            {{ t('ask.aiBoxDesc') }}
          </p>
          <div class="mt-4 flex items-center gap-2">
            <UInput
              :model-value="LLMS_FULL_URL"
              readonly
              size="sm"
              class="grow font-mono"
            />
            <UButton
              size="sm"
              color="secondary"
              :icon="copied === LLMS_FULL_URL ? 'i-lucide-check' : 'i-lucide-copy'"
              @click="copy(LLMS_FULL_URL)"
            >
              {{ copied === LLMS_FULL_URL ? t('ask.copied') : t('ask.copy') }}
            </UButton>
          </div>
        </div>

        <div class="graph-paper-navy border-[1.5px] border-(--ink) bg-(--navy) p-5 text-white">
          <div class="flex items-center gap-2.5">
            <UIcon
              name="i-lucide-plug"
              class="size-5 text-(--glow)"
            />
            <h2 class="font-extrabold">
              {{ t('ask.mcp') }}
            </h2>
          </div>
          <p class="mt-2 text-sm text-white/75">
            {{ t('ask.mcpDesc') }}
          </p>
          <div class="mt-4 flex items-center gap-2">
            <UInput
              :model-value="MCP_URL"
              readonly
              size="sm"
              class="grow font-mono"
            />
            <UButton
              size="sm"
              color="secondary"
              :icon="copied === MCP_URL ? 'i-lucide-check' : 'i-lucide-copy'"
              @click="copy(MCP_URL)"
            >
              {{ copied === MCP_URL ? t('ask.copied') : t('ask.copy') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
