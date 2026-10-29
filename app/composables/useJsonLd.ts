type JsonLd = Record<string, unknown>

/**
 * Inject one or more JSON-LD structured-data blocks into the document head.
 * Accepts a single schema object or an array of them.
 */
// JSON.stringify leaves `<` alone, so a title containing "</script>" would end
// the tag and run whatever follows. Escaping <, > and & as \u sequences keeps
// the JSON identical to a parser and inert to the HTML one.
const safeJson = (value: unknown) => JSON.stringify(value)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

export function useJsonLd(data: JsonLd | JsonLd[]) {
  const blocks = Array.isArray(data) ? data : [data]
  useHead({
    script: blocks.map(block => ({
      type: 'application/ld+json',
      innerHTML: safeJson(block)
    }))
  })
}
