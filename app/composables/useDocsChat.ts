export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SendOptions {
  // When set, the server prioritises sections from this docs page so answers
  // about the page the user is reading come back faster and more on-topic.
  pagePath?: string
  pageTitle?: string
}

// Max questions allowed per browser session, shared across every chat surface
// (floating widget + inline docs chat) to keep token usage in check.
const QUESTION_LIMIT = 3
const STORAGE_KEY = 'crmai-chat-used'

// Module-level so all useDocsChat() instances share the same counter.
const usedQuestions = ref(0)
let restored = false

function restoreCount() {
  if (restored || !import.meta.client) return
  restored = true
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  const n = raw ? Number.parseInt(raw, 10) : 0
  usedQuestions.value = Number.isFinite(n) ? n : 0
}

function persistCount() {
  if (import.meta.client) window.sessionStorage.setItem(STORAGE_KEY, String(usedQuestions.value))
}

/**
 * Client-side controller for the "CRM Analytics AI" assistant.
 * Each call returns its own isolated conversation state, but the per-session
 * question quota is shared across all instances.
 */
export function useDocsChat() {
  const { locale } = useI18n()

  restoreCount()

  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref('')

  const remaining = computed(() => Math.max(0, QUESTION_LIMIT - usedQuestions.value))
  const limitReached = computed(() => remaining.value === 0)

  async function send(text: string, opts: SendOptions = {}) {
    const content = text.trim()
    if (!content || loading.value) return

    if (limitReached.value) {
      error.value = `You've reached the limit of ${QUESTION_LIMIT} questions for this session.`
      return
    }

    error.value = ''
    messages.value.push({ role: 'user', content })
    const assistant = reactive<ChatMessage>({ role: 'assistant', content: '' })
    messages.value.push(assistant)
    loading.value = true

    // Count the question up front so it can't be bypassed by rapid submits.
    usedQuestions.value += 1
    persistCount()

    // Refund the counted question — a failed/rate-limited request shouldn't burn
    // the session quota.
    const refund = () => {
      usedQuestions.value = Math.max(0, usedQuestions.value - 1)
      persistCount()
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Send prior turns (exclude the empty assistant placeholder).
          messages: messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          locale: locale.value,
          pagePath: opts.pagePath,
          pageTitle: opts.pageTitle
        })
      })

      if (!res.ok || !res.body) {
        refund()
        if (res.status === 429) {
          // Show the real reason clearly, in the chat itself.
          assistant.content = '⚠️ **CRM Analytics AI has reached its usage limit for now.** This is a temporary Gemini free-tier cap — please try again in a little while.'
        } else {
          messages.value.pop()
          error.value = 'Something went wrong. Please try again.'
        }
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        assistant.content += decoder.decode(value, { stream: true })
      }
      if (!assistant.content) {
        assistant.content = '_No response was returned. Please try again._'
      }
    } catch {
      if (!assistant.content) {
        refund()
        messages.value.pop()
        error.value = 'Something went wrong. Please try again.'
      }
    } finally {
      loading.value = false
    }
  }

  function reset() {
    // Clears the visible conversation only — the session quota is intentionally
    // preserved so "New chat" can't be used to reset the limit.
    messages.value = []
    error.value = ''
  }

  return { messages, loading, error, send, reset, remaining, limitReached, questionLimit: QUESTION_LIMIT }
}
