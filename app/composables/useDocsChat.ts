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
  const ai = useAiSettings()

  restoreCount()

  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref('')

  const remaining = computed(() => Math.max(0, QUESTION_LIMIT - usedQuestions.value))
  // The per-session cap only applies to the site's shared key. Visitors using
  // their own key have no cap (it's their own quota).
  const limitReached = computed(() => !ai.usingOwn.value && remaining.value === 0)

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

    // Only count against the per-session cap when using the site's shared key.
    const counted = !ai.usingOwn.value
    if (counted) {
      usedQuestions.value += 1
      persistCount()
    }

    // Refund the counted question — a failed/rate-limited request shouldn't burn
    // the session quota.
    const refund = () => {
      if (!counted) return
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
          pageTitle: opts.pageTitle,
          // Bring-your-own-key — only sent when the user opted in; otherwise
          // blank so the server uses the site's shared model.
          provider: ai.usingOwn.value ? ai.settings.value.provider : '',
          model: ai.usingOwn.value ? ai.activeModel.value : '',
          apiKey: ai.usingOwn.value ? ai.settings.value.apiKey : ''
        })
      })

      if (!res.ok || !res.body) {
        refund()
        // Surface the server's specific reason and guide the user to fix it.
        let serverMsg = ''
        try {
          const j = JSON.parse(await res.text())
          serverMsg = j.statusMessage || j.message || ''
        } catch {
          // non-JSON error body
        }
        if (res.status === 400) {
          // No key configured, or the key/model was rejected.
          assistant.content = `⚙️ **${serverMsg || 'No AI model is set up.'}**\n\nOpen the settings gear (top-right of this chat) and add your own API key — Google Gemini, OpenAI, Anthropic Claude, Groq, or OpenRouter — then ask again.`
        } else if (res.status === 429) {
          assistant.content = `⚠️ **${serverMsg || 'CRM Analytics AI has reached its usage limit for now.'}** Add your own AI key in settings for uninterrupted use.`
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

  return { messages, loading, error, send, reset, remaining, limitReached, questionLimit: QUESTION_LIMIT, usingOwn: ai.usingOwn }
}
