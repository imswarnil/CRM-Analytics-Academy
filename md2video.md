# md2video.md — turning lessons into video, for free

Every lesson is already structured prose with headings, code and screenshots.
This document is about generating watchable video from that, without paying a
per-minute AI video service and without a GPU.

The honest framing first: **an AI-generated talking head reading a lesson is
worse than the lesson.** People watch CRM Analytics videos to see the product —
where the Data Manager lives, what a recipe node looks like when it runs. What
generative tooling is genuinely good at is the *scaffolding* around that: a
narrated slide deck, chapter cards, intros, and audio. So the pipeline below
produces a real, useful artefact — a narrated visual walkthrough — and marks
clearly where a human screen recording still beats anything automated.

The site already ships a video-led curriculum sourced from an existing training
recording. This is about producing *our own* clips for lessons that have none,
and short social cuts.

---

## The free stack

| Stage | Tool | Why it's free |
|---|---|---|
| Script | The lesson markdown itself, lightly trimmed | already written |
| Voice | **Piper** or **Kokoro** TTS, run locally/CI | open weights, CPU-only, no API |
| Visuals | **Slidev** (markdown → deck) or **Remotion** (React → video) | open source, renders headless |
| Screen capture | OBS / macOS screen recording, by hand | free, and the only honest way to show the product |
| Assembly | **ffmpeg** | free |
| Rendering compute | **GitHub Actions** | free minutes are unlimited for public repos |
| Hosting | **R2** (`course-lessons/` prefix exists) or YouTube | already provisioned |

The compute line is the one that makes this work: this repo is public, so
Actions minutes cost nothing. A render job that would melt the 2-vCPU
LibreTranslate VPS runs happily on a GitHub runner.

---

## Pipeline A — narrated slide walkthrough (recommended)

Markdown in, MP4 out, no avatar, no hallucination risk.

**1. Lesson → deck.** [Slidev](https://sli.dev) already consumes markdown.
A script converts a lesson to a Slidev deck: `#`/`##` become slide titles,
paragraphs become bullet points (trimmed to ~12 words), code fences become
code slides with Slidev's built-in highlighting, images become full-bleed
slides. Keep one idea per slide.

**2. Lesson → narration script.** *Not* the same text as the slides. Slides
carry keywords; narration carries sentences. The lesson's own prose is already
the narration — strip headings, code blocks and links, keep the sentences.
Store it as a per-slide array so audio and slides stay in sync.

**3. Narration → audio.** [Piper](https://github.com/rhasspy/piper) is the
pragmatic choice: a single binary, CPU-only, a few hundred MB per voice, and
genuinely decent English. [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M)
sounds better and still runs on CPU if you can spare the setup. Both are open
weights — no key, no quota, no per-character billing.

```bash
echo "$NARRATION" | piper --model en_US-lessac-medium.onnx --output_file slide-03.wav
```

Generate one file per slide, then read each clip's duration with `ffprobe` —
that duration *is* the slide's on-screen time. Never guess timings.

**4. Deck → frames.** `slidev export --format png` gives one PNG per slide.

**5. Assemble.** ffmpeg turns (image, audio) pairs into clips and concatenates:

```bash
ffmpeg -loop 1 -i slide-03.png -i slide-03.wav \
  -c:v libx264 -tune stillimage -c:a aac -pix_fmt yuv420p -shortest slide-03.mp4
# then: concat demuxer over all slide-NN.mp4, plus an intro/outro card
```

Add a subtle Ken Burns zoom (`zoompan`) so slides aren't static — it costs one
filter and makes the result look intentional.

**6. Captions.** Because the narration text and per-slide durations are both
known, the `.srt` is generated arithmetically — no speech recognition needed,
and it's exact. Burn in for social cuts, keep as a sidecar for YouTube.

**7. Publish.** Upload to R2 under `course-lessons/<lesson-slug>/` (the folder
already exists) and reference it from the lesson's frontmatter, or upload to
YouTube and use the existing `video: { id, start, end }` field — the lesson
page renders either without code changes.

**Where this runs:** a `workflow_dispatch` GitHub Action taking a lesson path,
doing steps 1–6, and attaching the MP4 as an artifact for review before
publish. Never auto-publish a generated video.

---

## Pipeline B — Remotion, for polish

[Remotion](https://remotion.dev) renders video from React components, so
animation, charts, code typing effects and lower-thirds are all just
components. Free for individuals and small teams (check its licence for your
case); rendering is `npx remotion render`, headless and CPU-friendly.

Use it when the lesson benefits from *motion*: an animated dataflow diagram, a
SAQL query building line by line, a KPI counting up. The `ModuleThumb.vue` SVGs
already in the repo are a natural starting vocabulary — the same scenes,
animated. Heavier to author than Slidev; better ceiling.

---

## Pipeline C — talking-head avatar (only if you want a face)

Free and self-hosted: **SadTalker** or **Wav2Lip** animate a single still photo
from an audio file. Quality is "uncanny but passable at small sizes", and both
really want a GPU — a CPU render is minutes per second of output. Paid services
(HeyGen, Synthesia, D-ID) look better and cost per minute.

My recommendation: skip it. For a technical curriculum, a clear slide with good
narration outperforms a synthetic presenter, and a *real* 30-second intro of
you on a phone camera beats both for trust.

---

## Where AI actually helps here

Use a model for the parts that are language work, not the parts that are
truth-telling:

- **Condensing** a 900-word lesson into a 150-word narration script (the
  `/api/ask` Workers AI setup in `rag.md` can do this — same free tier).
- **Slide bullet extraction** — turning a paragraph into three keyword lines.
- **Chapter titles and descriptions** for YouTube.
- **Short-form cuts** — picking the 45 seconds of a lesson that stands alone.

Always human-review the script before it becomes audio. A wrong sentence in
text gets fixed in a commit; a wrong sentence in a published video gets watched
a thousand times.

---

## Suggested first run

1. Pick one lesson with no video — `foundations/the-data-layer` is visual and
   self-contained.
2. Hand-write the narration from its own prose (one pass, ~20 minutes) to
   calibrate what "good" reads like before automating it.
3. Piper for audio, Slidev for slides, the ffmpeg recipe above for assembly.
4. Watch it. If it's worth publishing, *then* write the script that generalises
   steps 1–3 into `scripts/lesson-to-video.mjs` and the workflow.

Building the automation before proving one video is worth watching is how this
kind of project produces fifty videos nobody finishes.

---

## Cost summary

Everything above is £0: open-weight TTS, open-source renderers, free Actions
minutes on a public repo, and storage in an R2 bucket that already exists. The
only real budget is your review time on each script — which is exactly where it
should be.
