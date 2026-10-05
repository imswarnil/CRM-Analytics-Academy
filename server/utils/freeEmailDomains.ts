/**
 * Consumer and free email providers.
 *
 * Business forms (quotes, sales, teams, sponsorship)
 * need a work address: it is how a lead is matched to a company in the CRM,
 * how its website is enriched, and how team seats are tied to one domain. A
 * personal address is fine for everything else — contact, instructor
 * applications, Wall of Fame nominations.
 *
 * Exact domains, plus families that exist under many country TLDs (yahoo.*,
 * hotmail.*, gmx.* …) matched by their first label.
 */
const EXACT = new Set([
  // Google, Microsoft, Apple, AOL, Yahoo's non-yahoo brands
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'passport.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'aim.com', 'ymail.com', 'rocketmail.com',
  // Privacy-focused and independent
  'proton.me', 'protonmail.com', 'protonmail.ch', 'pm.me', 'tutanota.com', 'tutanota.de', 'tuta.io', 'tuta.com',
  'mailfence.com', 'hushmail.com', 'fastmail.com', 'fastmail.fm', 'posteo.de', 'posteo.net', 'mailbox.org',
  'runbox.com', 'startmail.com', 'disroot.org', 'riseup.net', 'skiff.com',
  // Zoho, GMX, mail.com family
  'zoho.com', 'zohomail.com', 'zohomail.in', 'mail.com', 'email.com', 'usa.com', 'consultant.com', 'engineer.com',
  // Russia, Eastern Europe
  'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru', 'internet.ru', 'rambler.ru', 'ya.ru', 'seznam.cz', 'centrum.cz',
  'wp.pl', 'o2.pl', 'onet.pl', 'interia.pl', 'freemail.hu', 'citromail.hu', 'abv.bg', 'ukr.net',
  // Western Europe ISPs and portals
  'web.de', 't-online.de', 'freenet.de', 'arcor.de', 'orange.fr', 'wanadoo.fr', 'free.fr', 'laposte.net', 'sfr.fr',
  'libero.it', 'virgilio.it', 'tiscali.it', 'alice.it', 'terra.es', 'telefonica.net', 'btinternet.com',
  'sky.com', 'virginmedia.com', 'ntlworld.com', 'talktalk.net', 'blueyonder.co.uk', 'bigpond.com', 'optusnet.com.au',
  'shaw.ca', 'rogers.com', 'sympatico.ca', 'comcast.net', 'verizon.net', 'att.net', 'sbcglobal.net', 'bellsouth.net',
  'cox.net', 'charter.net', 'earthlink.net', 'juno.com', 'netzero.net',
  // Asia
  'qq.com', 'foxmail.com', '163.com', '126.com', 'yeah.net', 'sina.com', 'sina.cn', 'sohu.com', 'aliyun.com',
  'naver.com', 'hanmail.net', 'daum.net', 'nate.com', 'yahoo.co.jp', 'nifty.com', 'docomo.ne.jp', 'ezweb.ne.jp',
  'rediffmail.com', 'rediff.com', 'sify.com', 'indiatimes.com',
  // Latin America, Middle East, Africa
  'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 'yandex.com.tr', 'mynet.com', 'walla.co.il',
  // Disposable
  'mailinator.com', 'guerrillamail.com', 'sharklasers.com', '10minutemail.com', 'temp-mail.org', 'tempmail.com',
  'yopmail.com', 'getnada.com', 'trashmail.com', 'dispostable.com', 'maildrop.cc', 'throwawaymail.com'
])

// Brands that exist under many country domains: yahoo.co.uk, hotmail.fr, gmx.de …
const FAMILIES = ['yahoo', 'hotmail', 'live', 'outlook', 'gmx', 'yandex', 'windowslive', 'aol']

export function emailDomain(email: string): string {
  return email.trim().toLowerCase().split('@').pop() ?? ''
}

export function isFreeEmailDomain(domain: string): boolean {
  const d = domain.trim().toLowerCase().replace(/\.$/, '')
  if (!d) return true
  if (EXACT.has(d)) return true
  const first = d.split('.')[0] ?? ''
  return FAMILIES.includes(first)
}
