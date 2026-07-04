export interface AiSettings {
  provider: string
  model: string
  apiKey: string
}

export interface AiProvider {
  id: string
  label: string
  defaultModel: string
  keyUrl: string
  note?: string
}

// Providers a visitor can bring their own key for. Order = display order.
export const AI_PROVIDERS: AiProvider[] = [
  { id: 'gemini', label: 'Google Gemini', defaultModel: 'gemini-2.0-flash', keyUrl: 'https://aistudio.google.com/apikey', note: 'Free tier available' },
  { id: 'groq', label: 'Groq', defaultModel: 'llama-3.3-70b-versatile', keyUrl: 'https://console.groq.com/keys', note: 'Free, very fast' },
  { id: 'openrouter', label: 'OpenRouter', defaultModel: 'meta-llama/llama-3.3-70b-instruct:free', keyUrl: 'https://openrouter.ai/keys', note: 'Has free models' },
  { id: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o-mini', keyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', label: 'Anthropic Claude', defaultModel: 'claude-haiku-4-5', keyUrl: 'https://console.anthropic.com/settings/keys' }
]

const STORAGE_KEY = 'crma-ai-settings'

/**
 * Bring-your-own-key AI settings, persisted in localStorage and shared across
 * every chat surface. When a key is set, the chat uses the visitor's own
 * provider/model instead of the site's shared Gemini key.
 */
export function useAiSettings() {
  const settings = useState<AiSettings>('crma-ai-settings', () => ({ provider: 'gemini', model: '', apiKey: '' }))
  const loaded = useState('crma-ai-settings-loaded', () => false)

  if (import.meta.client && !loaded.value) {
    loaded.value = true
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) settings.value = { ...settings.value, ...JSON.parse(raw) }
    } catch {
      // ignore malformed storage
    }
  }

  function persist() {
    if (import.meta.client) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  }

  function save(next: Partial<AiSettings>) {
    settings.value = { ...settings.value, ...next }
    persist()
  }

  function clearKey() {
    settings.value = { ...settings.value, apiKey: '' }
    persist()
  }

  const hasKey = computed(() => settings.value.apiKey.trim().length > 0)
  const provider = computed(() => AI_PROVIDERS.find(p => p.id === settings.value.provider) ?? AI_PROVIDERS[0]!)
  const activeModel = computed(() => settings.value.model.trim() || provider.value.defaultModel)

  return { settings, save, clearKey, hasKey, provider, activeModel, providers: AI_PROVIDERS }
}
