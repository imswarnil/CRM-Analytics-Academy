#!/usr/bin/env node
/**
 * Adds an "Academy" section to the org's existing Lead, Account, Contact and
 * Opportunity page layouts — without replacing anything already on them.
 *
 *   sf project retrieve start --target-org crma-learning --output-dir .crm-layouts \
 *     --metadata "Layout:Lead-Lead Layout" "Layout:Account-Account Layout" \
 *                "Layout:Contact-Contact Layout" "Layout:Opportunity-Opportunity Layout"
 *   node scripts/crm-layouts.mjs .crm-layouts
 *   sf project deploy start --target-org crma-learning --source-dir crm/main/default/layouts
 *
 * Reads the retrieved layouts, inserts the section before "System Information"
 * (or at the end), and writes them into crm/main/default/layouts/ beside the
 * Seat Assignment layout. Re-running is safe: a layout that already has an
 * "Academy" section is left as it is.
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs'
import path from 'node:path'

const FIELDS = {
  Lead: [['Academy_Interest__c', 'Lead_Score__c', 'Lead_Grade__c', 'Seats_Requested__c', 'Org_Type__c', 'Academy_Lessons_Done__c'],
    ['Traffic_Source__c', 'First_Landing_Page__c', 'Landing_Page__c', 'Views_Before_Lead__c', 'Academy_Locale__c', 'Academy_User_Id__c', 'Academy_Points__c']],
  Account: [['Org_Type__c', 'Academy_Plan__c', 'Join_Code__c'], ['Seats_Purchased__c', 'Seats_Used__c', 'Active_Seats__c', 'Seat_Term_End__c']],
  Contact: [['Academy_User_Id__c', 'Is_Pro__c'], ['Academy_Points__c']],
  Opportunity: [['Seats__c', 'Paid_In__c'], ['Points_Amount__c']]
}
const READONLY = new Set(['Lead_Score__c', 'Lead_Grade__c', 'Active_Seats__c'])

const src = process.argv[2]
if (!src) {
  console.error('Usage: node scripts/crm-layouts.mjs <retrieved-dir>')
  process.exit(1)
}
const walk = d => readdirSync(d).flatMap(f => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]))
const out = path.join(path.dirname(new URL(import.meta.url).pathname), '../crm/main/default/layouts')

for (const file of walk(src).filter(f => f.endsWith('.layout-meta.xml'))) {
  const name = path.basename(file)
  const object = name.split('-')[0]
  const cols = FIELDS[object]
  if (!cols) continue
  let xml = readFileSync(file, 'utf8')
  if (xml.includes('<label>Academy</label>')) {
    console.log(`${name}: already has an Academy section`)
  } else {
    const column = fields => `        <layoutColumns>\n${fields.map(f => `            <layoutItems>\n                <behavior>${READONLY.has(f) ? 'Readonly' : 'Edit'}</behavior>\n                <field>${f}</field>\n            </layoutItems>`).join('\n')}\n        </layoutColumns>`
    const section = `    <layoutSections>\n        <customLabel>true</customLabel>\n        <detailHeading>true</detailHeading>\n        <editHeading>true</editHeading>\n        <label>Academy</label>\n${cols.map(column).join('\n')}\n        <style>TwoColumnsTopToBottom</style>\n    </layoutSections>\n`
    const sys = xml.search(/ {4}<layoutSections>\s*<customLabel>\w+<\/customLabel>\s*<detailHeading>\w+<\/detailHeading>\s*<editHeading>\w+<\/editHeading>\s*<label>System Information<\/label>/)
    const at = sys > 0 ? sys : xml.lastIndexOf('    </layoutSections>') + '    </layoutSections>\n'.length
    xml = xml.slice(0, at) + section + xml.slice(at)
    console.log(`${name}: Academy section added`)
  }
  writeFileSync(path.join(out, name), xml)
}
