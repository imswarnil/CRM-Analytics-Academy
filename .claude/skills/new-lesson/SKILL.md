---
name: new-lesson
description: Scaffold a new CRM Analytics Academy docs lesson (markdown) in the right module with correct numbering and frontmatter. Use when adding or drafting a new lesson/page to the curriculum.
---

# New lesson

**Sections still marked `comingSoon: true`** (every section except `00.introduction`, as of 2026-10-23) have only a placeholder `01.index.md` listing the planned lessons. Publishing a section = write its lessons, then rewrite its `01.index.md` as the real section intro and delete `comingSoon` (and the "coming soon" note/outline) from it.

Lessons are markdown under `content/<locale>/<NN.module>/<NN.lesson>.md`. English (`en`) is the default and the only locale written by hand. Numeric prefixes control order and are **always two digits** (`01.` … `10.`): they sort as strings, so `10.` would land between `1.` and `2.`.

The other way to create a lesson is **Nuxt Studio** at `/_studio` (commits to `main` through GitHub). Use this skill when editing the markdown directly.

## Steps

1. **Pick the module** — list current modules and their lessons:
   ```bash
   ls content/en && echo "---" && ls content/en/07.saql
   ```
2. **Choose the next number** in that module (e.g. if `01.index.md`…`04.debugging-queries.md` exist, the new one is `05.<slug>.md`). To insert in the middle, renumber later files — and renumber the same paths in every other locale and remap the `<locale>:<path>` keys in `.translation-manifest.json`, or the pipeline re-translates them from scratch (rename with `git mv` in every locale, then edit the manifest keys).
3. **Create the file** `content/en/<NN.module>/<NN.slug>.md` with frontmatter:
   ```markdown
   ---
   title: <Lesson Title>
   description: <One-sentence summary — used for SEO and the OG image.>
   # Optional:
   # video:                   # the lesson video on YouTube (made with `pnpm fcp <route>`, see content-creation/README.md)
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
   ---

   # <Lesson Title>

   <content…>
   ```
   An author must exist as `content/people/<slug>.yml` first. Authors and credits go in the English file only.
4. **Headings**: start with an `h1` matching the title, then `##` sections (the TOC uses these). A quiz is `::quiz` and a screen walkthrough `::walkthrough` — copy an existing lesson's block.
5. **New top-level module?** Also:
   - add a `.navigation.yml` in the module dir (`title:` + `icon:` — a `i-lucide-*` icon), and
   - nothing else: `llms.txt` is generated from the folders in order by `scripts/build-search-index.mjs`.
6. **Verify**: `pnpm typecheck` (content schema) and open the page in dev. If nav is empty, run the `dev-reset` skill.
7. **Translations**: `pnpm build` (or `pnpm translate`) translates the new lesson locally; commit the results. See the `translate-lesson` skill.

Keep the writing practical and example-led (llms.txt reads this content).
