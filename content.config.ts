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
        // Optional end-of-lesson quiz; scored client-side, attempts saved for
        // signed-in users.
        quiz: z.array(z.object({
          q: z.string(),
          options: z.array(z.string()),
          answer: z.number()
        })).optional()
      })
    })
  }
})
