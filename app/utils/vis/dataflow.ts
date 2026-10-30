/**
 * A dataflow definition (the JSON Data Manager stores) and an interpreter for
 * the transformations a learner meets: sfdcDigest, edgemart, filter, augment
 * (LookupSingleValue / LookupMultiValue), computeExpression, computeRelative,
 * flatten, sliceDataset, append and sfdcRegister.
 *
 * The JSON's key order means nothing: a dataflow runs a node when every node
 * named in its `source` / `left` / `right` has run. The interpreter reports
 * the wave each node runs in (nodes in one wave have no dependency on each
 * other and can run in parallel) as well as a single serial order.
 */
import { type Row, type Value, DATASETS, compare, tag } from './data'

export type DfAction = 'sfdcDigest' | 'edgemart' | 'filter' | 'augment' | 'computeExpression' | 'computeRelative' | 'flatten' | 'sliceDataset' | 'append' | 'sfdcRegister'

export interface DfNode { action: DfAction, parameters: Record<string, unknown> }
export type Dataflow = Record<string, DfNode>

export interface DfOptions {
  filter: boolean
  augmentOperation: 'LookupSingleValue' | 'LookupMultiValue'
  augmentFrom: 'accounts' | 'opportunities'
  computeRelative: boolean
  flatten: boolean
  security: boolean
}

export const DEFAULT_DF_OPTIONS: DfOptions = { filter: true, augmentOperation: 'LookupSingleValue', augmentFrom: 'opportunities', computeRelative: true, flatten: true, security: true }

/** Builds the dataflow JSON for the chosen options. */
export function buildDataflow(o: DfOptions): Dataflow {
  const df: Dataflow = {
    Extract_Opportunity: { action: 'sfdcDigest', parameters: { object: 'Opportunity', fields: ['Id', 'Name', 'AccountId', 'StageName', 'Amount', 'CloseDate', 'OwnerId'].map(name => ({ name })) } },
    Extract_Account: { action: 'sfdcDigest', parameters: { object: 'Account', fields: ['Id', 'Name', 'Industry', 'Region', 'Segment'].map(name => ({ name })) } },
    Extract_User: { action: 'sfdcDigest', parameters: { object: 'User', fields: ['Id', 'Name', 'ManagerId', 'Team'].map(name => ({ name })) } }
  }
  let opps = 'Extract_Opportunity'
  if (o.filter) {
    df.Filter_Not_Lost = { action: 'filter', parameters: { source: opps, filter: 'StageName:N:Closed Lost' } }
    opps = 'Filter_Not_Lost'
  }
  let users = 'Extract_User'
  if (o.flatten) {
    df.Flatten_Managers = { action: 'flatten', parameters: { source: users, self_field: 'Id', parent_field: 'ManagerId', multi_field: 'Managers', path_field: 'ManagerPath', include_self_id: true } }
    users = 'Flatten_Managers'
  }
  // Grain decides which side is "left": augment keeps every left row once
  // (single value) and never adds rows.
  let main: string
  if (o.augmentFrom === 'opportunities') {
    df.Augment_Account = { action: 'augment', parameters: { left: opps, left_key: ['AccountId'], right: 'Extract_Account', right_key: ['Id'], right_select: ['Name', 'Region', 'Segment'], relationship: 'Account', operation: o.augmentOperation } }
    main = 'Augment_Account'
  } else {
    df.Augment_Opportunities = { action: 'augment', parameters: { left: 'Extract_Account', left_key: ['Id'], right: opps, right_key: ['AccountId'], right_select: ['Name', 'Amount', 'StageName'], relationship: 'Opps', operation: o.augmentOperation } }
    main = 'Augment_Opportunities'
  }
  if (o.augmentFrom === 'opportunities') {
    df.Augment_Owner = { action: 'augment', parameters: { left: main, left_key: ['OwnerId'], right: users, right_key: ['Id'], right_select: o.flatten ? ['Name', 'Managers', 'ManagerPath'] : ['Name'], relationship: 'Owner', operation: 'LookupSingleValue' } }
    main = 'Augment_Owner'
    df.Compute_Deal_Size = { action: 'computeExpression', parameters: { source: main, mergeWithSource: true, computedFields: [
      { name: 'DealSize', type: 'Text', saqlExpression: 'case when \'Amount\' >= 40000 then "Large" when \'Amount\' >= 15000 then "Medium" when \'Amount\' is null then "Unknown" else "Small" end' },
      { name: 'CloseMonth', type: 'Text', saqlExpression: 'substr(\'CloseDate\', 1, 7)' }
    ] } }
    main = 'Compute_Deal_Size'
    if (o.computeRelative) {
      df.Compute_Previous_Deal = { action: 'computeRelative', parameters: { source: main, partitionBy: ['AccountId'], orderBy: [{ name: 'CloseDate', direction: 'asc' }], computedFields: [
        { name: 'PreviousAmount', expression: { sourceField: 'Amount', offset: 'previous()', default: null } },
        { name: 'FirstCloseDate', expression: { sourceField: 'CloseDate', offset: 'first()', default: null } }
      ] } }
      main = 'Compute_Previous_Deal'
    }
    df.Drop_Owner_Id = { action: 'sliceDataset', parameters: { source: main, mode: 'drop', fields: [{ name: 'OwnerId' }] } }
    main = 'Drop_Owner_Id'
  }
  df.Register = { action: 'sfdcRegister', parameters: {
    source: main,
    alias: 'academy_opportunities',
    name: 'Academy Opportunities',
    ...(o.security && o.augmentFrom === 'opportunities' && o.flatten ? { rowLevelSecurityFilter: '\'Owner.Managers\' == "$User.Id"' } : {})
  } }
  return df
}

export const sourcesOf = (n: DfNode): string[] => {
  const p = n.parameters
  if (n.action === 'augment') return [String(p.left), String(p.right)]
  if (n.action === 'append') return (p.sources as string[]) ?? []
  return p.source ? [String(p.source)] : []
}

export interface DfResult {
  name: string
  action: DfAction
  order: number
  wave: number
  rows: Row[]
  before?: Row[]
  marks?: Record<string, 'kept' | 'dropped' | 'matched' | 'unmatched' | 'multi'>
  newCols?: string[]
  dropCols?: string[]
  explain: string
  params: Record<string, string | number>
  rowsIn: number
}

/** Waves of nodes whose sources have all run, then one serial order. */
export function dataflowPlan(df: Dataflow): { order: string[], wave: Record<string, number> } {
  const names = Object.keys(df)
  const wave: Record<string, number> = {}
  const order: string[] = []
  let w = 1
  while (order.length < names.length) {
    const ready = names.filter(n => !(n in wave) && sourcesOf(df[n]!).every(s => s in wave && wave[s]! < w))
    if (!ready.length) break
    for (const n of ready) {
      wave[n] = w
      order.push(n)
    }
    w++
  }
  return { order, wave }
}

const OBJECT_DATA: Record<string, string> = { Opportunity: 'opportunities', Account: 'accounts', User: 'users' }

export function runDataflow(df: Dataflow): DfResult[] {
  const { order, wave } = dataflowPlan(df)
  const out = new Map<string, DfResult>()
  for (const [k, name] of order.entries()) {
    const node = df[name]!
    const p = node.parameters
    const src = (ref: unknown) => out.get(String(ref))?.rows ?? []
    const base = { name, action: node.action, order: k + 1, wave: wave[name]! }

    if (node.action === 'sfdcDigest' || node.action === 'edgemart') {
      const ds = DATASETS[OBJECT_DATA[String(p.object)] ?? String(p.alias)]
      const fields = ((p.fields as { name: string }[]) ?? []).map(f => f.name)
      const rows = tag((ds?.rows ?? []).map(r => (fields.length ? Object.fromEntries(fields.map(f => [f, r[f] ?? null])) : { ...r })), `${name.slice(8, 9)}`)
      out.set(name, { ...base, rows, explain: node.action, params: { object: String(p.object ?? p.alias), n: rows.length, fields: fields.length }, rowsIn: 0 })
    } else if (node.action === 'filter') {
      const [field, op, value] = String(p.filter).split(':')
      const before = src(p.source)
      const marks: DfResult['marks'] = {}
      const rows = before.filter((r) => {
        const v = String(r[field!] ?? '')
        const ok = op === 'N' ? v !== value : v === value
        marks[String(r.__id)] = ok ? 'kept' : 'dropped'
        return ok
      })
      out.set(name, { ...base, rows, before, marks, explain: 'filter', params: { filter: String(p.filter), kept: rows.length, dropped: before.length - rows.length }, rowsIn: before.length })
    } else if (node.action === 'augment') {
      const L = src(p.left)
      const R = src(p.right)
      const lk = (p.left_key as string[])[0]!
      const rk = (p.right_key as string[])[0]!
      const sel = p.right_select as string[]
      const rel = String(p.relationship)
      const multi = p.operation === 'LookupMultiValue'
      const marks: DfResult['marks'] = {}
      const rows = L.map((l) => {
        const hits = R.filter(r => r[rk] !== null && r[rk] === l[lk])
        marks[String(l.__id)] = !hits.length ? 'unmatched' : hits.length > 1 ? 'multi' : 'matched'
        return {
          ...l,
          ...Object.fromEntries(sel.map(f => [`${rel}.${f}`, !hits.length
            ? null
            : multi
              ? hits.map(h => String(h[f] ?? 'null')).join(' ; ')
              // Single value with several matches: one wins, and which one is not defined.
              : hits[hits.length - 1]![f] ?? null]))
        }
      })
      const multiN = Object.values(marks).filter(m => m === 'multi').length
      out.set(name, { ...base, rows, marks, newCols: sel.map(f => `${rel}.${f}`), explain: multi ? 'augmentMulti' : multiN ? 'augmentSingleWarn' : 'augmentSingle', params: { left: L.length, right: R.length, unmatched: Object.values(marks).filter(m => m === 'unmatched').length, multi: multiN, key: `${lk} = ${rel}.${rk}` }, rowsIn: L.length })
    } else if (node.action === 'computeExpression') {
      const before = src(p.source)
      const fields = p.computedFields as { name: string }[]
      const rows = before.map((r) => {
        const amt = r.Amount as number | null
        return {
          ...r,
          DealSize: amt === null ? 'Unknown' : amt >= 40000 ? 'Large' : amt >= 15000 ? 'Medium' : 'Small',
          CloseMonth: r.CloseDate === null ? null : String(r.CloseDate).slice(0, 7)
        }
      })
      out.set(name, { ...base, rows, newCols: fields.map(f => f.name), explain: 'computeExpression', params: { n: fields.length }, rowsIn: before.length })
    } else if (node.action === 'computeRelative') {
      const before = src(p.source)
      const part = (p.partitionBy as string[])[0]!
      const ord = (p.orderBy as { name: string }[])[0]!.name
      const rows = before.map((r) => {
        const peers = before.filter(x => x[part] === r[part]).sort((a, b) => compare(a[ord] ?? null, b[ord] ?? null))
        const at = peers.findIndex(x => x.__id === r.__id)
        return { ...r, PreviousAmount: at > 0 ? peers[at - 1]!.Amount ?? null : null, FirstCloseDate: peers[0]?.[ord] ?? null }
      })
      out.set(name, { ...base, rows, newCols: ['PreviousAmount', 'FirstCloseDate'], explain: 'computeRelative', params: { partition: part, order: ord }, rowsIn: before.length })
    } else if (node.action === 'flatten') {
      const before = src(p.source)
      const self = String(p.self_field)
      const parent = String(p.parent_field)
      const rows = before.map((r) => {
        const chain: Value[] = p.include_self_id ? [r[self] ?? null] : []
        let cur = before.find(x => x[self] === r[parent])
        while (cur && chain.length < 20) {
          chain.push(cur[self] ?? null)
          cur = before.find(x => x[self] === cur![parent])
        }
        return { ...r, [String(p.multi_field)]: chain.join(' ; '), [String(p.path_field)]: chain.join('\\') }
      })
      out.set(name, { ...base, rows, newCols: [String(p.multi_field), String(p.path_field)], explain: 'flatten', params: { n: rows.length }, rowsIn: before.length })
    } else if (node.action === 'sliceDataset') {
      const before = src(p.source)
      const drop = (p.fields as { name: string }[]).map(f => f.name)
      const rows = before.map(r => Object.fromEntries(Object.entries(r).filter(([k]) => !drop.includes(k))))
      out.set(name, { ...base, rows, dropCols: drop, explain: 'sliceDataset', params: { fields: drop.join(', ') }, rowsIn: before.length })
    } else if (node.action === 'append') {
      const rows = ((p.sources as string[]) ?? []).flatMap(s => src(s))
      out.set(name, { ...base, rows, explain: 'append', params: { n: rows.length }, rowsIn: rows.length })
    } else if (node.action === 'sfdcRegister') {
      const rows = src(p.source)
      out.set(name, { ...base, rows, explain: p.rowLevelSecurityFilter ? 'registerSecure' : 'register', params: { alias: String(p.alias), n: rows.length, predicate: String(p.rowLevelSecurityFilter ?? '') }, rowsIn: rows.length })
    }
  }
  return order.map(n => out.get(n)!)
}
