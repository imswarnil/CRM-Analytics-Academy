# rag.md — implementing real streaming AI answers on /ask

`ai.md` argues *what* to build and why it stays free. This is the build order
for the generated-answer half: retrieval-augmented generation on Cloudflare's
free tier, streaming token-by-token into the existing `/ask` page.

Today `/ask` does step 1 of RAG (retrieval) and stops — it shows the passages.
This document adds step 2 (generation) without changing that behaviour: the
passage list stays as the trustworthy floor, and the model's answer appears
above it when quota allows.

---

## 0. What already exists

- `public/ask-index.json` — 50 lessons, each `{ path, title, description, headings, text }`, rebuilt on every build by `scripts/build-search-index.mjs`.
- `app/pages/ask.vue` — client-side keyword scoring over that index.
- `server/routes/mcp.post.ts` — reads the same index through the `ASSETS` binding on the Worker, with a `node:fs` fallback in dev. **Reuse that loader**; don't write a second one.

The only genuinely missing pieces are an embedding index and a model call.

---

## 1. Enable the bindings

`wrangler.jsonc` — add alongside the existing `r2_buckets`:

```jsonc
"ai": { "binding": "AI" },
"vectorize": [
  { "binding": "VECTORIZE", "index_name": "crm-analytics-lessons" }
]
```

Create the index once from the CLI (dimensions must match the embedding model;
`bge-base-en-v1.5` is 768):

```bash
npx wrangler vectorize create crm-analytics-lessons \
  --dimensions=768 --metric=cosine
```

Both Workers AI and Vectorize have free allocations. Workers AI is metered in
"neurons" per day; a short answer from an 8B model plus one embedding is a
small number of them, but it is *not* unlimited — section 5 is not optional.

**Deploy note, learned the hard way with R2:** a binding for a product that is
not enabled on the account fails the whole deploy (`code: 10042`). Enable
Workers AI and Vectorize in the dashboard *before* adding these lines, and give
the CI API token the matching permissions (Workers AI: Read, Vectorize: Edit).

---

## 2. Chunk and embed at build time

New `scripts/build-vector-index.mjs`, run manually or from CI after
`build-search-index.mjs` — **not** on every build, since it costs neurons and
the content changes rarely.

Chunking rules that matter more than the model choice:

- Split on `##` headings, not on a fixed character count. A lesson section is a
  self-contained answer; a 500-character window cuts sentences in half.
- Keep chunks 300–800 tokens. Merge sections shorter than ~200 tokens into the
  next one; split anything over ~800 at paragraph boundaries.
- Prefix every chunk with its lesson title and heading before embedding:
  `"CRM Analytics Foundations > The Data Layer\n\n<text>"`. The embedding then
  carries the context a bare paragraph lacks.
- Store `{ path, title, heading, text }` in Vectorize metadata so the answer can
  cite without a second lookup.

```js
// per chunk
const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [chunk.embedText] })
vectors.push({ id: `${chunk.path}#${chunk.i}`, values: data[0], metadata: chunk })
// upsert in batches of ~100
await index.upsert(vectors)
```

Run it against the deployed Worker's bindings via a one-off admin route, or
locally with `wrangler dev --remote` so the bindings are real. Roughly 150–250
chunks for 50 lessons — a single run, cents at most, usually free.

**Re-index trigger:** add a step to the existing translate workflow, or a
manual `workflow_dispatch`. Do not re-embed unchanged chunks — hash the chunk
text and skip matches, the same way `.translation-manifest.json` works.

---

## 3. The streaming endpoint

`server/api/ask.post.ts`:

```ts
export default defineEventHandler(async (event) => {
  const { question } = await readBody(event)
  // 1. validate + rate-limit (copy the Map pattern from submissions.post.ts)
  // 2. embed the question
  const ai = event.context.cloudflare.env.AI
  const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [question] })
  // 3. retrieve
  const matches = await event.context.cloudflare.env.VECTORIZE.query(data[0], {
    topK: 5, returnMetadata: 'all'
  })
  const context = matches.matches
    .map(m => `## ${m.metadata.title} — ${m.metadata.heading}\n${m.metadata.text}`)
    .join('\n\n')
  // 4. generate, streaming
  const stream = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    stream: true,
    max_tokens: 600,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
    ]
  })
  setHeader(event, 'content-type', 'text/event-stream')
  setHeader(event, 'cache-control', 'no-store')
  return stream // Workers AI returns a ReadableStream of SSE; Nitro passes it through
})
```

The system prompt is the whole safety story — spend time here, not on model
choice:

```
You answer questions about Salesforce CRM Analytics using ONLY the provided
lesson context. If the context does not contain the answer, say "The
curriculum doesn't cover that yet" and stop — never use outside knowledge.
Be concise (under 150 words). Cite the lesson titles you used. Never invent
UI paths, SAQL syntax, or feature names that are not in the context.
```

Return the retrieved `path`s to the client too (a first SSE event, or a
response header) so the citation links are exact rather than parsed out of
prose.

---

## 4. Streaming in the page

Two routes, pick by appetite:

**A. Hand-rolled (no new dependency).** `/ask` already fetches JSON; add:

```ts
const res = await fetch('/api/ask', { method: 'POST', body: JSON.stringify({ question }) })
const reader = res.body.getReader()
const decoder = new TextDecoder()
answer.value = ''
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  for (const line of decoder.decode(value).split('\n')) {
    if (!line.startsWith('data: ')) continue
    const payload = line.slice(6)
    if (payload === '[DONE]') break
    answer.value += JSON.parse(payload).response ?? ''
  }
}
```

Render `answer` through the existing prose styling. ~30 lines, zero deps.

**B. Nuxt UI chat components.** `UChatMessages`, `UChatPrompt` and
`UChatPromptSubmit` are already in the installed Nuxt UI and are built around
`@ai-sdk/vue`'s `useChat`. Adding `ai` + `@ai-sdk/vue` gets multi-turn history,
stop/regenerate and loading states for free, but the endpoint must then speak
the AI SDK's data-stream protocol rather than raw Workers AI SSE — a small
adapter. Worth it only if you want a real conversation, not one-shot answers.

Start with A. The page's value is "ask, get an answer with citations", and a
one-shot answer over a passage list is the honest shape of that.

---

## 5. Quotas, cost and degradation (do not skip)

- **Rate-limit per IP** — reuse the in-memory `Map` pattern from
  `server/api/submissions.post.ts`. 10/hour is generous for humans and useless
  for scrapers.
- **Cache answers** — hash the normalised question, store the finished answer
  in KV (or R2) for 30 days. Docs questions repeat heavily; a cache hit costs
  nothing and returns instantly.
- **Track the daily budget** — a KV counter incremented per generation. When it
  crosses your ceiling, stop calling the model and return only the retrieved
  passages with an honest note. The page never breaks; it degrades to what it
  does today.
- **Log every question** (`app.question`: query, retrieved paths, whether the
  user clicked a citation). This is the flywheel from `ai.md` — unanswered
  questions are the lesson backlog, and answered ones prove the feature works.

---

## 6. Order of work

1. Enable Workers AI + Vectorize on the account; add bindings; deploy an empty
   change to prove the deploy still passes. *(Half a day, mostly waiting.)*
2. `build-vector-index.mjs` + one-off run. *(A day.)*
3. `POST /api/ask` with retrieval only, returning the same matches the client
   computes today — proves embeddings beat keywords before any model spend.
4. Add streaming generation + the system prompt. *(A day.)*
5. Quota, cache, logging. *(A day — and the one that keeps it free.)*

If Cloudflare **AutoRAG** is available on the account, it collapses steps 2–3:
point it at an R2 folder of markdown (the `course-lessons/` prefix already
exists in the `crm-analytics-academy` bucket), and it handles chunking,
embedding, and retrieval behind one API. Check the dashboard first — hand-rolled
is the fallback, not the goal.

---

## What "good" looks like

A learner types *"what's the difference between a dataflow and a recipe?"* and
within a second sees: a three-sentence answer in their own language, under it
"From the curriculum: The Data Layer · Creating Datasets", both linked. If the
model is unsure, the answer says so and the passages are still there. Nothing
is invented, nothing costs money, and every question asked quietly tells you
which lesson to write next.
