/** Shared vocabulary for the interview question bank. */
export const INTERVIEW_TYPES = ['conceptual', 'technical', 'scenario', 'behavioral', 'saql'] as const
export const INTERVIEW_LEVELS = ['junior', 'mid', 'senior'] as const
export type InterviewType = typeof INTERVIEW_TYPES[number]
export type InterviewLevel = typeof INTERVIEW_LEVELS[number]

export function excerpt(md: string, n = 220): string {
  const text = md.replace(/```[\s\S]*?```/g, ' ').replace(/[#*_`>[\]()-]+/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > n ? `${text.slice(0, n).replace(/\s+\S*$/, '')}…` : text
}

export function slugifyQuestion(q: string): string {
  return q.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '') || 'question'
}
