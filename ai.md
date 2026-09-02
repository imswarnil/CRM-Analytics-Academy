# ai.md — chat over the curriculum, without paying for models

The goal: a visitor asks "how do I make a date toggle facet my dashboard?" and
gets an answer grounded in *our* 49 lessons, with links to them. No OpenAI
bill, no per-seat anything. This document ranks every realistic way to get
there, cheapest-first, and ends with the recommended build.

A framing correction first, because it changes what we build: a chat feature
does **not** "train a model" on the site, and nothing affordable does. What
improves over time in a RAG system is the *retrieval corpus* — every lesson we
add makes answers better the same day. The thing that actually gets public AI
models to "know" the site over time is crawlability, and that part is already
shipped: every page exists as raw markdown at `/raw/<path>.md`, and `llms.txt`
/ `llms-full.txt` advertise the whole curriculum to agents and crawlers. That
is the site's "training" story, and it costs nothing forever.

---

## The options, cheapest first

### 0. What already works today ($0, shipped)

Anyone can paste `https://crmanalytics.imswarnil.com/llms-full.txt` into
ChatGPT, Claude, or Perplexity and chat with the curriculum using *their* AI
subscription. Worth advertising on the site (a "Chat with this course in your
AI tool" box) before building anything — it is the zero-effort version of
everything below.

### 1. Retrieval without an LLM ($0 forever, no limits)

Not chat — but 80% of the value. A question box that embeds nothing and
generates nothing: it runs the existing client-side search index
(`queryCollectionSearchSections`) over the question's keywords and shows the
**exact lesson passages** that answer it, linked and highlighted. No quota, no
latency, works in all 12 languages, never hallucinates.

- Effort: ~1 day. A `/ask` page reusing the search dump we already ship.
- Weakness: it finds passages, it doesn't synthesize. "Compare dataflow vs
  recipe" returns two lessons, not a comparison.

### 2. MCP server — other people's models do the work ($0 inference, ever)

Expose the curriculum as an **MCP server on our existing Worker**: tools like
`search_lessons(query)`, `get_lesson(path)`, `list_curriculum()`. Anyone using
Claude, Cursor, or any MCP-capable client connects
`https://crmanalytics.imswarnil.com/mcp` and their own model — which *they*
already pay for or use free — answers questions grounded in our content.

- This is the strongest version of "my site becomes an AI resource": agents
  pull live, structured lessons instead of stale crawl data.
- Cloudflare's `McpAgent` runs on the Worker we already deploy; the tools are
  thin wrappers over the content we already serve at `/raw`.
- Effort: ~1–2 days. Zero ongoing cost at any scale, because we never run a
  model.
- Weakness: serves AI-tool users, not the casual visitor who just wants a
  chat box on the site.

### 3. Cloudflare Workers AI + Vectorize — real RAG chat on the free tier (recommended)

We are already on Cloudflare. Workers AI's free allocation (10,000
"neurons"/day as of writing) covers a small open model (Llama 3.x 8B
instruct) plus the `bge` embedding models, and **Vectorize** (their vector
database) has a free tier comfortably larger than our corpus — 49 lessons
chunk to roughly 1–2k vectors, a rounding error against its limits.

The shape:

1. **Index at build time** — a script chunks `content/en/**` by heading
   (~500 tokens, with the lesson path + title as metadata), embeds each chunk
   with `@cf/baai/bge-base-en-v1.5`, and upserts to a Vectorize index. Runs in
   CI only when `content/en/**` changes — the same trigger the translation
   workflow uses.
2. **`POST /api/ask`** on the Worker — embed the question, query Vectorize for
   the top 5 chunks, and prompt the small Llama with: the chunks, the
   question, "answer only from the context, cite lesson paths, say 'I don't
   know' otherwise". Stream the response. Return the source paths so the UI
   renders "From: Designing Dashboards → Date Toggles & Faceting" links.
3. **`/ask` page** — a chat UI (Nuxt UI has chat components: `UChatMessages`,
   `UChatPrompt`) with the option-1 passage list rendered *alongside* the
   generated answer, so even a wrong generation ships the right links.
4. **Quotas are the design constraint, so design for them**: ~10k neurons/day
   is on the order of a few hundred short 8B answers. Rate-limit per IP (the
   submissions route already has the pattern), cache answers for repeated
   questions in KV, and when the daily quota is gone, degrade to option 1 —
   the passage answer — with a "generated answers are resting until tomorrow"
   note. The feature never breaks, it just gets less magical at the margin.
- Effort: ~3–4 days including the indexer, endpoint, UI, quota handling.
- Cost: $0 until traffic is far beyond current levels; then pennies.
- Honest weakness: an 8B model summarizing retrieved chunks is good, not
  GPT-4-good. The citations are what make it trustworthy.

Cloudflare also has **AutoRAG** (managed RAG over an R2 bucket — and we
already have the `crm-analytics-academy` bucket with a `course-lessons/`
folder waiting). If it is enabled on our account it replaces step 1 and most
of step 2 with configuration. Worth checking first; the hand-rolled version
above is the fallback and teaches us more.

### 4. In-browser LLM — WebLLM ($0, but heavy)

Run a small model in the visitor's browser via WebGPU (WebLLM / transformers.js),
retrieval over a shipped embedding file. Genuinely free at infinite scale and
private by construction — but the first load pulls a 1–4 GB model, needs a
modern desktop GPU, and excludes most phones. Good as a later "offline mode"
novelty, wrong as the primary path for a docs site.

### 5. Bring-your-own-key (fallback, $0 to us)

A settings field where a user pastes their own free-tier key (Groq's free
Llama tier, Gemini's free tier). We store it in localStorage and call from the
browser. Zero cost to the site and better model quality than option 3 — but
asking normal learners for API keys is a conversion killer. Ship only as a
power-user extra.

---

## Recommendation

Do them in this order — each step ships value alone and none is wasted by the
next:

1. **Now:** an `/ask` page with retrieval-only answers (option 1) plus a
   "use this course in ChatGPT/Claude" copy-paste box for `llms-full.txt`
   (option 0). One day, zero risk, zero cost, works forever.
2. **Next:** the Workers AI + Vectorize RAG behind the same page (option 3) —
   generated answers appear above the passage list when quota allows, with
   citations always. Check AutoRAG availability first; hand-roll otherwise.
3. **Then:** the MCP server (option 2), announced on the site — it turns the
   academy into infrastructure other people's AI agents build on, which is the
   real long-game version of "the site trains AI".

## The improvement flywheel (the honest version of "it learns")

Log every question asked (we have a database; an `app.question` table with
the query, the retrieved paths, and whether the user clicked through). A
monthly look at unanswered or badly-answered questions is a *lesson
commissioning list* — the corpus grows where real learners are confused, the
RAG improves the same day the lesson merges, and the public models improve on
the next crawl. That loop — questions → lessons → better answers — is the
only "training" that is actually free.

## What not to do

- Don't fine-tune anything. Fine-tuning on 49 lessons buys hallucinated
  confidence, costs real money, and goes stale with every content edit.
- Don't proxy to a free-trial commercial API and hope. Trials expire, keys
  leak, and the feature dies the week traffic arrives.
- Don't let the chat write to anything. Read-only tools, rate limits, and
  "answer only from context" — a public LLM endpoint on a domain with auth
  and a database is an attack surface first and a feature second.
