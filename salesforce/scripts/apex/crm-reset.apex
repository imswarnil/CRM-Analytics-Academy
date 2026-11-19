// ⚠️ DELETES THE ORG'S CRM RECORDS so only Academy data is left.
// Run ONLY after a backup (`sf data export bulk` or Setup → Data Export) and
// only when Swarnil asks. It touches records, never metadata, users, CRM
// Analytics datasets or apps.
//
// Removes, in an order the platform accepts: Tasks, Events, Cases, Campaigns,
// Opportunities, Contacts, Leads (unconverted), Accounts, and every non-Academy
// product (deactivated if a deal still uses it). Up to 2,000 rows per object
// per run — the anonymous-Apex row limit — so re-run until it prints "0 left".
//
//   sf apex run --file scripts/apex/crm-reset.apex --target-org crma-learning

Integer cap = 2000;
Map<String, Integer> gone = new Map<String, Integer>();
Map<String, Integer> failed = new Map<String, Integer>();
void drop(String label, List<SObject> rows, Map<String, Integer> gone, Map<String, Integer> failed) {
    if (rows.isEmpty()) return;
    Integer ok = 0, bad = 0;
    for (Database.DeleteResult r : Database.delete(rows, false)) {
        if (r.isSuccess()) ok++; else bad++;
    }
    gone.put(label, ok);
    if (bad > 0) failed.put(label, bad);
}

drop('Task', [SELECT Id FROM Task LIMIT :cap], gone, failed);
drop('Event', [SELECT Id FROM Event LIMIT :cap], gone, failed);
drop('Case', [SELECT Id FROM Case LIMIT :cap], gone, failed);
drop('Campaign', [SELECT Id FROM Campaign LIMIT :cap], gone, failed);
drop('Opportunity', [SELECT Id FROM Opportunity LIMIT :cap], gone, failed);
drop('Contact', [SELECT Id FROM Contact LIMIT :cap], gone, failed);
drop('Lead', [SELECT Id FROM Lead WHERE IsConverted = false LIMIT :cap], gone, failed);
drop('Account', [SELECT Id FROM Account LIMIT :cap], gone, failed);

List<Product2> others = [SELECT Id, IsActive FROM Product2 WHERE (NOT ProductCode LIKE 'ACAD-%') LIMIT :cap];
drop('Product2', others, gone, failed);
List<Product2> stuck = [SELECT Id FROM Product2 WHERE (NOT ProductCode LIKE 'ACAD-%') AND IsActive = true LIMIT :cap];
for (Product2 p : stuck) p.IsActive = false;
update stuck;

Integer left = [SELECT COUNT() FROM Account] + [SELECT COUNT() FROM Contact] + [SELECT COUNT() FROM Opportunity]
    + [SELECT COUNT() FROM Lead WHERE IsConverted = false] + [SELECT COUNT() FROM Case] + [SELECT COUNT() FROM Campaign];
System.debug('Deleted: ' + gone);
if (!failed.isEmpty()) System.debug('Could not delete (in use or locked): ' + failed);
System.debug(left + ' left');
