<script setup lang="ts">
const { messages, loading, error, send, reset, remaining, limitReached, questionLimit, usingOwn } = useDocsChat()

const open = ref(false)
const input = ref('')
const scroller = ref<HTMLElement | null>(null)

const canSend = computed(() => input.value.trim().length > 0 && !loading.value && !limitReached.value)

const suggestions = [
  'What is a dataset in CRM Analytics?',
  'Write a SAQL query to sum revenue by region',
  'How do bindings work in dashboards?'
]

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
  await send(content)
  scrollToBottom()
}

// Keep the view pinned to the latest tokens as they stream in.
watch(() => messages.value.at(-1)?.content, scrollToBottom)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}
</script>

<template>
  <ClientOnly>
    <!-- Launcher -->
    <UButton
      v-show="!open"
      icon="i-lucide-sparkles"
      color="primary"
      size="lg"
      class="fixed bottom-4 right-4 z-50 rounded-full shadow-lg sm:bottom-6 sm:right-6"
      aria-label="Ask CRM Analytics AI"
      @click="open = true"
    >
      <span class="max-sm:hidden">Ask AI</span>
    </UButton>

    <!-- Panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden border border-default bg-default shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[400px] sm:rounded-xl h-[85vh] rounded-t-xl"
      >
        <!-- Header -->
        <header class="flex items-center justify-between gap-2 border-b border-default px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <UIcon
                name="i-lucide-sparkles"
                class="size-4 text-primary"
              />
            </div>
            <div class="leading-tight">
              <p class="text-sm font-semibold">
                CRM Analytics AI
              </p>
              <p class="text-xs text-muted">
                Trained on the Academy docs
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
              aria-label="New chat"
              @click="reset"
            />
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Close"
              @click="open = false"
            />
          </div>
        </header>

        <!-- Messages -->
        <div
          ref="scroller"
          class="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          <!-- Empty state -->
          <div
            v-if="!messages.length"
            class="flex h-full flex-col justify-center gap-4"
          >
            <p class="text-center text-sm text-muted">
              Ask me anything about Salesforce CRM Analytics — datasets, SAQL, dashboards, bindings, and more.
            </p>
            <div class="space-y-2">
              <button
                v-for="s in suggestions"
                :key="s"
                type="button"
                class="w-full rounded-lg border border-default px-3 py-2 text-left text-sm text-muted transition hover:bg-elevated hover:text-default"
                @click="submit(s)"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Conversation -->
          <div
            v-for="(m, i) in messages"
            :key="i"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] rounded-xl px-3 py-2 text-sm"
              :class="m.role === 'user'
                ? 'bg-primary text-inverted'
                : 'bg-elevated text-default'"
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

          <p
            v-if="error"
            class="text-center text-xs text-error"
          >
            {{ error }}
          </p>
        </div>

        <!-- Input -->
        <div class="border-t border-default p-3">
          <div
            v-if="limitReached"
            class="rounded-lg bg-elevated px-3 py-2.5 text-center text-xs text-muted"
          >
            You've used all {{ questionLimit }} free questions for this session. Add your own AI key
            (⚙️ top-right) for unlimited use, or come back later.
          </div>
          <template v-else>
            <div class="flex items-end gap-2">
              <UTextarea
                v-model="input"
                :rows="1"
                autoresize
                :maxrows="4"
                placeholder="Ask CRM Analytics AI…"
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
            <p class="mt-2 flex items-center justify-between text-[11px] text-dimmed">
              <span>AI can make mistakes. Verify important details.</span>
              <span
                v-if="!usingOwn"
                class="shrink-0 tabular-nums"
              >{{ remaining }}/{{ questionLimit }} left</span>
              <span
                v-else
                class="shrink-0"
              >Your key</span>
            </p>
          </template>
        </div>
      </div>
    </Transition>
  </ClientOnly>
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
