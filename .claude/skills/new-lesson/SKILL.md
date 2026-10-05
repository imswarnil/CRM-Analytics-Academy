---
name: new-lesson
description: Scaffold a new CRM Analytics Academy docs lesson (markdown) in the right module with correct numbering and frontmatter. Use when adding or drafting a new lesson/page to the curriculum.
---

# New lesson

Lessons are markdown under `content/<locale>/<NN.module>/<NN.lesson>.md`. English (`en`) is the default and the only locale written by hand. Numeric prefixes control order and are **always two digits** (`01.` … `10.`): they sort as strings, so `10.` would land between `1.` and `2.`.

There are two other ways to create a lesson that do the numbering for you: **/admin → Content** (admins commit to main; instructors get a branch + PR) and Payload (`pnpm cms:dev`, then `pnpm cms:pull`). Use this skill when editing the markdown directly.

## Steps

1. **Pick the module** — list current modules and their lessons:
   ```bash
   ls content/en && echo "---" && ls content/en/07.saql
   ```
2. **Choose the next number** in that module (e.g. if `01.index.md`…`04.debugging-queries.md` exist, the new one is `05.<slug>.md`). To insert in the middle, renumber later files — and renumber the same paths in every other locale and remap the `<locale>:<path>` keys in `.translation-manifest.json`, or the pipeline re-translates them from scratch (the admin editor's reorder does all of that in one commit).
3. **Create the file** `content/en/<NN.module>/<NN.slug>.md` with frontmatter:
   ```markdown
   ---
   title: <Lesson Title>
   description: <One-sentence summary — used for SEO and the OG image.>
   # Optional:
   # video:                   # a clip of a YouTube video, embedded at the top
   #   id: <youtube-id>
   #   start: 0
   #   end: 120
   # interview:               # Q&A rendered after the body; also FAQPage JSON-LD
   #   - q: "Question text?"
   #     a: "Model answer."
   # authors: [swarnil-singhai]   # slugs from content/people/; omit for the site owner
   # credits:                 # every third-party video/post/article/image/dataset used
   #   - kind: video          # video | post | article | image | dataset
   #     title: "Their title"
   #     author: "Their name"
   #     authorUrl: "https://…"
   #     url: "https://…"
   # (a credited YouTube video: add title/author/authorUrl under `video:`)
   # access: pro             # the body is served only to Pro members (gated at build)
   # mux: <playbackId>       # one Mux video per lesson; captions come from content-transcripts/
   ---

   # <Lesson Title>

   <content…>
   ```
   An author must exist as `content/people/<slug>.yml` first. Authors and credits go in the English file only.
4. **Headings**: start with an `h1` matching the title, then `##` sections (the TOC uses these). A free lesson can gate part of itself with `::pro … ::` (components nested inside use three colons); a quiz is `::quiz` and a screen walkthrough `::walkthrough` — copy an existing lesson's block.
5. **New top-level module?** Also:
   - add a `.navigation.yml` in the module dir (`title:` + `icon:` — a `i-lucide-*` icon), and
   - add it to the `LLM_SECTIONS` array in `nuxt.config.ts` (slug + title; that feeds `llms.txt`).
6. **Verify**: `pnpm typecheck` (content schema) and open the page in dev. If nav is empty, run the `dev-reset` skill.
7. **Translations**: English is enough to ship. To translate, use the `translate-lesson` skill.

Keep the writing practical and example-led (llms.txt reads this content).
