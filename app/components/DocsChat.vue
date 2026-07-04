<script setup lang="ts">
const props = defineProps<{
  // Content path of the current page (e.g. /en/saql/basics) — boosts retrieval.
  pagePath?: string
  pageTitle?: string
}>()

const { messages, loading, error, send, reset, remaining, limitReached, questionLimit, hasKey } = useDocsChat()

const input = ref('')
const scroller = ref<HTMLElement | null>(null)

const canSend = computed(() => input.value.trim().length > 0 && !loading.value && !limitReached.value)

const suggestions = computed(() => {
  const topic = props.pageTitle ? `“${props.pageTitle}”` : 'this page'
  return [
    `Summarise ${topic} in a few points`,
    `Give me a practical example from ${topic}`,
    'How does this apply in a real dashboard?'
  ]
})

function scrollToBottom() {
  nextTick(() => {
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  })
}

async function submit(text?: string) {
  const content = (text ?? input.value).trim()
  if (!content || loading.value) return
  input.value = ''
  scrollToBottom()
  await send(content, { pagePath: props.pagePath, pageTitle: props.pageTitle })
  scrollToBottom()
}

watch(() => messages.value.at(-1)?.content, scrollToBottom)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}
</script>

<template>
  <section class="not-prose my-10 overflow-hidden rounded-xl border border-default bg-elevated/40">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 border-b border-default px-4 py-3">
      <div class="flex items-center gap-2.5">
        <div class="flex size-8 items-center justify-center rounded-full bg-primary/10">
          <UIcon
            name="i-lucide-sparkles"
            class="size-4 text-primary"
          />
        </div>
        <div class="leading-tight">
          <p class="text-sm font-semibold text-highlighted">
            Ask CRM Analytics AI
          </p>
          <p class="text-xs text-muted">
            Instant answers about this topic — powered by the Academy docs
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <AiSettings />
        <UButton
          v-if="messages.length"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Clear conversation"
          @click="reset"
        />
      </div>
    </div>

    <!-- Conversation -->
    <div
      v-if="messages.length"
      ref="scroller"
      class="max-h-96 space-y-4 overflow-y-auto px-4 py-4"
    >
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="flex"
        :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-xl px-3 py-2 text-sm"
          :class="m.role === 'user' ? 'bg-primary text-inverted' : 'bg-default text-default border border-default'"
        >
          <MDC
            v-if="m.role === 'assistant' && m.content"
            :value="m.content"
            class="mdc-chat prose prose-sm max-w-none dark:prose-invert"
          />
          <span
            v-else-if="m.role === 'assistant'"
            class="inline-flex gap-1"
          >
            <span class="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <span class="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <span class="size-1.5 animate-bounce rounded-full bg-current" />
          </span>
          <template v-else>
            {{ m.content }}
          </template>
        </div>
      </div>
    </div>

    <!-- Suggestions (empty state) -->
    <div
      v-else-if="!limitReached"
      class="flex flex-wrap gap-2 px-4 pt-4"
    >
      <button
        v-for="s in suggestions"
        :key="s"
        type="button"
        class="rounded-full border border-default px-3 py-1.5 text-xs text-muted transition hover:bg-default hover:text-default"
        @click="submit(s)"
      >
        {{ s }}
      </button>
    </div>

    <!-- Input -->
    <div class="p-4">
      <div
        v-if="limitReached"
        class="rounded-lg bg-default px-3 py-3 text-center text-sm text-muted"
      >
        You've used all {{ questionLimit }} free questions for this session. Add your own AI key
        (⚙️ above) for unlimited use, or come back later.
      </div>
      <template v-else>
        <div class="flex items-end gap-2">
          <UTextarea
            v-model="input"
            :rows="1"
            autoresize
            :maxrows="4"
            placeholder="Ask a question about this page…"
            class="flex-1"
            :disabled="loading"
            @keydown="onKeydown"
          />
          <UButton
            icon="i-lucide-arrow-up"
            color="primary"
            size="md"
            class="rounded-full"
            :disabled="!canSend"
            :loading="loading"
            aria-label="Send"
            @click="submit()"
          />
        </div>
        <p
          v-if="error"
          class="mt-2 text-xs text-error"
        >
          {{ error }}
        </p>
        <p
          v-else
          class="mt-2 flex items-center justify-between text-[11px] text-dimmed"
        >
          <span>CRM Analytics AI can make mistakes. Verify important details.</span>
          <span
            v-if="!hasKey"
            class="shrink-0 tabular-nums"
          >{{ remaining }}/{{ questionLimit }} left</span>
          <span
            v-else
            class="shrink-0"
          >Your key</span>
        </p>
      </template>
    </div>
  </section>
</template>

<style scoped>
.mdc-chat :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
}
.mdc-chat :deep(p:first-child) {
  margin-top: 0;
}
.mdc-chat :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
