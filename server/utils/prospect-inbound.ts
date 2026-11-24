import type { InboundEvent } from './outreach'

/**
 * What n8n saw arrive in the outreach mailbox (IMAP), already verified by
 * /api/prospect/inbound. Matched to a prospect by Message-ID first
 * (In-Reply-To / References → app.prospect_message.message_id), then by
 * address (the bounced recipient, or the sender of a reply).
 *
 *   reply        → the prospect's sequences stop, status replied
 *   bounce       → sequences stop, address invalid and suppressed
 *   unsubscribe  → address suppressed, sequences stop, status unsubscribed
 *   auto_reply   → logged on the timeline only; the sequence goes on
 *
 * `signature` is unique in app.prospect_inbound: a replayed event is refused.
 */
export async function handleInbound(evt: InboundEvent, signature: string): Promise<{ status: 'ok' | 'duplicate', prospectId: number | null, matchedBy: string | null }> {
  const sql = useDb()
  const [row] = await sql`
    insert into app.prospect_inbound (signature, type, from_addr, message_id, in_reply_to, received_at)
    values (${signature}, ${evt.type}, ${evt.from}, ${evt.messageId}, ${evt.inReplyTo},
            ${evt.receivedAt && !Number.isNaN(Date.parse(evt.receivedAt)) ? new Date(evt.receivedAt).toISOString() : null})
    on conflict (signature) do nothing returning id`
  if (!row) return { status: 'duplicate', prospectId: null, matchedBy: null }

  let prospectId: number | null = null
  let matchedBy: string | null = null
  const ids = [...new Set([evt.inReplyTo, ...evt.references].filter((x): x is string => !!x))]
  if (ids.length) {
    const [m] = await sql`select prospect_id from app.prospect_message where message_id = any(${ids}::text[]) order by sent_at desc limit 1`
    if (m) {
      prospectId = Number(m.prospect_id)
      matchedBy = 'message-id'
    }
  }
  const address = evt.type === 'bounce' ? evt.recipient : evt.from
  if (!prospectId && address) {
    const [p] = await sql`select id from app.prospect where lower(email) = ${address} limit 1`
    if (p) {
      prospectId = Number(p.id)
      matchedBy = 'address'
    }
  }
  const [p] = prospectId ? await sql`select id, email from app.prospect where id = ${prospectId}` : []
  const email = (p?.email as string | undefined) ?? address ?? null
  const snippet = evt.snippet ? ` — "${evt.snippet.slice(0, 200)}"` : ''

  if (evt.type === 'bounce') {
    if (email) await suppress(email, 'bounced', evt.subject)
    if (prospectId) {
      await sql`update app.prospect_enrollment set status = 'bounced' where prospect_id = ${prospectId} and status = 'active'`
      await sql`update app.prospect set status = 'bounced', email_status = 'invalid', updated_at = now() where id = ${prospectId}`
      await logActivity(prospectId, 'bounced', `Bounce from ${evt.from ?? 'the mail server'} — address suppressed (matched by ${matchedBy})`)
    }
  } else if (evt.type === 'unsubscribe') {
    if (email) await suppress(email, 'unsubscribed', 'Asked by reply')
    if (prospectId) {
      await sql`update app.prospect_enrollment set status = 'unsubscribed' where prospect_id = ${prospectId} and status = 'active'`
      await sql`update app.prospect set status = 'unsubscribed', updated_at = now() where id = ${prospectId}`
      await logActivity(prospectId, 'unsubscribed', `Asked to stop by reply${snippet}`)
    }
  } else if (evt.type === 'reply' && prospectId) {
    await sql`update app.prospect_enrollment set status = 'replied' where prospect_id = ${prospectId} and status = 'active'`
    await sql`update app.prospect set status = 'replied', updated_at = now() where id = ${prospectId} and status not in ('converted', 'unsubscribed', 'do_not_contact')`
    await logActivity(prospectId, 'replied', `${evt.subject ?? 'Reply'}${snippet} — sequences stopped`)
  } else if (evt.type === 'auto_reply' && prospectId) {
    await logActivity(prospectId, 'auto_reply', `${evt.subject ?? 'Auto-reply'} (the sequence continues)`)
  }

  await sql`update app.prospect_inbound set prospect_id = ${prospectId}, matched_by = ${matchedBy} where id = ${row.id}`
  return { status: 'ok', prospectId, matchedBy }
}
