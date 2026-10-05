/** Shapes the content editor's API returns (server/api/admin/content/*). */

export interface EditorLesson {
  file: string
  path: string
  sha: string
  num: number
  slug: string
  title: string
  navTitle: string | null
  access: 'free' | 'pro'
  authors: string[]
  credits: number
  route: string
}

export interface EditorSection {
  dir: string
  path: string
  treeSha: string
  num: number
  slug: string
  title: string
  icon: string | null
  navSha: string | null
  lessons: EditorLesson[]
}

export interface EditorPerson {
  slug: string
  path: string
  sha: string
  name: string
  role: string
  avatar: string | null
  headline: string | null
}

export interface EditorDraft {
  id: number
  branch: string
  prNumber: number | null
  prUrl: string | null
  title: string
  paths: string[]
  status: 'open' | 'changes_requested' | 'published' | 'closed'
  reviewNote: string | null
}

export interface EditorTree {
  role: 'admin' | 'instructor'
  personSlug: string | null
  linkError: string | null
  repo: string
  branch: string
  head: string
  enTreeSha: string
  sections: EditorSection[]
  people: EditorPerson[]
  drafts: EditorDraft[]
}

/** What every write route returns. */
export interface PublishResult {
  mode: 'commit' | 'pull'
  commitSha: string
  commitUrl: string
  branch: string
  prNumber?: number
  prUrl?: string
  path?: string
  sha?: string
}
