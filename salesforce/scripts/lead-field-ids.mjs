#!/usr/bin/env node
/**
 * Prints LEAD_FIELDS for server/utils/salesforce.ts: each Academy Lead
 * field's 15-character id, which is what Web-to-Lead posts by.
 *
 *   node scripts/lead-field-ids.mjs --target-org crma-learning
 *
 * ONE read query through the CLI (Tooling API, FieldDefinition) — no loop,
 * no login: it uses the CLI's stored auth.
 */
import { execFileSync } from 'node:child_process'

const at = process.argv.indexOf('--target-org')
const org = at > 0 ? ['--target-org', process.argv[at + 1]] : []
const MAP = {
  Academy_Interest__c: 'interest',
  Academy_Lessons_Done__c: 'lessons',
  Academy_Points__c: 'points',
  Traffic_Source__c: 'source',
  Landing_Page__c: 'landing',
  First_Landing_Page__c: 'firstLanding',
  Views_Before_Lead__c: 'viewsBefore',
  Academy_Locale__c: 'locale',
  Academy_User_Id__c: 'userId',
  Seats_Requested__c: 'seats',
  Org_Type__c: 'orgKind'
}
const q = `SELECT DeveloperName, DurableId FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Lead' AND QualifiedApiName LIKE '%__c'`
const out = JSON.parse(execFileSync('sf', ['data', 'query', '--use-tooling-api', '--json', '--query', q, ...org], { encoding: 'utf8' }))
const ids = {}
for (const r of out.result.records) {
  const key = MAP[`${r.DeveloperName}__c`]
  // DurableId is "Lead.00N…"; Web-to-Lead wants the 15-character id.
  if (key) ids[key] = String(r.DurableId).split('.').pop().slice(0, 15)
}
const missing = Object.values(MAP).filter(k => !ids[k])
console.log(`export const LEAD_FIELDS: Partial<Record<${Object.values(MAP).map(k => `'${k}'`).join(' | ')}, string>> = ${JSON.stringify(ids, null, 2).replace(/"(\w+)":/g, '$1:').replace(/"/g, '\'')}`)
if (missing.length) console.error(`Not deployed yet: ${missing.join(', ')}`)
