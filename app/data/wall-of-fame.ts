/**
 * The Wall of Fame, curated by hand — like the resources list, this is data,
 * not UI copy. Shared by /wall-of-fame and the home page's wall.
 *
 * To add someone: append an entry with their name, one of the five types, a
 * short factual description of their community contribution, and a
 * `linkedin` link. Unless you are certain of the person's exact LinkedIn
 * handle, use a people-search URL (`/search/results/all/?keywords=<name>`) so
 * we never fabricate a profile slug. `url` is an optional secondary link
 * (personal site, GitHub). `photo` is optional and must be a real, permitted
 * image of the person; without one the polaroid shows a drawn silhouette.
 * Nominations arrive through /nominate.
 */
export type WallPersonType = 'blogger' | 'youtuber' | 'author' | 'speaker' | 'builder'

export interface WallPerson {
  name: string
  type: WallPersonType
  desc: string
  linkedin: string
  url?: string
  icon?: string
  photo?: string
}

export const WALL_TYPE_ICONS: Record<WallPersonType, string> = {
  blogger: 'i-lucide-pen-line',
  youtuber: 'i-lucide-youtube',
  author: 'i-lucide-book-open',
  speaker: 'i-lucide-mic',
  builder: 'i-lucide-wrench'
}

export const WALL_TYPES: WallPersonType[] = ['blogger', 'youtuber', 'author', 'speaker', 'builder']

export const WALL_PEOPLE: WallPerson[] = [
  { name: 'Rikke Hovgaard', type: 'blogger', desc: 'Writes salesforceblogger.com, one of the longest-running blogs dedicated to CRM Analytics tips, bindings, and dashboard techniques.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Rikke%20Hovgaard', url: 'https://www.salesforceblogger.com', icon: 'i-lucide-globe' },
  { name: 'Mohan Chinnappan', type: 'builder', desc: 'Builds and maintains open-source sfdx plugin tooling that many teams use to work with CRM Analytics assets from the command line.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Mohan%20Chinnappan', url: 'https://github.com/mohan-chinnappan-n', icon: 'i-simple-icons-github' },
  { name: 'Carl Brundage', type: 'speaker', desc: 'Einstein Analytics Champion and consultant, known for sharing deep implementation expertise at community events.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Carl%20Brundage' },
  { name: 'Mark Tossell', type: 'author', desc: 'Wrote the book Learning Tableau CRM and shares practical guidance on analytics adoption and dashboard design.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Mark%20Tossell' },
  { name: 'Bobby Brill', type: 'speaker', desc: 'Longtime Einstein Discovery product leader at Salesforce, a familiar face in community demos and sessions.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Bobby%20Brill' },
  { name: 'Skip Sauls', type: 'speaker', desc: 'CRM Analytics product management leader at Salesforce, known for engaging with practitioners in the Trailblazer community.', linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Skip%20Sauls' }
]

/** A stable pseudo-random number in [0, 1) from a string and a salt. */
export function seeded(text: string, salt = 0) {
  let h = 2166136261 ^ salt
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
