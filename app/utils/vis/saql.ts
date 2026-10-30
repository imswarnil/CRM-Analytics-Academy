/**
 * A tiny SAQL interpreter for the visualiser: the statements a learner meets
 * first (load, filter, group, cogroup, foreach, order, limit), run one at a
 * time over the sample data, with a snapshot after each so the page can show
 * what the stream looked like at every line.
 *
 * It is a teaching model, not SAQL: it follows SAQL's rules where they matter
 * to understanding (a grouped stream must go through foreach before it can be
 * filtered, ordered or limited; cogroup is inner unless told otherwise; group
 * keys are the only plain fields foreach may project) and reports breaking
 * one as a step error rather than guessing.
 */
import { type Agg, type Cmp, type Row, type Value, DATASETS, aggregate, compare, tag, test } from './data'

export type Join = 'inner' | 'left' | 'right' | 'full'
export type GenAgg = Agg | 'first'
export interface Gen { field: string, agg?: GenAgg, side?: 'a' | 'b', as: string }

export type SaqlStep
  = | { op: 'load', dataset: string }
    | { op: 'filter', field: string, cmp: Cmp, value: string }
    | { op: 'group', by: string[] }
    | { op: 'cogroup', by: string, with: string, withBy: string, join: Join }
    | { op: 'foreach', gen: Gen[] }
    | { op: 'order', field: string, dir: 'asc' | 'desc' }
    | { op: 'limit', n: number }

export type Mark = 'kept' | 'dropped' | 'new'
export type View
  = | { kind: 'rows', rows: Row[], marks?: Record<string, Mark>, newCols?: string[] }
    | { kind: 'groups', by: string[], groups: { key: string, rows: Row[] }[] }
    | { kind: 'pairs', by: string, withBy: string, left: string, right: string, groups: { key: string, a: Row[], b: Row[], kept: boolean }[] }

export interface Snapshot {
  /** Index of the statement in the generated code. */
  line: number
  code: string
  /** i18n key under vis.saql.explain, with its parameters. */
  explain: string
  params: Record<string, string | number>
  /** The stream as this statement found it (for filters: every row, marked). */
  before?: View
  view: View
  rowsIn: number
  rowsOut: number
  error?: string
}

type State
  = | { kind: 'rows', rows: Row[] }
    | { kind: 'groups', by: string[], groups: { key: string, rows: Row[] }[] }
    | { kind: 'cogroups', by: string, withBy: string, left: string, right: string, groups: { key: string, a: Row[], b: Row[] }[] }

const q = (s: string) => `'${s}'`
const lit = (v: string) => (v !== '' && !Number.isNaN(Number(v)) ? v : `"${v}"`)

/** The SAQL text of every statement, one entry per step (cogroup is three lines). */
export function saqlLines(steps: SaqlStep[]): string[] {
  let stream = 'q'
  return steps.map((s) => {
    switch (s.op) {
      case 'load': return `q = load "${s.dataset}";`
      case 'filter': {
        const v = s.cmp === 'is null' || s.cmp === 'is not null'
          ? `${q(s.field)} ${s.cmp}`
          : s.cmp === 'in'
            ? `${q(s.field)} in [${s.value.split(',').map(x => lit(x.trim())).join(', ')}]`
            : `${q(s.field)} ${s.cmp} ${lit(s.value)}`
        return `q = filter ${stream} by ${v};`
      }
      case 'group': return `q = group ${stream} by ${s.by.length ? s.by.length === 1 ? q(s.by[0]!) : `(${s.by.map(q).join(', ')})` : 'all'};`
      case 'cogroup': {
        stream = 'q'
        const left = s.join === 'left' || s.join === 'full' ? ` ${s.join}` : ''
        const right = s.join === 'right' ? ' right' : ''
        return `a = q;\nb = load "${s.with}";\nq = cogroup a by ${q(s.by)}${left}, b by ${q(s.withBy)}${right};`
      }
      case 'foreach': return `q = foreach q generate ${s.gen.map((g) => {
        const ref = g.side ? `${g.side}.${q(g.field)}` : q(g.field)
        const expr = g.agg === 'count' ? 'count()' : g.agg ? `${g.agg}(${ref})` : ref
        return `${expr} as ${q(g.as)}`
      }).join(', ')};`
      case 'order': return `q = order q by ${q(s.field)} ${s.dir};`
      case 'limit': return `q = limit q ${s.n};`
    }
    return ''
  })
}

const count = (st: State) => st.kind === 'rows' ? st.rows.length : st.kind === 'groups' ? st.groups.reduce((n, g) => n + g.rows.length, 0) : st.groups.length
const viewOf = (st: State): View => st.kind === 'cogroups'
  ? { kind: 'pairs', by: st.by, withBy: st.withBy, left: st.left, right: st.right, groups: st.groups.map(g => ({ ...g, kept: true })) }
  : st.kind === 'groups'
    ? { kind: 'groups', by: st.by, groups: st.groups }
    : { kind: 'rows', rows: st.rows }

function groupRows(rows: Row[], by: string[]) {
  const map = new Map<string, Row[]>()
  for (const r of rows) {
    const key = by.length ? by.map(f => String(r[f] ?? 'null')).join(' · ') : 'all'
    map.set(key, [...(map.get(key) ?? []), r])
  }
  return [...map.entries()].map(([key, rs]) => ({ key, rows: rs }))
}

function reduce(rows: Row[], agg: GenAgg, field: string): Value {
  if (agg === 'first') return rows[0]?.[field] ?? null
  return aggregate(rows, agg, field)
}

/** Runs every step and returns a snapshot after each. Stops at the first error. */
export function runSaql(steps: SaqlStep[]): Snapshot[] {
  const lines = saqlLines(steps)
  const out: Snapshot[] = []
  let st: State = { kind: 'rows', rows: [] }
  let left = 'q'

  for (const [i, s] of steps.entries()) {
    const code = lines[i]!
    const rowsIn = count(st)
    const fail = (error: string, params: Record<string, string | number> = {}) => {
      out.push({ line: i, code, explain: error, params, view: viewOf(st), rowsIn, rowsOut: rowsIn, error })
    }

    if (s.op === 'load') {
      const ds = DATASETS[s.dataset]
      if (!ds) {
        fail('noDataset', { name: s.dataset })
        return out
      }
      st = { kind: 'rows', rows: tag(ds.rows, `${s.dataset.slice(0, 1)}`) }
      left = s.dataset
      out.push({ line: i, code, explain: 'load', params: { name: s.dataset, n: ds.rows.length, cols: Object.keys(ds.rows[0] ?? {}).length }, view: viewOf(st), rowsIn: 0, rowsOut: ds.rows.length })
      continue
    }

    if (s.op === 'filter') {
      if (st.kind !== 'rows') {
        fail('filterGrouped')
        return out
      }
      const marks: Record<string, Mark> = {}
      const kept: Row[] = st.rows.filter((r) => {
        const ok = test(r[s.field] ?? null, s.cmp, s.value)
        marks[String(r.__id)] = ok ? 'kept' : 'dropped'
        return ok
      })
      const before: View = { kind: 'rows', rows: st.rows, marks }
      st = { kind: 'rows', rows: kept }
      out.push({ line: i, code, explain: 'filter', params: { field: s.field, kept: kept.length, dropped: rowsIn - kept.length }, before, view: viewOf(st), rowsIn, rowsOut: kept.length })
      continue
    }

    if (s.op === 'group') {
      if (st.kind !== 'rows') {
        fail('groupTwice')
        return out
      }
      st = { kind: 'groups', by: s.by, groups: groupRows(st.rows, s.by) }
      out.push({ line: i, code, explain: s.by.length ? 'group' : 'groupAll', params: { by: s.by.join(', '), groups: st.groups.length, n: rowsIn }, view: viewOf(st), rowsIn, rowsOut: rowsIn })
      continue
    }

    if (s.op === 'cogroup') {
      if (st.kind !== 'rows') {
        fail('cogroupGrouped')
        return out
      }
      const other = DATASETS[s.with]
      if (!other) {
        fail('noDataset', { name: s.with })
        return out
      }
      const a = groupRows(st.rows, [s.by])
      const b = groupRows(tag(other.rows, s.with.slice(0, 1).toUpperCase()), [s.withBy])
      const keys = [...new Set([...a.map(g => g.key), ...b.map(g => g.key)])].sort()
      const all = keys.map(key => ({ key, a: a.find(g => g.key === key)?.rows ?? [], b: b.find(g => g.key === key)?.rows ?? [] }))
      const keep = (g: { a: Row[], b: Row[] }) => s.join === 'full' || (s.join === 'left' ? g.a.length > 0 : s.join === 'right' ? g.b.length > 0 : g.a.length > 0 && g.b.length > 0)
      const before: View = { kind: 'pairs', by: s.by, withBy: s.withBy, left, right: s.with, groups: all.map(g => ({ ...g, kept: keep(g) })) }
      st = { kind: 'cogroups', by: s.by, withBy: s.withBy, left, right: s.with, groups: all.filter(keep) }
      out.push({ line: i, code, explain: `cogroup_${s.join}`, params: { by: s.by, withBy: s.withBy, keys: all.length, kept: st.groups.length, dropped: all.length - st.groups.length }, before, view: viewOf(st), rowsIn, rowsOut: st.groups.length })
      continue
    }

    if (s.op === 'foreach') {
      if (!s.gen.length) {
        fail('foreachEmpty')
        return out
      }
      let rows: Row[]
      if (st.kind === 'rows') {
        const aggs = s.gen.filter(g => g.agg)
        if (aggs.length) {
          fail('foreachAggUngrouped', { field: aggs[0]!.as })
          return out
        }
        rows = st.rows.map(r => Object.fromEntries([['__id', r.__id], ...s.gen.map(g => [g.as, r[g.field] ?? null])]) as Row)
      } else if (st.kind === 'groups') {
        const by = st.by
        const bad = s.gen.find(g => !g.agg && !by.includes(g.field))
        if (bad) {
          fail('foreachNotKey', { field: bad.field })
          return out
        }
        rows = st.groups.map((g, gi) => Object.fromEntries([['__id', `g${gi}`], ...s.gen.map(x => [x.as, x.agg ? reduce(g.rows, x.agg, x.field) : g.rows[0]?.[x.field] ?? null])]) as Row)
      } else {
        const cg = st
        const bad = s.gen.find(g => !g.agg && !((g.side === 'a' && g.field === cg.by) || (g.side === 'b' && g.field === cg.withBy)))
        if (bad) {
          fail('foreachNotKey', { field: `${bad.side ?? 'a'}.${bad.field}` })
          return out
        }
        rows = cg.groups.map((g, gi) => Object.fromEntries([['__id', `c${gi}`], ...s.gen.map((x) => {
          const side = x.side === 'b' ? g.b : g.a
          if (!x.agg) return [x.as, side[0]?.[x.field] ?? (x.side === 'b' ? null : g.key)]
          return [x.as, reduce(side, x.agg, x.field)]
        })]) as Row)
      }
      st = { kind: 'rows', rows }
      out.push({ line: i, code, explain: rowsIn && rows.length < rowsIn ? 'foreachCollapse' : 'foreach', params: { n: rows.length, cols: s.gen.length }, view: { kind: 'rows', rows, newCols: s.gen.map(g => g.as) }, rowsIn, rowsOut: rows.length })
      continue
    }

    if (s.op === 'order') {
      if (st.kind !== 'rows') {
        fail('orderGrouped')
        return out
      }
      const rows = [...st.rows].sort((x, y) => compare(x[s.field] ?? null, y[s.field] ?? null) * (s.dir === 'desc' ? -1 : 1))
      st = { kind: 'rows', rows }
      out.push({ line: i, code, explain: 'order', params: { field: s.field, dir: s.dir }, view: viewOf(st), rowsIn, rowsOut: rows.length })
      continue
    }

    if (s.op === 'limit') {
      if (st.kind !== 'rows') {
        fail('limitGrouped')
        return out
      }
      const marks: Record<string, Mark> = {}
      st.rows.forEach((r, j) => (marks[String(r.__id)] = j < s.n ? 'kept' : 'dropped'))
      const before: View = { kind: 'rows', rows: st.rows, marks }
      st = { kind: 'rows', rows: st.rows.slice(0, s.n) }
      out.push({ line: i, code, explain: 'limit', params: { n: s.n }, before, view: viewOf(st), rowsIn, rowsOut: st.rows.length })
    }
  }
  return out
}

/** Ready-made queries, each showing one idea. */
export const SAQL_PRESETS: { id: string, steps: SaqlStep[] }[] = [
  {
    id: 'pipelineByStage',
    steps: [
      { op: 'load', dataset: 'opportunities' },
      { op: 'group', by: ['StageName'] },
      { op: 'foreach', gen: [{ field: 'StageName', as: 'StageName' }, { field: 'Amount', agg: 'sum', as: 'sum_Amount' }, { field: 'Id', agg: 'count', as: 'count' }] },
      { op: 'order', field: 'sum_Amount', dir: 'desc' }
    ]
  },
  {
    id: 'filterThenGroup',
    steps: [
      { op: 'load', dataset: 'opportunities' },
      { op: 'filter', field: 'StageName', cmp: '==', value: 'Closed Won' },
      { op: 'group', by: ['OwnerId'] },
      { op: 'foreach', gen: [{ field: 'OwnerId', as: 'OwnerId' }, { field: 'Amount', agg: 'sum', as: 'won' }, { field: 'Amount', agg: 'avg', as: 'avg_deal' }] },
      { op: 'order', field: 'won', dir: 'desc' }
    ]
  },
  {
    id: 'having',
    steps: [
      { op: 'load', dataset: 'opportunities' },
      { op: 'group', by: ['AccountId'] },
      { op: 'foreach', gen: [{ field: 'AccountId', as: 'AccountId' }, { field: 'Id', agg: 'count', as: 'deals' }, { field: 'Amount', agg: 'sum', as: 'total' }] },
      { op: 'filter', field: 'deals', cmp: '>=', value: '2' },
      { op: 'order', field: 'total', dir: 'desc' }
    ]
  },
  {
    id: 'cogroupAccounts',
    steps: [
      { op: 'load', dataset: 'opportunities' },
      { op: 'cogroup', by: 'AccountId', with: 'accounts', withBy: 'Id', join: 'inner' },
      { op: 'foreach', gen: [{ field: 'AccountId', side: 'a', as: 'AccountId' }, { field: 'Name', side: 'b', agg: 'first', as: 'Account' }, { field: 'Region', side: 'b', agg: 'first', as: 'Region' }, { field: 'Amount', side: 'a', agg: 'sum', as: 'pipeline' }] },
      { op: 'order', field: 'pipeline', dir: 'desc' }
    ]
  },
  {
    id: 'cogroupLeft',
    steps: [
      { op: 'load', dataset: 'opportunities' },
      { op: 'cogroup', by: 'AccountId', with: 'accounts', withBy: 'Id', join: 'full' },
      { op: 'foreach', gen: [{ field: 'AccountId', side: 'a', as: 'Key' }, { field: 'Name', side: 'b', agg: 'first', as: 'Account' }, { field: 'Id', side: 'a', agg: 'count', as: 'deals' }] }
    ]
  },
  {
    id: 'topN',
    steps: [
      { op: 'load', dataset: 'opportunities' },
      { op: 'filter', field: 'Amount', cmp: 'is not null', value: '' },
      { op: 'order', field: 'Amount', dir: 'desc' },
      { op: 'limit', n: 3 },
      { op: 'foreach', gen: [{ field: 'Name', as: 'Name' }, { field: 'Amount', as: 'Amount' }] }
    ]
  },
  {
    id: 'mistake',
    steps: [
      { op: 'load', dataset: 'opportunities' },
      { op: 'group', by: ['StageName'] },
      { op: 'filter', field: 'Amount', cmp: '>', value: '10000' }
    ]
  }
]
