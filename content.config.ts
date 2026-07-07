import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      // Content is organised per locale: content/<locale>/<module>/<lesson>.md
      source: {
        include: '**'
      },
      schema: z.object({
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional()
        })).optional(),
        // 'members' soft-gates the lesson: logged-out readers see a teaser + a
        // sign-in prompt. Defaults to public when omitted.
        access: z.enum(['public', 'members']).optional(),
        // Optional lesson video (a clip of a YouTube video). Rendered at the top
        // of the lesson via YoutubeEmbed; also surfaced as VideoObject JSON-LD.
        video: z.object({
          id: z.string(),
          start: z.number().optional(),
          end: z.number().optional()
        }).optional(),
        // Optional end-of-lesson quiz POOL. The site shows a rotating subset per
        // attempt (so failed retries get a different set). Answers never reach
        // the client — scoring happens server-side in /api/quiz.
        quiz: z.array(z.object({
          q: z.string(),
          options: z.array(z.string()),
          answer: z.number(),
          // Skill area this question tests (e.g. "Data Prep") — powers the
          // per-skill performance chart on the results screen.
          skill: z.string().optional()
        })).optional(),
        // Passing score as a percentage (default 85). Reaching it marks the quiz
        // passed and (for gated lessons) unlocks completion.
        passScore: z.number().optional(),
        // Optional interview-prep Q&A shown after the quiz; also emitted as
        // FAQPage JSON-LD for SEO.
        interview: z.array(z.object({
          q: z.string(),
          a: z.string()
        })).optional()
      })
    })
  }
})
