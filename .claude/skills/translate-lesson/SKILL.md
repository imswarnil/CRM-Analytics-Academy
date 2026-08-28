---
name: translate-lesson
description: Translate docs lessons or UI strings into the site's other 11 locales via the LibreTranslate pipeline. Use when localizing a new/updated English lesson, adding a new UI string, or fixing a bad machine translation.
---

# Translate lessons / UI strings

The site has **12 locales**: `en` (default) + `es fr de pt ja zh hi ar ru bn ur`.
`ar` and `ur` are right-to-left. Content lives per-locale under `content/<locale>/`;
UI strings live in `i18n/locales/*.json`.

**English is the only language anyone writes by hand.** Everything else is generated.

## Translating content

```bash
pnpm translate                    # everything that changed, all 11 targets
pnpm translate --locales=es,fr    # just these
pnpm translate --only=ui          # just i18n/locales/*.json
pnpm translate --only=content     # just content/
pnpm translate --limit=3          # first 3 files per locale (for trying a change)
pnpm translate --force            # ignore the manifest, redo everything
pnpm translate --dry-run          # report only, write nothing
```

In CI this runs automatically: `.github/workflows/translate.yml` fires on any push to
`main` touching `content/en/**` or `i18n/locales/en.json`, and commits the translations
back — which then triggers the deploy.

Server: set `LIBRETRANSLATE_URL` (and `LIBRETRANSLATE_API_KEY` if the instance needs one).
Locally that lives in the gitignored `.env`; in CI it is the `LIBRETRANSLATE_URL` repository
variable. The URL is deliberately absent from this public repo — the instance runs without
an API key, so publishing it would expose an open translation service.

## How it avoids corrupting markdown

Read `scripts/markdown-protect.mjs` before changing any of this. The essentials, all
established by testing against the live server:

- **Never send raw markdown.** With `format: 'text'` the server returns `**dataset*` for
  `**dataset**`. The pipeline converts markdown to HTML, sends `format: 'html'` (tags and
  attributes survive intact in every script), and converts back.
- **Two kinds of placeholder.** Opaque things (escapes, images, comments, MDC props) become
  empty `<v3></v3>`. Product names and code identifiers become `<g3>SAQL</g3>` — visible to
  the model for context, but the original is restored regardless of what comes back.
- **Placeholders fragment the sentence.** The engine translates each span between tags
  independently, so words *around* a tag stop being translated. This is why `GLOSSARY` in
  `scripts/i18n.config.mjs` is short and excludes object names that are ordinary English
  words (Opportunity, Account, User, Case).
- **Unicode sentinels do not work.** `⟦0⟧` is rewritten or dropped, and in Hindi took the
  whole sentence with it.
- **A broken restore falls back to English** for that line rather than emitting corrupt
  markdown, and the file is left out of the manifest so the next run retries it.

## Fixing a bad machine translation

Edit the locale file directly — `content/es/…md` or `i18n/locales/es.json`. The pipeline
only regenerates a file when its **English source** changes, so a hand fix survives.

## Adding a UI string

Add it to `i18n/locales/en.json` **only**, then `pnpm translate --only=ui`. The run fills
in the other eleven and leaves every existing translation untouched (it tracks a per-key
hash of the English source in `.translation-manifest.json`).

Two things the script special-cases, both learned the hard way:

- `language` is never translated — it comes from `NATIVE_NAMES`, because asking the engine
  to translate "English" into Arabic correctly returns "الإنكليزية" when the menu needs "العربية".
- **Arrays must be preserved.** `home.outcomes`, `home.personas`, `home.faqs`,
  `home.features` and `home.projects` are arrays. An earlier version rebuilt the JSON from
  flattened dotted paths and turned them into `{"0": …}` objects, which killed the home
  page with `tm(...).map is not a function`. `mapMessages()` mirrors the English shape.

## Adding a locale

1. `nuxt.config.ts` → `i18n.locales` (add `dir: 'rtl'` if needed).
2. `scripts/i18n.config.mjs` → `TARGET_LOCALES` (LibreTranslate's own code — it speaks
   `zh-Hans`, not `zh`; check `GET /languages` first), `NATIVE_NAMES`, and `RTL_LOCALES`.
3. `pnpm translate --locales=<new>`.

## Verifying

`pnpm lint && pnpm typecheck`, then check a page in that locale (run `dev-reset` first if
the docs nav is empty). Confirm `<html lang>`/`dir`, the canonical, and the hreflang
alternates — `curl -s localhost:3000/ar/... | grep -c hreflang` should be 25
(x-default + 12 locales × 2 forms).
