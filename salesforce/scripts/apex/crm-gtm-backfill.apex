// Gives existing records their GTM fields — Lifecycle stage, Motion, MRR —
// from what is already on them. Safe to re-run. One anonymous Apex run.
//
//   sf apex run --file scripts/apex/crm-gtm-backfill.apex --target-org crma-learning
//
// Leads: a seats / consulting / set-up request is sales-led, the rest
// self-serve; Working → SQL, a score of 30+ → MQL, else Lead.
// Accounts: seats sold → Customer (sales-led), MRR = seats × 15; an open deal →
// Opportunity. Contacts follow their account.

Database.DMLOptions o = new Database.DMLOptions();
o.DuplicateRuleHeader.allowSave = true;
o.OptAllOrNone = false;

List<Lead> leads = [SELECT Id, Status, Lead_Score__c, Academy_Interest__c, Lifecycle_Stage__c, Motion__c FROM Lead WHERE IsConverted = false];
for (Lead l : leads) {
    Boolean sales = l.Academy_Interest__c == 'seats' || l.Academy_Interest__c == 'consulting' || l.Academy_Interest__c == 'salesforce-setup';
    if (l.Motion__c == null) l.Motion__c = sales ? 'sales-led' : 'self-serve';
    if (l.Lifecycle_Stage__c == null) {
        l.Lifecycle_Stage__c = l.Status != null && l.Status.startsWith('Working') ? 'sql' : (l.Lead_Score__c != null && l.Lead_Score__c >= 30 ? 'mql' : 'lead');
    }
}
Database.update(leads, o);

Set<Id> openDeal = new Set<Id>();
for (Opportunity op : [SELECT AccountId FROM Opportunity WHERE IsClosed = false AND AccountId != null]) openDeal.add(op.AccountId);
List<Account> accounts = [SELECT Id, Seats_Purchased__c, MRR__c, Lifecycle_Stage__c, Motion__c, Customer_Since__c, CreatedDate FROM Account];
Map<Id, String> stageOf = new Map<Id, String>();
for (Account a : accounts) {
    if (a.Seats_Purchased__c != null && a.Seats_Purchased__c > 0) {
        a.Lifecycle_Stage__c = 'customer';
        if (a.Motion__c == null) a.Motion__c = 'sales-led';
        if (a.MRR__c == null) a.MRR__c = a.Seats_Purchased__c * 15;
        if (a.Customer_Since__c == null) a.Customer_Since__c = a.CreatedDate.date();
    } else if (openDeal.contains(a.Id) && a.Lifecycle_Stage__c == null) {
        a.Lifecycle_Stage__c = 'opportunity';
        if (a.Motion__c == null) a.Motion__c = 'sales-led';
    }
    if (a.Lifecycle_Stage__c != null) stageOf.put(a.Id, a.Lifecycle_Stage__c);
}
Database.update(accounts, o);

List<Contact> people = [SELECT Id, AccountId, Lifecycle_Stage__c, Motion__c FROM Contact WHERE AccountId IN :stageOf.keySet()];
for (Contact c : people) {
    if (c.Lifecycle_Stage__c == null) c.Lifecycle_Stage__c = stageOf.get(c.AccountId);
    if (c.Motion__c == null) c.Motion__c = 'sales-led';
}
Database.update(people, o);
System.debug('GTM backfill: ' + leads.size() + ' leads, ' + stageOf.size() + ' accounts, ' + people.size() + ' contacts.');
