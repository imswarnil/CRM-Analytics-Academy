---
name: translate-lesson
description: Translate a docs lesson or UI strings into the site's other locales (es, fr, de, pt, ja, zh, hi). Use when localizing a new/updated English lesson or adding a new UI nav string.
---

# Translate lesson / UI strings

The site has 8 locales: `en` (default) + `es fr de pt ja zh hi`. Content lives per-locale; UI strings live in `i18n/locales/*.json`.

## Translating a lesson

1. Identify the English source, e.g. `content/en/5.saql/1.index.md`.
2. For each target locale, create the **same relative path** under that locale dir:
   `content/<locale>/5.saql/1.index.md` (keep the numeric prefixes identical so ordering matches).
3. Translate the frontmatter `title` + `description` and the body. **Keep unchanged**: code blocks, SAQL/JSON, MDC component syntax, frontmatter keys (`access`, `quiz.answer` indices), and heading structure.
4. Also translate any `.navigation.yml` `title` in that locale's module dir (leave `icon` as-is).
5. Verify with `pnpm typecheck`; open `/es/saql/...` in dev (run `dev-reset` if nav is empty).

## Adding a UI string (nav, buttons)

New user-facing strings must exist in **all 8** locale files (there is no message fallback, so a missing key renders as the raw key). Add the key to every `i18n/locales/*.json` with a proper translation. Example helper:

```bash
node -e '
const fs=require("fs"); const dir="i18n/locales";
const t={en:"English text",es:"…",fr:"…",de:"…",pt:"…",ja:"…",zh:"…",hi:"…"};
for(const[l,v]of Object.entries(t)){const f=`${dir}/${l}.json`;const j=JSON.parse(fs.readFileSync(f,"utf8"));j.nav.myKey=v;fs.writeFileSync(f,JSON.stringify(j,null,2)+"\n");}
'
```

Reference it in components with `t('nav.myKey')`.
