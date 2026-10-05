/**
 * The experts network's fixed vocabularies, as stable keys.
 *
 * Keys, not English, are what a form stores and what app.expert.skills holds,
 * so a profile reads correctly in every locale: the label for a key comes
 * from en.json (`experts.skills.<key>` and friends). An admin may still type
 * a free-text skill on a profile; anything that is not a known key is shown
 * exactly as written.
 */
export const EXPERT_SKILLS = [
  'dashboards',
  'recipes',
  'saql',
  'security',
  'bindings',
  'json',
  'einstein',
  'apis',
  'gtm',
  'training'
] as const

/** What a company can ask the network to deliver. */
export const PROJECT_SERVICES = [
  'dashboards',
  'pipelines',
  'saql',
  'security',
  'einstein',
  'rescue',
  'training'
] as const

/** Lower bound of each range is the number in the key — yearsFromRange() reads it. */
export const EXPERT_YEARS = ['from1', 'from3', 'from6', 'from10'] as const
export const EXPERT_RATES = ['under50', 'from50', 'from80', 'from120', 'from160', 'discuss'] as const
export const EXPERT_AVAILABILITY = ['fewHours', 'partTime', 'halfTime', 'fullTime'] as const

/** A public roster card, as GET /api/experts returns it. */
export interface PublicExpert {
  id: number
  name: string
  headline: string | null
  photoUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
  skills: string[]
  years: number | null
  country: string | null
}
