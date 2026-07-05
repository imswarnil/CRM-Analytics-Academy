---
name: new-lesson
description: Scaffold a new CRM Analytics Academy docs lesson (markdown) in the right module with correct numbering and frontmatter. Use when adding or drafting a new lesson/page to the curriculum.
---

# New lesson

Lessons are markdown under `content/<locale>/<NN.module>/<NN.lesson>.md`. English (`en`) is the default. Numeric prefixes control order.

## Steps

1. **Pick the module** — list current modules and their lessons:
   ```bash
   ls content/en && echo "---" && ls content/en/5.saql
   ```
2. **Choose the next number** in that module (e.g. if `1.index.md`…`4.debugging-queries.md` exist, the new one is `5.<slug>.md`). To insert in the middle, renumber later files.
3. **Create the file** `content/en/<NN.module>/<NN.slug>.md` with frontmatter:
   ```markdown
   ---
   title: <Lesson Title>
   description: <One-sentence summary — used for SEO and the OG image.>
   # Optional:
   # access: members          # soft-gate: logged-out users see a teaser + sign-in
   # quiz:
   #   - q: "Question text?"
   #     options: ["A", "B", "C"]
   #     answer: 1            # zero-based index of the correct option
   ---

   # <Lesson Title>

   <content…>
   ```
4. **Headings**: start with an `h1` matching the title, then `##` sections (the TOC uses these).
5. **New top-level module?** Also:
   - add a `.navigation.yml` in the module dir (`title:` + `icon:` — a `i-lucide-*` icon), and
   - add a section to `llms:` → `sections` in `nuxt.config.ts` (path filter `/en/<module>%`).
6. **Verify**: `pnpm typecheck` (content schema) and open the page in dev. If nav is empty, run the `dev-reset` skill.
7. **Translations**: English is enough to ship. To translate, use the `translate-lesson` skill.

Keep the writing practical and example-led (llms.txt reads this content).
