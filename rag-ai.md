# rag-ai.md — letting people chat with the curriculum, explained from zero

You have 50 markdown lessons and you want a visitor to type a question and get
an answer that comes from *those lessons*, in a chat box, without paying a
per-message bill to OpenAI or Anthropic. You also said you have no idea how
this space works. This document is the missing first chapter: what the pieces
are, what "training" actually means, why you will not train anything, and the
cheapest way to get a real chat that stays free.

The two documents that already exist in this repo pick up where this one ends:
`ai.md` ranks every option by cost, and `rag.md` is the step-by-step build on
Cloudflare. Read this one first.

---

## 1. The four words you need

**Model.** A large language model (LLM) is one big file of numbers, typically
2 to 400 GB, that predicts the next word given the words so far. That is the
whole trick. Ask it a question and it "predicts" an answer one word at a time.
Llama, Mistral, Gemma, Qwen are free, downloadable models. GPT and Claude are
models you can only rent through an API.

**Training.** Producing those numbers. Companies do this once on trillions of
words with thousands of GPUs for months. It costs millions. The model then
knows what was in that data, frozen at that date. Nothing you do on a laptop
is "training" in this sense.

**Fine-tuning.** Nudging an existing model's numbers with a small dataset so
it changes *style or behaviour*, like always answering in a certain format.
It is what people usually mean by "train my own AI on my content". It is also
the wrong tool for facts: a model fine-tuned on 50 lessons will not reliably
recall them, will confidently make up the rest, and goes stale the day you
edit a lesson. It costs GPU hours and a week of your evenings. `ai.md` says
"don't fine-tune anything" and this document agrees.

**RAG.** Retrieval-augmented generation. Instead of putting your lessons *into*
the model, you put the right lesson *in front of* the model at question time.
The model never learns anything; it reads. This is how nearly every "chat
with your docs" product works, and it is what you will build.

That reframing matters, so once more: **you are not going to train a model.
You are going to build a very good librarian, and hand the model the right
page every time someone asks.**

---

## 2. How RAG works, one question at a time

```
 visitor: "what's the difference between a dataflow and a recipe?"
    │
    ▼
 1. EMBED the question ──► a list of ~768 numbers describing its meaning
    │
    ▼
 2. SEARCH a vector index of every lesson chunk, already embedded the same way
    │        (nearest numbers = closest meaning, even with different words)
    ▼
 3. Top 5 chunks: "The Data Layer › Dataflows", "Creating Datasets › Recipes"…
    │
    ▼
 4. PROMPT the model:  "Using ONLY this context: <5 chunks>
    │                    answer: <question>. Cite the lessons. If the
    │                    context doesn't cover it, say so."
    ▼
 5. STREAM the answer to the page, with links to those 5 lessons underneath.
```

Two models are involved, and both are small and free:

| Job | Kind of model | Size | Why it's cheap |
|---|---|---|---|
| Embed (steps 1–2) | embedding model, e.g. `bge-base` | ~100 MB | one pass, no generation |
| Answer (step 4) | small chat model, e.g. Llama 3.x 8B | ~5 GB | reads 5 chunks, writes 150 words |

An **embedding** is just a way to turn text into numbers so that "dataflow
vs recipe" and "which one should I use to build a dataset" land close
together. A **vector index** is a table of those numbers you can search by
distance. That is the entire "AI memory" of the system, and it is rebuilt from
your markdown in seconds whenever a lesson changes.

What the model contributes is only step 4: turning five passages into three
sentences. Everything trustworthy about the answer comes from retrieval, which
is why `rag.md` insists the passage list always stays visible under the
generated text.

---

## 3. Where does the model run? (this decides the cost)

The model is a file that needs a computer with enough RAM or a GPU to run it.
There are exactly three places it can live.

**On your Mac (Ollama).** Free, private, no limits. `ollama run llama3.2`
downloads a 2 GB model and you are chatting in a minute. Perfect for *you*:
testing prompts, checking whether the 8B model answers well from your lessons,
building the pipeline. Useless for *visitors*: your laptop is not a server,
and it is closed at 3 a.m. when someone in Texas asks a question.

**In the visitor's browser (WebLLM).** Free at any scale and nothing leaves
their machine. But the first visit downloads 1–4 GB and needs a desktop GPU.
Most of your readers are on phones or work laptops. A novelty, not the plan.

**On a server (Cloudflare Workers AI).** The site already runs on a Cloudflare
Worker. Cloudflare hosts open models (Llama, bge embeddings) and a vector
database (Vectorize) with a daily free allowance, metered in "neurons". At the
time `ai.md` was written that was 10,000 neurons a day, on the order of a few
hundred short answers. Beyond it, pennies. This is "no expensive API" in
practice: no OpenAI key, no per-seat plan, an open model on infrastructure you
already pay $0 for.

So the honest answer to "local only" for the public chat is: develop and test
locally with Ollama, serve visitors from Cloudflare's free tier, and design for
the day the daily allowance runs out (it degrades to plain search, never
breaks). Your video and voice pipeline stays fully local because *you* are the
only user of it; a public chat box has strangers as users, and they need a
server.

---

## 4. What "my markdown as training data" really buys you

Three things, and you already have two of them:

1. **Crawlability.** Every lesson exists as raw markdown at `/raw/<path>.md`,
   and `llms.txt` / `llms-full.txt` advertise the whole curriculum. This is how
   ChatGPT, Claude and Perplexity come to "know" your site over time, through
   their crawls and search tools. Shipped, free forever.
2. **The MCP server** at `/mcp`. Any AI tool that speaks MCP (Claude, Cursor,
   and more each month) can call `search_lessons` and `get_lesson` and answer
   from your live content using the model its user already pays for. Shipped.
3. **The RAG corpus.** Your lessons, chunked and embedded, sitting behind a
   chat box on the site. Not shipped yet; this is the build.

Notice that in all three the lessons are the product and the model is a
commodity. Every lesson you write improves all three the same day. That is
the real "training", and it is the writing you were going to do anyway.

---

## 5. The plan

### Weekend 1: see it work on your Mac, zero code

```bash
brew install ollama
ollama serve &
ollama pull llama3.2          # 2 GB chat model
ollama pull nomic-embed-text  # 270 MB embedding model
```

Then open the chat and paste a whole lesson from `/raw/foundations/the-data-layer.md`
followed by a question. That is RAG by hand: you did the retrieval, the model
did the reading. Ask it something the lesson does not cover and watch it
either admit it or make something up. That second behaviour is what the
system prompt in `rag.md` exists to suppress.

### Weekend 2: a local RAG over the real index

`public/ask-index.json` already holds every lesson as plain text. A 60-line
Node script can embed each entry with Ollama's `nomic-embed-text`, keep the
vectors in a JSON file, embed a question the same way, pick the top 5 by
cosine similarity, and hand them to `llama3.2` with the system prompt from
`rag.md` section 3. No Cloudflare, no account, nothing leaves the laptop. This
is where you tune chunk size and the prompt until the answers are good; every
lesson learned here transfers unchanged to the production version.

### Then: the production version

Follow `rag.md` top to bottom. It is the same pipeline with the Ollama calls
swapped for Cloudflare's `AI` and `VECTORIZE` bindings, plus the three things
that keep it free: a per-IP rate limit, an answer cache, and a daily budget
counter that switches the page back to passages-only when the allowance is
gone. Four or five days of work, and `ai.md` section 3 explains every choice.

---

## 6. Glossary for the rest of the reading

| Word | Plain meaning |
|---|---|
| Token | Roughly ¾ of a word. Models read and are billed in tokens. A lesson is ~1,500 tokens. |
| Context window | How many tokens the model can read at once. Small models: 8k–128k. Five chunks fit easily. |
| Prompt | Everything you send the model: instructions plus the question plus the retrieved chunks. |
| System prompt | The instruction part. "Answer only from the context, cite lessons, say when you don't know." |
| Hallucination | The model writing something fluent and false. Retrieval plus a strict system prompt is the cure. |
| Embedding | Text turned into a list of numbers so meaning can be compared by distance. |
| Vector database | A store that finds the nearest embeddings fast. Vectorize on Cloudflare; a JSON file locally. |
| Chunk | One heading section of a lesson, 300–800 tokens, the unit that gets embedded and retrieved. |
| Inference | Running a model to get an answer. The thing that is metered. Training is not something you do. |
| Neurons | Cloudflare's unit for Workers AI usage. A free daily allowance, then pennies. |
| Ollama | The app that runs open models on your Mac with one command. |
| Streaming | Sending the answer word by word as it is generated, so the page feels instant. |

---

## 7. What not to believe

- **"Train a model on my docs."** You will not; see section 1. Anyone selling
  you this is selling fine-tuning, and it is the wrong tool for facts.
- **"It learns from every conversation."** Nothing here learns. What improves
  is the corpus, and the way it improves is the flywheel in `ai.md`: log the
  questions, write the lessons people were asking for.
- **"Free API trial."** Trials end, keys leak, and the feature dies the week
  traffic arrives. Open models on your own infrastructure or nothing.
- **"Bigger model, better answers."** For grounded questions over five good
  passages, an 8B model is enough. Retrieval quality and the system prompt
  matter far more than parameter count. Fix those first.
