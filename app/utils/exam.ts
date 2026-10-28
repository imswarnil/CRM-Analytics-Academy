/**
 * Certification practice, modelled on the Salesforce Certified CRM Analytics
 * and Einstein Discovery Consultant exam: 60 multiple-choice questions,
 * 105 minutes, 68% to pass, weighted across six domains. Check the current
 * Trailhead exam guide before relying on the numbers; they live only here.
 *
 * The questions are the Academy's own (content/en/exam/*.md, translated by the build; extracted from
 * the course's quizzes) — original practice material, never real exam items.
 * Papers are built deterministically, so "Paper 3" is always the same paper.
 */
export interface BankQuestion {
  id: string
  q: string
  options: string[]
  answer: number
  domain: ExamDomain
  topic: string
  topicTitle: string
}

export const EXAM = {
  name: 'CRM Analytics and Einstein Discovery Consultant',
  questions: 60,
  minutes: 105,
  passPct: 68
}

export const DOMAINS = {
  'data-layer': { label: 'Data Layer', weight: 24 },
  'security': { label: 'Security', weight: 11 },
  'admin': { label: 'Admin', weight: 9 },
  'dashboard-design': { label: 'Analytics Dashboard Design', weight: 19 },
  'dashboard-implementation': { label: 'Analytics Dashboard Implementation', weight: 18 },
  'einstein-discovery': { label: 'Einstein Discovery Story Design', weight: 19 }
} as const

export type ExamDomain = keyof typeof DOMAINS

export interface Paper {
  id: string
  title: string
  kind: 'full' | 'drill'
  questions: number
  minutes: number
  domain?: ExamDomain
}

export const PAPERS: Paper[] = [
  ...[1, 2, 3, 4, 5].map(n => ({ id: `paper-${n}`, title: `Practice paper ${n}`, kind: 'full' as const, questions: EXAM.questions, minutes: EXAM.minutes })),
  ...(Object.keys(DOMAINS) as ExamDomain[]).map(d => ({ id: `drill-${d}`, title: DOMAINS[d].label, kind: 'drill' as const, questions: 15, minutes: 25, domain: d }))
]

/** A stable pseudo-random generator from a string seed (mulberry32). */
function rng(seed: string) {
  let h = 1779033703
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 3432918353)
  let a = h >>> 0
  return () => {
    a |= 0
    a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/**
 * The questions of one paper. A full paper takes each domain's share of 60 by
 * weight (largest remainders), a drill takes 15 from one domain. Options are
 * shuffled too, with the answer index remapped.
 */
export function buildPaper(bank: BankQuestion[], paper: Paper): BankQuestion[] {
  const rand = rng(paper.id)
  const pick = (domain: ExamDomain, n: number) => shuffle(bank.filter(q => q.domain === domain), rand).slice(0, n)
  let chosen: BankQuestion[]
  if (paper.domain) {
    chosen = pick(paper.domain, paper.questions)
  } else {
    const keys = Object.keys(DOMAINS) as ExamDomain[]
    const exact = keys.map(k => ({ k, n: (DOMAINS[k].weight / 100) * paper.questions }))
    const counts = Object.fromEntries(exact.map(e => [e.k, Math.floor(e.n)])) as Record<ExamDomain, number>
    let left = paper.questions - Object.values(counts).reduce((s, n) => s + n, 0)
    for (const e of [...exact].sort((a, b) => (b.n % 1) - (a.n % 1))) {
      if (left-- <= 0) break
      counts[e.k]++
    }
    chosen = shuffle(keys.flatMap(k => pick(k, counts[k])), rand)
  }
  return chosen.map((q) => {
    const order = shuffle(q.options.map((_, i) => i), rand)
    return { ...q, options: order.map(i => q.options[i]!), answer: order.indexOf(q.answer) }
  })
}
