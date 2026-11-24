/**
 * A minimal SMTP client for the Worker (Cloudflare TCP sockets), written here
 * rather than pulled in so every byte it says to the server is reviewable.
 * Pure: the socket comes from a factory, so scripts/check-prospect.mjs drives
 * it against a fake SMTP server.
 *
 *   465  implicit TLS (Hostinger's default; smtp.hostinger.com)
 *   587  STARTTLS
 *
 * AUTH PLAIN (or LOGIN when PLAIN is not offered), one message per
 * connection, dot-stuffing, a 20-second budget per reply. Never logs the
 * password or the AUTH line.
 */
export interface SmtpSocket {
  readable: ReadableStream<Uint8Array>
  writable: WritableStream<Uint8Array>
  close: () => Promise<void> | void
  startTls?: () => SmtpSocket
}
export type SocketFactory = (host: string, port: number, tls: 'on' | 'starttls') => Promise<SmtpSocket> | SmtpSocket

export interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
}

export class SmtpError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

/** The Worker's real socket: `cloudflare:sockets`, imported only where it exists. */
export const workerSockets: SocketFactory = async (host, port, tls) => {
  const spec = 'cloudflare:sockets'
  const { connect } = await import(/* @vite-ignore */ spec) as { connect: (a: { hostname: string, port: number }, o: { secureTransport: string, allowHalfOpen: boolean }) => SmtpSocket }
  return connect({ hostname: host, port }, { secureTransport: tls, allowHalfOpen: false })
}

class Conversation {
  private reader!: ReadableStreamDefaultReader<Uint8Array>
  private writer!: WritableStreamDefaultWriter<Uint8Array>
  private buf = ''
  private dec = new TextDecoder()
  private enc = new TextEncoder()
  transcript: string[] = []
  socket: SmtpSocket

  constructor(socket: SmtpSocket) {
    this.socket = socket
    this.attach(socket)
  }

  attach(socket: SmtpSocket) {
    this.socket = socket
    this.reader = socket.readable.getReader()
    this.writer = socket.writable.getWriter()
    this.buf = ''
  }

  release() {
    this.reader.releaseLock()
    this.writer.releaseLock()
  }

  /** Reads one (possibly multi-line) reply: "250-…" continues, "250 …" ends. */
  async reply(timeoutMs = 20000): Promise<{ code: number, lines: string[] }> {
    const lines: string[] = []
    const deadline = Date.now() + timeoutMs
    for (;;) {
      let nl = this.buf.indexOf('\n')
      while (nl < 0) {
        const left = deadline - Date.now()
        if (left <= 0) throw new SmtpError(0, 'SMTP server did not answer in time')
        let timer: ReturnType<typeof setTimeout> | undefined
        const chunk = await Promise.race([
          this.reader.read(),
          new Promise<never>((_, rej) => {
            timer = setTimeout(() => rej(new SmtpError(0, 'SMTP server did not answer in time')), left)
          })
        ]).finally(() => clearTimeout(timer))
        if (chunk.done) throw new SmtpError(0, 'SMTP connection closed')
        this.buf += this.dec.decode(chunk.value, { stream: true })
        nl = this.buf.indexOf('\n')
      }
      const line = this.buf.slice(0, nl).replace(/\r$/, '')
      this.buf = this.buf.slice(nl + 1)
      lines.push(line)
      this.transcript.push(`S: ${line}`)
      if (/^\d{3} /.test(line) || /^\d{3}$/.test(line)) return { code: Number(line.slice(0, 3)), lines }
      if (!/^\d{3}-/.test(line)) throw new SmtpError(0, `Unexpected SMTP line: ${line.slice(0, 80)}`)
    }
  }

  async send(line: string, secret = false) {
    this.transcript.push(`C: ${secret ? '[redacted]' : line}`)
    await this.writer.write(this.enc.encode(`${line}\r\n`))
  }

  async raw(data: string) {
    await this.writer.write(this.enc.encode(data))
  }

  async expect(line: string | null, ok: number[], secret = false) {
    if (line !== null) await this.send(line, secret)
    const r = await this.reply()
    if (!ok.includes(r.code)) throw new SmtpError(r.code, `${secret ? 'AUTH' : (line ?? 'greeting').split(' ')[0]} → ${r.lines.join(' ').slice(0, 200)}`)
    return r
  }
}

const b64 = (s: string) => {
  let bin = ''
  for (const b of new TextEncoder().encode(s)) bin += String.fromCharCode(b)
  return btoa(bin)
}

async function open(cfg: SmtpConfig, connect: SocketFactory, ehloName: string) {
  const starttls = cfg.port !== 465
  const c = new Conversation(await connect(cfg.host, cfg.port, starttls ? 'starttls' : 'on'))
  await c.expect(null, [220])
  let ehlo = await c.expect(`EHLO ${ehloName}`, [250])
  if (starttls) {
    if (!ehlo.lines.some(l => /STARTTLS/i.test(l))) throw new SmtpError(0, 'Server does not offer STARTTLS; use port 465')
    await c.expect('STARTTLS', [220])
    if (!c.socket.startTls) throw new SmtpError(0, 'This socket cannot upgrade to TLS')
    c.release()
    c.attach(c.socket.startTls())
    ehlo = await c.expect(`EHLO ${ehloName}`, [250])
  }
  const auth = ehlo.lines.find(l => /^250[ -]AUTH\b/i.test(l)) ?? ''
  if (/\bPLAIN\b/i.test(auth) || !/\bLOGIN\b/i.test(auth)) {
    await c.expect(`AUTH PLAIN ${b64(`\u0000${cfg.user}\u0000${cfg.pass}`)}`, [235], true)
  } else {
    await c.expect('AUTH LOGIN', [334])
    await c.expect(b64(cfg.user), [334], true)
    await c.expect(b64(cfg.pass), [235], true)
  }
  return c
}

async function quit(c: Conversation) {
  try {
    await c.send('QUIT')
    await c.reply(3000).catch(() => null)
  } finally {
    await Promise.resolve(c.socket.close()).catch(() => {})
  }
}

/** EHLO + AUTH, then QUIT: the Integrations connection check. Sends nothing. */
export async function smtpCheck(cfg: SmtpConfig, connect: SocketFactory, ehloName = 'crmanalytics.imswarnil.com') {
  const c = await open(cfg, connect, ehloName)
  await quit(c)
  return { ok: true, transcript: c.transcript }
}

/** Dot-stuffing (RFC 5321 §4.5.2) and CRLF line ends. */
export function dataBlock(raw: string): string {
  return `${raw.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..').replace(/\r\n$/, '')}\r\n.\r\n`
}

/** Sends one RFC 5322 message to one recipient. Returns the server's queue reply. */
export async function smtpSend(cfg: SmtpConfig, mail: { from: string, to: string, raw: string }, connect: SocketFactory, ehloName = 'crmanalytics.imswarnil.com') {
  if (/[\r\n<>]/.test(mail.from + mail.to)) throw new SmtpError(0, 'Bad address')
  const c = await open(cfg, connect, ehloName)
  try {
    await c.expect(`MAIL FROM:<${mail.from}>`, [250])
    await c.expect(`RCPT TO:<${mail.to}>`, [250, 251])
    await c.expect('DATA', [354])
    c.transcript.push('C: [message]')
    await c.raw(dataBlock(mail.raw))
    const done = await c.expect(null, [250])
    return { queued: done.lines.join(' ').slice(0, 200), transcript: c.transcript }
  } finally {
    await quit(c)
  }
}
