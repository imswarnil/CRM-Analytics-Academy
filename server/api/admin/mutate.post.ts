type Table = 'resources' | 'comments' | 'feedback' | 'guestbook' | 'profiles'
const TABLES: Table[] = ['resources', 'comments', 'feedback', 'guestbook', 'profiles']

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)
const oneOf = <T extends string>(v: unknown, allowed: readonly T[]) =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : undefined

// Build a sanitized patch for a table from an untrusted input object. Only
// allowlisted, validated fields survive — nothing else can be written.
function buildPatch(table: Table, input: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  if (table === 'resources') {
    const status = oneOf(input.status, ['pending', 'approved', 'rejected'] as const)
    if (status) patch.status = status
    for (const k of ['title', 'url', 'description', 'category'] as const) {
      if (k in input) patch[k] = str(input[k]) || null
    }
  } else if (table === 'comments') {
    if ('body' in input) {
      const body = str(input.body)
      if (body) patch.body = body
    }
  } else if (table === 'feedback') {
    const status = oneOf(input.status, ['open', 'resolved'] as const)
    if (status) patch.status = status
  } else if (table === 'guestbook') {
    const status = oneOf(input.status, ['visible', 'hidden'] as const)
    if (status) patch.status = status
    if ('message' in input) patch.message = str(input.message) || null
  } else if (table === 'profiles') {
    const role = oneOf(input.role, ['member', 'admin'] as const)
    if (role) patch.role = role
    for (const k of ['username', 'full_name', 'bio', 'linkedin_url'] as const) {
      if (k in input) patch[k] = str(input[k]) || null
    }
  }
  return patch
}

// Admin-only generic CRUD: update (allowlisted fields) or delete a row.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const body = await readBody<{ action?: string, table?: string, id?: string, patch?: Record<string, unknown> }>(event)

  const table = TABLES.includes(body.table as Table) ? (body.table as Table) : null
  if (!table || !body.id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  }

  if (body.action === 'delete') {
    const { error } = await admin.from(table).delete().eq('id', body.id)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { ok: true }
  }

  if (body.action === 'update') {
    const patch = buildPatch(table, body.patch ?? {})
    if (!Object.keys(patch).length) {
      throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
    }
    // buildPatch only ever returns allowlisted, validated fields for `table`;
    // the open Record<string, unknown> shape just can't express that per-table
    // union statically, so the update payload is asserted at this boundary.
    const { error } = await (
      table === 'resources'
        ? admin.from('resources').update(patch as never).eq('id', body.id)
        : table === 'comments'
          ? admin.from('comments').update(patch as never).eq('id', body.id)
          : table === 'feedback'
            ? admin.from('feedback').update(patch as never).eq('id', body.id)
            : table === 'guestbook'
              ? admin.from('guestbook').update(patch as never).eq('id', body.id)
              : admin.from('profiles').update(patch as never).eq('id', body.id)
    )
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
