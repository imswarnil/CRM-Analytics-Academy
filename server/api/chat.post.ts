import { queryCollectionSearchSections } from '@nuxt/content/server'
import { fetchLlmStream, sseToTextStream, SUPPORTED_PROVIDERS } from '../utils/llm'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatBody {
  messages?: ChatMessage[]
  locale?: string
  // Path of the docs page the user is currently reading; its sections get a
  // relevance boost so on-page questions resolve faster and stay on-topic.
  pagePath?: string
  pageTitle?: string
  // Optional bring-your-own-key: provider + model + key from the browser.
  provider?: string
  model?: string
  apiKey?: string
}

// Words too common to be useful for keyword scoring.
const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'was', 'were', 'you', 'your', 'can', 'how', 'what',
  'why', 'who', 'when', 'where', 'this', 'that', 'with', 'from', 'have', 'has',
  'does', 'did', 'about', 'into', 'will', 'would', 'should', 'could', 'them',
  'they', 'there', 'here', 'which', 'while', 'a', 'an', 'of', 'to', 'in', 'is',
  'it', 'do', 'i', 'me', 'my', 'on', 'or', 'be', 'as', 'at', 'so', 'we'
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t))
}

// Kept deliberately tight to limit input tokens (and cost) per request.
const MAX_SECTIONS = 5
const MAX_SECTION_CHARS = 1100
const MAX_CONTEXT_CHARS = 6000

export default defineEventHandler(async (event) => {
  const { geminiApiKey, geminiModel } = useRuntimeConfig(event)

  const body = await readBody<ChatBody>(event)
  const messages = (body?.messages ?? []).filter(m => m?.content?.trim())
  if (!messages.length) {
    throw createError({ statusCode: 400, statusMessage: 'No messages provided.' })
  }

  // Resolve which model to use: the user's own provider+key if supplied,
  // otherwise the site's default Gemini key.
  const userKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''
  const userProvider = typeof body?.provider === 'string' ? body.provider : ''
  const usingUserKey = Boolean(userKey && SUPPORTED_PROVIDERS.includes(userProvider as never))

  const provider = usingUserKey ? userProvider : 'gemini'
  const apiKey = usingUserKey ? userKey : geminiApiKey
  const model = usingUserKey && body?.model?.trim() ? body.model.trim() : geminiModel

  if (!apiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No AI key configured. Add your own API key in the chat settings to start chatting.'
    })
  }

  const locale = (body?.locale || 'en').replace(/[^a-z]/g, '') || 'en'
  const pagePath = typeof body?.pagePath === 'string' ? body.pagePath : ''
  const pageTitle = typeof body?.pageTitle === 'string' ? body.pageTitle.slice(0, 120) : ''
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  const query = lastUser?.content ?? ''
  const queryTokens = tokenize(query)

  // --- Retrieval: keyword-score the docs sections for the current locale. ---
  const allSections = await queryCollectionSearchSections(event, 'docs')
  const localeSections = allSections.filter(
    s => s.id?.startsWith(`/${locale}/`) || s.id === `/${locale}`
  )

  const allScored = localeSections.map((s) => {
    const haystackTitle = (`${s.title} ${(s.titles || []).join(' ')}`).toLowerCase()
    const haystackBody = (s.content || '').toLowerCase()
    let score = 0
    for (const token of queryTokens) {
      if (haystackTitle.includes(token)) score += 5
      // Cap per-token body hits so one common word (e.g. "page") in a long
      // section can't swamp genuinely relevant matches.
      const matches = haystackBody.split(token).length - 1
      score += Math.min(matches, 3)
    }
    const onCurrentPage = Boolean(pagePath && s.id?.startsWith(pagePath))
    return { section: s, score, onCurrentPage }
  })

  // When the user is reading a specific page, guarantee that page is in context
  // (so on-page questions always resolve on-topic and fast). Reserve up to 3
  // slots for its best-matching sections — or its first sections if nothing
  // matched — then fill the rest with the strongest matches from anywhere.
  const picked: typeof allScored = []
  if (pagePath) {
    const onPage = allScored.filter(s => s.onCurrentPage)
    const onPageMatched = onPage.filter(s => s.score > 0).sort((a, b) => b.score - a.score)
    // Let the current page claim most of the context window so on-page
    // questions answer from it rather than incidental matches elsewhere.
    const reserved = onPageMatched.length ? onPageMatched.slice(0, 4) : onPage.slice(0, 3)
    picked.push(...reserved)
  }

  const pickedIds = new Set(picked.map(p => p.section.id))
  for (const s of allScored.filter(s => s.score > 0).sort((a, b) => b.score - a.score)) {
    if (picked.length >= MAX_SECTIONS) break
    if (pickedIds.has(s.section.id)) continue
    picked.push(s)
    pickedIds.add(s.section.id)
  }
  const scored = picked.slice(0, MAX_SECTIONS)

  let contextChars = 0
  const contextBlocks: string[] = []
  for (const { section } of scored) {
    const heading = [section.title, ...(section.titles || [])].filter(Boolean).join(' › ')
    const snippet = (section.content || '').slice(0, MAX_SECTION_CHARS)
    const block = `## ${heading}\nSource: ${section.id}\n\n${snippet}`
    if (contextChars + block.length > MAX_CONTEXT_CHARS) break
    contextBlocks.push(block)
    contextChars += block.length
  }
  const context = contextBlocks.join('\n\n---\n\n')

  const systemInstruction = [
    'You are "CRM Analytics AI", the expert assistant for CRM Analytics Academy — a free learning site for Salesforce CRM Analytics (data prep, SAQL, dashboards, bindings, and Einstein Discovery).',
    'You know this site\'s documentation deeply. Answer the user\'s question using the documentation context below as your source of truth. Be confident, direct, and genuinely helpful — like an experienced instructor.',
    'If the specific answer is not in the context, do not invent facts: say it is not covered in the docs yet and point the user to the closest relevant topic or what to search for.',
    'Be brief and to the point — aim for 3-6 sentences or a short bullet list. Skip preamble and lead with the answer. Use Markdown with code fences for SAQL/JSON. Only add a short example when it genuinely helps.',
    'When you rely on a specific page, you may reference its path.',
    pagePath
      ? `The user is currently reading the page "${pageTitle || pagePath}" (${pagePath}). Unless they clearly ask about a different topic, focus your answer on this page and its context.`
      : '',
    '',
    context
      ? `--- DOCUMENTATION CONTEXT ---\n${context}`
      : '--- DOCUMENTATION CONTEXT ---\n(No matching documentation was found for this question.)'
  ].join('\n')

  const upstream = await fetchLlmStream({
    provider,
    apiKey,
    model,
    system: systemInstruction,
    messages,
    maxTokens: 600
  }).catch(() => null)

  if (!upstream || !upstream.ok || !upstream.body) {
    const status = upstream?.status ?? 502
    const detail = upstream ? await upstream.text().catch(() => '') : ''
    // Distinguish the common failure modes so the client can show a clear message.
    let statusCode = 502
    let statusMessage = `Upstream LLM error (${status}). ${detail.slice(0, 300)}`
    if (status === 429) {
      statusCode = 429
      statusMessage = usingUserKey
        ? 'Your AI provider is rate-limited or out of quota. Try again shortly.'
        : 'The assistant is temporarily rate-limited. Add your own AI key in settings for uninterrupted use.'
    } else if (status === 401 || status === 403) {
      statusCode = 400
      statusMessage = 'Your API key was rejected. Check the key and model in chat settings.'
    }
    throw createError({ statusCode, statusMessage })
  }

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'X-Accel-Buffering', 'no')

  return sseToTextStream(provider, upstream.body)
})
