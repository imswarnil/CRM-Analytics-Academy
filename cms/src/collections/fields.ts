import type { Field } from 'payload'

/**
 * Lesson and showcase bodies are markdown with MDC blocks (::field-table,
 * :lesson-links …). They are stored verbatim in a code field rather than as
 * rich text: a rich-text round trip would rewrite or drop the MDC syntax the
 * site's components depend on.
 */
export const markdownBody: Field = {
  name: 'body',
  type: 'code',
  admin: { language: 'markdown', editorOptions: { wordWrap: 'on', minimap: { enabled: false } } }
}

/**
 * Frontmatter keys the schema here does not model, kept verbatim so a pull
 * writes back exactly what an import read.
 */
export const extraFrontmatter: Field = {
  name: 'extra',
  type: 'json',
  admin: { description: 'Other frontmatter keys, kept as-is.' }
}

/** Where the record lives on disk, relative to ../content. Set by import. */
export const sourceFile = (description = 'Path under content/. Set on import; new entries get one on pull.'): Field => ({
  name: 'file',
  type: 'text',
  unique: true,
  index: true,
  admin: { position: 'sidebar', readOnly: true, description }
})
