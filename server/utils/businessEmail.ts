/**
 * Company-domain checks for teams.
 *
 * A team is keyed on a company domain: the buyer's email domain becomes the
 * team's, and members must share it. A personal mailbox provider cannot be a
 * team domain — every Gmail user would otherwise be "on the same team".
 *
 * Export names are deliberately specific (teamEmailDomain, isPersonalMailbox)
 * because Nitro auto-imports every util by name.
 */
const PERSONAL = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.in', 'live.com', 'msn.com', 'passport.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'aim.com', 'proton.me', 'protonmail.com', 'pm.me',
  'gmx.com', 'gmx.de', 'gmx.net', 'web.de', 'mail.com', 'email.com', 'zoho.com', 'zohomail.com',
  'yandex.com', 'yandex.ru', 'mail.ru', 'bk.ru', 'inbox.ru', 'list.ru', 'rediffmail.com', 'qq.com',
  '163.com', '126.com', 'sina.com', 'naver.com', 'daum.net', 'hanmail.net', 'tutanota.com', 'tuta.io',
  'fastmail.com', 'hey.com', 'duck.com', 'mailinator.com', 'guerrillamail.com', 'temp-mail.org',
  'yopmail.com', 'freemail.hu', 'citromail.hu', 'libero.it', 'orange.fr', 'wanadoo.fr', 'laposte.net',
  'free.fr', 'sfr.fr', 't-online.de', 'seznam.cz', 'wp.pl', 'o2.pl', 'interia.pl', 'btinternet.com',
  'sky.com', 'comcast.net', 'verizon.net', 'att.net', 'sbcglobal.net', 'bellsouth.net', 'cox.net'
])

/** The lower-cased domain of an email, or '' when it has none. */
export function teamEmailDomain(email: string): string {
  const at = email.lastIndexOf('@')
  return at < 0 ? '' : email.slice(at + 1).trim().toLowerCase()
}

/** True for a personal mailbox provider (gmail.com, outlook.com …). */
export function isPersonalMailbox(email: string): boolean {
  const domain = teamEmailDomain(email)
  return !domain || PERSONAL.has(domain)
}

/** Whether an email belongs to one of a team's allowed domains. */
export function emailMatchesTeam(email: string, team: { domain: string, extra_domains?: string[] | null }): boolean {
  const domain = teamEmailDomain(email)
  return domain === team.domain || (team.extra_domains ?? []).map(d => d.toLowerCase()).includes(domain)
}
