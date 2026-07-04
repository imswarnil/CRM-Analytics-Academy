// Multi-provider LLM streaming. Each user can bring their own provider + key
// (sent per-request from the browser; never stored server-side). Falls back to
// the site's Gemini key when the user hasn't set one.

export interface LlmMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LlmRequest {
  provider: string
  apiKey: string
  model: string
  system: string
  messages: LlmMessage[]
  maxTokens?: number
}

export const SUPPORTED_PROVIDERS = ['gemini', 'openai', 'groq', 'openrouter', 'anthropic'] as const

// OpenAI-compatible chat-completions providers (same wire format, different host).
const OPENAI_COMPATIBLE: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1'
}

/** Fire the streaming request to the chosen provider. Returns the raw Response. */
export function fetchLlmStream(req: LlmRequest): Promise<Response> {
  const { provider, apiKey, model, system, messages, maxTokens = 800 } = req

  if (provider === 'gemini') {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
    return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens, thinkingConfig: { thinkingBudget: 0 } }
      })
    })
  }

  if (provider === 'anthropic') {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        stream: true,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    })
  }

  const base = OPENAI_COMPATIBLE[provider]
  if (base) {
    return fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.3,
        max_tokens: maxTokens,
        messages: [{ role: 'system', content: system }, ...messages]
      })
    })
  }

  throw new Error(`Unsupported provider: ${provider}`)
}

// Pull the text delta out of one parsed SSE JSON payload for the given provider.
function extractDelta(provider: string, json: Record<string, unknown>): string {
  if (provider === 'gemini') {
    const parts = (json as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      .candidates?.[0]?.content?.parts
    return Array.isArray(parts) ? parts.map(p => p?.text || '').join('') : ''
  }
  if (provider === 'anthropic') {
    if (json.type === 'content_block_delta') {
      return (json as { delta?: { text?: string } }).delta?.text || ''
    }
    return ''
  }
  // OpenAI-compatible
  return (json as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content || ''
}

/** Convert a provider's SSE response body into a plain-text ReadableStream. */
export function sseToTextStream(provider: string, upstreamBody: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamBody.getReader()
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const payload = trimmed.slice(5).trim()
            if (!payload || payload === '[DONE]') continue
            try {
              const text = extractDelta(provider, JSON.parse(payload))
              if (text) controller.enqueue(encoder.encode(text))
            } catch {
              // Ignore keep-alives / partial lines.
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode('\n\n_(The response was interrupted.)_'))
      } finally {
        controller.close()
      }
    }
  })
}
