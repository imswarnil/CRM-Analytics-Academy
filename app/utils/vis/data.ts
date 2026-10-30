/**
 * The sample data every visualiser runs on: small enough to see every row,
 * shaped to show every edge case — an account with no opportunities (outer
 * joins), an opportunity whose account does not exist (right joins, orphans),
 * an account with several opportunities (fan-out), a null amount, and a
 * manager chain for flatten. The company is the course's own fiction: CRM
 * Analytics Academy selling seats.
 */
export type Value = string | number | null
export type Row = Record<string, Value>

export const DATASETS: Record<string, { label: string, key: string, rows: Row[] }> = {
  opportunities: {
    label: 'Opportunity',
    key: 'Id',
    rows: [
      { Id: 'O1', Name: 'Acme seats', AccountId: 'A1', StageName: 'Closed Won', Amount: 42000, CloseDate: '2026-01-15', OwnerId: 'U1' },
      { Id: 'O2', Name: 'Acme renewal', AccountId: 'A1', StageName: 'Negotiation', Amount: 18000, CloseDate: '2026-03-30', OwnerId: 'U2' },
      { Id: 'O3', Name: 'Bluefin pilot', AccountId: 'A2', StageName: 'Closed Won', Amount: 25000, CloseDate: '2026-02-10', OwnerId: 'U1' },
      { Id: 'O4', Name: 'Bluefin expansion', AccountId: 'A2', StageName: 'Prospecting', Amount: 9000, CloseDate: '2026-05-05', OwnerId: 'U3' },
      { Id: 'O5', Name: 'Cobalt platform', AccountId: 'A3', StageName: 'Closed Lost', Amount: 60000, CloseDate: '2026-01-28', OwnerId: 'U2' },
      { Id: 'O6', Name: 'Cobalt seats', AccountId: 'A3', StageName: 'Closed Won', Amount: 75000, CloseDate: '2026-04-12', OwnerId: 'U2' },
      { Id: 'O7', Name: 'Dune training', AccountId: 'A4', StageName: 'Qualification', Amount: null, CloseDate: '2026-06-01', OwnerId: 'U3' },
      { Id: 'O8', Name: 'Orphan deal', AccountId: 'A9', StageName: 'Closed Won', Amount: 5000, CloseDate: '2026-02-20', OwnerId: 'U1' },
      { Id: 'O9', Name: 'Acme bootcamp', AccountId: 'A1', StageName: 'Closed Won', Amount: 30000, CloseDate: '2026-05-18', OwnerId: 'U3' },
      { Id: 'O10', Name: 'Dune seats', AccountId: 'A4', StageName: 'Closed Lost', Amount: 8000, CloseDate: '2026-03-03', OwnerId: 'U1' }
    ]
  },
  accounts: {
    label: 'Account',
    key: 'Id',
    rows: [
      { Id: 'A1', Name: 'Acme Retail', Industry: 'Retail', Region: 'EMEA', Segment: 'Enterprise' },
      { Id: 'A2', Name: 'Bluefin Health', Industry: 'Healthcare', Region: 'AMER', Segment: 'Mid-Market' },
      { Id: 'A3', Name: 'Cobalt Bank', Industry: 'Finance', Region: 'APAC', Segment: 'Enterprise' },
      { Id: 'A4', Name: 'Dune Logistics', Industry: 'Logistics', Region: 'AMER', Segment: 'SMB' },
      { Id: 'A5', Name: 'Ember Labs', Industry: 'Technology', Region: 'EMEA', Segment: 'SMB' }
    ]
  },
  users: {
    label: 'User',
    key: 'Id',
    rows: [
      { Id: 'U1', Name: 'Asha Rao', ManagerId: 'U4', Team: 'Inside Sales' },
      { Id: 'U2', Name: 'Ben Ortiz', ManagerId: 'U4', Team: 'Enterprise' },
      { Id: 'U3', Name: 'Chen Wei', ManagerId: 'U1', Team: 'Inside Sales' },
      { Id: 'U4', Name: 'Dana Kim', ManagerId: null, Team: 'Leadership' }
    ]
  },
  targets: {
    label: 'Target (CSV)',
    key: 'Region',
    rows: [
      { Region: 'AMER', Quarter: '2026-Q1', Target: 40000 },
      { Region: 'EMEA', Quarter: '2026-Q1', Target: 50000 },
      { Region: 'APAC', Quarter: '2026-Q1', Target: 70000 }
    ]
  }
}

export type DatasetName = keyof typeof DATASETS

/** Columns in first-seen order across every row. */
export function columnsOf(rows: Row[]): string[] {
  const seen: string[] = []
  for (const r of rows) for (const k of Object.keys(r)) if (!k.startsWith('__') && !seen.includes(k)) seen.push(k)
  return seen
}

export const clone = (rows: Row[]) => rows.map(r => ({ ...r }))

/** A stable id per row, so a row can be followed from step to step. */
export function tag(rows: Row[], prefix: string): Row[] {
  return rows.map((r, i) => ({ __id: `${prefix}${i}`, ...r }))
}

export function compare(a: Value, b: Value): number {
  if (a === b) return 0
  if (a === null) return -1
  if (b === null) return 1
  return typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
}

export type Agg = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'unique'
export function aggregate(rows: Row[], agg: Agg, field?: string): Value {
  if (agg === 'count') return rows.length
  const vals = rows.map(r => (field ? r[field] : null)).filter((v): v is string | number => v !== null && v !== undefined)
  if (agg === 'unique') return new Set(vals).size
  const nums = vals.map(Number).filter(n => !Number.isNaN(n))
  if (!nums.length) return null
  if (agg === 'sum') return nums.reduce((s, n) => s + n, 0)
  if (agg === 'avg') return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 100) / 100
  if (agg === 'min') return Math.min(...nums)
  return Math.max(...nums)
}

export type Cmp = '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'is null' | 'is not null'
export function test(v: Value, cmp: Cmp, raw: string): boolean {
  if (cmp === 'is null') return v === null
  if (cmp === 'is not null') return v !== null
  if (cmp === 'in') return raw.split(',').map(s => s.trim()).includes(String(v))
  const target: Value = raw !== '' && !Number.isNaN(Number(raw)) && typeof v === 'number' ? Number(raw) : raw
  if (v === null) return false
  const c = compare(v, target)
  return cmp === '==' ? c === 0 : cmp === '!=' ? c !== 0 : cmp === '>' ? c > 0 : cmp === '>=' ? c >= 0 : cmp === '<' ? c < 0 : c <= 0
}

export const fmt = (v: Value) => (v === null || v === undefined ? 'null' : typeof v === 'number' ? v.toLocaleString('en') : v)
