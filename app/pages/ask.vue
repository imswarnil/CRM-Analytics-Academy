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

const query = ref('')

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
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-14 text-center sm:py-16">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-5 rounded-full"
        >
          <UIcon
            name="i-lucide-sparkles"
            class="mr-1 size-4"
          />
          {{ t('ask.eyebrow') }}
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          {{ t('ask.title') }}
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-muted">
          {{ t('ask.subtitle') }}
        </p>

        <div class="mx-auto mt-8 max-w-2xl">
          <UInput
            v-model="query"
            icon="i-lucide-search"
            size="xl"
            variant="subtle"
            :placeholder="t('ask.placeholder')"
            :loading="loading"
            autofocus
            class="w-full"
          />
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-14">
      <!-- Results -->
      <div
        v-if="results.length"
        class="mx-auto max-w-3xl"
      >
        <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          {{ t('ask.sources') }}
        </p>
        <div class="space-y-4">
          <UCard
            v-for="result in results"
            :key="result.doc.path"
            variant="subtle"
          >
            <NuxtLink
              :to="localePath(result.doc.path)"
              class="text-base font-semibold text-highlighted hover:text-primary"
            >
              {{ result.doc.title }}
            </NuxtLink>
            <p class="mt-1 text-sm text-muted">
              {{ result.doc.description }}
            </p>
            <!-- eslint-disable vue/no-v-html -- snippet is HTML-escaped before <mark> is added -->
            <p
              class="mt-3 text-sm text-toned [&_mark]:rounded-sm [&_mark]:bg-primary/20 [&_mark]:px-0.5 [&_mark]:text-highlighted"
              v-html="highlight(result.snippet)"
            />
            <!-- eslint-enable vue/no-v-html -->
          </UCard>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="query.trim() && !loading"
        class="mx-auto max-w-3xl py-8 text-center"
      >
        <UIcon
          name="i-lucide-search-x"
          class="mx-auto size-8 text-muted"
        />
        <p class="mt-3 text-muted">
          {{ t('ask.empty') }}
        </p>
      </div>

      <!-- Promo cards: use the curriculum in your own AI tool / over MCP -->
      <div class="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        <UCard variant="subtle">
          <div class="flex items-center gap-2.5">
            <UIcon
              name="i-lucide-bot"
              class="size-5 text-primary"
            />
            <h2 class="font-semibold text-highlighted">
              {{ t('ask.aiBox') }}
            </h2>
          </div>
          <p class="mt-2 text-sm text-muted">
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
              color="primary"
              variant="subtle"
              :icon="copied === LLMS_FULL_URL ? 'i-lucide-check' : 'i-lucide-copy'"
              @click="copy(LLMS_FULL_URL)"
            >
              {{ copied === LLMS_FULL_URL ? t('ask.copied') : t('ask.copy') }}
            </UButton>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex items-center gap-2.5">
            <UIcon
              name="i-lucide-plug"
              class="size-5 text-primary"
            />
            <h2 class="font-semibold text-highlighted">
              {{ t('ask.mcp') }}
            </h2>
          </div>
          <p class="mt-2 text-sm text-muted">
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
              color="primary"
              variant="subtle"
              :icon="copied === MCP_URL ? 'i-lucide-check' : 'i-lucide-copy'"
              @click="copy(MCP_URL)"
            >
              {{ copied === MCP_URL ? t('ask.copied') : t('ask.copy') }}
            </UButton>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
