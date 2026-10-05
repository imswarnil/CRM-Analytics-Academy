import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// Pro lessons, as relative paths under content/. Written by
// scripts/gate-content.mjs before every build; absent means nothing is gated.
// These files are excluded from the collection — which is published whole as
// a client-side database — and replaced by the stubs in .gated-stubs/, which
// carry the title, navigation and a teaser but never the body.
const gatedFiles: string[] = existsSync('.gated-files.json')
  ? JSON.parse(readFileSync('.gated-files.json', 'utf8'))
  : []

export default defineContentConfig({
  collections: {
    // Community-submitted resources. One markdown file per link, under
    // content/resources/. Contributors open a PR adding a file; once it's
    // merged the resource appears on /resources — no database, no moderation
    // queue, the PR review *is* the moderation.
    //
    // `data` rather than `page`: these never render as their own route, they
    // are just structured records the /resources page queries.
    resources: defineCollection({
      type: 'data',
      source: 'resources/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        url: z.string().url(),
        category: z.enum(['Docs', 'Learning', 'Books', 'Blogs', 'Tools', 'Community']),
        // Any i-lucide-* or i-simple-icons-* name; falls back if omitted.
        icon: z.string().optional(),
        // Credit the person who submitted it, if they want it.
        submittedBy: z.string().optional(),
        submittedByUrl: z.string().url().optional(),
        // Curated picks that shipped with the site, vs community submissions.
        featured: z.boolean().default(false)
      })
    }),

    // Community dashboard showcase. One markdown file per dashboard, under
    // content/showcase/. Rendered as a page so each entry gets its own URL and
    // can carry a full write-up in the body (build notes, gotchas, SAQL).
    showcase: defineCollection({
      type: 'page',
      source: 'showcase/**',
      schema: z.object({
        // Screenshot of the finished dashboard — put the file in
        // public/showcase/ and reference it as /showcase/<name>.png
        image: z.string(),
        author: z.string(),
        authorUrl: z.string().url().optional(),
        // e.g. Sales, Service, Marketing, Finance
        domain: z.string().optional(),
        difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
        publishedAt: z.string().optional(),
        // Which datasets/objects it's built on.
        datasets: z.array(z.string()).optional(),
        // The metrics on the dashboard and how each is actually computed —
        // this is the part people come to the showcase for.
        kpis: z.array(z.object({
          name: z.string(),
          formula: z.string(),
          note: z.string().optional()
        })).optional(),
        // High-level build steps (the "recipe").
        recipe: z.array(z.object({
          step: z.string(),
          detail: z.string().optional()
        })).optional(),
        // CRM Analytics features exercised, for filtering.
        techniques: z.array(z.string()).optional()
      })
    }),

    // The people registry: instructors, the bloggers and creators whose work
    // lessons embed, and community contributors. One YAML file per person,
    // content/people/<slug>.yml; lessons name their authors by that slug
    // (`authors: [slug]`). Not localized — a name is a name. Rendered on
    // /instructors and as the author chips under a lesson title.
    people: defineCollection({
      type: 'data',
      source: 'people/*.yml',
      schema: z.object({
        name: z.string(),
        role: z.enum(['instructor', 'blogger', 'creator', 'community', 'maintainer']),
        // An http(s) URL or a /public path. Without one, initials are drawn.
        avatar: z.string().optional(),
        headline: z.string().optional(),
        bio: z.string().optional(),
        links: z.object({
          site: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          youtube: z.string().url().optional(),
          x: z.string().url().optional(),
          github: z.string().url().optional()
        }).optional()
      })
    }),

    docs: defineCollection({
      type: 'page',
      // Content is organised per locale: content/<locale>/<module>/<lesson>.md.
      // The non-localized collections above live in their own top-level folders
      // and are excluded so they aren't ingested twice.
      source: [
        {
          include: '**',
          exclude: ['resources/**', 'showcase/**', 'people/**', ...gatedFiles]
        },
        ...(gatedFiles.length ? [{ cwd: resolve('.gated-stubs'), include: '**' }] : [])
      ],
      schema: z.object({
        // Access tier. A `pro` lesson's real file never enters this
        // collection: scripts/gate-content.mjs swaps in a stub (title,
        // navigation, teaser) and the body is served only by /api/lesson after
        // a server-side entitlement check. Anything not marked ships to
        // everyone, so a lesson that should be paid and is not marked is free.
        access: z.enum(['free', 'pro']).default('free'),
        // Mux playback ids, one per language: `mux: { en: abc, es: def }`, or a
        // single string for English only. The player picks the reader's
        // language and falls back to English. A free lesson's ids use Mux's
        // public playback policy; a pro lesson's are signed, so the id is
        // useless without the short-lived token /api/lesson mints.
        mux: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional()
        })).optional(),
        // Optional lesson video (a clip of a YouTube video). Rendered at the top
        // of the lesson via YoutubeEmbed; also surfaced as VideoObject JSON-LD.
        video: z.object({
          id: z.string(),
          start: z.number().optional(),
          end: z.number().optional(),
          // Attribution when the video is someone else's: rendered as
          // "Video by <author> — <title> ↗" under the embed.
          title: z.string().optional(),
          author: z.string().optional(),
          authorUrl: z.string().optional()
        }).optional(),
        // Who wrote the lesson: slugs from content/people. Declared on the
        // English file only; translations borrow it at render time. None
        // means the site owner.
        authors: z.array(z.string()).optional(),
        // Third-party work the lesson embeds or builds on. Listed under
        // "Credits & sources" at the end of the lesson and emitted as
        // schema.org `citation`. English only, like authors.
        credits: z.array(z.object({
          kind: z.enum(['video', 'post', 'article', 'image', 'dataset']),
          title: z.string(),
          author: z.string(),
          authorUrl: z.string().optional(),
          url: z.string(),
          license: z.string().optional(),
          note: z.string().optional()
        })).optional(),
        // Optional generated clip (scripts/lesson-to-video.mjs): a local MP4
        // rendered above the YouTube embed. Files live in public/videos/,
        // which is gitignored, so a clip is local until deliberately published.
        clip: z.object({
          src: z.string(),
          poster: z.string().optional()
        }).optional(),
        // The lesson's screen walkthrough, as a recording script. Rendered by
        // LessonWalkthrough where the video goes: open when the lesson has no
        // clip/video yet, collapsed once one lands. The `say` lines are written
        // as teaching prose rather than stage direction, so the script reads as
        // a text tour on its own -- which is what it is until the clip exists.
        walkthrough: z.object({
          // What to have on screen before recording starts.
          org: z.string().optional(),
          shots: z.array(z.object({
            shot: z.string(),
            // The click path, verbatim: "Data Manager -> Recipes -> Edit".
            screen: z.string().optional(),
            say: z.string(),
            // Text overlay for this shot, if any.
            onscreen: z.string().optional(),
            seconds: z.number().optional()
          })).min(1)
        }).optional(),
        // Optional interview-prep Q&A rendered after the lesson body; also
        // emitted as FAQPage JSON-LD for SEO.
        interview: z.array(z.object({
          q: z.string(),
          a: z.string()
        })).optional(),
        // Optional graded quiz rendered after the lesson body. `answer` is the
        // index into `options`. The answers necessarily ship in the payload —
        // this content is public, open-source markdown — so grading happens
        // client-side and only the resulting score is persisted (see
        // server/api/quiz.post.ts).
        quiz: z.array(z.object({
          q: z.string(),
          options: z.array(z.string()).min(2).max(6),
          answer: z.number().int().min(0)
        })).optional()
      })
    })
  }
})
