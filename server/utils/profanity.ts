// Lightweight server-side profanity/abuse check for auto-published content
// (the guestbook). Not exhaustive — it catches common slurs and vulgarity so
// obviously abusive posts are rejected before they go live; an admin can still
// hide/delete anything that slips through.

// Base word stems. Matched case-insensitively as whole-ish words, tolerant of
// simple leetspeak substitutions and repeated/padded characters.
const BLOCKLIST = [
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'dick', 'piss',
  'slut', 'whore', 'faggot', 'nigger', 'nigga', 'retard', 'rape', 'douche',
  'wanker', 'twat', 'pussy', 'cock', 'jerk off', 'motherfucker'
]

const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i'
}

function normalize(input: string): string {
  const deLeet = input
    .toLowerCase()
    .replace(/[013457@$!]/g, c => LEET[c] || c)
  // collapse runs of the same char (e.g. "shiiiit" -> "shit") and strip
  // separators used to evade filters (spaces/punctuation between letters)
  return deLeet
    .replace(/(.)\1{2,}/g, '$1$1')
    .replace(/[^a-z ]+/g, ' ')
}

/** True if the text contains blocked language. */
export function isAbusive(text: string): boolean {
  if (!text) return false
  const norm = normalize(text)
  const collapsed = norm.replace(/\s+/g, '')
  return BLOCKLIST.some((word) => {
    const w = word.replace(/\s+/g, '')
    // word-boundary match in the spaced form, plus a separator-stripped pass
    const spaced = new RegExp(`\\b${w}\\b`).test(norm.replace(/\s+/g, ''))
    return spaced || norm.includes(word) || collapsed.includes(w)
  })
}
