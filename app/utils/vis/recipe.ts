/**
 * A Data Prep recipe as a graph the visualiser can run node by node: inputs,
 * filter, transform (a catalogue of formula functions — date, text, number,
 * logic and multi-row window functions), join (lookup, left, right, inner,
 * full outer), append, aggregate and output.
 *
 * Execution order is the graph's topological order: a node runs once every
 * node it reads from has run, ties broken by position, which is how a recipe
 * (and a dataflow) can run independent branches in any order and still be
 * deterministic about the result.
 */
import { type Agg, type Cmp, type Row, type Value, DATASETS, aggregate, compare, tag, test } from './data'

export type JoinType = 'lookup' | 'left' | 'right' | 'inner' | 'outer'

export type FnId
  = | 'year' | 'quarter' | 'month' | 'day' | 'day_of_week' | 'week' | 'date_trunc_month' | 'add_months' | 'date_diff_days' | 'days_until_today' | 'last_day' | 'to_date'
    | 'upper' | 'lower' | 'concat' | 'substr' | 'length' | 'replace'
    | 'round' | 'multiply' | 'abs'
    | 'coalesce' | 'bucket' | 'case_won' | 'is_null'
    | 'running_total' | 'rank' | 'lag' | 'share_of_partition'

export interface TransformFn { fn: FnId, field: string, as: string, arg?: string, partition?: string, order?: string }

export type RecipeNode
  = | { id: string, type: 'input', dataset: string }
    | { id: string, type: 'filter', input: string, field: string, cmp: Cmp, value: string }
    | { id: string, type: 'transform', input: string, fns: TransformFn[] }
    | { id: string, type: 'join', left: string, right: string, join: JoinType, leftKey: string, rightKey: string, prefix: string }
    | { id: string, type: 'append', inputs: string[] }
    | { id: string, type: 'aggregate', input: string, by: string[], measures: { field: string, agg: Agg, as: string }[] }
    | { id: string, type: 'output', input: string, name: string }

export const inputsOf = (n: RecipeNode): string[] =>
  n.type === 'input' ? [] : n.type === 'join' ? [n.left, n.right] : n.type === 'append' ? n.inputs : [n.input]

/* --- Formula functions -------------------------------------------------------- */
type Ctx = { rows: Row[], i: number }
const date = (v: Value) => (v === null ? null : new Date(`${String(v).slice(0, 10)}T00:00:00Z`))
const iso = (d: Date) => d.toISOString().slice(0, 10)
// "Today" is fixed so the examples read the same on every visit.
export const TODAY = '2026-10-29'

function windowRows(ctx: Ctx, f: TransformFn) {
  const key = f.partition ? ctx.rows[ctx.i]![f.partition] : 'all'
  const part = ctx.rows.map((r, idx) => ({ r, idx })).filter(x => (f.partition ? x.r[f.partition] === key : true))
  const ord = f.order ?? f.field
  return part.sort((a, b) => compare(a.r[ord] ?? null, b.r[ord] ?? null))
}

export const FUNCTIONS: Record<FnId, { cat: 'date' | 'text' | 'number' | 'logic' | 'window', formula: (f: TransformFn) => string, apply: (v: Value, f: TransformFn, ctx: Ctx) => Value }> = {
  year: { cat: 'date', formula: f => `year(${f.field})`, apply: v => date(v)?.getUTCFullYear() ?? null },
  quarter: { cat: 'date', formula: f => `quarter(${f.field})`, apply: v => (date(v) ? Math.floor(date(v)!.getUTCMonth() / 3) + 1 : null) },
  month: { cat: 'date', formula: f => `month(${f.field})`, apply: v => (date(v) ? date(v)!.getUTCMonth() + 1 : null) },
  day: { cat: 'date', formula: f => `day(${f.field})`, apply: v => date(v)?.getUTCDate() ?? null },
  day_of_week: { cat: 'date', formula: f => `dayofweek(${f.field})`, apply: v => (date(v) ? date(v)!.getUTCDay() + 1 : null) },
  week: { cat: 'date', formula: f => `weekofyear(${f.field})`, apply: (v) => {
    const d = date(v)
    if (!d) return null
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
    return Math.ceil(((t.getTime() - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86_400_000 + 1) / 7)
  } },
  date_trunc_month: { cat: 'date', formula: f => `date_trunc('month', ${f.field})`, apply: v => (date(v) ? `${String(v).slice(0, 7)}-01` : null) },
  add_months: { cat: 'date', formula: f => `add_months(${f.field}, ${f.arg ?? 3})`, apply: (v, f) => {
    const d = date(v)
    if (!d) return null
    d.setUTCMonth(d.getUTCMonth() + Number(f.arg ?? 3))
    return iso(d)
  } },
  date_diff_days: { cat: 'date', formula: f => `datediff(${f.field}, to_date('${f.arg ?? '2026-01-01'}'))`, apply: (v, f) => {
    const d = date(v)
    const from = date(f.arg ?? '2026-01-01')
    return d && from ? Math.round((d.getTime() - from.getTime()) / 86_400_000) : null
  } },
  days_until_today: { cat: 'date', formula: f => `datediff(current_date(), ${f.field})`, apply: (v) => {
    const d = date(v)
    return d ? Math.round((date(TODAY)!.getTime() - d.getTime()) / 86_400_000) : null
  } },
  last_day: { cat: 'date', formula: f => `last_day(${f.field})`, apply: (v) => {
    const d = date(v)
    return d ? iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))) : null
  } },
  to_date: { cat: 'date', formula: f => `to_date(${f.field}, 'yyyy-MM-dd')`, apply: v => (date(v) ? `${String(v).slice(0, 10)}T00:00:00.000Z` : null) },
  upper: { cat: 'text', formula: f => `upper(${f.field})`, apply: v => (v === null ? null : String(v).toUpperCase()) },
  lower: { cat: 'text', formula: f => `lower(${f.field})`, apply: v => (v === null ? null : String(v).toLowerCase()) },
  concat: { cat: 'text', formula: f => `concat(${f.field}, ' - ', ${f.arg ?? 'StageName'})`, apply: (v, f, ctx) => `${v ?? ''} - ${ctx.rows[ctx.i]![f.arg ?? 'StageName'] ?? ''}` },
  substr: { cat: 'text', formula: f => `substr(${f.field}, 1, ${f.arg ?? 3})`, apply: (v, f) => (v === null ? null : String(v).slice(0, Number(f.arg ?? 3))) },
  length: { cat: 'text', formula: f => `length(${f.field})`, apply: v => (v === null ? null : String(v).length) },
  replace: { cat: 'text', formula: f => `replace(${f.field}, ' ', '_')`, apply: v => (v === null ? null : String(v).replaceAll(' ', '_')) },
  round: { cat: 'number', formula: f => `round(${f.field}, ${f.arg ?? -3})`, apply: (v, f) => {
    if (v === null) return null
    const p = 10 ** -Number(f.arg ?? -3)
    return Math.round(Number(v) / p) * p
  } },
  multiply: { cat: 'number', formula: f => `${f.field} * ${f.arg ?? 1.18}`, apply: (v, f) => (v === null ? null : Math.round(Number(v) * Number(f.arg ?? 1.18) * 100) / 100) },
  abs: { cat: 'number', formula: f => `abs(${f.field})`, apply: v => (v === null ? null : Math.abs(Number(v))) },
  coalesce: { cat: 'logic', formula: f => `coalesce(${f.field}, ${f.arg ?? 0})`, apply: (v, f) => v ?? (Number.isNaN(Number(f.arg ?? 0)) ? f.arg ?? null : Number(f.arg ?? 0)) },
  bucket: { cat: 'logic', formula: f => `case when ${f.field} >= 40000 then 'Large' when ${f.field} >= 15000 then 'Medium' when ${f.field} is null then 'Unknown' else 'Small' end`, apply: v => (v === null ? 'Unknown' : Number(v) >= 40000 ? 'Large' : Number(v) >= 15000 ? 'Medium' : 'Small') },
  case_won: { cat: 'logic', formula: f => `case when ${f.field} = 'Closed Won' then 1 else 0 end`, apply: v => (v === 'Closed Won' ? 1 : 0) },
  is_null: { cat: 'logic', formula: f => `case when ${f.field} is null then 'missing' else 'ok' end`, apply: v => (v === null ? 'missing' : 'ok') },
  running_total: { cat: 'window', formula: f => `sum(${f.field}) over (${f.partition ? `partition by ${f.partition} ` : ''}order by ${f.order ?? 'CloseDate'} rows between unbounded preceding and current row)`, apply: (_v, f, ctx) => {
    const w = windowRows(ctx, { ...f, order: f.order ?? 'CloseDate' })
    let sum = 0
    for (const x of w) {
      sum += Number(x.r[f.field] ?? 0)
      if (x.idx === ctx.i) return sum
    }
    return null
  } },
  rank: { cat: 'window', formula: f => `rank() over (${f.partition ? `partition by ${f.partition} ` : ''}order by ${f.field} desc)`, apply: (v, f, ctx) => {
    const w = windowRows(ctx, { ...f, order: f.field }).reverse()
    return w.findIndex(x => compare(x.r[f.field] ?? null, v) === 0) + 1
  } },
  lag: { cat: 'window', formula: f => `lag(${f.field}, 1) over (${f.partition ? `partition by ${f.partition} ` : ''}order by ${f.order ?? 'CloseDate'})`, apply: (_v, f, ctx) => {
    const w = windowRows(ctx, { ...f, order: f.order ?? 'CloseDate' })
    const at = w.findIndex(x => x.idx === ctx.i)
    return at > 0 ? w[at - 1]!.r[f.field] ?? null : null
  } },
  share_of_partition: { cat: 'window', formula: f => `${f.field} / sum(${f.field}) over (${f.partition ? `partition by ${f.partition}` : ''})`, apply: (v, f, ctx) => {
    const total = windowRows(ctx, f).reduce((s, x) => s + Number(x.r[f.field] ?? 0), 0)
    return v === null || !total ? null : Math.round((Number(v) / total) * 1000) / 10
  } }
}

/* --- Execution ---------------------------------------------------------------- */
export interface NodeResult {
  id: string
  order: number
  rows: Row[]
  /** Rows (by __id) of the first input that found no partner, matched once, or matched more than once. */
  marks?: Record<string, 'matched' | 'unmatched' | 'fanout' | 'dropped' | 'kept'>
  /** For a filter: every input row, marked kept or dropped. */
  before?: Row[]
  newCols?: string[]
  explain: string
  params: Record<string, string | number>
  rowsIn: number
  error?: string
}

/** Kahn's algorithm, ties broken by the order nodes are listed in. */
export function executionOrder(nodes: RecipeNode[]): string[] {
  const pending = new Map(nodes.map(n => [n.id, inputsOf(n).filter(i => nodes.some(m => m.id === i))]))
  const order: string[] = []
  while (pending.size) {
    const ready = nodes.find(n => pending.has(n.id) && pending.get(n.id)!.every(d => order.includes(d)))
    if (!ready) break // a cycle — the remaining nodes never run
    order.push(ready.id)
    pending.delete(ready.id)
  }
  return order
}

const ARCHIVE: Row[] = [
  { Id: 'H1', Name: 'Acme 2025 seats', AccountId: 'A1', StageName: 'Closed Won', Amount: 36000, CloseDate: '2025-11-02', OwnerId: 'U1' },
  { Id: 'H2', Name: 'Cobalt 2025 pilot', AccountId: 'A3', StageName: 'Closed Won', Amount: 15000, CloseDate: '2025-09-14', OwnerId: 'U2' }
]
const source = (name: string): Row[] => (name === 'archive' ? ARCHIVE : DATASETS[name]?.rows ?? [])

export function runRecipe(nodes: RecipeNode[]): NodeResult[] {
  const results = new Map<string, NodeResult>()
  const order = executionOrder(nodes)
  for (const [k, id] of order.entries()) {
    const n = nodes.find(x => x.id === id)!
    const inRows = (ref: string) => results.get(ref)?.rows ?? []
    const base = { id, order: k + 1 }

    if (n.type === 'input') {
      const rows = tag(source(n.dataset), `${n.id}-`)
      results.set(id, { ...base, rows, explain: 'input', params: { name: n.dataset, n: rows.length }, rowsIn: 0 })
    } else if (n.type === 'filter') {
      const before = inRows(n.input)
      const marks: NodeResult['marks'] = {}
      const rows = before.filter((r) => {
        const ok = test(r[n.field] ?? null, n.cmp, n.value)
        marks[String(r.__id)] = ok ? 'kept' : 'dropped'
        return ok
      })
      results.set(id, { ...base, rows, before, marks, explain: 'filter', params: { field: n.field, kept: rows.length, dropped: before.length - rows.length }, rowsIn: before.length })
    } else if (n.type === 'transform') {
      let rows = inRows(n.input).map(r => ({ ...r }))
      const rowsIn = rows.length
      for (const f of n.fns) {
        const snapshot = rows.map(r => ({ ...r }))
        rows = rows.map((r, i) => ({ ...r, [f.as]: FUNCTIONS[f.fn].apply(snapshot[i]![f.field] ?? null, f, { rows: snapshot, i }) }))
      }
      results.set(id, { ...base, rows, newCols: n.fns.map(f => f.as), explain: 'transform', params: { n: n.fns.length }, rowsIn })
    } else if (n.type === 'join') {
      const L = inRows(n.left)
      const R = inRows(n.right)
      const pre = (r: Row) => Object.fromEntries(Object.entries(r).filter(([k]) => !k.startsWith('__')).map(([k, v]) => [`${n.prefix}.${k}`, v]))
      const nullRight = R[0] ? Object.fromEntries(Object.keys(pre(R[0])).map(k => [k, null])) : {}
      const nullLeft = L[0] ? Object.fromEntries(Object.keys(L[0]).filter(k => !k.startsWith('__')).map(k => [k, null])) : {}
      const marks: NodeResult['marks'] = {}
      const rows: Row[] = []
      const usedRight = new Set<number>()
      for (const l of L) {
        const hits = R.map((r, i) => ({ r, i })).filter(x => x.r[n.rightKey] !== null && x.r[n.rightKey] === l[n.leftKey])
        marks[String(l.__id)] = !hits.length ? 'unmatched' : hits.length > 1 && n.join !== 'lookup' ? 'fanout' : 'matched'
        if (!hits.length) {
          if (n.join !== 'inner' && n.join !== 'right') rows.push({ ...l, ...nullRight })
          continue
        }
        hits.forEach(h => usedRight.add(h.i))
        // Lookup keeps one match per row: no fan-out, ever.
        for (const h of n.join === 'lookup' ? hits.slice(0, 1) : hits) {
          rows.push({ ...l, __id: `${l.__id}+${h.r.__id}`, ...pre(h.r) })
        }
      }
      if (n.join === 'right' || n.join === 'outer') {
        R.forEach((r, i) => {
          if (!usedRight.has(i)) rows.push({ __id: `∅+${r.__id}`, ...nullLeft, ...pre(r) })
        })
      }
      const unmatched = L.filter(l => marks[String(l.__id)] === 'unmatched').length
      const unmatchedRight = R.length - usedRight.size
      results.set(id, { ...base, rows, marks, newCols: R[0] ? Object.keys(pre(R[0])) : [], explain: `join_${n.join}`, params: { left: L.length, right: R.length, out: rows.length, unmatched, unmatchedRight, key: `${n.leftKey} = ${n.prefix}.${n.rightKey}` }, rowsIn: L.length })
    } else if (n.type === 'append') {
      const parts = n.inputs.map(inRows)
      const rows = parts.flat()
      results.set(id, { ...base, rows, explain: 'append', params: { parts: parts.map(p => p.length).join(' + '), n: rows.length }, rowsIn: rows.length })
    } else if (n.type === 'aggregate') {
      const input = inRows(n.input)
      const groups = new Map<string, Row[]>()
      for (const r of input) {
        const key = n.by.map(b => String(r[b] ?? 'null')).join('|')
        groups.set(key, [...(groups.get(key) ?? []), r])
      }
      const rows = [...groups.values()].map((g, gi) => ({
        __id: `${id}-${gi}`,
        ...Object.fromEntries(n.by.map(b => [b, g[0]![b] ?? null])),
        ...Object.fromEntries(n.measures.map(m => [m.as, aggregate(g, m.agg, m.field)]))
      }) as Row)
      results.set(id, { ...base, rows, newCols: n.measures.map(m => m.as), explain: 'aggregate', params: { by: n.by.join(', ') || '—', groups: rows.length, n: input.length }, rowsIn: input.length })
    } else if (n.type === 'output') {
      const rows = inRows(n.input)
      results.set(id, { ...base, rows, explain: 'output', params: { name: n.name, n: rows.length, cols: Object.keys(rows[0] ?? {}).filter(k => !k.startsWith('__')).length }, rowsIn: rows.length })
    }
  }
  return order.map(id => results.get(id)!)
}

/* --- Presets -------------------------------------------------------------------- */
export const RECIPE_PRESETS: { id: string, nodes: RecipeNode[] }[] = [
  {
    id: 'pipelineByRegion',
    nodes: [
      { id: 'opps', type: 'input', dataset: 'opportunities' },
      { id: 'accounts', type: 'input', dataset: 'accounts' },
      { id: 'open', type: 'filter', input: 'opps', field: 'StageName', cmp: '!=', value: 'Closed Lost' },
      { id: 'dates', type: 'transform', input: 'open', fns: [
        { fn: 'year', field: 'CloseDate', as: 'CloseYear' },
        { fn: 'quarter', field: 'CloseDate', as: 'CloseQuarter' },
        { fn: 'coalesce', field: 'Amount', as: 'Amount_filled', arg: '0' },
        { fn: 'bucket', field: 'Amount', as: 'DealSize' }
      ] },
      { id: 'join', type: 'join', left: 'dates', right: 'accounts', join: 'lookup', leftKey: 'AccountId', rightKey: 'Id', prefix: 'Account' },
      { id: 'agg', type: 'aggregate', input: 'join', by: ['Account.Region'], measures: [{ field: 'Amount_filled', agg: 'sum', as: 'Pipeline' }, { field: 'Id', agg: 'count', as: 'Deals' }] },
      { id: 'out', type: 'output', input: 'agg', name: 'pipeline_by_region' }
    ]
  },
  {
    id: 'joinTypes',
    nodes: [
      { id: 'accounts', type: 'input', dataset: 'accounts' },
      { id: 'opps', type: 'input', dataset: 'opportunities' },
      { id: 'join', type: 'join', left: 'accounts', right: 'opps', join: 'left', leftKey: 'Id', rightKey: 'AccountId', prefix: 'Opp' },
      { id: 'out', type: 'output', input: 'join', name: 'accounts_with_opps' }
    ]
  },
  {
    id: 'windowFns',
    nodes: [
      { id: 'opps', type: 'input', dataset: 'opportunities' },
      { id: 'won', type: 'filter', input: 'opps', field: 'StageName', cmp: '==', value: 'Closed Won' },
      { id: 'win', type: 'transform', input: 'won', fns: [
        { fn: 'running_total', field: 'Amount', as: 'RunningWon', order: 'CloseDate' },
        { fn: 'rank', field: 'Amount', as: 'RankInAccount', partition: 'AccountId' },
        { fn: 'lag', field: 'Amount', as: 'PreviousDeal', partition: 'AccountId', order: 'CloseDate' },
        { fn: 'share_of_partition', field: 'Amount', as: 'PctOfAccount', partition: 'AccountId' }
      ] },
      { id: 'out', type: 'output', input: 'win', name: 'won_with_windows' }
    ]
  },
  {
    id: 'dates',
    nodes: [
      { id: 'opps', type: 'input', dataset: 'opportunities' },
      { id: 'dates', type: 'transform', input: 'opps', fns: [
        { fn: 'to_date', field: 'CloseDate', as: 'CloseDate_dt' },
        { fn: 'month', field: 'CloseDate', as: 'Month' },
        { fn: 'day_of_week', field: 'CloseDate', as: 'DayOfWeek' },
        { fn: 'week', field: 'CloseDate', as: 'Week' },
        { fn: 'date_trunc_month', field: 'CloseDate', as: 'MonthStart' },
        { fn: 'last_day', field: 'CloseDate', as: 'MonthEnd' },
        { fn: 'add_months', field: 'CloseDate', as: 'RenewalDate', arg: '12' },
        { fn: 'days_until_today', field: 'CloseDate', as: 'DaysAgo' }
      ] },
      { id: 'out', type: 'output', input: 'dates', name: 'opps_dates' }
    ]
  },
  {
    id: 'appendHistory',
    nodes: [
      { id: 'opps', type: 'input', dataset: 'opportunities' },
      { id: 'archive', type: 'input', dataset: 'archive' },
      { id: 'all', type: 'append', inputs: ['opps', 'archive'] },
      { id: 'yr', type: 'transform', input: 'all', fns: [{ fn: 'year', field: 'CloseDate', as: 'Year' }, { fn: 'case_won', field: 'StageName', as: 'IsWon' }] },
      { id: 'agg', type: 'aggregate', input: 'yr', by: ['Year'], measures: [{ field: 'IsWon', agg: 'sum', as: 'Won' }, { field: 'Id', agg: 'count', as: 'Deals' }] },
      { id: 'out', type: 'output', input: 'agg', name: 'win_rate_by_year' }
    ]
  }
]

export const JOIN_TYPES: JoinType[] = ['lookup', 'left', 'right', 'inner', 'outer']
export const FN_IDS = Object.keys(FUNCTIONS) as FnId[]
