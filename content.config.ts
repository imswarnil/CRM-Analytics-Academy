import { defineContentConfig, defineCollection, z } from '@nuxt/content'

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

    docs: defineCollection({
      type: 'page',
      // Content is organised per locale: content/<locale>/<module>/<lesson>.md.
      // The non-localized collections above live in their own top-level folders
      // and are excluded so they aren't ingested twice.
      source: {
        include: '**',
        exclude: ['resources/**', 'showcase/**']
      },
      schema: z.object({
        // Access tier. `pro` lessons are excluded from the prerendered bundle
        // entirely — see the prerender ignore in nuxt.config.ts — and their
        // body is served only by /api/lesson after a server-side entitlement
        // check. Anything not marked ships to everyone, so a lesson that
        // should be paid and is not marked is simply free.
        access: z.enum(['free', 'pro']).default('free'),
        // Mux playback id. For a pro lesson this never reaches the client
        // unsigned; /api/lesson mints a short-lived signed token instead.
        mux: z.string().optional(),
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
          end: z.number().optional()
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
